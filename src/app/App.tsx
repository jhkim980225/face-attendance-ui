import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { SettingsPage } from '@/features/attendance/pages/SettingsPage';
import { EnrollPage } from '@/features/attendance/pages/EnrollPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AttendancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/enroll" element={<EnrollPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
