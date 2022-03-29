import { InjectionToken } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
  StoreModule,
} from '@ngrx/store'
import { ROOT_REDUCERS } from 'src/app/reducers'

import { OperationRequestComponent } from './operation-request.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { UserKind, UserState } from 'src/app/services/api/interfaces/user'
import {
  OperationRequestKind,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'
import { ShortenPipe } from 'src/app/pipes/shorten.pipe'
import { AmountConverterPipe } from 'src/app/pipes/amount.pipe'
import { initialState as appInitialState, State } from '../../app.reducer'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

describe('OperationRequestComponent', () => {
  let component: OperationRequestComponent
  let fixture: ComponentFixture<OperationRequestComponent>
  const initialState: { app: State } = {
    app: {
      ...appInitialState,
      activeContract: {
        id: '',
        created_at: '',
        updated_at: '',
        address: '',
        min_approvals: 2,
        multisig_address: '',
        display_name: '',
      },
    },
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), StoreModule.forRoot(ROOT_REDUCERS)],
      declarations: [
        OperationRequestComponent,
        ShortenPipe,
        AmountConverterPipe,
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        MockStore,
        StateObservable,
        ActionsSubject,
        ReducerManager,
        ReducerManagerDispatcher,
        { provide: InjectionToken, useValue: ROOT_REDUCERS },
        BsModalService,
        BsModalRef,
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationRequestComponent)
    component = fixture.componentInstance
    component.operationRequest = {
      id: '',
      created_at: '',
      updated_at: '',
      user: {
        id: '',
        created_at: '',
        updated_at: '',
        address: '',
        public_key: '',
        contract_id: '',
        kind: UserKind.GATEKEEPER,
        state: UserState.ACTIVE,
        display_name: '',
      },
      contract_id: '',
      lambda: null,
      threshold: 2,
      proposed_signers: [],
      kind: OperationRequestKind.OPERATION,
      counter: 0,
      state: OperationRequestState.OPEN,
      operation_approvals: [],
      operation_hash: '',
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
