import { TestBed } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { initialState as appInitialState } from '../../app.reducer'
import { ContractService } from './contract.service'

describe('ContractService', () => {
  let service: ContractService
  let storeMock: MockStore<any>
  const initialState = { app: appInitialState }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    })
    service = TestBed.inject(ContractService)
    storeMock = TestBed.inject(MockStore)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
