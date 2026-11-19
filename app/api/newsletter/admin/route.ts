import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterSubscribers, initDb } from '@/lib/db';
import { isAdminRequest } from "@/lib/admin-auth";

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDb(); initialized = true; }
}

function checkAdminAuth(request: NextRequest): boolean {
  return isAdminRequest(request);
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureInit();
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json({ subscribers });
}
