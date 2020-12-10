var express = require('express');
var router = express.Router();
var connection = require("../models/mysql");
var moment = require('moment');

// blog國內文章API
router.get('/domestic', function (req, res, next) {
    // console.log(req.params.country);
    //篩選status=1的文章 如檢舉成立status改為0 不會被選到
    connection.query('SELECT AVG(score) as avgscore, article_id, title, tag, country, address, remarks, description, createtime, read_count,city_name, img_path FROM (SELECT * from article_info as ai join city as c on ai.City_city_id=c.city_id where status=1)as new left JOIN comment as com on new.article_id=com.article_info_article_id WHERE country="台灣" group by article_id order BY createtime DESC limit 6', function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
        rows.map(ob => rows[rows.indexOf(ob)]["createtime"] = moment(rows[rows.indexOf(ob)].createtime).format("YYYY-MM-DD HH:mm:ss"));
        res.send(rows);
    })
});

// blog國外文章API
router.get('/foreign', function (req, res, next) {
    connection.query('SELECT AVG(score) as avgscore, article_id, title, tag, country, address, remarks, description, createtime, read_count,city_name, img_path FROM (SELECT * from article_info as ai join city as c on ai.City_city_id=c.city_id where status=1)as new left JOIN comment as com on new.article_id=com.article_info_article_id WHERE country not in ("台灣") group by article_id order BY createtime DESC limit 6', function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
        rows.map(ob => rows[rows.indexOf(ob)]["createtime"] = moment(rows[rows.indexOf(ob)].createtime).format("YYYY-MM-DD HH:mm:ss"));
        res.send(rows);
    })
});

//blog注目文章API
router.get('/watch', function (req, res, next) {
    // console.log(req.params.country);
    connection.query('SELECT AVG(score) as avgscore, article_id, title, tag, country, address, remarks, description, createtime, read_count,city_name, img_path FROM (SELECT * from article_info as ai join city as c on ai.City_city_id=c.city_id where status=1)as new left JOIN comment as com on new.article_id=com.article_info_article_id group by article_id order BY read_count DESC limit 6', function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
        rows.map(ob => rows[rows.indexOf(ob)]["createtime"] = moment(rows[rows.indexOf(ob)].createtime).format("YYYY-MM-DD HH:mm:ss"));
        res.send(rows);
    })
});

//blog收藏文章API
router.get('/favor', function (req, res, next) {
    // console.log(req.params.country);
    connection.query('SELECT AVG(score) as avgscore, article_id, title, tag, country, address, remarks, description, createtime, read_count,city_name, img_path, favorite_count FROM (SELECT * from article_info as ai join city as c on ai.City_city_id=c.city_id where status=1)as new left JOIN comment as com on new.article_id=com.article_info_article_id group by article_id order BY favorite_count DESC limit 6', function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
        rows.map(ob => rows[rows.indexOf(ob)]["createtime"] = moment(rows[rows.indexOf(ob)].createtime).format("YYYY-MM-DD HH:mm:ss"));
        res.send(rows);
    })
});

//文章內容頁API    1.文章資料 2.文章內容 3.標籤 4.留言
router.get('/article/:id', function (req, res, next) {
    connection.query('SELECT article_id, title, country, address, remarks, createtime, new.status, google_id, img_path, city_name, nickname, sitename, starttime, endtime, description FROM (SELECT * from article_info as ai join city as c on ai.City_city_id=c.city_id)as new join user as u on new.user_user_id=u.user_id where article_id=?', req.params.id, function (err, data) {
        // console.log(JSON.stringify(data[0].status));
        console.log(data);
        console.log(JSON.stringify(data));
        if (JSON.stringify(data) == "[]") {
            res.send('no data');
        } else if (JSON.stringify(data[0].status) == "0") {
            res.send('accused');
        } else {
            //把createtime的值改成要的格式
            let newCtime = moment(data[0].createtime).format("YYYY-MM-DD HH:mm:ss");
            //把日期跟時間分開
            data[0]["ctDate"] = newCtime.split(" ")[0];
            data[0]["ctTime"] = newCtime.split(" ")[1];
            //把tag單獨取出
            connection.query('select tag from article_info where article_id=?', req.params.id, function (err, tagOri) {
                var tagcollect = tagOri[0].tag.split('#');
                tagOri[0].tag = {};
                if (tagcollect[0] == "") {
                    for (var i = 1; i < tagcollect.length; i++) {
                        tagOri[0].tag[`tag${i}`] = tagcollect[i];
                    }
                } else {
                    tagOri[0].tag[`tag1`] = tagcollect[0];
                }
                //選取summernote內容
                connection.query('SELECT * FROM artice_content WHERE article_info_article_id=?', req.params.id, function (err, innercontent) {

                    // 選取留言
                    if (!innercontent[0]) {
                        innercontent[0] = {};
                        innercontent[0].article_info_article_id = req.params.id;
                        innercontent[0].content = "<p>目前沒有內容呦QAQ</p>"
                    }
                    connection.query('SELECT comment_id, score, content, cm.status, username, imgurl, cm.create_time, article_info_article_id FROM comment as cm Join user as us on cm.user_id=us.user_id where article_info_article_id=? order by cm.create_time', req.params.id, function (err, comment) {
                        //comment array中的每個object的creat_time值都被改成要的格式
                        // comment.map(ob => comment[comment.indexOf(ob)]["ctDate"] = moment(comment[comment.indexOf(ob)].create_time).format("YYYY-MM-DD HH:mm:ss").split(" ")[0])
                        // comment.map(ob => comment[comment.indexOf(ob)]["ctTime"] = moment(comment[comment.indexOf(ob)].create_time).format("YYYY-MM-DD HH:mm:ss").split(" ")[1])
                        const artwithcontent = data.concat(tagOri, innercontent);
                        if (!comment[0]) {
                            comment[0] = { "comment_id": '0', "score": '0', "content": "目前還沒有留言喔", "status": 1, "username": "無名氏@email.com", "imgurl": "/images/no_image.png", "create_time": "0000-00-00T00:00:00Z", "article_info_article_id": req.params.id };
                        }
                        //如果沒有照片 出現這是你大頭的照片
                        if (!comment[0].imgurl) {
                            comment[0].imgurl = "/images/no_image.png"
                        }
                        artwithcontent[3] = comment;
                        res.send(artwithcontent);

                    })
                })
            })
        }
    })
})

module.exports = router;