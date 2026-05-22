import { LedgerClient } from '../client/ledger.js'
import type { CantonConfig, Template } from '../types.js'

interface SubmitResponse { updateId?: string }

export async function createContract<T>(
  config: CantonConfig,
  template: Template<T>,
  payload: T,
): Promise<string> {
  const client = new LedgerClient(config)

  if (!template.templateId) {
    throw new Error(
      `Template ${template.moduleName}:${template.entityName} has no templateId. ` +
      `Set templateId explicitly or call resolvePackageId first.`,
    )
  }

  const data = await client.post<SubmitResponse>('/commands/submit-and-wait', {
    commands: [
      {
        CreateCommand: {
          templateId: template.templateId,
          createArguments: payload,
        },
      },
    ],
    actAs: [config.party],
    readAs: [config.party],
    commandId: crypto.randomUUID(),
  })

  return data.updateId ?? ''
}
