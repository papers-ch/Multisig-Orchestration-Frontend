import { createReducer, on } from '@ngrx/store'

import * as actions from './app.actions'
import BigNumber from 'bignumber.js'
import { AccountInfo } from '@airgap/beacon-sdk'
import { Contract } from './services/api/interfaces/contract'
import { User } from './services/api/interfaces/user'
import { OperationApproval } from './services/api/interfaces/operationApproval'
import {
  PagedResponse,
  SignableMessageInfo,
} from './services/api/interfaces/common'
import {
  OperationRequest,
  OperationRequestKind,
} from './services/api/interfaces/operationRequest'
import { SessionUser } from './services/api/interfaces/auth'
import { Tab } from './pages/dashboard/tab'
import { ErrorDescription } from './components/error-item/error-description'
import { TezosNode } from './services/api/interfaces/nodes'
import { TokenMetadata } from '@taquito/tzip12'
import { OperationTemplate } from './services/api/interfaces/operationTemplate'

interface Busy {
  activeAccount: boolean
  balance: boolean
  operationRequests: boolean
  changeKeysOperationRequests: boolean
  contracts: boolean
  users: boolean
  signableMessages: boolean
  contractCounters: boolean
}

export interface State {
  selectedTab: Tab
  sessionUser: SessionUser | undefined
  canSignIn: boolean | undefined
  activeAccount: AccountInfo | undefined
  nodes: TezosNode[] | undefined
  contracts: Contract[]
  activeContract: Contract | undefined
  contractCounters: Map<string, number>
  allTokenMetadata: Map<string, TokenMetadata[]>
  activeTokenId: number | undefined
  users: User[]
  signableMessages: Map<string, SignableMessageInfo>
  balance: BigNumber | undefined

  openOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedOperationRequests: PagedResponse<OperationRequest> | undefined
  injectedOperationRequests: PagedResponse<OperationRequest> | undefined

  openChangeKeysOperationRequests: PagedResponse<OperationRequest> | undefined
  approvedChangeKeysOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined
  injectedChangeKeysOperationRequests:
    | PagedResponse<OperationRequest>
    | undefined

  alerts: ErrorDescription[] | null

  signersToRemove: User[]
  signersToAdd: string[]
  newThreshold: number | undefined

  operationTemplates: OperationTemplate[]
  selectedOperationTemplate: OperationTemplate | undefined

  busy: Busy
}

export const initialState: State = {
  selectedTab: Tab.TRANSFER,
  sessionUser: undefined,
  canSignIn: undefined,
  activeAccount: undefined,
  nodes: undefined,
  contracts: [],
  activeContract: undefined,
  contractCounters: new Map<string, number>(),
  allTokenMetadata: new Map<string, TokenMetadata[]>(),
  activeTokenId: undefined,
  users: [],
  signableMessages: new Map<string, SignableMessageInfo>(),
  balance: undefined,

  openOperationRequests: undefined,
  approvedOperationRequests: undefined,
  injectedOperationRequests: undefined,

  openChangeKeysOperationRequests: undefined,
  approvedChangeKeysOperationRequests: undefined,
  injectedChangeKeysOperationRequests: undefined,

  alerts: null,

  signersToRemove: [],
  signersToAdd: [],
  newThreshold: undefined,

  operationTemplates: [],
  selectedOperationTemplate: undefined,

  busy: {
    activeAccount: false,
    balance: false,
    operationRequests: false,
    changeKeysOperationRequests: false,
    contracts: false,
    users: false,
    signableMessages: false,
    contractCounters: false,
  },
}

export const reducer = createReducer(
  initialState,
  on(actions.selectTab, (state, { tab }) => ({
    ...state,
    selectedTab: tab,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.handleUnauthenticatedError, (state) => ({
    ...state,
    sessionUser: undefined,
    users: [],
    operationApprovals: new Map<string, OperationApproval[]>(),
    signableMessages: new Map<string, SignableMessageInfo>(),
    openOperationRequests: undefined,
    approvedOperationRequests: undefined,
    injectedOperationRequests: undefined,
    openBurnOperationRequests: undefined,
    approvedBurnOperationRequests: undefined,
    injectedBurnOperationRequests: undefined,
    openChangeKeysOperationRequests: undefined,
    approvedChangeKeysOperationRequests: undefined,
    injectedChangeKeysOperationRequests: undefined,
    operationTemplates: [],
  })),
  on(actions.updateCanSignIn, (state, { canSignIn }) => ({
    ...state,
    canSignIn,
  })),
  on(actions.getSessionUserSucceeded, (state, { sessionUser }) => ({
    ...state,
    sessionUser,
  })),
  on(actions.updateSessionUserSucceeded, (state, { sessionUser }) => ({
    ...state,
    sessionUser,
  })),
  on(actions.signOutSucceeded, (state) => ({
    ...state,
    canSignIn: undefined,
    sessionUser: undefined,
  })),
  on(actions.connectWallet, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.connectWalletSucceeded, (state, { accountInfo }) => ({
    ...state,
    activeAccount: accountInfo,
    busy: {
      ...state.busy,
      address: true,
    },
  })),
  on(actions.disconnectWallet, (state) => ({
    ...state,
    activeAccount: undefined,
    balance: undefined,
    busy: {
      ...state.busy,
      address: false,
    },
  })),
  on(actions.loadBalance, (state) => ({
    ...state,
    balance: undefined,
    busy: {
      ...state.busy,
      balance: true,
    },
  })),
  on(actions.loadBalanceSucceeded, (state, { balance }) => ({
    ...state,
    balance,
    busy: {
      ...state.busy,
      balance: false,
    },
  })),
  on(actions.loadBalanceFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      balance: false,
    },
  })),
  on(actions.loadTezosNodesSucceeded, (state, { response }) => ({
    ...state,
    nodes: response,
  })),
  on(actions.loadTezosNodesFailed, (state) => ({
    ...state,
    nodes: undefined,
  })),
  on(actions.loadContracts, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      contracts: true,
    },
  })),
  on(actions.loadContractsSucceeded, (state, { response }) => ({
    ...state,
    contracts: response.results,
    busy: {
      ...state.busy,
      contracts: false,
    },
  })),
  on(actions.loadContractsFailed, (state) => ({
    ...state,
    contracts: [],
    busy: {
      ...state.busy,
      contracts: false,
    },
  })),
  on(actions.loadUsers, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      users: true,
    },
  })),
  on(actions.loadUsersSucceeded, (state, { response }) => ({
    ...state,
    users: response.results,
    busy: {
      ...state.busy,
      users: false,
    },
  })),
  on(actions.loadUsersFailed, (state) => ({
    ...state,
    users: [],
    busy: {
      ...state.busy,
      users: false,
    },
  })),
  on(actions.loadOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationRequests: true,
    },
  })),
  on(actions.loadOpenOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    openOperationRequests: response,

    busy: {
      ...state.busy,
      operationRequests: false,
    },
  })),
  on(actions.loadApprovedOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    approvedOperationRequests: response,
    busy: {
      ...state.busy,
      operationRequests: false,
    },
  })),
  on(actions.loadInjectedOperationRequestsSucceeded, (state, { response }) => ({
    ...state,
    injectedOperationRequests: response,
    busy: {
      ...state.busy,
      operationRequests: false,
    },
  })),
  on(actions.loadOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      operationRequests: false,
    },
  })),
  on(actions.loadChangeKeysOperationRequests, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      changeKeysOperationRequests: true,
    },
  })),
  on(
    actions.loadOpenChangeKeysOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      openChangeKeysOperationRequests: response,
      busy: {
        ...state.busy,
        changeKeysOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadApprovedChangeKeysOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      approvedChangeKeysOperationRequests: response,
      busy: {
        ...state.busy,
        changeKeysOperationRequests: false,
      },
    })
  ),
  on(
    actions.loadInjectedChangeKeysOperationRequestsSucceeded,
    (state, { response }) => ({
      ...state,
      injectedChangeKeysOperationRequests: response,
      busy: {
        ...state.busy,
        changeKeysOperationRequests: false,
      },
    })
  ),
  on(actions.loadChangeKeysOperationRequestsFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      changeKeysOperationRequests: false,
    },
  })),
  on(actions.loadContractCounter, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      contractCounters: true,
    },
  })),
  on(actions.loadContractCounterSucceeded, (state, { contractId, counter }) => {
    const contractCounter = new Map(state.contractCounters)
    contractCounter.set(contractId, counter)
    return {
      ...state,
      contractCounters: contractCounter,
      busy: {
        ...state.busy,
        contractCounters: false,
      },
    }
  }),
  on(
    actions.getAllTokenMetadataSucceeded,
    (state, { contract, allTokenMetadata }) => {
      const tokenMetadata = new Map(state.allTokenMetadata)
      tokenMetadata.set(contract.id, allTokenMetadata)
      return {
        ...state,
        allTokenMetadata: tokenMetadata,
      }
    }
  ),
  on(actions.setActiveTokenId, (state, { tokenId }) => ({
    ...state,
    activeTokenId: tokenId,
  })),
  on(actions.getSignableMessage, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      signableMessages: true,
    },
  })),
  on(
    actions.getSignableMessageSucceeded,
    (state, { signableMessage, operationRequestId }) => {
      const signableMessages = new Map(state.signableMessages)
      signableMessages.set(operationRequestId, signableMessage)
      return {
        ...state,
        signableMessages,
        busy: {
          ...state.busy,
          signableMessages: false,
        },
      }
    }
  ),
  on(actions.getSignableMessageFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      signableMessages: false,
    },
  })),
  on(actions.setActiveContract, (state, { contract }) => ({
    ...state,
    users: [],
    activeContract: contract,
    openOperationRequests: undefined,
    approvedOperationRequests: undefined,
    injectedOperationRequests: undefined,
    openChangeKeysOperationRequests: undefined,
    approvedChangeKeysOperationRequests: undefined,
    injectedChangeKeysOperationRequests: undefined,
    signersToRemove: [],
    signersToAdd: [],
    operationTemplates: [],
    busy: {
      ...state.busy,
    },
  })),
  on(actions.showAlert, (state, { alertMessage }) => ({
    ...state,
    alerts: state.alerts ? [...state.alerts, alertMessage] : [alertMessage],
    busy: {
      ...state.busy,
    },
  })),
  on(actions.clearAlerts, (state) => ({
    ...state,
    alerts: null,
    busy: {
      ...state.busy,
    },
  })),
  on(actions.updateSignersToRemove, (state, { signer }) => {
    const removeIndex = state.signersToRemove.indexOf(signer)
    const toRemove = [...state.signersToRemove]
    if (removeIndex !== -1) {
      toRemove.splice(removeIndex, 1)
    } else {
      toRemove.push(signer)
    }
    return {
      ...state,
      signersToRemove: toRemove,
    }
  }),
  on(actions.resetSignersToRemove, (state) => ({
    ...state,
    signersToRemove: [],
  })),
  on(actions.updateSignersToAdd, (state, { signer }) => {
    const removeIndex = state.signersToAdd.indexOf(signer)
    const toAdd = [...state.signersToAdd]
    if (removeIndex !== -1) {
      toAdd.splice(removeIndex, 1)
    } else {
      toAdd.push(signer)
    }
    return {
      ...state,
      signersToAdd: toAdd,
    }
  }),
  on(actions.resetSignersToAdd, (state) => ({
    ...state,
    signersToAdd: [],
  })),
  on(actions.updateThreshold, (state, { threshold }) => ({
    ...state,
    newThreshold: threshold,
  })),
  on(actions.resetThreshold, (state) => ({
    ...state,
    newThreshold: undefined,
  })),
  on(actions.submitOperationRequest, (state, { newOperationRequest }) => ({
    ...state,
    busy: {
      ...state.busy,
      operationRequests:
        newOperationRequest.kind === OperationRequestKind.OPERATION ||
        state.busy.operationRequests,
      changeKeysOperationRequests:
        newOperationRequest.kind === OperationRequestKind.CHANGE_KEYS ||
        state.busy.changeKeysOperationRequests,
    },
  })),
  on(
    actions.submitOperationRequestFailed,
    (state, { newOperationRequest }) => ({
      ...state,
      busy: {
        ...state.busy,
        operationRequests:
          newOperationRequest.kind !== OperationRequestKind.OPERATION &&
          state.busy.operationRequests,
        changeKeysOperationRequests:
          newOperationRequest.kind !== OperationRequestKind.CHANGE_KEYS &&
          state.busy.changeKeysOperationRequests,
      },
    })
  ),
  on(actions.loadOperationTemplatesSucceeded, (state, { templates }) => ({
    ...state,
    operationTemplates: templates,
    selectedOperationTemplate: undefined,
  })),
  on(actions.setSelectedOperationTemplate, (state, { template }) => ({
    ...state,
    selectedOperationTemplate: template,
  }))
)
