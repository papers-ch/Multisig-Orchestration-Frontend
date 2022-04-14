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
export class HeaderItemComponent {
  public sessionUser$: Observable<SessionUser | undefined>
  public username$: Observable<string | undefined>
  public activeContract$: Observable<Contract | undefined>
  public contracts$: Observable<Contract[]>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.activeContract$ = this.store$.select(getActiveContract)
    this.contracts$ = this.store$.select(getContracts)
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

  public toggleWallet(): void {
    this.username$.pipe(take(1)).subscribe((username) => {
      if (username === undefined) {
        this.store$.dispatch(actions.connectWallet())
      } else {
        this.store$.dispatch(actions.disconnectWallet())
      }
    })
  }

  public changeContract(contract: Contract) {
    this.activeContract$.pipe(take(1)).subscribe((currentActive) => {
      if (currentActive?.id !== contract.id) {
        this.store$.dispatch(actions.setActiveContract({ contract }))
      }
    })
  }
}
