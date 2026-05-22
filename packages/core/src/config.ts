import type { CantonConfig } from './types.js'

export interface CantonConfigInput {
  ledgerUrl: string
  party: string
  tokenProvider: (() => Promise<string> | string) | string
}

export function createConfig(input: CantonConfigInput): CantonConfig {
  const tokenProvider =
    typeof input.tokenProvider === 'string'
      ? () => input.tokenProvider as string
      : input.tokenProvider

  return {
    ledgerUrl: input.ledgerUrl.replace(/\/$/, ''),
    party: input.party,
    tokenProvider,
  }
}
