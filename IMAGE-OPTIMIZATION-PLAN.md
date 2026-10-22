# 🖼️ IMAGE OPTIMIZATION PLAN

**Date:** 22. Oktober 2026  
**Status:** Ready to optimize  
**Impact:** MAJOR performance improvement!

---

## 🚨 CRITICAL FINDINGS:

### Large Images Identified:

1. **logo.png: 2.6 MB** ⚠️ CRITICAL!
   - Current: 2,600 KB
   - Target: <100 KB
   - Savings: ~2,500 KB (96% reduction!)
   - Usage: Header, icons
   - Priority: HIGHEST

2. **airfit-front.png: 1.3 MB** ⚠️
   - Current: 1,300 KB
   - Target: <200 KB
   - Savings: ~1,100 KB (85%)
   - Usage: Product images
   - Priority: HIGH

3. **airfit-back.png: 1.2 MB** ⚠️
   - Current: 1,200 KB
   - Target: <200 KB
   - Savings: ~1,000 KB (83%)
   - Usage: Product images
   - Priority: HIGH

4. **og.png: 668 KB**
   - Current: OK for OG image
   - Target: <300 KB
   - Savings: ~368 KB (55%)
   - Usage: Social media preview
   - Priority: MEDIUM

5. **icon-maskable.png: 472 KB**
   - Current: 472 KB
   - Target: <100 KB
   - Savings: ~372 KB (79%)
   - Usage: PWA icon
   - Priority: MEDIUM

6. **icon-512.png: 472 KB**
   - Current: 472 KB
   - Target: <100 KB
   - Savings: ~372 KB (79%)
   - Usage: PWA icon
   - Priority: MEDIUM

### **TOTAL POTENTIAL SAVINGS: ~5,700 KB (5.7 MB!)**

---

## 🎯 OPTIMIZATION STRATEGY:

### Phase 1: Logo Optimization (CRITICAL)
- **logo.png (2.6 MB)**
- Method: Resize + compress
- Target size: 56×56px (actual usage)
- Format: PNG (transparency needed)
- Tool: ImageMagick or online optimizer
- Expected: <20 KB

### Phase 2: Product Images
- **airfit-front.png, airfit-back.png**
- Method: Resize + WebP conversion
- Target dimensions: 1024×1536px (max needed)
- Format: WebP with PNG fallback
- Expected: <200 KB each

### Phase 3: Icons
- **icon-512.png, icon-maskable.png**
- Method: Compress + optimize
- Keep dimensions (needed for PWA)
- Format: PNG optimized
- Expected: <100 KB each

### Phase 4: Social Images
- **og.png**
- Method: Compress
- Dimensions: 1200×630 (required)
- Format: PNG or WebP
- Expected: <250 KB

---

## 🛠️ MANUAL OPTIMIZATION GUIDE:

### Option 1: Online Tools (Recommended)

**TinyPNG (https://tinypng.com):**
1. Upload logo.png, airfit-front.png, airfit-back.png
2. Download optimized versions
3. Replace original files
4. Expected savings: 70-80%

**Squoosh (https://squoosh.app):**
1. Upload images
2. Choose WebP format
3. Adjust quality (80-85%)
4. Download and replace

### Option 2: ImageMagick (If installed)

```bash
# Logo (resize to actual size)
convert logo.png -resize 56x56 -quality 90 logo-optimized.png

# Product images (resize + compress)
convert airfit-front.png -resize 1024x1536 -quality 85 airfit-front-optimized.png
convert airfit-back.png -resize 1024x1536 -quality 85 airfit-back-optimized.png

# WebP conversion
convert airfit-front.png -resize 1024x1536 -quality 85 airfit-front.webp
convert airfit-back.png -resize 1024x1536 -quality 85 airfit-back.webp

# Icons
convert icon-512.png -quality 90 icon-512-optimized.png
convert icon-maskable.png -quality 90 icon-maskable-optimized.png
```

### Option 3: NPM Sharp (When npm fixed)

```bash
npm install sharp
node scripts/optimize-images.js
```

---

## 📊 EXPECTED IMPACT:

### Performance Improvements:

**Before:**
- Total image weight: ~7.5 MB
- First Contentful Paint: ~2-3s
- Lighthouse Score: ~70-75

**After:**
- Total image weight: ~1.8 MB (76% reduction!)
- First Contentful Paint: ~1-1.5s
- Lighthouse Score: ~85-90

### Benefits:

✅ **76% smaller image files**
✅ **50% faster page load**
✅ **Better mobile experience**
✅ **Higher SEO scores**
✅ **Lower bandwidth costs**
✅ **Better user experience**

---

## 🔄 IMPLEMENTATION STEPS:

### Immediate (Manual):

1. Download TinyPNG/Squoosh
2. Optimize logo.png (CRITICAL!)
3. Optimize product images
4. Replace files in public/
5. Test build
6. Deploy
7. Verify with Lighthouse

**Time:** 30 minutes  
**Impact:** MASSIVE  

### Later (Automated):

1. Fix npm cache issue
2. Install sharp
3. Create optimization script
4. Run on all images
5. Add to build process

---

## 📋 CURRENT STATUS:

**Images Found:** ✅  
**Optimization Tools:** ⏸ (npm blocked)  
**Manual Guide:** ✅ READY  
**Expected Savings:** 5.7 MB (76%)  
**Priority:** HIGH (logo.png critical!)  

---

## 💡 RECOMMENDATION:

**DO THIS NOW:**
1. Use TinyPNG to optimize logo.png (2.6 MB → <100 KB)
2. This alone saves 2.5 MB and massively improves header load!
3. Takes 2 minutes!

**DO THIS NEXT:**
1. Optimize product images (saves 2.2 MB more)
2. Total time: 15 minutes
3. Total savings: 4.7 MB!

**Result:**
- Much faster site
- Better mobile experience
- Higher Google rankings
- Professional performance

---

*Image Optimization Plan: 22. Oktober 2026*  
*Status: Ready to execute*  
*Impact: CRITICAL for performance*

