import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats, initDb } from '@/lib/db';
import { notifyAdminOrderIssue } from '@/lib/admin-alert';
import { orderMissingDesign } from '@/lib/order-review';
import { Order } from '@/lib/types';
import { readEmailDelivery } from '@/lib/email-delivery';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDb(); initialized = true; }
}

export async function GET(request: NextRequest) {
  await ensureInit();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
    // Tracking: nur unkritische Felder (keine E-Mail, Motive, Betraege)
    return NextResponse.json({ order: {
      id: order.id, status: order.status, createdAt: order.createdAt,
      updatedAt: order.updatedAt, shippingCountry: order.shippingCountry,
      shippingMethod: order.shippingMethod,
    } });
  }
  const status = searchParams.get('status') || undefined;
  const stats = searchParams.get('stats');

  if (stats === 'true') {
    return NextResponse.json(await getOrderStats());
  }

  const orders = await getOrders(status, parseInt(searchParams.get('limit') || '50'));
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  await ensureInit();
  try {
    const body = await request.json();
    const missing = orderMissingDesign({
      id: '', status: 'paid', items: body.items || [], designId: body.designId || null,
      amountTotal: 0, currency: 'EUR', locale: 'de', shippingCountry: 'DE', createdAt: '', updatedAt: '',
    });
    const order: Order = {
      id: `PLT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      stripeSessionId: body.stripeSessionId,
      customerEmail: body.customerEmail,
      amountTotal: body.amountTotal || 0,
      currency: body.currency || 'EUR',
      status: missing ? 'on_hold' : (body.status || 'paid'),
      items: body.items || [],
      locale: body.locale || 'de',
      shippingCountry: body.shippingCountry || 'DE',
      shippingMethod: body.shippingMethod || undefined,
      designId: body.designId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!(await createOrder(order))) {
      return NextResponse.json({ error: 'Bestellung existiert bereits' }, { status: 409 });
    }
    if (missing) {
      await notifyAdminOrderIssue(order, 'missing_design');
    }
    return NextResponse.json({ order, success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Fehler' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  await ensureInit();
  try {
    const { id, status } = await request.json();
    const ALLOWED = ['paid', 'on_hold', 'production', 'shipped', 'delivered', 'cancelled'];
    if (typeof id !== 'string' || !ALLOWED.includes(status)) {
      return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
    }
    const success = await updateOrderStatus(id, status);

    if (success && status === 'on_hold') {
      const order = await getOrderById(id);
      if (order) await notifyAdminOrderIssue(order, 'on_hold');
    }

    // Status-Mail (fehlertolerant — darf das Update nie brechen)
    let mailAccepted: boolean | null = null;
    if (success && ['production', 'shipped', 'delivered'].includes(status)) {
      try {
        const order = await getOrderById(id);
        if (order?.customerEmail) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://on-me-honey-b.vercel.app';
          const mailRes = await fetch(`${siteUrl}/api/email`, {
            method: 'POST',
            redirect: 'manual',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-key': process.env.INTERNAL_API_KEY || '',
            },
            body: JSON.stringify({
              type: status,
              orderId: order.id,
              email: order.customerEmail,
              total: order.amountTotal || 0,
              items: order.items || [],
              locale: order.locale || 'de',
            }),
          });
          const delivery = await readEmailDelivery(mailRes);
          mailAccepted = delivery.accepted;
          if (!delivery.accepted)
            console.error('[orders PATCH] Status-Mail nicht versendet:', { orderId: order.id, reason: delivery.reason, status: delivery.status });
        }
      } catch (mailErr) {
        console.error('Status-Mail fehlgeschlagen (Update bleibt gueltig):', mailErr);
      }
    }

    // mailAccepted: null = keine Mail fällig, true/false = Ergebnis des Mail-Dienstes
    return NextResponse.json({ success, mailAccepted });
  } catch (err: unknown) {
    console.error('[orders PATCH] Fehler:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
