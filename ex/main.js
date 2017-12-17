function confPassword(target) {
  var tc = document.getElementById(target + "-confirm");
  tc.style.cssText = "display: block";
}

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "100",
  "hideDuration": "200",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
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