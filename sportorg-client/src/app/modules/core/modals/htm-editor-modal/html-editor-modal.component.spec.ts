import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlEditorModalComponent } from './html-editor-modal.component';

describe('HtmEditorModalComponent', () => {
  let component: HtmlEditorModalComponent;
  let fixture: ComponentFixture<HtmlEditorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmlEditorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlEditorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
