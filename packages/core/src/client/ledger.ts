import type { CantonConfig } from '../types.js'

export class LedgerClient {
  constructor(private config: CantonConfig) {}

  async headers(): Promise<Record<string, string>> {
    const token = await this.config.tokenProvider()
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  url(path: string): string {
    return `${this.config.ledgerUrl}/v2${path}`
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'POST',
      headers: await this.headers(),
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message ?? `Canton API error: ${res.status} ${path}`)
    }
    return res.json() as Promise<T>
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'GET',
      headers: await this.headers(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message ?? `Canton API error: ${res.status} ${path}`)
    }
    return res.json() as Promise<T>
  }

  async getLedgerEnd(): Promise<number> {
    const data = await this.get<{ offset: number }>('/state/ledger-end')
    return data.offset
  }
}
