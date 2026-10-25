"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, createPortal } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Decal,
  useTexture,
  Html,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import ShirtFlip from "./ShirtFlip";
import StaticShirtPreview from "./StaticShirtPreview";
import { getDecalDimensions, getDecalPosition } from "@/lib/print-position";
import { getViewerAspect } from "@/lib/print-spec";
import { getFamilyByShopId, getLiveFamilies } from "@/lib/catalog/families";

interface PrintData {
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
  fallback?: "static" | "flip";
  frontSrc?: string;
  backSrc?: string;
  productId?: string;
}

/**
 * GLEICHE Architektur für Tee und Shorts (Jonny 22.07.2026 — Schluss mit Sonderwegen):
 * - weißes Blank-Mesh
 * - ALLE Sub-Meshes weiß (nie nur das größte)
 * - Kundenmotiv = Decal
 * - gleiches Licht, gleiche Material-Parameter
 * - productId steuert nur Modellpfad + Kamera-Framing
 *
 * WAVE 4.1: MODEL_PATHS replaced by families.ts
 */
function getModelPath(productId?: string): string | null {
  if (!productId) return null;
  const family = getFamilyByShopId(productId);
  return family?.glbPath ?? null;
}

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
      size: [w, h, Math.max(s.z * 1.5, 0.1)] as [number, number, number],
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
}: Shirt3DProps & { modelPath: string; productId: string }) {
  const { scene } = useGLTF(modelPath, "/draco/gltf/");
  const [decalMesh, setDecalMesh] = useState<THREE.Mesh | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    let bestMesh: THREE.Mesh | null = null;
    let bestCount = 0;
    const matTemplate = makeWhiteMaterial(shirtColor);

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

      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => {
          if (mat && "dispose" in mat) (mat as THREE.Material).dispose();
        });
      } else if (m.material && "dispose" in m.material) {
        (m.material as THREE.Material).dispose();
      }
      m.material = matTemplate.clone();
      m.castShadow = true;
      m.receiveShadow = true;

      const count = m.geometry.attributes.position?.count ?? 0;
      if (count > bestCount) {
        bestMesh = m;
        bestCount = count;
      }
    });

    if (bestMesh) {
      const b = bestMesh as THREE.Mesh;
      b.geometry.computeBoundingBox();
      console.log(
        "[Shirt3D] product",
        productId,
        "verts",
        bestCount,
        "bbox",
        JSON.stringify(b.geometry.boundingBox),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecalMesh(b);
    }
  }, [scene, shirtColor, productId]);

  return (
    <group scale={visible ? 1 : 0.8} position={[0, visible ? 0 : -0.3, 0]}>
      <primitive object={scene} />
      {decalMesh &&
        visible &&
        createPortal(
          <>
            {(frontPrint || []).map((p, i) => (
              <CustomerPrint
                key={`front-${i}`}
                mesh={decalMesh}
                print={p}
                front
                productId={productId}
                layerIndex={i}
              />
            ))}
            {(backPrint || []).map((p, i) => (
              <CustomerPrint
                key={`back-${i}`}
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

export default function Shirt3D({
  enableTouch = true,
  fallback = "flip",
  ...props
}: Shirt3DProps) {
  const requestedId = props.productId;
  const modelPath = getModelPath(requestedId);

  if (!requestedId || !modelPath) {
    if (fallback === "static") {
      return <StaticShirtPreview shadow="0 12px 32px rgba(0,0,0,0.55)" />;
    }
    return (
      <ShirtFlip
        frontPrint={props.frontPrint}
        backPrint={props.backPrint}
        productId={props.productId}
        {...(props.frontSrc ? { frontSrc: props.frontSrc } : {})}
        {...(props.backSrc ? { backSrc: props.backSrc } : {})}
        showControls={false}
        showHint={false}
      />
    );
  }

  const productId = requestedId;
  const cam = getCamera(productId);

  return (
    <Canvas
      shadows
      camera={{ position: cam.cameraPos, fov: cam.fov }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <Suspense fallback={<ModelLoadingSkeleton productId={productId} />}>
        {/* Professional lighting with shadows + environment - 10/10 quality */}
        <ambientLight intensity={0.75} />
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

        <GarmentModel {...props} modelPath={modelPath} productId={productId} />

        {/* Soft contact shadows - realistic ground contact */}
        <ContactShadows
          position={[0, -0.85, 0]}
          opacity={0.3}
          scale={3}
          blur={2}
          far={2}
        />
        <OrbitControls
          enablePan={false}
          minDistance={cam.minDistance}
          maxDistance={cam.maxDistance}
          autoRotate={true}
          autoRotateSpeed={1.5}
          target={cam.orbitTarget}
          enableRotate={enableTouch}
          enableZoom={enableTouch}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Suspense>
    </Canvas>
  );
}

// WAVE 4.1: Preload only shop_live families
getLiveFamilies().forEach((family) => {
  if (family.glbPath) {
    useGLTF.preload(family.glbPath);
  }
});
