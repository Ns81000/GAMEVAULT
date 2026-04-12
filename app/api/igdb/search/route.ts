import { NextRequest, NextResponse } from 'next/server'
import { igdbFetch } from '@/lib/igdb'
import { IGDBGame } from '@/types'

function transformCoverUrl(url: string): string {
  return `https:${url.replace('t_thumb', 't_cover_big')}`
}

function transformGame(game: IGDBGame) {
  return {
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
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const id = searchParams.get('id')

    if (!query && !id) {
      return NextResponse.json({ error: 'Query or ID required' }, { status: 400 })
    }

    const fields = 'fields id,name,cover.url,first_release_date,genres.name,rating,platforms.name,summary;'

    let body: string

    if (id && /^\d+$/.test(id)) {
      body = `${fields}\nwhere id = ${id};`
    } else if (query) {
      body = `${fields}\nsearch "${query}";\nlimit 8;`
    } else {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }

    const res = await igdbFetch('games', body)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('IGDB API error:', errorText)
      return NextResponse.json({ error: 'IGDB search failed' }, { status: 502 })
    }

    const data: IGDBGame[] = await res.json()
    const results = data.map(transformGame)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('IGDB search error:', error)
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 })
  }
}
