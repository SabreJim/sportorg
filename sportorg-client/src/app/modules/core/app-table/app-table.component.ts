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
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {SnackbarService} from "../services/snackbar.service";
import {ContextMenuItem} from "../directives/context-menu/context-menu.directive";

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

  @Input() set tableColumns (cols: TableColumn[]) {
    this._tableColumns = cols;
    this.toggleHide('', false); // build the list of hidden columns, if any
  } get tableColumns() {
    return this._tableColumns;
  }
  private _tableColumns = [];
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
    this.adjustLayout();
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
  @Input() defaultObject: any = {};
  @Input() set nudgeView(doit: boolean) {
    if (doit) {
      this.adjustLayout();
      this.nudgeView = false;
    }
    this._nudgeView = false;
  } get nudgeView() {
    return this._nudgeView;
  }
  private _nudgeView: boolean = false;
  @Output() nudgeViewChange = new EventEmitter<boolean>();
  @Output() editRow = new EventEmitter<any>();
  @Output() selectedRows = new EventEmitter<any[]>();
  @Output() selectedRow = new EventEmitter<any>();
  @Output() deselectedRow = new EventEmitter<any>();

  // Selection events
  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>;
  protected _selectedRows: TableRow[] = [];
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
    }
    // just emit the row and let the parent handle the effective state
    (event.checked) ? this.selectedRow.emit(row) : this.deselectedRow.emit(row);
  };

  public sendEdit = (row: any) => {
    if (this.isEditable) {
      this.editRow.emit(row);
    }
  };
  public addNew = () => {
    if (this.isEditable) {
      this.editRow.emit(this.defaultObject);
    }
  };
  // hiding and showing columns
  public toggleHide = (title: string, hide: boolean) => {
    const hiddenColumns: ContextMenuItem[] = [];
    this.tableColumns.map((c: TableColumn) => {
      if (c.title === title) {
        c.showColumn = !hide;
      }
      if (!c.showColumn) {
        hiddenColumns.push({ menuTitle: c.title, menuAction: () => this.toggleHide(c.title, false) });
      }
    });
    this.tableContextMenu[0].subMenu = hiddenColumns;
    setTimeout(this.adjustLayout);
  }

  public tableContextMenu: ContextMenuItem[] = [
    { menuTitle: 'Show columns', subMenu: []}
  ];

  // Sorting
  public sortColumn: string = '';
  public sort = (column: TableColumn) => {
    this.sortColumn = column.fieldName;
    column.sortDirection = (column.sortDirection === 'ASC') ? 'DESC' : 'ASC';
    const backup = Object.assign([], this.gridDataRows);
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
  @ViewChild(CdkVirtualScrollViewport)  ScrollArea: CdkVirtualScrollViewport;
  @ViewChild('scrollingHeader')  TableHeader: ElementRef;
  public readonly ROW_SIZE = 36;
  public SCROLL_MIN_BUFFER = 20 * this.ROW_SIZE;
  public SCROLL_MAX_BUFFER = 100 * this.ROW_SIZE;
  public sharedWidth = '100px';
  public sharedContainerWidth = '100px';
  public vertScrollShown = true;
  protected scrollSync = (event: Event) => {
    this.TableHeader.nativeElement.scroll((event.target as HTMLElement).scrollLeft, 0);
    this.detector.detectChanges();
  };
  public adjustLayout = () => {
    setTimeout(() => {
      try {
        const innerElem = (this.ScrollArea.elementRef.nativeElement.childNodes[0] as HTMLElement);
        const outerElem = this.ScrollArea.elementRef.nativeElement;
        // if the inner scrolling area is taller than the container, shorten the header container to match
        this.vertScrollShown = (innerElem.clientHeight > outerElem.clientHeight);

        // if the inner scrolling area is wider than the container, set the inner header to match
        if (innerElem.scrollWidth > outerElem.clientWidth) {
          this.sharedWidth = `${innerElem.scrollWidth}px`;
          if (this.vertScrollShown) {
            this.sharedContainerWidth = `calc(${outerElem.clientWidth}px)`;
          } else {
            this.sharedContainerWidth = `calc(${outerElem.clientWidth - 16}px)`;
          }
          outerElem.onscroll = this.scrollSync;
        } else { // no horizontal scrolling so don't care about scrolling the header in sync
          if (this.vertScrollShown) {
            this.sharedWidth = `calc(${outerElem.clientWidth}px)`;
            this.sharedContainerWidth = `calc(${outerElem.clientWidth}px)`;
          } else {
            this.sharedWidth = `calc(100%)`;
            // this.sharedWidth = `calc(${outerElem.clientWidth - 16}px)`;
            this.sharedContainerWidth = `calc(100%)`;
          }
        }
      } catch (err) {
         SnackbarService.error(`Could not set width of the table`);
      }
      this.detector.detectChanges();
    });
  };

  ngAfterViewInit(): void {
    this.adjustLayout();
  }
  ngOnDestroy() {
    this.detector.detach();
  }
}
