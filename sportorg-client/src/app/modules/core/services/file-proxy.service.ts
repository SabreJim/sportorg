import {RestProxyService} from "./rest-proxy.service";
import {Observable} from "rxjs";
import { ApiResponse } from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import { Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";

export interface FileResponse {
  data?: string; // base64 string
  fileName?: string;
  size?: number;
  fileType?: string;
  preview?: string;
}

@Injectable({providedIn: 'root'})
export class FileProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }

  public getFilesList = (fileType: string, category: string): Observable<FileResponse[]> => {
    return new Observable((subscription) => {
      this.get(`files/get-list/${fileType}`, { category }).subscribe((response: ApiResponse<FileResponse[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`List of files could not be retrieved at this time`);
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  }

  public uploadFile = (fileBody: File, category: string, requestType: string, fileId: number = null): Observable<number> => {
    return new Observable((subscription) => {
      const params: any = {};
      if (category) params.category = category;
      if (fileId) params.fileId = fileId;
      params.requestType = requestType || 'default';

      this.postFile(`files`, fileBody, params ).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(-1);
        } else {
          subscription.next(response.data.newId);
        }
      }, (error: any) => {
        subscription.next(-1);
      });
    });
  }

  public getImageById(id: number, isPreview: boolean) : Observable<string> {
    return new Observable((subscription) => {
      const params: any = {isPreview};
      this.get(`images/${id}`, params,
        { Accept: 'image/*', 'Cache-Control': 'public, max-age=604800, immutable'} ).subscribe((response: FileResponse) => {
        if (!response.data) {
          subscription.next(null);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {
        subscription.next(null);
      });
    });
  }

}
