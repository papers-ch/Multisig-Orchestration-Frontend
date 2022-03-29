import { Injectable } from '@angular/core'
import {
  AccountInfo,
  NetworkType,
  OperationResponseOutput,
  PermissionScope,
  RequestOperationInput,
  SigningType,
  SignPayloadResponseOutput,
} from '@airgap/beacon-sdk'
import { TezosToolkit, WalletContract } from '@taquito/taquito'
import BigNumber from 'bignumber.js'
import { BeaconWallet } from '@taquito/beacon-wallet'

import { RpcClient } from '@taquito/rpc'
import { Uint8ArrayConsumer } from '@taquito/local-forging'
import { Contract } from '../api/interfaces/contract'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import { Observable } from 'rxjs'
import { getSelectedTezosNode } from 'src/app/app.selectors'
import { map, take } from 'rxjs/operators'
import { isNotNullOrUndefined } from 'src/app/app.operators'

const MichelsonCodec = require('@taquito/local-forging/dist/lib/michelson/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public balance: BigNumber | undefined
  public contractInstance: WalletContract | undefined
  public scopes: PermissionScope[] | undefined

  public wallet: BeaconWallet = new BeaconWallet({ name: 'Foundry' })
  public tezos: Observable<TezosToolkit>
  private rpcClient: Observable<RpcClient>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.tezos = this.store$.select(getSelectedTezosNode).pipe(
      isNotNullOrUndefined(),
      map((node) => {
        const tezos = new TezosToolkit(node.url)
        tezos.setWalletProvider(this.wallet)
        return tezos
      })
    )
    this.rpcClient = this.store$.select(getSelectedTezosNode).pipe(
      isNotNullOrUndefined(),
      map((node) => new RpcClient(node.url))
    )
  }

  async activeAccount(): Promise<AccountInfo | undefined> {
    return this.wallet.client.getActiveAccount()
  }

  async requestPermission(): Promise<AccountInfo | undefined> {
    const node = await this.store$
      .select(getSelectedTezosNode)
      .pipe(isNotNullOrUndefined(), take(1))
      .toPromise()
    await this.wallet.requestPermissions({
      network: { rpcUrl: node!.url, type: node!.network as NetworkType },
    })
    return this.wallet.client.getActiveAccount()
  }

  async transferOperation(
    tokenId: number,
    amount: BigNumber,
    receivingAddress: string,
    contract: Contract
  ): Promise<void> {
    let tezos = await this.tezos.pipe(take(1)).toPromise()
    let contractInstance = await tezos.wallet.at(contract.address)
    const pkhSrc = await this.wallet.getPKH()
    let operation = await contractInstance.methods
      .transfer([
        {
          from_: pkhSrc,
          txs: [
            {
              to_: receivingAddress,
              token_id: tokenId,
              amount: amount.toFixed(),
            },
          ],
        },
      ])
      .send()
    await operation.confirmation()
  }

  async sign(
    message: string,
    signingType: SigningType = SigningType.MICHELINE
  ): Promise<SignPayloadResponseOutput> {
    return this.wallet.client.requestSignPayload({
      payload: message,
      signingType,
    })
  }

  async operation(
    input: RequestOperationInput
  ): Promise<OperationResponseOutput> {
    return this.wallet.client.requestOperation(input)
  }

  async reset(): Promise<void> {
    return this.wallet.clearActiveAccount()
  }

  async getBalance(
    tokenId: number,
    address: string,
    contract: Contract
  ): Promise<BigNumber | undefined> {
    const storage: Storage = await this.fetchStorage(contract)
    const balance = await storage.ledger.get({
      token_id: tokenId,
      owner: address,
    })
    return new BigNumber(balance ?? 0)
  }

  private dataCache: Map<string, any> = new Map()
  private pendingRequests: Map<string, Promise<any>> = new Map()

  private async fetchStorage(contract: Contract): Promise<any> {
    let storage = this.dataCache.get(contract.address)
    if (storage !== undefined) {
      return storage
    }
    const promise = this.pendingRequests.get(contract.address)
    if (promise) {
      return promise
    }
    const tezos = await this.tezos.pipe(take(1)).toPromise()
    const storagePromise = tezos.wallet
      .at(contract.address)
      .then((contractInstance) => {
        return contractInstance
          .storage()
          .finally(() => this.pendingRequests.delete(contract.address))
      })
    this.pendingRequests.set(contract.address, storagePromise)
    storage = await storagePromise
    this.dataCache.set(contract.address, storage)
    return storage
  }

  private async fetchPackedData(
    cacheKey: string,
    data: any,
    dataType: any
  ): Promise<{
    packed: string
    gas: BigNumber | 'unaccounted' | undefined
  }> {
    let packedData = this.dataCache.get(cacheKey)
    if (packedData) {
      return packedData
    }
    const promise = this.pendingRequests.get(cacheKey)
    if (promise) {
      return promise
    }
    const client = await this.rpcClient.pipe(take(1)).toPromise()
    const packDataPromise = client
      .packData({
        data: data,
        type: dataType,
      })
      .finally(() => this.pendingRequests.delete(cacheKey))
    this.pendingRequests.set(cacheKey, packDataPromise)
    packedData = await packDataPromise
    this.dataCache.set(cacheKey, packedData)
    return packedData
  }

  private async getFA1Balance(contract: Contract, userAddress: string) {
    const client = await this.rpcClient.pipe(take(1)).toPromise()

    const packedData = await this.fetchPackedData(
      `${contract.address}-ledger-${userAddress}`,
      {
        prim: 'Pair',
        args: [{ string: 'ledger' }, { string: userAddress }],
      },
      {
        prim: 'pair',
        args: [{ prim: 'string' }, { prim: 'address' }],
      }
    )

    const storage: any = await this.fetchStorage(contract)
    const bigMap = storage['0'] ?? storage.dataMap
    const value: any = await bigMap.get(packedData.packed)

    const decodedValue = MichelsonCodec.valueDecoder(
      Uint8ArrayConsumer.fromHexString(value.slice(2))
    )

    return new BigNumber(decodedValue.args[0].int)
  }
}
