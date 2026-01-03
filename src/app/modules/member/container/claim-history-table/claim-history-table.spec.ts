import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimHistoryTable } from './claim-history-table';

describe('ClaimHistoryTable', () => {
  let component: ClaimHistoryTable;
  let fixture: ComponentFixture<ClaimHistoryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimHistoryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimHistoryTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
