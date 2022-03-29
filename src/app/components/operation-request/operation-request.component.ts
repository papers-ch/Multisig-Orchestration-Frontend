import { Component, Input, OnInit } from '@angular/core'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ModalItemComponent } from 'src/app/components/modal-item/modal-item.component'

import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Store } from '@ngrx/store'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, switchMap, take } from 'rxjs/operators'
import { User } from 'src/app/services/api/interfaces/user'
import {
  OperationRequest,
  OperationRequestState,
} from 'src/app/services/api/interfaces/operationRequest'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { DeleteModalItemComponent } from '../delete-modal-item/delete-modal-item.component'
import {
  getActiveContract,
  getAddress,
  getSigners,
  isGatekeeper,
  isSigner,
} from 'src/app/app.selectors'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { CopyService } from 'src/app/services/copy/copy-service.service'
import { ShortenPipe } from 'src/app/pipes/shorten.pipe'
import { UploadSignatureComponent } from '../upload-signature/upload-signature.component'

export interface UserWithApproval extends User {
  requestId: string
  isCurrentUser: boolean
  hasApproval: boolean
}

@Component({
  selector: 'operation-request[operationRequest]',
  templateUrl: './operation-request.component.html',
  styleUrls: ['./operation-request.component.scss'],
})
export class OperationRequestComponent implements OnInit {
  @Input()
  public operationRequest!: OperationRequest

  public address$: Observable<string>
  public isGatekeeper$: Observable<boolean>
  public isSigner$: Observable<boolean>
  public signers$: Observable<User[]>
  public contract$: Observable<Contract>

  public currentUserApproved$: Observable<boolean>
  public multisigItems$!: Observable<UserWithApproval[]>

  public contractCounter$: Observable<number> = new Observable()

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly modalService: BsModalService,
    private readonly copyService: CopyService,
    private readonly shortenPipe: ShortenPipe
  ) {
    this.address$ = this.store$.select(getAddress).pipe(isNotNullOrUndefined())
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isSigner$ = this.store$.select(isSigner)
    this.signers$ = this.store$.select(getSigners)
    this.contract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())
    this.currentUserApproved$ = this.address$.pipe(
      map((address) =>
        this.operationRequest.operation_approvals.some(
          (approval) => approval.signer.address === address
        )
      )
    )
  }

  async ngOnInit(): Promise<void> {
    const operationRequestId = this.operationRequest.id
    if (this.operationRequest.state !== OperationRequestState.INJECTED) {
      this.multisigItems$ = combineLatest([this.signers$, this.address$]).pipe(
        map(([signers, address]) =>
          signers.map((user) => ({
            ...user,
            requestId: operationRequestId,
            isCurrentUser: user.address === address,
            hasApproval: this.operationRequest.operation_approvals.some(
              (approval) => approval.signer.id === user.id
            ),
            updated_at:
              this.operationRequest.operation_approvals.find(
                (operationApproval) => operationApproval.signer.id === user.id
              )?.created_at ?? '',
          }))
        )
      )
    } else {
      this.multisigItems$ = this.address$.pipe(
        map((address) =>
          this.operationRequest.operation_approvals.map((approval) => ({
            ...approval.signer,
            requestId: operationRequestId,
            isCurrentUser: approval.signer.address === address,
            hasApproval: true,
          }))
        )
      )
    }
    this.contractCounter$ = this.contract$.pipe(
      switchMap((contract) =>
        this.store$
          .select((state) => state.app.contractCounters.get(contract.id))
          .pipe(
            filter((value) => value !== undefined),
            map((value) => value!)
          )
      )
    )
  }

  public submitOperation() {
    this.store$.dispatch(
      actions.getOperationRequestParameters({
        operationRequest: this.operationRequest,
      })
    )
  }

  public approveOperationRequest() {
    this.store$.dispatch(
      actions.getSignableMessage({
        operationRequestId: this.operationRequest.id,
      })
    )
    this.store$
      .select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      )
      .pipe(
        filter((signableMessage) => signableMessage !== undefined),
        map((signableMessage) => signableMessage!),
        take(1)
      )
      .subscribe((signableMessage) => {
        return this.store$.dispatch(
          actions.approveOperationRequest({
            signableMessage,
            operationRequest: this.operationRequest,
          })
        )
      })
  }

  public openModal(uploadSignature = false) {
    this.store$
      .select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      )
      .pipe(take(1))
      .subscribe((signableMessage) => {
        if (signableMessage === undefined) {
          this.store$.dispatch(
            actions.getSignableMessage({
              operationRequestId: this.operationRequest.id,
            })
          )
        }
      })
    combineLatest([
      this.store$.select((state) =>
        state.app.signableMessages.get(this.operationRequest.id)
      ),
      this.contract$,
    ])
      .pipe(
        filter(([signableMessage]) => signableMessage !== undefined),
        map(([signableMessage, contract]) => ({
          signableMessage: signableMessage!,
          contract,
        })),
        take(1)
      )
      .subscribe(({ signableMessage, contract }) => {
        if (uploadSignature) {
          this.modalService.show(UploadSignatureComponent, {
            class: 'modal-lg',
            initialState: {
              signableMessage,
              operationRequest: this.operationRequest,
            },
          })
        } else {
          this.modalService.show(ModalItemComponent, {
            class: 'modal-lg',
            initialState: {
              signableMessage,
              contract,
            },
          })
        }
      })
  }

  public delete() {
    const contractCounters$ = this.store$.select(
      (state) => state.app.contractCounters
    )

    this.modalService.show(DeleteModalItemComponent, {
      class: 'modal-lg',
      initialState: {
        operationRequest: this.operationRequest,
        contractCounters$: contractCounters$,
      },
    })
  }

  public markInjected() {
    this.store$.dispatch(
      actions.updateOperationRequestStateToInjected({
        operationRequest: this.operationRequest,
        injectedOperationHash: null,
      })
    )
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }
}
