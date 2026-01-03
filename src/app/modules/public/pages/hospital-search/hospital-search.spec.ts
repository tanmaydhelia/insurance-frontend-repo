import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalSearch } from './hospital-search';

describe('HospitalSearch', () => {
  let component: HospitalSearch;
  let fixture: ComponentFixture<HospitalSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
