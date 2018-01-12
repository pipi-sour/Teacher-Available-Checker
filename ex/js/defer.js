// list.js
var options = {
  valueNames: [ 'department', 'name', 'name_en', 'available', 'infrared', 'light', 'time' ]
};
new List('fav-table', options);
new List('all-table', options);

// 表のヘッダをクリックして並べ替える際の処理
var headers = document.querySelectorAll('th.sort');
for (var i = 0; i < headers.length; i++) {
  headers[i].addEventListener('click', function (){
    for (var j = 0; j < headers.length; j++) {
      var classList = headers[j].classList;
      classList.remove('mdl-data-table__header--sorted-ascending');
      classList.remove('mdl-data-table__header--sorted-descending');
      if (classList.contains('asc')) {
        classList.add('mdl-data-table__header--sorted-ascending');
      } else if (classList.contains('desc')) {
        classList.add('mdl-data-table__header--sorted-descending');
      }
    }
  });
}

// メール通知の開始日付の設定
var ndb = new mdDateTimePicker.default({
  // カレンダー表示、初期値は今日、設定可能範囲は今日〜1年後の今日
  type: 'date',
  init: moment(),
  past: moment(),
  future: moment().add(1, "year")
});
// ボタンに開始日付の設定ダイアログを組み込む
var toggleButton = document.getElementById('notification-date-begin');
toggleButton.addEventListener('click', function() {
  ndb.toggle();
});
ndb.trigger = document.getElementById('date-begin-output');
// 日付が決定されたらその値を隠しinput要素とp要素に出力
ndb.trigger.addEventListener('onOk', function() {
  this.value = ndb.time.format("YYYYMMDD").toString();
  document.getElementById("date-begin-display").innerHTML = ndb.time.format("YYYY/MM/DD").toString();
});

// メール通知の開始時刻の設定
var ntb = new mdDateTimePicker.default({
  // 時計表示、初期値はAM12:30、設定可能範囲はAM6:00〜PM23:59
  type: 'time',
  init: moment().hour(12).minute(30),
  past: moment().hour(6).minute(0),
  future: moment().hour(23).minute(59)
});
// ボタンに開始時刻の設定ダイアログを組み込む
var toggleButton = document.getElementById('notification-time-begin');
toggleButton.addEventListener('click', function() {
  ntb.toggle();
});
ntb.trigger = document.getElementById('time-begin-output');
// 時刻が決定されたらその値を隠しinput要素とp要素に出力
document.getElementById('time-begin-output').addEventListener('onOk', function() {
  this.value = ntb.time.format("HHmm").toString();
  document.getElementById("time-begin-display").innerText = ntb.time.format("HH:mm").toString();
});

// メール通知の終了日付の設定
var nde = new mdDateTimePicker.default({
  // カレンダー表示、初期値は今日、設定可能範囲は今日〜1年後の今日
  type: 'date',
  init: moment(),
  past: moment(),
  future: moment().add(1, 'year')
});
// ボタンに終了日付の設定ダイアログを組み込む
var toggleButton = document.getElementById('notification-date-end');
toggleButton.addEventListener('click', function() {
  nde.toggle();
});
nde.trigger = document.getElementById('date-end-output');
// 日付が決定されたらその値を隠しinput要素とp要素に出力
document.getElementById('date-end-output').addEventListener('onOk', function() {
  this.value = nde.time.format("YYYYMMDD").toString();
  document.getElementById("date-end-display").innerText = nde.time.format("YYYY/MM/DD").toString();
});

// メール通知の終了時刻の設定
var nte = new mdDateTimePicker.default({
  // 時計表示、初期値はPM1:30、設定可能範囲はAM6:00〜PM23:59
  type: 'time',
  init: moment().hour(13).minute(15),
  past: moment().hour(6).minute(0),
  future: moment().hour(23).minute(59)
});
// ボタンに終了時刻の設定ダイアログを組み込む
var toggleButton = document.getElementById('notification-time-end');
toggleButton.addEventListener('click', function() {
  nte.toggle();
});
nte.trigger = document.getElementById('time-end-output');
// 時刻が決定されたらその値を隠しinput要素とp要素に出力
nte.trigger.addEventListener('onOk', function() {
  this.value = nte.time.format("HHmm").toString();
  document.getElementById("time-end-display").innerText = nte.time.format("HH:mm").toString();
});