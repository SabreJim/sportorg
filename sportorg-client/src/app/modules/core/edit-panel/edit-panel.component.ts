import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {TableColumn} from "../models/ui-objects";
import {Observable} from "rxjs";

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit {

  constructor(private detector: ChangeDetectorRef) { }

  @Input() panelTitle = '';
  @Input() description = '';
  @Input() columns: TableColumn[] = [];
  @Input() getterFunction: () => Observable<any[]>;
  @Input() upsertFunction: (entity: any) => Observable<boolean>;
  ngOnInit() {
  }

  public gridData: any[] = [];
  public editorOpen = false;
  public editingRow: any = null;

  public refreshData = () => {
    if (this.columns && this.columns.length && this.getterFunction) {
      this.getterFunction().subscribe((rows: any) => {
        this.gridData = rows;
      })
    }
  };

  public runUpsert = (body: any) => {
    this.upsertFunction(body).subscribe((result: any) => {
      console.log('do something', result);
      this.editorOpen = false;
      this.refreshData();
      this.detector.detectChanges();
    });
  };

  public editRow = (rowObject: any) => {
    this.editingRow = rowObject;
    setTimeout(() => {
      this.editorOpen = true;
      this.detector.detectChanges();
    });

  };

  public hideSideNav = () => {
    if (this.editorOpen) {
      this.editorOpen = false;
      this.detector.detectChanges();
    }
  };

}
