# ENHANCED 360° MULTI-ZONE INTEGRATION
## ON ME HONEY B — Erweiterte Druckzonen für jedes Produkt

**Datum:** 22. Oktober 2026  
**Status:** ✅ Bereit zur Integration  
**Ziel:** Kunden können interaktiv auswählen, welche Bereiche (Zonen) jedes Produkts bedruckt werden sollen

---

## 🎯 WAS WIR GEBAUT HABEN

### 1. **Neue Dateien:**

✅ **`lib/print-zones.ts`**
- Konfiguration aller Druckzonen pro Produkt
- T-Shirt: Front, Back (+ optional: Ärmel)
- Shorts: Front, Back (+ optional: Beine, Seiten)
- Preisberechnung mit Zone-Modifiers
- 3D + 2D Positionierung pro Zone

✅ **`app/components/Shirt3DEnhanced.tsx`**
- Erweiterter 3D-Viewer mit Zone-Selection
- Interaktive Zone-Highlights (Hover + Click)
- Multi-Zone Decal-Support
- Speichert alle Zonen-Designs

✅ **`ENHANCED-360-INTEGRATION-GUIDE.md`** (diese Datei)
- Vollständige Integrations-Anleitung
- Datenbank-Schema Updates
- Admin-Interface Anpassungen
- Step-by-Step Implementation

---

## 📊 SYSTEM-ARCHITEKTUR

### Aktuell (Einfach):
```
Kunde wählt: Front ODER Back
      ↓
  1 Design gespeichert (front_image, back_image)
      ↓
  Admin sieht: 2 Bilder (Vorne, Hinten)
```

### Neu (Multi-Zone):
```
Kunde wählt: Multiple Zonen (Front, Back, Ärmel, Seiten, etc.)
      ↓
  Jede Zone = eigenes Design + Position
      ↓
  Alle Zonen in 1 JSON gespeichert (zones_data)
      ↓
  Admin sieht: Alle Zonen pro Produkt interaktiv
```

---

## 🗄️ DATENBANK-ANPASSUNGEN

### Schritt 1: Schema erweitern

Die `designs` Tabelle braucht eine neue Spalte für Multi-Zone Daten:

```sql
-- Migration: Add multi-zone support to designs table
ALTER TABLE designs 
ADD COLUMN zones_data TEXT DEFAULT NULL;

-- Optional: Index für bessere Performance
CREATE INDEX idx_designs_zones ON designs(product_id) 
WHERE zones_data IS NOT NULL;
```

**Struktur von `zones_data` (JSON):**
```json
{
  "productId": "1",
  "zones": [
    {
      "zoneId": "tshirt-front",
      "layers": [
        {
          "src": "data:image/png;base64,...",
          "transform": {
            "scale": 1.0,
            "x": 0,
            "y": 10
          }
        }
      ]
    },
    {
      "zoneId": "tshirt-back",
      "layers": [
        {
          "src": "data:image/png;base64,...",
          "transform": {
            "scale": 0.8,
            "x": 5,
            "y": -5
          }
        }
      ]
    }
  ],
  "meta": {
    "totalZones": 2,
    "additionalCost": 0
  }
}
```

### Schritt 2: API erweitern

**Datei:** `app/api/designs/route.ts`

Füge nach Zeile 67 hinzu:

```typescript
// NEU: Multi-Zone Support
const zonesData = body.zonesData && typeof body.zonesData === 'object' 
  ? JSON.stringify(body.zonesData) 
  : null;

// Update INSERT Query (Zeile 70-79):
await sql.query(
  `INSERT INTO designs (
    id, front_image, back_image, product_id, 
    front_transform, back_transform, meta, 
    front_preview, back_preview,
    zones_data
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
  [
    id, front, back, body.productId || null,
    frontTransform ? JSON.stringify(frontTransform) : null,
    backTransform ? JSON.stringify(backTransform) : null,
    meta ? JSON.stringify(meta) : null,
    frontPreview, backPreview,
    zonesData  // NEU
  ]
);
```

---

## 🎨 UI-KOMPONENTEN INTEGRATION

### Option A: Neue Design-Studio Seite (Empfohlen)

Erstelle: `app/product/[id]/design-zones/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import Shirt3DEnhanced from '@/app/components/Shirt3DEnhanced';
import { getPrintZonesForProduct, type PrintZoneId, type ZoneDesign } from '@/lib/print-zones';

export default function DesignZonesPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  const availableZones = getPrintZonesForProduct(productId);
  
  const [selectedZone, setSelectedZone] = useState<PrintZoneId | null>(null);
  const [zoneDesigns, setZoneDesigns] = useState<Map<PrintZoneId, ZoneDesign>>(new Map());
  
  const handleZoneSelect = (zoneId: PrintZoneId) => {
    setSelectedZone(zoneId);
    console.log('Zone selected:', zoneId);
  };
  
  const handleDesignUpload = async (file: File) => {
    if (!selectedZone) return;
    
    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      
      // Add to zone designs
      const newDesign: ZoneDesign = {
        zoneId: selectedZone,
        layers: [{
          src,
          transform: { scale: 1, x: 0, y: 0 }
        }]
      };
      
      setZoneDesigns(prev => new Map(prev).set(selectedZone, newDesign));
    };
    reader.readAsDataURL(file);
  };
  
  const saveAllZones = async () => {
    const zonesArray = Array.from(zoneDesigns.values());
    
    const payload = {
      productId,
      zonesData: {
        productId,
        zones: zonesArray,
        meta: {
          totalZones: zonesArray.length,
          additionalCost: 0 // TODO: Calculate from zones
        }
      }
    };
    
    const res = await fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('Saved design ID:', data.id);
  };
  
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left: 3D Viewer */}
      <div style={{ flex: 2, position: 'relative' }}>
        <Shirt3DEnhanced
          productId={productId}
          enableZoneSelection={true}
          selectedZone={selectedZone}
          onZoneSelect={handleZoneSelect}
          zonePrints={Array.from(zoneDesigns.values()).flatMap(zd => 
            zd.layers.map(layer => ({
              zoneId: zd.zoneId,
              src: layer.src,
              ...layer.transform
            }))
          )}
        />
      </div>
      
      {/* Right: Zone Controls */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h2>Druckzonen</h2>
        
        {/* Zone Selector */}
        {availableZones.map(zone => (
          <div 
            key={zone.id}
            style={{
              padding: '1rem',
              margin: '0.5rem 0',
              border: selectedZone === zone.id ? '2px solid #4CAF50' : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={() => handleZoneSelect(zone.id)}
          >
            <h3>{zone.name.de}</h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {zone.description.de}
            </p>
            {zone.priceModifier && (
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                +{zone.priceModifier.toFixed(2)}€
              </span>
            )}
          </div>
        ))}
        
        {/* Upload für ausgewählte Zone */}
        {selectedZone && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Design hochladen</h3>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDesignUpload(file);
              }}
            />
          </div>
        )}
        
        {/* Save Button */}
        {zoneDesigns.size > 0 && (
          <button
            onClick={saveAllZones}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Alle Zonen speichern ({zoneDesigns.size})
          </button>
        )}
      </div>
    </div>
  );
}
```

### Option B: Existierendes Design-Studio erweitern

**Datei:** `app/components/DesignStudio.tsx`

Füge Multi-Zone Toggle hinzu:

```typescript
// Nach Zeile 58:
const [multiZoneMode, setMultiZoneMode] = useState(false);
const [selectedZone, setSelectedZone] = useState<PrintZoneId | null>(null);

// Im Return, vor dem Canvas:
<div className="zone-mode-toggle">
  <button onClick={() => setMultiZoneMode(!multiZoneMode)}>
    {multiZoneMode ? 'Einfacher Modus' : 'Multi-Zone Modus'}
  </button>
</div>

// Canvas ersetzen mit:
{multiZoneMode ? (
  <Shirt3DEnhanced
    productId={productId}
    enableZoneSelection={true}
    selectedZone={selectedZone}
    onZoneSelect={setSelectedZone}
  />
) : (
  <Shirt3D 
    frontPrint={frontPrint} 
    backPrint={backPrint}
    productId={productId}
  />
)}
```

---

## 🔧 ADMIN-BEREICH INTEGRATION

### Schritt 1: Zone-Viewer Component

**Datei:** `app/admin/components/ZoneDesignViewer.tsx`

```typescript
'use client';

import { deserializeMultiZoneDesign, getPrintZone } from '@/lib/print-zones';
import Shirt3DEnhanced from '@/app/components/Shirt3DEnhanced';

export default function ZoneDesignViewer({ zonesDataJson }: { zonesDataJson: string }) {
  const zonesData = deserializeMultiZoneDesign(zonesDataJson);
  
  if (!zonesData) {
    return <div>Keine Multi-Zone Daten</div>;
  }
  
  const zonePrints = zonesData.zones.flatMap(zone => 
    zone.layers.map(layer => ({
      zoneId: zone.zoneId,
      src: layer.src,
      ...layer.transform
    }))
  );
  
  return (
    <div>
      <h3>Design-Zonen ({zonesData.zones.length})</h3>
      
      {/* Zone List */}
      <div style={{ marginBottom: '1rem' }}>
        {zonesData.zones.map(zone => {
          const zoneConfig = getPrintZone(zone.zoneId);
          return (
            <div key={zone.zoneId} style={{ 
              padding: '0.5rem', 
              background: '#f5f5f5',
              margin: '0.25rem 0',
              borderRadius: '4px'
            }}>
              <strong>{zoneConfig?.name.de || zone.zoneId}</strong>
              {' '}
              ({zone.layers.length} Layer)
            </div>
          );
        })}
      </div>
      
      {/* 3D Preview */}
      <div style={{ height: '400px', background: '#fafafa', borderRadius: '8px' }}>
        <Shirt3DEnhanced
          productId={zonesData.productId}
          zonePrints={zonePrints}
          enableZoneSelection={false}
        />
      </div>
    </div>
  );
}
```

### Schritt 2: Admin Orders Page erweitern

**Datei:** `app/admin/orders/page.tsx`

In der Order-Detail Ansicht:

```typescript
import ZoneDesignViewer from '../components/ZoneDesignViewer';

// Im Order-Detail:
{order.zones_data && (
  <ZoneDesignViewer zonesDataJson={order.zones_data} />
)}

// Fallback wenn nur alte Front/Back Daten:
{!order.zones_data && (order.front_image || order.back_image) && (
  <div>
    <h3>Klassisches Design</h3>
    {order.front_image && <img src={order.front_image} alt="Front" />}
    {order.back_image && <img src={order.back_image} alt="Back" />}
  </div>
)}
```

---

## 📦 VOLLSTÄNDIGE IMPLEMENTIERUNG

### Phase 1: Grundlagen (1-2 Stunden)

```bash
# 1. Datenbank Migration
psql $DATABASE_URL -c "ALTER TABLE designs ADD COLUMN zones_data TEXT DEFAULT NULL;"

# 2. API erweitern
# - Öffne: app/api/designs/route.ts
# - Füge zonesData Handling hinzu (siehe oben)

# 3. Test
curl -X POST http://localhost:3000/api/designs \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "zonesData": {
      "productId": "1",
      "zones": [],
      "meta": {}
    }
  }'
```

### Phase 2: UI Integration (2-3 Stunden)

```bash
# 1. Neue Route erstellen
mkdir -p app/product/[id]/design-zones
# Kopiere Code von oben in: app/product/[id]/design-zones/page.tsx

# 2. Link von Produktseite
# In app/product/[id]/page.tsx:
# <Link href={`/product/${id}/design-zones`}>
#   Multi-Zone Designer
# </Link>

# 3. Testen
npm run dev
# Öffne: http://localhost:3000/product/1/design-zones
```

### Phase 3: Admin-Integration (1-2 Stunden)

```bash
# 1. Admin Component erstellen
mkdir -p app/admin/components
# Erstelle: app/admin/components/ZoneDesignViewer.tsx

# 2. In Orders integrieren
# Siehe Code oben

# 3. Testen
# Admin-Bereich öffnen und Bestellungen mit Multi-Zone anschauen
```

---

## ✅ CHECKLISTE

### Vor dem Start:
- [ ] Datenbank-Backup erstellen
- [ ] `.env` Variablen prüfen (`DATABASE_URL` vorhanden?)
- [ ] Dependencies aktuell (`npm install`)

### Implementation:
- [ ] `lib/print-zones.ts` vorhanden ✅ (bereits erstellt)
- [ ] `app/components/Shirt3DEnhanced.tsx` vorhanden ✅ (bereits erstellt)
- [ ] Datenbank-Migration ausgeführt
- [ ] API erweitert (`app/api/designs/route.ts`)
- [ ] UI-Route erstellt (`app/product/[id]/design-zones/page.tsx`)
- [ ] Admin-Viewer erstellt (`app/admin/components/ZoneDesignViewer.tsx`)

### Testing:
- [ ] Zone-Selection funktioniert (Click auf Zone)
- [ ] Design-Upload pro Zone funktioniert
- [ ] Speichern in Datenbank funktioniert
- [ ] Admin zeigt alle Zonen korrekt
- [ ] 3D-Viewer zeigt alle Designs korrekt

### Production:
- [ ] Alle Tests bestanden
- [ ] Code-Review
- [ ] Git Commit
- [ ] Deploy auf Vercel

---

## 🎯 SCHNELLSTART (5 MINUTEN)

Wenn du **sofort loslegen** willst:

```bash
cd ~/Schreibtisch/on-me-honey-b

# 1. Datenbank erweitern
psql $DATABASE_URL -c "ALTER TABLE designs ADD COLUMN zones_data TEXT DEFAULT NULL;"

# 2. Neue Dateien sind schon da:
# - lib/print-zones.ts ✅
# - app/components/Shirt3DEnhanced.tsx ✅

# 3. Test-Seite erstellen
mkdir -p app/product/test-zones
cat > app/product/test-zones/page.tsx << 'EOF'
'use client';
import Shirt3DEnhanced from '@/app/components/Shirt3DEnhanced';
import { useState } from 'react';

export default function TestZones() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ height: '100vh' }}>
      <h1>Zone Test</h1>
      <p>Selected: {selected || 'none'}</p>
      <div style={{ height: '80vh' }}>
        <Shirt3DEnhanced
          productId="1"
          enableZoneSelection={true}
          selectedZone={selected}
          onZoneSelect={setSelected}
        />
      </div>
    </div>
  );
}
EOF

# 4. Testen
npm run dev
# Öffne: http://localhost:3000/product/test-zones
```

---

## 📞 SUPPORT

**Probleme?**

1. **Zone-Selection funktioniert nicht**
   → Prüfe Browser Console: `console.log` in `onZoneSelect`
   
2. **3D-Modell lädt nicht**
   → Prüfe: `/models/shirt-white-v2.glb` vorhanden?
   
3. **Datenbank-Error**
   → Prüfe: Migration ausgeführt? `DATABASE_URL` korrekt?

4. **TypeScript-Errors**
   → Run: `npx tsc --noEmit` und fixe Errors

---

**Erstellt von:** Claude Sonnet 4.5  
**Für:** ON ME HONEY B Shop  
**Datum:** 22. Oktober 2026  
**Version:** 1.0 (Multi-Zone System)
