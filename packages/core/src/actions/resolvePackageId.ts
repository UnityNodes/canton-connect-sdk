import { LedgerClient } from '../client/ledger.js'
import type { CantonConfig } from '../types.js'

interface PackageStatusResponse {
  packageStatus?: string
  name?: string
}

const cache = new Map<string, string>()

export async function resolvePackageId(
  config: CantonConfig,
  packageName: string,
): Promise<string> {
  const cacheKey = `${config.ledgerUrl}:${packageName}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  const client = new LedgerClient(config)

  const packagesRes = await client.get<{ packageIds?: string[] }>('/packages')
  const packageIds = packagesRes.packageIds ?? []

  for (const packageId of packageIds) {
    try {
      const meta = await client.get<PackageStatusResponse>(`/packages/${packageId}`)
      if (meta.name === packageName) {
        cache.set(cacheKey, packageId)
        return packageId
      }
    } catch {
    }
  }

  throw new Error(
    `Package "${packageName}" not found on Canton node ${config.ledgerUrl}. ` +
    `Available packages: ${packageIds.join(', ')}`,
  )
}

export function clearResolveCache(): void {
  cache.clear()
}
