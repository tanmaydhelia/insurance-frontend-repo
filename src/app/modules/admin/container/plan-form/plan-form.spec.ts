import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanForm } from './plan-form';

describe('PlanForm', () => {
  let component: PlanForm;
  let fixture: ComponentFixture<PlanForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
