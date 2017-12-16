<?php
include 'ex/ChromePhp.php'; // デバッグ用
include 'main.php';

session_start(); // ログイン状態チェック

if (!isset($_SESSION["NAME"])) {
  header("Location: //localhost:8888/signin.php");
  exit;
}

error_reporting(E_ALL & ~E_NOTICE);

$pdo = connectDB();
$mail = $_SESSION["MAIL"];

$stmt_t = $pdo->prepare('SELECT * FROM account WHERE mail = ?');
$stmt_t->bindValue(1, $mail);
$stmt_t->execute();
$res_t = $stmt_t->fetch();
$tname1 = $res_t['tname1'];
$tname2 = $res_t['tname2'];

$stmt_addedT = $pdo->prepare('SELECT * FROM status WHERE name_en = ? OR name_en = ?');
$stmt_addedT->bindValue(1, $tname1);
$stmt_addedT->bindValue(2, $tname2);
$stmt_addedT->execute();
$result3 = $stmt_addedT->fetchAll(PDO::FETCH_ASSOC);

$add_fav = (string)filter_input(INPUT_POST, 'add_fav');
$del_fav = (string)filter_input(INPUT_POST, 'del_fav');

if ($add_fav != "") {
  if ($add_fav == "NULL") {
    echo '教員名を選択してください。';
  } else {
    if (is_null($tname1)) {
      $pdo->beginTransaction();
      $stmt3 = $pdo->prepare('UPDATE `account` SET `tname1`= ? WHERE mail = ?');
      $stmt3->bindValue(1, $add_fav);
      $stmt3->bindValue(2, $mail);
      $stmt3->execute();
      $pdo->commit();
    } else if (is_null($tname2)) {
      $pdo->beginTransaction();
      $stmt4 = $pdo->prepare('UPDATE `account` SET `tname2`= ? WHERE mail = ?');
      $stmt4->bindValue(1, $add_fav);
      $stmt4->bindValue(2, $mail);
      $stmt4->execute();
      $pdo->commit();
    }
    header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  }
}

if ($del_fav != "") {
  if ($del_fav == "NULL") {
    echo '教員名を選択してください。';
  } else {
    if ($del_fav == $tname1) {
      $pdo->beginTransaction();
      $stmt3 = $pdo->prepare('UPDATE `account` SET `tname1`= NULL WHERE mail = ?');
      $stmt3->bindValue(1, $mail);
      $stmt3->execute();
      $pdo->commit();
    } else if ($del_fav == $tname2) {
      $pdo->beginTransaction();
      $stmt4 = $pdo->prepare('UPDATE `account` SET `tname2`= NULL WHERE mail = ?');
      $stmt4->bindValue(1, $mail);
      $stmt4->execute();
      $pdo->commit();
    }
    header("Location: " . (string)filter_input(INPUT_SERVER, 'PHP_SELF'));
  }
}

function favTableGenerator($result) {
  $count = 0;
  foreach ($result as $i) {
    $count++;
  }
  if($count != 0) {
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
  $count = 0;
  foreach($res as $i) {
    $count++;
  }
  return $count;
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
    <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="//code.getmdl.io/1.3.0/material.light_green-pink.min.css" />
    <link rel="stylesheet" href="ex/main.css">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script defer src="//code.getmdl.io/1.3.0/material.min.js"></script>
    <script defer src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js"></script>
    <script defer src="ex/script.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
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
            <p>ようこそ <?php echo h($_SESSION['NAME']); ?>さん</p>  <!-- ユーザー名をechoで表示 -->
            <ul>
              <li><a href="signout.php">ログアウト</a></li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>