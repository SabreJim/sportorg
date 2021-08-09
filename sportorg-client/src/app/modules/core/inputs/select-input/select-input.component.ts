import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {LookupProxyService} from "../../services/lookup-proxy.service";
import {LookupItem} from "../../models/rest-objects";
import { MatSelectChange } from "@angular/material/select";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectInputComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() lookupType: string;
  @Input() showEmpty = true;
  @Input() title: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() set staticLookup (items: LookupItem[]) {
    if (items && items.length) {
      this.options = items;
      if (!this.isDestroyed) this.detector.detectChanges();
    }
  };

  @Input() set selected(newValue: number) {
    if (newValue !== null && newValue !== undefined) {
      if ( this.options.length) { // lookup already available
        setTimeout(() => {
          this.selectedValue = newValue;
          if (!this.isDestroyed) this.detector.detectChanges();
        });
      } else { // park the value for after the lookup arrives
        this.selectedValue = newValue;
      }
    } else if (this.options.length) {  // a blank value is being set after the component has been initialized
      this.selectedValue = null;
      this.selectionObject.emit(null);
      this.selectedChange.emit(null);
    }
  } get selected() { return this.selectedValue; }
  @Output() selectedChange =  new EventEmitter<number>();
  @Output() selectionObject =  new EventEmitter<LookupItem>();
  public selectedValue: number = null;
  public options: LookupItem[] = [];
  protected isDestroyed = false;
  constructor(private lookupService: LookupProxyService, private detector: ChangeDetectorRef) { }

  ngOnInit() {
  }

  public itemSelected = (newSelection: MatSelectChange) => {
    this.selectedChange.emit(newSelection.value);
    const foundItem = this.options.find(item => item.id === newSelection.value);
    this.selectionObject.emit(foundItem);
  }
  ngAfterViewInit(): void {
    if (this.lookupService.Subjects[this.lookupType]) {
      this.lookupService.Subjects[this.lookupType].subscribe((items: LookupItem[]) => {
        this.options = items;
        if (this.selectedValue) {
          this.selected = this.selectedValue; // in case of timing issue
        }
        if (!this.isDestroyed) this.detector.detectChanges();
      });
      this.lookupService.refreshLookups();
    }
  }
  ngOnDestroy() {
    this.detector.detach();
    this.isDestroyed = true;
  }

}
