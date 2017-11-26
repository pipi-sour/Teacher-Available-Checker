<?php
session_start();

$db['host'] = "localhost";  // DBサーバのURL
$db['user'] = "root";  // ユーザー名
$db['pass'] = "root";  // ユーザー名のパスワード
$db['dbname'] = "available";  // データベース名

// エラーメッセージ、登録完了メッセージの初期化
$errorMessage = "";
$signUpMessage = "";

// ログインボタンが押された場合
if (isset($_POST["signUp"])) {
  
  // htmlspecialchars関数: HTMLにとって意味のある文字列（悪用される可能性あり）を無意味化する
  $username = htmlspecialchars($_POST["username"], ENT_QUOTES);
  $password = htmlspecialchars($_POST["password"], ENT_QUOTES);
  $conf_password = htmlspecialchars($_POST["password2"], ENT_QUOTES);

  if (empty($username)) {
    $errorMessage = 'ユーザーIDが未入力です。';
  } else if (strlen($_POST["username"]) < 6 || strlen($_POST["username"]) > 32) {
    $errorMessage = 'アカウント名は6文字以上32文字以内で入力してください。';
  } else if (empty($password)) {
    $errorMessage = 'パスワードが未入力です。';
  } else if (empty($conf_password)) {
    $errorMessage = '確認用パスワードが未入力です。';
  } else if ($password != $conf_password) {
    $errorMessage = '2つのパスワードが一致しません。';
  }
  
  // SHA-2でハッシュ化
  $passwd = hash("sha256", $pass);
  $passw = "horai" . $passwd . "hisayuki";
  $passd = hash("sha256", $passw);
  

  if (!empty($_POST["username"]) && !empty($_POST["password"]) && !empty($_POST["password2"]) && $_POST["password"] === $_POST["password2"]) {
    // 入力したユーザIDとパスワードを格納
    $username = $_POST["username"];
    $password = $_POST["password"];

    // 2. ユーザIDとパスワードが入力されていたら認証する
    $dsn = sprintf('mysql: host=%s; dbname=%s; charset=utf8', $db['host'], $db['dbname']);

    // 3. エラー処理
    try {
      $pdo = new PDO($dsn, $db['user'], $db['pass'], array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));

      $stmt = $pdo->prepare("INSERT INTO account(name, passwd) VALUES (?, ?)");

      //パスワードのハッシュ化
      $stmt->execute(array($username, password_hash($password, PASSWORD_DEFAULT)));
      $userid = $pdo->lastinsertid();  // 登録した(DB側でauto_incrementした)IDを$useridに入れる

      $signUpMessage = '登録が完了しました。あなたの登録IDは '. $userid. ' です。';  // ログイン時に使用するIDとパスワード
    } catch (PDOException $e) {
      $errorMessage = 'データベースエラー';
      /*
       *デバッグ用
       *echo $e->getMessage();
       */
    }
  } else {
    $errorMessage = '入力内容に誤りがあります。';
  }
}
?>

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>新規登録</title>
  </head>
  <body>
    <h1>新規登録画面</h1>
    <form id="loginForm" name="loginForm" action="" method="POST">
      <fieldset>
        <legend>新規登録フォーム</legend>
        <div><font color="#ff0000"><?php echo htmlspecialchars($errorMessage, ENT_QUOTES); ?></font></div>
        <div><font color="#0000ff"><?php echo htmlspecialchars($signUpMessage, ENT_QUOTES); ?></font></div>
        <label for="userid">メールアドレス（ID）</label><input type="text" id="userid" name="userid" value="" placeholder="メールアドレス">
        <br>
        <label for="username">アカウント名（ニックネーム）</label><input type="text" id="username" name="username" value="" placeholder="ユーザー名を入力">
        <br>
        <label for="password">パスワード</label><input type="password" id="password" name="password" value="" placeholder="パスワードを入力">
        <br>
        <label for="password2">パスワード(確認用)</label><input type="password" id="password2" name="password2" value="" placeholder="再度パスワードを入力">
        <br>
        <input type="submit" id="signUp" name="signUp" value="新規登録">
      </fieldset>
    </form>
    <br>
    <form action="signin.php">
      <input type="submit" value="戻る">
    </form>
  </body>
</html>