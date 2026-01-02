import { TestBed } from '@angular/core/testing';

import { Uth } from './uth';

describe('Uth', () => {
  let service: Uth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Uth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
