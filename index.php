<?php
session_start();

// ログイン状態チェック
if (!isset($_SESSION["NAME"])) {
  header("Location: //localhost:8888/signin.php");
  exit;
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
          <!-- Title -->
          <span class="mdl-layout-title">教員在室確認</span>
          <div class="mdl-layout-spacer"></div>
        </div>
        <!-- Tabs -->
        <div class="mdl-layout__tab-bar mdl-js-ripple-effect">
          <a href="#fixed-tab-1" class="mdl-layout__tab is-active tab-button"><i class="material-icons">star</i><br><span class="icon-title"> お気に入り</span></a>
          <a href="#fixed-tab-2" class="mdl-layout__tab tab-button"><i class="material-icons">view_list</i><br><span class="icon-title"> 全教員</span></a>
          <a href="#fixed-tab-3" class="mdl-layout__tab tab-button"><i class="material-icons">settings</i><br><span class="icon-title"> 設定</span></a>
        </div>
      </header>
      <main class="mdl-layout__content">
        <section class="mdl-layout__tab-panel is-active" id="fixed-tab-1">
          <div class="page-content">
            <p>ようこそ <?php echo htmlspecialchars($_SESSION["NAME"], ENT_QUOTES); ?>さん</p>  <!-- ユーザー名をechoで表示 -->
            <ul>
              <li><a href="signout.php">ログアウト</a></li>
            </ul>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-2">
          <div class="page-content">
            <div id="all-table">
              <div class="mdl-textfield mdl-js-textfield">
                <input class="mdl-textfield__input search" type="text" name="query" id="query">
                <label class="mdl-textfield__label" for="sample1">検索</label>
              </div>
              <table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp avlb-table">
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
                <tbody class="list">
                <?php
                  //$pdo = new PDO('mysql: host=localhost; dbname=available; charset=utf8', 'tester', 'raspberry');
                  $pdo = new PDO('mysql: host=localhost; dbname=available; charset=utf8', 'root', 'root', array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION));

                  foreach ($pdo->query('select * from status') as $i) {
                    echo '<tr>';
                    echo '<td class="mdl-data-table__cell--non-numeric department">' . $i["department"] . '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric name">' . $i ["name"] . '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric name_en" style="display:none;">' . $i ["name_en"] . '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric available">';
                    if($i ['available'] == 1) {
                      echo "◯";
                    } else {
                      echo "×";
                    }
                    echo '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric infrared">';
                    if($i ['infrared'] == 1) {
                      echo "◯";
                    } else if($i ['infrared'] == 0) {
                      echo "△";
                    } else {
                      echo "×";
                    }
                    echo '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric light">';
                    if($i ['light'] == 1) {
                      echo "◯";
                    } else {
                      echo "×";
                    }
                    echo '</td>';
                    echo '<td class="mdl-data-table__cell--non-numeric time">' . date("m/d H:i", strtotime($i ['time'])) . '</td>';
                    echo '</tr>';
                  }
                ?>
                </tbody>
              </table>
            </div>
            <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored add-favs">
              <i class="material-icons">add</i>
            </button>
          </div>
        </section>
        <section class="mdl-layout__tab-panel" id="fixed-tab-3">
          <div class="page-content">
            <!-- Your content goes here -->
          </div>
        </section>
      </main>
    </div>
  </body>
</html>