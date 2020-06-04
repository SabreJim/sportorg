import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {MatDialog} from "@angular/material";
import {ConfirmModalComponent} from "../modals/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() entityType: string = 'record';
  @Input() formFields: TableColumn[] = [];
  @Input() identityField: string = 'id';
  @Input() set editingRow (row: any) {
    // const fields = row ? Object.keys(row) : [];
    // if (fields.length) {
      this.currentRow = this.generateDefault(row);
      this.isDirty = false;
      if (this.currentRow[this.identityField] && this.currentRow[this.identityField] > 0) {
        this.entitySaved = true;
      } else {
        this.entitySaved = false;
      }
  }
  // from the editing row, or a blank object, ensure we have all the fields listed
  protected generateDefault = (row: any) => {
    let safeRow = row || {};
    this.formFields.map((field: TableColumn) => {
      if (!safeRow.hasOwnProperty(field.fieldName)) {
        safeRow[field.fieldName] = null;
      }
    });
    return safeRow;
  }

  @Output() saveRecord = new EventEmitter<any>();
  @Output() deleteRecord = new EventEmitter<any>();
  public currentRow: any = {};
  public isDirty = false;
  public entitySaved = false;

  public saveChanges = () => {
    this.saveRecord.emit(this.currentRow);
    this.entitySaved = true;
    this.currentRow = {};
  };

  public requestDelete = () => {
    // confirm deletion
    const dialogRef = this.dialog.open(ConfirmModalComponent,
      { width: '350px', height: '250px', data: { title: `Confirm deleting ${this.entityType}`,
          message: `Are you sure you want to delete this ${this.entityType}?`}})
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // send deletion request
        this.deleteRecord.emit(this.currentRow);
      }
    });
  };

  public updateDate = (newDate: string, fieldName: string) => {
    if (newDate !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newDate;
      this.isDirty = true;
    }
  };
  public updateSelection = (newId: number, fieldName: string) => {
    if (newId !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newId;
      this.isDirty = true;
    }
  };
  public updateBoolean = (newValue: string, fieldName: string) => {
    if (newValue !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newValue;
      this.isDirty = true;
    }
  };
  public updateTime = (newTime: string, fieldName: string) => {
    if (newTime !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newTime;
      this.isDirty = true;
    }
  };
  public updateNumber = (newNumber: number, fieldName: string) => {
    if (newNumber !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newNumber;
      this.isDirty = true;
    }
  };
  public updateString = (newNumber: string, fieldName: string) => {
    if (newNumber !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newNumber;
      this.isDirty = true;
    }
  };
  public updateHtml = (newHtml: string, fieldName: string) => {
    if (newHtml !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newHtml;
      this.isDirty = true;
    }
  };
  constructor(public dialog: MatDialog, private lookupService: LookupProxyService) { }

  ngOnInit() {
  }

}
