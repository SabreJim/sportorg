import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrgSnackbarComponent } from './org-snackbar.component';

describe('OrgSnackbarComponent', () => {
  let component: OrgSnackbarComponent;
  let fixture: ComponentFixture<OrgSnackbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
