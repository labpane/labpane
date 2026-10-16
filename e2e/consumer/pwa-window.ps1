param(
  [Parameter(Mandatory = $true)][int]$BrowserProcessId,
  [Parameter(Mandatory = $true)]
  [ValidateSet('Hide title bar', 'Show title bar', 'Minimize', 'Maximize', 'Restore', 'Close')]
  [string]$Name
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty, $BrowserProcessId)
$windows = [System.Windows.Automation.AutomationElement]::RootElement.FindAll([System.Windows.Automation.TreeScope]::Children, $condition)
# Only the installed fixture window in the browser process created by this test.
# Never select the developer's browser or another app by a shared button name.
$app = @($windows | Where-Object { $_.Current.Name -eq 'Labpane PWA test - Lab consumer' })
if ($app.Count -ne 1) { throw 'Expected exactly one local PWA fixture window' }
$buttonType = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
$buttonName = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $Name)
$buttonCondition = New-Object System.Windows.Automation.AndCondition($buttonType, $buttonName)
$buttons = $app[0].FindAll([System.Windows.Automation.TreeScope]::Descendants, $buttonCondition)
if ($buttons.Count -ne 1) { throw "Expected exactly one '$Name' control in the local PWA" }
$invoke = [System.Windows.Automation.InvokePattern]$buttons[0].GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
$invoke.Invoke()
