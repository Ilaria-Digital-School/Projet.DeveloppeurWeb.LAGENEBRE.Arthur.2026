import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeStepsForm } from './recipe-steps-form';

describe('RecipeStepsForm', () => {
  let component: RecipeStepsForm;
  let fixture: ComponentFixture<RecipeStepsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeStepsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeStepsForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      description: new FormControl('', { nonNullable: true })
    });
    component.stepNumber = 1;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
