axios.get('/member/memberPage/getImg').then(res => {
    if (res.data.status == 1) {
        document.getElementById("imgFile").setAttribute("src", res.data.info[0].imgurl);
        // alert(res.data.info[0].imgurl);
    }
    else {
        document.getElementById("imgFile").setAttribute("src", "/images/user-w.svg");
        // console.log(res.data);
        // alert(res.data.info[0]);
    }
})
function previewFile() {
    var preview = document.querySelector('#imgFile');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    }
}