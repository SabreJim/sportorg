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

@Component({
  selector: 'edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPanelComponent implements OnInit {

  constructor(private detector: ChangeDetectorRef) { }

  @Input() configObject: AdminConfig;
  ngOnInit() {
  }

  public gridData: any[] = [];
  public editorOpen = false;
  public editingRow: any = null;

  public refreshData = () => {
    if (this.configObject.columns && this.configObject.columns.length && this.configObject.getter) {
      this.configObject.getter().subscribe((rows: any) => {
        this.gridData = rows;
      })
    }
  };

  public runUpsert = (body: any) => {
    this.configObject.setter(body).subscribe((result: boolean) => {
      this.editorOpen = false;
      this.refreshData();
      this.detector.detectChanges();
    });
  };

  public runDeletion = (record: any) => {
    this.configObject.delete(record).subscribe((result: boolean) => {
      console.log('deleted successfully');
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
