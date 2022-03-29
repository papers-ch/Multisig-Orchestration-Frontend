export interface PagedResponse<T> {
  page: number
  total_pages: number
  results: T[]
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export interface SignableMessageInfo {
  message: string
  tezos_client_command: string
  blake2b_hash: string
}
