import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { ActionsSubject, StateObservable } from '@ngrx/store'
import { RenameTemplateModalComponent } from './rename-template-modal.component'
import { FormBuilder } from '@angular/forms'

describe('RenameTemplateModalComponent', () => {
  let component: RenameTemplateModalComponent
  let fixture: ComponentFixture<RenameTemplateModalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenameTemplateModalComponent],
      imports: [ModalModule.forRoot()],
      providers: [
        provideMockStore({}),
        MockStore,
        StateObservable,
        ActionsSubject,
        BsModalService,
        BsModalRef,
        FormBuilder,
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameTemplateModalComponent)
    component = fixture.componentInstance
    component.operationTemplate = {
      id: '',
      created_at: '',
      updated_at: '',
      contract_id: '',
      template: '',
      name: '',
      parameters: [],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
