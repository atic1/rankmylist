# DFD Level 0 screenshot capture
$chromePaths = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)
$browser = $null
foreach ($p in $chromePaths) {
    if (Test-Path $p) { $browser = $p; break }
}
Write-Host "Using: $browser"
$out = 'c:\Users\ankit\Music\rank_my_list\dfd_level_0.png'
$url = 'file:///c:/Users/ankit/Music/rank_my_list/docs/dfd_level0.html'
$args = @('--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--window-size=1300,550', "--screenshot=$out", $url)
Start-Process -FilePath $browser -ArgumentList $args -Wait -NoNewWindow
if (Test-Path $out) {
    Write-Host "SUCCESS: $out"
} else {
    Write-Host "FAILED"
}
