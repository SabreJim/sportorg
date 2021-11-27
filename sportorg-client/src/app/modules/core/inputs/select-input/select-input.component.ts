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
import {OrgFormControl} from "../../modals/validating-modal/validating-modal.component";

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
})
export class SelectInputComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() lookupType: string;
  @Input() showEmpty = true;
  @Input() title: string;
  @Input() set disabled (setDisabled: boolean) {
    if (setDisabled) {
      this.selectControl.disable();
    } else {
      this.selectControl.enable();
    }
  }
  @Input() required: boolean = false;
  @Input() set staticLookup (items: LookupItem[]) {
    if (items && items.length) {
      this.options = items;
    }
  };

  @Input() set selected(newValue: number) {
    if (newValue !== null && newValue !== undefined) {
      if ( this.options.length) { // lookup already available
        setTimeout(() => {
          this.selectControl.setValue(newValue);
        });
      } else { // park the value for after the lookup arrives
        this.selectControl.setValue(newValue);
      }
    } else if (this.options.length) {  // a blank value is being set after the component has been initialized
      this.selectControl.setValue(null);
      this.selectionObject.emit(null);
      this.selectedChange.emit(null);
    }
  } get selected() { return this.selectControl.value; }
  @Input() selectControl = new OrgFormControl('select');
  @Output() selectedChange =  new EventEmitter<number>();
  @Output() selectionObject =  new EventEmitter<LookupItem>();
  public options: LookupItem[] = [];
  protected isDestroyed = false;
  constructor(private lookupService: LookupProxyService) { }

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
        if (this.selectControl.value) { // in case of timing issue
          this.selected = this.selectControl.value;
        }
      });
      this.lookupService.refreshLookups();
    }
  }
  ngOnDestroy() {
    this.isDestroyed = true;
  }

}
