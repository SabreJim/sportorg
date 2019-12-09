import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {Observable} from "rxjs";

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit, OnChanges {

  constructor(private detector: ChangeDetectorRef) { }

  @Input() panelTitle = '';
  @Input() description = '';
  @Input() columns: TableColumn[] = [];
  @Input() getterFunction: () => Observable<any[]>;
  @Input() upsertFunction: (entity: any) => Observable<boolean>;
  ngOnInit() {
  }

  public gridData: any[] = [];
  public editorOpen = false;
  public editingRow: any = null;

  public refreshData = () => {
    if (this.columns && this.columns.length && this.getterFunction) {
      console.log('refresh on open', this.columns);
      this.getterFunction().subscribe((rows: any) => {
        console.log('got rows', rows);
        this.gridData = rows;
      })
    }
  };

  public editRow = (rowObject: any) => {
    console.log('open sidenav for row', rowObject);
    this.editingRow = rowObject;
    setTimeout(() => {
      this.editorOpen = true;
      this.detector.detectChanges();
      console.log('opening');
    });

  };

  public hideSideNav = () => {
    if (this.editorOpen) {
      this.editorOpen = false;
      this.detector.detectChanges();
      console.log('hiding');
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    const hasValue = (prop: string) => changes[prop] && changes[prop].currentValue;
    if (hasValue('columns') && hasValue('getterFunction')) {
      // build the table
      console.log('saw columns', changes.columns.currentValue);

      // call the getter function to populate it
    }
  }

}
