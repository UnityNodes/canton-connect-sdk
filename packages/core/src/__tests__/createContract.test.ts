import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { createContract } from '../actions/createContract.js'
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

beforeEach(() => {
  globalThis.fetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ updateId: 'upd-123' }), { status: 200 }),
    ),
  )
})

describe('createContract', () => {
  test('returns updateId', async () => {
    const result = await createContract(config, TodoTemplate, {
      owner: 'alice::123',
      text: 'Buy milk',
    })
    expect(result).toBe('upd-123')
  })

  test('throws if template has no templateId', async () => {
    const noIdTemplate: Template<Todo> = { ...TodoTemplate, templateId: undefined }
    expect(createContract(config, noIdTemplate, { owner: '', text: '' })).rejects.toThrow(
      'has no templateId',
    )
  })

  test('sends CreateCommand with correct payload', async () => {
    await createContract(config, TodoTemplate, { owner: 'alice::123', text: 'Buy milk' })
    const body = JSON.parse((globalThis.fetch as any).mock.calls[0][1].body)
    expect(body.commands[0].CreateCommand.templateId).toBe('pkg123:Todo:TodoItem')
    expect(body.commands[0].CreateCommand.createArguments.text).toBe('Buy milk')
  })
})
