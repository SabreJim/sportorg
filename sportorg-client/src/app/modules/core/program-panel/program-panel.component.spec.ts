import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPanelComponent } from './program-panel.component';

describe('ProgramPanelComponent', () => {
  let component: ProgramPanelComponent;
  let fixture: ComponentFixture<ProgramPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
