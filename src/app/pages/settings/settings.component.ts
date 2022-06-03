import { Component, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import {
  getActiveContract,
  getApprovedChangeKeysOperationRequests,
  getBusyChangeKeysOperationRequests,
  getCanSignIn,
  getGatekeepers,
  getInjectedChangeKeysOperationRequests,
  getSigners,
  getSignersToAdd,
  getSignersToRemove,
  getNewThreshold,
  getOpenChangeKeysOperationRequests,
  getSelectedTezosNode,
  getSessionUser,
  getTezosNodes,
  isAdmin,
  isGatekeeper,
  isSigner,
  getOperationTemplates,
  getSelectedOperationTemplate,
  getAdmins,
} from 'src/app/app.selectors'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { combineLatest, Observable, of, Subscription } from 'rxjs'
import { User } from 'src/app/services/api/interfaces/user'
import { Contract } from 'src/app/services/api/interfaces/contract'
import { SessionUser } from 'src/app/services/api/interfaces/auth'
import {
  filter,
  map,
  pairwise,
  startWith,
  take,
  withLatestFrom,
} from 'rxjs/operators'
import { signIn } from 'src/app/common/auth'
import { loadContractsIfNeeded } from 'src/app/common/contracts'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { Router } from '@angular/router'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import {
  NewOperationRequest,
  OperationRequest,
  OperationRequestKind,
} from 'src/app/services/api/interfaces/operationRequest'
import { PagedResponse } from 'src/app/services/api/interfaces/common'
import { CopyService } from 'src/app/services/copy/copy-service.service'
import { TezosNode } from 'src/app/services/api/interfaces/nodes'
import {
  NewOperationTemplate,
  OperationTemplate,
} from 'src/app/services/api/interfaces/operationTemplate'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public displayNameControl: FormControl
  public emailControl: FormControl
  public formGroup: FormGroup
  public ledgerHashControl: FormControl = new FormControl()
  public tezosNodesForm: FormControl = new FormControl()

  public get publicKeysControls(): FormArray {
    return this.formGroup.get('publicKeys') as FormArray
  }

  public get thresholdControl(): FormControl {
    return this.formGroup.get('threshold') as FormControl
  }

  public isGatekeeper$: Observable<boolean>
  public isSigner$: Observable<boolean>
  public isAdmin$: Observable<boolean>
  public gatekeepers$: Observable<User[]>
  public signers$: Observable<User[]>
  public admins$: Observable<User[]>
  public activeContract$: Observable<Contract>
  public sessionUser$: Observable<SessionUser>
  public signersCount$: Observable<number>
  public newThreshold$: Observable<number>
  public isUpdateContractEnabled$: Observable<boolean>
  public canUpdateSelectedTezosNode$: Observable<boolean>

  public openChangeKeysOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public approvedChangeKeysOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >
  public injectedChangeKeysOperationRequests$: Observable<
    PagedResponse<OperationRequest> | undefined
  >

  public tezosNodes$: Observable<TezosNode[]>
  public operationTemplates$: Observable<OperationTemplate[]>
  public selectedOperationTemplate$: Observable<OperationTemplate | undefined>

  public busyChangeKeysOperationRequests$: Observable<boolean>

  private subscriptions: Subscription[] = []

  private signersToRemove$: Observable<User[]>
  private signersToAdd$: Observable<string[]>

  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly router: Router,
    private readonly copyService: CopyService,
    formBuilder: FormBuilder
  ) {
    this.store$.dispatch(actions.loadTezosNodes())
    this.store$.dispatch(actions.setupBeacon())
    const canSignInSub = this.store$
      .select(getCanSignIn)
      .subscribe((canSignIn) => {
        if (canSignIn !== undefined && !canSignIn) {
          this.router.navigate(['/transfer'])
        }
      })
    this.subscriptions.push(canSignInSub)
    const signInSub = signIn(this.store$)
    this.subscriptions.push(signInSub)
    const contractsSub = loadContractsIfNeeded(store$)
    this.subscriptions.push(contractsSub)
    this.activeContract$ = this.store$
      .select(getActiveContract)
      .pipe(isNotNullOrUndefined())
    const templatesSub = this.activeContract$.subscribe(() =>
      this.store$.dispatch(actions.loadOperationTemplates())
    )
    this.subscriptions.push(templatesSub)
    this.isGatekeeper$ = this.store$.select(isGatekeeper)
    this.isSigner$ = this.store$.select(isSigner)
    this.isAdmin$ = this.store$.select(isAdmin)
    this.sessionUser$ = this.store$
      .select(getSessionUser)
      .pipe(isNotNullOrUndefined())
    this.gatekeepers$ = this.store$.select(getGatekeepers)
    this.signers$ = this.store$.select(getSigners)
    this.admins$ = this.store$.select(getAdmins)
    this.signersToRemove$ = this.store$.select(getSignersToRemove)
    this.signersToAdd$ = this.store$.select(getSignersToAdd)
    this.busyChangeKeysOperationRequests$ = this.store$.select(
      getBusyChangeKeysOperationRequests
    )
    this.signersCount$ = combineLatest([
      this.signers$,
      this.signersToAdd$,
      this.signersToRemove$,
    ]).pipe(
      map(
        ([signers, toAdd, toRemove]) =>
          signers.length + toAdd.length - toRemove.length
      )
    )
    this.newThreshold$ = this.store$
      .select(getNewThreshold)
      .pipe(isNotNullOrUndefined())
    this.isUpdateContractEnabled$ = combineLatest([
      this.activeContract$,
      this.newThreshold$,
      this.signersToRemove$,
      this.signersToAdd$,
    ]).pipe(
      map(([contract, newThreshold, toRemove, toAdd]) => {
        return (
          toRemove.length > 0 ||
          toAdd.length > 0 ||
          contract.min_approvals !== newThreshold
        )
      })
    )

    this.tezosNodes$ = this.store$
      .select(getTezosNodes)
      .pipe(isNotNullOrUndefined())
    this.canUpdateSelectedTezosNode$ = combineLatest([
      this.store$.select(getSelectedTezosNode).pipe(isNotNullOrUndefined()),
      this.tezosNodesForm.valueChanges,
    ]).pipe(
      map(([selectedNode]) => selectedNode.id !== this.tezosNodesForm.value)
    )

    this.operationTemplates$ = this.store$.select(getOperationTemplates)
    this.selectedOperationTemplate$ = this.store$.select(
      getSelectedOperationTemplate
    )

    this.openChangeKeysOperationRequests$ = this.store$.select(
      getOpenChangeKeysOperationRequests
    )
    this.approvedChangeKeysOperationRequests$ = this.store$.select(
      getApprovedChangeKeysOperationRequests
    )
    this.injectedChangeKeysOperationRequests$ = this.store$.select(
      getInjectedChangeKeysOperationRequests
    )

    const usersSub = combineLatest([
      this.store$.select(getActiveContract),
      this.store$.select(getSessionUser),
    ])
      .pipe(
        filter(
          ([contract, sessionUser]) =>
            contract !== undefined && sessionUser !== undefined
        ),
        map(([contract]) => ({ contract: contract! }))
      )
      .subscribe(({ contract }) => {
        this.store$.dispatch(actions.loadUsers({ contractId: contract.id }))
        this.store$.dispatch(actions.loadChangeKeysOperationRequests())
      })
    this.subscriptions.push(usersSub)
    this.displayNameControl = new FormControl('')
    this.emailControl = new FormControl('', [Validators.email])
    this.formGroup = formBuilder.group({
      threshold: new FormControl(null, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
      ]),
      publicKeys: formBuilder.array([this.createPublicKeyControl()]),
    })

    const sessionUserSub = this.sessionUser$.subscribe((sessionUser) => {
      this.displayNameControl.setValue(sessionUser.display_name)
      this.emailControl.setValue(sessionUser.email)
    })
    this.subscriptions.push(sessionUserSub)
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.thresholdControl.setValue(contract.min_approvals)
      this.store$.dispatch(
        actions.updateThreshold({ threshold: contract.min_approvals })
      )
    })
    const signersCountSub = combineLatest([this.signersCount$]).subscribe(
      ([signersCount]) => {
        this.thresholdControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(signersCount),
          Validators.pattern('^\\d+$'),
        ])
        this.thresholdControl.updateValueAndValidity()
      }
    )
    this.subscriptions.push(signersCountSub)

    const thresholdSub = this.thresholdControl.valueChanges.subscribe(
      (value) => {
        if (!this.thresholdControl.invalid) {
          this.store$.dispatch(
            actions.updateThreshold({ threshold: Number(value) })
          )
        }
      }
    )
    this.subscriptions.push(thresholdSub)
    const tezosNodesSub = this.store$
      .select(getSelectedTezosNode)
      .subscribe((selectedNode) =>
        this.tezosNodesForm.patchValue(selectedNode?.id ?? '')
      )
    this.subscriptions.push(tezosNodesSub)
  }

  ngOnInit(): void {}

  private static edpkRegEx = /^edpk[\d|a-zA-Z]{50}/
  private createPublicKeyControl(): FormControl {
    const publicKeyControl = new FormControl(null, [
      Validators.pattern(SettingsComponent.edpkRegEx),
    ])

    const sub = publicKeyControl.statusChanges
      .pipe(
        withLatestFrom(
          publicKeyControl.valueChanges.pipe(startWith(''), pairwise())
        ),
        filter(
          ([, [prev, next]]) =>
            SettingsComponent.edpkRegEx.test(next) ||
            SettingsComponent.edpkRegEx.test(prev)
        )
      )
      .subscribe(([status, [prev, next]]) => {
        if (status === 'VALID') {
          if (next !== '') {
            combineLatest([this.signers$, this.signersToAdd$])
              .pipe(
                take(1),
                map(([signers, toAdd]) => ({
                  signers: signers.map((kh) => kh.public_key),
                  toAdd,
                }))
              )
              .subscribe(({ signers, toAdd }) => {
                if (!toAdd.includes(next) && !signers.includes(next)) {
                  this.store$.dispatch(
                    actions.updateSignersToAdd({ signer: next })
                  )
                }
              })
          } else if (prev !== '') {
            this.store$.dispatch(actions.updateSignersToAdd({ signer: prev }))
          }
        } else if (status === 'INVALID' && prev !== '') {
          this.store$.dispatch(actions.updateSignersToAdd({ signer: prev }))
        }
      })
    this.subscriptions.push(sub)
    return publicKeyControl
  }

  public addPulicKeyControl() {
    this.publicKeysControls.push(this.createPublicKeyControl())
  }

  public removePublicKeyControl(idx: number) {
    if (idx < this.publicKeysControls.controls.length) {
      const control = this.publicKeysControls.controls[idx] as FormControl
      if (!control.invalid && control.value && control.value.length > 0) {
        this.store$.dispatch(
          actions.updateSignersToAdd({ signer: control.value })
        )
      }
      this.publicKeysControls.removeAt(idx)
    }
  }

  public updateSessionUser() {
    const displayName: string = this.displayNameControl.value
    const email: string = this.emailControl.value
    this.store$.dispatch(
      actions.updateSessionUser({
        displayName,
        email: email?.length > 0 ? email : null,
      })
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

  public updateContract() {
    combineLatest([
      this.activeContract$,
      this.signers$,
      this.signersToRemove$,
      this.signersToAdd$,
      this.newThreshold$,
    ])
      .pipe(take(1))
      .subscribe(([contract, signers, toRemove, toAdd, threshold]) => {
        const proposedSigners = signers
          .filter((kh) => !toRemove.includes(kh))
          .map((kh) => kh.public_key)
          .concat(toAdd)
        const newOperationRequest: NewOperationRequest = {
          kind: OperationRequestKind.CHANGE_KEYS,
          contract_id: contract.id,
          lambda: null,
          threshold,
          proposed_signers: proposedSigners.sort(),
          ledger_hash: this.ledgerHash,
        }
        this.store$.dispatch(
          actions.submitOperationRequest({ newOperationRequest })
        )
      })
    this.reset()
  }

  public updateSelectedTezosNode() {
    this.tezosNodes$.pipe(take(1)).subscribe((tezosNodes) => {
      let newSelectedNode = tezosNodes.find(
        (node) => node.id === this.tezosNodesForm.value
      )
      if (newSelectedNode !== undefined) {
        this.store$.dispatch(
          actions.selectTezosNode({ tezosNode: newSelectedNode })
        )
      }
    })
  }

  public toggleSigner(signer: User) {
    this.store$.dispatch(actions.updateSignersToRemove({ signer: signer }))
  }

  public isToggledOn(singer: User): Observable<boolean> {
    return this.signersToRemove$.pipe(
      map((toRemove) => !toRemove.includes(singer))
    )
  }

  public selectedTemplate(template: OperationTemplate) {
    this.store$.dispatch(actions.setSelectedOperationTemplate({ template }))
  }

  public addOperationTemplate(template: NewOperationTemplate) {
    this.store$.dispatch(actions.addOperationTemplate({ template }))
  }

  public removeOperationTemplate(template: OperationTemplate) {
    this.store$.dispatch(actions.deleteOperationTemplate({ template }))
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  private reset() {
    this.store$.dispatch(actions.resetSignersToRemove())
    this.store$.dispatch(actions.resetSignersToAdd())
    this.publicKeysControls.controls = [this.createPublicKeyControl()]
    this.activeContract$.pipe(take(1)).subscribe((contract) => {
      this.store$.dispatch(
        actions.updateThreshold({ threshold: contract.min_approvals })
      )
      this.thresholdControl.setValue(contract.min_approvals)
    })
  }

  public getHostname(node: TezosNode): string {
    return new URL(node.url).hostname
  }

  public ngOnDestroy(): void {
    this.reset()
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }
}
