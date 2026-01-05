import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptDialog } from './prompt-dialog';

describe('PromptDialog', () => {
  let component: PromptDialog;
  let fixture: ComponentFixture<PromptDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
