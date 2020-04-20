import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesWidgetComponent } from './exercises-widget.component';

describe('ExercisesWidgetComponent', () => {
  let component: ExercisesWidgetComponent;
  let fixture: ComponentFixture<ExercisesWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExercisesWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercisesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
