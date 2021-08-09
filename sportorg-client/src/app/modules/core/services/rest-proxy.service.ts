import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {map, catchError} from "rxjs/operators";
import {StaticValuesService} from "./static-values.service";
import { clone } from 'ramda';
import {FilterRequest} from "../filter-bar/filter-bar.component";
export interface FileUploadRequest {
  file: File;
}

@Injectable({providedIn: 'root'})
export class RestProxyService {


  constructor (protected _http: HttpClient, protected appRouter: Router) {

  }
  protected baseUrl = '/rest';
  protected authenticatedHeaders: HttpHeaders;

  protected convertHttpParam = (params: object) => {
    let httpParam = new HttpParams();
    if (params) {
      let allParams = clone(params);
      if (params.hasOwnProperty('filters')) { // presumed to be a filterRequest
        allParams = clone((params as FilterRequest).filters);
        allParams.search = (params as FilterRequest).search;
      }
      for (const field of Object.keys(allParams)) {
        httpParam = httpParam.set(field, allParams[field]);
      }
    }
    return httpParam;
  }

  protected setHeaders = (request?: object) => {
    const token = StaticValuesService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      SportorgToken: token
    });

    if (request) {
      for (const addedHeader of Object.keys(request)) {
        headers = headers.set(addedHeader, request[addedHeader]);
      }
    }
    // update the saved header
    this.authenticatedHeaders = headers;
  }

  protected handleRestResponse(observable: Observable<ApiResponse<any>>): Observable<ApiResponse<any>> {
    return observable.pipe(
      // handle success cases
      map((response: ApiResponse<any>) => {
        // return specifically the correct type of object
        return new ApiResponse(response.data, !response.message, response.index || 1, response.message );
      }),
      catchError((err: HttpErrorResponse) => {
        const errResponse = new ApiResponse([], false);
        errResponse.index = -1;
        errResponse.message = err.message || 'Unknown error';

        if (err.status === 401) { // currently logged in
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
  public get(url: string, params?: object, headers?: object): Observable<ApiResponse<any>> {
    const composedUrl = `${this.baseUrl}/${url}`;
    this.setHeaders(headers);
    // send the request and safely handle the response
    return  this.handleRestResponse(
      this._http.get<ApiResponse<any>>(
        composedUrl,
      { params: this.convertHttpParam(params), headers: this.authenticatedHeaders}
    ));
  }

  public getFile(url: string, params?: object, headers?: any): Observable<any> {
    const composedUrl = `${this.baseUrl}/${url}`;
    headers.Accept = '';
    headers.responseType = 'text';
    const token = StaticValuesService.getToken();
    let fileHeaders = new HttpHeaders({
      'Content-Type': 'text/html',
      Accept: 'text/html',
      SportorgToken: token
    });
    // update the saved header
    this.authenticatedHeaders = fileHeaders;
    // send the request and safely handle the response
    return new Observable<any>(sub => {
      this._http.get<any>(
        composedUrl,
        {params: this.convertHttpParam(params), headers: this.authenticatedHeaders}
      ).subscribe((response: any) => {
        sub.next(response);
      });
    });
  }

  public put(url: string, body: any, params?: object, headers?: object): Observable<ApiResponse<any>> {
    const composedUrl = `${this.baseUrl}/${url}`;
    this.setHeaders(headers);
    // send the request and safely handle the response
    return  this.handleRestResponse(
      this._http.put<ApiResponse<any>>(
        composedUrl,
        body,
        { params: this.convertHttpParam(params), headers: this.authenticatedHeaders}
      ));
  }

  public postFile(url: string, request: File, params?: object, headers?: object): Observable<ApiResponse<any>> {
    const composedUrl = `${this.baseUrl}/${url}`;
    const token = StaticValuesService.getToken();
    // update the saved header
    this.authenticatedHeaders = new HttpHeaders({
      SportorgToken: token
    });
    const reader = new FileReader();
    const fileReturned = new Observable<string | ArrayBuffer>((subscription) => {
      reader.onload = (function(fileResult: any) {
        subscription.next(reader.result);
      });
    });

    return new Observable<ApiResponse<any>>((subscription) => {
      fileReturned.subscribe((fileData: string | ArrayBuffer) => {
        const filePayload = {
          data: fileData,
          name: request.name,
          size: request.size,
          type: request.type
        };
        this.handleRestResponse(
          this._http.post<ApiResponse<any>>(
            composedUrl,
            filePayload,
            { params: this.convertHttpParam(params), headers: this.authenticatedHeaders}
            )).subscribe((resp: ApiResponse<any>) => {
              subscription.next(resp);
        });
      });
      reader.readAsDataURL(request); // read in the file from the user's OS
    });
  }

  public delete(url: string, headers?: object): Observable<ApiResponse<any>> {
    const composedUrl = `${this.baseUrl}/${url}`;
    this.setHeaders(headers);
    // send the request and safely handle the response
    return  this.handleRestResponse(
      this._http.delete<ApiResponse<any>>(
        composedUrl,
        { headers: this.authenticatedHeaders}
      ));
  }
}
