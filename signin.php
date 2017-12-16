<?php
include 'ex/ChromePhp.php'; // デバッグ用
include 'main.php';

session_start();
$pdo = connectDB();
$errMsg = "";

if (inputPost('signIn')) {
  $errFlag = 0;
  
  $user_mail = inputPost('mailAddress');
  $user_pass = inputPost('password');
  
  if (empty($user_mail)) {
    $errMsg = 'ユーザーIDが未入力です。';
  } else if (empty($user_pass)) {
    $errMsg = 'パスワードが未入力です。';
  }
  
  if ($errFlag == 0) {
    $stmt = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
    $stmt->bindValue(1, $user_mail);
    $stmt->execute();
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
      
    if (!empty($res['mail'])) {
      if (password_verify($user_pass, $res['passwd'])) {
        //セッションを情報を保持したまま置き換える
        session_regenerate_id(true);
        
        $_SESSION['NAME'] = $res['name'];
        $_SESSION['MAIL'] = $res['mail'];
        
        header("Location: //localhost:8888/index.php");  // メイン画面へ遷移
        exit();  // 処理終了
      } else {
        // 認証失敗
        $errMsg = 'ユーザーIDあるいはパスワードに誤りがあります。';
      }
    } else {
      // 4. 認証成功なら、セッションIDを新規に発行する
      // 該当データなし
      $errMsg = 'ユーザーIDあるいはパスワードに誤りがあります。';
    }
  }
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>サインイン</title>
  </head>
  <body>
    <h1>サインイン画面</h1>
    <form id="loginForm" name="loginForm" action="" method="POST">
    <fieldset>
        <legend>ログインフォーム</legend>
        <div><font color="#ff0000"><?php echo h($errMsg); ?></font></div>
        <label for="mailAddress">ID (メールアドレス)</label><br>
        <input type="text" id="mailAddress" name="mailAddress" placeholder="メールアドレス" value="<?php echo $user_mail; ?>"><br>
        <label for="password">パスワード</label><br>
        <input type="password" id="password" name="password" value="" placeholder="パスワード"><br>
        <input type="submit" id="login" name="signIn" value="サインイン">
      </fieldset>
    </form>
    <br>
    <form action="signup.php">
      <fieldset>          
        <legend>新規登録フォーム</legend>
        <input type="submit" value="新規登録">
      </fieldset>
    </form>
  </body>
</html>