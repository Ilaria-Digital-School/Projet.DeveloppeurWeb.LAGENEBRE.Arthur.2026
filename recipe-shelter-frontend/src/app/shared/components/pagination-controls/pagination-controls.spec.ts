import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationControls } from './pagination-controls';

describe('PaginationControls', () => {
  it('should emit previous and next page changes', async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationControls]
    }).compileComponents();

    const fixture: ComponentFixture<PaginationControls> = TestBed.createComponent(PaginationControls);
    const component = fixture.componentInstance;
    component.pagination = {
      page: 2,
      limit: 12,
      totalItems: 36,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    buttons[1].click();

    expect(emitSpy).toHaveBeenNthCalledWith(1, 1);
    expect(emitSpy).toHaveBeenNthCalledWith(2, 3);
  });
});
