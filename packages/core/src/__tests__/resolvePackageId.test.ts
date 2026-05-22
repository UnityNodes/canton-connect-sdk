import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { resolvePackageId, clearResolveCache } from '../actions/resolvePackageId.js'
import type { CantonConfig } from '../types.js'

const config: CantonConfig = {
  ledgerUrl: 'http://localhost:7575',
  party: 'alice::123',
  tokenProvider: () => 'test-token',
}

beforeEach(() => {
  clearResolveCache()
})

describe('resolvePackageId', () => {
  test('finds packageId by name', async () => {
    let callCount = 0
    globalThis.fetch = mock(() => {
      callCount++
      if (callCount === 1)
        return Promise.resolve(
          new Response(JSON.stringify({ packageIds: ['abc123', 'def456'] }), { status: 200 }),
        )
      if (callCount === 2)
        return Promise.resolve(
          new Response(JSON.stringify({ name: 'other-package' }), { status: 200 }),
        )
      return Promise.resolve(
        new Response(JSON.stringify({ name: 'my-daml-project' }), { status: 200 }),
      )
    })

    const result = await resolvePackageId(config, 'my-daml-project')
    expect(result).toBe('def456')
  })

  test('throws if package not found', async () => {
    globalThis.fetch = mock()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ packageIds: ['abc123'] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ name: 'other' }), { status: 200 }),
      )

    await expect(resolvePackageId(config, 'missing-package')).rejects.toThrow('not found')
  })

  test('caches result on repeated calls', async () => {
    let callCount = 0
    globalThis.fetch = mock(() => {
      callCount++
      if (callCount === 1)
        return Promise.resolve(
          new Response(JSON.stringify({ packageIds: ['abc123'] }), { status: 200 }),
        )
      return Promise.resolve(
        new Response(JSON.stringify({ name: 'my-daml-project' }), { status: 200 }),
      )
    })

    await resolvePackageId(config, 'my-daml-project')
    const fetchCallsAfterFirst = callCount
    await resolvePackageId(config, 'my-daml-project')
    expect(callCount).toBe(fetchCallsAfterFirst)
  })
})
