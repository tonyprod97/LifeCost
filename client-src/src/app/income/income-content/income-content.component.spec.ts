import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeContentComponent } from './income-content.component';

describe('IncomeContentComponent', () => {
  let component: IncomeContentComponent;
  let fixture: ComponentFixture<IncomeContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
