import { OperationApproval } from './operationApproval'
import { User } from './user'

export enum OperationRequestKind {
  OPERATION = 'operation',
  CHANGE_KEYS = 'change_keys',
}

export enum OperationRequestState {
  OPEN = 'open',
  APPROVED = 'approved',
  INJECTED = 'injected',
}

export interface OperationRequest {
  id: string
  created_at: string
  updated_at: string
  user: User
  contract_id: string
  lambda: any | null
  threshold: number | null
  proposed_signers: User[] | null
  kind: OperationRequestKind
  counter: number
  state: OperationRequestState
  operation_approvals: OperationApproval[]
  operation_hash: string | null
  description: string | null
}

export interface NewOperationRequest {
  contract_id: string
  lambda: any | null
  threshold: number | null
  proposed_signers: string[] | null
  kind: OperationRequestKind
  ledger_hash: string | null
  description: string | null
}
