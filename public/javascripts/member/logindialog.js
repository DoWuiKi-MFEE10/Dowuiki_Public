function dialogL() {
    $("#dialogL").dialog({
        width: 500,
        height: 500,
        modal: true,
    });    
}
$("#loginBtn").click(function(event){
    dialogL();
})
