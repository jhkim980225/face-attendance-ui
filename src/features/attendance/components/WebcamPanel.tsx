import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { OverlayGuide } from '@/components/OverlayGuide';
import { CountdownRing } from '@/components/CountdownRing';
import { useAttendanceStore } from '../store/attendanceStore';

// ⭐ 컴포넌트 외부에 전역 변수 선언 (모듈 레벨)
let globalStream: MediaStream | null = null;
let isInitializing = false;
let modelsLoaded = false;

export const WebcamPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const { inProgress, countdown } = useAttendanceStore();

  // 얼굴 검출 모델 로드 
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded) {
        setIsModelLoading(false);
        console.log("모델이 로드 되지 않았습니다.")
        return;
      }
      
      try {
        console.log("🤖 얼굴 검출 모델 로드 중...");
        
        // CDN에서 모델 로드
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        
        modelsLoaded = true;
        setIsModelLoading(false);
        console.log("✅ 얼굴 검출 모델 로드 완료");
      } catch (error) {
        console.error("❌ 모델 로드 실패:", error);
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, []);

  // 카메라 시작
  useEffect(() => {
    let isMounted = true;
    
    const startCamera = async () => {
      // 이미 초기화 중이면 대기
      if (isInitializing) {
        console.log("⚠️ 카메라 초기화 중... 대기");
        
        // 최대 2초 대기
        for (let i = 0; i < 20; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!isInitializing || !isMounted) break;
        }
        
        if (!isMounted) return;
      }
      
      // 이미 스트림이 있으면 재사용
      if (globalStream && globalStream.active) {
        console.log("✅ 기존 스트림 재사용");
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = globalStream;
          setCameraError(false);
        }
        return;
      }
      
      isInitializing = true;
      
      try {
        console.log("🎥 새 카메라 스트림 시작...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        console.log("✅ getUserMedia 성공");

        if (!isMounted) {
          console.log("⚠️ 이미 언마운트됨 → 즉시 정리");
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // 이전 글로벌 스트림 정리
        if (globalStream) {
          console.log("🧹 이전 글로벌 스트림 정리");
          globalStream.getTracks().forEach(track => track.stop());
        }

        globalStream = stream;
        console.log("✅ globalStream에 할당 완료");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        if (isMounted) {
          setCameraError(false);
        }
      } catch (error) {
        console.error('❌ Camera access error:', error);
        
        if (!isMounted) return;
        
        setCameraError(true);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage('카메라 접근 권한이 거부되었습니다');
          } else if (error.name === 'NotFoundError') {
            setErrorMessage('카메라를 찾을 수 없습니다');
          } else if (error.name === 'NotReadableError') {
            setErrorMessage('카메라 초기화 중 문제가 발생했습니다. 페이지를 새로고침해주세요.');
          } else {
            setErrorMessage(`카메라에 접근할 수 없습니다: ${error.name}`);
          }
        }
      } finally {
        isInitializing = false;
      }
    };

    console.log("🔄 useEffect 실행");
    startCamera();
    
    return () => {
      console.log("🧹 Cleanup 시작");
      isMounted = false;
      
      // video element만 정리, globalStream은 유지
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // 얼굴이 타원 가이드 안에 있는지 체크
  const isFaceInsideOval = (box: { x: number; y: number; width: number; height: number }, canvasSize: { width: number; height: number }) => {
    // 타원 가이드 설정 (캔버스 크기 기준 비율)
    // 화면 크기의 약 25-30% 정도 크기로 설정
    const ovalWidthRatio = 0.25;  // 캔버스 너비의 25%
    const ovalHeightRatio = 0.55; // 캔버스 높이의 35%
    
    const ovalWidth = canvasSize.width * ovalWidthRatio;
    const ovalHeight = canvasSize.height * ovalHeightRatio;
    
    // 타원 중심 (화면 중앙)
    const ovalCenterX = canvasSize.width / 2;
    const ovalCenterY = canvasSize.height / 2;
    
    // 타원 반지름
    const ovalRadiusX = ovalWidth / 2;
    const ovalRadiusY = ovalHeight / 2;
    
    // 얼굴 박스의 중심점
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;
    
    // 타원 내부 판정 함수 (타원 방정식: ((x-cx)/rx)^2 + ((y-cy)/ry)^2 <= 1)
    const dx = (faceCenterX - ovalCenterX) / ovalRadiusX;
    const dy = (faceCenterY - ovalCenterY) / ovalRadiusY;
    
    // 얼굴 중심이 타원 안에 있으면 인식
    return (dx * dx + dy * dy) <= 1;
  };

  // 실시간 얼굴 검출
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !canvasRef.current || isModelLoading) {
      return;
    }

    let animationFrameId: number;
    let isDetecting = false;

    const detectFace = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || isDetecting) return;

      // 비디오가 준비되지 않았으면 대기
      if (video.readyState !== 4) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      isDetecting = true;

      try {
        // 얼굴 검출 (TinyFaceDetector 사용 - 빠름)
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks(true);

        // Canvas 크기를 비디오 크기에 맞춤
        const displaySize = { 
          width: video.offsetWidth, 
          height: video.offsetHeight 
        };
        faceapi.matchDimensions(canvas, displaySize);

        // Canvas 초기화
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 디버그: 타원 검출 영역 표시 (반투명 파란색)
          const ovalWidthRatio = 0.25;
          const ovalHeightRatio = 0.35;
          const ovalWidth = displaySize.width * ovalWidthRatio;
          const ovalHeight = displaySize.height * ovalHeightRatio;
          const ovalCenterX = displaySize.width / 2;
          const ovalCenterY = displaySize.height / 2;
          
          ctx.beginPath();
          ctx.ellipse(
            ovalCenterX,
            ovalCenterY,
            ovalWidth / 2,
            ovalHeight / 2,
            0,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'; // blue-500 반투명
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]); // 점선
          ctx.stroke();
          ctx.setLineDash([]); // 점선 해제

          if (detections) {
            // 얼굴 위치 그리기
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const box = resizedDetections.detection.box;
            
            // 타원 안에 있는지 체크
            const isInside = isFaceInsideOval(box, displaySize);
            
            if (isInside) {
              // 타원 안에 있으면 녹색으로 표시
              setFaceDetected(true);
              ctx.strokeStyle = '#10b981'; // green-500
              ctx.fillStyle = '#10b981';
            } else {
              // 타원 밖에 있으면 빨간색으로 표시
              setFaceDetected(false);
              ctx.strokeStyle = '#ef4444'; // red-500
              ctx.fillStyle = '#ef4444';
            }
            
            // 얼굴 박스 그리기
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // 랜드마크 그리기 (작은 점들)
            const landmarks = resizedDetections.landmarks;
            landmarks.positions.forEach((point: faceapi.Point) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
              ctx.fill();
            });
          } else {
            setFaceDetected(false);
          }
        }
      } catch (error) {
        console.error("얼굴 검출 오류:", error);
      } finally {
        isDetecting = false;
      }

      // 다음 프레임에서 다시 검출 (약 30fps)
      animationFrameId = requestAnimationFrame(detectFace);
    };

    // 검출 시작
    detectFace();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [modelsLoaded, isModelLoading]);

  // 컴포넌트 완전 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log("🧹 컴포넌트 최종 언마운트");
      if (globalStream) {
        globalStream.getTracks().forEach(track => track.stop());
        globalStream = null;
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
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Canvas for Face Detection Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Guide Overlay */}
          <OverlayGuide />
          
          {/* Face Detection Status */}
          {!isModelLoading && (
            <div className="absolute top-4 left-4 z-10">
              {faceDetected ? (
                <div className="flex items-center gap-2 bg-green-500 bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">✓ 위치 완벽! 준비되었습니다</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500 bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">얼굴을 타원 안으로 이동해주세요</span>
                </div>
              )}
            </div>
          )}
          
          {/* Model Loading Indicator */}
          {isModelLoading && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-blue-500 bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold">AI 모델 로딩 중...</span>
            </div>
          )}
          
          {/* Countdown Ring */}
          {inProgress && countdown > 0 && (
            <CountdownRing progress={(countdown / 3) * 100} />
          )}
        </>
      )}
    </div>
  );
};
