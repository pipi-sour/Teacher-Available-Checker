<?php
session_start();

$db['host'] = "localhost";  // DBサーバのURL
$db['user'] = "root";  // ユーザー名
$db['pass'] = "root";  // ユーザー名のパスワード
$db['dbname'] = "available";  // データベース名

// エラーメッセージの初期化
$errorMessage = "";

// ログインボタンが押された場合
if (isset($_POST["login"])) {
  // 1. ユーザIDの入力チェック
  if (empty($_POST["userid"])) {
    $errorMessage = 'ユーザーIDが未入力です。';
  } else if (empty($_POST["password"])) {
    $errorMessage = 'パスワードが未入力です。';
  }

  if (!empty($_POST["userid"]) && !empty($_POST["password"])) {
    $userid = $_POST["userid"];
    $dsn = sprintf('mysql: host=%s; dbname=%s; charset=utf8', $db['host'], $db['dbname']);

    try {
      $pdo = new PDO($dsn, $db['user'], $db['pass'], array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));
      //PDOStatementを準備
      $stmt = $pdo->prepare('SELECT * FROM account WHERE id = ?');
      //準備されたPDOStatementを実行
      $stmt->execute(array($userid));
      $password = $_POST["password"]; //入力されたパスワード

      //行ごとに値を取得
      if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (password_verify($password, $row['passwd'])) {
          //セッションを情報を保持したまま置き換える
          session_regenerate_id(true);

          // 入力したIDのユーザー名を取得
          $id = $row['id'];
          $sql = "select * from account where id = $id";  //入力したIDからユーザー名を取得
          $stmt = $pdo->query($sql);
          foreach ($stmt as $row) {
            $row['name'];  // ユーザー名
          }
          $_SESSION["NAME"] = $row['name'];
          header("Location: //localhost:8888/index.php");  // メイン画面へ遷移
          exit();  // 処理終了
        } else {
          // 認証失敗
          $errorMessage = 'ユーザーIDあるいはパスワードに誤りがあります。';
        }
      } else {
        // 4. 認証成功なら、セッションIDを新規に発行する
        // 該当データなし
        $errorMessage = 'ユーザーIDあるいはパスワードに誤りがあります。';
      }
    } catch (PDOException $e) {
      $errorMessage = 'データベースエラー';
      //$errorMessage = $sql;
      // $e->getMessage() でエラー内容を参照可能（デバック時のみ表示）
      // echo $e->getMessage();
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
        <div><font color="#ff0000"><?php echo htmlspecialchars($errorMessage, ENT_QUOTES); ?></font></div>
        <label for="userid">ユーザーID</label><input type="text" id="userid" name="userid" placeholder="ユーザーIDを入力" value="<?php if (!empty($_POST["userid"])) {echo htmlspecialchars($_POST["userid"], ENT_QUOTES);} ?>">
        <br>
        <label for="password">パスワード</label><input type="password" id="password" name="password" value="" placeholder="パスワードを入力">
        <br>
        <input type="submit" id="login" name="login" value="ログイン">
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