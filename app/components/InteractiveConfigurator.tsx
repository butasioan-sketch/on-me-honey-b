'use client';
/**
 * INTERACTIVE DESIGN CONFIGURATOR
 *
 * Allows customers to:
 * - View 3D product model
 * - Upload their own designs
 * - Select print areas on the model
 * - Preview design on product in real-time
 * - Save and order
 *
 * Features:
 * - Interactive 3D rotation
 * - Drag & drop upload
 * - Live preview
 * - Multiple print zones
 * - Works for all products
 */

import { useState, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Design {
  front?: string | null;
  back?: string | null;
}

interface InteractiveConfiguratorProps {
  productId: string;
  productName: string;
  modelPath: string;
  price: number;
  onDesignChange?: (design: Design) => void;
  onSave?: (design: Design) => void;
  onAddToCart?: (design: Design) => void;
}

// Model with clickable print zones
function InteractiveModel({
  path,
  design,
  onZoneClick
}: {
  path: string;
  design: Design;
  onZoneClick: (zone: 'front' | 'back') => void;
}) {
  const { scene } = useGLTF(path);
  const [hoveredZone, setHoveredZone] = useState<'front' | 'back' | null>(null);

  // Setup material
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

  return (
    <group>
      <primitive object={scene} scale={1.2} />

      {/* Front Print Zone Indicator */}
      <mesh
        position={[0, 0.5, 0.3]}
        onClick={() => onZoneClick('front')}
        onPointerOver={() => setHoveredZone('front')}
        onPointerOut={() => setHoveredZone(null)}
      >
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial
          color={hoveredZone === 'front' ? '#D4AF37' : '#ffffff'}
          transparent
          opacity={design.front ? 0.1 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back Print Zone Indicator */}
      <mesh
        position={[0, 0.5, -0.3]}
        rotation={[0, Math.PI, 0]}
        onClick={() => onZoneClick('back')}
        onPointerOver={() => setHoveredZone('back')}
        onPointerOut={() => setHoveredZone(null)}
      >
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial
          color={hoveredZone === 'back' ? '#D4AF37' : '#ffffff'}
          transparent
          opacity={design.back ? 0.1 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Display uploaded designs as textures */}
      {design.front && (
        <mesh position={[0, 0.5, 0.31]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial
            map={new THREE.TextureLoader().load(design.front)}
            transparent
          />
        </mesh>
      )}

      {design.back && (
        <mesh position={[0, 0.5, -0.31]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial
            map={new THREE.TextureLoader().load(design.back)}
            transparent
          />
        </mesh>
      )}
    </group>
  );
}

export default function InteractiveConfigurator({
  productId,
  productName,
  modelPath,
  price,
  onDesignChange,
  onSave,
  onAddToCart
}: InteractiveConfiguratorProps) {
  const [design, setDesign] = useState<Design>({});
  const [selectedZone, setSelectedZone] = useState<'front' | 'back' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, zone: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newDesign = { ...design, [zone]: imageUrl };
      setDesign(newDesign);
      onDesignChange?.(newDesign);
    };
    reader.readAsDataURL(file);
  }, [design, onDesignChange]);

  const handleZoneClick = useCallback((zone: 'front' | 'back') => {
    setSelectedZone(zone);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, zone: 'front' | 'back') => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newDesign = { ...design, [zone]: imageUrl };
      setDesign(newDesign);
      onDesignChange?.(newDesign);
    };
    reader.readAsDataURL(file);
  }, [design, onDesignChange]);

  const handleSave = () => {
    onSave?.(design);
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#D4AF37',
            margin: 0
          }}>
            Design Konfigurator
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <p style={{ color: '#888', margin: 0, fontSize: '0.95rem' }}>
              {productName}
            </p>
            <span style={{ color: '#666' }}>•</span>
            <p style={{ color: '#D4AF37', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              €{price.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={!design.front && !design.back}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: (design.front || design.back) ? '#D4AF37' : '#666',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: (design.front || design.back) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Speichern
          </button>
          <button
            onClick={() => onAddToCart?.(design)}
            disabled={!design.front && !design.back}
            style={{
              padding: '0.75rem 2rem',
              background: (design.front || design.back) ? '#D4AF37' : '#333',
              color: (design.front || design.back) ? '#000' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: (design.front || design.back) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            In den Warenkorb
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '2rem',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* 3D Viewer */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '2px solid rgba(212, 175, 55, 0.2)'
        }}>
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 0, 3]} />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight position={[-5, 5, 5]} intensity={0.3} />

            {/* Model */}
            <InteractiveModel
              path={modelPath}
              design={design}
              onZoneClick={handleZoneClick}
            />

            {/* Environment */}
            <Environment preset="studio" />
            <ContactShadows
              position={[0, -1, 0]}
              opacity={0.5}
              scale={10}
              blur={2}
            />

            {/* Controls */}
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={5}
            />
          </Canvas>

          {/* Instructions Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '1rem 2rem',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <p style={{ color: '#D4AF37', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              💡 Klicke auf die hellen Bereiche, um dein Design hochzuladen
            </p>
            <p style={{ color: '#888', margin: '0.5rem 0 0', fontSize: '0.8rem' }}>
              Rotiere mit Maus • Zoom mit Scroll
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          overflowY: 'auto'
        }}>
          {/* Front Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => handleDrop(e, 'front')}
            style={{
              padding: '2rem',
              background: selectedZone === 'front'
                ? 'rgba(212, 175, 55, 0.1)'
                : 'rgba(255, 255, 255, 0.03)',
              border: selectedZone === 'front'
                ? '2px solid #D4AF37'
                : isDragging ? '2px dashed #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setSelectedZone('front');
              fileInputRef.current?.click();
            }}
          >
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
              Vorderseite
            </h3>

            {design.front ? (
              <div>
                <img
                  src={design.front}
                  alt="Front design"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDesign({ ...design, front: null });
                    onDesignChange?.({ ...design, front: null });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(226, 0, 26, 0.2)',
                    border: '1px solid rgba(226, 0, 26, 0.4)',
                    borderRadius: '6px',
                    color: '#E2001A',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Design entfernen
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#888' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  Klicken zum Hochladen<br/>
                  oder Design hierher ziehen
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#666' }}>
                  JPG, PNG oder SVG
                </p>
              </div>
            )}
          </div>

          {/* Back Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => handleDrop(e, 'back')}
            style={{
              padding: '2rem',
              background: selectedZone === 'back'
                ? 'rgba(212, 175, 55, 0.1)'
                : 'rgba(255, 255, 255, 0.03)',
              border: selectedZone === 'back'
                ? '2px solid #D4AF37'
                : isDragging ? '2px dashed #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setSelectedZone('back');
              fileInputRef.current?.click();
            }}
          >
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
              Rückseite
            </h3>

            {design.back ? (
              <div>
                <img
                  src={design.back}
                  alt="Back design"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDesign({ ...design, back: null });
                    onDesignChange?.({ ...design, back: null });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(226, 0, 26, 0.2)',
                    border: '1px solid rgba(226, 0, 26, 0.4)',
                    borderRadius: '6px',
                    color: '#E2001A',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Design entfernen
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#888' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  Klicken zum Hochladen<br/>
                  oder Design hierher ziehen
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#666' }}>
                  JPG, PNG oder SVG
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '12px'
          }}>
            <h4 style={{ color: '#2196F3', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>
              💡 Tipps für beste Ergebnisse:
            </h4>
            <ul style={{ color: '#aaa', margin: 0, padding: '0 0 0 1.5rem', fontSize: '0.85rem', lineHeight: '1.8' }}>
              <li>Mindestauflösung: 300 DPI</li>
              <li>Format: 210 × 297 mm (A4)</li>
              <li>Dateigröße: max. 10 MB</li>
              <li>Transparenter Hintergrund empfohlen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/svg+xml"
        style={{ display: 'none' }}
        onChange={(e) => selectedZone && handleFileUpload(e, selectedZone)}
      />
    </div>
  );
}
