import { LedgerClient } from '../client/ledger.js'
import type { CantonConfig, CantonPackage } from '../types.js'

interface PackagesResponse {
  packageIds?: string[]
}

export async function getPackages(config: CantonConfig): Promise<CantonPackage[]> {
  const client = new LedgerClient(config)
  const data = await client.get<PackagesResponse>('/packages')
  return (data.packageIds ?? []).map((packageId) => ({ packageId }))
}
