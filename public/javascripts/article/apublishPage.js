
if (!getCookie('username')) {
    alert("請先登入會員");
    // 呼叫window.location.assign讓本頁可以變成瀏覽器歷史紀錄的上一頁
    window.location.assign('/member') ;
    
}
//檢查form有無空白欄位
function validateForm() {
    var articleTitleInput = $("#articleTitle").val();
    var publishTimeInput = $("#publishTime").val();
    var tagInput = $("#articleTags").val();
    var siteNameInput = $("#siteName").val();
    var siteCountryInput = $("#siteCountry").val();
    var siteCityInput = $("#siteCity").val();
    var siteAddressInput = $("#siteAddress").val();
    var narrativeInput = $("#narrative").val();
    var imgFile = $("#imgFile").attr("src");

    if (!articleTitleInput || !publishTimeInput || !siteNameInput || !siteCountryInput || !siteCityInput || !siteAddressInput || !narrativeInput) {
        alert("請輸入空白欄位");
        return false;
    } else if (!imgFile) {
        alert("請上傳文章首圖");
        return false;
    } else if (tagInput == "#") {
        alert("請加入至少一個標籤");
        return false;
    }
}
//尋找cookie的function
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}



console.log(Vue);
const app = new Vue({
    el: '#textED',
    data: {
        searchBar: null,
        test: 'test'
    },
    methods: {
        //地址input
        initMap() {
            this.searchBar = new google.maps.places.Autocomplete(document.getElementById('siteName'));
            this.searchBar.addListener('place_changed', this.onPlaceChanged)
        },
        onPlaceChanged() {
            const place = this.searchBar.getPlace();
            console.log(place);
            //景點名稱
            const sitenameid = place.name;
            //國家名稱
            if (place.address_components.length > 1) {
                //check whether target place is in any country
                for (let i = 0; i < place.address_components.length; i++) {
                    const typesArr = place.address_components[i].types;
                    if (typesArr.find(function (ele) {
                        return ele === 'country';
                    })) {
                        // console.log(place.address_components[i].long_name);
                        // get country name or natural feature name
                        document.getElementById('siteCountry').value = place.address_components[i].long_name;
                    }
                }
            } else {
                // console.log(place.address_components[0].long_name);
                document.getElementById('siteCountry').value = place.address_components[0].long_name;
            }
            const countryId = document.getElementById('siteCountry').value;
            //城市名稱
            if (place.plus_code) {
                let split1 = place.plus_code.compound_code.split(" ")[1];
                document.getElementById('siteCity').value = split1.split(`${countryId}`)[1];
                console.log(document.getElementById('siteCity').value);
            } else {
                document.getElementById('siteCity').value = " ";
            }
            //地址
            const addressId = place.formatted_address;
            //place_id
            const placeId = place.place_id;
            console.log(sitenameid);
            console.log(addressId);
            console.log(placeId);
            document.getElementById('siteName').value = sitenameid;
            document.getElementById('siteAddress').value = addressId;
            document.getElementById('placeIdInput').value = placeId;
        }
    },
    mounted() {
        window.addEventListener('load', () => {
            this.initMap();
        })
        $('#summernote').summernote({
            placeholder: 'Hello Bootstrap 4',
            tabsize: 2,
            minHeight: 350,
            maxHeight: 500,
            lang: 'zh-TW'
        });
    }
})
