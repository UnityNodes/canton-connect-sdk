import { describe, test, expect, beforeEach } from 'bun:test'
import { createMockLedger } from '../mock-ledger.js'
import { getActiveContracts, createContract, exerciseChoice } from '@canton-connect/core'
import type { Template } from '@canton-connect/core'

interface Todo { owner: string; text: string }

const TodoTemplate: Template<Todo> = {
  moduleName: 'Todo',
  entityName: 'TodoItem',
  templateId: 'pkg:Todo:TodoItem',
  decoder: (raw) => raw as Todo,
}

let ledger = createMockLedger()

beforeEach(() => {
  ledger = createMockLedger()
})

describe('MockLedger', () => {
  test('addContract + getActiveContracts returns correct contract', async () => {
    ledger.addContract(TodoTemplate, { owner: 'alice::test', text: 'Buy milk' })
    const contracts = await getActiveContracts(ledger.getConfig(), TodoTemplate)
    expect(contracts).toHaveLength(1)
    expect(contracts[0].payload.text).toBe('Buy milk')
  })

  test('createContract via API stores contract in mock', async () => {
    const config = ledger.getConfig()
    await createContract(config, TodoTemplate, { owner: 'alice::test', text: 'Walk dog' })
    expect(ledger.getContracts(TodoTemplate)).toHaveLength(1)
    expect(ledger.getCreatedContracts()).toHaveLength(1)
  })

  test('exerciseChoice archives contract and records in exercised', async () => {
    const config = ledger.getConfig()
    const contractId = ledger.addContract(TodoTemplate, { owner: 'alice::test', text: 'Test' })
    await exerciseChoice(config, TodoTemplate, contractId, 'Complete', {})
    expect(ledger.getContracts(TodoTemplate)).toHaveLength(0)
    expect(ledger.getExercisedChoices()[0].choiceName).toBe('Complete')
  })
})
