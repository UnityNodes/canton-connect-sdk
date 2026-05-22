import { describe, test, expect } from 'bun:test'
import { createConfig } from '../config.js'

describe('createConfig', () => {
  test('accepts a static token string', async () => {
    const config = createConfig({
      ledgerUrl: 'http://localhost:7575',
      party: 'alice::123',
      tokenProvider: 'my-token',
    })
    expect(await config.tokenProvider()).toBe('my-token')
  })

  test('accepts a tokenProvider function', async () => {
    const config = createConfig({
      ledgerUrl: 'http://localhost:7575',
      party: 'alice::123',
      tokenProvider: () => Promise.resolve('dynamic-token'),
    })
    expect(await config.tokenProvider()).toBe('dynamic-token')
  })

  test('strips trailing slash from ledgerUrl', () => {
    const config = createConfig({
      ledgerUrl: 'http://localhost:7575/',
      party: 'alice::123',
      tokenProvider: 'token',
    })
    expect(config.ledgerUrl).toBe('http://localhost:7575')
  })
})
