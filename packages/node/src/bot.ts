import type { Contract, Template } from '@canton-connect/core'
import type { NodeLedgerClient } from './client.js'

export interface BotOptions<T> {
  template: Template<T>
  onCreated?: (contract: Contract<T>, client: NodeLedgerClient) => Promise<void>
  onArchived?: (contractId: string, client: NodeLedgerClient) => Promise<void>
  pollInterval?: number
}

export interface Bot {
  start(): Promise<void>
  stop(): void
  isRunning(): boolean
}

export function createBot<T>(client: NodeLedgerClient, options: BotOptions<T>): Bot {
  const { template, onCreated, onArchived, pollInterval = 2000 } = options

  let running = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let knownIds = new Set<string>()
  let initialized = false

  async function poll() {
    if (!running) return
    try {
      const contracts = await client.getActiveContracts(template)
      const currentIds = new Set(contracts.map((c) => c.contractId))

      if (initialized) {
        if (onCreated) {
          for (const contract of contracts) {
            if (!knownIds.has(contract.contractId)) {
              await onCreated(contract, client).catch(console.error)
            }
          }
        }
        if (onArchived) {
          for (const id of knownIds) {
            if (!currentIds.has(id)) {
              await onArchived(id, client).catch(console.error)
            }
          }
        }
      }

      knownIds = currentIds
      initialized = true
    } catch (err) {
      console.error('[canton-bot] poll error:', err)
    }

    if (running) timer = setTimeout(poll, pollInterval)
  }

  return {
    async start() {
      if (running) return
      running = true
      await poll()
    },
    stop() {
      running = false
      if (timer) clearTimeout(timer)
    },
    isRunning() {
      return running
    },
  }
}
