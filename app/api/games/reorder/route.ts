import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { updates } = await req.json()

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Process updates in parallel since Supabase rest API doesn't have partial bulk updates easily
    await Promise.all(
      updates.map((update: { id: string; sort_order: number }) =>
        supabaseServer.from('games').update({ sort_order: update.sort_order }).eq('id', update.id)
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
