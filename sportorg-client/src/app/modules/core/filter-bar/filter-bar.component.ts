import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {LookupItem} from "../models/rest-objects";
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import {LookupProxyService} from "../services/lookup-proxy.service";


export interface FilterBarConfig {
  hasSearch: boolean;
  searchTitle?: string;
  searchPlaceholder?: string;
  options: FilterConfig[];
}
export interface FilterConfig {
  title: string;
  fieldName: string;
  placeholder?: string;
  currentFilterText?: string;
  singleSelect: boolean;
  showHint?: boolean;
  value: string;
  options: LookupItem[];
  lookupName?: string;
}

export class FilterRequest {
  search: string;
  filters: { [key: string]: any }
  constructor(filters:  { [key: string]: any } = {}) {
    this.search = '';
    this.filters = filters;
  }
}

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
  constructor (protected lookupService: LookupProxyService) {
  }

  @Input() set filterConfig (newConfig: FilterBarConfig) {
    if (!newConfig) {
      return;
    }
    this._filterConfig = newConfig;
    if (this._filterConfig.options) {
      this._filterConfig.options.map((config: FilterConfig) => {
        if (config.lookupName && this.lookupService.Subjects[config.lookupName]) {
          // automatically get the lookup values
          this.lookupService.getLookup(config.lookupName).subscribe((items: LookupItem[]) => {
            config.options = items;
          });
        }
      });
    }
  } get filterConfig () {
    return this._filterConfig;
  }
  private _filterConfig: FilterBarConfig = { hasSearch: true, options: [] };

  @Output() requestFilter = new EventEmitter<FilterRequest>();

  public textInput = new FormControl();
  public searchText: string = '';

  protected currentFilter: FilterRequest = { search: '', filters: {}};

  public selectCheckbox = (change: MatCheckboxChange, source: LookupItem, fieldName: string, config: FilterConfig) => {
    let currentSelections: any[] = this.currentFilter.filters[fieldName] || [];
    let currentSelectedNames: string[] = []; // for hint text
    if (config.currentFilterText && config.currentFilterText.length) {
      currentSelectedNames = config.currentFilterText.split(', ');
    }
    if (change.checked) {
      // add to selected
      if (source.id === -1) {
        currentSelections.push(source.stringId);
      } else {
        currentSelections.push(source.id);
      }
      currentSelectedNames.push(source.name);
    } else {
      if (source.id === -1) {
        currentSelections = currentSelections.filter((id) => id !== source.stringId);
      } else {
        currentSelections = currentSelections.filter((id) => id !== source.id);
      }
      currentSelectedNames = currentSelectedNames.filter((name) => name !== source.name);
    }
    config.currentFilterText = currentSelectedNames.join(', ');
    this.currentFilter.filters[fieldName] = currentSelections;
    this.requestFilter.emit(this.currentFilter);
  };

  public selectRadio = (change: MatButtonToggleChange, fieldName: string) => {
    if (change.value) {
      // set to selected
      this.currentFilter.filters[fieldName] = change.value;
    } else {
      delete this.currentFilter.filters[fieldName];
    }
    this.requestFilter.emit(this.currentFilter);
  };

  ngOnInit() {
    this.textInput.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newText) => {
        if (newText && newText.length) {
          this.searchText = newText.toUpperCase();
        } else {
          this.searchText = '';
        }
        this.currentFilter.search = this.searchText;
        this.requestFilter.emit(this.currentFilter);
      });
  }

}
