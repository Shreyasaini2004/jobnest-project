$body = @{
    messages = @(
        @{
            role = 'user'
            content = 'Hello, can you help me with resume writing?'
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method POST -Uri 'http://localhost:8000/api/ats/chatbot' -ContentType 'application/json' -Body $body
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}