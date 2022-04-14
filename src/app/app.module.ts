import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { ModalModule } from 'ngx-bootstrap/modal'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { Store, StoreModule } from '@ngrx/store'
import { HeaderItemComponent } from './components/header-item/header-item.component'
import { MultiSignatureItemComponent } from './components/multi-signature-item/multi-signature-item.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { BeaconService } from './services/beacon/beacon.service'
import { EffectsModule } from '@ngrx/effects'
import { AppEffects } from './app.effects'
import { metaReducers, ROOT_REDUCERS } from './reducers'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { OperationRequestComponent } from './components/operation-request/operation-request.component'
import { ModalItemComponent } from './components/modal-item/modal-item.component'
import { AmountConverterPipe } from './pipes/amount.pipe'
import { ShortenPipe } from './pipes/shorten.pipe'
import { ErrorItemComponent } from './components/error-item/error.component'
import { CopyService } from './services/copy/copy-service.service'
import { AlertModule } from 'ngx-bootstrap/alert'
import { OperationRequestListComponent } from './components/operation-request-list/operation-request-list.component'
import { CacheService } from './services/cache/cache.service'
import { DeleteModalItemComponent } from './components/delete-modal-item/delete-modal-item.component'
import { OperationRequestGroupComponent } from './components/operation-request-group/operation-request-group.component'
import { UploadSignatureComponent } from './components/upload-signature/upload-signature.component'
import { TransferFormComponent } from './components/transfer-form/transfer-form.component'
import { TokenSelectorComponent } from './components/token-selector/token-selector.component'
import { OperationFormComponent } from './components/operation-form/operation-form.component'
import { SettingsTemplateComponent } from './components/settings-template/settings-template.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderItemComponent,
    MultiSignatureItemComponent,
    SettingsComponent,
    DashboardComponent,
    OperationRequestComponent,
    ShortenPipe,
    ModalItemComponent,
    AmountConverterPipe,
    ErrorItemComponent,
    OperationRequestListComponent,
    DeleteModalItemComponent,
    OperationRequestGroupComponent,
    UploadSignatureComponent,
    TransferFormComponent,
    TokenSelectorComponent,
    OperationFormComponent,
    SettingsTemplateComponent,
  ],
  imports: [
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    AccordionModule.forRoot(),
    ModalModule.forRoot(),
    BrowserModule,
    FormsModule,
    CommonModule,
    TabsModule.forRoot(),
    AppRoutingModule,
    EffectsModule.forRoot([AppEffects]),
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [BeaconService, Store, CopyService, CacheService],
  bootstrap: [AppComponent],
})
export class AppModule {}
