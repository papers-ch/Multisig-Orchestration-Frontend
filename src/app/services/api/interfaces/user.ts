export enum UserState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserKind {
  GATEKEEPER = 'gatekeeper',
  SIGNER = 'signer',
  ADMIN = 'admin',
}

export interface User {
  id: string
  created_at: string
  updated_at: string
  address: string
  public_key: string
  contract_id: string
  kind: UserKind
  state: UserState
  display_name: string
}
