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