import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginRequiredComponent } from './login-required.component';

describe('LoginRequiredComponent', () => {
  let component: LoginRequiredComponent;
  let fixture: ComponentFixture<LoginRequiredComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginRequiredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginRequiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
