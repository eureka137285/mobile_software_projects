# Generate assets/share.jpg (the share card thumbnail for the mini-program).
# The script is intentionally ASCII-only; Chinese text is read from config.js.
# Usage: powershell -ExecutionPolicy Bypass -File .\tools\generate-share-image.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root 'config.js'
$configText = [System.IO.File]::ReadAllText($configPath, [System.Text.Encoding]::UTF8)

function Get-ConfigValue($key) {
  $pattern = '(?<![A-Za-z0-9_])' + [regex]::Escape($key) + ':\s*"([^"]*)"'
  $match = [regex]::Match($configText, $pattern)
  if ($match.Success) { return $match.Groups[1].Value }
  return ''
}

$name   = Get-ConfigValue 'NAME'
$school = Get-ConfigValue 'SCHOOL'
$grade  = Get-ConfigValue 'GRADE'
$major  = Get-ConfigValue 'MAJOR'
$role1  = Get-ConfigValue 'ROLE1'
$role2  = Get-ConfigValue 'ROLE2'
$email  = Get-ConfigValue 'EMAIL'
$footer = Get-ConfigValue 'CARD_FOOTER'

$outDir = Join-Path $root 'assets'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outPath = Join-Path $outDir 'share.jpg'

$width = 600
$height = 480
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Background: clean deep-blue gradient
$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, [System.Drawing.Color]::FromArgb(46, 126, 192), [System.Drawing.Color]::FromArgb(15, 50, 96), 90.0)
$g.FillRectangle($bgBrush, $bgRect)

# Subtle decorative circles
$decoBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 255, 255, 255))
$g.FillEllipse($decoBrush, -90, -110, 260, 260)
$g.FillEllipse($decoBrush, 470, 330, 210, 210)

# Thin gold accent line
$lineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 201, 134))
$g.FillRectangle($lineBrush, 240, 214, 120, 4)

$fontName = 'Microsoft YaHei'
if (-not ([System.Drawing.FontFamily]::Families | Where-Object { $_.Name -eq $fontName })) {
  $fontName = 'SimHei'
}

$titleFont = New-Object System.Drawing.Font($fontName, 52, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$emailFont = New-Object System.Drawing.Font($fontName, 19, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$smallFont = New-Object System.Drawing.Font($fontName, 17, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$footerFont = New-Object System.Drawing.Font($fontName, 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

function Draw-Text($text, $font, $rect, $color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  $g.DrawString($text, $font, $brush, $rect, $format)
  $brush.Dispose()
}

Draw-Text $name $titleFont (New-Object System.Drawing.RectangleF(0, 60, 600, 84)) ([System.Drawing.Color]::White)
Draw-Text ('E-mail: ' + $email) $emailFont (New-Object System.Drawing.RectangleF(0, 144, 600, 34)) ([System.Drawing.Color]::White)
Draw-Text ($school + ' | ' + $grade + ' ' + $major) $smallFont (New-Object System.Drawing.RectangleF(0, 224, 600, 32)) ([System.Drawing.Color]::FromArgb(216, 231, 247))
Draw-Text ($role1 + ' | ' + $role2) $smallFont (New-Object System.Drawing.RectangleF(0, 260, 600, 30)) ([System.Drawing.Color]::FromArgb(216, 231, 247))
Draw-Text $footer $footerFont (New-Object System.Drawing.RectangleF(0, 418, 600, 30)) ([System.Drawing.Color]::FromArgb(170, 198, 228))

$bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$bitmap.Dispose()
Write-Output ('Saved: ' + $outPath)
