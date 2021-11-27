import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import {EventLandingPageComponent} from "./event-page/event-landing-page.component";
import {EventRegisterModalComponent} from "./register-modal/event-register-modal.component";
import {EventFormatModalComponent} from "./event-format-modal/event-format-modal.component";
import {EventPoolTabComponent} from "./event-page/tabs/pool-tab/event-pool-tab.component";
import {EventTableauTabComponent} from "./event-page/tabs/tableau-tab/event-tableau-tab.component";
import {EventFormatItemComponent} from "./event-format-modal/event-format-item/event-format-item.component";
import {PoolViewerComponent} from "./event-page/tabs/pool-tab/pool-viewer/pool-viewer.component";
import {PoolEditorComponent} from "./event-page/tabs/pool-tab/pool-editor/pool-editor.component";
import {EventRankingTabComponent} from "./event-page/tabs/ranking-tab/event-ranking-tab.component";


@NgModule({
  declarations: [
    EventLandingPageComponent,
    EventRegisterModalComponent,
    EventFormatModalComponent,
    EventPoolTabComponent,
    EventTableauTabComponent,
    EventRankingTabComponent,
    EventFormatItemComponent,
    PoolViewerComponent,
    PoolEditorComponent
  ],
  exports: [
    EventLandingPageComponent
  ],
  imports: [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CoreModule
  ],
  providers: [
    EventRegisterModalComponent,
    EventFormatModalComponent
  ]
})
export class EventsModule { }
