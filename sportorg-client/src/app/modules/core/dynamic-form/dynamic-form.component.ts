import {Component, Input, OnInit} from '@angular/core';
import {TableColumn} from "../models/ui-objects";

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() formFields: TableColumn[] = [];
  @Input() set editingRow (row: any) {
    console.log('apply existing values', row);
  }

  public currentRow: any = {};
  public clearDate = (fieldName: string) => {
    console.log('clear date', fieldName);
  }
  constructor() { }

  ngOnInit() {
  }

}
