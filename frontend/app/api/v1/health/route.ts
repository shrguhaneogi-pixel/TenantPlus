import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'TenantPlus Deterministic Engine',
    supabase_connected: false,
    architecture: 'Hybrid Deterministic (AI Vision + Pure Calendar Arithmetic)',
  });
}
