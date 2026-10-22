/**
 * CART UTILITIES
 *
 * localStorage-based cart management for ON ME HONEY B
 *
 * Cart Storage:
 * - Key: 'on_me_honey_b_cart'
 * - Format: JSON array of CartItem objects
 *
 * CartCount updates via window 'storage' event
 */

export interface CartItem {
  id: string;           // Product ID
  name: string;         // Product name
  price: number;        // Unit price
  size: string;         // Size (S, M, L, XL, XXL)
  fit?: string;         // Optional fit
  color?: string;       // Optional color (default: white)
  quantity: number;     // Quantity
  designId?: string;    // Design ID (REQUIRED for checkout!)
  pages?: number;       // Print pages (front + back = 2, one side = 1)
}

const CART_STORAGE_KEY = 'on_me_honey_b_cart';

/**
 * Get current cart from localStorage
 */
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

/**
 * Add item to cart
 *
 * @param item - Cart item to add
 * @returns true if successful, false otherwise
 */
export function addToCart(item: CartItem): boolean {
  try {
    const cart = getCart();
    cart.push(item);
    saveCart(cart);
    notifyCartUpdate();
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

/**
 * Notify CartCount component of cart updates
 * Triggers CartCount to re-read from localStorage
 */
export function notifyCartUpdate(): void {
  if (typeof window === 'undefined') return;

  // Dispatch storage event to trigger CartCount update
  window.dispatchEvent(new Event('storage'));
}

/**
 * Get total item count in cart
 */
export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Clear entire cart
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    notifyCartUpdate();
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
}
