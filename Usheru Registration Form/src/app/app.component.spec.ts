import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppComponent } from './app.component';
import { DataService } from './shared/services/data.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['GetCountries', 'SearchUserName', 'SubmitForm']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.initForm();
    expect(component.registrationForm).toBeTruthy();
    expect(component.registrationForm.controls['username']).toBeTruthy();
    expect(component.registrationForm.controls['country']).toBeTruthy();
  });

  it('should check username field', () => {
    const usernameControl = component.registrationForm.controls['username'];
    usernameControl.setValue('test');

    const searchResponse = { id: 1, username: 'admin123' };
    dataService.SearchUserName.and.returnValue(of(searchResponse));

    component.checkUserNameField();

    expect(dataService.SearchUserName).toHaveBeenCalledOnceWith('test');
    expect(component.usernameAvailable).toBeFalsy();
  });

  it('should load countries', () => {
    const countryResponse = { error:false, msg: '', data: [{ name: 'Country 1', flag: '' }, { name: 'Country 2', flag: '' }] };
    dataService.GetCountries.and.returnValue(of(countryResponse));

    component.loadCountries();

    expect(dataService.GetCountries).toHaveBeenCalledTimes(1);
    expect(component.countries).toEqual(countryResponse.data);
  });

  it('should submit form', () => {
    const formData = {
      username: 'test',
      country: 'Country 1'
    };
    component.registrationForm = new FormBuilder().group({
      username: ['test', [Validators.required, Validators.pattern(/^[a-z0-9]{1,20}$/)]],
      country: ['Country 1', Validators.required]
    });

    const submitResponse = { error: false, msg: 'Form submitted successfully', data: [] };
    dataService.SubmitForm.and.returnValue(of(submitResponse));

    component.onSubmit();

    expect(dataService.SubmitForm).toHaveBeenCalledTimes(1);
    expect(dataService.SubmitForm).toHaveBeenCalledWith(formData);
    expect(component.submitting).toBeFalsy();
  });

});
