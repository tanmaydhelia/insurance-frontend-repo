import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDetails } from './claim-details';

describe('ClaimDetails', () => {
  let component: ClaimDetails;
  let fixture: ComponentFixture<ClaimDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
