import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebcamPanel } from '../components/WebcamPanel';
import { ActionBar } from '../components/ActionBar';
import { ResultCard } from '../components/ResultCard';
import { StatusDot } from '@/components/StatusDot';
import { useAttendanceStore, AttendanceType } from '../store/attendanceStore';
import { attendanceApi } from '../api/attendanceApi';
import { handleApiError } from '@/utils/error';
import { formatTime } from '@/utils/time';

export const AttendancePage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [healthStatus, setHealthStatus] = useState<'online' | 'offline' | 'warning'>('offline');
  
  const { inProgress, lastResult, setInProgress, setLastResult, clearResult, setCountdown } = useAttendanceStore();

  // 현재 카메라 프레임을 base64로 캡처
  const captureCurrentFrame = async (): Promise<string> => {
    const videoElement = document.querySelector('video');
    
    if (!videoElement) {
      throw new Error('카메라 비디오 요소를 찾을 수 없습니다');
    }

    // 비디오가 재생 가능한 상태인지 확인
    if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('비디오 데이터 로드 타임아웃')), 3000);
        videoElement.oncanplay = () => {
          clearTimeout(timeout);
          resolve();
        };
        videoElement.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('비디오 로드 실패'));
        };
      });
    }

    // Canvas를 사용해서 비디오 프레임을 base64로 변환
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context를 생성할 수 없습니다');
    }
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // JPEG 형식으로 base64 변환 (data:image/jpeg;base64, 제거)
    const base64 = canvas.toDataURL('image/jpeg', 0.95);
    return base64.split(',')[1];
  };

  // 현재 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatTime());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval); // 타이머 정리
  }, []);

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await attendanceApi.health();
        setHealthStatus('online');
      } catch (error) {
        setHealthStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  /* 출.퇴근 처리 핸들러 */
  const handleAttendance = async (type: AttendanceType) => {
    setInProgress(true);
    setCountdown(0); // (캡처 시간)

    // Countdown animation
    const countdownPromise = new Promise<void>((resolve) => {
      resolve(); // 즉시 완료
    });

    try {
      // 카운트다운이 끝날 때까지 대기
      await countdownPromise;
      
      // 현재 카메라 프레임 캡처
      const image = await captureCurrentFrame();
      
      // 
      const response = await attendanceApi.identify({ type, image });
      console.log("<< 버튼 클릭 - identify 응답 >>", response);
      
      const result = {
        success: response.success,
        type,
        employee_id: response.employee_id,
        user: response.user,
        name: response.name,
        distance: response.distance,
        message: response.message,
        reason: response.reason, // "already_checked_in" 등
        timestamp: new Date().toISOString(),
      };

      setLastResult(result);
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setLastResult({
        success: false,
        type,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });

      if (healthStatus !== 'offline') {
        setHealthStatus('warning');
      }
    } finally {
      setInProgress(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Face Attendance</h1>
          <span className="text-3xl font-mono text-primary">{currentTime}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusDot status={healthStatus} />
            <span className="text-sm text-gray-400">
              {healthStatus === 'online' ? '연결됨' : healthStatus === 'warning' ? '불안정' : '오프라인'}
            </span>
          </div>
          
          <button
            onClick={() => navigate('/enroll')}
            className="px-3 py-1.5 text-sm bg-primary hover:bg-blue-600 text-white rounded-md border border-primary transition-colors"
          >
            직원 등록
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 text-sm bg-surface hover:bg-gray-700 rounded-md border border-border transition-colors"
          >
            설정
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Webcam Preview */}
          <WebcamPanel />

          {/* Action Bar */}
          <ActionBar onAttendance={handleAttendance} disabled={inProgress} />
        </div>
      </div>

      {/* Result Card */}
      {lastResult && (
        <ResultCard result={lastResult} onDismiss={clearResult} />
      )}
    </div>
  );
};
