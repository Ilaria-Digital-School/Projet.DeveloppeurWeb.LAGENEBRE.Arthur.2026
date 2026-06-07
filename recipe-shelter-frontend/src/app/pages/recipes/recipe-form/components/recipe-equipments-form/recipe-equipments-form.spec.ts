import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RecipeEquipmentsForm } from './recipe-equipments-form';

describe('RecipeEquipmentsForm', () => {
  let component: RecipeEquipmentsForm;
  let fixture: ComponentFixture<RecipeEquipmentsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeEquipmentsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeEquipmentsForm);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      equipmentId: new FormControl<number | null>(null)
    });
    component.equipmentNumber = 1;
    component.equipments = [
      { id: 1, name: 'Fouet' },
      { id: 2, name: 'Saladier' }
    ];
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
