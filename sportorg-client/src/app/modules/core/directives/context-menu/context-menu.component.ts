import {AfterViewInit, Component, ViewChild, EventEmitter} from "@angular/core";
import {MatMenuTrigger, MenuPositionX, MenuPositionY} from "@angular/material/menu";
import {ContextMenuItem} from "./context-menu.directive";


@Component({
  selector: 'org-context-menu',
  template: `<div class="hidden-trigger" [matMenuTriggerFor]="contextMenu" #menuTrigger="matMenuTrigger"></div>
  <mat-menu #contextMenu="matMenu" [hasBackdrop]="true" [backdropClass]="'cdk-overlay-transparent-backdrop'" [yPosition]="yPosition">
      <ng-container *ngFor="let item of menuItems">
          <button class="mat-menu-item"  *ngIf="item.menuAction"
                  (click)="runClick(item.menuAction)">{{item.menuTitle}}</button>
          <button class="mat-menu-item" *ngIf="item.subMenu" [matMenuTriggerFor]="subMenu"
                  (click)="$event.stopPropagation()"
          >{{item.menuTitle}}</button>
          
          <mat-menu #subMenu="matMenu" [xPosition]="'after'">
              <button class="mat-menu-item"  *ngFor="let subItem of item.subMenu"
                      (click)="runClick(subItem.menuAction)">{{subItem.menuTitle}}</button>
          </mat-menu>
      </ng-container>
  </mat-menu>`
})
export class ContextMenuComponent implements AfterViewInit {

  @ViewChild('menuTrigger') contextTrigger: MatMenuTrigger;

  public contextRecord: any;
  public menuItems: ContextMenuItem[] = [];
  public closeContext = new EventEmitter();
  public xPosition: MenuPositionX;
  public yPosition: MenuPositionY;

  public closeMenu = () => {
    this.closeContext.emit();
  }

  public runClick = (fn: (record: any) => void) => {
    if (fn) {
      fn(this.contextRecord);
    }
  }
  ngAfterViewInit(){
    setTimeout(() => { // manually open the menu
      this.contextTrigger.openMenu();
    });
  }
}
