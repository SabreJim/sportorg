import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {Observable} from "rxjs";

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() panelTitle = '';
  @Input() description = '';
  @Input() columns: TableColumn[] = [];
  @Input() getterFunction: () => Observable<any[]>;
  @Input() upsertFunction: (entity: any) => Observable<boolean>;
  ngOnInit() {
  }

  public gridData: any[] = [];

  public refreshData = () => {
    if (this.columns && this.columns.length && this.getterFunction) {
      console.log('refresh on open', this.columns);
      this.getterFunction().subscribe((rows: any) => {
        console.log('got rows', rows);
        this.gridData = rows;
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hasValue = (prop: string) => changes[prop] && changes[prop].currentValue;
    if (hasValue('columns') && hasValue('getterFunction')) {
      // build the table
      console.log('saw columns', changes.columns.currentValue);

      // call the getter function to populate it
    }
  }

}
