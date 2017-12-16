var options = {
  valueNames: [ 'department', 'name_en', 'available', 'infrared', 'light', 'time' ]
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

/*
window.onload = function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('ex/sw.js')
             .then(function(reg) { console.log("Service Worker Registered"); });
  }
};
*/

/*
$(document).ready(function() {
  $('.mdl-checkbox').on('click', function() {
    console.log($('tr.is-selected').length);
    if($('tr.is-selected').length == 0) {
      //$('#add-button').removeClass('active');
      //$('#add-button').addClass('inactive');
      $('#add-button')
    } else {
      $('#add-button').removeClass('inactive');
      $('#add-button').addClass('active');
    }
  });
});
*/

/*
document.querySelectorAll('tr.all-teachers-trs').function favAdder() {
  if(document.querySelectorAll('tr.is-selected').length >= 1) {
    console.log("あああ");
  }
}
*/