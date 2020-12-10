function dialogL() {
    $("#dialogL").dialog({
        width: 500,
        height: 500,
        modal: true,
    });    
}
// 增加 navbar 會員登入 dialog 
$(".user-r").click(function(event){
    dialogL();
})
// 增加 navbar 會員效果
$(".user-r").css("cursor","pointer")