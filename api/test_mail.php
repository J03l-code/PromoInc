<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

echo "<h2>PromoInc Mail Diagnosis Script</h2>";

// 1. Check if mail function exists
$mailExists = function_exists('mail');
echo "<b>mail() function exists:</b> " . ($mailExists ? "<span style='color:green'>YES</span>" : "<span style='color:red'>NO</span>") . "<br>";

// 2. Check disabled functions
$disabled = ini_get('disable_functions');
echo "<b>disable_functions:</b> " . ($disabled ? "<span style='color:red'>$disabled</span>" : "<span style='color:green'>None</span>") . "<br>";

// 3. Database Check
try {
    $db = getDB();
    $stmtSettings = $db->query("SELECT `value` FROM settings WHERE `key` = 'site_email'");
    $emailRow = $stmtSettings->fetch();
    $adminEmail = $emailRow ? $emailRow['value'] : 'ventas@promoinc.ec';
    echo "<b>Configured admin email (Receiver):</b> " . htmlspecialchars($adminEmail) . "<br>";
} catch (\Throwable $e) {
    echo "<b style='color:red'>Database Error:</b> " . htmlspecialchars($e->getMessage()) . "<br>";
    $adminEmail = 'ventas@promoinc.ec';
}

// 4. Try sending a simple mail
$to = $adminEmail;
$subject = "PromoInc Diagnostic Test Mail";
$message = "This is a simple diagnostic mail sent from " . ($_SERVER['HTTP_HOST'] ?? 'unknown host') . " at " . date('Y-m-d H:i:s');

$host = $_SERVER['HTTP_HOST'] ?? 'promoinc.ec';
$host = preg_replace('/^www\./i', '', $host);
$fromEmail = 'noreply@' . $host;

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: PromoInc Diagnostico <" . $fromEmail . ">\r\n";

echo "<br><b>Sending test mail...</b><br>";
echo "To: $to<br>";
echo "From: $fromEmail<br>";

error_clear_last();
$sent = @mail($to, $subject, $message, $headers, "-f" . $fromEmail);
$err = error_get_last();

if ($sent) {
    echo "<span style='color:green; font-weight:bold;'>SUCCESS! mail() function returned TRUE.</span><br>";
    echo "This means PHP successfully handed off the mail to the host mail server. If you still don't receive it, the host server is blocking it or dropping it downstream (e.g. SMTP/SPF issue).<br>";
} else {
    echo "<span style='color:red; font-weight:bold;'>FAILED! mail() function returned FALSE.</span><br>";
    if ($err) {
        echo "<b>Error Message:</b> " . htmlspecialchars($err['message']) . "<br>";
    } else {
        echo "<b>Error Message:</b> No direct PHP error message. The server's mail agent rejected the handoff.<br>";
    }
}
