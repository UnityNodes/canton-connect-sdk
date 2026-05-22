import { LedgerClient } from '../client/ledger.js'
import type { CantonConfig, Contract, Template } from '../types.js'

interface CreatedEvent {
  contractId: string
  templateId: string
  createArgument: unknown
  createdAt?: string
}

interface AcsLine {
  contractEntry?: {
    JsActiveContract?: {
      createdEvent: CreatedEvent
    }
  }
}

export async function getActiveContracts<T>(
  config: CantonConfig,
  template: Template<T>,
): Promise<Contract<T>[]> {
  const client = new LedgerClient(config)
  const templateId = template.templateId

  const activeAtOffset = await client.getLedgerEnd()

  const lines = await client.post<AcsLine[]>('/state/active-contracts', {
    filter: {
      filtersByParty: {
        [config.party]: { wildcard: {} },
      },
    },
    verbose: false,
    activeAtOffset,
  })

  return lines
    .map((line) => line.contractEntry?.JsActiveContract)
    .filter((ac): ac is NonNullable<typeof ac> => !!ac)
    .filter((ac) => !templateId || ac.createdEvent.templateId === templateId)
    .map((ac) => ({
      contractId: ac.createdEvent.contractId,
      templateId: ac.createdEvent.templateId,
      payload: template.decoder(ac.createdEvent.createArgument),
      createdAt: ac.createdEvent.createdAt,
    }))
}
