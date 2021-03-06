import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicPageComponent } from './dynamic-page.component';

describe('AboutPageComponent', () => {
  let component: DynamicPageComponent;
  let fixture: ComponentFixture<DynamicPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
