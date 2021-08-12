import {Subject} from "rxjs";

export class ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
  message?: string;
  index: number;
  constructor(data: T, success = true, index = 0, message = null) {
    this.data = data;
    this.status = 200;
    this.success = success;
    this.index = index;
    this.message = message;
  }
  hasErrors(): boolean {
    return this.message && this.message.length > 0;
  }
}
export interface LookupItem {
  id: number;
  stringId?: string;
  name: string;
  moreInfo?: any;
  otherId?: any;
  lookup: string;
  description?: string;
  checked?: boolean;
  numberValue?: number;
}

export interface IndexedCache<T> {
  cache: Record<number, T>
}
