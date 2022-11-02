import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { BsModalService } from 'ngx-bootstrap/modal'
import { Subscription } from 'rxjs'
import { Contract } from 'src/app/services/api/interfaces/contract'
import {
  NewOperationTemplate,
  NewOperationTemplateParameter,
  OperationTemplate,
  OperationTemplateParameterType,
} from 'src/app/services/api/interfaces/operationTemplate'
import { RenameTemplateModalComponent } from '../rename-template-modal/rename-template-modal.component'

@Component({
  selector: 'app-settings-template',
  templateUrl: './settings-template.component.html',
  styleUrls: ['./settings-template.component.scss'],
})
export class SettingsTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public contract!: Contract
  @Input()
  public templates!: OperationTemplate[]
  @Input()
  public selectedTemplate: OperationTemplate | undefined

  @Output()
  public onSelectedTemplate = new EventEmitter<OperationTemplate>()
  @Output()
  public onAddTemplate = new EventEmitter<NewOperationTemplate>()
  @Output()
  public onRemoveTemplate = new EventEmitter<OperationTemplate>()

  public formGroup: FormGroup

  public get templateSelectionControl(): FormControl {
    return this.formGroup.controls.templateSelectionControl as FormControl
  }

  public get lambdaTemplateControl(): FormControl {
    return this.formGroup.controls.lambdaTemplateControl as FormControl
  }

  public get templateNameControl(): FormControl {
    return this.formGroup.controls.templateNameControl as FormControl
  }

  public get templateParameterControls(): FormArray {
    return this.formGroup.controls.templateParameterControls as FormArray
  }

  private subscriptions: Subscription[] = []

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly modalService: BsModalService
  ) {
    this.formGroup = formBuilder.group({
      templateSelectionControl: formBuilder.control(null),
      lambdaTemplateControl: formBuilder.control(null, [Validators.required]),
      templateNameControl: formBuilder.control(null, [Validators.required]),
      templateParameterControls: formBuilder.array([]),
    })
    const templateSelectionSub =
      this.templateSelectionControl.valueChanges.subscribe(() =>
        this.onSelectedTemplate.emit(
          this.templates.find(
            (template) => template.id === this.templateSelectionControl.value
          )
        )
      )
    this.subscriptions.push(templateSelectionSub)
  }

  public ngOnInit(): void {}

  public ngOnChanges(changes: SimpleChanges): void {}

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  public addParameter() {
    this.templateParameterControls.push(
      this.formBuilder.group({
        nameControl: this.formBuilder.control(null, [Validators.required]),
        keyControl: this.formBuilder.control(null, [Validators.required]),
        typeControl: this.formBuilder.control(null, [Validators.required]),
        decimalsControl: this.formBuilder.control(null, []),
      })
    )
  }

  public removeParameter(index: number) {
    this.templateParameterControls.removeAt(index)
  }

  public addTemplate() {
    const parameters: NewOperationTemplateParameter[] = []
    for (const control of this.templateParameterControls.controls) {
      const form = control as FormGroup
      const parameterValueType = form.controls.typeControl
        .value as OperationTemplateParameterType
      const decimals =
        parameterValueType === OperationTemplateParameterType.NUMBER &&
        form.controls.decimalsControl.value
          ? Number(form.controls.decimalsControl.value)
          : null
      parameters.push({
        name: form.controls.nameControl.value as string,
        parameter_key: form.controls.keyControl.value as string,
        parameter_value_type: parameterValueType,
        decimals,
      })
    }
    const newTemplate: NewOperationTemplate = {
      contract_id: this.contract.id,
      name: this.templateNameControl.value,
      template: JSON.parse(this.lambdaTemplateControl.value),
      parameters,
    }
    this.onAddTemplate.emit(newTemplate)
  }

  public removeTemplate() {
    if (this.selectedTemplate) {
      this.onRemoveTemplate.emit(this.selectedTemplate)
    }
  }

  public renameTemplate() {
    this.modalService.show(RenameTemplateModalComponent, {
      class: 'modal-lg',
      initialState: {
        operationTemplate: this.selectedTemplate,
      },
    })
  }
}
