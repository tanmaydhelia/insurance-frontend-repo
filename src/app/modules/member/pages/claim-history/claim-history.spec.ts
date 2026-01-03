import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimHistory } from './claim-history';

describe('ClaimHistory', () => {
  let component: ClaimHistory;
  let fixture: ComponentFixture<ClaimHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
