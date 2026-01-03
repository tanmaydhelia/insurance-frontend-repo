import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsOfficerDashboard } from './claims-officer-dashboard';

describe('ClaimsOfficerDashboard', () => {
  let component: ClaimsOfficerDashboard;
  let fixture: ComponentFixture<ClaimsOfficerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsOfficerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsOfficerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
