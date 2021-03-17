import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupIconComponent } from './group-icon.component';

describe('GroupIconComponent', () => {
  let component: GroupIconComponent;
  let fixture: ComponentFixture<GroupIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
