import { create } from 'zustand';

export type AttendanceType = 'IN' | 'OUT';

export interface AttendanceResult {
  success: boolean;
  type?: AttendanceType; // optional: 등록 시에는 type이 없음
  employee_id?: string;
  user?: string;
  name?: string;
  distance?: number;
  message?: string;
  reason?: string; // "already_checked_in", "already_checked_out" 등
  title?: string; // optional: 커스텀 제목 (기본: "인증 성공" / "인증 실패")
  timestamp: string;
}

export interface AttendanceStore {
  inProgress: boolean;
  lastResult: AttendanceResult | null;
  countdown: number;
  
  setInProgress: (value: boolean) => void;
  setLastResult: (result: AttendanceResult | null) => void;
  setCountdown: (value: number | ((prev: number) => number)) => void;
  clearResult: () => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  inProgress: false,
  lastResult: null,
  countdown: 0,
  
  setInProgress: (value) => set({ inProgress: value }),
  setLastResult: (result) => set({ lastResult: result }),
  setCountdown: (value) => set((state) => ({ 
    countdown: typeof value === 'function' ? value(state.countdown) : value 
  })),
  clearResult: () => set({ lastResult: null }),
}));
