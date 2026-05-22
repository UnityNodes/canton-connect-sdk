import type { CantonConfig, Template, Contract } from '@canton-connect/core'

interface StoredContract {
  templateId: string
  payload: unknown
  createdAt: string
}

interface ExercisedChoice {
  contractId: string
  choiceName: string
  args: unknown
}

export interface MockLedger {
  addContract<T>(template: Template<T>, payload: T): string
  removeContract(contractId: string): void
  getContracts<T>(template: Template<T>): Contract<T>[]
  getExercisedChoices(): ExercisedChoice[]
  getCreatedContracts(): Array<{ templateId: string; payload: unknown }>
  getConfig(): CantonConfig
  reset(): void
}

export function createMockLedger(party = 'alice::test'): MockLedger {
  const contracts = new Map<string, StoredContract>()
  const exercised: ExercisedChoice[] = []
  const created: Array<{ templateId: string; payload: unknown }> = []
  let idCounter = 0

  const config: CantonConfig = {
    ledgerUrl: 'http://mock-canton',
    party,
    tokenProvider: () => 'mock-token',
  }

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString()
    const body = init?.body ? JSON.parse(init.body as string) : {}

    if (url.includes('/state/ledger-end')) {
      return new Response(JSON.stringify({ offset: 0 }), { status: 200 })
    }

    if (url.includes('/state/active-contracts')) {
      const lines = Array.from(contracts.entries()).map(([contractId, c]) => ({
        contractEntry: {
          JsActiveContract: {
            createdEvent: {
              contractId,
              templateId: c.templateId,
              createArgument: c.payload,
              createdAt: c.createdAt,
            },
          },
        },
      }))
      return new Response(JSON.stringify(lines), { status: 200 })
    }

    if (url.includes('/commands/submit-and-wait')) {
      const command = body.commands?.[0]
      if (command?.CreateCommand) {
        const { templateId, createArguments } = command.CreateCommand
        const contractId = `#mock-${++idCounter}:0`
        contracts.set(contractId, {
          templateId,
          payload: createArguments,
          createdAt: new Date().toISOString(),
        })
        created.push({ templateId, payload: createArguments })
        return new Response(JSON.stringify({ updateId: `upd-${idCounter}` }), { status: 200 })
      }

      if (command?.ExerciseCommand) {
        const { contractId, choice, choiceArgument } = command.ExerciseCommand
        exercised.push({ contractId, choiceName: choice, args: choiceArgument })
        contracts.delete(contractId)
        return new Response(JSON.stringify({ updateId: `upd-${++idCounter}` }), { status: 200 })
      }
    }

    if (url.match(/\/packages\/[^/]+$/)) {
      return new Response(JSON.stringify({ name: 'unknown' }), { status: 200 })
    }

    if (url.includes('/packages')) {
      return new Response(JSON.stringify({ packageIds: [] }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: 'mock: unknown endpoint' }), { status: 404 })
  }

  return {
    addContract<T>(template: Template<T>, payload: T): string {
      const contractId = `#mock-${++idCounter}:0`
      const templateId =
        template.templateId ?? `mock:${template.moduleName}:${template.entityName}`
      contracts.set(contractId, { templateId, payload, createdAt: new Date().toISOString() })
      return contractId
    },

    removeContract(contractId: string) {
      contracts.delete(contractId)
    },

    getContracts<T>(template: Template<T>): Contract<T>[] {
      const templateId =
        template.templateId ?? `mock:${template.moduleName}:${template.entityName}`
      return Array.from(contracts.entries())
        .filter(([, c]) => c.templateId === templateId)
        .map(([contractId, c]) => ({
          contractId,
          templateId: c.templateId,
          payload: template.decoder(c.payload),
          createdAt: c.createdAt,
        }))
    },

    getExercisedChoices() {
      return [...exercised]
    },

    getCreatedContracts() {
      return [...created]
    },

    getConfig() {
      return config
    },

    reset() {
      contracts.clear()
      exercised.length = 0
      created.length = 0
      idCounter = 0
    },
  }
}
