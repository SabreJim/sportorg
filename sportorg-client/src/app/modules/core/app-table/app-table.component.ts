import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {TableColumn} from "../models/ui-objects";

@Component({
  selector: 'app-table',
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTableComponent implements OnInit {

  @Input() tableColumns: TableColumn[] = [];
  @Input() gridData: any[] = [];
  @Input() isEditable = false;
  @Output() editRow = new EventEmitter<any>();

  constructor(private detector: ChangeDetectorRef) { }

  public SCROLL_MIN_BUFFER = 20;
  public SCROLL_MAX_BUFFER = 100;
  public sortColumn: string = '';

  public sendEdit = (row: any) => {
    if (this.isEditable) {
      console.log('row to edit', row);
    }
  }
  ngOnInit() {
  }

}
