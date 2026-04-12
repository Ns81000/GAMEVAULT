import { NextRequest, NextResponse } from 'next/server'
import { igdbFetch } from '@/lib/igdb'
import { IGDBGame } from '@/types'

function transformCoverUrl(url: string): string {
  return `https:${url.replace('t_thumb', 't_cover_big')}`
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id

    if (!gameId || !/^\d+$/.test(gameId)) {
      return NextResponse.json({ error: 'Valid numeric ID required' }, { status: 400 })
    }

    const body = `fields id,name,cover.url,first_release_date,genres.name,rating,platforms.name,summary;\nwhere id = ${gameId};`

    const res = await igdbFetch('games', body)

    if (!res.ok) {
      return NextResponse.json({ error: 'IGDB fetch failed' }, { status: 502 })
    }

    const data: IGDBGame[] = await res.json()

    if (data.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const game = data[0]

    return NextResponse.json({
      id: game.id,
      name: game.name,
      cover_url: game.cover?.url ? transformCoverUrl(game.cover.url) : null,
      release_year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
      genres: game.genres?.map((g) => g.name) ?? [],
      rating: game.rating ? Math.round(game.rating * 10) / 10 : null,
      platforms: game.platforms?.map((p) => p.name) ?? [],
      summary: game.summary ?? null,
    })
  } catch (error) {
    console.error('IGDB game fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}
