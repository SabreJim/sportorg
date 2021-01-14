import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationData) { }

  public config: ConfirmationData;
  ngOnInit() {
    this.config = this.data;
  }

}
