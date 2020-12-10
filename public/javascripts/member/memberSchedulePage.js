Vue.component('paginated-list', {
    data() {
        return {
            pageNumber: 0

        }
    },
    props: {
        listData: {
            type: Array,
            required: true
        },
        size: {
            type: Number,
            required: false,
            default: 4
        },

    },
    methods: {
        nextPage() {
            this.pageNumber++;
        },
        prevPage() {
            this.pageNumber--;
        },
        updateSchedules: function (event) {
            // 利用Vue 的event取得當前元素的scheid(把id放在btn裡面)
            let scheId = event.currentTarget.firstElementChild.innerText;
            axios.get('/map/' + getCookieByName('username') + '/' + scheId).then(res => {
                if (res.data.status == 1) {
                    // alert(res.data.msg);
                    location.href = '/map'
                } else {
                    alert("no data");
                }

            })

        },
        dialog: function (event) {
            let scheId = event.currentTarget.firstElementChild.innerText;
            let redirecPage = function () {
                location.href = '/member/memberSchedules'
            }
            // console.log(scheId)
            $("#dialog").dialog({
                width: 300,
                height: 220,
                modal: true,
                buttons: {
                    "OK": function () {
                        console.log(scheId)
                        axios.delete('/member/memberSchedules/delSch', {
                            data: {
                                scheId: scheId
                            }
                        }).then(res => {
                            swal("刪除成功", "", "success");
                            setTimeout(redirecPage, 1000);
                        });


                        $(this).dialog("close")
                    },
                    "Cancel": function () {
                        $(this).dialog("close")
                    }
                }
            });
            $(".ui-button").addClass("btn").css("width", "60").css("height", "20")
        }

    },
    computed: {
        pageCount() {
            let l = this.listData.length,
                s = this.size;
            return Math.ceil(l / s);
        },
        paginatedData() {
            const start = this.pageNumber * this.size,
                end = start + this.size;
            return this.listData
                .slice(start, end);
        }
    },
    template: "#pagebtn"
});
new Vue({
    el: "#app",
    data() {
        return {
            results: [],
            travelName: "",


        }
    },

    mounted() {
        axios.get('/member/memberSchedules/schid').then(res => {
            // alert(res.data.msg);
            // 取陣列資料並反轉，把時間最新的放第一筆
            this.results = res.data.data.reverse();
            // 測試data的變數results，把回傳的陣列寫入
            console.log(this.results);
        })
    }

})

// 彈出刪除dialog
function dialog() {
    $("#dialog").dialog({

        width: 300,
        height: 200,
        modal: true,
    });
}
// 點擊觸發
$(".rightIcon").click(function (event) {
    dialog();
})

$(".btnCheck").click(function () {
    $("#dialog").dialog("close");
});
// cookie 轉換
function parseCookie() {
    var cookieObj = {};
    var cookieAry = document.cookie.split(';');
    var cookie;

    for (var i = 0, l = cookieAry.length; i < l; ++i) {
        cookie = jQuery.trim(cookieAry[i]);
        cookie = cookie.split('=');
        cookieObj[cookie[0]] = cookie[1];
    }

    return cookieObj;
}

// browser 取得cookie資料
function getCookieByName(name) {
    var value = parseCookie()[name];
    if (value) {
        value = decodeURIComponent(value);
    }

    return value;
}