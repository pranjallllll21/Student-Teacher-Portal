$base = 'http://localhost:5000/api'

# Login as demo student
$creds = @{ email = 'student@demo.com'; password = 'password123' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' -Body $creds
$token = $login.token
Write-Host "Token length: $($token.Length)"
$headers = @{ Authorization = "Bearer $token" }

# Get assignments
$assignResp = Invoke-RestMethod -Uri "$base/assignments" -Method Get -Headers $headers
if (-not $assignResp.assignments -or $assignResp.assignments.Count -eq 0) { Write-Host 'No assignments found'; exit }
$assignment = $assignResp.assignments[0]
Write-Host "Using assignment: $($assignment.title) - ID: $($assignment._id)"

# Create a small test PDF file
$filePath = Join-Path $PSScriptRoot 'test_upload.pdf'
"%PDF-1.4\n%Test PDF content" | Out-File -FilePath $filePath -Encoding ascii
Write-Host "Created test file at: $filePath"

# Upload file
$upload = Invoke-RestMethod -Uri "$base/upload" -Method Post -Headers $headers -Form @{ file = Get-Item $filePath; type = 'assignments' }
Write-Host "Upload response: $($upload | ConvertTo-Json)"

# Submit assignment
$payload = @{ content = ''; files = @($upload.fileUrl) } | ConvertTo-Json
$submit = Invoke-RestMethod -Uri "$base/assignments/$($assignment._id)/submit" -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $payload
Write-Host "Submit response: $($submit | ConvertTo-Json)"
