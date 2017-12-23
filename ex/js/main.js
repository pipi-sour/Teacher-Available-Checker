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
};

function ntfToggle() {
  var status = document.ntfSwitchForm.ntfSwitcher.checked;
  if(status === false) {
    var hidEle = document.createElement('input');
    hidEle.setAttribute('type', 'hidden');
    hidEle.setAttribute('name', 'ntfSwitcher');
    hidEle.setAttribute('value', '0');
    document.ntfSwitchForm.appendChild(hidEle);
  }
  document.ntfSwitchForm.submit();
}
