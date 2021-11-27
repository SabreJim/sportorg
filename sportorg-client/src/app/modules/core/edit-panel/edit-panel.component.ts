import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {AdminConfig} from "../models/ui-objects";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EditModalComponent} from "./edit-modal/edit-modal.component";
import {clone} from 'ramda';

export interface SearchableGridRow {
  searchText?: string;
}
export interface EditModalResponse {
  record: any;
  saveRecord?: boolean;
  deleteRecord?: boolean;
}

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit {

  constructor(private detector: ChangeDetectorRef, protected dialog: MatDialog) { }

  @Input() configObject: AdminConfig;
  @Input() set refreshNow(doIt: boolean) {
    if (doIt) {
      this.gridData = [];
      setTimeout(this.refreshData);
    }
  }
  @Input() alwaysOpen: boolean = false;
  @Input() tableAltClass: string = '';
  @Input() filterBarFields?: string[] = [];
  ngOnInit() {
  }

  public filterBarText: string = null;
  protected dialogRef: MatDialogRef<EditModalComponent>;
  // run the join of typeahead filtering and selection filtering
  public filterRecords = (textValue: string) => {
    if (!this.gridData || !this.gridData.length) {
      this.filteredGridData = [];
      return; // no source to filter on
    }
    const searchText = (textValue && textValue.length) ? textValue.toUpperCase() : null;
    this.filteredGridData = this.gridData.filter((row: SearchableGridRow) => {
      return (!searchText || ((row.searchText).includes(searchText)));
    });
    this.detector.detectChanges();
  }

  public gridData: SearchableGridRow[] = [];
  public filteredGridData: SearchableGridRow[] = [];
  public nudgeTable = false;
  public refreshData = () => {
    if (this.configObject.columns && this.configObject.columns.length && this.configObject.getter) {
      this.configObject.getter().subscribe((rows: any) => {
        if (this.filterBarFields.length) {
          this.gridData = rows.map((row: any) => {
            let searchable = [];
            this.filterBarFields.map((fieldName: string) => {
              if (row[fieldName]) {
                searchable.push(row[fieldName].toUpperCase());
              }
              else {
                searchable.push(row[fieldName]);
              }
            });

            row.searchText = searchable.join(' ');
            return row;
          });
          this.filterBarText = null; // set initial states
          this.filteredGridData = clone(this.gridData);
        } else {
          this.gridData = rows; // no need for a searchable string
          this.filteredGridData = rows;
        }
        this.detector.detectChanges();
      });
    }
    this.nudgeTable = true;
  };

  public editRow = (rowObject: any) => {
    const dialogRef = this.dialog.open(EditModalComponent,
      { width: '80vw', height: '80vh', data: { record: rowObject, columns: this.configObject.columns, entityType: this.configObject.entityType }});
    dialogRef.afterClosed().subscribe((result: EditModalResponse) => {
      if (result) {
        if (result.saveRecord && result.record) {
          this.configObject.setter(result.record).subscribe((result: boolean) => {
            this.refreshData();
          });
        } else if (result.deleteRecord && result.record){
          this.configObject.delete(result.record).subscribe((result: boolean) => {
            this.refreshData();
          });
        }
      }
    });
  };

  public notifySelectionState = (event: any, state: boolean) => {
    if (this.configObject.notifySelection) {
      this.configObject.notifySelection(event, state).subscribe((completed: boolean) => {
      });
    }
  }
}
