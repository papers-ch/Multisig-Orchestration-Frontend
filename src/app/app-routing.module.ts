import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { Tab } from './pages/dashboard/tab'
import { SettingsComponent } from './pages/settings/settings.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: Tab.OPERATION.replace('tab-', ''),
    pathMatch: 'full',
  },
  { path: 'settings', component: SettingsComponent },
  { path: ':tab', component: DashboardComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
