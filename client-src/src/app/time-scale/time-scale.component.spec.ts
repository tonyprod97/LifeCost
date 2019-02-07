import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeScaleComponent } from './time-scale.component';

describe('TimeScaleComponent', () => {
  let component: TimeScaleComponent;
  let fixture: ComponentFixture<TimeScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
