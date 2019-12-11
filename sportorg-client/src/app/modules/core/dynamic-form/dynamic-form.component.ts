import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {LookupProxyService} from "../services/lookup-proxy.service";

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() formFields: TableColumn[] = [];
  @Input() set editingRow (row: any) {
    const fields = row ? Object.keys(row) : [];
    if (fields.length) {
      console.log('apply existing values', row);
      this.currentRow = row;
    }
  }
  @Output() saveRecord = new EventEmitter<any>();

  public currentRow: any = {};
  public isDirty = false;

  public saveChanges = () => {
    // TODO actually send save request
    this.saveRecord.emit(this.currentRow);
  }

  public updateDate = (newDate: string, fieldName: string) => {
    if (newDate !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newDate;
      this.isDirty = true;
    }
  }
  public updateSelection = (newId: number, fieldName: string) => {
    console.log('setting new select', newId, fieldName);
    if (newId !== this.currentRow[fieldName]){
      this.currentRow[fieldName] = newId;
      this.isDirty = true;
    }
  }

  constructor(private lookupService: LookupProxyService) { }

  ngOnInit() {
  }

}
