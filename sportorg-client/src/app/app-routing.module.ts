import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ClassPageComponent} from "./modules/pages/class-page/class-page.component";
import {MemberPageComponent} from "./modules/pages/member-page/member-page.component";
import {EventPageComponent} from "./modules/pages/event-page/event-page.component";
import {DynamicPageComponent} from "./modules/pages/dynamic-page/dynamic-page.component";
import {RegisterPageComponent} from "./modules/pages/register-page/register-page.component";
import {AdminPageComponent} from "./modules/pages/admin-page/admin-page.component";
import {RouteGuardService} from "./modules/core/route-guard/route-guard.service";
import {MyProfilePageComponent} from "./modules/pages/my-profile-page/my-profile-page.component";
import {SchedulePageComponent} from "./modules/pages/schedule-page/schedule-page.component";
import {FitnessPageComponent} from "./modules/fitness-tracker/fitness-page/fitness-page.component";
import {FitnessProfilePageComponent} from "./modules/fitness-tracker/fitness-profile-page/fitness-profile-page.component";
import {PostEditorPageComponent} from "./modules/pages/post-editor-page/post-editor-page.component";
import {PostPageComponent} from "./modules/pages/post-page/post-page.component";
import {NewsPageComponent} from "./modules/pages/news-page/news-page.component";


const routes: Routes = [
  { path: 'programs', component: ClassPageComponent },
  { path: 'schedule', component: SchedulePageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'members', component: MemberPageComponent },
  { path: 'events', component: EventPageComponent },
  { path: 'my-profile', component: MyProfilePageComponent },
  { path: 'admin', component: AdminPageComponent, canActivate: [RouteGuardService] },
  { path: 'edit-post/:postId', component: PostEditorPageComponent, canActivate: [RouteGuardService] },
  { path: 'edit-post', component: PostEditorPageComponent, canActivate: [RouteGuardService] },
  { path: 'news/:postId', component: PostPageComponent},
  { path: 'event/:postId', component: PostPageComponent},
  { path: 'camp/:postId', component: PostPageComponent},
  { path: 'fitness-tracker', component: FitnessPageComponent },
  { path: 'fitness-tracker/profile/:athleteId', component: FitnessProfilePageComponent },

  { path: 'home', component: NewsPageComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: '**', component: DynamicPageComponent }
];
// DynamicPageComponent catches all other routes and pulls the content from the DB

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    useHash: true,
    relativeLinkResolution: 'corrected'
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
