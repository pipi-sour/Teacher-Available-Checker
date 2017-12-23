var options = {
  valueNames: [ 'department', 'name', 'name_en', 'available', 'infrared', 'light', 'time' ]
};
new List('fav-table', options);
new List('all-table', options);

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

var ndb = new mdDateTimePicker.default({
  type: 'date',
  init: moment(),
  past: moment(),
  future: moment().add(1, "year")
});
var toggleButton = document.getElementById('notification-date-begin');
toggleButton.addEventListener('click', function() {
  ndb.toggle();
});
ndb.trigger = document.getElementById('date-begin-output');
document.getElementById('date-begin-output').addEventListener('onOk', function() {
  this.value = ndb.time.format("YYYYMMDD").toString();
  document.getElementById("date-begin-display").innerHTML = ndb.time.format("YYYY年MM月DD日").toString();
});

var nde = new mdDateTimePicker.default({
  type: 'date',
  init: moment(),
  past: moment(),
  future: moment().add(1, 'year')
});
var toggleButton = document.getElementById('notification-date-end');
toggleButton.addEventListener('click', function() {
  nde.toggle();
});
nde.trigger = document.getElementById('date-end-output');
document.getElementById('date-end-output').addEventListener('onOk', function() {
  this.value = nde.time.format("YYYYMMDD").toString();
  document.getElementById("date-end-display").innerText = nde.time.format("YYYY年MM月DD日").toString();
});

var ntb = new mdDateTimePicker.default({
  type: 'time',
  init: moment().hour(12).minute(30),
  past: moment().hour(6).minute(0),
  future: moment().hour(23).minute(59)
});
var toggleButton = document.getElementById('notification-time-begin');
toggleButton.addEventListener('click', function() {
  ntb.toggle();
});
ntb.trigger = document.getElementById('time-begin-output');
document.getElementById('time-begin-output').addEventListener('onOk', function() {
  this.value = ntb.time.format("HHmm").toString();
  document.getElementById("time-begin-display").innerText = ntb.time.format("HH:mm").toString();
});
            
var nte = new mdDateTimePicker.default({
  type: 'time',
  init: moment().hour(13).minute(15),
  past: moment().hour(6).minute(0),
  future: moment().hour(23).minute(59)
});
var toggleButton = document.getElementById('notification-time-end');
toggleButton.addEventListener('click', function() {
  nte.toggle();
});
nte.trigger = document.getElementById('time-end-output');
nte.trigger.addEventListener('onOk', function() {
  this.value = nte.time.format("HHmm").toString();
  document.getElementById("time-end-display").innerText = nte.time.format("HH:mm").toString();
});