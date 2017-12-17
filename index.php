<?php
require_once 'ex/ChromePhp.php';
require_once 'ex/main.php';
session_start();

error_reporting(E_ALL & ~E_NOTICE);

if (isset($_SESSION['MESSAGE'])) {
  $msg = $_SESSION['MESSAGE'];
  $_SESSION['MESSAGE'] = "";
}

// サインインしていない場合はサインイン画面へリダイレクト
if (!isset($_SESSION['NAME'])) {
  header("Location: signin.php");
  exit;
}

// データベースに接続
$pdo = connectDB();

// セッション情報からメールアドレスとユーザー名を取得
$mail = $_SESSION["MAIL"];
//$name = $_SESSION['NAME'];

// メールアドレスからお気に入りに登録されている教員名を取得
$stmt_t = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
$stmt_t->bindValue(1, $mail);
$stmt_t->execute();
$res_t = $stmt_t->fetch();
$name = $res_t['name'];
$tname1 = $res_t['tname1'];
$tname2 = $res_t['tname2'];

// お気に入り教員名からその教員の在室状況を取得
$stmt_addedT = $pdo->prepare('SELECT * FROM status WHERE name_en = ? OR name_en = ?');
$stmt_addedT->bindValue(1, $tname1);
$stmt_addedT->bindValue(2, $tname2);
$stmt_addedT->execute();
$result3 = $stmt_addedT->fetchAll(PDO::FETCH_ASSOC);

// お気に入り追加・削除のリクエストを取得
$add_fav = inputPost('add_fav');
$del_fav = inputPost('del_fav');

// お気に入り追加のリクエストが来た場合
if (!empty($add_fav) && $add_fav != "NULL") {
  // データベースのお気に入り教員1が空の場合
  if (is_null($tname1)) {
    $pdo->beginTransaction();
    $stmt3 = $pdo->prepare('UPDATE `account` SET `tname1`= ? WHERE mail = ?');
    $stmt3->bindValue(1, $add_fav);
    $stmt3->bindValue(2, $mail);
    $stmt3->execute();
    $pdo->commit();
  // データベースのお気に入り教員2が空の場合
  } else if (is_null($tname2)) {
    $pdo->beginTransaction();
    $stmt4 = $pdo->prepare('UPDATE `account` SET `tname2`= ? WHERE mail = ?');
    $stmt4->bindValue(1, $add_fav);
    $stmt4->bindValue(2, $mail);
    $stmt4->execute();
    $pdo->commit();
  }
  // お気に入り表を更新するためページを再読み込み
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
}

// お気に入り削除のリクエストが来た場合
if (!empty($del_fav) && $del_fav != "NULL") {
  // お気に入り教員1と一致した場合その教員をお気に入りから削除
  if ($del_fav == $tname1) {
    $pdo->beginTransaction();
    $stmt3 = $pdo->prepare('UPDATE `account` SET `tname1`= NULL WHERE mail = ?');
    $stmt3->bindValue(1, $mail);
    $stmt3->execute();
    $pdo->commit();
  } else if ($del_fav == $tname2) {
  // お気に入り教員2と一致した場合その教員をお気に入りから削除
    $pdo->beginTransaction();
    $stmt4 = $pdo->prepare('UPDATE `account` SET `tname2`= NULL WHERE mail = ?');
    $stmt4->bindValue(1, $mail);
    $stmt4->execute();
    $pdo->commit();
  }
  // お気に入り表を更新するためページを再読み込み
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
}

function tableElementGenerator($result) {
  print '
    <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp avlb-table">
      <thead>
        <tr>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="department">学科</th>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="name_en">教員名</th>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="available">在室状況</th>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="infrared">赤外線</th>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="light">蛍光灯</th>
          <th class="mdl-data-table__cell--non-numeric sort" data-sort="time">更新時間</th>
        </tr>
      </thead>
      <tbody class="list">';
  foreach($result as $i) {
    if ($i ['available'] == 1) {
      $stat_av =  "◯";
    } else {
      $stat_av =  "×";
    }

    if ($i ['infrared'] == 1) {
      $stat_ir = "◯";
    } else if ($i ['infrared'] == 0) {
      $stat_ir = "△";
    } else {
      $stat_ir = "×";
    }

    if ($i ['light'] == 1) {
      $stat_lg = "◯";
    } else {
      $stat_lg = "×";
    }

    print '
        <tr>
          <td class="mdl-data-table__cell--non-numeric department">' . $i["department"] . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric name">' . $i ["name"] . '</td>' . ' 
          <td class="mdl-data-table__cell--non-numeric name_en" style="display:none;">' . $i ["name_en"] . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric available">' . $stat_av . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric infrared">' . $stat_ir . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric light">' . $stat_lg . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric time">' . date("m/d H:i", strtotime($i ['time'])) . '</td>' . '
        </tr>';
  }
  print '
      </tbody>
    </table>';
}

function favTableGenerator($result) {
  if(resLength($result) != 0) {
    tableElementGenerator($result);
  } else {
    echo 'お気に入りに何も登録されていません。';
  }
}

function allTableGenerator($pdo) {
  $stmt_all = $pdo->prepare('SELECT * FROM status');
  $stmt_all->execute();
  $result_all = $stmt_all->fetchAll(PDO::FETCH_ASSOC);
  tableElementGenerator($result_all);
}

function favAddSelector($pdo, $result, $tname1, $tname2) {
  if(resLength($result) != 2) {
    print
     '<form action="" method="post">
        <select name="add_fav">
          <option value="NULL">---</option>';
    foreach ($pdo->query('SELECT * FROM status') as $i) {
      if($i["name_en"] != $tname1 && $i["name_en"] != $tname2) {
        print
         '<option value="' . $i ["name_en"] . '">[' . $i ["department"] . ']' . $i ["name"] . '</option>';
      }
    }
    print
       '</select>
        <input type="submit" value="送信">
      </form>';
  } else {
    echo 'お気に入りの登録の上限に達しています (上限数: ' . (int)resLength($result) . ')';
  }
}

function favDelSelector($result) {
  if(resLength($result) != 0) {
    print 
     '<form action="" method="post">
        <select name="del_fav">
          <option value="NULL">---</option>';
    foreach ($result as $i) {
      print
         '<option value="' . $i ["name_en"] . '">[' . $i ["department"] . ']' . $i ["name"] . '</option>';
    }
    print
       '</select>
        <input type="submit" value="送信">
      </form>';
  } else {
    echo "お気に入りに何も登録されていません。";
  }
}

function resLength($res) {
  $count = 0; $i = 0;
  foreach($res as $i) {
    $count++;
  }
  return $count;
}

//-- アカウント関連 --

// ユーザー名変更
$acc_name = inputPost('account-new-name');
if (!empty($acc_name)) {
  $pdo->beginTransaction();
  $stmt_accName = $pdo->prepare("UPDATE account SET name = ? WHERE mail = ?");
  $stmt_accName->bindValue(1, $acc_name);
  $stmt_accName->bindValue(2, $mail);
  $stmt_accName->execute();
  $pdo->commit();
  $_SESSION['MESSAGE'] = "ユーザー名を $acc_name に変更しました";
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

$acc_mail = inputPost('account-new-mail');
if (!empty($acc_mail)) {
  if(mailDuplicationCheck($acc_mail)) {
    $pdo->beginTransaction();
    $stmt_accName = $pdo->prepare("UPDATE account SET mail = ? WHERE mail = ?");
    $stmt_accName->bindValue(1, $acc_mail);
    $stmt_accName->bindValue(2, $mail);
    $stmt_accName->execute();
    $pdo->commit();
    $_SESSION['MAIL'] = $acc_mail;
    $_SESSION['MESSAGE'] = "メールアドレスを $acc_mail に変更しました。";
    header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
    exit();
  }
}
 
if(filter_has_var(INPUT_POST, 'account-change-pass-submit')) {
  
  $acc_nowpass = inputPost('account-old-pass');
  $acc_newpass = inputPost('account-new-pass');
  $acc_confpass = inputPost('account-new-pass-conf');
  
  if(passVerify($mail, $acc_nowpass)) {
    if($acc_newpass === $acc_confpass) {
      $pdo->beginTransaction();
      $pass_hash = password_hash($acc_newpass, PASSWORD_DEFAULT);
      $stmt_suc = $pdo->prepare("UPDATE account SET passwd = ? WHERE mail = ?");
      $stmt_suc->bindValue(1, $pass_hash);
      $stmt_suc->bindValue(2, $mail);
      $stmt_suc->execute();
      $pdo->commit();
      $_SESSION = array();
      session_destroy();
      print '
        <script>
          alert("パスワードを変更しました。再度サインインしてください。");
          location.href = "signin.php";
        </script>';
      exit();
    }
    
  }
}

// アカウント削除
$acc_del = inputPost('account-delete-pass');
if (!empty($acc_del)) {
  
  $stmt_accDel = $pdo->prepare("SELECT * FROM account WHERE mail = ?");
  $stmt_accDel->bindValue(1, $mail);
  $stmt_accDel->execute();
  $res_accDel = $stmt_accDel->fetch(PDO::FETCH_ASSOC);

  if (password_verify($acc_del, $res_accDel['passwd'])) {
    
    $stmt_accDel2 = $pdo->prepare("DELETE FROM account WHERE mail = ?");
    $stmt_accDel2->bindValue(1, $mail);
    $stmt_accDel2->execute();
    $_SESSION = array();
    
    session_destroy();
    print '
      <script>
        alert("アカウントを削除しました。サインイン画面に戻ります。");
        location.href = "signin.php";
      </script>';
    exit();
  }
}
?>

<!doctype html>
<!--
  Material Design Lite
  Copyright 2015 Google Inc. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      https://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License
-->
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <?php require 'ex/header.php'; ?>
    <link rel="stylesheet" href="ex/main.css">
    <script src="ex/main.js"></script>
    <title>教員在室確認</title>
  </head>
  <body>
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
      <header class="mdl-layout__header mdl-layout__header--waterfall-hide-top mdl-layout__header--waterfall">
        <div class="mdl-layout__header-row">
          <span class="mdl-layout-title">教員在室確認</span>
          <div class="mdl-layout-spacer"></div>
        </div>
        <div class="mdl-layout__tab-bar mdl-js-ripple-effect">
          <a href="#fixed-tab-1" class="mdl-layout__tab is-active tab-button"><i class="material-icons">star</i><br><span class="icon-title"> お気に入り</span></a>
          <a href="#fixed-tab-2" class="mdl-layout__tab tab-button"><i class="material-icons">view_list</i><br><span class="icon-title"> 全教員</span></a>
          <a href="#fixed-tab-3" class="mdl-layout__tab tab-button"><i class="material-icons">settings</i><br><span class="icon-title"> 設定</span></a>
        </div>
      </header>
      <main class="mdl-layout__content">
        <section class="mdl-layout__tab-panel is-active" id="fixed-tab-1">
          <?php toaster($msg) ?>
          <div class="page-content">
            <h2>お気に入り一覧</h2>
            <?php favTableGenerator($result3); ?>
            <h2>お気に入り追加</h2>
            <?php favAddSelector($pdo, $result3, $tname1, $tname2); ?>
            <h2>お気に入り削除</h2>
            <?php favDelSelector($result3); ?>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-2">
          <div class="page-content">
            <div id="all-table">
              <div class="mdl-textfield mdl-js-textfield">
                <input class="mdl-textfield__input search" type="text" name="query" id="query">
                <label class="mdl-textfield__label" for="sample1">検索</label>
              </div>
              <?php allTableGenerator($pdo); ?>
            </div>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-3">
          <div class="page-content">
            <p><?php echo h($name); ?>としてサインイン中 <a href="signout.php">サインアウト</a></p>
            <div id="account-change-name-section">
              <button type="button" name="account-change-name" id="account-change-name" onclick="confPassword('account-change-name')">ユーザー名の変更</button>
              <div id="account-change-name-confirm" class="account-change-confirm">
                <p>新しいユーザー名を入力してください。</p>
                <form action="" method="POST">
                  <input type="text" name="account-new-name">
                  <button type="submit" value="submit">続行</button>
                </form>
              </div>
            </div>
            <div id="account-change-mail-section">
              <button type="button" name="account-change-mail" id="account-change-mail" onclick="confPassword('account-change-mail')">メールアドレスの変更</button>
              <div id="account-change-mail-confirm" class="account-change-confirm">
                <p>新しいメールアドレスを入力してください。</p>
                <form action="" method="POST">
                  <input type="email" name="account-new-mail">
                  <button type="submit" value="submit">続行</button>
                </form>
              </div>
            </div>
            <div id="account-change-pass-section">
              <button type="button" name="account-change-pass" id="account-change-pass" onclick="confPassword('account-change-pass')">パスワードの変更</button>
              <div id="account-change-pass-confirm" class="account-change-confirm">
                <form action="" method="POST">
                  <fieldset>
                    <input type="password" name="account-old-pass" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="password" minlength="8" maxlength="32" placeholder="現在のパスワード"><br>
                    <input type="password" name="account-new-pass" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="password" minlength="8" maxlength="32" placeholder="新しいパスワード"><br>
                    <input type="password" name="account-new-pass-conf" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="password" minlength="8" maxlength="32" placeholder="新しいパスワード（確認用）"><br>
                    <button type="submit" name="account-change-pass-submit">続行</button>
                  </fieldset>
                </form>
              </div>
            </div>
            <div id="account-delete-section">
              <button type="button" name="account-delete" id="account-delete" onclick="confPassword('account-delete')">アカウントの削除</button>
              <div id="account-delete-confirm" class="account-change-confirm">
                <p>本当にアカウントを削除しますか？続行するにはパスワードを入力してください。</p>
                <form action="" method="POST">
                  <input type="password" name="account-delete-pass" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" name="password" minlength="8" maxlength="32">
                  <button type="submit" value="submit">続行</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>