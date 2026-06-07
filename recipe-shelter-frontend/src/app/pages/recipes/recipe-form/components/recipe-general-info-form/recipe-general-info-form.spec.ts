import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeGeneralInfoForm } from './recipe-general-info-form';

describe('RecipeGeneralInfoForm', () => {
  let component: RecipeGeneralInfoForm;
  let fixture: ComponentFixture<RecipeGeneralInfoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeGeneralInfoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeGeneralInfoForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      title: new FormControl('', { nonNullable: true }),
      categoryId: new FormControl<number | null>(null),
      description: new FormControl('', { nonNullable: true })
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
