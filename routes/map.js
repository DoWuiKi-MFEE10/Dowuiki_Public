var express = require('express');
var router = express.Router();
var connection = require('../models/mysql.js');
var { login_render, login_api } = require('../models/loginCheck');


// - 回地圖頁
router.get('/', function (req, res, next) {
    console.log(req.session.username);
    res.render('map/map', { title: { name: 'String' } });
});

// -  讀取行程資料並更新cookie
router.get('/:username/:scheId', function (req, res, next) {
    // console.log("map get schId =>"+req.params.scheId);
    // console.log("map get username =>"+req.params.username);
    if (req.params.username != req.session.username) {
        res.redirect('/map');
        return
    }
    if (req.params.scheId == null) {
        res.redirect('/map');
        return
    }
    req.session.scheId = req.params.scheId;
    connection.query(
        'SELECT sche_location.*, favorite_sche.sche_name\
         FROM sche_location INNER JOIN favorite_sche\
          ON sche_location.favorite_sche_schedule_id = favorite_sche.schedule_id\
          WHERE sche_location.favorite_sche_schedule_id = ?',
        [
            // 24
            req.params.scheId
            // req.session.scheduleId
            // "user-109-11-001"
        ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            rows = JSON.parse(JSON.stringify(rows));
            console.log("db data get => " + rows);

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
                    duration: { text: rows[i].duratuion, value: 0 }
                }
                console.log(scheArray);
                outputArray.push(scheArray);
            };
            // console.log(outputArray);

            res.cookie('travelName', rows[0].sche_name, { maxAge: 604800000 })
            res.cookie('interests', JSON.stringify(outputArray), { maxAge: 604800000 });
            res.json({
                "status": 1,
                "msg": "redirect to map!"
            })


            // res.render('map/map', { title: { name: 'String' } });
            // res.end();
        }
    );
});

// - *讀取地點文章 (img_Url, title, content, article_url)
router.get('/schArt', function (req, res, next) {
    // 只取前四筆
    // 'SELECT title, description, article_id, img_path\
    // FROM article_info\
    //  WHERE google_id = ?\
    //  LIMIT 4'
    connection.queryAsync(
        'SELECT title, description, article_id, img_path\
         FROM article_info\
          WHERE google_id = ?',
        [
            req.query.placeId
            // "ChIJNVZtkB-LGGAR6Pz2MxHkSFY"
            // 2
        ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.json(rows);
            console.log('get article info OK');
            console.log(rows);
        }
    );

})

// 新增行程＆旅程判斷
router.post('/upload', login_render, function (req, res, next) {
    let jsonString = req.body.interests;

    // res.send(jsonString);

    let objArray = JSON.parse(jsonString);
    let DataArray = [];
    // console.log(objArray);

    // 先判斷是否有旅程id，有的話先清掉相關資料
    if (req.session.scheId != null) {
        connection.queryAsync(
            "DELETE FROM sche_location\
              WHERE favorite_sche_schedule_id = ? ;"
            ,
            [
                req.session.scheId
                // 22
            ]
            ,
            function (err, result) {
                if (err) {
                    console.log(JSON.stringify(err));
                    res.send("change fail.");
                    return;
                }
                // - mysql Data Array: [userId, originData.placeId , terminalData.placeId , distance.text, duration.text]
                for (i = 0; i <= objArray.length - 1; i++) {
                    DataArray.push(
                        [
                            // 25,
                            req.session.scheId,
                            // 1,
                            req.session.user_id,
                            objArray[i].originData.placeId,
                            objArray[i].originData.placeName,
                            objArray[i].terminalData.placeId,
                            objArray[i].terminalData.placeName,
                            objArray[i].distance.text,
                            objArray[i].duration.text]
                    )
                }
                // UPDATE旅程資訊
                connection.queryAsync(
                    "UPDATE favorite_sche\
                    SET sche_name = ?, update_time = ?\
                    WHERE schedule_id = ?"
                    , [req.body.travelName, new Date(), req.session.scheId]
                    , (err) => { console.log(JSON.stringify(err)); })

                // 新增行程
                connection.queryAsync(
                    "insert into Sche_location\
                 (favorite_sche_schedule_id,serialnum,\
                    originData,origin_Location,\
                    terminalData,end_Location,\
                    distance, duratuion)\
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

                    }
                )
            }
        )
    }
    // 如果沒有旅程id
    else {
        // 新增旅程
        connection.queryAsync(
            "insert into favorite_sche\
            (User_user_id, sche_name, update_time)\
            VALUES (?,?,?);"
            , [req.session.user_id, req.body.travelName, new Date()],
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
                            // 1,
                            req.session.user_id,
                            objArray[i].originData.placeId,
                            objArray[i].originData.placeName,
                            objArray[i].terminalData.placeId,
                            objArray[i].terminalData.placeName,
                            objArray[i].distance.text,
                            objArray[i].duration.text]
                    )
                }
                // console.log(DataArray);

                // 新增行程
                connection.queryAsync(
                    "insert into Sche_location\
                 (favorite_sche_schedule_id,serialnum,\
                    originData,origin_Location,\
                    terminalData,end_Location,\
                    distance, duratuion)\
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

                    }
                )
            }
        )
    }
}
);

module.exports = router;
