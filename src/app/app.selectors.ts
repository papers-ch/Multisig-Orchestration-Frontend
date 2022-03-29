import { createSelector } from '@ngrx/store'
import { selectApp } from './reducers'
import { UserKind } from './services/api/interfaces/user'

export const getActiveContract = createSelector(
  selectApp,
  (state) => state.activeContract
)

export const getSelectedTezosNode = createSelector(selectApp, (state) =>
  state.nodes?.find((node) => node.selected)
)

export const getTezosNodes = createSelector(selectApp, (state) => state.nodes)

export const getContracts = createSelector(
  selectApp,
  (state) => state.contracts
)

export const getSessionUser = createSelector(
  selectApp,
  (state) => state.sessionUser
)

export const getCanSignIn = createSelector(
  selectApp,
  (state) => state.canSignIn
)

export const getActiveAccount = createSelector(
  selectApp,
  (state) => state.activeAccount
)

export const getAddress = createSelector(
  getActiveAccount,
  (activeAccount) => activeAccount?.address
)

export const getSelectedTab = createSelector(
  selectApp,
  (state) => state.selectedTab
)

export const getUsers = createSelector(selectApp, (state) => state.users)

export const getBalance = createSelector(selectApp, (state) => state.balance)

export const getSigners = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.SIGNER)
)

export const getGatekeepers = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.GATEKEEPER)
)

export const getAdmins = createSelector(getUsers, (users) =>
  users.filter((user) => user.kind === UserKind.ADMIN)
)

export const isGatekeeper = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) =>
        role.contract_id === contract.id && role.kind === UserKind.GATEKEEPER
    )
)

export const isSigner = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) =>
        role.contract_id === contract.id && role.kind === UserKind.SIGNER
    )
)

export const isAdmin = createSelector(
  getActiveContract,
  getSessionUser,
  (contract, user) =>
    contract !== undefined &&
    user !== undefined &&
    user.roles.some(
      (role) => role.contract_id === contract.id && role.kind === UserKind.ADMIN
    )
)

export const getOpenOperationRequests = createSelector(
  selectApp,
  (state) => state.openOperationRequests
)

export const getOpenOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.openOperationRequests?.page
)

export const getApprovedOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedOperationRequests
)

export const getApprovedOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedOperationRequests?.page
)

export const getInjectedOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedOperationRequests
)

export const getInjectedOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedOperationRequests?.page
)

export const getOpenChangeKeysOperationRequests = createSelector(
  selectApp,
  (state) => {
    return state.openChangeKeysOperationRequests
  }
)

export const getOpenChangeKeysOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => {
    return state.openChangeKeysOperationRequests?.page
  }
)

export const getApprovedChangeKeysOperationRequests = createSelector(
  selectApp,
  (state) => state.approvedChangeKeysOperationRequests
)

export const getApprovedChangeKeysOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.approvedChangeKeysOperationRequests?.page
)

export const getInjectedChangeKeysOperationRequests = createSelector(
  selectApp,
  (state) => state.injectedChangeKeysOperationRequests
)

export const getInjectedChangeKeysOperationRequestCurrentPage = createSelector(
  selectApp,
  (state) => state.injectedChangeKeysOperationRequests?.page
)

export const getAlerts = createSelector(selectApp, (state) => state.alerts)

export const getSignersToRemove = createSelector(
  selectApp,
  (state) => state.signersToRemove
)

export const getSignersToAdd = createSelector(
  selectApp,
  (state) => state.signersToAdd
)

export const getNewThreshold = createSelector(
  selectApp,
  (state) => state.newThreshold
)

export const getBusyOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.operationRequests
)

export const getBusyChangeKeysOperationRequests = createSelector(
  selectApp,
  (state) => state.busy.changeKeysOperationRequests
)
