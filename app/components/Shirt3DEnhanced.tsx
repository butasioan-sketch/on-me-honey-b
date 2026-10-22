'use client';
/**
 * ON ME HONEY B — Enhanced 3D Viewer mit Multi-Zone Support
 *
 * Erweitert den Standard Shirt3D.tsx um:
 * - Interaktive Druckzonen-Auswahl
 * - Produkt-spezifische Zonen (T-Shirt: Front/Back, Shorts: Front/Back/Seiten)
 * - Zone-Highlighting beim Hover
 * - Speicherung aller Zonen in Datenbank
 */

import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import {
  getPrintZonesForProduct,
  getPrintZone,
  type PrintZone,
  type PrintZoneId,
  type ZoneDesign
} from '@/lib/print-zones';

interface ZonePrintData {
  zoneId: PrintZoneId;
  src: string;
  x: number;
  y: number;
  scale: number;
}

interface Shirt3DEnhancedProps {
  productId: string;
  zonePrints?: ZonePrintData[];
  shirtColor?: string;
  enableZoneSelection?: boolean;
  onZoneSelect?: (zoneId: PrintZoneId) => void;
  selectedZone?: PrintZoneId | null;
  enableTouch?: boolean;
}

const MODEL_PATHS: Record<string, string> = {
  '1': '/models/shirt-white-v2.glb',
  '2': '/models/shorts-white-v1.glb',
  '3': '/models/sport-shirt-pa4012.glb',
  '4': '/models/basketball-shorts-pa1050.glb',
  '5': '/models/pillow-cover-40x40.glb',
};

function makeWhiteMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.62,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

/**
 * Zone-Highlight Overlay
 * Zeigt einen halbtransparenten Bereich über der Zone beim Hover
 */
function ZoneHighlight({
  mesh,
  zone,
  isSelected,
  onSelect
}: {
  mesh: THREE.Mesh;
  zone: PrintZone;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const { pos, size, rotation } = useMemo(() => {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox as THREE.Box3;
    const meshSize = new THREE.Vector3();
    bb.getSize(meshSize);

    // Position basierend auf Zone-Konfiguration
    const position = new THREE.Vector3(
      zone.position3D.centerX * meshSize.x * 0.5,
      zone.position3D.centerY * meshSize.y * 0.5,
      zone.position3D.centerZ * meshSize.z
    );

    // Größe der Highlight-Zone (etwas größer als maximaler Druckbereich)
    const width = (zone.maxArea.widthMm / 210) * meshSize.x * 0.4;
    const height = (zone.maxArea.heightMm / 297) * meshSize.y * 0.4;

    return {
      pos: position.toArray() as [number, number, number],
      size: [width, height, meshSize.z * 0.5] as [number, number, number],
      rotation: zone.position3D.rotation as [number, number, number],
    };
  }, [mesh, zone]);

  // Farbe basierend auf Status
  const color = isSelected
    ? new THREE.Color(0x4CAF50) // Grün wenn ausgewählt
    : hovered
      ? new THREE.Color(0x2196F3) // Blau beim Hover
      : new THREE.Color(0xFFFFFF); // Weiß sonst

  const opacity = isSelected ? 0.3 : hovered ? 0.2 : 0.1;

  return (
    <mesh
      position={pos}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        wireframe={hovered || isSelected}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Zone-basierter Decal-Print
 * Wendet Customer-Design auf eine spezifische Zone an
 */
function ZoneDecal({
  mesh,
  zonePrint,
  zone,
}: {
  mesh: THREE.Mesh;
  zonePrint: ZonePrintData;
  zone: PrintZone;
}) {
  const tex = useTexture(zonePrint.src);
  tex.anisotropy = 8;

  const { pos, size } = useMemo(() => {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox as THREE.Box3;
    const meshSize = new THREE.Vector3();
    bb.getSize(meshSize);

    // Basis-Position der Zone
    const basePos = new THREE.Vector3(
      zone.position3D.centerX * meshSize.x * 0.5,
      zone.position3D.centerY * meshSize.y * 0.5,
      zone.position3D.centerZ * meshSize.z
    );

    // Offset basierend auf Transform (x, y from zonePrint)
    const offsetX = (zonePrint.x / 100) * (zone.maxArea.widthMm / 210) * meshSize.x * 0.4;
    const offsetY = (zonePrint.y / 100) * (zone.maxArea.heightMm / 297) * meshSize.y * 0.4;

    basePos.x += offsetX;
    basePos.y += offsetY;

    // Größe basierend auf Scale
    const baseWidth = (zone.maxArea.widthMm / 210) * meshSize.x * 0.3;
    const baseHeight = (zone.maxArea.heightMm / 297) * meshSize.y * 0.3;
    const scaledWidth = baseWidth * zonePrint.scale;
    const scaledHeight = baseHeight * zonePrint.scale;

    return {
      pos: basePos.toArray() as [number, number, number],
      size: [scaledWidth, scaledHeight, meshSize.z * 1.0] as [number, number, number],
    };
  }, [mesh, zonePrint, zone]);

  return (
    <Decal
      position={pos}
      rotation={zone.position3D.rotation}
      scale={size}
    >
      <meshStandardMaterial
        map={tex}
        transparent
        polygonOffset
        polygonOffsetFactor={-2}
        depthWrite={false}
        roughness={0.6}
        toneMapped={false}
      />
    </Decal>
  );
}

/**
 * Enhanced Garment Model mit Multi-Zone Support
 */
function EnhancedGarmentModel({
  productId,
  zonePrints = [],
  shirtColor = '#ffffff',
  enableZoneSelection = false,
  selectedZone,
  onZoneSelect,
}: Shirt3DEnhancedProps & { modelPath: string }) {
  const modelPath = MODEL_PATHS[productId] || MODEL_PATHS['1'];
  const { scene } = useGLTF(modelPath);
  const [decalMesh, setDecalMesh] = useState<THREE.Mesh | null>(null);
  const availableZones = getPrintZonesForProduct(productId);

  useEffect(() => {
    let bestMesh: THREE.Mesh | null = null;
    let bestCount = 0;
    const matTemplate = makeWhiteMaterial(shirtColor);

    scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const m = o as THREE.Mesh;
      if (!m.geometry) return;

      if (!m.geometry.attributes.normal || m.geometry.attributes.normal.count === 0) {
        m.geometry.computeVertexNormals();
      }

      // Material ersetzen
      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => {
          if (mat && 'dispose' in mat) (mat as THREE.Material).dispose();
        });
      } else if (m.material && 'dispose' in m.material) {
        (m.material as THREE.Material).dispose();
      }
      m.material = matTemplate.clone();
      m.castShadow = false;
      m.receiveShadow = false;

      const count = m.geometry.attributes.position?.count ?? 0;
      if (count > bestCount) {
        bestMesh = m;
        bestCount = count;
      }
    });

    if (bestMesh) {
      console.log('[Shirt3DEnhanced] product', productId, 'zones:', availableZones.length);
      setDecalMesh(bestMesh as THREE.Mesh);
    }
  }, [scene, shirtColor, productId, availableZones.length]);

  return (
    <>
      <primitive object={scene} />

      {/* Zone Highlights (nur im Selection Mode) */}
      {enableZoneSelection && decalMesh && availableZones.map((zone) => (
        <ZoneHighlight
          key={zone.id}
          mesh={decalMesh}
          zone={zone}
          isSelected={selectedZone === zone.id}
          onSelect={() => onZoneSelect?.(zone.id)}
        />
      ))}

      {/* Customer Designs per Zone */}
      {decalMesh && zonePrints.map((zonePrint) => {
        const zone = getPrintZone(zonePrint.zoneId);
        if (!zone) return null;

        return (
          <ZoneDecal
            key={`${zonePrint.zoneId}-${zonePrint.src}`}
            mesh={decalMesh}
            zonePrint={zonePrint}
            zone={zone}
          />
        );
      })}
    </>
  );
}

/**
 * Kamera-Einstellungen pro Produkt
 */
function getCamera(productId: string) {
  if (productId === '2') { // Shorts
    return {
      cameraPos: [0, 0.05, 1.9] as [number, number, number],
      orbitTarget: [0, 0, 0] as [number, number, number],
      minDistance: 0.7,
      maxDistance: 4.5,
      fov: 38,
    };
  }
  // Default: T-Shirt
  return {
    cameraPos: [0, 0.05, 1.7] as [number, number, number],
    orbitTarget: [0, 0, 0] as [number, number, number],
    minDistance: 0.5,
    maxDistance: 4.0,
    fov: 40,
  };
}

/**
 * Main Component: Enhanced 3D Viewer
 */
export default function Shirt3DEnhanced(props: Shirt3DEnhancedProps) {
  const { productId, enableTouch = true } = props;
  const modelPath = MODEL_PATHS[productId] || MODEL_PATHS['1'];

  if (!modelPath) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888'
      }}>
        3D-Modell nicht verfügbar
      </div>
    );
  }

  const cam = getCamera(productId);

  return (
    <Canvas
      camera={{ position: cam.cameraPos, fov: cam.fov }}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true,
      }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      <Suspense fallback={null}>
        <EnhancedGarmentModel {...props} modelPath={modelPath} />
      </Suspense>

      <OrbitControls
        target={cam.orbitTarget}
        minDistance={cam.minDistance}
        maxDistance={cam.maxDistance}
        enablePan={false}
        enableZoom={true}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.6}
        enabled={enableTouch}
      />
    </Canvas>
  );
}

// Preload models
Object.values(MODEL_PATHS).forEach(path => {
  if (path) useGLTF.preload(path);
});
