# Get the full path to this script
$scriptPath = $MyInvocation.MyCommand.Path
# Strip the filename to get the containing folder
$scriptDir = Split-Path -Parent $scriptPath
# Build the path to publish/autogit.js relative to this script
$targetJs = Join-Path $scriptDir 'publish\autogit.js'
# Run Node on that file
& node $targetJs @args