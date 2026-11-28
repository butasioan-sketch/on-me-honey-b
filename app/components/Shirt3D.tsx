"use client";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Bounds,
  useGLTF,
  Decal,
  useTexture,
  Html,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getDecalDimensions, getDecalPosition } from "@/lib/print-position";
import { getViewerAspect } from "@/lib/print-spec";
import {
  getAtelierModelPath,
  getProductByShopId,
} from "@/lib/catalog/families";

interface PrintData {
  id?: string;
  src: string;
  x: number;
  y: number;
  scale: number;
}
interface Shirt3DProps {
  frontPrint?: PrintData[];
  backPrint?: PrintData[];
  shirtColor?: string;
  enableTouch?: boolean;
  productId?: string;
  /** Direktes GLB (z. B. /models/sku/051-v1.glb) statt Auflösung über die Shop-ID. */
  modelPath?: string;
  /** Welche Seite zur Kamera zeigt, solange nicht automatisch gedreht wird. */
  facing?: "front" | "back";
  autoRotate?: boolean;
}

// The original shop meshes use the legacy tint. Calibrated SKU models carry their own materials.
function makeWhiteMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.55, // Optimized for best reflections while maintaining fabric feel
    metalness: 0,
    side: THREE.DoubleSide,
    envMapIntensity: 0.6, // Subtle environment reflections
  });
}

function CustomerPrint({
  mesh,
  print,
  front,
  productId,
  layerIndex = 0,
}: {
  mesh: THREE.Mesh;
  print: PrintData;
  front: boolean;
  productId: string;
  layerIndex?: number;
}) {
  const tex = useTexture(print.src);

  useEffect(() => {
    if (tex) {
      // eslint-disable-next-line react-hooks/immutability
      tex.anisotropy = 8;
    }
  }, [tex]);

  const { pos, size } = useMemo(() => {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox as THREE.Box3;
    const c = new THREE.Vector3();
    bb.getCenter(c);
    const s = new THREE.Vector3();
    bb.getSize(s);
    const side = front ? "front" : "back";
    const transform = { scale: print.scale || 1, x: print.x, y: print.y };
    const { w, h } = getDecalDimensions(
      { x: s.x, y: s.y, z: s.z },
      side,
      transform,
      productId,
    );
    const position = getDecalPosition(
      { x: c.x, y: c.y, z: c.z },
      { x: s.x, y: s.y, z: s.z },
      side,
      transform,
      front,
      productId,
    );
    position[2] += (front ? 1 : -1) * layerIndex * 0.0015;
    return {
      pos: position,
      // Nur die zugewandte Hälfte treffen: sonst schlägt das Motiv auf die Gegenseite durch
      size: [w, h, Math.max(s.z * 0.55, 0.004)] as [number, number, number],
    };
  }, [mesh, print.x, print.y, print.scale, front, productId, layerIndex]);

  return (
    <Decal position={pos} rotation={[0, front ? 0 : Math.PI, 0]} scale={size}>
      <meshStandardMaterial
        map={tex}
        transparent
        polygonOffset
        polygonOffsetFactor={-2 - layerIndex}
        depthWrite={false}
        roughness={0.6}
        toneMapped={false}
      />
    </Decal>
  );
}

function GarmentModel({
  modelPath,
  productId,
  frontPrint,
  backPrint,
  shirtColor = "#ffffff",
  preserveMaterials,
}: Shirt3DProps & {
  modelPath: string;
  productId: string;
  preserveMaterials: boolean;
}) {
  const { scene: source } = useGLTF(modelPath, "/draco/gltf/");
  const scene = useMemo(() => source.clone(true), [source]);
  const [decalMesh, setDecalMesh] = useState<THREE.Mesh | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let bestMesh: THREE.Mesh | null = null;
    let bestCount = 0;
    const matTemplate = preserveMaterials
      ? null
      : makeWhiteMaterial(shirtColor);

    scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const m = o as THREE.Mesh;
      if (!m.geometry) return;

      if (
        !m.geometry.attributes.normal ||
        m.geometry.attributes.normal.count === 0
      ) {
        m.geometry.computeVertexNormals();
      }

      if (matTemplate) m.material = matTemplate;
      m.castShadow = true;
      m.receiveShadow = true;

      // Motiv auf die Druckfläche legen, nicht auf das größte Teil: bei Hartware ist das
      // oft Kante oder Metall (z. B. 064 MDF-Kante, 066 Metallrahmen). Materialien mit
      // „Druckfläche“ im Namen haben Vorrang, sonst gewinnt das Teil mit den meisten Punkten.
      const matName = Array.isArray(m.material)
        ? m.material.map((x) => x.name).join(" ")
        : ((m.material as THREE.Material | undefined)?.name ?? "");
      const bonus = /druckfl/i.test(matName) ? 1e9 : 0;
      const count = (m.geometry.attributes.position?.count ?? 0) + bonus;
      if (count > bestCount) {
        bestMesh = m;
        bestCount = count;
      }
    });

    if (bestMesh) {
      const b = bestMesh as THREE.Mesh;
      b.geometry.computeBoundingBox();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecalMesh(b);
    }
    return () => matTemplate?.dispose();
  }, [scene, shirtColor, productId, preserveMaterials]);

  return (
    <group>
      <primitive object={scene} />
      {decalMesh &&
        visible &&
        createPortal(
          <>
            {(frontPrint || []).map((p, i) => (
              <CustomerPrint
                key={p.id ?? `front-${i}`}
                mesh={decalMesh}
                print={p}
                front
                productId={productId}
                layerIndex={i}
              />
            ))}
            {(backPrint || []).map((p, i) => (
              <CustomerPrint
                key={p.id ?? `back-${i}`}
                mesh={decalMesh}
                print={p}
                front={false}
                productId={productId}
                layerIndex={i}
              />
            ))}
          </>,
          decalMesh,
        )}
    </group>
  );
}

function ModelLoadingSkeleton({ productId }: { productId: string }) {
  return (
    <Html fullscreen>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "55%",
            aspectRatio: getViewerAspect(productId),
            borderRadius: "16px",
            background: "rgba(255,255,255,0.06)",
            animation: "plt-glb-pulse 1.3s ease-in-out infinite",
          }}
        />
      </div>
    </Html>
  );
}

/**
 * Framing (Jonny 23.07.2026): beide Meshes jetzt über make-shop-glb
 * unit-scale + Origin-zentriert (siehe scripts/make-shop-glb.sh) — Tee und
 * Shorts teilen sich deshalb dieselbe Kamera statt Sonderwegen pro Produkt.
 */
function getCamera(productId: string) {
  if (productId === "2") {
    // Shorts - weiter weg, größerer Zoom-Range
    return {
      cameraPos: [0, 0.05, 1.9] as [number, number, number],
      orbitTarget: [0, 0, 0] as [number, number, number],
      minDistance: 0.7,
      maxDistance: 4.5,
      fov: 38,
    };
  }
  // Default: T-Shirt - näher, engerer Frame
  return {
    cameraPos: [0, 0.05, 1.7] as [number, number, number],
    orbitTarget: [0, 0, 0] as [number, number, number],
    minDistance: 0.5,
    maxDistance: 4.0,
    fov: 40,
  };
}

/** Software-Rendering (kein GPU, z. B. SwiftShader/llvmpipe): dort kostet die Umgebung Sekunden. */
function isSoftwareRenderer(gl: THREE.WebGLRenderer): boolean {
  try {
    const ctx = gl.getContext();
    const ext = ctx.getExtension("WEBGL_debug_renderer_info");
    const name = String(
      ext
        ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : ctx.getParameter(ctx.RENDERER),
    );
    return /swiftshader|llvmpipe|software|softpipe/i.test(name);
  } catch {
    return false;
  }
}

/**
 * Studio-Umgebung für realistische Reflexionen (prozedural, keine externe HDR-Datei → CSP-konform).
 * Wird erst im Leerlauf nach dem ersten Bild erzeugt (blockiert sonst beim Laden den Hauptthread)
 * und auf Software-Renderern ausgelassen. onReady schaltet das Umgebungslicht passend um.
 */
function StudioEnvironment({ onReady }: { onReady: (ready: boolean) => void }) {
  const gl = useThree((st) => st.gl);
  const get = useThree((st) => st.get);
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    if (isSoftwareRenderer(gl)) return;
    let env: THREE.Texture | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    const scene = get().scene; // three.js-Szene ist ein veränderliches Objekt, kein React-State
    const build = () => {
      pmrem = new THREE.PMREMGenerator(gl);
      env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.85;
      onReady(true);
      invalidate();
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(build, { timeout: 2500 })
      : window.setTimeout(build, 800);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
      if (env) {
        scene.environment = null;
        env.dispose();
      }
      pmrem?.dispose();
      onReady(false);
    };
  }, [gl, get, invalidate, onReady]);
  return null;
}

/**
 * Dreht das MODELL (nicht die Kamera): beim 360°-Drehen kontinuierlich, sonst exakt
 * Vorder- bzw. Rückseite zur Kamera. Bei jedem Seitenwechsel wird auch die Kamera
 * auf die Frontalansicht zurückgesetzt, damit „Vorderseite/Rückseite" immer stimmt.
 */
function SideGroup({
  facing,
  spinning,
  children,
}: {
  facing: "front" | "back";
  spinning: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const controls = useThree((st) => st.controls) as unknown as {
    setAzimuthalAngle?: (a: number) => void;
    setPolarAngle?: (a: number) => void;
    update?: () => void;
  } | null;
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    if (spinning || !ref.current) return;
    ref.current.rotation.y = facing === "back" ? Math.PI : 0;
    controls?.setAzimuthalAngle?.(0);
    controls?.setPolarAngle?.(Math.PI / 2 - 0.05);
    controls?.update?.();
    invalidate();
  }, [facing, spinning, controls, invalidate]);
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 0.9;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Shirt3D({
  enableTouch = true,
  modelPath: modelOverride,
  facing = "front",
  autoRotate = true,
  ...props
}: Shirt3DProps) {
  const requestedId = props.productId;
  const record =
    requestedId && !modelOverride ? getProductByShopId(requestedId) : null;
  const modelPath =
    modelOverride ?? (record ? getAtelierModelPath(record) : null);
  const preserveMaterials = !!modelOverride || !!record?.atelierModel;
  // setEnvReady ist stabil (useState) → StudioEnvironment-Effekt läuft nicht bei jedem Render neu
  const [envReady, setEnvReady] = useState(false);
  // Ohne GPU (Software-Rendering, schwache Geräte) kostet jedes Bild mit Schattenkarte +
  // Kontaktschatten über 1 s Hauptthread (Lighthouse 24.11.: TBT 11 s mobil). Dort ohne Schatten.
  const [lowPower, setLowPower] = useState(false);

  if (!requestedId || !modelPath) {
    return (
      <p
        role="status"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#a0a0a0",
        }}
      >
        3D-Modell nicht verfügbar
      </p>
    );
  }

  const productId = requestedId;
  const cam = getCamera(productId);

  return (
    <Canvas
      shadows={!lowPower}
      camera={{ position: cam.cameraPos, fov: cam.fov }}
      dpr={lowPower ? 1 : [1, 1.5]}
      onCreated={({ gl }) => setLowPower(isSoftwareRenderer(gl))}
      frameloop={autoRotate ? "always" : "demand"}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <Suspense fallback={<ModelLoadingSkeleton productId={productId} />}>
        <StudioEnvironment onReady={setEnvReady} />
        {/* Mit Studio-Umgebung genügt wenig Grundlicht; ohne (Software-Rendering) wie bisher heller */}
        <ambientLight intensity={envReady ? 0.25 : 0.75} />
        <directionalLight
          position={[2.5, 4, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={15}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-2.5, 2, -2]} intensity={0.5} />
        <directionalLight position={[0, 1, 4]} intensity={0.4} />

        {preserveMaterials ? (
          <Bounds fit clip margin={1.2}>
            <SideGroup facing={facing} spinning={autoRotate}>
              <GarmentModel
                {...props}
                modelPath={modelPath}
                productId={productId}
                preserveMaterials
              />
            </SideGroup>
          </Bounds>
        ) : (
          // Auch die Shop-Modelle automatisch einpassen (vorher feste Kamera: Tee im
          // quadratischen Viewer unten abgeschnitten).
          <Bounds fit clip margin={1.15}>
            <SideGroup facing={facing} spinning={autoRotate}>
              <GarmentModel
                {...props}
                modelPath={modelPath}
                productId={productId}
                preserveMaterials={false}
              />
            </SideGroup>
          </Bounds>
        )}

        {/* Weiche Kontaktschatten (rendern die Szene pro Bild erneut) – nur mit GPU */}
        {!lowPower && (
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.3}
            scale={3}
            blur={2}
            far={2}
          />
        )}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={cam.minDistance}
          maxDistance={cam.maxDistance}
          autoRotate={false}
          target={cam.orbitTarget}
          enableRotate={enableTouch}
          enableZoom={enableTouch}
          enableDamping={!lowPower}
          dampingFactor={0.05}
        />
      </Suspense>
    </Canvas>
  );
}

// Kein Vorladen aller Modelle beim Import: jede Seite lädt nur ihr eigenes GLB.
