import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {AdminConfig, TableColumn} from "../models/ui-objects";
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {Exercise} from "../models/fitness-objects";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

export interface SearchableGridRow {
  searchText?: string;
}
@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit {

  constructor(private detector: ChangeDetectorRef) { }

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
    this.textInput.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newText) => {
        if (newText && newText.toUpperCase) {
          this.searchText = newText.toUpperCase();
        } else {
          this.searchText = '';
        }
        this.filterRows();
      });
  }

  public searchText: string = '';
  public textInput = new FormControl();
  public clearString = () => {
    this.searchText = '';
    this.textInput.setValue(null);
    this.filterRows();
  }
  // run the join of typeahead filtering and selection filtering
  public filterRows = () => {
    if (!this.gridData || !this.gridData.length) {
      this.filteredGridData = [];
      return; // no source to filter on
    }
    this.filteredGridData = this.gridData.filter((row: SearchableGridRow) => {
      return (!this.searchText || ((row.searchText).includes(this.searchText)));
    });
    this.detector.detectChanges();
  }

  public gridData: SearchableGridRow[] = [];
  public filteredGridData: SearchableGridRow[] = [];
  public editorOpen = false;
  public editingRow: any = null;

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
          this.clearString();
        } else {
          this.gridData = rows; // no need for a searchable string
          this.filteredGridData = rows;
        }

        this.detector.detectChanges();
      })
    }
  };

  public runUpsert = (body: any) => {
    this.configObject.setter(body).subscribe((result: boolean) => {
      this.editorOpen = false;
      this.refreshData();
    });
  };

  public runDeletion = (record: any) => {
    this.configObject.delete(record).subscribe((result: boolean) => {
      this.editorOpen = false;
      this.refreshData();
    });
  };

  public editRow = (rowObject: any) => {
    this.editingRow = rowObject;
    setTimeout(() => {
      this.editorOpen = true;
      this.detector.detectChanges();
    });
  };

  public notifySelectionState = (event: any, state: boolean) => {
    if (this.configObject.notifySelection) {
      this.configObject.notifySelection(event, state).subscribe((completed: boolean) => {
      });
    }
  }

  public hideSideNav = () => {
    if (this.editorOpen) {
      this.editingRow = null;
      this.editorOpen = false;
      this.detector.detectChanges();
    }
  };

}
