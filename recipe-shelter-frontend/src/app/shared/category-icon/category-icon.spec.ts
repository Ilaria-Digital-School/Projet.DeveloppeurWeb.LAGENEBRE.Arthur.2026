import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryIcon } from './category-icon';

describe('CategoryIcon', () => {
  it('should resolve known icon names for rendering', async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryIcon]
    }).compileComponents();

    const fixture: ComponentFixture<CategoryIcon> = TestBed.createComponent(CategoryIcon);
    fixture.componentInstance.iconName = 'salad';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
    expect((fixture.componentInstance as unknown as { iconKind: string }).iconKind).toBe('salad');
  });
});
