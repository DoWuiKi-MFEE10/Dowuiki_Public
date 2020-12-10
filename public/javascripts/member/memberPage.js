new Vue({
    el: "#userData",
    data() {
        return {
            username: "",
            password: "",
            nickname: "",
            self_intro: ""
        }
    },
    mounted() {
        axios.get("/member/memberPage/user").then(res => {
            this.username = res.data.username;
            this.password = res.data.password;
            this.nickname = res.data.nickname;
            this.self_intro = res.data.self_intro;

        })
    },
    methods: {
        // 更新自介
        updateSelfIntro: function () {
            let selfIntro = this.$refs.selfIntro.value;
            let redirectPage = function () { 
                location.href = '/member/memberPage'
             }
            // console.log(selfIntro);
            // data:selfIntro
            axios.put('/member/memberPage/updateIntro', {
                data: selfIntro
            }).then(res => {
                // console.log(res);
                swal("更新完成", res.data.msg, "success");
                setTimeout(redirectPage,1000)
                // alert(res.data.msg);
                
            })
        },
        userLogout: function () {
            logout();
        }

    }
})
// 修改密碼dialog
function dialog() {
    $("#dialog").dialog({
        width: 400,
        height: 350,
        modal: true,
        buttons: {
            "OK": function () {
                updatePwd();
                // $(this).dialog("close")

            },
            "Cancel": function () {
                $(this).dialog("close")
            }
        }
    })
    $(".ui-button").addClass("btn").css("width", "60").css("height", "30")
}
// 修改暱稱dialog
function dialogS() {
    $("#dialogS").dialog({
        width: 300,
        height: 280,
        modal: true,
        buttons: {
            "OK": function () {
                updateNickname();
                $(this).dialog("close")
            },
            "Cancel": function () {
                $(this).dialog("close")
            }
        }
    })
    $(".ui-button").addClass("btn").css("width", "60").css("height", "30")
}

// 點下按鈕彈出改密碼
$("#btnUpdatePwd").click(function (event) {
    dialog();
});
// // 點下按鈕彈出改暱稱
$("#btnUpdateNickName").click(function (event) {
    dialogS();
})


// 更新暱稱函式 newNickname:取得input欄位的值
function updateNickname() {
    let redirectPage = function () {
        location.href = "/member/memberPage";
    }
    $.ajax({
        type: "put",
        url: "/member/memberPage/updateNickname",
        data: {
            newNickname: changeNickName.value
        },
        success: function (res) {
            // alert(res.msg);
            swal("更新完成", res.msg, "success");
            setTimeout(redirectPage,1000)
        },
        error: function (res) {
            console.log(res);
        }
    })
}
// 更新密碼函式 
function updatePwd() {
    let redirectPage = function () {
        location.href = "/member/memberPage";
    }
    // 確認欄位不為空值
    if (oldPwd.value == "" || newPwd.value == "" || checkPwd.value == "") {
        // alert("欄位不能為空");
        swal("提示!", "欄位不能為空", "info");
    }
    // 確認新密碼與確認碼相符
    else if (newPwd.value != checkPwd.value) {
        swal("錯誤!", "新密碼與確認密碼不符!", "error");
        // alert("新密碼與確認密碼不符!");
    } else {
        //更新密碼
        $.ajax({
            type: "put",
            url: "/member/memberPage/updatePwd",
            data: {

                oldPassword: oldPwd.value,
                newPassword: newPwd.value,
                checkPassword: checkPwd.value
            },
            success: function (res) {
                // alert(res.msg);
                if(res.status == 0){
                    swal("錯誤", res.msg, "error");
                }else{
                    swal("更新完成", res.msg, "success");
                    setTimeout(redirectPage,1000)
                }
               
            },
            error: function (res) {
                // alert(res.msg)
                swal("錯誤", res.msg, "error");
            }

        })
    }
}