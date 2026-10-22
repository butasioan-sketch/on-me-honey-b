'use client';

import { useState } from 'react';
import Shirt3DEnhanced from '@/app/components/Shirt3DEnhanced';
import { getPrintZonesForProduct, type PrintZoneId } from '@/lib/print-zones';

export default function TestZonesPage() {
  const [productId, setProductId] = useState('1');
  const [selectedZone, setSelectedZone] = useState<PrintZoneId | null>(null);
  const [enableSelection, setEnableSelection] = useState(true);

  const zones = getPrintZonesForProduct(productId);

  const handleZoneSelect = (zoneId: PrintZoneId) => {
    setSelectedZone(zoneId);
    console.log('Zone ausgewählt:', zoneId);
  };

  return (
    <div style={{
      height: '100vh',
      background: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          Multi-Zone 3D Viewer Test
        </h1>

        {/* Product Switcher */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setProductId('1')}
            style={{
              padding: '0.5rem 1rem',
              background: productId === '1' ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            T-Shirt
          </button>
          <button
            onClick={() => setProductId('2')}
            style={{
              padding: '0.5rem 1rem',
              background: productId === '2' ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Shorts
          </button>
        </div>

        {/* Selection Toggle */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={enableSelection}
              onChange={(e) => setEnableSelection(e.target.checked)}
            />
            Zone-Selection aktiviert
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: 3D Viewer */}
        <div style={{ flex: 2, position: 'relative', background: '#2a2a2a' }}>
          <Shirt3DEnhanced
            productId={productId}
            enableZoneSelection={enableSelection}
            selectedZone={selectedZone}
            onZoneSelect={handleZoneSelect}
            shirtColor="#ffffff"
          />

          {/* Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(0,0,0,0.7)',
            padding: '1rem',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <strong>Produkt:</strong> {productId === '1' ? 'T-Shirt' : 'Shorts'}
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Ausgewählte Zone:</strong>{' '}
              {selectedZone || 'Keine'}
            </div>
          </div>
        </div>

        {/* Right: Zone Controls */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          borderLeft: '1px solid #333'
        }}>
          <h2 style={{ marginTop: 0 }}>
            Verfügbare Druckzonen
          </h2>

          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {enableSelection
              ? 'Klicke auf Bereiche im 3D-Modell oder wähle eine Zone aus der Liste:'
              : 'Zone-Selection ist deaktiviert. Aktiviere sie oben rechts.'}
          </p>

          {/* Zone List */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => enableSelection && handleZoneSelect(zone.id)}
              style={{
                padding: '1rem',
                margin: '0.5rem 0',
                background: selectedZone === zone.id ? '#4CAF50' : '#333',
                borderRadius: '8px',
                cursor: enableSelection ? 'pointer' : 'default',
                transition: 'all 0.2s',
                opacity: enableSelection ? 1 : 0.5
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                    {zone.name.de}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#ccc',
                    margin: 0
                  }}>
                    {zone.description.de}
                  </p>

                  {/* Max Area Info */}
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#999'
                  }}>
                    Max: {zone.maxArea.widthMm} × {zone.maxArea.heightMm} mm
                  </div>
                </div>

                {/* Price Modifier */}
                {zone.priceModifier && (
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    background: '#FF9800',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    +{zone.priceModifier.toFixed(2)}€
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Zone Count */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#222',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {zones.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              Verfügbare Zonen
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#1a3a4a',
            borderRadius: '8px',
            fontSize: '0.85rem',
            lineHeight: '1.6'
          }}>
            <strong>💡 So funktioniert's:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Klicke auf eine Zone in der Liste</li>
              <li>Oder klicke direkt im 3D-Modell</li>
              <li>Zoomen: Maus-Scroll</li>
              <li>Drehen: Linke Maustaste halten</li>
              <li>Produkt wechseln: Buttons oben</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
