<?php

// PHPMailerのエイリアスをインポート
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// PHPMailer関連ファイルとmain.phpを読み込み
require "/var/www/html/ex/vendor/phpmailer/phpmailer/src/Exception.php";
require "/var/www/html/ex/vendor/phpmailer/phpmailer/src/PHPMailer.php";
require "/var/www/html/ex/vendor/phpmailer/phpmailer/src/SMTP.php";
require '/var/www/html/ex/vendor/autoload.php';
require '/var/www/html/ex/main.php';

// エラー報告
ini_set('display_errors', "On");
ini_set('error_reporting', E_ALL & ~E_NOTICE);

// 日本語に設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// 現在時刻を取得
date_default_timezone_set('Asia/Tokyo');
$now = new DateTime();

// アカウント作成者全員のアカウント情報を取得
$pdo = connectDB();
$stmt = $pdo->query('SELECT * FROM account');
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

// アカウントの回数分繰り返す
foreach($res as $i) {
  // アカウントの情報を取得
  $name = $i['name'];
  $mail = $i['mail'];
  $ntf = $i['notification'];
  $nb = new DateTime($i ['notification_begin']);
  $ne = new DateTime($i ['notification_end']);

  // メール通知がONで通知スケジュールと一致していたらメールを送信
  if($ntf == true && $nb <= $now && $now <= $ne) {
    
    // メールアドレスからお気に入りに登録されている教員名を取得
    $tname1 = getDBValue($pdo, 'tname1', 'account', 'mail', $mail);
    $tname2 = getDBValue($pdo, 'tname2', 'account', 'mail', $mail);
    $tname3 = getDBValue($pdo, 'tname3', 'account', 'mail', $mail);
    $tname4 = getDBValue($pdo, 'tname4', 'account', 'mail', $mail);

    // お気に入り教員名からその教員の在室状況を取得
    $stmt_tstat = $pdo->prepare('SELECT * FROM status WHERE name_en = ? OR name_en = ? OR name_en = ? OR name_en = ? ORDER BY department ASC');
    $stmt_tstat->bindValue(1, $tname1);
    $stmt_tstat->bindValue(2, $tname2);
    $stmt_tstat->bindValue(3, $tname3);
    $stmt_tstat->bindValue(4, $tname4);
    $stmt_tstat->execute();
    $tstat = $stmt_tstat->fetchAll(PDO::FETCH_ASSOC);
    
    // 本文を作成
    $body = "$name さん<br><br>お気に入りに登録した教員の在室状況をお知らせします。<hr>";
    foreach ((array)$tstat as $j) {
      if(!empty($j['name'])) {
        if ($j['available'] == 1) {
          $stat_av = '<span style="color:blue">在室</span>';
        } else {
          $stat_av = '<span style="color:red">不在</span>';
        }
        $body .= $j['name'] . "教員: $stat_av" . '<br>';
      }
    }
    $body .= '<hr>詳しくは<a href="http://172.16.206.206">こちら</a>をご覧ください（校内ネットワークへの接続が必要です）。' . 
             '<br><br><p style="color:red">在室状況判断の根拠はセンサによる自動判別であり、現在の在室状況を確約するものではありません。</p>';

    // PHPMailerのインスタンスを作成
    $mailer = new PHPMailer(true);

    try {
      // デバッグ出力を有効化
      $mailer->SMTPDebug = 2;   
      // SMTPで送信
      $mailer->isSMTP();            
      // SMTPホストを設定
      $mailer->Host = 'mail.cc.ibaraki-ct.ac.jp';
      // SMTP認証を無効化
      $mailer->SMTPAuth = false;
      
      // 差出人を設定
      $mailer->setFrom('ibaraki.kosen.pbl3@gmail.com', '在室確認の杜');
      // 宛先を設定
      $mailer->addAddress($mail, $name);

      // HTMLを使用
      $mailer->isHTML(true);
      // UTF-8にエンコード
      $mailer->CharSet = 'UTf-8';
      // 件名を設定
      $mailer->Subject = mb_encode_mimeheader('【在室確認の杜】教員の在室状況のお知らせ');
      // メール内容を設定
      $mailer->Body    = $body;
       
      // 送信
      $mailer->send();
    } catch (Exception $e) {
      echo 'Mailer Error: ' . $mailer->ErrorInfo;
    }
  }
}