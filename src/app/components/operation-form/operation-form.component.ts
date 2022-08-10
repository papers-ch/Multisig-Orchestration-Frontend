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
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Observable, Subscription } from 'rxjs'
import { ApiService } from 'src/app/services/api/api.service'
import {
  OperationTemplate,
  OperationTemplateParameter,
  OperationTemplateParameterType,
  OperationTemplateParameterValue,
} from 'src/app/services/api/interfaces/operationTemplate'
import { createAddressValidators } from 'src/app/utils/address'
import {
  convertAmountToBigNumber,
  createAmountValidators,
} from 'src/app/utils/amount'

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss'],
})
export class OperationFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public isGatekeeper: boolean = false
  @Input()
  public isSigner: boolean = false
  @Input()
  public showSpinner: boolean = false
  @Input()
  public templates: OperationTemplate[] = []
  @Input()
  public selectedTemplate: OperationTemplate | undefined = undefined

  @Output()
  public onRequestOperation = new EventEmitter<{
    lambda: any
    ledgerHash: string | null
  }>()
  @Output()
  public onSelectedTemplate = new EventEmitter<OperationTemplate>()

  public formGroup: FormGroup
  public get lambdaControl(): FormControl {
    return this.formGroup.controls.lambdaControl as FormControl
  }
  public get ledgerHashControl(): FormControl {
    return this.formGroup.controls.ledgerHashControl as FormControl
  }

  public get templateSelectionControl(): FormControl {
    return this.formGroup.controls.templateSelectionControl as FormControl
  }

  public get parametersControl(): FormArray {
    return this.formGroup.controls.parametersControl as FormArray
  }

  public get submitDisabled(): boolean {
    return (
      this.showSpinner ||
      (!this.isGatekeeper && !this.isSigner) ||
      !this.formGroup.valid
    )
  }

  private get ledgerHash(): string | null {
    if (this.ledgerHashControl.value === undefined) {
      return null
    }
    const ledgerHash = this.ledgerHashControl.value
    if (typeof ledgerHash !== 'string') {
      return null
    }
    const ledgerHashTrimmed = ledgerHash.trim()
    if (ledgerHashTrimmed.length === 0) {
      return null
    }
    return ledgerHashTrimmed
  }

  private subscriptions: Subscription[] = []

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService
  ) {
    this.formGroup = formBuilder.group({
      templateSelectionControl: formBuilder.control(null),
      lambdaControl: formBuilder.control(null, [Validators.required]),
      ledgerHashControl: formBuilder.control(null),
      parametersControl: formBuilder.array([]),
    })
    const sub = this.templateSelectionControl.valueChanges.subscribe(() => {
      this.onSelectedTemplate.emit(
        this.templates.find(
          (template) => template.id === this.templateSelectionControl.value
        )
      )
    })
    this.subscriptions.push(sub)
  }

  public ngOnInit(): void {}

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['selectedTemplate']
    if (change) {
      this.updateForm()
    }
  }

  public ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe()
    }
  }

  public async operation() {
    let lambda: any = []
    if (this.selectedTemplate !== undefined) {
      const parameters: OperationTemplateParameterValue[] =
        this.selectedTemplate.parameters.map((parameter, index) => ({
          parameter_key: parameter.parameter_key,
          parameter_value: this.parameterValueFor(
            parameter,
            this.parametersControl.controls[index].value
          ),
        }))
      lambda = await this.apiService
        .getLambda(this.selectedTemplate.id, parameters)
        .toPromise()
    } else {
      lambda = JSON.parse(this.lambdaControl.value)
    }
    this.onRequestOperation.emit({
      lambda,
      ledgerHash: this.ledgerHash,
    })
  }

  public parameterTypeToInputType(
    parameterType: OperationTemplateParameterType
  ): string {
    switch (parameterType) {
      case OperationTemplateParameterType.ADDRESS:
        return 'text'
      case OperationTemplateParameterType.BYTES:
        return 'text'
      case OperationTemplateParameterType.NUMBER:
        return 'number'
      case OperationTemplateParameterType.STRING:
        return 'text'
    }
  }

  public labelForParameter(parameter: OperationTemplateParameter): string {
    if (
      parameter.parameter_value_type !== OperationTemplateParameterType.NUMBER
    ) {
      return parameter.name
    }
    return `${parameter.name} (decimals: ${parameter.decimals ?? 0})`
  }

  private parameterValueFor(
    parameter: OperationTemplateParameter,
    rawValue: string
  ): string {
    if (
      parameter.parameter_value_type !== OperationTemplateParameterType.NUMBER
    ) {
      return rawValue
    }
    return convertAmountToBigNumber(rawValue, parameter.decimals ?? 0).toFixed()
  }

  private parameterTypeToFormValidators(
    parameter: OperationTemplateParameter
  ): ValidatorFn[] {
    switch (parameter.parameter_value_type) {
      case OperationTemplateParameterType.ADDRESS:
        return createAddressValidators()
      case OperationTemplateParameterType.BYTES:
        return [Validators.required]
      case OperationTemplateParameterType.NUMBER:
        return createAmountValidators(parameter.decimals)
      case OperationTemplateParameterType.STRING:
        return [Validators.required]
    }
  }

  private updateForm() {
    if (this.selectedTemplate !== undefined) {
      this.lambdaControl.disable()
      this.parametersControl.controls = []
      this.selectedTemplate.parameters.forEach((parameter) => {
        this.parametersControl.push(
          this.formBuilder.control(
            null,
            this.parameterTypeToFormValidators(parameter)
          )
        )
      })
    } else {
      this.lambdaControl.enable()
      this.parametersControl.controls = []
    }
  }
}
