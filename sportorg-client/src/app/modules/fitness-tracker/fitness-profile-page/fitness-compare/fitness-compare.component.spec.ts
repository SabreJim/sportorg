import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessCompareComponent } from './fitness-compare.component';

describe('FitnessCompareComponent', () => {
  let component: FitnessCompareComponent;
  let fixture: ComponentFixture<FitnessCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
