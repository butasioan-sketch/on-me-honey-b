/**
 * Analytics Helper - READY TO ACTIVATE
 * 
 * SETUP:
 * 1. Vercel Analytics: npm i @vercel/analytics
 * 2. GA4: Set NEXT_PUBLIC_GA_ID in .env
 */

type EventName = 'design_upload' | 'add_to_cart' | 'checkout_start' | 'purchase_complete' | 'product_view';
type EventParams = Record<string, string | number | boolean>;

export function trackEvent(eventName: EventName, params?: EventParams) {
  if (typeof window !== 'undefined' && 'va' in window) {
    // @ts-ignore
    window.va?.('event', eventName, params);
  }
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag?.('event', eventName, params);
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, params);
  }
}

export function trackProductView(productId: string, productName: string, price?: number) {
  trackEvent('product_view', { product_id: productId, product_name: productName, ...(price && { value: price }) });
}

export function trackAddToCart(productId: string, productName: string, price: number) {
  trackEvent('add_to_cart', { product_id: productId, product_name: productName, value: price });
}

export function trackPurchase(orderId: string, value: number, items: Array<{ id: string; name: string; price: number }>) {
  trackEvent('purchase_complete', { transaction_id: orderId, value, items: JSON.stringify(items) });
}

export function trackCheckoutStarted(value: number, items: Array<{ id: string; name: string; price: number }>) {
  trackEvent('checkout_start', { value, items: JSON.stringify(items) });
}
