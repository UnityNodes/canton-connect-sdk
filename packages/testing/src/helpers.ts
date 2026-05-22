import type { Template, Contract } from '@canton-connect/core'

export function createMockContract<T>(
  template: Template<T>,
  payload: T,
  contractId = '#mock-contract:0',
): Contract<T> {
  return {
    contractId,
    templateId: template.templateId ?? `mock:${template.moduleName}:${template.entityName}`,
    payload: template.decoder(payload),
    createdAt: new Date().toISOString(),
  }
}
