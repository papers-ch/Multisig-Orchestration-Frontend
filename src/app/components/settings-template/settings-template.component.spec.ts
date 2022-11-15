import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal'

import { SettingsTemplateComponent } from './settings-template.component'

describe('SettingsTemplateComponent', () => {
  let component: SettingsTemplateComponent
  let fixture: ComponentFixture<SettingsTemplateComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsTemplateComponent],
      imports: [ModalModule.forRoot()],
      providers: [FormBuilder, BsModalService, BsModalRef],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsTemplateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
