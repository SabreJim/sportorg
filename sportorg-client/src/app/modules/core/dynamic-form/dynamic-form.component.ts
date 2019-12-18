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
  @Input() set editingRow (row: any) {
    const fields = row ? Object.keys(row) : [];
    if (fields.length) {
      this.currentRow = row;
      this.isDirty = false;
      this.entitySaved = true;
    } else { // an empty row was passed in
      this.entitySaved = false;
      this.isDirty = false;
    }
  }
  @Output() saveRecord = new EventEmitter<any>();
  @Output() deleteRecord = new EventEmitter<any>();
  public currentRow: any = {};
  public isDirty = false;
  public entitySaved = false;

  public saveChanges = () => {
    this.saveRecord.emit(this.currentRow);
    this.entitySaved = true;
  };

  public requestDelete = () => {
    // confirm deletion
    const dialogRef = this.dialog.open(ConfirmModalComponent,
      { width: '350px', height: '250px', data: { title: `Confirm deleting ${this.entityType}`,
          message: `Are you sure you want to delete this ${this.entityType}?`}})
    dialogRef.afterClosed().subscribe((result: boolean) => {
      console.log('got back from modal', result);
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
    console.log('got boolean', newValue);
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
  constructor(public dialog: MatDialog, private lookupService: LookupProxyService) { }

  ngOnInit() {
  }

}
