import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LookupProxyService} from "../../services/lookup-proxy.service";
import {LookupItem} from "../../models/rest-objects";
import {MatSelectChange} from "@angular/material";

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss']
})
export class SelectInputComponent implements OnInit, AfterViewInit {

  @Input() lookupType: string;

  @Input() set selected(newValue: number) {
    if (newValue !== null && newValue !== undefined && this.options.length) {
      this.selectedValue = newValue;
    }
  } get selected() { return this.selectedValue; }
  @Output() selectedChanged =  new EventEmitter<number>();
  public selectedValue: number = null;
  public options: LookupItem[] = [];
  constructor(private lookupService: LookupProxyService) { }

  ngOnInit() {
  }

  public itemSelected = (newSelection: MatSelectChange) => {
    this.selectedChanged.emit(newSelection.value.id);
  }
  ngAfterViewInit(): void {
    if (this.lookupService.Subjects[this.lookupType]){
      this.lookupService.Subjects[this.lookupType].subscribe((items: LookupItem[]) => {
        this.options = items;
        if (this.selectedValue) {
          this.selected = this.selectedValue; // in case of timing issue
        }
      });
    }
    this.lookupService.refreshLookups();
  }

}
