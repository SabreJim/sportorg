import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClassPageComponent } from './class-page.component';

describe('ClassPageComponent', () => {
  let component: ClassPageComponent;
  let fixture: ComponentFixture<ClassPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
