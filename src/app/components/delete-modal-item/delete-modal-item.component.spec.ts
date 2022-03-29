import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActionsSubject, StateObservable } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import {
  OperationRequestKind,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'
import { UserKind, UserState } from 'src/app/services/api/interfaces/user'

import { DeleteModalItemComponent } from './delete-modal-item.component'

describe('DeleteModalItemComponent', () => {
  let component: DeleteModalItemComponent
  let fixture: ComponentFixture<DeleteModalItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [DeleteModalItemComponent],
      providers: [
        provideMockStore({}),
        MockStore,
        StateObservable,
        ActionsSubject,
        BsModalService,
        BsModalRef,
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteModalItemComponent)
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
      lambda: '',
      threshold: null,
      proposed_signers: null,
      operation_hash: null,
      kind: OperationRequestKind.OPERATION,
      counter: 0,
      state: OperationRequestState.OPEN,
      operation_approvals: [
        {
          id: '',
          created_at: '',
          updated_at: '',
          signer: {
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
          operation_request_id: '',
          signature: '',
        },
      ],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
