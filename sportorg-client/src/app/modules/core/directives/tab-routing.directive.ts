import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import { MatTabGroup } from "@angular/material/tabs";

@Directive({
  selector: '[appTabRouting]'
})
export class TabRoutingDirective implements  OnInit {

  @Input() tabGroup: MatTabGroup;
  constructor() {
  }

  // example usage:   <mat-tab-group#tabGroup  appTabRouting [tabGroup]="tabGroup" >
  ngOnInit(): void {
    if (this.tabGroup && this.tabGroup.selectedIndexChange){
      this.tabGroup .selectedIndexChange.subscribe((tabIndex: number) => {
      });
    } else {
    }

  }

}
