// 在送出資料後顯示未填入的必填input
(function() {
    'use strict';
    window.addEventListener('load', function() {
        // 抓取我們要的from範圍
        var forms = document.getElementsByClassName('needs-validation');
        // console.log(forms);

        Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    //如果有未填的格子 會標記為was-validated 並跳轉到最上面
                    event.preventDefault();
                    event.stopPropagation();
                    form.classList.add('was-validated');
                    window.scrollTo(0, 0);
                } else {
                    //如果格子都填了 就跳alert
                    alert('OK')
                }
            }, false);
        });
    }, false);
})();