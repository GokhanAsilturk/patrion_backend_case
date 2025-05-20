# 3000 portundaki işlemleri bul ve sonlandır
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processes) {
    $processes | ForEach-Object { 
        $processName = (Get-Process -Id $_).ProcessName
        Write-Host "Sonlandırılıyor: $processName (PID: $_)" -ForegroundColor Yellow
        Stop-Process -Id $_ -Force 
    }
    Write-Host "`n3000 portundaki tüm işlemler sonlandırıldı." -ForegroundColor Green
} else {
    Write-Host "`n3000 portunda çalışan işlem bulunamadı." -ForegroundColor Yellow
}

Write-Host "`nBilgi: Bu script Node.js ve diğer 3000 portunu kullanan işlemleri sonlandırır." -ForegroundColor Cyan
Write-Host "İşlem tamamlandı. Çıkmak için bir tuşa basın..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
