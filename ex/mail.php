<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "vendor/phpmailer/phpmailer/src/Exception.php";
require "vendor/phpmailer/phpmailer/src/PHPMailer.php";
require "vendor/phpmailer/phpmailer/src/SMTP.php";
require 'vendor/autoload.php';
require_once 'main.php';

mb_language("Japanese");
mb_internal_encoding("UTF-8");

date_default_timezone_set('Asia/Tokyo');
$now = new DateTime();
$pdo = connectDB();
$stmt = $pdo->query('SELECT * FROM account');
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($res as $i) {
  $namex = $i['name'];
  $mailx = $i['mail'];
  $ntf = $i['notification'];
  echo $mailx . " ";
  echo $ntf . " ";
  $nb = new DateTime($i ['notification_begin']);
  $ne = new DateTime($i ['notification_end']);
  echo $nb->format("Y-m-d H:i") . " ";
  echo $now->format("Y-m-d H:i") . " ";
  echo $ne->format("Y-m-d H:i") . " ";

  if($ntf == true && $nb <= $now && $now <= $ne) {
    $body = "$namex さん<br><br>教員室の在室状況をお知らせします。<hr>";
    foreach ($tstat as $j) {
      if(!empty($j['name'])) {
        if ($j['available'] == 1) {
          $stat_av = '<span style="color:blue">在室</span>';
        } else {
          $stat_av = '<span style="color:red">不在</span>';
        }
        $body .= $j['name'] . "教員: $stat_av" . '<br>';
      }
    }
    $body .= '<hr>詳しくは<a href="http://172.16.206.206">こちら</a>をご覧ください。' . 
             '<br><br><p style="color:red">※TACの根拠はセンサによる自動判別であり、現在の在室状況を確証すると約束するものではありません。</p>';

    $mail = new PHPMailer(true);

    try {
      //Server settings
      $mailer->SMTPDebug = 2;                                 // Enable verbose debug output
      $mailer->isSMTP();                                      // Set mailer to use SMTP
      $mailer->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
      $mailer->SMTPAuth = true;                               // Enable SMTP authentication
      $mailer->Username = 'ibaraki.kosen.pbl3@gmail.com';                 // SMTP username
      $mailer->Password = 'Raspberry314';                           // SMTP password
      $mailer->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
      $mailer->Port = 587;                                    // TCP port to connect to

      //Recipients
      $mailer->setFrom('ibaraki.kosen.pbl3@gmail.com', 'Teacher Available Checker');
      $mailer->addAddress($mailx, $namex);     // Add a recipient
      //$mail->addAddress('ellen@example.com');               // Name is optional
      //$mail->addReplyTo('info@example.com', 'Information');

      //Attachments
      //$mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
      //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name

      //Content
      $mailer->isHTML(true);                                  // Set email format to HTML
      $mailer->CharSet = 'UTf-8';
      $mailer->Subject = mb_encode_mimeheader('【TAC】教員の在室状況のお知らせ');
      $mailer->Body    = $body;
      $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

      $mailer->send();
      echo 'Message has been sent';
    } catch (Exception $e) {
      echo 'Message could not be sent.';
      echo 'Mailer Error: ' . $mailer->ErrorInfo;
    }
  }
}