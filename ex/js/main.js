// toastrの設定
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

// 通知設定のfalse送信
function ntfToggle() {
  var status = document.ntfSwitchForm.ntfSwitcher.checked;
  // 通知をOFFに設定したら
  if(status === false) {
    // <input type="hidden" name="ntfSwitcher" value="0">を追加
    var hidEle = document.createElement('input');
    hidEle.setAttribute('type', 'hidden');
    hidEle.setAttribute('name', 'ntfSwitcher');
    hidEle.setAttribute('value', '0');
    document.ntfSwitchForm.appendChild(hidEle);
  }
  // falseを送信
  document.ntfSwitchForm.submit();
}
