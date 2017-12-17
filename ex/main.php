<?php
function h($text) {
  return htmlspecialchars($text, ENT_QUOTES);
}

function inputPost($target) {
  return (string)filter_input(INPUT_POST, $target, FILTER_SANITIZE_SPECIAL_CHARS);
}

function connectDB() {
  $db_user = 'root';
  $db_pass = 'root';
  $db_host = 'localhost';
  $db_name = 'available';
  $db_type = 'mysql';
  $dsn = "$db_type: host=$db_host; dbname=$db_name; charset=utf8";
  
  try {
    $pdo = new PDO($dsn, $db_user, $db_pass, array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    return $pdo;
  } catch (PDOException $ex) {
    echo "接続エラー: " . $ex->getMessage();
    return 0;
  }
}

function toaster($msg) {
  if($msg != "") {
    print '
      <script>
        Command: toastr["info"]("' . $msg . '", "Teacher Available Checker");
      </script>';
  }
}

function mailDuplicationCheck($mail) {
  $flag = 0; $i = 0;
  $pdo = connectDB();
  $stmt = $pdo->prepare("SELECT * FROM account");
  $stmt->execute();
  $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach($res as $i) {
    if($mail == $i ['mail']) {
      $flag = 1;
      return false;
    }
  }
  if($flag == 0) {
    return true;
  }
}

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