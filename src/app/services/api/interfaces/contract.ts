export interface Contract {
  id: string
  created_at: string
  updated_at: string
  address: string
  multisig_address: string
  display_name: string
  min_approvals: number
}
