import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeCoverImageForm } from './recipe-cover-image-form';

describe('RecipeCoverImageForm', () => {
  let component: RecipeCoverImageForm;
  let fixture: ComponentFixture<RecipeCoverImageForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCoverImageForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeCoverImageForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      coverImageUrl: new FormControl('', { nonNullable: true })
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
