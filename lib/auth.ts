export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('gamevault_authenticated') === 'true'
}

export function setAuthenticated(): void {
  localStorage.setItem('gamevault_authenticated', 'true')
}

export function clearAuth(): void {
  localStorage.removeItem('gamevault_authenticated')
}
