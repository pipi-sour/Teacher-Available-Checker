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