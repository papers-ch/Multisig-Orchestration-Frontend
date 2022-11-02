import { Component, Input, OnInit } from '@angular/core'
import { OperationTemplate } from 'src/app/services/api/interfaces/operationTemplate'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'app-rename-template-modal',
  templateUrl: './rename-template-modal.component.html',
  styleUrls: ['./rename-template-modal.component.scss'],
})
export class RenameTemplateModalComponent implements OnInit {
  @Input()
  operationTemplate!: OperationTemplate

  public formGroup: FormGroup

  public get templateNameControl(): FormControl {
    return this.formGroup.get('templateName') as FormControl
  }

  constructor(
    public bsModalRef: BsModalRef,
    private readonly store$: Store<fromRoot.State>,
    formBuilder: FormBuilder
  ) {
    this.formGroup = formBuilder.group({
      templateName: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
      ]),
    })
  }

  ngOnInit(): void {
    this.templateNameControl.patchValue(this.operationTemplate.name)
  }

  rename() {
    this.store$.dispatch(
      actions.renameOperationTemplate({
        template: this.operationTemplate,
        name: this.templateNameControl.value,
      })
    )
  }
}
