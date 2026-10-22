# 🚨 CRITICAL FIXES - PATH TO 10/10

**WebFetch Rating:** 5/10  
**Target:** 10/10  
**Strategy:** Fix critical issues FIRST

---

## ❌ CRITICAL ISSUE #1: UPLOAD-VORGABEN FALSCH

**Problem:** Line 657
```typescript
<li>Format: 210 × 297 mm (A4)</li>
```

**Why Critical:**
- A4 ist PAPIER-Format, nicht T-Shirt!
- Confusing für User
- Technisch falsch

**Correct Info (from CLAUDE.md):**
- Druckbereich: 210 × 297 mm (das ist korrekt!)
- Aber das ist die DRUCK-Fläche, nicht Upload-Format
- User sollten hochauflösende Bilder hochladen

**Fix:**
```typescript
<li><strong>Bildgröße:</strong> Mindestens 2000 × 2000 px empfohlen</li>
<li><strong>Druckbereich:</strong> Ca. 20 × 28 cm auf dem Shirt</li>
```

---

## ❌ CRITICAL ISSUE #2: TOUCH-BEDIENUNG FEHLT

**Problem:** Line 437
```typescript
Rotiere mit Maus • Zoom mit Scroll
```

**Why Critical:**
- Mobile User können nicht bedienen!
- Keine Touch-Gesten genannt
- Schlechte Mobile UX

**Fix:**
```typescript
Rotiere mit Maus/Touch • Zoom mit Scroll/Pinch
```

---

## ❌ CRITICAL ISSUE #3: JPG + TRANSPARENT WIDERSPRUCH

**Problem:** Line 564 + 659
```typescript
JPG, PNG oder SVG  // Line 564
Transparenter Hintergrund empfohlen  // Line 659
```

**Why Critical:**
- JPG kann NICHT transparent sein!
- Technisch unmöglich
- Verwirrend

**Fix:**
```typescript
<li><strong>Format:</strong> PNG (mit Transparenz) oder JPG empfohlen</li>
<li><strong>Transparenz:</strong> PNG mit transparentem Hintergrund für beste Ergebnisse</li>
```

---

## 📋 IMPLEMENTATION PLAN:

### FIX 1: Upload Tips Korrektur
**File:** `app/components/InteractiveConfigurator.tsx`
**Lines:** 654-660

**Replace:**
```typescript
// OLD (WRONG):
<li>Mindestauflösung: 300 DPI</li>
<li>Format: 210 × 297 mm (A4)</li>
<li>Dateigröße: max. 10 MB</li>
<li>Transparenter Hintergrund empfohlen</li>

// NEW (CORRECT):
<li><strong>Auflösung:</strong> Mindestens 2000 × 2000 Pixel</li>
<li><strong>Format:</strong> PNG (transparent) oder JPG</li>
<li><strong>Druckbereich:</strong> Ca. 20 × 28 cm auf dem Shirt</li>
<li><strong>Dateigröße:</strong> max. 10 MB</li>
```

### FIX 2: Touch-Bedienung
**File:** `app/components/InteractiveConfigurator.tsx`
**Line:** 437

**Replace:**
```typescript
// OLD:
Rotiere mit Maus • Zoom mit Scroll

// NEW:
Desktop: Maus + Scroll • Mobile: Touch + Pinch
```

### FIX 3: Format Description bei Upload
**File:** `app/components/InteractiveConfigurator.tsx`
**Line:** 564

**Keep as is** (JPG, PNG oder SVG is correct)
**Fix only** the Tips section to clarify

---

## ✅ SUCCESS CRITERIA:

1. ✅ No contradictions (JPG vs transparent)
2. ✅ Clear mobile instructions
3. ✅ Correct size recommendations
4. ✅ Professional guidance
5. ✅ No technical impossibilities

---

## 🎯 EXPECTED IMPACT:

**Before:** 5/10 (Confusing, contradictory)  
**After:** 7-8/10 (Clear, accurate)  
**Further to 10/10:** Add product info, size chart

---

**READY TO FIX!** 🔧
