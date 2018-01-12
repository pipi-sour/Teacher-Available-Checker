<?php
require_once 'ex/main.php';
session_start();

ini_set('display_errors', "On");
ini_set('error_reporting', E_ALL & ~E_NOTICE);

// データベースに接続
$pdo = connectDB();

// エラーの初期化
$errFlag = 0;
$mailErrMsg = "";
$passErrMsg = "";

// サインインボタンが押された場合
if (filter_has_var(INPUT_POST, 'signin-submit')) {
  
  // 入力内容をサニタイズ
  $mail = inputPost('email');
  $pass = inputPost('password');
  
  // エラー
  if (empty($mail)) {
    $mailErrMsg = 'メールアドレスが入力されていません。';
    $errFlag = 1;
  } else if (empty($pass)) {
    $passErrMsg = 'パスワードが入力されていません。';
    $errFlag = 1;
  }
  
  // エラーなし
  if ($errFlag == 0) {
    $stmt = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
    $stmt->bindValue(1, $mail);
    $stmt->execute();
    $res = $stmt->fetch();
    
    // メールアドレスとパスワードが正しい
    if (!empty($res['mail']) && password_verify($pass, $res['passwd'])) {
      session_regenerate_id(true);

      $_SESSION['NAME'] = $res['name'];
      $_SESSION['MAIL'] = $res['mail'];

      header("Location: index.php");
      exit();
    } else {
      $errMsg = 'メールアドレスあるいはパスワードに誤りがあります。';
    }
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <?php require_once 'ex/head.php'; ?>
    <link rel="stylesheet" href="ex/css/sign.css">
    <title>サインイン - 在室確認の杜</title>
  </head>
  <body>
    <main role="main">
      <div id="sign-form-box">
        <div id="sign-top-logo"><img src="ex/logo.png" alt="logo"></div>
        <p class="err-msg"><?php echo h($errMsg); ?></p>
        <div id="signin-form">
          <form name="signup-form" action="" method="POST">
            <fieldset>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">email</i>
                <input class="mdl-textfield__input" type="email" id="email" name="email" value="<?php echo h($mail); ?>">
                <label class="mdl-textfield__label" for="email">メールアドレス</label>
                <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
              </div>
              <p class="err-msg"><?php echo h($mailErrMsg); ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" type="password" id="password" name="password">
                <label class="mdl-textfield__label" for="password">パスワード</label>
              </div>
              <p class="err-msg"><?php echo h($passErrMsg); ?></p>
              <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" type="submit" id="signin-submit" name="signin-submit" value="submit">
                サインイン
              </button>
            </fieldset>
          </form>
        </div>
        <div id="sign-notice">
          <p>アカウントをお持ちではありませんか？<a href="signup.php">アカウントを作成</a></p>
        </div>
      </div>
    </main>
  </body>
</html>