import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {MatCheckbox, MatCheckboxChange, MatSelectChange} from "@angular/material";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {SnackbarService} from "../services/snackbar.service";

export interface TableRow {
  isSelected: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTableComponent implements AfterViewInit, OnDestroy {
  constructor(private detector: ChangeDetectorRef) { }

  @Input() tableColumns: TableColumn[] = [];
  @Input() set gridData(rows: any[]) {
    this.gridDataRows = rows;
    if (rows && rows.length && rows[0].hasOwnProperty('isSelected')) {
      this._selectedRows = this.gridDataRows.filter(row => row.isSelected === true );
      setTimeout(() => {
        // fix the UI elements to match the data
        if (this.checkboxes) {
          this.checkboxes.forEach((box: MatCheckbox, rowIndex: number) => {
            try {
              box.checked = this.gridDataRows[rowIndex].isSelected;
            } catch (err) {
              box.checked = false;
            }
          });
        }
      })
    } else {
      this.clearSelections();
    }

    this.linkScrolling();
    this.detector.detectChanges();
  } get gridData () { return this.gridDataRows; }
  public gridDataRows: TableRow[] = [];
  // configuration fields
  @Input() isEditable = false;
  @Input() canAddRows = false;
  @Input() canSelect = false;
  @Input() singleSelect = false;
  @Input() trackById: string;
  @Input() altClass: string = '';
  @Output() editRow = new EventEmitter<any>();
  @Output() selectedRows = new EventEmitter<any[]>();
  @Output() selectedRow = new EventEmitter<any>();
  @Output() deselectedRow = new EventEmitter<any>();

  // Selection events
  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>;
  protected _selectedRows: TableRow[] = [];
  protected preserveSelections: boolean = false;
  protected clearSelections = () => {
    // clear the selection box UI so old states don't persist
    if (this.checkboxes) {
      this.checkboxes.forEach((box: MatCheckbox) => {
        box.checked = false;
      });
    }
    this._selectedRows = [];
    this.selectedRows.emit(this._selectedRows);
  };
  // when a row is selected or deselected, update the state of the selections
  public selectRow = (row: any, event: MatCheckboxChange) => {
    if (this.trackById) {
      this.gridDataRows = this.gridDataRows.map((gridRow) => {
        if (gridRow[this.trackById] === row[this.trackById]) {
          gridRow.isSelected = event.checked;
        }
        return gridRow;
      });
      if (event.checked) {
        if (this.singleSelect) { // selection will only allow one item at a time
          this._selectedRows = [row];
          this.checkboxes.forEach((box: MatCheckbox) => {
            box.checked = (box === event.source);
          });
        } else {
          this._selectedRows.push(row); // add to existing selections
        }
      } else {
        if (this.singleSelect) { // remove the only selection
          this.clearSelections();
        } else {
          // exclude the deselected row
          this._selectedRows = this._selectedRows.filter((item: any) => {
            return item[this.trackById] !== row[this.trackById];
          });
        }

      }
      this.selectedRows.emit(this._selectedRows);
    } else {
      // just emit the row and let the parent handle the effective state
      (event.checked) ? this.selectedRow.emit(row) : this.deselectedRow.emit(row);
    }
  };

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
  // Sorting
  public sortColumn: string = '';
  public sort = (column: TableColumn) => {
    this.sortColumn = column.fieldName;
    column.sortDirection = (column.sortDirection === 'ASC') ? 'DESC' : 'ASC';
    const backup = Object.assign([], this.gridDataRows);
    if (this.canSelect) { // otherwise selections will be cleared out
      this.preserveSelections = true;
    }
    setTimeout(() => {
      this.gridData = backup.sort(this.sortByField(this.sortColumn, column.sortDirection));
      this.detector.detectChanges();
    });
  };
  protected sortByField = (fieldName: string, direction: 'ASC' | 'DESC') => {
    return (a: TableRow, b: TableRow) => {
      const flipper = (direction === 'ASC') ? -1 : 1;
      const aValue = a[fieldName];
      const bValue = b[fieldName];
      if (aValue === null) return -1 * flipper;
      if (bValue === null) return 1 * flipper;
      if (aValue > bValue) return -1  * flipper;
      return aValue === bValue ? 0 : 1 * flipper;
    };
  };

  // Manage synced up scrolling
  @ViewChild(CdkVirtualScrollViewport, {static: false})  ScrollArea: CdkVirtualScrollViewport;
  @ViewChild('scrollingHeader', {static: false})  TableHeader: ElementRef;
  public readonly ROW_SIZE = 46;
  public SCROLL_MIN_BUFFER = 20 * this.ROW_SIZE;
  public SCROLL_MAX_BUFFER = 100 * this.ROW_SIZE;
  public sharedWidth = '100px';
  public vertScrollShown = true;
  protected scrollSync = (event: Event) => {
    this.TableHeader.nativeElement.scrollLeft = (event.target as HTMLElement).scrollLeft;
    this.detector.detectChanges();
  };
  protected linkScrolling = () => {
    setTimeout(() => {
      try {
        const innerElem = (this.ScrollArea.elementRef.nativeElement.childNodes[0] as HTMLElement);
        const outerElem = this.ScrollArea.elementRef.nativeElement;
        // if the inner scrolling area is taller than the container, shorten the header container to match
        this.vertScrollShown = (innerElem.clientHeight > outerElem.clientHeight);

        // if the inner scrolling area is wider than the container, set the inner header to match
        if (innerElem.scrollWidth > outerElem.clientWidth) {
          this.sharedWidth = `${outerElem.clientWidth}px`;
          outerElem.onscroll = this.scrollSync;
        } else {
          if (this.vertScrollShown) {
            this.sharedWidth = `calc(${outerElem.clientWidth}px)`;
          } else {
            this.sharedWidth = `calc(${outerElem.clientWidth}px)`;
          }
        }
      } catch (err) {
         SnackbarService.error(`Could not set width of the table`);
      }
      this.detector.detectChanges();
    });
  };
  ngAfterViewInit(): void {
    this.linkScrolling();
  }
  ngOnDestroy() {
    this.detector.detach();
  }
}
