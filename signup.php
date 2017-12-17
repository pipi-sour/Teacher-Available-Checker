<?php
require_once 'ex/ChromePhp.php';
require_once 'ex/main.php';
session_start();

error_reporting(E_ALL & ~E_NOTICE);

if(isset($_SESSION['MESSAGE'])) {
  $msg = $_SESSION['MESSAGE'];
  $_SESSION['MESSAGE'] = "";
}

$pdo = connectDB();

$mailErrMsg = "";
$nameErrMsg = "";
$passErrMsg = "";
$confErrMsg = "";

// ログインボタンが押された場合
if (filter_has_var(INPUT_POST, 'signup-submit')) {
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
    $mailErrMsg = "メールアドレスが入力されていません。";
    $errFlag = 1;
  }
  if (empty($user_name)) {
    $nameErrMsg = 'ユーザー名が入力されていません。';
    $errFlag = 1;
  }
  if (empty($user_pass)) {
    $passErrMsg = 'パスワードが入力されていません。';
    $errFlag = 1;
  }
  if (empty($conf_pass)) {
    $confErrMsg = '確認用パスワードが入力されていません。';
    $errFlag = 1;
  } else if ($user_pass != $conf_pass) {
    $confErrMsg = '2つのパスワードが一致しません。';
    $errFlag = 1;
  }
  
  if(!mailDuplicationCheck($user_mail)) {
    $mailErrMsg = 'そのメールアドレスは既に登録されています。';
    $errFlag = 1;
  }
  
  if ($errFlag == 0) {
    $pass_hash = password_hash($user_pass, PASSWORD_DEFAULT);
    
    $stmt_suc = $pdo->prepare("INSERT INTO account(mail, name, passwd) VALUES (?, ?, ?)");
    $stmt_suc->execute(array($user_mail, $user_name, $pass_hash));
    
    //$sucMsg = '登録に成功しました。ログインしてください。';  // ログイン時に使用するIDとパスワード
    
    $_SESSION['MESSAGE'] = "登録に成功しました。ログインしてください。";
    header("Location: signin.php");
    exit();
    /*
    print '
      <script>
        alert("登録に成功しました。ログインしてください。");
        location.href = "signin.php";
      </script>';
    exit();
     *
     */
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
<?php require_once 'ex/header.php'; ?>
    <link rel="stylesheet" href="ex/sign.css">
    <script src="ex/sign.js"></script>
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
                <input class="mdl-textfield__input" type="email" id="mailAddress" name="mailAddress" value="<?php echo $user_mail; ?>">
                <label class="mdl-textfield__label" for="mailAddress">ID (メールアドレス)</label>
                <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
              </div>
              <p class="err-msg"><?php echo $mailErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">person</i>
                <input class="mdl-textfield__input" type="text" id="username" name="username" minlength="2" maxlength="16" value="<?php echo $user_name; ?>">
                <label class="mdl-textfield__label" for="username">ユーザー名</label>
                <span class="mdl-textfield__error">ユーザー名は2文字以上16文字以内で入力してください</span>
              </div>
              <p class="err-msg"><?php echo $nameErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" type="password" id="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="password" minlength="8" maxlength="32">
                <label class="mdl-textfield__label" for="password">パスワード</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
              </div>
              <p class="err-msg"><?php echo $passErrMsg; ?></p>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">lock</i>
                <input class="mdl-textfield__input" type="password" id="conf_password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="conf_password" minlength="8" maxlength="32">
                <label class="mdl-textfield__label" for="conf_password">パスワード (確認)</label>
                <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
              </div>
              <p class="err-msg"><?php echo $confErrMsg; ?></p>
              <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" type="submit" id="sign-submit" name="signup-submit" value="submit">
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