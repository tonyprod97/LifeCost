import { TestBed } from '@angular/core/testing';

import { DialogErrorService } from './dialog-error.service';

describe('DialogErrorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DialogErrorService = TestBed.get(DialogErrorService);
    expect(service).toBeTruthy();
  });
});
