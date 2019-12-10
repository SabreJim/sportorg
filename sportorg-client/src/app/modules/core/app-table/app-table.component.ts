import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {TableColumn} from "../models/ui-objects";

@Component({
  selector: 'app-table',
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTableComponent implements OnInit {

  @Input() tableColumns: TableColumn[] = [];
  @Input() set gridData(rows: any[]){
    console.log('incoming rows', rows);
    this.gridDataRows = rows;
    this.detector.detectChanges();
  } get gridData () { return this.gridDataRows; }
  @Input() isEditable = false;
  @Output() editRow = new EventEmitter<any>();

  constructor(private detector: ChangeDetectorRef) { }
  public gridDataRows: any[] = [];
  public readonly ROW_SIZE = 46;
  public SCROLL_MIN_BUFFER = 20 * this.ROW_SIZE;
  public SCROLL_MAX_BUFFER = 100 * this.ROW_SIZE;
  public sortColumn: string = '';

  public sendEdit = (row: any) => {
    if (this.isEditable) {
      this.editRow.emit(row);
    }
  }
  public addNew = () => {
    if (this.isEditable) {
      this.editRow.emit({});
    }
  }

  ngOnInit() {
  }

}
