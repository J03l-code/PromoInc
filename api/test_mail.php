<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

echo "<h2>PromoInk Mail Diagnosis Script</h2>";

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
    $adminEmail = $emailRow ? $emailRow['value'] : 'ventas@promoink.ec';
    echo "<b>Configured admin email (Receiver):</b> " . htmlspecialchars($adminEmail) . "<br>";
} catch (\Throwable $e) {
    echo "<b style='color:red'>Database Error:</b> " . htmlspecialchars($e->getMessage()) . "<br>";
    $adminEmail = 'ventas@promoink.ec';
}

// 4. Try sending a simple mail via new sendSMTP helper
$to = $adminEmail;
$subject = "PromoInk Diagnostic SMTP Test Mail";
$message = "This is a simple diagnostic mail sent via SECURE SMTP from " . ($_SERVER['HTTP_HOST'] ?? 'unknown host') . " at " . date('Y-m-d H:i:s');

echo "<br><b>Sending test mail via secure SMTP...</b><br>";
echo "To: $to<br>";
echo "Sender SMTP account: promoink@jiyanedesign.com<br>";

$sent = sendSMTP($to, $subject, "<p>" . nl2br(htmlspecialchars($message)) . "</p>");

if ($sent) {
    echo "<span style='color:green; font-weight:bold;'>SUCCESS! SMTP email was successfully sent.</span><br>";
    echo "This means the secure connection to smtp.hostinger.com on port 465 was established, credentials for promoink@jiyanedesign.com were verified, and the mail was successfully accepted and dispatched.<br>";
} else {
    echo "<span style='color:red; font-weight:bold;'>FAILED! SMTP sending failed.</span><br>";
    if (isset($GLOBALS['SMTP_LAST_ERROR'])) {
        echo "<b>SMTP Error Detail:</b> <span style='color:orange'>" . htmlspecialchars($GLOBALS['SMTP_LAST_ERROR']) . "</span><br>";
    }
    echo "Check connection or authentication settings.<br>";
}
