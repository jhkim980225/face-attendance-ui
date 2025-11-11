import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { env, setApiConfig, getApiBaseUrl, getStreamPath } from '@/utils/env';
import { attendanceApi } from '../api/attendanceApi';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [streamPath, setStreamPath] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl());
    setStreamPath(getStreamPath());
  }, []);

  const handleSave = () => {
    setApiConfig(apiBaseUrl, streamPath);
    attendanceApi.updateBaseUrl(apiBaseUrl);
    setSaved(true);
    
    setTimeout(() => {
      setSaved(false);
      navigate('/');
    }, 1500);
  };

  const handleReset = () => {
    setApiBaseUrl(env.apiBaseUrl);
    setStreamPath(env.streamPath);
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
          <h1 className="text-2xl font-bold">설정</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <h2 className="text-xl font-semibold mb-6">백엔드 API 설정</h2>
          
          <div className="space-y-6">
            {/* API Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Base URL
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://127.0.0.1:5000"
                className="w-full px-4 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                기본값: {env.apiBaseUrl}
              </p>
            </div>

            {/* Stream Path */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                스트림 경로
              </label>
              <input
                type="text"
                value={streamPath}
                onChange={(e) => setStreamPath(e.target.value)}
                placeholder="/stream.mjpeg"
                className="w-full px-4 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                기본값: {env.streamPath}
              </p>
            </div>

            {/* Device Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                디바이스 정보
              </label>
              <div className="px-4 py-3 bg-background border border-border rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">브라우저:</div>
                  <div>{navigator.userAgent.split(' ').slice(-1)[0]}</div>
                  <div className="text-gray-400">화면 해상도:</div>
                  <div>{window.screen.width} × {window.screen.height}</div>
                  <div className="text-gray-400">언어:</div>
                  <div>{navigator.language}</div>
                </div>
              </div>
            </div>

            {/* Current Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                현재 설정
              </label>
              <div className="px-4 py-3 bg-background border border-border rounded-md">
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-400">완전한 스트림 URL:</span>
                  </p>
                  <p className="text-primary break-all">
                    {apiBaseUrl}{streamPath}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1"
              >
                {saved ? '✓ 저장됨' : '저장'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="flex-1"
              >
                기본값으로 재설정
              </Button>
            </div>

            {saved && (
              <div className="text-center text-success text-sm">
                설정이 저장되었습니다. 메인 페이지로 이동합니다...
              </div>
            )}
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold mb-3">도움말</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              • API Base URL은 Python/OpenCV 백엔드 서버의 주소입니다.
            </p>
            <p>
              • 스트림 경로는 MJPEG 비디오 스트림의 엔드포인트입니다.
            </p>
            <p>
              • 변경 사항은 브라우저의 localStorage에 저장됩니다.
            </p>
            <p>
              • 연결 문제가 있으면 백엔드 서버가 실행 중인지 확인하세요.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
