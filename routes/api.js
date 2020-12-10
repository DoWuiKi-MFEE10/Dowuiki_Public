let express = require('express');
let router = express.Router();
let connection = require('../models/mysql.js');

// - 新增旅途行程
router.post('/save', function (req, res, next) {

    //  - Data(JSON String)
    req.body.travelName = "環島小旅行"
    req.body.interests = `[{"originData":\
    {"placeId":"ChIJKfilEBKpQjQRiqgmYP6pC2g",\
    "placeName":"臺北市立聯合醫院中興院區"},\
    "terminalData":\
    {"placeId":"ChIJp9P5QW-pQjQRQ3GSoHy4ijU",\
    "placeName":"龍都酒樓"},\
    "distance":{"text":"2.5 公里","value":2460},\
    "duration":{"text":"11 分鐘","value":675}},\
    {"originData":\
    {"placeId":"ChIJE77JZ2qpQjQRvFJazQ_3Hro",\
    "placeName":"阿桐阿寶四神湯"},\
    "terminalData":\
    {"placeId":"ChIJY06RcWmpQjQR-pFGFmD6NR4",\
    "placeName":"大師兄銷魂麵舖-中山店"},\
    "distance":{"text":"1.8 公里","value":1848},\
    "duration":{"text":"8 分鐘","value":478}\
    },\
    {"originData":{"placeId":"ChIJp9P5QW-pQjQRQ3GSoHy4ijU",\
    "placeName":"龍都酒樓"},\
    "terminalData":{"placeId":"ChIJkyk2KHCpQjQR7h3ggRfG2fU",\
    "placeName":"善導寺"},\
    "distance":{"text":"1.1 公里","value":1148},\
    "duration":{"text":"7 分鐘","value":408}}]
    `;
    // res.send(req.body.interests);

    let objArray = JSON.parse(req.body.interests);
    let DataArray = [];
    console.log(objArray);

    connection.queryAsync(
        "insert into favorite_sche\
            (User_user_id, sche_name, update_time)\
            VALUES (?,?,?);"
        , [1, req.body.travelName, new Date()],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                res.send("inserted fail.");
                return;
            }
            // console.log(result.insertId);

            // - mysql Data Array: [userId, originData.placeId , terminalData.placeId , distance.text, duration.text]
            for (i = 0; i <= objArray.length - 1; i++) {
                DataArray.push(
                    [
                        result.insertId,
                        // req.session.user_id,
                        1,
                        objArray[i].originData.placeId,
                        objArray[i].originData.placeName,
                        objArray[i].terminalData.placeId,
                        objArray[i].terminalData.placeName,
                        objArray[i].distance.text,
                        objArray[i].duration.text]
                )
            }
            // console.log(DataArray);

            connection.queryAsync(
                "insert into Sche_location\
                 (favorite_sche_schedule_id,serialnum,originData,origin_Location,terminalData,end_Location, distance, duratuion)\
                           VALUES ?"
                , [DataArray],
                function (err) {
                    if (err) {
                        console.log(JSON.stringify(err));
                        res.send("inserted fail.");
                        return;
                    }
                    res.cookie('saveStatus', 'success', { maxAge: 604800000 })
                    res.redirect('/map');
                    // res.send('OK');

                })
        }
    )
});

// 讀取地點文章  (資料先寫死、img_path, title, description, article_url)
router.get('/locaArt', function (req, res, next) {

    connection.queryAsync(
        // 'select article_info.article_id, article_info.title , article_info.content, article_info.article_url,\
        //  artice_img.imgurl\
        //  from article_info\
        //  INNER JOIN artice_img\
        //  ON article_info.article_id = artice_img.article_info_article_id\
        //   where google_id = ?',
        'select title, description, article_url, img_path\
         from article_info\
          where google_id = ?',
        [
            // req.query.placeId,
            // "ChIJNVZtkB-LGGAR6Pz2MxHkSFY"
            2
        ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.json(rows);
        }
    );

})

// 取得旅程列表
router.get('/favSche', function (req, res, next) {

    connection.query(
        'select *\
         from Favorite_sche\
          where User_user_id = ?',
        [
            req.params.userId
            // "user-109-11-001"
        ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send(JSON.stringify(rows));
        }
    );

})

// 取得行程資訊
router.get('/Schelocation', function (req, res, next) {

    connection.query(
        'select *\
         from sche_location\
          where favorite_sche_schedule_id = ?',
        [
            23
            // req.params.scheduleId
            // "user-109-11-001"
        ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            // rows = JSON.parse(JSON.stringify(rows));
            // console.log(rows);

            let outputArray = [];
            for (i = 0; i <= rows.length - 1; i++) {
                let scheArray =
                {
                    originData: {
                        placeId: rows[i].originData,
                        placeName: rows[i].origin_Location
                    },
                    terminalData: {
                        placeId: rows[i].terminalData,
                        placeName: rows[i].end_Location
                    },
                    distance: { text: rows[i].distance, value: 0 },
                    duration: { text: rows[i].duration, value: 0 }
                }
                // console.log(scheArray);
                outputArray.push(scheArray);
            };
            // console.log(outputArray);

            res.cookie('interests', JSON.stringify(outputArray), { maxAge: 604800000 });
            res.send(outputArray);
        }
    );

})

module.exports = router;