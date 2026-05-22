import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { getActiveContracts } from '../actions/getActiveContracts.js'
import type { CantonConfig, Template } from '../types.js'

interface Todo { owner: string; text: string }

const TodoTemplate: Template<Todo> = {
  moduleName: 'Todo',
  entityName: 'TodoItem',
  templateId: 'pkg123:Todo:TodoItem',
  decoder: (raw) => raw as Todo,
}

const config: CantonConfig = {
  ledgerUrl: 'http://localhost:7575',
  party: 'alice::123',
  tokenProvider: () => 'test-token',
}

const mockResponse = {
  activeContracts: [
    {
      contractId: 'cid1',
      templateId: 'pkg123:Todo:TodoItem',
      payload: { owner: 'alice::123', text: 'Buy milk' },
    },
    {
      contractId: 'cid2',
      templateId: 'other:Module:Other',
      payload: { foo: 'bar' },
    },
  ],
}

beforeEach(() => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })),
  )
})

describe('getActiveContracts', () => {
  test('returns only contracts matching the template', async () => {
    const result = await getActiveContracts(config, TodoTemplate)
    expect(result).toHaveLength(1)
    expect(result[0].contractId).toBe('cid1')
    expect(result[0].payload.text).toBe('Buy milk')
  })

  test('sends correct Authorization header', async () => {
    await getActiveContracts(config, TodoTemplate)
    const call = (globalThis.fetch as any).mock.calls[0]
    expect(call[1].headers.Authorization).toBe('Bearer test-token')
  })
})
