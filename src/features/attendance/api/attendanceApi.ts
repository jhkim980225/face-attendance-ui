import axios, { AxiosInstance } from 'axios';
import { getApiBaseUrl } from '@/utils/env';
import { ApiError } from '@/utils/error';

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export interface IdentifyRequest {
  type: 'IN' | 'OUT';
  image?: string; // base64 encoded image (optional for backward compatibility)
  [key: string]: any;
}

export interface IdentifyResponse {
  success: boolean;
  employee_id?: string;
  user?: string;
  name?: string;
  distance?: number;
  message?: string;
  reason?: string; // "already_checked_in", "already_checked_out" 등
  error?: string;
}

export interface EnrollRequest {
  name: string;
  image: string; // base64 encoded image
  [key: string]: any;
}

export interface EnrollResponse {
  success: boolean;
  message?: string;
  employee_id?: string;
}

class AttendanceApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
          throw new ApiError(
            error.response.data?.message || error.response.data?.error || '서버 오류',
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          throw new ApiError('서버에 연결할 수 없습니다');
        } else {
          throw new ApiError(error.message);
        }
      }
    );
  }

  updateBaseUrl(baseUrl: string) {
    this.client.defaults.baseURL = baseUrl;
  }

  async health(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health');
    return response.data;
  }

  async identify(request: IdentifyRequest, retry = true): Promise<IdentifyResponse> {
    try {
      // 이미지가 있으면 FormData로, 없으면 JSON으로 전송
      if (request.image) {
        const formData = new FormData();
        formData.append('type', request.type);
        
        // base64를 Blob으로 변환
        const byteString = atob(request.image);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        formData.append('image', blob, 'capture.jpg');
        
        const response = await this.client.post<IdentifyResponse>('/identify', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        const response = await this.client.post<IdentifyResponse>('/identify', request);
        return response.data;
      }
    } catch (error) {
      if (retry && error instanceof ApiError && !error.status) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.identify(request, false);
      }
      throw error;
    }
  }

  async enroll(request: EnrollRequest): Promise<EnrollResponse> {
    // FormData로 변환 (백엔드가 multipart/form-data를 기대)
    const formData = new FormData();
    formData.append('name', request.name);
    
    // base64를 Blob으로 변환해서 파일로 전송
    const byteString = atob(request.image);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    formData.append('image', blob, 'capture.jpg');
    
    const response = await this.client.post<EnrollResponse>('/enroll', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async attendance(data: any): Promise<any> {
    const response = await this.client.post('/attendance', data);
    return response.data;
  }
}

export const attendanceApi = new AttendanceApi();
