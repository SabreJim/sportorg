import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyProfilePageComponent } from './my-profile-page.component';

describe('MyProfilePageComponent', () => {
  let component: MyProfilePageComponent;
  let fixture: ComponentFixture<MyProfilePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyProfilePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
