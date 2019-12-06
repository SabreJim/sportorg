import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from "./modules/pages/home/home-page.component";
import {ClassPageComponent} from "./modules/pages/class-page/class-page.component";
import {FencerPageComponent} from "./modules/pages/fencer-page/fencer-page.component";
import {EventPageComponent} from "./modules/pages/event-page/event-page.component";
import {AboutPageComponent} from "./modules/pages/about-page/about-page.component";
import {FeesPageComponent} from "./modules/pages/fees-page/fees-page.component";
import {AdminPageComponent} from "./modules/pages/admin-page/admin-page.component";
import {RouteGuardService} from "./modules/core/route-guard/route-guard.service";
import {MyProfilePageComponent} from "./modules/pages/my-profile-page/my-profile-page.component";


const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'classes', component: ClassPageComponent },
  { path: 'classes/fees', component: FeesPageComponent },
  { path: 'fencers', component: FencerPageComponent },
  { path: 'events', component: EventPageComponent },
  { path: 'about-us', component: AboutPageComponent },
  { path: 'my-profile', component: MyProfilePageComponent },
  { path: 'admin', component: AdminPageComponent, canActivate: [RouteGuardService] }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      useHash: true,
      // enableTracing: true
  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
