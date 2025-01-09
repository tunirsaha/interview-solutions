import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { COUNTRIES_API, FORM_SUBMIT_API, USERNAMES_API } from '../constants/url.const';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CountryResponse } from '../interfaces/countries.interface';
import { UserName, UserNameNotFound, UserNameResponse } from '../interfaces/usernames.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient
  ) { }

  public GetCountries(): Observable<CountryResponse> {
    // mimicked a get country list api
    return this.http.get<any>(COUNTRIES_API)
  }

  public SearchUserName(input: string): Observable<UserName> {
    // mimicked a search api by modifying the mapped response
    return this.http.get<any>(USERNAMES_API).pipe(
      map((data: UserNameResponse) => data.data.find((i) => i.username === input) ?? new UserNameNotFound())
    )
  }

  public SubmitForm(formData: any): Observable<ApiResponse> {
    // mimicked a post api
    return this.http.post<any>(FORM_SUBMIT_API, formData)
  }
}
