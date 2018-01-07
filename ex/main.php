<?php

// HTMLにエスケープ
function h($text) {
  return htmlspecialchars($text, ENT_QUOTES);
}

// スーパーグローバル変数の直接使用を回避
function inputPost($target) {
  return (string) filter_input(INPUT_POST, $target, FILTER_SANITIZE_SPECIAL_CHARS);
}

// データベースに接続
function connectDB() {
  $db_user = 'root';
  $db_pass = 'root';
  $db_host = 'localhost';
  $db_name = 'available';
  $db_type = 'mysql';
  $dsn = "$db_type: host=$db_host; dbname=$db_name; charset=utf8";

  try {
    $pdo = new PDO($dsn, $db_user, $db_pass, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    return $pdo;
  } catch (PDOException $ex) {
    echo "接続エラー: " . $ex->getMessage();
    return 0;
  }
}

// データベースの1つの値を取得
function getDBValue($pdo, $field, $table, $cond, $mail) {
  $sqlg = "SELECT $field FROM $table WHERE $cond = '$mail'";
  $stmtg = $pdo->query($sqlg);
  $res = $stmtg->fetch();
  return $res[$field];
}

// データベースの1つの値を更新
function updateDBValue($pdo, $field, $table, $value, $mail) {
  if ($value == 'NULL') {
    $sqlu = "UPDATE $table SET $field = NULL WHERE mail = '$mail'";
  } else {
    $sqlu = "UPDATE $table SET $field = '$value' WHERE mail = '$mail'";
  }
  $pdo->beginTransaction();
  $pdo->query($sqlu);
  $pdo->commit();
}

// ローマ字表記の教員名から和名を調べる
function getTNameJP($tname) {
  $pdo = connectDB();
  $stmt = $pdo->prepare('SELECT * FROM status WHERE name_en = ?');
  $stmt->bindValue(1, $tname);
  $stmt->execute();
  $res = $stmt->fetch(PDO::FETCH_ASSOC);
  return $res['name'];
}

// セッション情報からトーストメッセージとモードを取得しJavaScriptに書き出し
function toaster($msg, $mode) {
  if ($msg != "") {
    print '
      <script>
        Command: toastr["' . $mode . '"]("' . $msg . '", "Teacher Available Checker");
      </script>';
  }
}

// データベース上に既にメールアドレスが登録されていないか調べる
function mailDuplicationCheck($mail) {
  $flag = 0;
  $i = 0;
  $pdo = connectDB();
  $stmt = $pdo->prepare("SELECT * FROM account");
  $stmt->execute();
  $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($res as $i) {
    if ($mail == $i ['mail']) {
      $flag = 1;
      return false;
    }
  }
  if ($flag == 0) {
    return true;
  }
}

// パスワードが正しいか検証する
function passVerify($mail, $pass) {
  $pdo = connectDB();
  $stmt = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
  $stmt->bindValue(1, $mail);
  $stmt->execute();
  $res = $stmt->fetch(PDO::FETCH_ASSOC);

  if (password_verify($pass, $res['passwd'])) {
    return true;
  } else {
    return false;
  }
}

// サインアウトする
function signOut() {
  $_SESSION = array();
  session_destroy();
  header("Location: signin.php");
}

function tmp() {
  date_default_timezone_set('Asia/Tokyo');
  $now_date = date("Y/m/d");
  $now_time = date("H:i");
  $pdo = connectDB();
  $stmt = $pdo->query('SELECT * FROM account');
  $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach($res as $i) {
    echo date("Y/m/d") . "  ";
    echo date("H:i") . "  ";
    echo $i ['mail'] . "  ";
    echo $i ['notification'] . "  ";
    $ndb[i] = date("Y/m/d", strtotime($i ['notification_date_begin'])) . "  ";
    $nde[i] = date("Y/m/d", strtotime($i ['notification_date_end'])) . "  ";
    $ntb[i] = date("H:i", strtotime($i ['notification_time_begin'])) . "  ";
    $nte[i] = date("H:i", strtotime($i ['notification_time_end'])) . "  ";
    if($now_date >= $ndb[i] && $now_date <= $nde[i] && $now_time >= $ntb[i] && $now_time <= $nte[i]) {
      echo "aaa";
    } else {
      echo "bbb";
    }
    echo "  <br> ";
    
  }
}