import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {CommonModule} from "@angular/common";
import { ClassPageComponent } from './class-page/class-page.component';
import { MemberPageComponent } from './member-page/member-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { DynamicPageComponent } from './dynamic-page/dynamic-page.component';
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {jqxSchedulerModule} from "jqwidgets-ng/jqxscheduler";
import {CoreModule} from "../core/core.module";
import {RegisterPageComponent} from "./register-page/register-page.component";
import { AdminPageComponent } from './admin-page/admin-page.component';
import { MyProfilePageComponent } from './my-profile-page/my-profile-page.component';
import { SchedulePageComponent } from './schedule-page/schedule-page.component';
import {PostEditorPageComponent} from "./post-editor-page/post-editor-page.component";
import {PostPageComponent} from "./post-page/post-page.component";
import {PostLinkComponent} from "./post-editor-page/post-link/post-link.component";
import {NewsPageComponent} from "./news-page/news-page.component";
import {EventItemPageComponent} from "./event-page/event-item-page/event-item-page.component";
import {RankingPageComponent} from "./ranking-page/ranking-page.component";
import {RankingItemPageComponent} from "./ranking-page/ranking-item-page/ranking-item-page.component";

@NgModule({
  declarations: [
    ClassPageComponent,
    MemberPageComponent,
    EventPageComponent,
    DynamicPageComponent,
    RegisterPageComponent,
    AdminPageComponent,
    PostEditorPageComponent,
    PostPageComponent,
    PostLinkComponent,
    MyProfilePageComponent,
    SchedulePageComponent,
    NewsPageComponent,
    EventItemPageComponent,
    RankingPageComponent,
    RankingItemPageComponent
  ],
  exports: [

  ],
  imports: [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    jqxSchedulerModule,
    CoreModule
  ],
  providers: [

  ]
})
export class PagesModule { }
