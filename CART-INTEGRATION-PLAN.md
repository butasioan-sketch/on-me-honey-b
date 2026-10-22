# 🛒 CART INTEGRATION PLAN

**Phase:** Phase 3 - Step 4  
**Goal:** Connect konfigurator to real cart system  
**Methodology:** Perfected 8-Phase Workflow

---

## 📋 CURRENT CART ARCHITECTURE:

### Storage:
- **localStorage key:** `'on_me_honey_b_cart'`
- **Format:** JSON array of CartItem objects

### CartItem Interface:
```typescript
interface CartItem {
  id: string;           // Product ID
  name: string;         // Product name
  price: number;        // Unit price
  size: string;         // Size (S, M, L, XL, XXL)
  fit?: string;         // Optional fit
  color?: string;       // Optional color
  quantity: number;     // Quantity
  designId?: string;    // Design ID (REQUIRED for checkout!)
  pages?: number;       // Print pages (default 1)
}
```

### Key Requirements:
- ✅ designId is REQUIRED for checkout
- ✅ Must save design BEFORE adding to cart
- ✅ CartCount updates via window.dispatchEvent('storage')

---

## 🎯 INTEGRATION REQUIREMENTS:

### 1. SAVE DESIGN FIRST:
```typescript
POST /api/designs
Body: { 
  front_image: string,  // base64 data URL
  back_image: string,   // base64 data URL
  product_id: string    // '1' for T-Shirt
}
Response: { id: string, ... }
```

### 2. ADD TO CART:
```typescript
const cartItem: CartItem = {
  id: productId,        // '1'
  name: productName,    // 'AirFit Pro T-Shirt'
  price: price,         // 44.99
  size: selectedSize,   // 'M'
  quantity: 1,
  designId: savedDesignId,  // From /api/designs
  pages: (front && back) ? 2 : 1
};

// Add to localStorage
const cart = JSON.parse(localStorage.getItem('on_me_honey_b_cart') || '[]');
cart.push(cartItem);
localStorage.setItem('on_me_honey_b_cart', JSON.stringify(cart));

// Trigger CartCount update
window.dispatchEvent(new Event('storage'));
```

### 3. USER FEEDBACK:
- Show loading state while saving
- Show success message
- Optional: Navigate to cart
- Update CartCount badge

---

## 💻 IMPLEMENTATION PLAN:

### File 1: `lib/cart.ts` (NEW)
**Purpose:** Cart utility functions

```typescript
export function addToCart(item: CartItem): void {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
  notifyCartUpdate();
}

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('on_me_honey_b_cart') || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem('on_me_honey_b_cart', JSON.stringify(cart));
}

export function notifyCartUpdate(): void {
  window.dispatchEvent(new Event('storage'));
}
```

### File 2: `app/components/InteractiveConfigurator.tsx` (UPDATE)
**Changes needed:**

1. Add save design function:
```typescript
const saveDesignToDatabase = async (design: Design): Promise<string> => {
  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      front_image: design.front,
      back_image: design.back,
      product_id: productId
    })
  });
  const data = await response.json();
  return data.id;
};
```

2. Update handleAddToCart:
```typescript
const handleAddToCart = async () => {
  if (!design.front && !design.back) return;
  
  setIsAddingToCart(true);
  try {
    // 1. Save design
    const designId = await saveDesignToDatabase(design);
    
    // 2. Add to cart
    addToCart({
      id: productId,
      name: productName,
      price: price,
      size: selectedSize,
      quantity: 1,
      designId: designId,
      pages: (design.front && design.back) ? 2 : 1
    });
    
    // 3. Success feedback
    alert('Zum Warenkorb hinzugefügt! 🛒');
    
    // Optional: navigate to cart
    // window.location.href = '/cart';
    
  } catch (error) {
    alert('Fehler beim Hinzufügen zum Warenkorb');
  } finally {
    setIsAddingToCart(false);
  }
};
```

3. Add loading state:
```typescript
const [isAddingToCart, setIsAddingToCart] = useState(false);
```

4. Update button:
```typescript
<button
  onClick={handleAddToCart}
  disabled={(!design.front && !design.back) || isAddingToCart}
  ...
>
  {isAddingToCart ? 'Wird hinzugefügt...' : `In den Warenkorb (${selectedSize})`}
</button>
```

---

## ✅ SUCCESS CRITERIA:

1. ✅ Design saved to database
2. ✅ Design ID received
3. ✅ Item added to cart with designId
4. ✅ CartCount updates automatically
5. ✅ User sees success feedback
6. ✅ Can proceed to checkout

---

## 🧪 TESTING PLAN:

### Manual Tests:
1. Upload front design
2. Select size
3. Click "In den Warenkorb"
4. Verify loading state
5. Check cart page
6. Verify design shows in cart
7. Verify checkout works

### WebFetch Tests:
1. Button shows loading state
2. Success message appears
3. CartCount updates
4. No errors in console

---

## ⚠️ EDGE CASES:

1. **API fails:** Show error, don't add to cart
2. **No design:** Button disabled (already handled)
3. **No size:** Impossible (default M)
4. **Duplicate items:** Allow (user may want 2 shirts)
5. **Network error:** Catch and show message

---

## 📦 FILES TO CREATE/MODIFY:

### NEW:
- `lib/cart.ts` - Cart utilities

### MODIFY:
- `app/components/InteractiveConfigurator.tsx` - Add cart integration
- `app/konfigurator/page.tsx` - Remove test handler

---

**ESTIMATED TIME:** 30-45 minutes  
**COMPLEXITY:** Medium  
**RISK:** Low (well-defined API)

**READY TO IMPLEMENT!** 🚀
