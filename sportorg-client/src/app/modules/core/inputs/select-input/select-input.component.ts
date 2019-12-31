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
import {MatSelectChange} from "@angular/material";

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectInputComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() lookupType: string;
  @Input() maxWidth: string = '100%';
  @Input() set staticLookup (items: LookupItem[]) {
    if (items && items.length) {
      this.options = items;
      if (!this.isDestroyed) this.detector.detectChanges();
    }
  };

  @Input() set selected(newValue: number) {
    if (newValue !== null && newValue !== undefined && this.options.length) {
      setTimeout(() => {
        this.selectedValue = newValue;
        if (!this.isDestroyed) this.detector.detectChanges();
      });

    }
  } get selected() { return this.selectedValue; }
  @Output() selectedChanged =  new EventEmitter<number>();
  @Output() selectionObject =  new EventEmitter<LookupItem>();
  public selectedValue: number = null;
  public options: LookupItem[] = [];
  protected isDestroyed = false;
  constructor(private lookupService: LookupProxyService, private detector: ChangeDetectorRef) { }

  ngOnInit() {
  }

  public itemSelected = (newSelection: MatSelectChange) => {
    this.selectedChanged.emit(newSelection.value);
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
