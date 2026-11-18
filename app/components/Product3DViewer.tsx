"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { PRODUCTS_3D, type Product3DKey } from "@/lib/product-3d-config";

function AnimatedModel({
  productKey,
  autoRotate,
}: {
  productKey: Product3DKey;
  autoRotate: boolean;
}) {
  const cfg = PRODUCTS_3D[productKey];
  const { scene } = useGLTF(cfg.modelPath);
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    t.current += delta;
    if (autoRotate)
      group.current.rotation.y += delta * cfg.animation.rotateSpeedRadPerSec;
    group.current.position.y =
      Math.sin(t.current * Math.PI * 2 * cfg.animation.floatFreqHz) *
      cfg.animation.floatAmpM;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function Product3DViewer({
  productKey,
  autoRotateDefault = true,
}: {
  productKey: Product3DKey;
  autoRotateDefault?: boolean;
}) {
  const cfg = PRODUCTS_3D[productKey];
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);

  return (
    <div className="relative w-full h-[520px] bg-neutral-100 rounded-xl overflow-hidden">
      <Canvas camera={{ position: cfg.camera.position, fov: cfg.camera.fov }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          <Environment preset="studio" />
          <AnimatedModel productKey={productKey} autoRotate={autoRotate} />
          <OrbitControls
            target={cfg.camera.target}
            enablePan={false}
            minDistance={1.2}
            maxDistance={4}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      <button
        onClick={() => setAutoRotate((v) => !v)}
        className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full text-sm"
      >
        {autoRotate ? "⏸ 360° pausieren" : "▶ 360° starten"}
      </button>
    </div>
  );
}
