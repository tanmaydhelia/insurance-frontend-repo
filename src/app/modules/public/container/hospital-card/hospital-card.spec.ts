import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalCard } from './hospital-card';

describe('HospitalCard', () => {
  let component: HospitalCard;
  let fixture: ComponentFixture<HospitalCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
