import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebcamPanel } from '../components/WebcamPanel';
import { ResultCard } from '../components/ResultCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { AttendanceResult } from '../store/attendanceStore';
import { attendanceApi } from '../api/attendanceApi';
import { handleApiError } from '@/utils/error';

export const EnrollPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollResult, setEnrollResult] = useState<AttendanceResult | null>(null);

  // 현재 카메라 프레임을 base64로 캡처
  const captureCurrentFrame = async (): Promise<string> => {
    try {
      // WebcamPanel의 video 태그에서 현재 프레임을 캡처
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      if (!videoElement) {
        throw new Error('카메라 비디오 요소를 찾을 수 없습니다');
      }

      // Canvas를 사용해서 비디오를 base64로 변환
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context를 생성할 수 없습니다');
      }
      
      ctx.drawImage(videoElement, 0, 0);
      
      // JPEG 형식으로 base64 변환 (data:image/jpeg;base64, 제거)
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      const base64Data = base64.split(',')[1];
      
      return base64Data;
    } catch (error) {
      console.error('Failed to capture frame:', error);
      throw error instanceof Error ? error : new Error('카메라 프레임을 캡처할 수 없습니다');
    }
  };

  // 등록 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // 현재 카메라 프레임 캡처
      const image = await captureCurrentFrame();

      console.log('Sending enroll request:', {
        name: name.trim(),        
        image: image.substring(0, 50),
      });

      const response = await attendanceApi.enroll({
        name: name.trim(),
        image: image,
      });

      const result: AttendanceResult = {
        success: response.success,
        title: '등록 성공',
        employee_id: response.employee_id,
        name: name,
        message: '등록 성공',
        timestamp: new Date().toISOString(),
      };

      setEnrollResult(result);

      if (response.success) {
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setEnrollResult({
        success: false,
        title: '등록 실패',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearResult = () => {
    setEnrollResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 뒤로
          </button>
          <h1 className="text-2xl font-bold">직원 등록</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Webcam Panel */}
          <WebcamPanel />

          {/* Enrollment Form */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">직원 정보</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이름 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 text-lg bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  autoFocus
                />
              </div>

              {/* Instructions */}
              <div className="bg-surface border border-border rounded-md p-4">
                <h3 className="text-sm font-semibold mb-2 text-primary">📌 등록 안내</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 카메라를 정면으로 바라보고 얼굴을 타원 안에 맞춰주세요</li>
                  <li>• 조명이 밝은 곳에서 등록하면 인식률이 높아집니다</li>
                  <li>• 안경, 마스크를 착용하지 않은 상태로 등록해주세요</li>
                  <li>• "등록" 버튼을 누르면 현재 화면의 얼굴이 등록됩니다</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? '등록 중...' : '등록'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Result Card */}
      {enrollResult && (
        <ResultCard result={enrollResult} onDismiss={handleClearResult} />
      )}
    </div>
  );
};
