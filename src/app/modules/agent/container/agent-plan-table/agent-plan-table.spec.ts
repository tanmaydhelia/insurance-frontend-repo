import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPlanTable } from './agent-plan-table';

describe('AgentPlanTable', () => {
  let component: AgentPlanTable;
  let fixture: ComponentFixture<AgentPlanTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPlanTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPlanTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
