import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmEditorModalComponent } from './htm-editor-modal.component';

describe('HtmEditorModalComponent', () => {
  let component: HtmEditorModalComponent;
  let fixture: ComponentFixture<HtmEditorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmEditorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmEditorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
