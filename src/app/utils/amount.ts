import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'
import BigNumber from 'bignumber.js'

export interface Amount {
  value: BigNumber
  decimals: number
  symbol: string
}

export const convertBigNumberToAmount = (
  balance: BigNumber,
  decimals: number
): string => {
  return balance.shiftedBy(-1 * decimals).toString(10)
}

export const convertAmountToBigNumber = (
  text: string,
  decimals: number
): BigNumber => {
  const bn = new BigNumber(text)
  if (bn.isNaN()) {
    throw new Error(`Invalid amount: ${text}`)
  }
  return bn.shiftedBy(decimals)
}

export function amountValidator(max: BigNumber, decimals: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const current = new BigNumber(control.value).shiftedBy(decimals)
    const isValid = current.lte(max)
    return !isValid ? { invalidValue: { value: control.value } } : null
  }
}

export const createAmountValidators = (balance: Amount | undefined) => [
  Validators.min(0),
  Validators.max(balance?.value.toNumber() ?? 0),
  Validators.required,
  Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
  amountValidator(balance?.value ?? new BigNumber(0), balance?.decimals ?? 0),
]
