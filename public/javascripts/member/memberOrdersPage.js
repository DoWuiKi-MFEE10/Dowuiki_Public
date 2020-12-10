 // 點擊全選時改變其他checkbox狀態
 $(document).ready(function () { 
    // 把每個table裡checkbox存成變數
    let checkboxItem = 'input[name="Checkbox[]"]'
    $("#checkAll").on("click",function () { 
        // 全選被點擊時，讓其他checkbox隨之改變
        if($("#checkAll").prop("checked")){
            $(checkboxItem).prop("checked",true);
        }else{
            $(checkboxItem).prop("checked",false);
        }
     })
 })
