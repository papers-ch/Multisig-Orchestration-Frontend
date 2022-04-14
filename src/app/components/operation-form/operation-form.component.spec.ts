import { HttpClient, HttpHandler } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { ApiService } from 'src/app/services/api/api.service'

import { OperationFormComponent } from './operation-form.component'

describe('OperationFormComponent', () => {
  let component: OperationFormComponent
  let fixture: ComponentFixture<OperationFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationFormComponent],
      providers: [FormBuilder, ApiService, HttpClient, HttpHandler],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
