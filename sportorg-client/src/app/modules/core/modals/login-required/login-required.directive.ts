import {
  Directive,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {AppMember} from "../../models/data-objects";
import { MatDialog } from "@angular/material/dialog";
import {LoginRequiredComponent} from "./login-required.component";


@Directive({selector: '[appLoginRequired]'})
export class LoginRequiredDirective implements OnInit, OnDestroy {
  @Input() forceLogin: boolean = false;


  constructor (public dialog: MatDialog) {}

  @HostListener('click', ['$event']) bypassClick(event: MouseEvent) {
    if (this.forceLogin === true) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const dialogRef = this.dialog.open(LoginRequiredComponent, { maxHeight: '80vh', maxWidth: '800px' });
      dialogRef.afterClosed().subscribe((result: AppMember) => {
      });
    }
  }


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

}
