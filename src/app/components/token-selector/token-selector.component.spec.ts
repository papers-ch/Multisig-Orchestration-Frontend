import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'

import { TokenSelectorComponent } from './token-selector.component'

describe('TokenSelectorComponent', () => {
  let component: TokenSelectorComponent
  let fixture: ComponentFixture<TokenSelectorComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenSelectorComponent],
      providers: [FormBuilder],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
