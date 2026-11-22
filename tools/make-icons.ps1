# Generates the app icons (PNG) into ../icons. Run: powershell -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$file) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(11, 13, 16))
  $lime = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 255, 61))
  $s = $size / 100.0
  function New-RoundRect($x, $y, $w, $h, $r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90); $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure(); return $p
  }
  # dumbbell, kept inside the maskable safe zone (centre 60%)
  $g.FillPath($lime, (New-RoundRect (24*$s) (45.5*$s) (52*$s) (9*$s) (2*$s)))   # bar
  $g.FillPath($lime, (New-RoundRect (27*$s) (30*$s) (10*$s) (40*$s) (3.5*$s)))  # left plate
  $g.FillPath($lime, (New-RoundRect (63*$s) (30*$s) (10*$s) (40*$s) (3.5*$s)))  # right plate
  $g.FillPath($lime, (New-RoundRect (19*$s) (37*$s) (7*$s) (26*$s) (2.5*$s)))   # left collar
  $g.FillPath($lime, (New-RoundRect (74*$s) (37*$s) (7*$s) (26*$s) (2.5*$s)))   # right collar
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
New-Icon 180 'apple-touch-icon.png'
New-Icon 192 'icon-192.png'
New-Icon 512 'icon-512.png'
"Icons written to $out"

