<?php
require_once 'ex/main.php';
session_start();

error_reporting(E_ALL & ~E_NOTICE);

// データベースに接続
$pdo = connectDB();

// 各エラーメッセージを初期化
$mailErrMsg = "";
$nameErrMsg = "";
$passErrMsg = "";
$confErrMsg = "";

// ログインボタンが押された場合
if (filter_has_var(INPUT_POST, 'signup_submit')) {
  // エラーフラグを初期化
  $errFlag = 0;
  
  $mail = h(inputPost('signup_mail'));
  $name = h(inputPost('signup_name'));
  $pass = h(inputPost('signup_pass'));
  $conf_pass = h(inputPost('signup_conf_pass'));
  
  $stmt_ch = $pdo->prepare("SELECT * FROM account");
  $stmt_ch->execute();
  $res = $stmt_ch->fetchAll(PDO::FETCH_ASSOC);
  
  if (empty($mail)) {
    $mailErrMsg = "メールアドレスが入力されていません。";
    $errFlag = 1;
  }
  if (empty($name)) {
    $nameErrMsg = 'ユーザー名が入力されていません。';
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
  
  if(!mailDuplicationCheck($mail)) {
    $mailErrMsg = 'そのメールアドレスは既に登録されています。';
    $errFlag = 1;
  }
  
  if ($errFlag == 0) {
    $pass_hash = password_hash($pass, PASSWORD_DEFAULT);
    
    $stmt_suc = $pdo->prepare("INSERT INTO account(mail, name, passwd) VALUES (?, ?, ?)");
    $stmt_suc->execute(array($mail, $name, $pass_hash));
    
    $_SESSION['MESSAGE'] = "登録に成功しました。ログインしてください。";
    header("Location: signin.php");
    exit();
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
<?php require_once 'ex/header.php'; ?>
    <link rel="stylesheet" href="ex/css/sign.css">
    <script src="ex/js/sign.js"></script>
    <title>新規登録</title>
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
                <input class="mdl-textfield__input" id="signup-mail" name="signup_mail" type="email" minlength="6" maxlength="255" value="<?php echo h($user_mail); ?>">
                <label class="mdl-textfield__label" for="signup-mail">メールアドレス</label>
                <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
              </div>
              <p class="err-msg"><?php echo h($mailErrMsg); ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">person</i>
                <input class="mdl-textfield__input" id="signup-name" name="signup_name" type="text" minlength="2" maxlength="16" value="<?php echo $user_name; ?>">
                <label class="mdl-textfield__label" for="signup-name">ユーザー名</label>
                <span class="mdl-textfield__error">ユーザー名は2文字以上16文字以内で入力してください</span>
              </div>
              <p class="err-msg"><?php echo $nameErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" id="signup-pass" name="signup_pass" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" minlength="8" maxlength="32">
                <label class="mdl-textfield__label" for="signup-pass">パスワード</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
              </div>
              <p class="err-msg"><?php echo $passErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" id="signup-conf-pass" name="signup_conf_pass" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" minlength="8" maxlength="32">
                <label class="mdl-textfield__label" for="signup-conf-pass">パスワード (確認)</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
              </div>
              <p class="err-msg"><?php echo $confErrMsg; ?></p>
              <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" id="signup-submit" name="signup_submit" type="submit">
                登録
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