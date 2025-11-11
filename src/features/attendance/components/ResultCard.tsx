import { useEffect } from 'react';
import { Card } from '@/components/Card';
import { AttendanceResult } from '../store/attendanceStore';
import { formatDateTime } from '@/utils/time';

interface ResultCardProps {
  result: AttendanceResult;
  onDismiss: () => void;
}

export const ResultCard = ({ result, onDismiss }: ResultCardProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const variant = result.success ? 'success' : 'danger';
  const icon = result.success ? '✓' : '✗';
  const title = result.title || (result.success ? '인증 성공' : '인증 실패');

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <Card variant={variant} className="min-w-[300px] shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold ${
              result.success
                ? 'bg-success/20 text-success'
                : 'bg-danger/20 text-danger'
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">
                {title}
              </h3>
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {result.success ? (
              <div className="space-y-1 text-sm">
                {result.type && (
                  <p>
                    <span className="text-gray-400">유형:</span>{' '}
                    <span className="font-medium">
                      {result.type === 'IN' ? '출근' : '퇴근'}
                    </span>
                  </p>
                )}
                {(result.name || result.user || result.employee_id) && (
                  <p>
                    <span className="text-gray-400">이름:</span>{' '}
                    <span className="font-medium">
                      {result.name || result.user || result.employee_id}
                    </span>
                  </p>
                )}
                {result.distance !== undefined && (
                  <p>
                    <span className="text-gray-400">거리:</span>{' '}
                    <span className="font-medium">{result.distance.toFixed(2)}</span>
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  {formatDateTime(new Date(result.timestamp))}
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  {result.reason === 'already_checked_in' && result.name
                    ? `${result.name} 님은 이미 출근 처리되었습니다`
                    : result.reason === 'already_checked_out' && result.name
                    ? `${result.name} 님은 이미 퇴근 처리되었습니다`
                    : result.message || '얼굴을 인식할 수 없습니다'}
                </p>
                <p className="text-gray-500 text-xs">
                  {result.reason?.startsWith('already_') 
                    ? '출퇴근 기록을 확인해주세요'
                    : '사번·PIN 또는 QR 코드로 시도해보세요'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
