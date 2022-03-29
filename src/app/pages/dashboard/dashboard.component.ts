import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { combineLatest, Observable, Subscription } from 'rxjs'
import BigNumber from 'bignumber.js'
import {
  convertBigNumberToAmount,
  convertAmountToBigNumber,
  amountValidator,
} from 'src/app/utils/amount'
import { filter, map, take } from 'rxjs/operators'
import { ActivatedRoute, Router } from '@angular/router'
import {
  OperationRequest,
  OperationRequestKind,
} from 'src/app/services/api/interfaces/operationRequest'
import { User } from 'src/app/services/api/interfaces/user'
import { Contract } from 'src/app/services/api/interfaces/contract'
import {
  getActiveAccount,
  getActiveContract,
  getAddress,
  getApprovedOperationRequests,
  getBalance,
  getInjectedOperationRequests,
  getSigners,
  getBusyOperationRequests,
  getOpenOperationRequests,
  getSelectedTab,
  getSessionUser,
  getUsers,
  isGatekeeper,
  isSigner,
  getGatekeepers,
} from 'src/app/app.selectors'
import { Tab } from './tab'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { validateAddress } from 'src/app/utils/address'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { signIn } from 'src/app/common/auth'
import { loadContractsIfNeeded } from 'src/app/common/contracts'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() buttonLabel: string | undefined

  public selectedTab$: Observable<Tab> = new Observable<Tab>()

  public receivingAddressControl: FormControl
  public amountTransferControl: FormControl
  public lambdaControl: FormControl
  public ledgerHashControl: FormControl
  public address$: Observable<string | undefined>

  public openOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public users$: Observable<User[]>
  public signers$: Observable<User[]>

  public isGatekeeper$: Observable<boolean>
  public isSigner$: Observable<boolean>
  public balance$: Observable<BigNumber | undefined>
  public activeContract$: Observable<Contract>

  private subscriptions: Subscription[] = []

  public busyOpeartionRequests$: Observable<boolean>

  public gatekeepers$: Observable<User[]>
  public formGroup: FormGroup

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.store$.dispatch(actions.loadTezosNodes())
    this.activeContract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())

    const signInSub = signIn(this.store$)
    this.subscriptions.push(signInSub)
    this.selectedTab$ = this.store$.select(getSelectedTab)

    this.store$.dispatch(actions.setupBeacon())
    const contractSub = loadContractsIfNeeded(store$)
    this.subscriptions.push(contractSub)

    this.openOperationRequests$ = this.store$.select(getOpenOperationRequests)
    this.approvedOperationRequests$ = this.store$.select(
      getApprovedOperationRequests
    )
    this.injectedOperationRequests$ = this.store$.select(
      getInjectedOperationRequests
    )

    this.users$ = this.store$.select(getUsers)
    this.signers$ = this.store$.select(getSigners)
    this.address$ = this.store$.select(getAddress)
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isSigner$ = this.store$.select(isSigner)
    this.balance$ = this.store$.select(getBalance)
    this.busyOpeartionRequests$ = this.store$.select(getBusyOperationRequests)
    this.gatekeepers$ = this.store$.select(getGatekeepers)
    this.subscriptions.push(
      combineLatest([
        this.activeContract$,
        this.store$.select(getActiveAccount),
        this.store$.select(getSessionUser),
      ])
        .pipe(
          filter(
            ([, activeAccount, sessionUser]) =>
              activeAccount !== undefined && sessionUser !== undefined
          )
        )
        .subscribe(([contract]) => {
          this.store$.dispatch(actions.loadUsers({ contractId: contract.id }))
          this.store$.dispatch(actions.loadOperationRequests())
        })
    )
    this.subscriptions.push(
      combineLatest([
        this.store$.select(getActiveAccount),
        this.store$.select(getActiveContract),
      ])
        .pipe(
          filter(
            ([account, contract]) =>
              account !== undefined && contract !== undefined
          )
        )
        .subscribe(() => {
          this.store$.dispatch(actions.loadBalance())
        })
    )

    this.receivingAddressControl = new FormControl('', [
      Validators.required,
      Validators.minLength(36),
      Validators.maxLength(36),
      Validators.pattern('^(tz1|tz2|tz3|KT1)[1-9A-Za-z]{33}'),
    ])

    this.lambdaControl = new FormControl(null, [Validators.required])

    this.ledgerHashControl = new FormControl()

    this.amountTransferControl = new FormControl()

    this.subscriptions.push(
      combineLatest([this.balance$, this.activeContract$]).subscribe(
        ([balance, contract]) => {
          this.amountTransferControl.setValidators([
            Validators.min(0),
            Validators.max(balance?.toNumber() ?? 0),
            Validators.required,
            Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
            // TODO: get decimals from token metadata
            amountValidator(balance ?? new BigNumber(0), 2),
          ])
          this.amountTransferControl.updateValueAndValidity()
        }
      )
    )

    this.formGroup = this.formBuilder.group({})
  }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params.tab === 'operation') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.OPERATION }))
      } else {
        this.store$.dispatch(actions.selectTab({ tab: Tab.TRANSFER }))
      }
    })
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet())
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

  operation() {
    this.submitOperationRequest(
      OperationRequestKind.OPERATION,
      JSON.parse(this.lambdaControl.value),
      this.ledgerHash
    )
  }

  private submitOperationRequest(
    kind: OperationRequestKind,
    lambda: any,
    ledgerHash: string | null
  ) {
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.submitOperationRequest({
          newOperationRequest: {
            contract_id: contract.id,
            kind,
            lambda,
            threshold: null,
            proposed_signers: null,
            ledger_hash: ledgerHash ?? null,
          },
        })
      )
    })
  }

  transfer() {
    const targetAddress: string | undefined | null =
      this.receivingAddressControl.value
    validateAddress(targetAddress)
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.transferOperation({
          transferAmount: convertAmountToBigNumber(
            this.amountTransferControl.value,
            2 // TODO: get decimals from token metadata
          ),
          receivingAddress: this.receivingAddressControl.value,
        })
      )
    })
  }

  onSelect(event: any): void {
    this.router.navigate(['/', `${event.heading.toLowerCase()}`])
    this.store$.dispatch(actions.selectTab({ tab: event.id }))
  }

  setTransferMaxValue(): void {
    this.setMaxValue(this.balance$, this.amountTransferControl)
  }

  setMaxValue(
    balance: Observable<BigNumber | undefined>,
    formControl: FormControl
  ): void {
    combineLatest([balance, this.store$.select(getActiveContract)])
      .pipe(
        take(1),
        filter(
          ([balance, contract]) =>
            balance !== undefined && contract !== undefined
        ),
        map(([balance, contract]) => ({
          balance: balance!,
          contract: contract!,
        }))
      )
      .subscribe(({ balance, contract }) => {
        formControl.setValue(
          // TODO: get decimals from token metadata
          convertBigNumberToAmount(balance, 2)
        )
      })
  }
}
