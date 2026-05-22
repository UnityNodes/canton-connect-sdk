import { LedgerClient } from '../client/ledger.js'
import type { CantonConfig, Template } from '../types.js'

interface SubmitResponse { updateId?: string }

export async function exerciseChoice<T, A>(
  config: CantonConfig,
  template: Template<T>,
  contractId: string,
  choiceName: string,
  args: A,
): Promise<string> {
  const client = new LedgerClient(config)

  if (!template.templateId) {
    throw new Error(
      `Template ${template.moduleName}:${template.entityName} has no templateId.`,
    )
  }

  const data = await client.post<SubmitResponse>('/commands/submit-and-wait', {
    commands: [
      {
        ExerciseCommand: {
          templateId: template.templateId,
          contractId,
          choice: choiceName,
          choiceArgument: args,
        },
      },
    ],
    actAs: [config.party],
    readAs: [config.party],
    commandId: crypto.randomUUID(),
  })

  return data.updateId ?? ''
}
