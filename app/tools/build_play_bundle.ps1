param(
    [string]$Flutter = "C:\Users\khoom\development\flutter\bin\flutter.bat"
)

$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidRoot = Join-Path $appRoot "android"
$keyProperties = Join-Path $androidRoot "key.properties"

if (-not (Test-Path $keyProperties)) {
    Write-Host "Missing android/key.properties."
    Write-Host "Copy android/key.properties.template to android/key.properties and fill in your private upload keystore values."
    Write-Host "Do not commit key.properties or upload-keystore.jks."
    exit 1
}

Push-Location $appRoot
try {
    & $Flutter build appbundle --release
} finally {
    Pop-Location
}
