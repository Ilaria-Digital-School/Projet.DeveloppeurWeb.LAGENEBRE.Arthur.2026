import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RecipeListShell } from './recipe-list-shell';

describe('RecipeListShell', () => {
  it('should render an error state when an error message is provided', async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeListShell],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture: ComponentFixture<RecipeListShell> = TestBed.createComponent(RecipeListShell);
    fixture.componentInstance.error = 'Chargement impossible';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Chargement impossible');
  });
});
