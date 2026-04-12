import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('games')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
    }

    return NextResponse.json({ games: data })
  } catch (error) {
    console.error('Games GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      igdb_id,
      title,
      cover_url,
      release_year,
      genres,
      rating,
      platforms,
      summary,
      download_link,
      save_link,
    } = body

    if (!igdb_id || !title || !download_link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabaseServer
      .from('games')
      .select('id')
      .eq('igdb_id', igdb_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Game already in library' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseServer.from('games').insert({
      igdb_id,
      title,
      cover_url,
      release_year,
      genres,
      rating,
      platforms,
      summary,
      download_link,
      save_link: save_link || null,
    }).select().single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to add game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ game: data }, { status: 201 })
  } catch (error) {
    console.error('Games POST error:', error)
    return NextResponse.json({ error: 'Failed to add game' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, download_link, save_link } = body

    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 })
    }

    const updateData: Record<string, string | null> = {}
    if (download_link !== undefined) updateData.download_link = download_link
    if (save_link !== undefined) updateData.save_link = save_link || null

    const { data, error } = await supabaseServer
      .from('games')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ game: data })
  } catch (error) {
    console.error('Games PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('games')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Games DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}
