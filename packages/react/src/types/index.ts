import type { CantonConfig } from '@canton-connect/core'

export type {
  CantonConfig,
  Template,
  Contract,
  Choice,
  CantonPackage,
} from '@canton-connect/core'

export interface CantonContextValue {
  config: CantonConfig | null
  isConnected: boolean
}
