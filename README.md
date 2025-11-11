# Face Attendance UI

얼굴 인식 기반 출퇴근 관리 시스템의 React 프론트엔드 애플리케이션입니다.

## 📋 개요

이 프로젝트는 Python/OpenCV 백엔드와 통합되어 실시간 얼굴 인식을 통한 출퇴근 기록을 제공하는 프로덕션 레벨의 웹 애플리케이션입니다.

### 주요 기능

- ✅ 실시간 MJPEG 비디오 스트림 프리뷰
- ✅ 얼굴 인식 기반 출근/퇴근 기록
- ✅ 백엔드 헬스 체크 및 상태 모니터링
- ✅ 설정 페이지를 통한 API 엔드포인트 관리
- ✅ 다크 테마 UI (Tailwind CSS)
- ✅ 상태 관리 (Zustand)
- ✅ 타입 안전성 (TypeScript)

## 🛠 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **상태 관리**: Zustand
- **HTTP 클라이언트**: Axios
- **스타일링**: Tailwind CSS
- **유틸리티**: clsx

## 📦 설치 및 실행

### 사전 요구사항

- Node.js 18+ 또는 20+
- npm, yarn, 또는 pnpm 패키지 매니저

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하거나 `.env.example`을 복사하여 백엔드 URL을 설정하세요:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
VITE_STREAM_PATH=/stream.mjpeg
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 5. 프로덕션 프리뷰

```bash
npm run preview
```

## 🔌 백엔드 API 요구사항

이 프론트엔드는 다음 엔드포인트를 제공하는 Python/OpenCV 백엔드가 필요합니다:

### 필수 엔드포인트

#### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 2. Video Stream
```
GET /stream.mjpeg
```
**Response:** MJPEG 스트림 (multipart/x-mixed-replace)

#### 3. Face Identification
```
POST /identify
```
**Request Body:**
```json
{
  "type": "IN" | "OUT",
  // optional additional parameters
}
```
**Response (Success):**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "user": "홍길동",
  "name": "홍길동",
  "distance": 0.42,
  "message": "인증 성공"
}
```
**Response (Failure):**
```json
{
  "success": false,
  "message": "얼굴을 인식할 수 없습니다"
}
```

#### 4. Face Enrollment (Optional)
```
POST /enroll
```
**Request Body:**
```json
{
  "name": "홍길동",
  // optional additional parameters
}
```
**Response:**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "message": "등록 완료"
}
```

#### 5. Attendance Log (Optional)
```
POST /attendance
```
직접 DB 로깅이 필요한 경우 사용합니다.

### CORS 설정

백엔드에서 CORS를 허용해야 합니다:

```python
# Flask 예제
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 또는 특정 origin만 허용
```

## 📁 프로젝트 구조

```
face-attendance-ui/
├── src/
│   ├── app/                      # 앱 루트 및 라우터
│   │   └── App.tsx              # 메인 앱 컴포넌트
│   ├── components/              # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── StatusDot.tsx
│   │   ├── OverlayGuide.tsx
│   │   └── CountdownRing.tsx
│   ├── features/
│   │   └── attendance/          # 출퇴근 기능 모듈
│   │       ├── api/
│   │       │   └── attendanceApi.ts  # API 클라이언트
│   │       ├── components/
│   │       │   ├── PreviewPanel.tsx  # 비디오 프리뷰
│   │       │   ├── ActionBar.tsx     # 버튼 바
│   │       │   └── ResultCard.tsx    # 결과 카드
│   │       ├── pages/
│   │       │   ├── AttendancePage.tsx
│   │       │   └── SettingsPage.tsx
│   │       └── store/
│   │           └── attendanceStore.ts # Zustand 스토어
│   ├── styles/
│   │   └── global.css           # 전역 스타일
│   ├── utils/                   # 유틸리티 함수
│   │   ├── env.ts              # 환경 변수 관리
│   │   ├── time.ts             # 시간 포맷팅
│   │   └── error.ts            # 에러 핸들링
│   └── main.tsx                 # 엔트리 포인트
├── .env                         # 환경 변수
├── .env.example                 # 환경 변수 예제
├── index.html                   # HTML 템플릿
├── tailwind.config.js           # Tailwind 설정
├── postcss.config.js            # PostCSS 설정
├── tsconfig.json                # TypeScript 설정
├── vite.config.ts               # Vite 설정
└── package.json                 # 프로젝트 메타데이터
```

## 🎨 주요 컴포넌트

### AttendancePage
- 메인 출퇴근 페이지
- 실시간 비디오 스트림 표시
- 출근/퇴근 버튼
- 헬스 체크 상태 표시
- 인증 결과 카드

### SettingsPage
- API Base URL 설정
- 스트림 경로 설정
- 디바이스 정보 표시
- localStorage에 설정 저장

### PreviewPanel
- MJPEG 스트림 표시
- 얼굴 가이드 오버레이
- 카운트다운 링 (인증 진행 중)
- 스트림 오류 처리

### ActionBar
- 출근/퇴근 버튼 (대형)
- QR 스캔 버튼 (스텁)
- 사번·PIN 버튼 (스텁)
- 도움말 버튼

### ResultCard
- 성공/실패 결과 표시
- 자동 닫힘 (3초)
- 사용자 정보 표시
- 타임스탬프

## 🔧 설정

### 절대 경로 임포트

`@/*` 별칭을 사용하여 절대 경로로 임포트할 수 있습니다:

```typescript
import { Button } from '@/components/Button';
import { attendanceApi } from '@/features/attendance/api/attendanceApi';
```

### 다크 테마

Tailwind CSS를 사용한 다크 테마가 기본으로 설정되어 있습니다:

- 배경: `#0B0F14`
- 카드 표면: `#11161D`
- 테두리: `#1F2937`
- 주 색상 (파란색): `#3B82F6`
- 성공 (녹색): `#16A34A`
- 위험 (빨간색): `#DC2626`

## 🚀 배포

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 문제 해결

### 스트림이 표시되지 않음
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 브라우저 콘솔에서 네트워크 오류 확인

### 인증 실패
- `/health` 엔드포인트가 응답하는지 확인
- POST 요청 형식이 백엔드 예상과 일치하는지 확인
- 네트워크 탭에서 요청/응답 확인

### 빌드 오류
- Node.js 버전 확인 (18+ 권장)
- `node_modules` 삭제 후 재설치
- 캐시 정리: `npm run clean` (package.json에 스크립트 추가 필요)

## 📝 라이선스

이 프로젝트는 내부용으로 개발되었습니다.

## 👥 기여

내부 팀원만 기여 가능합니다.

---

**개발 환경**: Windows 10/11, VS Code
**테스트 브라우저**: Chrome, Edge
**백엔드 호환**: Python 3.8+, OpenCV, Flask/FastAPI
