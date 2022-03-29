import { InjectionToken } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
  StoreModule,
} from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { ModalModule } from 'ngx-bootstrap/modal'
import { ROOT_REDUCERS } from 'src/app/reducers'
import {
  OperationRequestKind,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'

import { OperationRequestListComponent } from './operation-request-list.component'

describe('OperationRequestListComponent', () => {
  let component: OperationRequestListComponent
  let fixture: ComponentFixture<OperationRequestListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), StoreModule.forRoot(ROOT_REDUCERS)],
      declarations: [OperationRequestListComponent],
      providers: [
        provideMockStore({}),
        MockStore,
        StateObservable,
        ActionsSubject,
        ReducerManager,
        ReducerManagerDispatcher,
        { provide: InjectionToken, useValue: ROOT_REDUCERS },
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationRequestListComponent)
    component = fixture.componentInstance
    component.title = ''
    component.kind = OperationRequestKind.OPERATION
    component.state = OperationRequestState.OPEN
    component.operationRequestList = { page: 1, total_pages: 1, results: [] }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
