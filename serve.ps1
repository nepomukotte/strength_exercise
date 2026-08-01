param([int]$Port = 8080)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Strength Session is running at http://localhost:$Port"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".webmanifest" = "application/manifest+json"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $client.ReceiveTimeout = 750
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      try { $requestLine = $reader.ReadLine() } catch { continue }
      if (-not $requestLine) { continue }
      try { while ($reader.ReadLine()) { } } catch { continue }

      $parts = $requestLine -split " "
      if ($parts.Count -lt 2) { continue }
      $requestPath = [System.Uri]::UnescapeDataString(($parts[1] -split "\?")[0]).TrimStart("/")
      if (-not $requestPath) { $requestPath = "index.html" }
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $requestPath))

      if (-not $candidate.StartsWith($root) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $status = "404 Not Found"
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $contentType = "text/plain; charset=utf-8"
      } else {
        $status = "200 OK"
        $body = [System.IO.File]::ReadAllBytes($candidate)
        $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $contentType = if ($mimeTypes[$extension]) { $mimeTypes[$extension] } else { "application/octet-stream" }
      }

      $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($body, 0, $body.Length)
    } finally {
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
