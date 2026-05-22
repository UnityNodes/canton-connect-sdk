import { useMutation, useQueryClient } from '@tanstack/react-query'
import { exerciseChoice } from '@canton-connect/core'
import { useLedgerConfig } from '../providers/CantonProvider.js'
import type { Template } from '../types/index.js'

export interface UseExerciseResult<A> {
  exercise: (contractId: string, args: A) => Promise<string>
  loading: boolean
  error: Error | null
  reset: () => void
}

export function useExercise<T, A>(
  template: Template<T>,
  choiceName: string,
): UseExerciseResult<A> {
  const config = useLedgerConfig()
  const queryClient = useQueryClient()
  const queryKey = template.templateId ?? `${template.moduleName}:${template.entityName}`

  const mutation = useMutation({
    mutationFn: ({ contractId, args }: { contractId: string; args: A }) =>
      exerciseChoice(config, template, contractId, choiceName, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', config.ledgerUrl, queryKey] })
    },
  })

  return {
    exercise: (contractId, args) => mutation.mutateAsync({ contractId, args }),
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  }
}
