import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {StaticValuesService} from "../../services/static-values.service";
import {TableColumn} from "../../models/ui-objects";
import { clone, equals } from 'ramda';
import {EditModalResponse} from "../edit-panel.component";

@Component({
  selector: 'edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent {
  constructor (@Inject(MAT_DIALOG_DATA) public data: any,
               public matDialogRef: MatDialogRef<EditModalComponent>) {
    if (data && data.columns) {
      if (data.record) {
        this.record = data.record;
        this.originalRecord = clone(data.record);
        this.isNewRecord = false;
      } else {
        this.record = {};
        this.originalRecord = clone({});
        this.isNewRecord = true;
      }
      this.entityType = data.entityType;
      this.formFields = data.columns;
    }
  }

  public recordValid = true;
  public isNewRecord = true;
  public record: any = null;
  protected originalRecord: any = null;
  public entityType: string = 'Record';
  public formFields: TableColumn[] = [];

  //////////////////////////////////////////////////////
  // updating local values
  //////////////////////////////////////////////////////
  public updateDate = (newDate: string, fieldName: string) => {
    if (newDate !== this.record[fieldName]){
      this.record[fieldName] = newDate;
    }
  };
  public updateSelection = (newId: number, fieldName: string) => {
    if (newId !== this.record[fieldName]){
      this.record[fieldName] = newId;
    }
  };
  public updateBoolean = (newValue: string, fieldName: string) => {
    if (newValue !== this.record[fieldName]){
      this.record[fieldName] = newValue;
    }
  };
  public updateTime = (newTime: string, fieldName: string) => {
    if (newTime !== this.record[fieldName]){
      this.record[fieldName] = newTime;
    }
  };
  public updateNumber = (newNumber: number, fieldName: string) => {
    if (newNumber !== this.record[fieldName]){
      this.record[fieldName] = newNumber;
    }
  };
  public updateString = (newNumber: string, fieldName: string) => {
    if (newNumber !== this.record[fieldName]){
      this.record[fieldName] = newNumber;
    }
  };
  public updateHtml = (newHtml: string, fieldName: string) => {
    if (newHtml !== this.record[fieldName]){
      this.record[fieldName] = newHtml;
    }
  };
  public updateFileId = (newId: number, fieldName: string) => {
    if (newId !== this.record[fieldName]){
      this.record[fieldName] = newId;
    }
  };


  ///////////////////////////////////////////////////////////
  // completing save/delete
  //////////////////////////////////////////////////////////
  public saveRecord = () => {
    const response: EditModalResponse = { saveRecord: true, record: this.record };
    this.matDialogRef.close(response);
  }
  public deleteRecord = () => {
    const response: EditModalResponse = { deleteRecord: true, record: this.record };
    this.matDialogRef.close(response);
  }
  public isDirty = () => {
    return !equals(this.record, this.originalRecord);
  }
}
