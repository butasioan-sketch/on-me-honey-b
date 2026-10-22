'use client';

import dynamic from 'next/dynamic';
import StaticShirtPreview from './StaticShirtPreview';

// Dynamic import - loading component can't access productId, so we'll handle it differently
const Shirt3D = dynamic(() => import('./Shirt3D'), {
  ssr: false,
});

interface ProductHeroViewerProps {
  height?: number;
  /** '1' Tee (default), '2' Shorts — nur der GLB-Pfad in Shirt3D haengt davon ab. */
  productId?: string;
}

export default function ProductHeroViewer({ height = 400, productId = '1' }: ProductHeroViewerProps) {
  return (
    <div style={{ width: '100%', maxWidth: 400, height, margin: '0 auto', position: 'relative' }}>
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,0,26,0.18), transparent 70%)',
        filter: 'blur(24px)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', transition: 'transform 0.2s ease' }}
        className="hero-shirt-viewer"
      >
        {/* Static preview while 3D loads - with correct productId */}
        <StaticShirtPreview
          shadow="0 12px 32px rgba(0,0,0,0.55)"
          productId={productId}
        />
        <div style={{ position: 'absolute', inset: 0 }}>
          <Shirt3D enableTouch={false} fallback="static" productId={productId} />
        </div>
      </div>
    </div>
  );
}
