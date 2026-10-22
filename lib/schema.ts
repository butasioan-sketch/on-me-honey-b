/**
 * JSON-LD Schema markup generators for SEO
 * Creates rich snippets for Google search results
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://on-me-honey-b.vercel.app';

export interface ProductSchemaData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  brand: string;
  category: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
}

/**
 * Generate Product schema for e-commerce items
 * Shows price, availability, ratings in search results
 */
export function generateProductSchema(product: ProductSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/product/${product.id}#product`,
    name: product.name,
    description: product.description,
    image: `${siteUrl}${product.image}`,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.id}`,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: 'ON ME HONEY B',
      },
    },
    category: product.category,
  };
}

/**
 * Generate FAQ schema for FAQ pages
 * Shows questions & answers in search results
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 * Shows breadcrumb trail in search results
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate LocalBusiness schema for shop information
 * Shows business details in search and maps
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#business`,
    name: 'ON ME HONEY B',
    description: 'Personalisierte Textilien mit deinem Design. T-Shirts, Shorts und mehr mit professionellem Sublimationsdruck.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og.png`,
    priceRange: '€€',
    paymentAccepted: 'Credit Card, Stripe',
    openingHours: 'Mo-Fr 09:00-18:00',
    sameAs: [
      // Add social media URLs when available
    ],
  };
}
