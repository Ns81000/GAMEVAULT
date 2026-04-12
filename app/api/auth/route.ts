import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const email = process.env.ADMIN_EMAIL
    if (!email) {
      return NextResponse.json({ error: 'Server configuration error: Missing ADMIN_EMAIL' }, { status: 500 })
    }

    // Verify the password against Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Password was correct, grant access
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
