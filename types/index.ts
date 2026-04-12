export interface Game {
  id: string
  igdb_id: number
  title: string
  cover_url: string | null
  release_year: number | null
  genres: string[] | null
  rating: number | null
  platforms: string[] | null
  summary: string | null
  download_link: string
  save_link: string | null
  created_at: string
  sort_order?: number
}

export interface IGDBGame {
  id: number
  name: string
  cover?: { url: string }
  first_release_date?: number
  genres?: { name: string }[]
  rating?: number
  platforms?: { name: string }[]
  summary?: string
}

export interface AddGamePayload {
  igdb_id: number
  title: string
  cover_url: string
  release_year: number
  genres: string[]
  rating: number
  platforms: string[]
  summary: string
  download_link: string
  save_link?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

export type ViewMode = 'grid' | 'list'
