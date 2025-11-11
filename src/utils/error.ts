export class ApiError extends Error {
  status?: number;
  data?: any;
  
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error.response) {
    const message = error.response.data?.message || error.response.data?.error;
    return message || `오류 발생: ${error.response.status}`;
  }
  
  if (error.request) {
    return '서버에 연결할 수 없습니다';
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다';
};
