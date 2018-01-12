<?php
require_once 'ex/main.php';
session_start();

ini_set('display_errors', "On");
ini_set('error_reporting', E_ALL & ~E_NOTICE);

// データベースに接続
$pdo = connectDB();

// トーストメッセージを表示
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

// セッション情報からメールアドレスとユーザ名を取得
$mail = $_SESSION["MAIL"];
$name = $_SESSION['NAME'];

// メールアドレスからお気に入りに登録されている教員名を取得
$tname1 = getDBValue($pdo, 'tname1', 'account', 'mail', $mail);
$tname2 = getDBValue($pdo, 'tname2', 'account', 'mail', $mail);
$tname3 = getDBValue($pdo, 'tname3', 'account', 'mail', $mail);
$tname4 = getDBValue($pdo, 'tname4', 'account', 'mail', $mail);

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

  // 教員の漢字表記名を取得
  $tname_jp = getTNameJP($add_fav);

  // トーストメッセージを追加
  $_SESSION['MESSAGE_MODE'] = "success";
  $_SESSION['MESSAGE'] = $tname_jp . "教員を追加しました";

  // DBを更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
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

  // 教員の漢字表記名を取得
  $tname_jp = getTNameJP($del_fav);

  // トーストメッセージを作成
  $_SESSION['MESSAGE_MODE'] = "success";
  $_SESSION['MESSAGE'] = $tname_jp . "教員を削除しました";

  // お気に入り表を更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// 表を生成
function tableGenerate($result) {

  // データが無い場合は表を生成しない
  if ($result == NULL) {
    echo '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp avlb-table" style="display:none">';
  } else {
    echo '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp avlb-table">';
  }

  // 表のヘッダ部分を生成
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

  // 表のデータ部分を生成
  foreach ($result as $i) {

    // 在室状況の表示形式
    if ($i ['available'] == 1) {
      $stat_av = '<span style="color:blue">在室</span>';
    } else {
      $stat_av = '<span style="color:red">不在</span>';
    }

    // 赤外線の表示形式
    if ($i ['infrared'] == 1) {
      $stat_ir = "◯";
    } else if ($i ['infrared'] == 0) {
      $stat_ir = "△";
    } else {
      $stat_ir = "×";
    }

    // 蛍光灯の表示形式
    if ($i ['light'] == 1) {
      $stat_lg = "◯";
    } else {
      $stat_lg = "×";
    }

    // データ形式通りに表を生成
    echo '
        <tr>
          <td class="mdl-data-table__cell--non-numeric department">' . strtoupper($i["department"]) . '</td>' . '
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

// お気に入り表の生成
function favTableGenerate($result) {

  // 表の生成
  tableGenerate($result);

  // データが無い場合はその旨を表示
  if (count($result) == 0) {
    echo 'お気に入りに何も登録されていません。';
  }
}

// 全教員表の生成
function allTableGenerate($pdo) {

  // 全教員のステータスを読み込み、表示
  $stmt_all = $pdo->query('SELECT * FROM status');
  $result_all = $stmt_all->fetchAll(PDO::FETCH_ASSOC);
  tableGenerate($result_all);
}

// お気に入り追加セレクタの生成
function favAddSelector($pdo, $result, $tname1, $tname2, $tname3, $tname4) {

  // お気に入り教員が上限まで登録されていないか
  if (count($result) != 4) {

    // フォーム部分を生成
    echo
    '<form action="" method="post" name="add-fav-submit">
        <div class="mdlext-selectfield mdlext-js-selectfield">
          <select class="mdlext-selectfield__select" name="add_fav" onchange="submit(this.form)">
            <option value="NULL">---</option>';

    // 選択肢を生成
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

    // お気に入り教員が上限まで登録されていたらフォームを表示しない
  } else {
    echo 'お気に入りの登録の上限に達しています (上限数: ' . (int) count($result) . ')';
  }
}

// お気に入り削除セレクタの生成
function favDelSelector($result) {

  // お気に入り教員の登録が0でないか
  if (count($result) != 0) {

    // フォーム部分を生成
    echo
    '<form action="" method="POST">
        <div class="mdlext-selectfield mdlext-js-selectfield">
          <select class="mdlext-selectfield__select" name="del_fav" onchange="submit(this.form)">
            <option value="NULL">---</option>';

    // 選択肢を生成
    foreach ($result as $i) {
      echo
      '<option value="' . $i["name_en"] . '">[' . strtoupper($i["department"]) . ']' . $i["name"] . '</option>';
    }
    echo
    '</select>
        </div>
      </form>';

    // お気に入り教員が何も登録されていなかったらフォームを表示しない
  } else {
    echo "お気に入りに何も登録されていません。";
  }
}

// -- 通知関連 --
// DB上で通知がONに設定されていたらスイッチをオンに表示
function getNtfAvailable($pdo, $mail) {

  $res = getDBValue($pdo, 'notification', 'account', 'mail', $mail);
  if ($res == 1) {
    echo "checked";
  }
}

// 通知の有効化スイッチが変更されたら
if (filter_has_var(INPUT_POST, 'ntfSwitcher')) {

  // DB更新の準備
  $ntfEnable = inputPost('ntfSwitcher');
  $pdo->beginTransaction();
  $stmt_setNtfEnable = $pdo->prepare('UPDATE account SET notification = ? WHERE mail = ?');

  // OFF->ON
  if ($ntfEnable == 1) {
    $stmt_setNtfEnable->bindValue(1, 1);
    $_SESSION['MESSAGE'] = "通知設定をONにしました。";
    $_SESSION['MESSAGE_MODE'] = "success";
    // ON->OFF
  } else {
    $stmt_setNtfEnable->bindValue(1, 0);
    $_SESSION['MESSAGE'] = "通知設定をOFFにしました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  }

  // DBを更新
  $stmt_setNtfEnable->bindValue(2, $mail);
  $stmt_setNtfEnable->execute();
  $pdo->commit();

  // DBを更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// DB上で設定されている通知スケジュールを表示
function displayNtfTime($pdo, $mail) {

  // DB上からデータを取得
  $stmt_getNtfTime = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
  $stmt_getNtfTime->bindValue(1, $mail);
  $stmt_getNtfTime->execute();
  $res = $stmt_getNtfTime->fetch(PDO::FETCH_ASSOC);

  // 通知未設定（NULL）のとき
  if ($res['notification_begin'] == NULL) {
    echo '現在メール通知スケジュールは設定されていません。';
  // 通知が設定されているとき
  } else {
    echo '現在の設定: ' . date("Y/m/d H:i", strtotime($res['notification_begin'])) . ' ~ ' . date("Y/m/d H:i", strtotime($res['notification_end']));
  }
  echo '<br>新しい設定: '
    . '<b><span id="date-begin-display">____/__/__</span></b> <b><span id="time-begin-display">__:__</span></b> ~ '
    . '<b><span id="date-end-display">____/__/__</span></b> <b><span id="time-end-display">__:__</span></b><br>'
    . 'Raspberry Piは3分間隔でメールを送信します。<br>以下のボタンからスケジュールを設定し、「確定」をクリックするとスケジュールが設定されます。';
}

// 通知時間の設定変更が送信されたら
if (filter_has_var(INPUT_POST, 'notification-time-submit')) {
  // 隠し入力フィールドから値を取得
  $ndb = inputPost('date-begin-output');
  $nde = inputPost('date-end-output');
  $ntb = inputPost('time-begin-output');
  $nte = inputPost('time-end-output');

  // 日付か時刻が空欄で送信されたらエラー
  if (empty($ndb) || empty($nde) || empty($ntb) || empty($nte)) {
    $_SESSION['MESSAGE'] = "日付または時刻が空欄です。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 通知開始の日付が終了よりあとに設定されていたらエラー
  } else if ($ndb > $nde) {
    $_SESSION['MESSAGE'] = "終了日付が開始日付より過去に設定されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 通知開始の時刻が終了よりあとに設定されていたらエラー
  } else if ($ntb > $nte) {
    $_SESSION['MESSAGE'] = "終了時刻が開始時刻より過去に設定されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // すべて正しく入力されていたら
  } else {
    // データベースに合うように日付と時刻を連結
    $nb = "$ndb $ntb";
    $ne = "$nde $nte";
    // 更新
    $pdo->beginTransaction();
    $stmt_ntfTime = $pdo->prepare('UPDATE account SET '
            . 'notification_begin = STR_TO_DATE(?, "%Y%m%d %H%i"), '
            . 'notification_end = STR_TO_DATE(?, "%Y%m%d %H%i")'
            . 'WHERE mail = ?');
    $stmt_ntfTime->bindValue(1, $nb);
    $stmt_ntfTime->bindValue(2, $ne);
    $stmt_ntfTime->bindValue(3, $mail);
    $stmt_ntfTime->execute();
    $pdo->commit();
    
    // トーストメッセージを表示
    $_SESSION['MESSAGE'] = "通知期間設定を更新しました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  }

  // DBを更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();

}

// -- アカウント関連 --
// サインアウト
if (filter_has_var(INPUT_POST, 'signout-submit')) {
  signOut();
  header("Location: signin.php");
}

// メールアドレスの変更
if (filter_has_var(INPUT_POST, 'account-change-mail-submit')) {

  // 入力された新しいメールアドレス
  $acc_mail = inputPost('account-new-mail');

  // メールアドレスが空欄でないかどうか
  if (empty($acc_mail)) {
    $_SESSION['MESSAGE'] = "メールアドレスが空欄です";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 現在のメールアドレスと新しいメールアドレスが同じでないかどうか
  } else if ($mail == $acc_mail) {
    $_SESSION['MESSAGE'] = "現在のメールアドレスと同じです";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 既に登録されているメールアドレスでないかどうか
  } else if (!mailDuplicationCheck($acc_mail)) {
    $_SESSION['MESSAGE'] = "そのメールアドレスはすでに登録されています。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 入力内容が正しければ
  } else {
    //更新
    updateDBValue($pdo, 'mail', 'account', $acc_mail, $mail);

    // セッションのメールアドレスを更新してトーストメッセージを表示
    $_SESSION['MAIL'] = $acc_mail;
    $_SESSION['MESSAGE'] = "メールアドレスを" . $acc_mail . "に変更しました。";
    $_SESSION['MESSAGE_MODE'] = "success";
  }

  // DBを更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// ユーザ名変更
if (filter_has_var(INPUT_POST, 'account-change-name-submit')) {

  // 入力された新しいユーザ名
  $acc_name = inputPost('account-new-name');

  // ユーザ名が空欄でないかどうか
  if (empty($acc_name)) {
    $_SESSION['MESSAGE'] = "ユーザ名が空欄です。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 現在のユーザ名と新しいユーザが同じでないかどうか
  } else if ($name == $acc_name) {
    $_SESSION['MESSAGE'] = "新しいユーザ名が現在のユーザ名と同じです。";
    $_SESSION['MESSAGE_MODE'] = "error";
    // 入力が正しければ
  } else {

    // 更新
    updateDBValue($pdo, 'name', 'account', $acc_name, $mail);

    // セッションのユーザ名を更新してトーストメッセージを表示
    $_SESSION['NAME'] = $acc_name;
    $_SESSION['MESSAGE'] = "ユーザ名を" . $acc_name . "に変更しました";
    $_SESSION['MESSAGE_MODE'] = "success";
  }

  // DBを更新するためページを再読み込み
  header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  exit();
}

// パスワードの変更
if (filter_has_var(INPUT_POST, 'account-change-pass-submit')) {

  // 入力された現在のパスワード、新しいパスワード、確認用の新しいパスワード
  $acc_oldpass = inputPost('account-old-pass');
  $acc_newpass = inputPost('account-new-pass');
  $acc_confpass = inputPost('account-new-pass-conf');
  
  // 入力内容が空欄でないかどうか
  if (empty($acc_oldpass) || empty($acc_newpass) || empty($acc_confpass)) {
    $_SESSION['MESSAGE'] = "入力内容に空欄があります。";
    $_SESSION['MESSAGE_MODE'] = "error";
    header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
    // 現在のパスワードが間違っていないかどうか
  } else if (passVerify($mail, $acc_oldpass) == false) {
    $_SESSION['MESSAGE'] = "現在のパスワードに誤りがあります。";
    $_SESSION['MESSAGE_MODE'] = "error";
    header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
    // 新しいパスワードと確認用パスワードが一致しているかどうか
  } else if ($acc_newpass != $acc_confpass) {
    $_SESSION['MESSAGE'] = "確認用のパスワードに誤りがあります。";
    $_SESSION['MESSAGE_MODE'] = "error";
    header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
    // 現在のパスワードと新しいパスワードが異なっているかどうか
  } else if ($acc_oldpass == $acc_newpass) {
    $_SESSION['MESSAGE'] = "現在のパスワードと新しいパスワードが同じです。";
    $_SESSION['MESSAGE_MODE'] = "error";
    header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
    // 正しく入力されていたら
  } else {
    // パスワードをハッシュ化
    $hash = password_hash($acc_newpass, PASSWORD_DEFAULT);
    // 更新
    updateDBValue($pdo, 'passwd', 'account', $hash, $mail);
    // サインアウト
    signOut();
    header("Location: signin.php");
  }
  exit();
}

// アカウント削除
if (filter_has_var(INPUT_POST, 'account-delete-submit')) {

  // パスワード
  $acc_del = inputPost('account-delete-pass');
  $res = getDBValue($pdo, 'passwd', 'account', 'mail', $mail);

  // パスワードが正しければ
  if (password_verify($acc_del, $res) == true) {

    // アカウントを削除
    $stmt_accDel2 = $pdo->prepare("DELETE FROM account WHERE mail = ?");
    $stmt_accDel2->bindValue(1, $mail);
    $stmt_accDel2->execute();

    // サインアウト
    signOut();
    header("Location: signin.php");
  } else {
    $_SESSION['MESSAGE'] = "入力されたパスワードに誤りがあります。";
    $_SESSION['MESSAGE_MODE'] = "error";
    header("Location: " . (string) filter_input(INPUT_SERVER, 'PHP_SELF'));
  }
  exit();
}
?>
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <?php require 'ex/head.php'; ?>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css"> <!-- toastr -->
    <link rel="stylesheet" href="ex/mddtp/css/mdDateTimePicker.min.css"> <!-- MD Date&Time Picker -->
    <link rel="stylesheet" href="ex/css/main.css">
    <script src="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script> <!-- toastr -->
    <script src="ex/mddtp/js/moment.min.js"></script> <!-- MD Date&Time Picker -->
    <script src="ex/mddtp/js/draggabilly.pkgd.min.js"></script> <!-- MD Date&Time Picker -->
    <script src="ex/mddtp/js/mdDateTimePicker.min.js"></script> <!-- MD Date&Time Picker -->
    <script defer src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js"></script> <!--list.js-->
    <script defer src="ex/js/defer.js"></script> <!-- 遅延読み込み --> 
    <script src="ex/js/main.js"></script> <!-- 通常読み込み -->
    <title>在室確認の杜</title>
  </head>
  <body>
    <?php toaster($msg, $mode) ?>
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
      <header class="mdl-layout__header mdl-layout__header--waterfall-hide-top mdl-layout__header--waterfall">
        <div class="mdl-layout__header-row">
          <span class="mdl-layout-title">在室確認の杜</span>
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
            <div class="sub-headline">お気に入り一覧</div>
            <div id="fav-table">
              <?php favTableGenerate($tstat); ?>
            </div>
            <div class="sub-headline">お気に入り追加</div>
            <?php favAddSelector($pdo, $tstat, $tname1, $tname2, $tname3, $tname4); ?>
            <div class="sub-headline">お気に入り削除</div>
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
                <form action="" method="POST">
                  <button id="signout-link" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" type="submit" name="signout-submit">
                    サインアウト
                  </button>
                </form>
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
                        <input type="checkbox" class="mdl-switch__input" id="ntfSwitcher" name="ntfSwitcher" <?php getNtfAvailable($pdo, $mail); ?> onclick="ntfToggle()" value="1">
                        <span class="mdl-switch__label">メール通知</span>
                      </label>
                    </form>
                  </div>
                  <div id="ntf-term" class="setting-items">
                    <div class="sub-headline">通知期間設定</div>
                    <p>
                      <?php displayNtfTime($pdo, $mail); ?>
                    </p>

                    <form action="" method="POST" id="ntf-term-form">
                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-date-begin">
                        開始日付
                      </button>
                      <input type="text" id="date-begin-output" name="date-begin-output" style="display: none;">

                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-time-begin">
                        開始時刻
                      </button>
                      <input type="text" id="time-begin-output" name="time-begin-output" style="display: none;">
                      
                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-date-end">
                        終了日付
                      </button>
                      <input type="text" id="date-end-output" name="date-end-output" style="display: none;">

                      <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored ntf-button" id="notification-time-end">
                        終了時刻
                      </button>
                      <input type="text" id="time-end-output" name="time-end-output" style="display: none;">

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
                  <span class="mdlext-accordion__tab__caption">ユーザ名の変更</span>
                </header>
                <section class="mdlext-accordion__tabpanel" role="tabpanel" hidden="" aria-hidden="true">
                  <div class="account-form-container">
                    <form action="" method="POST">
                      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <i class="material-icons mdl-textfield__label__icon">person</i>
                        <input class="mdl-textfield__input" type="text" id="account-new-name" name="account-new-name" minlength="2" maxlength="16">
                        <label class="mdl-textfield__label" for="account-new-name">新しいユーザ名</label>
                        <span class="mdl-textfield__error">ユーザ名は2文字以上16文字以内で入力してください</span>
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
                    <p>パスワードを変更すると、セキュリティを保つため自動的にサインアウトされます。<br>サインインページで新しいパスワードを入力し、再度サインインしてください。</p>
                    <form action="" method="POST">
                      <fieldset>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-old-pass" name="account-old-pass">
                          <label class="mdl-textfield__label" for="account-old-pass">現在のパスワード</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ8文字以上16文字以内の文字列である必要があります</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-new-pass" name="account-new-pass">
                          <label class="mdl-textfield__label" for="account-new-pass">新しいパスワード</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ8文字以上16文字以内の文字列である必要があります</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                          <i class="material-icons mdl-textfield__label__icon">lock</i>
                          <input class="mdl-textfield__input" type="password" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$" id="account-new-pass-conf" name="account-new-pass-conf">
                          <label class="mdl-textfield__label" for="account-new-pass-conf">新しいパスワード (確認用)</label>
                          <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ8文字以上16文字以内の文字列である必要があります</span>
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
                        <input class="mdl-textfield__input" type="password" name="account-delete-pass" id="account-delete-conf" pattern="^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,32}$">
                        <label class="mdl-textfield__label" for="account-delete-conf">パスワード</label>
                        <span class="mdl-textfield__error">大文字・小文字・数字のすべてが含まれ8文字以上16文字以内の文字列である必要があります</span>
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