import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { TokenSelectorComponent } from '../token-selector/token-selector.component'
import { TransferFormComponent } from './transfer-form.component'

describe('TransferFormComponent', () => {
  let component: TransferFormComponent
  let fixture: ComponentFixture<TransferFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransferFormComponent, TokenSelectorComponent],
      providers: [FormBuilder],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
