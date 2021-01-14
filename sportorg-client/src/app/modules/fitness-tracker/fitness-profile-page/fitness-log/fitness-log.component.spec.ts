import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FitnessLogComponent } from './fitness-log.component';

describe('FitnessLogComponent', () => {
  let component: FitnessLogComponent;
  let fixture: ComponentFixture<FitnessLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
