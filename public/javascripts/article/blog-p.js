//用Vue展示從api抓回的資料
var blogPage = new Vue({
    el: "#pagecon",
    data: {
        artCont: {
        },
        tagCont: {},
        noteCont: {},
        //留言用V:for
        commentCont: {},
        artNum: ""
    },
    created: function () {
        var currentUrl = window.location.pathname;
        this.artNum = currentUrl.split("blogPage/")[1];
        // artNum就是article_id
        // console.log(this.artNum);
    },
    async mounted() {
        // 0.文章資料 1.標籤 2.文章內容 3.留言
        await axios.get(`/blogapi/article/${this.artNum}`).then(res => {
            //如果文章不存在 alert並跳到首頁
            console.log(res.data);
            if (res.data == "no data") {
                alert('文章不存在了呦QAQ');
                location.href = '/';
            } else if (res.data == "accused") {
                //如果文章被檢舉 alert並跳到首頁
                alert('本文已被檢舉>_<');
                location.href = '/';
            } else {
                this.artCont = res.data[0];
                this.tagCont = res.data[1].tag;
                this.noteCont = res.data[2];
                this.commentCont = res.data[3];
            }
        });
        this.growStar();
    },
    methods: {
        //查詢地圖 另開地圖頁
        gotoMap: function () {
            window.open(`/map?placeId=${this.artCont.google_id}`);
        },
        //長出星星的方法
        growStar: function () {
            //第一個迴圈幫每個出現星星的div命名
            for (var i = 0; i < this.commentCont.length; i++) {
                const starAmount = $(`#starInput${i}`)[0].value;
                // console.log(starAmount);
                //第二個迴圈畫出跟score一樣個數的星星
                for (var j = 1; j <= starAmount; j++) {
                    $(`#cardstar${i}`)[0].innerHTML += '<img class="star-r" src="/images/star-r.svg" alt="">';
                };
            };
        }

    }
})


// 新增留言 //
function msgSubmit() {
    var message = $("#message").val();
    var star = $("#star").val();
    var artId = $("#artId")[0].innerHTML;
    // console.log(artId);
    if (!message || !star) {
        alert("請輸入空白欄位");
        return;
    }
    //透過ajax把前端取到的值透過url往後端傳遞 後端在router articlePage.js
    $.ajax({
        type: "post",
        url: "/articlePage/newcomment",
        data: {
            "message": message,
            "star": star,
            "create_time": new Date(),
            "artId": artId
        },
        success: function (res) {
            if (res === 'success') {
                alert('上傳成功');
                location.reload();
            } else {
                alert('請先登入會員');
                location.href = '/member';
            }

        }
    })
}


//收藏文章
$('#likeBtn').click(function () {
    var articleUrl = $(location).attr('href').split('/');
    var articleId = articleUrl[articleUrl.length - 1];
    // console.log(articleId);
    var nowTime = new Date();
    var userCookie = getCookie('username');
    if (!getCookie('username')) {
        alert("請先登入會員");
        // 呼叫window.location.assign讓本頁可以變成瀏覽器歷史紀錄的上一頁
        window.location.assign('/member');
    } else {
        $.ajax({
            type: "post",
            url: "/articlePage/favorite",
            data: {
                "aricleId": articleId,
                "nowTime": nowTime,
                "userCookie": userCookie
            },
            success: function (res) {
                alert(res);
            }
        })
    }
});
//取得cookie方法
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// 檢舉文章 //
function reportSubmit() {
    var reason = $("#reason").val();
    var megReason = $("#megReason").val();
    var articleUrl = $(location).attr('href').split('/');
    var articleId = articleUrl[articleUrl.length - 1];
    var nowTime = new Date();
    if (!getCookie('username')) {
        alert("請先登入會員");
        // 呼叫window.location.assign讓本頁可以變成瀏覽器歷史紀錄的上一頁
        window.location.assign('/member');
    } else {
        if (!reason || !megReason) {
            alert("請輸入空白欄位");
            return;
        }
        var userEmail = getCookie('username');
        //透過ajax把前端取到的值透過url往後端傳遞 
        $.ajax({
            type: "post",
            url: "/articlePage/accuseart",
            data: {
                "nowTime": nowTime,
                "articleId": articleId,
                "userEmail": userEmail,
                "reason": reason,
                "megReason": megReason
            },
            success: function (res) {
                alert(res);
            }
        })
    }
};
