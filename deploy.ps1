# Face Attendance UI 배포 스크립트
# 사용법: .\deploy.ps1

$SERVER = "feda@192.168.0.20"
$REMOTE_PATH = "/var/www/face-attendance/face-attendance-ui/dist"

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# 1. 빌드
Write-Host "📦 Building..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# 2. 압축
Write-Host "📦 Compressing..." -ForegroundColor Yellow
tar -czf dist.tar.gz -C dist .

# 3. 전송
Write-Host "📤 Uploading to server..." -ForegroundColor Yellow
scp dist.tar.gz ${SERVER}:/tmp/

# 4. 서버에서 배포
Write-Host "🔧 Deploying on server..." -ForegroundColor Yellow
ssh $SERVER @"
    # 백업
    sudo cp -r $REMOTE_PATH $REMOTE_PATH.backup.`$(date +%Y%m%d_%H%M%S)
    
    # 기존 파일 삭제
    sudo rm -rf $REMOTE_PATH/*
    
    # 압축 해제
    sudo tar -xzf /tmp/dist.tar.gz -C $REMOTE_PATH
    
    # 권한 설정
    sudo chown -R nginx:nginx $REMOTE_PATH
    sudo chmod -R 755 $REMOTE_PATH
    
    # Nginx 재시작
    sudo systemctl restart nginx
    
    # 임시 파일 삭제
    rm /tmp/dist.tar.gz
    
    echo '✅ Deployment complete!'
"@

# 5. 로컬 임시 파일 삭제
Remove-Item dist.tar.gz

Write-Host "✅ Deployment finished!" -ForegroundColor Green
Write-Host "🌐 Access: http://192.168.0.20" -ForegroundColor Cyan
