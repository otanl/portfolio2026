param(
	[string]$Root = "static/images",
	[int]$MaxWidth = 2400,
	[int]$JpegQuality = 2,
	[int]$MinSavingsPercent = 8,
	[switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
	Write-Error "ffmpeg not found in PATH."
}

if (-not (Get-Command ffprobe -ErrorAction SilentlyContinue)) {
	Write-Error "ffprobe not found in PATH."
}

if (-not (Test-Path $Root)) {
	Write-Error "Root path not found: $Root"
}

$files = Get-ChildItem -Path $Root -Recurse -File | Where-Object {
	$ext = $_.Extension.ToLowerInvariant()
	(($ext -eq ".jpg" -or $ext -eq ".jpeg") -and $_.Name -notlike "*.jpg.__optimized.jpg")
}

if ($files.Count -eq 0) {
	Write-Host "No JPEG files found under $Root"
	exit 0
}

$totalBefore = 0L
$totalAfter = 0L
$processed = 0
$replaced = 0

foreach ($file in $files) {
	$processed++
	$inPath = $file.FullName
	$tempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("imgopt_" + [System.Guid]::NewGuid().ToString("N") + ".jpg")
	$totalBefore += $file.Length

	$dim = & ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$inPath"
	if (-not $dim) {
		Write-Warning "Skip (ffprobe failed): $($file.FullName)"
		$totalAfter += $file.Length
		continue
	}

	$parts = $dim.Trim() -split "x"
	$width = [int]$parts[0]

	$vf = "scale='min(iw,$MaxWidth)':-2"
	& ffmpeg -y -v error -i "$inPath" -vf $vf -q:v $JpegQuality -map_metadata -1 "$tempPath"

	if (-not (Test-Path $tempPath)) {
		Write-Warning "Skip (ffmpeg output missing): $($file.FullName)"
		$totalAfter += $file.Length
		continue
	}

	$newSize = (Get-Item $tempPath).Length
	$savings = 0
	if ($file.Length -gt 0) {
		$savings = [math]::Round((($file.Length - $newSize) / $file.Length) * 100, 2)
	}

	$shouldReplace = ($newSize -lt $file.Length) -and ($savings -ge $MinSavingsPercent -or $width -gt $MaxWidth)

	if ($shouldReplace) {
		if ($DryRun) {
			if (Test-Path $tempPath) { Remove-Item $tempPath -Force -ErrorAction SilentlyContinue }
			$totalAfter += $newSize
			Write-Host ("[DRY] {0} {1:N2}MB -> {2:N2}MB ({3}% saved)" -f $file.Name, ($file.Length / 1MB), ($newSize / 1MB), $savings)
		} else {
			Copy-Item -Force $tempPath $inPath
			if (Test-Path $tempPath) { Remove-Item $tempPath -Force -ErrorAction SilentlyContinue }
			$replaced++
			$totalAfter += $newSize
			Write-Host ("[OK ] {0} {1:N2}MB -> {2:N2}MB ({3}% saved)" -f $file.Name, ($file.Length / 1MB), ($newSize / 1MB), $savings)
		}
	} else {
		if (Test-Path $tempPath) { Remove-Item $tempPath -Force -ErrorAction SilentlyContinue }
		$totalAfter += $file.Length
		Write-Host ("[SKIP] {0} savings too small ({1}%)" -f $file.Name, $savings)
	}
}

$savedBytes = $totalBefore - $totalAfter
$savedPercent = 0
if ($totalBefore -gt 0) {
	$savedPercent = [math]::Round(($savedBytes / $totalBefore) * 100, 2)
}

Write-Host ""
Write-Host ("Processed: {0}" -f $processed)
Write-Host ("Replaced : {0}" -f $replaced)
Write-Host ("Before   : {0:N2} MB" -f ($totalBefore / 1MB))
Write-Host ("After    : {0:N2} MB" -f ($totalAfter / 1MB))
Write-Host ("Saved    : {0:N2} MB ({1}%)" -f ($savedBytes / 1MB), $savedPercent)
