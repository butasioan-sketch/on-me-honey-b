"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";

const unavailable =
  "360°-Ansicht nicht verfügbar. Das Produktfoto bleibt verfügbar.";

class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <p role="status">{unavailable}</p>
    ) : (
      this.props.children
    );
  }
}

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return <primitive object={scene} />;
}

export default function CatalogModelViewer({ src }: { src: string }) {
  return (
    <ModelBoundary>
      <Canvas
        aria-label="Interaktive 360°-Vorschau"
        camera={{ position: [1, 0.65, 2], fov: 38 }}
        dpr={[1, 1.75]}
        fallback={<p role="status">{unavailable}</p>}
        frameloop="demand"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <directionalLight position={[-2, 1, -4]} intensity={1.1} />
        <OrbitControls makeDefault enablePan={false} />
        <Suspense fallback={<Html center>360°-Modell lädt …</Html>}>
          <Bounds fit clip observe margin={1.2}>
            <Model src={src} />
          </Bounds>
        </Suspense>
      </Canvas>
    </ModelBoundary>
  );
}
