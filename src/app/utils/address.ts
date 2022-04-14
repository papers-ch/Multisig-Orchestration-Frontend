import { Validators } from '@angular/forms'

export const validateAddress = (address: string | undefined | null) => {
  if (
    address === undefined ||
    address === null ||
    address.length !== 36 ||
    (!address.startsWith('tz1') &&
      !address.startsWith('tz2') &&
      !address.startsWith('tz3') &&
      !address.startsWith('KT1'))
  ) {
    throw new Error(`Invalid address: ${address}`)
  }
}

export const createAddressValidators = () => [
  Validators.required,
  Validators.minLength(36),
  Validators.maxLength(36),
  Validators.pattern('^(tz1|tz2|tz3|KT1)[1-9A-Za-z]{33}'),
]
