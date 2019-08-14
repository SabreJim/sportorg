import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from "./modules/pages/home/home-page.component";
import {ClassPageComponent} from "./modules/pages/class-page/class-page.component";
import {FencerPageComponent} from "./modules/pages/fencer-page/fencer-page.component";
import {EventPageComponent} from "./modules/pages/event-page/event-page.component";
import {AboutPageComponent} from "./modules/pages/about-page/about-page.component";


const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'classes', component: ClassPageComponent },
  { path: 'fencers', component: FencerPageComponent },
  { path: 'events', component: EventPageComponent },
  { path: 'about-us', component: AboutPageComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
