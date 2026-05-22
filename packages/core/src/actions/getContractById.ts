import type { CantonConfig, Contract, Template } from '../types.js'
import { getActiveContracts } from './getActiveContracts.js'

export async function getContractById<T>(
  config: CantonConfig,
  template: Template<T>,
  contractId: string,
): Promise<Contract<T> | null> {
  const all = await getActiveContracts(config, template)
  return all.find((c) => c.contractId === contractId) ?? null
}
