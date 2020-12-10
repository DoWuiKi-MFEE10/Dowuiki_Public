document.getElementById("searchblog").addEventListener("keyup", function (event) {
    // event.preventDefault();
    if (event.key === "Enter") {
        searchBlog();
    }
});

//搜尋送出到後端
function searchBlog() {
    var searchWord = $("#searchblog").val();
    // console.log(searchWord);
    $.ajax({
        type: "post",
        url: "/articlePage/searching",
        data: {
            "searchword": searchWord
        },
        success: function (res) {
            if (res.status === 0) {
                alert("QAQ");
                return;
            } else if (res.status === 1) {
                alert(res.message);
            } else {
                localStorage.setItem("sResult", res)
                location.href = '/articlePage/asresultPage'
            }
        }
    })
}

// 國外 //
var vm = new Vue({
    el: '#cardTop1',
    data: {
        domesFir: {},
        domesSec: {},
        domesThir: {},
        domesFour: {},
        urlFir: "",
        urlSec: "",
        urlThir: "",
        urlFour: "",
    },
    async mounted() {
        await axios.get('/blogapi/foreign').then(res => {
            if (res.statusText === "OK") {
                for (var num = 0; num < res.data.length; num++) {
                    if (res.data[num].avgscore == null) {
                        res.data[num]["avgscore"] = "5"
                    }
                }
                this.domesFir = res.data[0];
                this.domesSec = res.data[1];
                this.domesThir = res.data[2];
                this.domesFour = res.data[3];
                this.urlFir = "/articlePage/blogPage/" + res.data[0].article_id;
                this.urlSec = "/articlePage/blogPage/" + res.data[1].article_id;
                this.urlThir = "/articlePage/blogPage/" + res.data[2].article_id;
                this.urlFour = "/articlePage/blogPage/" + res.data[3].article_id;
                // console.log(this.domesSec);
                // console.log(this.domesThir);
                // console.log(this.domesFour);
            }
        });
        this.growStar();
    },
    methods: {
        growStar: function () {
            //第一個迴圈幫每個出現星星的div命名
            for (var i = 1; i <= 4; i++) {
                const starAmount = $(`#starInput${i}`)[0].value;
                //第二個迴圈畫出跟score一樣個數的星星
                for (var j = 0; j < starAmount; j++) {
                    $(`#cardStar${i}`)[0].insertAdjacentHTML('afterbegin', '<img class="star-r" src="/images/star-r.svg" alt="">');
                };
            };
        },
        getforeign: function () {
            $.ajax({
                type: "get",
                url: "/blogapi/foreign",
                data: {
                    "foreign": "foreign"
                },
                success: function (res) {
                    // console.log(res)
                    localStorage.setItem("sResult", JSON.stringify(res))
                    location.href = '/articlePage/asresultPage'

                }
            })

        },

    }

})


// 國內 //
var vm = new Vue({
    el: '#cardTop2',
    data: {
        domesFir: {},
        domesSec: {},
        domesThir: {},
        domesFour: {},
        urlFir: "",
        urlSec: "",
        urlThir: "",
        urlFour: "",
    },
    async mounted() {
        await axios.get('/blogapi/domestic').then(res => {
            if (res.statusText === "OK") {
                for (var num = 0; num < res.data.length; num++) {
                    if (res.data[num].avgscore == null) {
                        res.data[num]["avgscore"] = "5"
                    }
                }
                this.domesFir = res.data[0];
                this.domesSec = res.data[1];
                this.domesThir = res.data[2];
                this.domesFour = res.data[3];
                this.urlFir = "/articlePage/blogPage/" + res.data[0].article_id;
                this.urlSec = "/articlePage/blogPage/" + res.data[1].article_id;
                this.urlThir = "/articlePage/blogPage/" + res.data[2].article_id;
                this.urlFour = "/articlePage/blogPage/" + res.data[3].article_id;
                // console.log(this.domesFir);
                // console.log(this.domesSec);
                // console.log(this.domesThir);
                // console.log(this.domesFour);
            }
        });
        this.growStar();
    },
    methods: {
        growStar: function () {
            //第一個迴圈幫每個出現星星的div命名
            for (var i = 5; i <= 8; i++) {
                const starAmount = $(`#starInput${i}`)[0].value;
                //第二個迴圈畫出跟score一樣個數的星星
                for (var j = 0; j < starAmount; j++) {
                    $(`#cardStar${i}`)[0].insertAdjacentHTML('afterbegin', '<img class="star-r" src="/images/star-r.svg" alt="">');
                };
            };
        },
        getdomestic: function () {
            $.ajax({
                type: "get",
                url: "/blogapi/domestic",
                data: {
                    "domestic": "domestic"
                },
                success: function (res) {
                    // console.log(res)
                    localStorage.setItem("sResult", JSON.stringify(res))
                    location.href = '/articlePage/asresultPage'

                }
            })

        }
    }

})