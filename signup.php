<?php
require_once 'ex/main.php';
session_start();

ini_set('display_errors', "On");
ini_set('error_reporting', E_ALL & ~E_NOTICE);

// データベースに接続
$pdo = connectDB();

// エラーを初期化
$errFlag = 0;
$mailErrMsg = "";
$nameErrMsg = "";
$passErrMsg = "";
$confErrMsg = "";

// アカウントを作成ボタンが押された場合
if (filter_has_var(INPUT_POST, 'signup_submit')) {
  
  // 入力内容をサニタイズ
  $mail = inputPost('signup_mail');
  $name = inputPost('signup_name');
  $pass = inputPost('signup_pass');
  $conf_pass = inputPost('signup_conf_pass');
  
  $stmt_ch = $pdo->prepare("SELECT * FROM account");
  $stmt_ch->execute();
  $res = $stmt_ch->fetchAll(PDO::FETCH_ASSOC);
  
  // 各種エラー
  if (empty($mail)) {
    $mailErrMsg = "メールアドレスが入力されていません。";
    $errFlag = 1;
  } else if (!mailDuplicationCheck($mail)) {
    $mailErrMsg = 'そのメールアドレスは既に登録されています。';
    $errFlag = 1;
  }
  if (empty($name)) {
    $nameErrMsg = 'ユーザ名が入力されていません。';
    $errFlag = 1;
  }
  if (empty($pass)) {
    $passErrMsg = 'パスワードが入力されていません。';
    $errFlag = 1;
  }
  if (empty($pass)) {
    $confErrMsg = '確認用パスワードが入力されていません。';
    $errFlag = 1;
  } else if ($pass != $conf_pass) {
    $confErrMsg = '2つのパスワードが一致しません。';
    $errFlag = 1;
  }
  
  // エラーがなければ
  if ($errFlag == 0) {
    // パスワードをハッシュ化
    $pass_hash = password_hash($pass, PASSWORD_DEFAULT);
    
    // アカウントをデータベースに登録
    $stmt_suc = $pdo->prepare("INSERT INTO account(mail, name, passwd) VALUES (?, ?, ?)");
    $stmt_suc->execute(array($mail, $name, $pass_hash));
    
    // セッションを開始
    print '
      <script>
        alert("アカウントの作成に成功しました。サインインしてください。");
        location.href = "signin.php";
      </script>';
    exit();
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <?php require_once 'ex/head.php'; ?>
    <link rel="stylesheet" href="ex/css/sign.css">
    <title>アカウントを作成 - 在室確認の杜</title>
  </head>
  <body>
    <main role="main">
      <div id="sign-form-box">
        <div id="sign-top-logo"><img src="ex/logo.png" alt="logo"></div>
        <div id="signup-form">
          <form name="signin-form" action="" method="POST">
            <fieldset>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label ">
                <i class="material-icons mdl-textfield__label__icon">email</i>
                <input class="mdl-textfield__input" id="signup-mail" name="signup_mail" type="email" minlength="6" maxlength="255" value="<?php echo h($mail); ?>">
                <label class="mdl-textfield__label" for="signup-mail">メールアドレス</label>
                <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
              </div>
              <p class="err-msg"><?php echo h($mailErrMsg); ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">person</i>
                <input class="mdl-textfield__input" id="signup-name" name="signup_name" type="text" minlength="2" maxlength="16" value="<?php echo h($name); ?>">
                <label class="mdl-textfield__label" for="signup-name">ユーザ名</label>
                <span class="mdl-textfield__error">ユーザ名は2文字以上16文字以内で入力してください</span>
              </div>
              <p class="err-msg"><?php echo h($nameErrMsg); ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" id="signup-pass" name="signup_pass" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$">
                <label class="mdl-textfield__label" for="signup-pass">パスワード</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ2文字以上16文字以内の文字列である必要があります</span>
              </div>
              <p class="err-msg"><?php echo h($passErrMsg); ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" id="signup-conf-pass" name="signup_conf_pass" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$">
                <label class="mdl-textfield__label" for="signup-conf-pass">パスワード (確認)</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ2文字以上16文字以内の文字列である必要があります</span>
              </div>
              <p class="err-msg"><?php echo h($confErrMsg); ?></p>
              <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" id="signup-submit" name="signup_submit" type="submit">
                アカウントを作成
              </button>
            </fieldset>
          </form>
        </div>
        <div id="sign-notice">
          <p>すでにアカウントをお持ちですか？<a href="signin.php">サインイン</a></p>
        </div>
      </div>
    </main>
  </body>
</html>