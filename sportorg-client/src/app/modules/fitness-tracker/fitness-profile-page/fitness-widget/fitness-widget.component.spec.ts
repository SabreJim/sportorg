import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessWidgetComponent } from './fitness-widget.component';

describe('FitnessWidgetComponent', () => {
  let component: FitnessWidgetComponent;
  let fixture: ComponentFixture<FitnessWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
