export interface CantonConfig {
  ledgerUrl: string
  party: string
  tokenProvider: () => Promise<string> | string
}

export interface Template<T> {
  packageName?: string
  moduleName: string
  entityName: string
  templateId?: string
  decoder: (payload: unknown) => T
}

export interface Contract<T> {
  contractId: string
  templateId: string
  payload: T
  createdAt?: string
}

export interface Choice<T, R = void> {
  choiceName: string
  encoder?: (args: T) => unknown
  decoder?: (result: unknown) => R
}

export interface CantonPackage {
  packageId: string
  name?: string
}
