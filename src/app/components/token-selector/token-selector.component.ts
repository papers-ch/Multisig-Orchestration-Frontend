import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { TokenMetadata } from '@taquito/tzip12'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-token-selector',
  templateUrl: './token-selector.component.html',
  styleUrls: ['./token-selector.component.scss'],
})
export class TokenSelectorComponent implements OnChanges, OnDestroy {
  @Input()
  public allTokenMetadata: TokenMetadata[] | undefined
  @Input()
  public selectedTokenMetadataIndex: number | undefined

  @Output()
  public onSelectedTokenMetadata = new EventEmitter<TokenMetadata>()

  public formGroup: FormGroup
  public get tokenControl(): FormControl {
    return this.formGroup.controls.tokenControl as FormControl
  }

  private get selectedTokenId(): number | null {
    return this.selectedTokenMetadataIndex !== undefined &&
      this.allTokenMetadata !== undefined
      ? this.allTokenMetadata[this.selectedTokenMetadataIndex].token_id
      : null
  }

  private valueChangedSub: Subscription

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      tokenControl: formBuilder.control(this.selectedTokenId, [
        Validators.required,
      ]),
    })
    this.valueChangedSub = this.tokenControl.valueChanges.subscribe(() => {
      const tokenId = Number(this.tokenControl.value)
      if (!isNaN(tokenId)) {
        const tokenMetadata = this.allTokenMetadata?.find(
          (token) => token.token_id === tokenId
        )
        if (tokenMetadata !== undefined) {
          this.onSelectedTokenMetadata.emit(tokenMetadata)
        }
      }
    })
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['selectedTokenMetadataIndex']
    if (change !== undefined) {
      if (change.currentValue !== this.tokenControl.value) {
        setTimeout(() => this.tokenControl.patchValue(this.selectedTokenId))
      }
    }
  }

  public ngOnDestroy(): void {
    this.valueChangedSub.unsubscribe()
  }
}
