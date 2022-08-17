import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { combineLatest, Observable, Subscription } from 'rxjs'
import BigNumber from 'bignumber.js'
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
  getInjectedOperationRequests,
  getSigners,
  getBusyOperationRequests,
  getOpenOperationRequests,
  getSelectedTab,
  getSessionUser,
  isGatekeeper,
  isSigner,
  getGatekeepers,
  getActiveTokenMetadata,
  getSelectedOperationTemplate,
  getOperationTemplates,
} from 'src/app/app.selectors'
import { Tab } from './tab'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { signIn } from 'src/app/common/auth'
import { loadContractsIfNeeded } from 'src/app/common/contracts'
import { TokenMetadata } from '@taquito/tzip12'
import {
  OperationTemplate,
  OperationTemplateParameter,
  OperationTemplateParameterType,
  OperationTemplateParameterValue,
} from 'src/app/services/api/interfaces/operationTemplate'
import { ShortenPipe } from 'src/app/pipes/shorten.pipe'
import {
  convertAmountToBigNumber,
  convertBigNumberToAmount,
} from 'src/app/utils/amount'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() buttonLabel: string | undefined

  public selectedTab$: Observable<Tab> = new Observable<Tab>()

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

  public operationTemplates$: Observable<OperationTemplate[]>
  public selectedOperationTemplate$: Observable<OperationTemplate | undefined>

  public signers$: Observable<User[]>
  public gatekeepers$: Observable<User[]>
  public isGatekeeper$: Observable<boolean>
  public isSigner$: Observable<boolean>
  public activeContract$: Observable<Contract>
  public busyOpeartionRequests$: Observable<boolean>

  private subscriptions: Subscription[] = []

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly route: ActivatedRoute,
    private router: Router,
    private shorten: ShortenPipe
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

    const templatesSub = this.activeContract$.subscribe(() =>
      this.store$.dispatch(actions.loadOperationTemplates())
    )
    this.subscriptions.push(templatesSub)

    this.operationTemplates$ = this.store$.select(getOperationTemplates)
    this.selectedOperationTemplate$ = this.store$.select(
      getSelectedOperationTemplate
    )

    this.signers$ = this.store$.select(getSigners)
    this.address$ = this.store$.select(getAddress)
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isSigner$ = this.store$.select(isSigner)
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
          this.store$.dispatch(actions.loadOperationTemplates())
        })
    )
    this.subscriptions.push(
      combineLatest([
        this.store$.select(getActiveAccount),
        this.store$.select(getActiveTokenMetadata),
      ])
        .pipe(
          filter(
            ([account, tokenMetadata]) =>
              account !== undefined && tokenMetadata !== undefined
          )
        )
        .subscribe(() => {
          this.store$.dispatch(actions.loadBalance())
        })
    )
  }

  public ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params.tab === 'operation') {
        this.store$.dispatch(actions.selectTab({ tab: Tab.OPERATION }))
      } else {
        this.store$.dispatch(actions.selectTab({ tab: Tab.OPERATION }))
      }
    })
  }

  public ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  public operation(options: {
    lambda: any
    ledgerHash: string | null
    templateName: string | null
    parametersInfo: {
      parameter: OperationTemplateParameter
      value: OperationTemplateParameterValue
    }[]
  }) {
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.submitOperationRequest({
          newOperationRequest: {
            contract_id: contract.id,
            kind: OperationRequestKind.OPERATION,
            lambda: options.lambda,
            threshold: null,
            proposed_signers: null,
            ledger_hash: options.ledgerHash,
            description: this.operationDescription(
              options.templateName,
              options.parametersInfo
            ),
          },
        })
      )
    })
  }

  private operationDescription(
    templateName: string | null,
    parametersInfo: {
      parameter: OperationTemplateParameter
      value: OperationTemplateParameterValue
    }[]
  ): string | null {
    const parametersDescription = parametersInfo.reduce((current, next) => {
      return (
        current +
        `${current.length > 0 ? '\n' : ''}${this.parameterDescription(
          next.parameter,
          next.value
        )}`
      )
    }, '')
    return `${templateName ? templateName : '\n'}\n${parametersDescription}`
  }

  private parameterDescription(
    parameter: OperationTemplateParameter,
    value: OperationTemplateParameterValue
  ): string {
    switch (parameter.parameter_value_type) {
      case OperationTemplateParameterType.BYTES:
      case OperationTemplateParameterType.STRING:
      case OperationTemplateParameterType.ADDRESS:
        return `${parameter.name}:\n${this.shorten.transform(
          value.parameter_value
        )}`
      case OperationTemplateParameterType.NUMBER:
        return `${parameter.name}:\n${convertBigNumberToAmount(
          new BigNumber(value.parameter_value),
          parameter.decimals ?? 0
        )}`
      default:
        return `${parameter.name}:\n${value.parameter_value}`
    }
  }

  public transfer(options: { amount: BigNumber; receivingAddress: string }) {
    this.store$.dispatch(
      actions.transferOperation({
        transferAmount: options.amount,
        receivingAddress: options.receivingAddress,
      })
    )
  }

  public selectedTokenMetadata(tokenMetadata: TokenMetadata) {
    this.store$.dispatch(
      actions.setActiveTokenId({ tokenId: tokenMetadata.token_id })
    )
  }

  public onSelect(event: any): void {
    this.router.navigate(['/', `${event.heading.toLowerCase()}`])
    this.store$.dispatch(actions.selectTab({ tab: event.id }))
  }

  public selectOperationTemplate(template: OperationTemplate) {
    this.store$.dispatch(actions.setSelectedOperationTemplate({ template }))
  }
}
