'use client';
/**
 * ENHANCED 3D VIEWER — Premium Experience
 * Professional lighting, shadows, animations
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Enhanced3DViewerProps {
  productId: string;
  modelPath?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
}

const MODEL_PATHS: Record<string, string> = {
  '1': '/models/shirt-white-v2.glb',
  '2': '/models/shorts-white-v1.glb',
  '3': '/models/sport-shirt-pa4012.glb',
  '4': '/models/basketball-shorts-pa1050.glb',
  '5': '/models/pillow-cover-40x40.glb',
};

function Model({ path }: { path: string }) {
  const { scene } = useGLTF(path);

  // Ensure white material
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.65,
        metalness: 0,
      });
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return <primitive object={scene} scale={1.2} />;
}

// Preload all models
Object.values(MODEL_PATHS).forEach(path => {
  if (path) useGLTF.preload(path);
});

export default function Enhanced3DViewer({
  productId,
  modelPath,
  autoRotate = true,
  enableZoom = true
}: Enhanced3DViewerProps) {
  const path = modelPath || MODEL_PATHS[productId] || MODEL_PATHS['1'];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        {/* Professional 3-Point Lighting */}
        <ambientLight intensity={0.4} />

        {/* Key Light (main) */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Fill Light (soften shadows) */}
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.5}
        />

        {/* Rim Light (edge highlight) */}
        <directionalLight
          position={[0, 5, -10]}
          intensity={0.3}
        />

        {/* Environment Map for reflections */}
        <Environment preset="studio" />

        {/* 3D Model */}
        <Suspense fallback={null}>
          <Model path={path} />
        </Suspense>

        {/* Soft Contact Shadows */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Interactive Controls */}
        <OrbitControls
          enableZoom={enableZoom}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Floating UI Hint */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '0.5rem 1rem',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.8)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v12M6 12h12"/>
        </svg>
        Ziehen zum Drehen • Scrollen zum Zoomen
      </div>
    </div>
  );
}
