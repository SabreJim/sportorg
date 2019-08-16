import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {map, catchError} from "rxjs/operators";


@Injectable({providedIn: 'root'})
export class RestProxyService {


  constructor (protected _http: HttpClient, protected appRouter: Router) {

  }
  protected baseUrl = '/rest';
  protected authenticatedHeaders: HttpHeaders;

  protected convertHttpParam = (params: object) => {
    let httpParam = new HttpParams();
    if (params) {
      for (const field of Object.keys(params)) {
        httpParam = httpParam.set(field, params[field]);
      }
    }
    return httpParam;
  }

  protected setHeaders = (request?: object) => {
    const token = 'DUMMY-TOKEN'; // TODO: get session token
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token
    });

    if (request) {
      for (const addedHeader of Object.keys(request)) {
        headers = headers.set(addedHeader, request[addedHeader]);
      }
    }
    // update the saved header
    this.authenticatedHeaders = headers;
  }

  protected handleRestResponse(observable: Observable<ApiResponse>): Observable<ApiResponse> {
    return observable.pipe(
      // handle success cases
      map((response: ApiResponse) => {
        // return specifically the correct type of object
        const cleanResponse = new ApiResponse(response.data);
        cleanResponse.success = true;
        cleanResponse.index = response.index || 1;
        cleanResponse.status = response.status || 200;
        return cleanResponse;
      }),
      catchError((err: HttpErrorResponse) => {
        const errResponse = new ApiResponse([], false);
        errResponse.index = -1;
        errResponse.message = err.message || 'Unknown error';

        if (err.status === 401) { // currently logged in
          // TODO: could pop the OAuth logic here
          if (err.error && err.error.redirect) {
            this.appRouter.navigate([err.error.redirct]);
          }
        }

        return of(errResponse);
      })
    );
  }

  /**
   * Send a REST request to a service and return an Observable response. This method is
   * intended for repeated requests where a consumer will keep getting new updated values
   * @param url
   * @param params
   * @param headers
   */
  public get(url: string, params?: object, headers?: object): Observable<ApiResponse> {
    const composedUrl = `${this.baseUrl}/${url}`;
    this.setHeaders(headers);
    // send the request and safely handle the response
    return  this.handleRestResponse(
      this._http.get<ApiResponse>(
        composedUrl,
      { params: this.convertHttpParam(params), headers: this.authenticatedHeaders}
    ));
  }
}
