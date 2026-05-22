import { useCantonContext } from '../providers/CantonProvider.js'

export interface PartyInfo {
  party: string | null
  isConnected: boolean
}

export function useParty(): PartyInfo {
  const { config, isConnected } = useCantonContext()
  return {
    party: config?.party ?? null,
    isConnected,
  }
}
