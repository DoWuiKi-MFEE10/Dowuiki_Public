Vue.component('paginated-list', {
    data() {
        return {
            pageNumber: 0,
            img_path:"/upload/"
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
            default: 3
        },

    },
    methods: {
        nextPage() {
            this.pageNumber++;
        },
        prevPage() {
            this.pageNumber--;
        },

        dialog: function (event) {
            let artId = event.currentTarget.firstElementChild.innerText;
            let redirecPage = function(){                                  
                location.href = '/member/memberArticles'
                }
            $("#dialog").dialog({
                width: 300,
                height: 220,
                modal: true,
                buttons: {
                    "OK": function () {
                        console.log(artId)
                        axios.delete('/member/memberArticle/delArt', {
                            data: {
                                artId: artId
                            }
                        }).then(res => {
                            swal("刪除成功", "", "success");
                            setTimeout(redirecPage,1000);
                            
                        });


                        $(this).dialog("close")
                    },
                    "Cancel": function () {
                        $(this).dialog("close")
                    }
                }
            });
            $(".ui-button").addClass("btn").css("width", "60").css("height", "20")
        },
        readArticle() {
            //取得該文章artId
            let artId = event.currentTarget.firstElementChild.innerText;
            console.log(artId)
            axios.get('/articlePage/blogPage/' + artId).then(res => {
                // 透過API如果回傳不是空值的話使用分頁開啟該文章內容
                if (res.data != "" && res.data != null) {
                    window.open(`/articlePage/blogPage/${artId}`, "_blank")
                } else {
                    alert("查無文章");
                }

            })
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
        },

    },
    template: "#articleOverview"
});
// new Vue 要寫在Vue.conponent下面，不然會報錯
new Vue({
    el: "#myarticle",
    data() {
        return {
            result: [],

        }
    },
    mounted() {
        axios.get('/member/memberArticle/info').then(res => {
            if (res.data.status == 1) {
                this.result = res.data.info;
            }
        })
    }
})