import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, take, takeUntil } from 'rxjs';
import { ApiResponse } from './shared/interfaces/api-response.interface';
import { Country, CountryResponse } from './shared/interfaces/countries.interface';
import { UserName } from './shared/interfaces/usernames.interface';
import { DataService } from './shared/services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit, OnDestroy {
  registrationForm!: FormGroup;
  countries: Country[] = [];
  usernameAvailable: boolean = true;
  submitting: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private DataService: DataService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkUserNameField();
    this.loadCountries();
  }

  initForm(): void {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-z0-9]{1,20}$/)]],
      country: ['', Validators.required]
    });
  }

  checkUserNameField(): void {
    this.registrationForm.get('username')?.valueChanges
      .pipe(
        filter((data) => data.length > 0),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((input: string) => {
          return this.DataService.SearchUserName(input)
        })
      )
      .subscribe(
        (response: UserName) => {
          if (response?.id > 0)
            this.usernameAvailable = false
          else
            this.usernameAvailable = true
        },
        error => {
          alert(`Error Searching Username: ${error}`);
        }
      )
  }

  loadCountries() {
    this.DataService.GetCountries()
      .pipe(take(1))
      .subscribe(
        (response: CountryResponse) => {
          if (!response?.error)
            this.countries = response?.data;
          else
            alert(`No Countries Found: ${response?.msg}`);
        },
        error => {
          alert(`Error loading countries: ${error}`);
        }
      );
  }

  onSubmit() {
    if (this.registrationForm?.valid && this.usernameAvailable && !this.submitting) {
      this.submitting = true;
      const formData = this.registrationForm?.value;
      this.DataService.SubmitForm(formData)
        .pipe(take(1))
        .subscribe(
          (response: ApiResponse) => {
            if (response?.msg) alert(response?.msg)
            else alert('Data Not Submitted')
          },
          error => {
            alert(`Error registering user: ${error}`);
            this.errorMessage = 'Failed to register user. Please try again later.';
            this.submitting = false;
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
