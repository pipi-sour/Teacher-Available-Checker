<?php
require_once 'ex/main.php';
session_start();

error_reporting(E_ALL & ~E_NOTICE);

// トーストメッセージがあれば登録
if(isset($_SESSION['MESSAGE'])) {
  $msg = $_SESSION['MESSAGE'];
  $_SESSION['MESSAGE'] = "";
}

// データベースに接続
$pdo = connectDB();

// サインインボタンが押されたら
if (filter_has_var(INPUT_POST, 'signin-submit')) {
  $errFlag = 0;
  
  $user_mail = h(inputPost('mailAddress'));
  $user_pass = h(inputPost('password'));
  
  if (empty($user_mail)) {
    $mailErrMsg = 'メールアドレスが入力されていません。';
    $errFlag = 1;
  } else if (empty($user_pass)) {
    $passErrMsg = 'パスワードが入力されていません。';
    $errFlag = 1;
  }
  
  if ($errFlag == 0) {
    $stmt = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
    $stmt->bindValue(1, $user_mail);
    $stmt->execute();
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
      
    if (!empty($res['mail'])) {
      if (password_verify($user_pass, $res['passwd'])) {
        session_regenerate_id(true);
        
        $_SESSION['NAME'] = $res['name'];
        $_SESSION['MAIL'] = $res['mail'];
        
        header("Location: index.php");
        exit();
      } else {
        $errMsg = 'メールアドレスあるいはパスワードに誤りがあります。';
      }
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
<?php require_once 'ex/header.php'; ?>
    <link rel="stylesheet" href="ex/css/sign.css">
    <title>サインイン</title>
  </head>
  <body>
    <main role="main">
      <div id="sign-form-box">
        <div id="sign-top-logo"><img src="ex/logo.png" alt="logo"></div>
        <p class="err-msg"><?php echo $errMsg; ?></p>
        <div id="signin-form">
          <form name="signup-form" action="" method="POST">
            <fieldset>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">email</i>
                <input class="mdl-textfield__input" type="email" id="mailAddress" name="mailAddress" value="<?php echo $user_mail; ?>">
                <label class="mdl-textfield__label" for="mailAddress">メールアドレス</label>
                <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
              </div>
              <p class="err-msg"><?php echo $mailErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" type="password" id="password" name="password">
                <label class="mdl-textfield__label" for="password">パスワード</label>
              </div>
              <p class="err-msg"><?php echo $passErrMsg; ?></p>
              <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" type="submit" id="signin-submit" name="signin-submit" value="submit">
                サインイン
              </button>
            </fieldset>
          </form>
        </div>
        <div id="sign-notice">
          <p>アカウントをお持ちではありませんか？<a href="signup.php">新規登録</a></p>
        </div>
      </div>
    </main>
  </body>
</html>