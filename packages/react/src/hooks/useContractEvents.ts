import { useEffect, useRef } from 'react'
import { useContracts } from './useContracts.js'
import type { Contract, Template } from '../types/index.js'

export interface UseContractEventsOptions<T> {
  onCreated?: (contract: Contract<T>) => void
  onArchived?: (contractId: string) => void
  interval?: number
  enabled?: boolean
}

export function useContractEvents<T>(
  template: Template<T>,
  options: UseContractEventsOptions<T> = {},
): void {
  const { onCreated, onArchived, interval = 3000, enabled = true } = options
  const { data } = useContracts<T>(template, { live: true, refetchInterval: interval, enabled })
  const prevIds = useRef<Set<string>>(new Set())
  const onCreatedRef = useRef(onCreated)
  const onArchivedRef = useRef(onArchived)

  onCreatedRef.current = onCreated
  onArchivedRef.current = onArchived

  useEffect(() => {
    const currentIds = new Set(data.map((c) => c.contractId))

    if (prevIds.current.size > 0) {
      for (const contract of data) {
        if (!prevIds.current.has(contract.contractId)) {
          onCreatedRef.current?.(contract)
        }
      }
      for (const id of prevIds.current) {
        if (!currentIds.has(id)) {
          onArchivedRef.current?.(id)
        }
      }
    }

    prevIds.current = currentIds
  }, [data])
}
