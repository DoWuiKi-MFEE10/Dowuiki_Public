// 會員登入功能
function login() {
    let userName = $("#userNameLogin").val();
    let passWord = $("#userNameLoginPwd").val();
    // 把重導頁面寫成函式
    let pageRedirect = function(){
        // location.href = '/member/memberPage?username='+ userName;
        window.history.go(-1);
    }
    let adminRedirect = function () { 
        location.href = '/admin'
     }
    if(!userName || !passWord){
        swal("提示", "請輸入空白欄位", "warning");
        // alert("請輸入空白欄位");
        return;
    }
    //透過ajax把前端取到的值(帳號、密碼)透過url往後端傳遞 
    $.ajax({
        type:"post",
        url: "/member/login",
        data:{
            "username":userName,
            "password":passWord
        },
        success:function(res){
            console.log(res);
            // 取得response過來的status =1 代表登入驗證成功，重新導回另一頁
            if(res.status == 3){
                swal("管理者帳號登入",res.msg,"success");
                setTimeout(adminRedirect,1500);
               
                // location.href = '/member/memberPage?username='+ userName;
              
            }else if(res.status == 1){
                console.log(res.loginCount);
                swal("登入成功!", "歡迎來到Dowuiki!", "success");
                setTimeout(pageRedirect,1500);
              
            }else if(res.status == 0){
                swal("警告!", res.msg, "error");
            } 
            else{
                // console.log(res);
                swal("oops!", res.msg, "error");
              
                // alert(res.msg);
            }
        },
        error:function(res){
            // console.log("post excute error!");
            alert("post excute error!");
        }   
    })
         
}
// 遊客註冊功能
function register(){
    let userName = $("#userNameSignin").val();
    let passWord = $("#userNameSignPwd").val();
    let nickName = $("#userNickNameSign").val();
    let pageRedirect = function(){
        location.href = '/member';
    }
    if(!userName || !passWord || !nickName){
        alert("請輸入空白欄位");
    }
    else{
        $.ajax({
            type:"post",
            url:"/member/register",
            data:{
                "username":userName,
                "password":passWord,
                "nickname":nickName
            },
            success:function(res){
                console.log(res);
                if(res.status == 1){
                    // alert(res.msg);
                    swal("註冊成功!", "", "success");
                    setTimeout(pageRedirect,1000);
                    
                }
                else{
                    swal("註冊失敗!", "帳號已經註冊過囉", "info");
                    console.log(res.msg);
                }

            },
            error:function(res){
                // alert(res);
                console.log(res);
            }
        })
    }
}

function logout(){
    let logoutRedirect = function () { 
        location.href = "/"
     }
    $.ajax({
        type:"get",
        url:"/member/logout",
        data:{},
        success:function(res){
            // alert(res.msg);
            swal("帳號登出","","warning")
            setTimeout(logoutRedirect,1000)
        },
        error:function(res){
            alert("no");
        }
    })
}

