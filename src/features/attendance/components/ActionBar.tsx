import { Button } from '@/components/Button';
import { AttendanceType } from '../store/attendanceStore';

// 출근 퇴근 QR스캔 사번 도움말 버튼 바
interface ActionBarProps {
  onAttendance: (type: AttendanceType) => void;
  disabled: boolean;
}

export const ActionBar = ({ onAttendance, disabled }: ActionBarProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Main attendance buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onAttendance('IN')}
          disabled={disabled}
          className="min-w-[160px] text-xl py-4"
        >
          출근 (IN)
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={() => onAttendance('OUT')}
          disabled={disabled}
          className="min-w-[160px] text-xl py-4"
        >
          퇴근 (OUT)
        </Button>
      </div>

      {/* Secondary action buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => alert('QR 스캔 기능은 준비 중입니다')}
        >
          QR 스캔
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => alert('사번·PIN 입력 기능은 준비 중입니다')}
        >
          사번·PIN
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => alert('도움말: 얼굴을 카메라에 정면으로 맞춰주세요')}
        >
          도움말 (?)
        </Button>
      </div>
    </div>
  );
};
