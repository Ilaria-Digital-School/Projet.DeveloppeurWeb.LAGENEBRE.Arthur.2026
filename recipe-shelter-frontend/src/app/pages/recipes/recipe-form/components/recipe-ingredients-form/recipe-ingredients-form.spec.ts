import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeIngredientsForm } from './recipe-ingredients-form';

describe('RecipeIngredientsForm', () => {
  let component: RecipeIngredientsForm;
  let fixture: ComponentFixture<RecipeIngredientsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeIngredientsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeIngredientsForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      ingredientId: new FormControl<number | null>(null),
      quantity: new FormControl<number | null>(null),
      unit: new FormControl('', { nonNullable: true }),
      note: new FormControl('', { nonNullable: true })
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
