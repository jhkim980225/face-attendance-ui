import { useRef, useEffect, useState } from 'react';
import { OverlayGuide } from '@/components/OverlayGuide';
import { CountdownRing } from '@/components/CountdownRing';
import { useAttendanceStore } from '../store/attendanceStore';

export const WebcamPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { inProgress, countdown } = useAttendanceStore();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // 사용자 카메라 접근 요청
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user', // 전면 카메라 (모바일)
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError(true);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage('카메라 접근 권한이 거부되었습니다');
          } else if (error.name === 'NotFoundError') {
            setErrorMessage('카메라를 찾을 수 없습니다');
          } else {
            setErrorMessage('카메라에 접근할 수 없습니다');
          }
        }
      }
    };

    startCamera();

    // 컴포넌트 언마운트 시 카메라 종료
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video bg-surface rounded-lg overflow-hidden border-2 border-border">
      {cameraError ? (
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
          <p className="text-lg font-medium">{errorMessage}</p>
          <p className="text-sm mt-2">브라우저에서 카메라 권한을 허용해주세요</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }} // 거울 모드
          />
          <OverlayGuide />
          {inProgress && countdown > 0 && (
            <CountdownRing progress={(countdown / 3) * 100} />
          )}
        </>
      )}
    </div>
  );
};
