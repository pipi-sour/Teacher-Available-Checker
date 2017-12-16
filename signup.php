<?php
include 'ex/ChromePhp.php'; // デバッグ用
include 'main.php';

session_start();
$pdo = connectDB();
$errMsg = "";
$sucMsg = "";

// ログインボタンが押された場合
if (inputPost('signUp')) {
  $errFlag = 0;
  
  // htmlspecialchars関数: HTMLにとって意味のある文字列（悪用される可能性あり）を無意味化する
  $user_mail = h(inputPost('mailAddress'));
  $user_name = h(inputPost('username'));
  $user_pass = h(inputPost('password'));
  $conf_pass = h(inputPost('conf_password'));
  
  $stmt_ch = $pdo->prepare("SELECT * FROM account");
  $stmt_ch->execute();
  $res = $stmt_ch->fetchAll(PDO::FETCH_ASSOC);
  
  if (empty($user_mail)) {
    $errMsg = "メールアドレスが入力されていません。";
    $errFlag = 1;
  } else if (strlen($user_name) < 6 || strlen($user_name) > 32) {
    $errMsg = 'アカウント名は6文字以上32文字以内で入力してください。';
    $errFlag = 1;
  }
  if (empty($user_name)) {
    $errMsg = 'ユーザー名が入力されていません。';
    $errFlag = 1;
  }
  if (empty($user_pass)) {
    $errMsg = 'パスワードが入力されていません。';
    $errFlag = 1;
  }
  if (empty($conf_pass)) {
    $errMsg = '確認用パスワードが入力されていません。';
    $errFlag = 1;
  }
  if ($user_pass != $conf_pass) {
    $errMsg = '2つのパスワードが一致しません。';
    $errFlag = 1;
  }
  
  foreach($res as $i) {
    if($user_mail == $i ['mail']) {
      $errMsg = 'そのメールアドレスは既に登録されています。';
      $errFlag = 1;
    }
  }
  
  if ($errFlag == 0) {
    $pass_hash = password_hash($user_pass, PASSWORD_DEFAULT);
    
    $stmt_suc = $pdo->prepare("INSERT INTO account(mail, name, passwd) VALUES (?, ?, ?)");
    $stmt_suc->execute(array($user_mail, $user_name, $pass_hash));
    
    $sucMsg = '登録に成功しました。ログインしてください。';  // ログイン時に使用するIDとパスワード
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>新規登録</title>
  </head>
  <body>
    <h1>新規登録画面</h1>
    <form id="loginForm" name="loginForm" action="" method="POST">
      <fieldset>
        <legend>新規登録フォーム</legend>
        <div><font color="#ff0000"><?php echo h($errMsg); ?></font></div>
        <div><font color="#0000ff"><?php echo h($sucMsg); ?></font></div>
        <label for="mailAddress">メールアドレス (ID)</label><br>
        <input type="text" id="userid" name="mailAddress" value="<?php echo $user_mail; ?>" placeholder="メールアドレス"><br>
        <label for="username">アカウント名 (表示名)</label><br>
        <input type="text" id="username" name="username" value="<?php echo $user_name; ?>" placeholder="ユーザー名を入力"><br>
        <label for="password">パスワード</label><br>
        <input type="password" id="password" name="password" value="" placeholder="パスワードを入力"><br>
        <label for="conf_password">パスワード (確認用)</label><br>
        <input type="password" id="conf_password2" name="conf_password" value="" placeholder="再度パスワードを入力"><br>
        <input type="submit" id="signUp" name="signUp" value="新規登録">
      </fieldset>
    </form>
    <br>
    <form action="signin.php">
      <input type="submit" value="戻る">
    </form>
  </body>
</html>