//tag部分
var vm = new Vue({
    el: '#fullPage',
    data: {
        "list": [],
        "tagArray": [],
    },
    created() {
        //取得tag名
        //看list有幾筆
        const cutting = localStorage.getItem("sResult").replace(/\\b/g, "");
        console.log(cutting);
        this.list = JSON.parse(cutting);
        for (var i = 0; i < this.list.length; i++) {
            //看看每一筆tag資料用#分開後會得到什麼
            // console.log(this.list[i].tag.split('#'));
            //將每一筆寫進tagArray裡 用push
            for (var j = 0; j < this.list[i].tag.split('#').length; j++) {
                //如果是空值 跳過不加
                if (this.list[i].tag.split('#')[j] == "") {
                    continue;
                    //如果已存在 跳過不加
                } else if (this.tagArray.includes(this.list[i].tag.split('#')[j])) {
                    continue;
                }
                console.log(this.list[i].tag.split('#')[j]);
                this.tagArray.push(this.list[i].tag.split('#')[j]);
            }
        }
        console.log(this.tagArray);
    },
    methods: {
        //取得tag的方法
        getTag(event) {
            this.list = JSON.parse(localStorage.getItem("sResult"));
            const tagList = [];
            //將裡面一項一項含有tag字串的資料抓出來 EX:tag字串:京都 抓tag含有京都的資料
            for (var q = 0; q < this.list.length; q++) {
                if (this.list[q].tag.includes(event.target.textContent)) {
                    // console.log(this.list[q]);
                    var tagitem = JSON.stringify(this.list[q]);
                    tagList.push(tagitem);
                }
            }
            // 字串用","連接
            const newData = tagList.join(',');
            //加上前後[ ]
            const newliststart = "[".concat(newData);
            const newlistend = newliststart.concat("]");
            //轉成JASON 丟回vue data裡
            const newList = JSON.parse(newlistend);
            this.list = newList;
            // console.log(event.target.textContent);
        }
    },
});