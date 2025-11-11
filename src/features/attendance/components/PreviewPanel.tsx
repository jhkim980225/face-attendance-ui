import { useState, useEffect } from 'react';
import { getApiBaseUrl, getStreamPath } from '@/utils/env';
import { OverlayGuide } from '@/components/OverlayGuide';
import { CountdownRing } from '@/components/CountdownRing';
import { useAttendanceStore } from '../store/attendanceStore';

export const PreviewPanel = () => {
  const [streamError, setStreamError] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const { inProgress, countdown } = useAttendanceStore();

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    const streamPath = getStreamPath();
    setStreamUrl(`${baseUrl}${streamPath}`);
  }, []);

  const handleError = () => {
    setStreamError(true);
  };

  const handleLoad = () => {
    setStreamError(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video bg-surface rounded-lg overflow-hidden border-2 border-border">
      {streamError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">카메라 스트림에 연결할 수 없습니다</p>
          <p className="text-sm mt-2">백엔드 서버가 실행 중인지 확인하세요</p>
          <p className="text-xs mt-1 text-gray-500">{streamUrl}</p>
        </div>
      ) : (
        <>
          <img
            src={streamUrl}
            alt="Camera Stream"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={handleError}
            onLoad={handleLoad}
          />
          <OverlayGuide />
          {inProgress && countdown > 0 && (
            <CountdownRing progress={(countdown / 3) * 0} />
          )}
        </>
      )}
    </div>
  );
};
