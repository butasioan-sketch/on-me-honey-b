export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://on-me-honey-b.vercel.app',
).origin;
