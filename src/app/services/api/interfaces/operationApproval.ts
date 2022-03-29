import { User } from './user'

export interface OperationApproval {
  id: string
  created_at: string
  updated_at: string
  signer: User
  operation_request_id: string
  signature: string
}

export interface NewOperationApproval {
  operation_request_id: string
  signature: string
}
