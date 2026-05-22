import {
  getActiveContracts,
  getContractById,
  createContract,
  exerciseChoice,
  getPackages,
  resolvePackageId,
} from '@canton-connect/core'
import type { CantonConfig, Template, Contract } from '@canton-connect/core'

export class NodeLedgerClient {
  constructor(public readonly config: CantonConfig) {}

  getActiveContracts<T>(template: Template<T>): Promise<Contract<T>[]> {
    return getActiveContracts(this.config, template)
  }

  getContractById<T>(template: Template<T>, contractId: string): Promise<Contract<T> | null> {
    return getContractById(this.config, template, contractId)
  }

  createContract<T>(template: Template<T>, payload: T): Promise<string> {
    return createContract(this.config, template, payload)
  }

  exerciseChoice<T, A>(
    template: Template<T>,
    contractId: string,
    choiceName: string,
    args: A,
  ): Promise<string> {
    return exerciseChoice(this.config, template, contractId, choiceName, args)
  }

  getPackages() {
    return getPackages(this.config)
  }

  resolvePackageId(packageName: string): Promise<string> {
    return resolvePackageId(this.config, packageName)
  }
}

export function createNodeClient(config: CantonConfig): NodeLedgerClient {
  return new NodeLedgerClient(config)
}
