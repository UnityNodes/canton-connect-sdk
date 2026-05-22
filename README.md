# Canton Connect

wagmi-style React hooks for [Canton Network](https://www.canton.network/) Ledger API v2.

`@daml/react` is deprecated and does not support Canton 3.x. Canton Connect fills that gap with a modern, typed SDK built from scratch for Ledger API v2.

**Live demo:** [connect.unitynodes.com](https://connect.unitynodes.com)

> **Status:** Early development. Not yet published to npm.

---

## Packages

| Package | Description |
|---|---|
| [`@canton-connect/core`](./packages/core) | Framework-agnostic Ledger API v2 client |
| [`@canton-connect/react`](./packages/react) | React hooks |
| [`@canton-connect/node`](./packages/node) | Node.js client for bots and automation |
| [`@canton-connect/testing`](./packages/testing) | Mock ledger for testing |

---

## Usage

### 1. Wrap your app

```tsx
import { CantonProvider } from '@canton-connect/react'
import { createConfig } from '@canton-connect/core'

const config = createConfig({
  ledgerUrl: 'https://your-canton-node.com',
  party: 'Alice::abc123',
  tokenProvider: () => getAuthToken(),
})

export function App() {
  return (
    <CantonProvider config={config}>
      <YourApp />
    </CantonProvider>
  )
}
```

### 2. Query contracts

```tsx
import { useContracts } from '@canton-connect/react'

const MyTemplate = {
  moduleName: 'MyModule',
  entityName: 'MyContract',
  templateId: 'pkg123:MyModule:MyContract',
  decoder: (raw) => raw as MyContract,
}

function MyComponent() {
  const { data, loading } = useContracts(MyTemplate)

  if (loading) return <p>Loading...</p>
  return <ul>{data.map(c => <li key={c.contractId}>{c.contractId}</li>)}</ul>
}
```

### 3. Create a contract

```tsx
import { useCreate } from '@canton-connect/react'

function CreateForm() {
  const { create, loading } = useCreate(MyTemplate)

  return (
    <button onClick={() => create({ owner: 'Alice::abc123', text: 'Hello' })}>
      {loading ? 'Creating...' : 'Create'}
    </button>
  )
}
```

### 4. Exercise a choice

```tsx
import { useExercise } from '@canton-connect/react'

function ContractRow({ contractId }) {
  const { exercise } = useExercise(MyTemplate, 'Archive')

  return <button onClick={() => exercise(contractId, {})}>Archive</button>
}
```

### 5. React to contract events

```tsx
import { useContractEvents } from '@canton-connect/react'

useContractEvents(MyTemplate, {
  onCreated: (contract) => console.log('created', contract.contractId),
  onArchived: (contractId) => console.log('archived', contractId),
  interval: 3000,
})
```

---

## Hooks

| Hook | Description |
|---|---|
| `useContracts(template, options?)` | Fetch active contracts for a template |
| `useContract(template, contractId)` | Fetch a single contract by ID |
| `useCreate(template)` | Create a new contract |
| `useExercise(template, choiceName)` | Exercise a choice on a contract |
| `useParty()` | Get the current party info |
| `usePackages()` | List available DAML packages |
| `useContractEvents(template, options?)` | Callback-based contract event subscription |

---

## Auth

Pass any JWT token provider:

```ts
// Static token
createConfig({ ..., tokenProvider: 'my-jwt-token' })

// Auth0
createConfig({ ..., tokenProvider: () => auth0Client.getTokenSilently() })

// Custom async
createConfig({ ..., tokenProvider: async () => fetchToken() })
```

---

## Node.js

```ts
import { NodeLedgerClient } from '@canton-connect/node'

const client = new NodeLedgerClient({
  ledgerUrl: 'https://your-canton-node.com',
  party: 'Alice::abc123',
  tokenProvider: () => getToken(),
})

const contracts = await client.getActiveContracts(MyTemplate)
```

---

## Testing

```ts
import { createMockLedger } from '@canton-connect/testing'
import { getActiveContracts } from '@canton-connect/core'

const ledger = createMockLedger()
ledger.addContract(MyTemplate, { owner: 'alice::test', text: 'Hello' })

const contracts = await getActiveContracts(ledger.getConfig(), MyTemplate)
// contracts.length === 1
```

---

## License

Apache-2.0
