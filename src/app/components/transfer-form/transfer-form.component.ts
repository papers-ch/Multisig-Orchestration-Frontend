import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { createAddressValidators } from 'src/app/utils/address'
import {
  Amount,
  convertAmountToBigNumber,
  convertBigNumberToAmount,
  createAmountValidators,
} from 'src/app/utils/amount'
import { BigNumber } from 'bignumber.js'
import { TokenMetadata } from '@taquito/tzip12'
import { TokenSelectorComponent } from '../token-selector/token-selector.component'

@Component({
  selector: 'app-transfer-form',
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.scss'],
})
export class TransferFormComponent implements OnInit, OnChanges {
  @Input()
  public allTokenMetadata: TokenMetadata[] | undefined
  @Input()
  public selectedTokenMetadataIndex: number | undefined
  @Input()
  public balance: Amount | undefined
  @Input()
  public address: string | undefined

  @Output()
  public onSelectedTokenMetadata = new EventEmitter<TokenMetadata>()
  @Output()
  public onTransfer = new EventEmitter<{
    amount: BigNumber
    receivingAddress: string
  }>()

  @ViewChild(TokenSelectorComponent, { static: true })
  private tokenSelector!: TokenSelectorComponent

  public formGroup: FormGroup
  public get receivingAddressControl(): FormControl {
    return this.formGroup.controls.receivingAddressControl as FormControl
  }
  public get amountTransferControl(): FormControl {
    return this.formGroup.controls.amountTransferControl as FormControl
  }

  private get tokenMetadata(): TokenMetadata | undefined {
    const tokenId = Number(this.tokenSelector.tokenControl.value)
    if (!isNaN(tokenId)) {
      return this.allTokenMetadata?.find((token) => token.token_id === tokenId)
    }
    return undefined
  }

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      receivingAddressControl: formBuilder.control(
        null,
        createAddressValidators()
      ),
      amountTransferControl: formBuilder.control(
        null,
        createAmountValidators(this.balance)
      ),
    })
  }

  public ngOnInit(): void {
    this.formGroup.addControl('tokenSelector', this.tokenSelector.formGroup)
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['balance']
    if (change !== undefined && !change.firstChange) {
      setTimeout(() => {
        this.amountTransferControl.setValidators(
          createAmountValidators(this.balance)
        )
        this.amountTransferControl.updateValueAndValidity()
      })
    }
  }

  public selectedTokenMetadata(tokenMetadata: TokenMetadata) {
    this.onSelectedTokenMetadata.emit(tokenMetadata)
  }

  public setTransferMaxValue() {
    this.amountTransferControl.patchValue(
      convertBigNumberToAmount(this.balance!.value, this.balance!.decimals)
    )
  }

  public transfer() {
    const tokenMetadata = this.tokenMetadata!
    this.onTransfer.emit({
      amount: convertAmountToBigNumber(
        this.amountTransferControl.value,
        tokenMetadata.decimals
      ),
      receivingAddress: this.receivingAddressControl.value,
    })
  }
}
