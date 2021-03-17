import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import {Subscription} from "rxjs";
import {SnackbarService, SnackMessage} from "../services/snackbar.service";

@Component({
  selector: 'app-org-snackbar',
  templateUrl: './org-snackbar.component.html',
  styleUrls: ['./org-snackbar.component.scss']
})
export class OrgSnackbarComponent implements OnInit, OnDestroy {

  constructor(private matSnackbar: MatSnackBar) { }
  protected sub: Subscription;
  ngOnInit() {
    this.sub = SnackbarService.Notifications.subscribe((notice: SnackMessage) => {
      if (notice.type === 'error') {
        this.matSnackbar.open(notice.message, notice.action, { duration: notice.duration, panelClass: 'error-panel' });
      } else {
        this.matSnackbar.open(notice.message, notice.action, { duration: notice.duration });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub && this.sub.unsubscribe) {
      this.sub.unsubscribe();
    }
  }
}
