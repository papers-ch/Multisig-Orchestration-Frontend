import { SigningType, TezosOperationType } from '@airgap/beacon-sdk'
import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { from, Observable, of } from 'rxjs'
import {
  map,
  catchError,
  switchMap,
  withLatestFrom,
  mergeMap,
  filter,
} from 'rxjs/operators'
import * as fromRoot from '../app/reducers/index'

import * as actions from './app.actions'
import {
  getActiveAccount,
  getActiveContract,
  getApprovedOperationRequestCurrentPage,
  getApprovedChangeKeysOperationRequestCurrentPage,
  getCanSignIn,
  getInjectedOperationRequestCurrentPage,
  getInjectedChangeKeysOperationRequestCurrentPage,
  getOpenOperationRequestCurrentPage,
  getOpenChangeKeysOperationRequestCurrentPage,
} from './app.selectors'
import { ApiService } from './services/api/api.service'
import { ErrorKind, isAPIError } from './services/api/interfaces/error'
import {
  OperationRequestKind,
  OperationRequestState,
} from './services/api/interfaces/operationRequest'
import { BeaconService } from './services/beacon/beacon.service'
import { CacheService } from './services/cache/cache.service'
import { Contract } from './services/api/interfaces/contract'
import { Router } from '@angular/router'
import { Order } from './services/api/interfaces/common'

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly beaconService: BeaconService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>,
    private readonly cacheService: CacheService,
    private readonly router: Router
  ) {}

  setupBeacon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setupBeacon),
      switchMap(() =>
        from(this.beaconService.activeAccount()).pipe(
          map((accountInfo) => {
            if (accountInfo !== undefined) {
              return actions.connectWalletSucceeded({ accountInfo })
            } else {
              return actions.setupBeaconSucceeded()
            }
          }),
          catchError((error) => of(actions.connectWalletFailed({ error })))
        )
      )
    )
  )

  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() =>
        from(this.beaconService.requestPermission()).pipe(
          map((accountInfo) => actions.connectWalletSucceeded({ accountInfo })),
          catchError((error) => of(actions.connectWalletFailed({ error })))
        )
      )
    )
  )

  getSignInChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallenge),
      withLatestFrom(this.store$.select(getCanSignIn)),
      filter(([, canSignIn]) => canSignIn !== false),
      map(([address]) => address),
      switchMap(({ address }) =>
        this.apiService.getSignInChallenge(address).pipe(
          map((challenge) =>
            actions.getSignInChallengeSucceeded({ challenge })
          ),
          catchError((errorResponse) =>
            of(actions.getSignInChallengeFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getSignInChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallengeSucceeded),
      switchMap(({ challenge }) => {
        if (challenge !== null) {
          return [
            actions.updateCanSignIn({ canSignIn: true }),
            actions.signChallenge({ challenge }),
          ]
        } else {
          return of(actions.getSessionUser())
        }
      })
    )
  )

  getSignInChallengeFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignInChallengeFailed),
      map(({ errorResponse }) => {
        const error = errorResponse.error
        if (isAPIError(error)) {
          if (error.error === ErrorKind.Forbidden) {
            // the address we received from Beacon SDK cannot ever login (not a gatekeepr or signer)
            return actions.updateCanSignIn({ canSignIn: false })
          }
          return actions.showAlert({
            alertMessage: { status: error.code, message: error.message },
          })
        } else {
          return actions.showAlert({ alertMessage: errorResponse })
        }
      })
    )
  )

  signChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signChallenge),
      switchMap(({ challenge }) =>
        from(
          this.beaconService.sign(challenge.message, SigningType.OPERATION)
        ).pipe(
          map((signResponse) =>
            actions.signChallengeSucceeded({
              challengeResponse: {
                id: challenge.id,
                signature: signResponse.signature,
              },
            })
          ),
          catchError((error) => of(actions.signChallengeFailed({ error })))
        )
      )
    )
  )

  signChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signChallengeSucceeded),
      map(({ challengeResponse }) =>
        actions.respondToSignInChallenge({ challengeResponse })
      )
    )
  )

  respondToSignInChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallenge),
      switchMap(({ challengeResponse }) =>
        this.apiService.respondToSignInChallenge(challengeResponse).pipe(
          map((sessionUser) =>
            actions.respondToSignInChallengeSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.respondToSignInChallengeFailed({ errorResponse }))
          )
        )
      )
    )
  )

  respondToSignInChallengeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallengeSucceeded),
      map(({ sessionUser }) => actions.getSessionUserSucceeded({ sessionUser }))
    )
  )

  respondToSignInChallengeFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.respondToSignInChallengeFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  getSessionUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSessionUser),
      switchMap(() =>
        this.apiService.getSessionUser().pipe(
          map((sessionUser) =>
            actions.getSessionUserSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.getSessionUserFailed({ errorResponse }))
          )
        )
      )
    )
  )

  updateSessionUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateSessionUser),
      switchMap(({ displayName, email }) =>
        this.apiService.updateSessionUser(displayName, email).pipe(
          map((sessionUser) =>
            actions.updateSessionUserSucceeded({ sessionUser })
          ),
          catchError((errorResponse) =>
            of(actions.updateSessionUserFailed({ errorResponse }))
          )
        )
      )
    )
  )

  updateSessionUserFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateSessionUserFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  signOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOut),
      switchMap(() =>
        this.apiService.signOut().pipe(
          map(() => actions.signOutSucceeded()),
          catchError((errorResponse) =>
            of(actions.signOutFailed({ errorResponse }))
          )
        )
      )
    )
  )

  signOutSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOutSucceeded),
      map(() => {
        if (this.router.url === '/settings') {
          this.router.navigate(['/transfer'])
        }
        return actions.noOp()
      })
    )
  )

  signOutFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.signOutFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  handleHttpErrorResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.handleHttpErrorResponse),
      withLatestFrom(this.store$.select(getActiveAccount)),
      switchMap(([{ errorResponse }, activeAccount]) => {
        const error = errorResponse.error
        console.error(error)
        if (isAPIError(error)) {
          if (
            error.error === ErrorKind.Unauthorized &&
            activeAccount !== undefined
          ) {
            return of(actions.handleUnauthenticatedError())
          } else if (error.error === ErrorKind.Forbidden) {
            return of(actions.noOp())
          } else {
            return of(
              actions.showAlert({
                alertMessage: { status: error.code, message: error.message },
              })
            )
          }
        } else {
          return of(actions.showAlert({ alertMessage: errorResponse }))
        }
      })
    )
  )

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalance),
      withLatestFrom(
        this.store$.select(getActiveAccount),
        this.store$.select(getActiveContract)
      ),
      filter(
        ([account, contract]) => account !== undefined && contract !== undefined
      ),
      map(([, account, contract]) => ({
        address: account!.address,
        contract: contract!,
      })),
      switchMap(({ address, contract }) =>
        // TODO: do not hardcode the token id
        from(this.beaconService.getBalance(0, address, contract)).pipe(
          map((response) =>
            actions.loadBalanceSucceeded({ balance: response })
          ),
          catchError((error) => of(actions.loadBalanceFailed(error)))
        )
      )
    )
  )

  loadTezosNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTezosNodes),
      switchMap(() => this.apiService.getTezosNodes()),
      map((response) => actions.loadTezosNodesSucceeded({ response })),
      catchError((errorResponse: HttpErrorResponse) =>
        of(actions.loadTezosNodesFailed({ errorResponse }))
      )
    )
  )

  loadTezosNodesFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTezosNodesFailed),
      switchMap((value) => of(actions.handleHttpErrorResponse(value)))
    )
  )

  selectTezosNode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.selectTezosNode),
      switchMap(({ tezosNode }) =>
        from(this.apiService.selectTezosNode(tezosNode))
      ),
      map((response) => actions.selectTezosNodeSucceeded({ response })),
      catchError((errorResponse: HttpErrorResponse) =>
        of(actions.selectTezosNodeFailed({ errorResponse }))
      )
    )
  )

  selectTezosNodeSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.selectTezosNodeSucceeded),
      map(() => actions.loadTezosNodes())
    )
  )

  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      switchMap(() =>
        this.apiService.getContracts().pipe(
          map((response) => actions.loadContractsSucceeded({ response })),
          catchError((error) => of(actions.loadContractsFailed({ error })))
        )
      )
    )
  )

  loadContractsSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractsSucceeded),
      switchMap(({ response }) => {
        const contracts: Contract[] = response.results

        const cachedContract$ = this.cacheService.get(
          'activeContract'
        ) as Observable<Contract>

        if (cachedContract$) {
          return cachedContract$.pipe(
            map((cachedContract) => {
              if (cachedContract === undefined) {
                return actions.setActiveContract({
                  contract: response.results[0],
                })
              }
              const activeContract = contracts.find(
                (contract) => contract.id === cachedContract.id
              )
              return actions.setActiveContract({
                contract:
                  activeContract !== undefined
                    ? activeContract
                    : response.results[0],
              })
            })
          )
        } else {
          return of(
            actions.setActiveContract({ contract: response.results[0] })
          )
        }
      })
    )
  )

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUsers),
      switchMap(({ contractId }) =>
        this.apiService.getUsers(contractId).pipe(
          map((response) => actions.loadUsersSucceeded({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(actions.loadUsersFailed({ errorResponse }))
          )
        )
      )
    )
  )

  loadUsersFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUsersFailed),
      switchMap((value) => of(actions.handleHttpErrorResponse(value)))
    )
  )

  disconnectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWallet),
      switchMap(() =>
        from(this.beaconService.reset()).pipe(
          map(() => actions.disconnectWalletSucceeded()),
          catchError((error) => of(actions.disconnectWalletFailed({ error })))
        )
      )
    )
  )

  disconnectWalletSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWalletSucceeded),
      map(() => actions.signOut())
    )
  )

  loadOperationRequestPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationRequestPage),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ kind, state, page }, contract]) => ({
        kind,
        state,
        page,
        contract: contract!,
      })),
      map(({ kind, state, page, contract }) => {
        const params = {
          contractId: contract.id,
          page,
        }
        if (kind === OperationRequestKind.OPERATION) {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedOperationRequests(params)
          } else {
            return actions.loadInjectedOperationRequests(params)
          }
        } else {
          if (state === OperationRequestState.OPEN) {
            return actions.loadOpenChangeKeysOperationRequests(params)
          } else if (state === OperationRequestState.APPROVED) {
            return actions.loadApprovedChangeKeysOperationRequests(params)
          } else {
            return actions.loadInjectedChangeKeysOperationRequests(params)
          }
        }
      })
    )
  )

  loadOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenOperationRequests({}),
          actions.loadApprovedOperationRequests({}),
          actions.loadInjectedOperationRequests({}),
        ])
      )
    )
  )

  loadOpenOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.OPERATION,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadApprovedOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedOperationRequests),
      withLatestFrom(
        this.store$.select(getApprovedOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.OPERATION,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadInjectedOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedOperationRequests),
      withLatestFrom(
        this.store$.select(getInjectedOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.OPERATION,
            OperationRequestState.INJECTED,
            page ?? currentPage,
            undefined,
            Order.DESC
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(actions.loadOperationRequestsFailed({ errorResponse }))
            )
          )
      )
    )
  )

  loadOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  loadChangeKeysOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadChangeKeysOperationRequests),
      switchMap(() =>
        from([
          actions.loadOpenChangeKeysOperationRequests({}),
          actions.loadApprovedChangeKeysOperationRequests({}),
          actions.loadInjectedChangeKeysOperationRequests({}),
        ])
      )
    )
  )

  loadOpenChangeKeysOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOpenChangeKeysOperationRequests),
      withLatestFrom(
        this.store$.select(getOpenChangeKeysOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.CHANGE_KEYS,
            OperationRequestState.OPEN,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadOpenChangeKeysOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadOpenChangeKeysOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadChangeKeysOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadApprovedChangeKeysOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApprovedChangeKeysOperationRequests),
      withLatestFrom(
        this.store$.select(getApprovedChangeKeysOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.CHANGE_KEYS,
            OperationRequestState.APPROVED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadApprovedChangeKeysOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadApprovedChangeKeysOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadChangeKeysOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadInjectedChangeKeysOperationRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadInjectedChangeKeysOperationRequests),
      withLatestFrom(
        this.store$.select(getInjectedChangeKeysOperationRequestCurrentPage),
        this.store$.select(getActiveContract)
      ),
      filter(([, , contract]) => contract !== undefined),
      map(([{ page }, currentPage, contract]) => ({
        page,
        currentPage,
        contract: contract!,
      })),
      switchMap(({ page, currentPage, contract }) =>
        this.apiService
          .getOperationRequests(
            contract.id,
            OperationRequestKind.CHANGE_KEYS,
            OperationRequestState.INJECTED,
            page ?? currentPage
          )
          .pipe(
            map((response) => {
              if (response.total_pages === 0 && response.page > 1) {
                return actions.loadInjectedChangeKeysOperationRequests({
                  page: response.page - 1,
                })
              }
              return actions.loadInjectedChangeKeysOperationRequestsSucceeded({
                response,
              })
            }),
            catchError((errorResponse) =>
              of(
                actions.loadChangeKeysOperationRequestsFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  loadChangeKeysOperationRequestsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadChangeKeysOperationRequestsFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  transferOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.transferOperation),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ receivingAddress, transferAmount }, contract]) => ({
        receivingAddress,
        transferAmount,
        contract: contract!,
      })),
      switchMap(({ receivingAddress, transferAmount, contract }) =>
        from(
          // TODO: do not hardcode token id
          this.beaconService.transferOperation(
            0,
            transferAmount,
            receivingAddress,
            contract
          )
        ).pipe(
          map(() => actions.transferOperationSucceeded()),
          catchError((error) => of(actions.transferOperationFailed({ error })))
        )
      )
    )
  )

  submitOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequest),
      switchMap(({ newOperationRequest }) =>
        this.apiService.addOperationRequest(newOperationRequest).pipe(
          map((operationRequest) =>
            actions.submitOperationRequestSucceeded({ operationRequest })
          ),
          catchError((errorResponse) =>
            of(
              actions.submitOperationRequestFailed({
                errorResponse,
                newOperationRequest,
              })
            )
          )
        )
      )
    )
  )

  submitOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequestSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.OPERATION) {
          return actions.loadOpenOperationRequests({})
        } else {
          return actions.loadOpenChangeKeysOperationRequests({})
        }
      })
    )
  )

  submitSignedOperationRequestFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationRequestFailed),
      map(({ errorResponse }) =>
        actions.handleHttpErrorResponse({ errorResponse })
      )
    )
  )

  getSignableMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableMessage),
      mergeMap(({ operationRequestId }) =>
        this.apiService.getSignableMessage(operationRequestId).pipe(
          map((signableMessage) => {
            return actions.getSignableMessageSucceeded({
              signableMessage,
              operationRequestId,
            })
          }),
          catchError((errorResponse) =>
            of(actions.getSignableMessageFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getSignableMessageFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getSignableMessageFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  approveOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequest),
      switchMap(({ signableMessage, operationRequest }) =>
        from(this.beaconService.sign(signableMessage.message)).pipe(
          map((signResponse) =>
            actions.approveOperationRequestSucceeded({
              operationRequest,
              signature: signResponse.signature,
            })
          ),
          catchError((error) =>
            of(actions.approveOperationRequestFailed({ error }))
          )
        )
      )
    )
  )

  approveOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approveOperationRequestSucceeded),
      map(({ operationRequest, signature }) =>
        actions.submitOperationApproval({ operationRequest, signature })
      )
    )
  )

  submitOperationApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApproval),
      switchMap(({ operationRequest, signature }) =>
        this.apiService
          .addOperationApproval({
            operation_request_id: operationRequest.id,
            signature,
          })
          .pipe(
            map((operationApproval) =>
              actions.submitOperationApprovalSucceeded({
                operationApproval,
                operationRequest,
              })
            ),
            catchError((errorResponse) =>
              of(actions.submitOperationApprovalFailed({ errorResponse }))
            )
          )
      )
    )
  )

  submitOperationApprovalSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApprovalSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.OPERATION) {
          return actions.loadOperationRequests()
        } else {
          return actions.loadChangeKeysOperationRequests()
        }
      })
    )
  )

  submitOperationApprovalFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationApprovalFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  getOperationRequestParameters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParameters),
      switchMap(({ operationRequest }) =>
        this.apiService.getParameters(operationRequest.id).pipe(
          map((parameters) =>
            actions.getOperationRequestParametersSucceeded({
              operationRequest,
              parameters,
            })
          ),
          catchError((errorResponse) =>
            of(actions.getOperationRequestParametersFailed({ errorResponse }))
          )
        )
      )
    )
  )

  getOperationRequestParametersSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParametersSucceeded),
      withLatestFrom(this.store$.select(getActiveContract)),
      filter(([, contract]) => contract !== undefined),
      map(([{ operationRequest, parameters }, contract]) =>
        actions.submitOperation({
          operationRequest,
          operation: {
            operationDetails: [
              {
                kind: TezosOperationType.TRANSACTION,
                amount: '0',
                destination: contract!.multisig_address,
                parameters,
              },
            ],
          },
        })
      )
    )
  )

  getOperationRequestParametersFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getOperationRequestParametersFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  submitOperation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperation),
      switchMap(({ operationRequest, operation }) =>
        from(this.beaconService.operation(operation)).pipe(
          map((operationResponse) =>
            actions.submitOperationSucceeded({
              operationRequest,
              operationResponse,
            })
          ),
          catchError((error) => of(actions.submitOperationFailed({ error })))
        )
      )
    )
  )

  submitOperationSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.submitOperationSucceeded),
      map(({ operationRequest, operationResponse }) =>
        actions.updateOperationRequestStateToInjected({
          operationRequest,
          injectedOperationHash: operationResponse.transactionHash,
        })
      )
    )
  )

  updateOperationRequestStateToInjected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjected),
      switchMap(({ operationRequest, injectedOperationHash }) =>
        this.apiService
          .updateOperationRequest(operationRequest.id, injectedOperationHash)
          .pipe(
            map(() =>
              actions.updateOperationRequestStateToInjectedSucceeded({
                operationRequest,
              })
            ),
            catchError((errorResponse) =>
              of(
                actions.updateOperationRequestStateToInjectedFailed({
                  errorResponse,
                })
              )
            )
          )
      )
    )
  )

  updateOperationRequestStateToInjectedSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjectedSucceeded),
      map(({ operationRequest }) => {
        if (operationRequest.kind === OperationRequestKind.OPERATION) {
          return actions.loadOperationRequests()
        } else {
          return actions.loadChangeKeysOperationRequests()
        }
      })
    )
  )

  updateOperationRequestStateToInjectedFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateOperationRequestStateToInjectedFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  setActiveContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContract),

      switchMap(({ contract }) =>
        this.cacheService.set('activeContract', contract).pipe(
          map(() => actions.setActiveContractSucceeded({ contract })),
          catchError((errorResponse) =>
            of(actions.setActiveContractFailed({ errorResponse }))
          )
        )
      )
    )
  )

  setActiveContractSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setActiveContractSucceeded),
      map(({ contract }) =>
        actions.loadContractCounter({ contractId: contract.id })
      )
    )
  )

  loadContractCounter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractCounter),
      mergeMap(({ contractId }) =>
        this.apiService.getContractCounter(contractId).pipe(
          map((counter) => Number(counter)),
          map((counter) =>
            actions.loadContractCounterSucceeded({ contractId, counter })
          ),
          catchError((errorResponse) =>
            of(actions.loadContractCounterFailed({ errorResponse }))
          )
        )
      )
    )
  )

  loadContractCounterFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractCounterFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )

  deleteOperationRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequest),
      switchMap(({ operationRequest }) =>
        this.apiService.deleteOperationRequest(operationRequest.id).pipe(
          map(() =>
            actions.deleteOperationRequestSucceeded({ operationRequest })
          ),
          catchError((errorResponse) =>
            of(actions.deleteOperationRequestFailed({ errorResponse }))
          )
        )
      )
    )
  )

  deleteOperationRequestSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequestSucceeded),
      switchMap(() => [
        actions.loadOperationRequests(),
        actions.loadChangeKeysOperationRequests(),
      ])
    )
  )

  deleteOperationRequestFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteOperationRequestFailed),
      map((value) => actions.handleHttpErrorResponse(value))
    )
  )
}
