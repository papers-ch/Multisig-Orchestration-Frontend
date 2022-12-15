import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { SignableMessageInfo } from 'src/app/services/api/interfaces/common'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { OperationRequest } from 'src/app/services/api/interfaces/operationRequest'
import { CopyService } from 'src/app/services/copy/copy-service.service'

const TZ_ADDRESSES_REGEX =
  /((tz1|tz2|tz3|KT1)[1-9A-Za-z]{33}|zet1[1-9A-Za-z]{65})/g

@Component({
  selector: 'app-modal-item',
  templateUrl: './modal-item.component.html',
  styleUrls: ['./modal-item.component.scss'],
})
export class ModalItemComponent implements OnInit, OnChanges {
  @Input()
  signableMessage!: SignableMessageInfo

  @Input()
  contract!: Contract

  @Input()
  operationRequest?: OperationRequest = undefined

  addressesInLambda: string[] = []

  constructor(
    public bsModalRef: BsModalRef,
    private readonly copyService: CopyService
  ) {}

  ngOnInit(): void {
    this.updateAddressesInLambda()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['operationRequest']
    if (change) {
      this.updateAddressesInLambda()
    }
  }

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  updateAddressesInLambda() {
    if (this.operationRequest) {
      let lambda = JSON.stringify(this.operationRequest.lambda)
      let matches = lambda.match(TZ_ADDRESSES_REGEX)
      if (matches) {
        this.addressesInLambda = [...matches]
      } else {
        this.addressesInLambda = []
      }
    } else {
      this.addressesInLambda = []
    }
  }
}
