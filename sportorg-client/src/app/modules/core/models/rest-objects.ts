
export class ApiResponse {
  success: boolean;
  status: number;
  data: any[];
  message?: string;
  index: number;
  constructor(data: any[], success = true, index = 0, message = null) {
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

export interface IndexedCache<T> {
  cache: Record<number, T>
}
