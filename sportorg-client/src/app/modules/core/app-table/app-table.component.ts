import {
  AfterViewInit,
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
export class AppTableComponent implements AfterViewInit {

  @Input() tableColumns: TableColumn[] = [];
  @Input() set gridData(rows: any[]){
    this.gridDataRows = rows;
    if (this.ViewArea) {
      this.sharedWidth = `${this.ViewArea.scrollWidth}px`;
    }
    this.detector.detectChanges();
  } get gridData () { return this.gridDataRows; }
  @Input() isEditable = false;
  @Output() editRow = new EventEmitter<any>();

  constructor(private detector: ChangeDetectorRef) { }
  public gridDataRows: any[] = [];
  public readonly ROW_SIZE = 46;
  public SCROLL_MIN_BUFFER = 20 * this.ROW_SIZE;
  public SCROLL_MAX_BUFFER = 100 * this.ROW_SIZE;
  public sharedWidth = '100px';
  public ViewArea: HTMLElement;
  public HeaderRow: HTMLElement;
  public sortColumn: string = '';

  public sendEdit = (row: any) => {
    if (this.isEditable) {
      this.editRow.emit(row);
    }
  };
  public addNew = () => {
    if (this.isEditable) {
      this.editRow.emit({});
    }
  };

  protected scrollSync = (event: Event) => {
    this.HeaderRow.scrollLeft = this.ViewArea.scrollLeft;
    this.detector.detectChanges();
  };

  ngAfterViewInit(): void {
    this.ViewArea = document.querySelector('.body-scroll');
    this.HeaderRow = document.querySelector('.header-row');
    this.ViewArea.onscroll = this.scrollSync;
  }

}
