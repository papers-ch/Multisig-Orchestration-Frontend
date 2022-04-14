import { createAction, props } from '@ngrx/store'
import {
  AccountInfo,
  OperationResponseOutput,
  RequestOperationInput,
} from '@airgap/beacon-sdk'
import BigNumber from 'bignumber.js'
import {
  PagedResponse,
  SignableMessageInfo,
} from './services/api/interfaces/common'
import { Contract } from './services/api/interfaces/contract'
import { User } from './services/api/interfaces/user'
import {
  NewOperationRequest,
  OperationRequest,
  OperationRequestKind,
  OperationRequestState,
} from './services/api/interfaces/operationRequest'
import { OperationApproval } from './services/api/interfaces/operationApproval'
import { HttpErrorResponse } from '@angular/common/http'
import {
  AuthenticationChallenge,
  AuthenticationChallengeResponse,
  SessionUser,
} from './services/api/interfaces/auth'
import { Tab } from './pages/dashboard/tab'
import { ErrorDescription } from './components/error-item/error-description'
import { TezosNode } from './services/api/interfaces/nodes'
import { TokenMetadata } from '@taquito/tzip12'
import {
  NewOperationTemplate,
  OperationTemplate,
} from './services/api/interfaces/operationTemplate'

const featureName = 'App'

export const selectTab = createAction(
  `[${featureName}] Select Tab`,
  props<{ tab: Tab }>()
)

export const getSignInChallenge = createAction(
  `[${featureName}] Get Sign-In Challenge`,
  props<{ address: string }>()
)
export const getSignInChallengeSucceeded = createAction(
  `[${featureName}] Get Sign-In Challenge Succeeded`,
  props<{ challenge: AuthenticationChallenge | null }>()
)
export const getSignInChallengeFailed = createAction(
  `[${featureName}] Get Sign-In Challenge Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const signChallenge = createAction(
  `[${featureName}] Sign Challenge`,
  props<{ challenge: AuthenticationChallenge }>()
)
export const signChallengeSucceeded = createAction(
  `[${featureName}] Sign Challenge Succeeded`,
  props<{ challengeResponse: AuthenticationChallengeResponse }>()
)
export const signChallengeFailed = createAction(
  `[${featureName}] Sign Challenge Failed`,
  props<{ error: any }>()
)

export const respondToSignInChallenge = createAction(
  `[${featureName}] Respond to Sign Challenge`,
  props<{ challengeResponse: AuthenticationChallengeResponse }>()
)
export const respondToSignInChallengeSucceeded = createAction(
  `[${featureName}] Respond to Sign Challenge Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const respondToSignInChallengeFailed = createAction(
  `[${featureName}] Respond to Sign Challenge Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const getSessionUser = createAction(`[${featureName}] Get Session User`)
export const getSessionUserSucceeded = createAction(
  `[${featureName}] Get Session User Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const getSessionUserFailed = createAction(
  `[${featureName}] Get Session User Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const updateSessionUser = createAction(
  `[${featureName}] Update Session User`,
  props<{ displayName: string; email: string | null }>()
)
export const updateSessionUserSucceeded = createAction(
  `[${featureName}] Update Session User Succeeded`,
  props<{ sessionUser: SessionUser }>()
)
export const updateSessionUserFailed = createAction(
  `[${featureName}] Update Session User Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const updateCanSignIn = createAction(
  `[${featureName}] Update Can Sign In`,
  props<{ canSignIn: boolean }>()
)

export const handleHttpErrorResponse = createAction(
  `[${featureName}] Handle HttpErrorResponse`,
  props<{ errorResponse: HttpErrorResponse }>()
)
export const handleUnauthenticatedError = createAction(
  `[${featureName}] Handle Unauthenticated Error`
)

export const signOut = createAction(`[${featureName}] Sign Out`)
export const signOutSucceeded = createAction(
  `[${featureName}] Sign Out Succeeded`
)
export const signOutFailed = createAction(
  `[${featureName}] Sign Out Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const setupBeacon = createAction(`[${featureName}] Setup Beacon`)
export const setupBeaconSucceeded = createAction(
  `[${featureName}] Setup Beacon Succeeded`
)
export const setupBeaconFailed = createAction(
  `[${featureName}] Setup Beacon Failed`,
  props<{ error: any }>()
)

export const connectWallet = createAction(
  `[${featureName}] Connect Wallet with Beacon`
)
export const connectWalletSucceeded = createAction(
  `[${featureName}] Connect Wallet with Beacon Succeeded`,
  props<{ accountInfo: AccountInfo | undefined }>()
)
export const connectWalletFailed = createAction(
  `[${featureName}] Connect Wallet with Beacon Failed`,
  props<{ error: any }>()
)

export const disconnectWallet = createAction(
  `[${featureName}] Disconnect Wallet`
)
export const disconnectWalletSucceeded = createAction(
  `[${featureName}] Disconnect Wallet Succeeded`
)
export const disconnectWalletFailed = createAction(
  `[${featureName}] Disconnect Wallet Failed`,
  props<{ error: any }>()
)

export const loadAddress = createAction(
  `[${featureName}] Load Address of Connected Wallet`
)
export const loadAddressSucceeded = createAction(
  `[${featureName}] Load Address of Connected Wallet Succeeded`,
  props<{ address: string }>()
)
export const loadAddressFailed = createAction(
  `[${featureName}] Load Address of Connected Wallet Failed`,
  props<{ error: any }>()
)

export const loadContractCounter = createAction(
  `[${featureName}] Load Contract Counter`,
  props<{ contractId: string }>()
)
export const loadContractCounterSucceeded = createAction(
  `[${featureName}] Load Contract Counter Succeeded`,
  props<{ contractId: string; counter: number }>()
)
export const loadContractCounterFailed = createAction(
  `[${featureName}] Load Contract Counter Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadBalance = createAction(
  `[${featureName}] Load Balance of Connected Wallet`
)
export const loadBalanceSucceeded = createAction(
  `[${featureName}] Load Balance of Connected Wallet Succeeded`,
  props<{ balance: BigNumber | undefined }>()
)
export const loadBalanceFailed = createAction(
  `[${featureName}] Load Balance of Connected Wallet Failed`,
  props<{ error: any }>()
)

export const loadTezosNodes = createAction(`[${featureName}] Load Tezos Nodes `)
export const loadTezosNodesSucceeded = createAction(
  `[${featureName}] Load Tezos Nodes Succeeded`,
  props<{ response: TezosNode[] }>()
)
export const loadTezosNodesFailed = createAction(
  `[${featureName}] Load Tezos Nodes Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const selectTezosNode = createAction(
  `[${featureName}] Select Tezos Node`,
  props<{ tezosNode: TezosNode }>()
)
export const selectTezosNodeSucceeded = createAction(
  `[${featureName}] Select Tezos Node Succeeded`,
  props<{ response: TezosNode }>()
)
export const selectTezosNodeFailed = createAction(
  `[${featureName}] Select Tezos Node Succeeded`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadContracts = createAction(`[${featureName}] Load Contracts`)
export const loadContractsSucceeded = createAction(
  `[${featureName}] Load Contracts Succeeded`,
  props<{ response: PagedResponse<Contract> }>()
)
export const loadContractsFailed = createAction(
  `[${featureName}] Load Contracts Failed`,
  props<{ error: any }>()
)

export const getAllTokenMetadata = createAction(
  `[${featureName}] Get All Token Metadata`
)
export const getAllTokenMetadataSucceeded = createAction(
  `[${featureName}] Get All Token Metadata Succeeded`,
  props<{ contract: Contract; allTokenMetadata: TokenMetadata[] }>()
)
export const getAllTokenMetadataFailed = createAction(
  `[${featureName}] Get All Token Metadata Failed`,
  props<{ error: any }>()
)

export const setActiveTokenId = createAction(
  `[${featureName}] Set Active Token ID`,
  props<{ tokenId: number }>()
)
export const setActiveTokenIdFailed = createAction(
  `[${featureName}] Set Active Token ID Failed`
)

export const loadUsers = createAction(
  `[${featureName}] Load Users`,
  props<{ contractId: string }>()
)
export const loadUsersSucceeded = createAction(
  `[${featureName}] Load Users Succeeded`,
  props<{ response: PagedResponse<User> }>()
)
export const loadUsersFailed = createAction(
  `[${featureName}] Load Users Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadOperationRequests = createAction(
  `[${featureName}] Load Operation Requests`
)

export const loadOpenOperationRequests = createAction(
  `[${featureName}] Load Open Operation Requests`,
  props<{ page?: number }>()
)
export const loadApprovedOperationRequests = createAction(
  `[${featureName}] Load Approved Operation Requests`,
  props<{ page?: number }>()
)
export const loadInjectedOperationRequests = createAction(
  `[${featureName}] Load Injected Operation Requests`,
  props<{ page?: number }>()
)

export const loadOpenOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Open Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadApprovedOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Approved Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadInjectedOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Injected Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)

export const loadOperationRequestsFailed = createAction(
  `[${featureName}] Load Operation Requests Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const loadChangeKeysOperationRequests = createAction(
  `[${featureName}] Load Change Keys Operation Requests`
)

export const loadOpenChangeKeysOperationRequests = createAction(
  `[${featureName}] Load Open Change Keys Operation Requests`,
  props<{ page?: number }>()
)
export const loadApprovedChangeKeysOperationRequests = createAction(
  `[${featureName}] Load Approved Change Keys Operation Requests`,
  props<{ page?: number }>()
)
export const loadInjectedChangeKeysOperationRequests = createAction(
  `[${featureName}] Load Injected Change Keys Operation Requests`,
  props<{ page?: number }>()
)

export const loadOpenChangeKeysOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Open Change Keys Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadApprovedChangeKeysOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Approved Change Keys Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)
export const loadInjectedChangeKeysOperationRequestsSucceeded = createAction(
  `[${featureName}] Load Injected Change Keys Operation Requests Succeeded`,
  props<{ response: PagedResponse<OperationRequest> }>()
)

export const loadChangeKeysOperationRequestsFailed = createAction(
  `[${featureName}] Load Change Keys Operation Requests Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const transferOperation = createAction(
  `[${featureName}] Starting Transfer Operation`,
  props<{ transferAmount: BigNumber; receivingAddress: string }>()
)
export const transferOperationSucceeded = createAction(
  `[${featureName}] Transferring Succeeded`
)
export const transferOperationFailed = createAction(
  `[${featureName}] Transferring Failed`,
  props<{ error: any }>()
)

export const submitOperationRequest = createAction(
  `[${featureName}] Submit Operation Request`,
  props<{ newOperationRequest: NewOperationRequest }>()
)
export const submitOperationRequestSucceeded = createAction(
  `[${featureName}] Submit Operation Request Succeeded`,
  props<{
    operationRequest: OperationRequest
  }>()
)
export const submitOperationRequestFailed = createAction(
  `[${featureName}] Submit Operation Request Failed`,
  props<{
    errorResponse: HttpErrorResponse
    newOperationRequest: NewOperationRequest
  }>()
)

export const getSignableMessage = createAction(
  `[${featureName}] Get Signable Message `,
  props<{ operationRequestId: string }>()
)
export const getSignableMessageSucceeded = createAction(
  `[${featureName}] Get Signable Message Succeeded`,
  props<{ signableMessage: SignableMessageInfo; operationRequestId: string }>()
)
export const getSignableMessageFailed = createAction(
  `[${featureName}] Get Signable Message Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const approveOperationRequest = createAction(
  `[${featureName}] Approve Operation Request`,
  props<{
    signableMessage: SignableMessageInfo
    operationRequest: OperationRequest
  }>()
)
export const approveOperationRequestSucceeded = createAction(
  `[${featureName}] Approve Operation Request Succeeded`,
  props<{ operationRequest: OperationRequest; signature: string }>()
)
export const approveOperationRequestFailed = createAction(
  `[${featureName}] Approve Operation Request Failed`,
  props<{ error: any }>()
)

export const submitOperationApproval = createAction(
  `[${featureName}] Submit Operation Approval`,
  props<{ operationRequest: OperationRequest; signature: string }>()
)
export const submitOperationApprovalSucceeded = createAction(
  `[${featureName}] Submit Operation Approval Succeeded`,
  props<{
    operationApproval: OperationApproval
    operationRequest: OperationRequest
  }>()
)
export const submitOperationApprovalFailed = createAction(
  `[${featureName}] Submit Operation Approval Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const getOperationRequestParameters = createAction(
  `[${featureName}] Get Operation Request Parameters`,
  props<{ operationRequest: OperationRequest }>()
)
export const getOperationRequestParametersSucceeded = createAction(
  `[${featureName}] Get Operation Request Parameters Succeeded`,
  props<{ operationRequest: OperationRequest; parameters: any }>()
)
export const getOperationRequestParametersFailed = createAction(
  `[${featureName}] Get Operation Request ParametersFailed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const submitOperation = createAction(
  `[${featureName}] Submit Operation`,
  props<{
    operationRequest: OperationRequest
    operation: RequestOperationInput
  }>()
)
export const submitOperationSucceeded = createAction(
  `[${featureName}] Submit Operation Succeeded`,
  props<{
    operationRequest: OperationRequest
    operationResponse: OperationResponseOutput
  }>()
)
export const submitOperationFailed = createAction(
  `[${featureName}] Submit Operation Failed`,
  props<{ error: any }>()
)

export const updateOperationRequestStateToInjected = createAction(
  `[${featureName}] Update Operation Request State to Injected`,
  props<{
    operationRequest: OperationRequest
    injectedOperationHash: string | null
  }>()
)
export const updateOperationRequestStateToInjectedSucceeded = createAction(
  `[${featureName}] Update Operation Request State to Injected Succeeded`,
  props<{ operationRequest: OperationRequest }>()
)
export const updateOperationRequestStateToInjectedFailed = createAction(
  `[${featureName}] Update Operation Request State to Injected Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const deleteOperationRequest = createAction(
  `[${featureName}] Delete Operation Request`,
  props<{ operationRequest: OperationRequest }>()
)
export const deleteOperationRequestSucceeded = createAction(
  `[${featureName}] Delete Operation Request Succeeded`,
  props<{ operationRequest: OperationRequest }>()
)
export const deleteOperationRequestFailed = createAction(
  `[${featureName}] Delete Operation Request Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const setActiveContract = createAction(
  `[${featureName}] Setting Active Contract`,
  props<{ contract: Contract }>()
)
export const setActiveContractSucceeded = createAction(
  `[${featureName}] Setting Active Contract Succeeded`,
  props<{ contract: Contract }>()
)
export const setActiveContractFailed = createAction(
  `[${featureName}] Setting Active Contract Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const showAlert = createAction(
  `[${featureName}] setting New Alert Message`,
  props<{ alertMessage: ErrorDescription }>()
)
export const clearAlerts = createAction(`[${featureName}] Clearing Alerts`)

export const updateSignersToRemove = createAction(
  `[${featureName}] Update Signers to remove`,
  props<{ signer: User }>()
)
export const resetSignersToRemove = createAction(
  `[${featureName}] Reset Signers to remove`
)

export const updateSignersToAdd = createAction(
  `[${featureName}] Update Signers to add`,
  props<{ signer: string }>()
)
export const resetSignersToAdd = createAction(
  `[${featureName}] Reset Signers to add`
)

export const updateThreshold = createAction(
  `[${featureName}] Update threshold`,
  props<{ threshold: number }>()
)
export const resetThreshold = createAction(`[${featureName}] Reset threshold`)

export const noOp = createAction(`[${featureName}] Nothing to do`)

export const loadOperationRequestPage = createAction(
  `[${featureName}] Loading More Requests`,
  props<{
    kind: OperationRequestKind
    state: OperationRequestState
    page: number
  }>()
)

export const loadOperationTemplates = createAction(
  `[${featureName}] Load Operation Templates`
)
export const loadOperationTemplatesSucceeded = createAction(
  `[${featureName}] Load Operation Templates Succeeded`,
  props<{ templates: OperationTemplate[] }>()
)
export const loadOperationTemplatesFailed = createAction(
  `[${featureName}] Load Operation Templates Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const setSelectedOperationTemplate = createAction(
  `[${featureName}] Set Selected Operation Template`,
  props<{ template: OperationTemplate | undefined }>()
)

export const addOperationTemplate = createAction(
  `[${featureName}] Add Operation Template`,
  props<{ template: NewOperationTemplate }>()
)
export const addOperationTemplateSucceeded = createAction(
  `[${featureName}] Add Operation Template Succeeded`,
  props<{ template: OperationTemplate }>()
)
export const addOperationTemplateFailed = createAction(
  `[${featureName}] Add Operation Template Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)

export const deleteOperationTemplate = createAction(
  `[${featureName}] Delete Operation Template`,
  props<{ template: OperationTemplate }>()
)
export const deleteOperationTemplateSucceeded = createAction(
  `[${featureName}] Delete Operation Template Succeeded`,
  props<{ template: OperationTemplate }>()
)
export const deleteOperationTemplateFailed = createAction(
  `[${featureName}] Delete Operation Template Failed`,
  props<{ errorResponse: HttpErrorResponse }>()
)
