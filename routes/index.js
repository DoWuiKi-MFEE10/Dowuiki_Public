var express = require('express');
var router = express.Router();
var connection = require('../models/mysql.js');
var moment = require('moment');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

//router在index.js裡(自己被自己騙)
router.post('/articlePage/searching', function (req, res) {
    var searchword = req.body.searchword;
    if (searchword === "") {
        res.json({ "status": 0, "message": "請輸入關鍵字OWO" })
    } else {
        // res.send(searchword);
        connection.query('select article_id, title, tag, country, address, remarks, description, createtime, nickname, google_id, city_name, img_path from (select * from article_info as ai JOIN city as c on ai.City_city_id=c.city_id) as new join user as u on new.User_user_id=u.user_id WHERE title LIKE ? or tag like ? or country like ? or description like ? or city_name like ?', [`%${req.body.searchword}%`, `%${req.body.searchword}%`, `%${req.body.searchword}%`, `%${req.body.searchword}%`, `%${req.body.searchword}%`], function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            } else if (JSON.stringify(rows) === "[]") {
                res.json({ "status": 1, "message": "查無結果" })
            } else {
                //更改所有日期形式
                rows.map(ob => rows[rows.indexOf(ob)]["createtime"] = moment(rows[rows.indexOf(ob)].createtime).format("YYYY-MM-DD HH:mm:ss"));
                res.send(JSON.stringify(rows));
            }

        })

    }
})


module.exports = router;