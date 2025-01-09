import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { COUNTRIES_API, FORM_SUBMIT_API, USERNAMES_API } from '../constants/url.const';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CountryResponse } from '../interfaces/countries.interface';
import { UserName } from '../interfaces/usernames.interface';
import { DataService } from './data.service';

describe('DataService', () => {
    let service: DataService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService]
        });
        service = TestBed.inject(DataService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch countries from API', () => {
        const mockResponse: CountryResponse = {
            error: false,
            msg: 'countries fetched successfully',
            data: [
                {
                    name: 'Afghanistan',
                    flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Afghanistan.svg'
                }
            ]
        }
        service.GetCountries().subscribe(response => {
            expect(response).toEqual(mockResponse);
        });
        const req = httpTestingController.expectOne(COUNTRIES_API);
        expect(req.request.method).toEqual('GET');
        req.flush(mockResponse);
    });

    it('should search for username', () => {
        const input = 'admin123';
        const mockResponse: UserName = {
            id: 1,
            username: 'admin123'
        };
        service.SearchUserName(input).subscribe(response => {
            expect(response).toEqual(mockResponse);
        });
        const req = httpTestingController.expectOne(USERNAMES_API);
        expect(req.request.method).toEqual('GET');
        req.flush({ data: [mockResponse] });
    });

    it('should submit form data', () => {
        const formData = { country: 'India', username: 'tunir123' };
        const mockResponse: ApiResponse = { error: false, msg: 'User Created Successfully', data: [] };
        service.SubmitForm(formData).subscribe(response => {
            expect(response).toEqual(mockResponse);
        });
        const req = httpTestingController.expectOne(FORM_SUBMIT_API);
        expect(req.request.method).toEqual('POST');
        req.flush(mockResponse);
    });
});
