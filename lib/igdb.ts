let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getIGDBToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )

  if (!res.ok) {
    throw new Error('Failed to obtain IGDB token')
  }

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000
  return cachedToken!
}

export async function igdbFetch(endpoint: string, body: string) {
  const token = await getIGDBToken()

  return fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
}
