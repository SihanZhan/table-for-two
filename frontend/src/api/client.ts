const BASE = '/api'

export interface SessionResponse {
  id: number
  join_code: string
  status: string
  participant_id: number
  location: string
}

export interface ParticipantResponse {
  id: number
  session_id: number
  name: string
  finished: boolean
}

export interface Restaurant {
  id: number
  name: string
  cuisine: string
  price_range: number
  rating: number
  neighborhood: string
  description: string
  image_url: string | null
}

export interface Match {
  restaurant: Restaurant
  explanation: string
}

export interface MatchesResponse {
  session_id: number
  both_finished: boolean
  matches: Match[]
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export const api = {
  createSession: (creator_name: string, location: string) =>
    post<SessionResponse>('/sessions', { creator_name, location }),

  getSessionInfo: (join_code: string) =>
    get<{ location: string; status: string }>(`/sessions/info/${join_code}`),

  joinSession: (join_code: string, name: string) =>
    post<ParticipantResponse>('/sessions/join', { join_code, name }),

  getRestaurants: (participantId: number) =>
    get<Restaurant[]>(`/swipes/restaurants/${participantId}`),

  recordSwipe: (participant_id: number, restaurant_id: number, liked: boolean) =>
    post<{ ok: boolean }>('/swipes', { participant_id, restaurant_id, liked }),

  finishSwiping: (participantId: number) =>
    post<{ ok: boolean }>(`/swipes/finish/${participantId}`, {}),

  getMatches: (sessionId: number) =>
    get<MatchesResponse>(`/matches/${sessionId}`),
}
