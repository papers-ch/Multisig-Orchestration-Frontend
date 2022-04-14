export interface OperationTemplate {
  id: string
  created_at: string
  updated_at: string
  contract_id: string
  template: any
  name: string
  parameters: OperationTemplateParameter[]
}

export interface OperationTemplateParameter {
  id: string
  created_at: string
  updated_at: string
  operation_template_id: string
  name: string
  parameter_key: string
  parameter_value_type: OperationTemplateParameterType
}

export enum OperationTemplateParameterType {
  NUMBER = 'number',
  STRING = 'string',
  BYTES = 'bytes',
  ADDRESS = 'address',
}

export interface NewOperationTemplate {
  contract_id: string
  template: any
  name: string
  parameters: NewOperationTemplateParameter[]
}

export interface NewOperationTemplateParameter {
  name: string
  parameter_key: string
  parameter_value_type: OperationTemplateParameterType
}

export interface OperationTemplateParameterValue {
  parameter_key: string
  parameter_value: string
}
