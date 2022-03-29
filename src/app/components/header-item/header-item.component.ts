import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { combineLatest, Observable } from 'rxjs'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { map, take } from 'rxjs/operators'
import { Contract } from 'src/app/services/api/interfaces/contract'
import {
  getActiveAccount,
  getActiveContract,
  getContracts,
  getSessionUser,
} from 'src/app/app.selectors'
import { SessionUser } from 'src/app/services/api/interfaces/auth'

@Component({
  selector: 'app-header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss'],
})
export class HeaderItemComponent implements OnInit {
  public sessionUser$: Observable<SessionUser | undefined>
  public username$: Observable<string | undefined>
  public activeContract$: Observable<Contract | undefined>
  public contracts$: Observable<Contract[]>
  // public imageSrcMap$: Observable<Map<string, string>>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.activeContract$ = this.store$.select(getActiveContract)
    this.contracts$ = this.store$.select(getContracts)
    // this.imageSrcMap$ = this.contracts$.pipe(
    //   map(
    //     (contracts) =>
    //       new Map<string, string>(
    //         contracts.map((contract) => [
    //           contract.id,
    //           `/assets/img/${contract.symbol.toLowerCase()}.svg`,
    //         ])
    //       )
    //   )
    // )
    this.sessionUser$ = this.store$.select(getSessionUser)
    this.username$ = combineLatest([
      this.store$.select(getActiveAccount),
      this.sessionUser$,
    ]).pipe(
      map(([activeAccount, sessionUser]) => {
        if (activeAccount === undefined) {
          return undefined
        }
        let name = activeAccount.address
        if (sessionUser !== undefined) {
          name =
            sessionUser.display_name.length > 0
              ? sessionUser.display_name
              : sessionUser.address
        }
        return name
      })
    )
  }

  ngOnInit(): void {}

  reset(): void {
    this.store$.dispatch(actions.disconnectWallet())
  }

  changeContract(contract: Contract) {
    this.activeContract$.pipe(take(1)).subscribe((currentActive) => {
      if (currentActive?.id !== contract.id) {
        this.store$.dispatch(actions.setActiveContract({ contract }))
      }
    })
  }
}
