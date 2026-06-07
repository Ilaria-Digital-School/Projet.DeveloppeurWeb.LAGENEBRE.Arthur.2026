import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeTagsForm } from './recipe-tags-form';

describe('RecipeTagsForm', () => {
  let component: RecipeTagsForm;
  let fixture: ComponentFixture<RecipeTagsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeTagsForm]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeTagsForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      tagIds: new FormControl<number[]>([], { nonNullable: true })
    });
    component.tags = [
      { id: 3, name: 'Rapide' },
      { id: 6, name: 'Vegetarien' }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
