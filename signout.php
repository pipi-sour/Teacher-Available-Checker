<?php
require_once 'ex/ChromePhp.php';
require_once 'ex/main.php';

error_reporting(E_ALL & ~E_NOTICE);

if(isset($_SESSION['MESSAGE'])) {
  $msg = $_SESSION['MESSAGE'];
  $_SESSION['MESSAGE'] = "";
}

session_start();
if (isset($_SESSION["NAME"])) {
  $errMsg = "ログアウトしました。";
} else {
  $errMsg = "セッションがタイムアウトしました。";
}
// セッションの変数のクリア
$_SESSION = array();

// セッションクリア
session_destroy();
header("Location: signin.php");

?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>ログアウト</title>
  </head>
<body>
    <h1>ログアウト画面</h1>
    <div>
      <?php echo h($errMsg); ?>
    </div>
    <ul>
      <li><a href="signin.php">ログイン画面に戻る</a></li>
    </ul>
  </body>
</html>