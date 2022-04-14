import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { TezosToolkit, compose } from '@taquito/taquito'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { isNotNullOrUndefined } from 'src/app/app.operators'
import { getSelectedTezosNode } from 'src/app/app.selectors'
import * as fromRoot from '../../reducers/index'
import { Tzip12Module, tzip12, TokenMetadata } from '@taquito/tzip12'
import { tzip16 } from '@taquito/tzip16'
import { RpcClient } from '@taquito/rpc'

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public tezos: Observable<TezosToolkit>
  private rpcClient: Observable<RpcClient>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.tezos = this.store$.select(getSelectedTezosNode).pipe(
      isNotNullOrUndefined(),
      map((node) => {
        const tezos = new TezosToolkit(node.url)
        tezos.addExtension(new Tzip12Module())
        return tezos
      })
    )
    this.rpcClient = this.store$.select(getSelectedTezosNode).pipe(
      isNotNullOrUndefined(),
      map((node) => new RpcClient(node.url))
    )
  }

  public async getAllTokens(contractAddress: string): Promise<TokenMetadata[]> {
    const tezos = await this.tezos.pipe(take(1)).toPromise()
    const contract = await tezos.contract.at(
      contractAddress,
      compose(tzip12, tzip16)
    )
    const allTokens: number[] = await (async (): Promise<number[]> => {
      try {
        const metadataViews = await contract.tzip16().metadataViews()
        return await metadataViews['all_tokens']().executeView()
      } catch (_error) {
        return [0]
      }
    })()
    return await Promise.all(
      allTokens.map((tokenId) => contract.tzip12().getTokenMetadata(tokenId))
    )
  }
}
