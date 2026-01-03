import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalSelector } from './hospital-selector';

describe('HospitalSelector', () => {
  let component: HospitalSelector;
  let fixture: ComponentFixture<HospitalSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
