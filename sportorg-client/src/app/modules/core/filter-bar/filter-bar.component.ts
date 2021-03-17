import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {LookupItem} from "../models/rest-objects";
import {MatButtonToggleChange} from "@angular/material/button-toggle";


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
  singleSelect: boolean;
  value: string;
  options: LookupItem[];
}

export interface FilterRequest {
  search: string;
  filters: { [key: string]: any }
}

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {

  @Input() filterConfig: FilterBarConfig = {
    hasSearch: true,
    options: []
  };

  @Output() requestFilter = new EventEmitter<FilterRequest>();

  public textInput = new FormControl();
  public searchText: string = '';

  protected currentFilter: FilterRequest = { search: '', filters: {}};


  public clearString = () => {
    this.searchText = '';
    this.textInput.setValue(null);
    this.currentFilter.search = this.searchText;
    this.requestFilter.emit(this.currentFilter);
  }

  public selectCheckbox = (change: MatCheckboxChange, source: LookupItem, fieldName: string) => {
    let currentSelections: number[] = this.currentFilter.filters[fieldName] || [];
    if (change.checked) {
      // add to selected
      currentSelections.push(source.id);
    } else {
      currentSelections = currentSelections.filter((id) => id !== source.id);
    }
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
  constructor() { }

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
