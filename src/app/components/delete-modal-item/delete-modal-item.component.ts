import { OperationRequest } from 'src/app/services/api/interfaces/operationRequest'
import { Component, Input, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../reducers/index'
import * as actions from '../../app.actions'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-delete-modal-item',
  templateUrl: './delete-modal-item.component.html',
  styleUrls: ['./delete-modal-item.component.scss'],
})
export class DeleteModalItemComponent implements OnInit {
  @Input()
  operationRequest!: OperationRequest

  @Input()
  contractCounters$!: Observable<Map<string, number>>

  constructor(
    public bsModalRef: BsModalRef,
    private readonly store$: Store<fromRoot.State>
  ) {}

  ngOnInit(): void {}

  delete() {
    this.store$.dispatch(
      actions.deleteOperationRequest({
        operationRequest: this.operationRequest,
      })
    )
  }
}
