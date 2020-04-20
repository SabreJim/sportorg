import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessPageComponent } from './fitness-page.component';

describe('FitnessPageComponent', () => {
  let component: FitnessPageComponent;
  let fixture: ComponentFixture<FitnessPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
