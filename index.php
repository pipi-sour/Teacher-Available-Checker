<?php
require_once 'ex/ChromePhp.php';
require_once 'ex/main.php';
session_start();

error_reporting(E_ALL & ~E_NOTICE);

if (isset($_SESSION['MESSAGE'])) {
  $msg = $_SESSION['MESSAGE'];
  $mode = $_SESSION['MESSAGE_MODE'];
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
$name = $_SESSION['NAME'];

// メールアドレスからお気に入りに登録されている教員名を取得
$tname1 = getDBValue($pdo, 'tname1', 'account', $mail);
$tname2 = getDBValue($pdo, 'tname2', 'account', $mail);
$tname3 = getDBValue($pdo, 'tname3', 'account', $mail);
$tname4 = getDBValue($pdo, 'tname4', 'account', $mail);

// お気に入り教員名からその教員の在室状況を取得
$stmt_tstat = $pdo->prepare('SELECT * FROM status WHERE name_en = ? OR name_en = ? OR name_en = ? OR name_en = ? ORDER BY department ASC');
$stmt_tstat->bindValue(1, $tname1);
$stmt_tstat->bindValue(2, $tname2);
$stmt_tstat->bindValue(3, $tname3);
$stmt_tstat->bindValue(4, $tname4);
$stmt_tstat->execute();
$tstat = $stmt_tstat->fetchAll(PDO::FETCH_ASSOC);


// -- お気に入り設定 --

// お気に入り追加・削除のリクエストを取得
$add_fav = inputPost('add_fav');
$del_fav = inputPost('del_fav');

// お気に入り追加のリクエストが入力されたとき
if (!empty($add_fav) && $add_fav != 'NULL') {
  
  // DBでNULLとなっているtnameフィールドに格納
  if (is_null($tname1)) {
    updateDBValue($pdo, 'tname1', 'account', $add_fav, $mail);
    
  } else if (is_null($tname2)) {
    updateDBValue($pdo, 'tname2', 'account', $add_fav, $mail);
    
  } else if (is_null($tname3)) {
    updateDBValue($pdo, 'tname3', 'account', $add_fav, $mail);
    
  } else if (is_null($tname4)) {
    updateDBValue($pdo, 'tname4', 'account', $add_fav, $mail);
    
  }
  
  // 教員の和名を取得
  $tname_jp = getTNameJP($add_fav);
  
  $_SESSION['MESSAGE_MODE'] = "success";
  $_SESSION['MESSAGE'] = $tname_jp . "教員を追加しました";
  
  // お気に入り表を更新するためページを再読み込み
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
}

// お気に入り削除のリクエストが入力されたとき
if (!empty($del_fav) && $del_fav != 'NULL') {
  
  // 該当するtnameフィールドの値をNULLとし削除
  if ($del_fav == $tname1) {
    updateDBValue($pdo, 'tname1', 'account', 'NULL', $mail);
    
  } else if ($del_fav == $tname2) {
    updateDBValue($pdo, 'tname2', 'account', 'NULL', $mail);
    
  } else if ($del_fav == $tname3) {
    updateDBValue($pdo, 'tname3', 'account', 'NULL', $mail);
    
  } else if ($del_fav == $tname4) {
    updateDBValue($pdo, 'tname4', 'account', 'NULL', $mail);
    
  }
  
  // 教員の和名を取得
  $tname_jp = getTNameJP($del_fav);
  
  $_SESSION['MESSAGE_MODE'] = "success";
  $_SESSION['MESSAGE'] = $tname_jp . "教員を削除しました";
  
  // お気に入り表を更新するためページを再読み込み
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
}

//テーブルを
function tableGenerate($result) {
  if($result == NULL) {
    echo '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp avlb-table" style="display:none">';
  } else {
    echo '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp avlb-table">';
  }
  echo '
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
      $stat_av = '<span style="color:blue">在室</span>';
    } else {
      $stat_av = '<span style="color:red">不在</span>';
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

    echo '
        <tr>
          <td class="mdl-data-table__cell--non-numeric department">' . strtoupper($i["department"]). '</td>' . '
          <td class="mdl-data-table__cell--non-numeric name">' . $i ["name"] . '</td>' . ' 
          <td class="mdl-data-table__cell--non-numeric name_en" style="display:none;">' . $i ["name_en"] . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric available"><b>' . $stat_av . '</b></td>' . '
          <td class="mdl-data-table__cell--non-numeric infrared">' . $stat_ir . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric light">' . $stat_lg . '</td>' . '
          <td class="mdl-data-table__cell--non-numeric time">' . date("m/d H:i", strtotime($i ['time'])) . '</td>' . '
        </tr>';
  }
  echo '
      </tbody>
    </table>';
}

function favTableGenerate($result) {
  tableGenerate($result);
  if(count($result) == 0) {
    echo 'お気に入りに何も登録されていません。';
  }
}

function allTableGenerate($pdo) {
  $stmt_all = $pdo->query('SELECT * FROM status');
  $result_all = $stmt_all->fetchAll(PDO::FETCH_ASSOC);
  tableGenerate($result_all);
}

function favAddSelector($pdo, $result, $tname1, $tname2, $tname3, $tname4) {
  if(count($result) != 4) {
    echo
     '<form action="" method="post" name="add-fav-submit">
        <div class="mdlext-selectfield mdlext-js-selectfield">
          <select class="mdlext-selectfield__select" name="add_fav" onchange="submit(this.form)">
            <option value="NULL">---</option>';
    foreach ($pdo->query('SELECT * FROM status ORDER BY department ASC') as $i) {
      if ($i["name_en"] != $tname1 && $i["name_en"] != $tname2 && $i["name_en"] != $tname3 && $i["name_en"] != $tname4) {
        echo
         '<option value="' . $i["name_en"] . '">[' . strtoupper($i["department"]) . ']' . $i["name"] . '</option>';
      }
    }
    echo
         '</select>
        </div>
      </form>';
  } else {
    echo 'お気に入りの登録の上限に達しています (上限数: ' . (int)count($result) . ')';
  }
}

function favDelSelector($result) {
  if(count($result) != 0) {
    echo 
     '<form action="" method="post">
        <div class="mdlext-selectfield mdlext-js-selectfield">
          <select class="mdlext-selectfield__select" name="del_fav" onchange="submit(this.form)">
            <option value="NULL">---</option>';
    foreach ($result as $i) {
      echo
         '<option value="' . $i["name_en"] . '">[' . strtoupper($i["department"])  . ']' . $i["name"] . '</option>';
    }
    echo
         '</select>
        </div>
      </form>';
  } else {
    echo "お気に入りに何も登録されていません。";
  }
}

// -- 通知関連 --

function getNtfAvailable($mail) {
  $pdo = connectDB();
  $stmt_checked = $pdo->prepare('SELECT notification FROM account WHERE mail = ?');
  $stmt_checked->bindValue(1, $mail);
  $stmt_checked->execute();
  $res = $stmt_checked->fetch(PDO::FETCH_ASSOC);
  if($res['notification'] == 1) {
    return "checked";
  } else {
    return "";
  }
}

if (filter_has_var(INPUT_POST, 'ntfSwitcher')) {
  
  $ntfEnable = inputPost('ntfSwitcher');
  $pdo->beginTransaction();
  $stmt_setNtfEnable = $pdo->prepare('UPDATE account SET notification = ? WHERE mail = ?');
  if($ntfEnable == 1) {
    $stmt_setNtfEnable->bindValue(1, 1);
    $_SESSION['MESSAGE'] = "通知設定をONにしました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  } else {
    $stmt_setNtfEnable->bindValue(1, 0);
    $_SESSION['MESSAGE'] = "通知設定をOFFにしました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  }
  $stmt_setNtfEnable->bindValue(2, $mail);
  $stmt_setNtfEnable->execute();
  $pdo->commit();
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

if (filter_has_var(INPUT_POST, 'notification-time-submit')) {
  
  $ndb = inputPost('date-begin-output');
  $nde = inputPost('date-end-output');
  $ntb = inputPost('time-begin-output');
  $nte = inputPost('time-end-output');
  
  if ($ndb == "" || $nde == "" || $ntb == "" || $nte == "")  {
    $_SESSION['MESSAGE'] = "日付または時刻が空欄です。";
    $_SESSION['MESSAGE_MODE'] = "error";
    
  } else if($ndb > $nde) {
    $_SESSION['MESSAGE'] = "終了日付が開始日付より過去に設定されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
    
  } else if($ntb > $nte) {
    $_SESSION['MESSAGE'] = "終了時刻が開始時刻より過去に設定されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
    
  } else {
    $pdo->beginTransaction();
    $stmt_ntfTime = $pdo->prepare('UPDATE account SET '
            . 'notification_date_begin = STR_TO_DATE(? ,"%Y%m%d"), '
            . 'notification_date_end = STR_TO_DATE(?, "%Y%m%d"), '
            . 'notification_time_begin = STR_TO_DATE(? ,"%H%i"), '
            . 'notification_time_end = STR_TO_DATE(? ,"%H%i") '
            . 'WHERE mail = ?');
    $stmt_ntfTime->bindValue(1, $ndb);
    $stmt_ntfTime->bindValue(2, $nde);
    $stmt_ntfTime->bindValue(3, $ntb);
    $stmt_ntfTime->bindValue(4, $nte);
    $stmt_ntfTime->bindValue(5, $mail);
    $stmt_ntfTime->execute();
    $pdo->commit();

    $_SESSION['MESSAGE'] = "通知期間設定を更新しました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  }
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

function displayNtfTime($mail) {
  $pdo = connectDB();
  $stmt_getNtfTime = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
  $stmt_getNtfTime->bindValue(1, $mail);
  $stmt_getNtfTime->execute();
  $res = $stmt_getNtfTime->fetch(PDO::FETCH_ASSOC);
  if($res['notification_date_begin'] == NULL) {
    echo '現在メール通知期間は設定されていません。<br>メール通知は'
        . '<span id="date-begin-display">(開始日)</span>から'
        . '<span id="date-end-display">(終了日)</span> の '
        . '<span id="time-begin-display">(開始時刻)</span>から'
        . '<span id="time-end-display">(終了時刻)</span> の間に3分間隔で行われます。';
  } else {
    echo '現在の設定: '
      .  date("Y月m月d日", strtotime($res['notification_date_begin'])) . '~'
      .  date("Y年m月d日", strtotime($res['notification_date_end'])) . ' '
      .  date("H時i分", strtotime($res['notification_time_begin'])) . '~'
      .  date("H時i分", strtotime($res['notification_time_end'])) . '<br>';
  }
  echo '<b><span id="date-begin-display">(開始日)</span></b>から'
     . '<b><span id="date-end-display">(終了日)</span></b> の '
     . '<b><span id="time-begin-display">(開始時刻)</span></b>から'
     . '<b><span id="time-end-display">(終了時刻)</span></b> の間に3分間隔で行われます。';
}
// -- アカウント関連 --

// メールアドレスの変更
if (filter_has_var(INPUT_POST, 'account-change-mail-submit')) {
  
  // 入力された新しいメールアドレス
  $acc_mail = inputPost('account-new-mail');
  
  // メールアドレスが空欄でないかどうか
  if($acc_mail == "") {
    $_SESSION['MESSAGE'] = "メールアドレスが空欄です";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 現在のメールアドレスと新しいメールアドレスが同じでないかどうか
  } else if($mail == $acc_mail) {
    $_SESSION['MESSAGE'] = "現在のメールアドレスと同じです";
    $_SESSION['MESSAGE_MODE'] = "error";
  } else if(!mailDuplicationCheck($acc_mail)) {
    $_SESSION['MESSAGE'] = "そのメールアドレスはすでに登録されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
  } else if(mailDuplicationCheck($acc_mail)) {
    $pdo->beginTransaction();
    $stmt_accName = $pdo->prepare("UPDATE account SET mail = ? WHERE mail = ?");
    $stmt_accName->bindValue(1, $acc_mail);
    $stmt_accName->bindValue(2, $mail);
    $stmt_accName->execute();
    $pdo->commit();
    $_SESSION['MAIL'] = $acc_mail;
    $_SESSION['MESSAGE'] = "メールアドレスを" . $acc_mail . "に変更しました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  } else {
    $_SESSION['MESSAGE'] = "予期せぬエラーです";
    $_SESSION['MESSAGE_MODE'] = "error";
  }
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}
 
// ユーザー名変更
if (filter_has_var(INPUT_POST, 'account-change-name-submit')) {
  
  // 入力された新しいユーザー名
  $acc_name = inputPost('account-new-name');
  
  // 現在のユーザー名と新しいユーザーが同じでないかどうか
  if($acc_name == "") {
    
    $_SESSION['MESSAGE'] = "ユーザー名が空欄です。";
    $_SESSION['MESSAGE_MODE'] = "error";
    
  } else if($name == $acc_name) {
    
    $_SESSION['MESSAGE'] = "新しいユーザー名が現在のユーザー名と同じです。";
    $_SESSION['MESSAGE_MODE'] = "error";
    
  } else {
    $pdo->beginTransaction();
    $stmt_accName = $pdo->prepare("UPDATE account SET name = ? WHERE mail = ?");
    $stmt_accName->bindValue(1, $acc_name);
    $stmt_accName->bindValue(2, $mail);
    $stmt_accName->execute();
    $pdo->commit();

    $_SESSION['NAME'] = $acc_name;
    $_SESSION['MESSAGE'] = "ユーザー名を" . $acc_name . "に変更しました";
    $_SESSION['MESSAGE_MODE'] = "success";

  }

  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// パスワードの変更
if(filter_has_var(INPUT_POST, 'account-change-pass-submit')) {
  
  $acc_oldpass = inputPost('account-old-pass');
  $acc_newpass = inputPost('account-new-pass');
  $acc_confpass = inputPost('account-new-pass-conf');
  
  // 新しいパスワードと確認用パスワードが一致しているかどうか
  if($acc_newpass === $acc_confpass) {
    
    // 現在のパスワードと新しいパスワードが同じでないかどうか
    if($acc_oldpass !== $acc_newpass) {
      
      // 現在のパスワードが正しいかどうか
      if(passVerify($mail, $acc_oldpass)) {
        $pdo->beginTransaction();
        $pass_hash = password_hash($acc_newpass, PASSWORD_DEFAULT);
        $stmt_suc = $pdo->prepare("UPDATE account SET passwd = ? WHERE mail = ?");
        $stmt_suc->bindValue(1, $pass_hash);
        $stmt_suc->bindValue(2, $mail);
        $stmt_suc->execute();
        $pdo->commit();
        
        signOut("パスワードを変更しました。再度サインインしてください。");
        exit();
      } else {
        $_SESSION['MESSAGE'] = "現在のパスワードに誤りがあります。";
        $_SESSION['MESSAGE_MODE'] = "error";
      }
    } else {
      $_SESSION['MESSAGE'] = "現在のパスワードと新しいパスワードが同じです。";
      $_SESSION['MESSAGE_MODE'] = "error";
    }
  } else {
    $_SESSION['MESSAGE'] = "確認用のパスワードに誤りがあります。";
    $_SESSION['MESSAGE_MODE'] = "error";
  }
  header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// アカウント削除
if (filter_has_var(INPUT_POST, 'account-delete-submit')) {
  
  $acc_del = inputPost('account-delete-pass');
  
  $stmt_accDel = $pdo->prepare("SELECT * FROM account WHERE mail = ?");
  $stmt_accDel->bindValue(1, $mail);
  $stmt_accDel->execute();
  $res_accDel = $stmt_accDel->fetch(PDO::FETCH_ASSOC);

  if (password_verify($acc_del, $res_accDel['passwd'])) {
    
    $stmt_accDel2 = $pdo->prepare("DELETE FROM account WHERE mail = ?");
    $stmt_accDel2->bindValue(1, $mail);
    $stmt_accDel2->execute();
    
    signOut();
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
    <link rel="stylesheet" href="ex/css/main.css">
    <script defer src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js"></script> <!--list.js-->
    <script defer src="ex/js/defer.js"></script> <!--list.jsユーザー定義-->
    <script src="ex/js/main.js"></script>
    <title>教員在室確認</title>
  </head>
  <body>
<?php toaster($msg, $mode) ?>
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
      <header class="mdl-layout__header mdl-layout__header--waterfall-hide-top mdl-layout__header--waterfall">
        <div class="mdl-layout__header-row">
          <span class="mdl-layout-title">Teacher Available Checker</span>
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
          <div class="page-content">
            <ul class="mdl-list">
              <li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <i class="material-icons mdl-list__item-icon">star</i>
                  お気に入り一覧
                </span>
              </li>
            </ul>
            <div id="fav-table">
<?php favTableGenerate($tstat); ?>
            </div>
            <ul class="mdl-list">
              <li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <i class="material-icons mdl-list__item-icon">add_circle</i>
                  お気に入り追加
                </span>
              </li>
            </ul>
<?php favAddSelector($pdo, $tstat, $tname1, $tname2, $tname3, $tname4); ?>
            <ul class="mdl-list">
              <li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <i class="material-icons mdl-list__item-icon">delete</i>
                  お気に入り削除
                </span>
              </li>
            </ul>
<?php favDelSelector($tstat); ?>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-2">
          <div class="page-content">
            <div id="all-table">
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <i class="material-icons mdl-textfield__label__icon">search</i>
                <input class="mdl-textfield__input search" type="text" name="query" id="query">
                <label class="mdl-textfield__label" for="query">検索</label>
              </div>
<?php allTableGenerate($pdo); ?>
            </div>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-3">
          <div class="page-content">
            <ul class="demo-list-icon mdl-list" id="account-info">
              <li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <i class="material-icons mdl-list__item-icon">account_circle</i>
                  <?php echo h($name) . " (" . h($mail) . ")"; ?>
                </span>
                <a href="signout.php" id="signout-link">サインアウト</a>
              </li>
            </ul>
            
            <ul class="mdlext-accordion mdlext-js-accordion mdlext-accordion--vertical mdlext-js-animation-effect" role="tablist" aria-multiselectable="false">
              <li class="mdlext-accordion__panel" role="presentation">
                <header class="mdlext-accordion__tab" aria-expanded="true" role="tab">
                  <i class="material-icons">sms</i>
                  <span class="mdlext-accordion__tab__caption">メール通知設定</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel">
                  <div id="notification-toggle" class="setting-items">
                    <form action="" method="POST" name="ntfSwitchForm">
                      <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="ntfSwitcher">
                        <input type="checkbox" class="mdl-switch__input" id="ntfSwitcher" name="ntfSwitcher" <?php echo getNtfAvailable($mail); ?> onclick="ntfToggle()" value="1">
                        <span class="mdl-switch__label">メール通知</span>
                      </label>
                    </form>
                  </div>
                  <div id="ntf-term" class="setting-items">
                    <div style="font-weight:bold;font-size:14px;margin:1em 0 .5em;">通知期間設定</div>
                    <p><?php displayNtfTime($mail); ?></p>
                    <form action="" method="POST" id="ntf-term-form">
                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-date-begin">
                        開始日を設定
                      </button>
                      <input type="text" id="date-begin-output" name="date-begin-output" style="display: none;" value="">

                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-date-end">
                        終了日を設定
                      </button>
                      <input type="text" id="date-end-output" name="date-end-output" style="display: none;" value="">

                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-time-begin">
                        開始時刻を設定
                      </button>
                      <input type="text" id="time-begin-output" name="time-begin-output" style="display: none;" value="">

                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-time-end">
                        終了時刻を設定
                      </button>
                      <input type="text" id="time-end-output" name="time-end-output" style="display: none;" value="">

                      
                      <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent submit-button" type="submit" id="notification-time-submit" name="notification-time-submit">
                        確定
                      </button>
                    </form>
                  </div>
                </section>
              </li>
              <li class="mdlext-accordion__panel" role="presentation">
                <header class="mdlext-accordion__tab" aria-expanded="false" role="tab">
                  <i class="material-icons">email</i>
                  <span class="mdlext-accordion__tab__caption">メールアドレスの変更</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel">
                  <div class="account-form-container">
                    <form action="" method="POST">
                      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <i class="material-icons mdl-textfield__label__icon">email</i>
                        <input class="mdl-textfield__input" type="email" id="account-new-mail" name="account-new-mail" minlength="6" maxlength="255">
                        <label class="mdl-textfield__label" for="account-new-mail">新しいメールアドレス</label>
                        <span class="mdl-textfield__error">正しいメールアドレスを入力してください</span>
                      </div>
                      <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent submit-button" type="submit" name="account-change-mail-submit">
                        確定
                      </button>
                    </form>
                  </div>
                </section>
              </li>
              <li class="mdlext-accordion__panel" role="presentation">
                <header class="mdlext-accordion__tab" aria-expanded="false" role="tab">
                  <i class="material-icons">person</i>
                  <span class="mdlext-accordion__tab__caption">ユーザー名の変更</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel" hidden="" aria-hidden="true">
                  <div class="account-form-container">
                    <form action="" method="POST">
                      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <i class="material-icons mdl-textfield__label__icon">person</i>
                        <input class="mdl-textfield__input" type="text" id="account-new-name" name="account-new-name" minlength="2" maxlength="16" value="">
                        <label class="mdl-textfield__label" for="account-new-name">新しいユーザー名</label>
                        <span class="mdl-textfield__error">ユーザー名は2文字以上16文字以内で入力してください</span>
                      </div>
                      <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent submit-button" type="submit" name="account-change-name-submit">
                        確定
                      </button>
                    </form>
                  </div>
                </section>
              </li>
              <li class="mdlext-accordion__panel" role="presentation">
                <header class="mdlext-accordion__tab" aria-expanded="false" role="tab">
                  <i class="material-icons">lock</i>
                  <span class="mdlext-accordion__tab__caption">パスワードの変更</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel">
                  <div class="account-form-container">
                    <form action="" method="POST">
                      <fieldset>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-old-pass" name="account-old-pass" minlength="8" maxlength="32" value="">
                          <label class="mdl-textfield__label" for="account-old-pass">現在のパスワード</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-new-pass" name="account-new-pass" minlength="8" maxlength="32" value="">
                          <label class="mdl-textfield__label" for="account-new-pass">新しいパスワード</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-new-pass-conf" name="account-new-pass-conf" minlength="8" maxlength="32" value="">
                          <label class="mdl-textfield__label" for="account-new-pass-conf">新しいパスワード (確認用)</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
                        </div>
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent submit-button" type="submit" name="account-change-pass-submit">
                          確定
                        </button>
                      </fieldset>
                    </form>
                  </div>
                </section>
              </li>
              <li class="mdlext-accordion__panel" role="presentation">
                <header class="mdlext-accordion__tab" aria-expanded="false" role="tab">
                  <i class="material-icons">delete</i>
                  <span class="mdlext-accordion__tab__caption">アカウントの削除</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel">
                  <div class="account-form-container">
                    <p>本当にアカウントを削除しますか？この操作は取り消すことができません。続行するにはパスワードを入力してください。</p>
                    <form action="" method="POST">
                      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <i class="material-icons mdl-textfield__label__icon">lock</i>
                        <input class="mdl-textfield__input" type="password" name="account-delete-pass" id="account-delete-conf" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" minlength="8" maxlength="32" value="">
                        <label class="mdl-textfield__label" for="account-delete-conf">パスワード</label>
                        <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれる必要があります</span>
                      </div>
                      <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent submit-button" type="submit" name="account-delete-submit">
                        削除
                      </button>
                    </form>
                  </div>
                </section>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>