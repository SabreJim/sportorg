import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {HomePageComponent} from "./home/home-page.component";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    HomePageComponent
  ],
  exports: [

  ],
  imports: [
    MaterialModule,
    CommonModule
  ],
  providers: [

  ]
})
export class PagesModule { }
