var express = require('express');
var router = express.Router();
var connection = require("../models/mysql");
var { login_render, login_api } = require('../models/loginCheck');
var moment = require('moment');
var multer = require('multer');
var mkdirp = require('mkdirp');
var uploadPath = 'public/upload/';
var myStorage = multer.diskStorage({
    destination: uploadPath
    ,
    filename: function (req, file, cb) {
        cb(null,
            (Date.now() + '').slice(0, 10) + '-' +
            file.originalname);
    }
})
const upload = multer({
    storage: myStorage,
});
mkdirp.sync(uploadPath);

/* 往文章首頁 */
router.get('/blogIndex', function (req, res, next) {
    res.render('article/blog-index');
});

//往文章內容頁 從這裡直接render到ejs
router.get('/blogPage/:id', function (req, res, next) {
    res.render('article/blog-page');

});

//如果前往文章內容頁沒有給id 會通往id=1
router.get('/blogPage', function (req, res, next) {
    res.redirect('/articlePage/blogPage/1');
})

//往發表頁
router.get('/apublishPage', function (req, res, next) {
    res.render('article/apublishPage');
});

//發表文章頁收到的資料處理
router.post('/apublishPage', upload.any(), function (req, res, next) {
    const userName = req.cookies.username
    if (!userName) {
        res.send('member');
    };
    const articleTitle = req.body.articleTitle;
    const publishTime = req.body.publishTime;
    const articleTags = req.body.articleTags;
    const narrative = req.body.narrative;
    const upimgFile = "/upload/" + req.files[0].filename;
    const siteName = req.body.siteName;
    const siteCountry = req.body.siteCountry;
    const siteCity = req.body.siteCity;
    const siteAddress = req.body.siteAddress;
    const placeId = req.body.placeId;
    const siteOpen = req.body.siteOpen;
    const siteClose = req.body.siteClose;
    const siteNote = req.body.siteNote;
    const summernote = req.body.editordata;

    //城市表單 如城市已存在不加 不存在則加
    connection.query('INSERT INTO city (city_name) SELECT * FROM (SELECT ?) AS tmp WHERE NOT EXISTS (SELECT city_name from city where city_name=?) LIMIT 1', [req.body.siteCity, req.body.siteCity, req.body.siteCity], function (err, rows) {
        if (err) {
            res.send(JSON.stringify(err) + "1");
        }
        //把城市id與userid選出來
        connection.query('SELECT u.user_id, u.username, c.city_name, c.city_id FROM user as u cross join city as c WHERE u.username=? && c.city_name=?', [userName, siteCity], function (err, data) {
            if (err) {
                res.send('發生錯誤');
                return false;
            }
            const userid = JSON.stringify(data[0].user_id);
            const siteCid = JSON.stringify(data[0].city_id);
            //把資料寫入表單
            connection.query("insert into article_info(title, tag, country, address, starttime, endtime, remarks, createtime, status, google_id, City_city_id, user_user_id, description, img_path, sitename, accuse_count, read_count, favorite_count) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [articleTitle, articleTags, siteCountry, siteAddress, siteOpen, siteClose, siteNote, publishTime, "1", placeId, siteCid, userid, narrative, upimgFile, siteName, "0", "0", "0"], function (err, data) {
                if (err) {
                    res.send(JSON.stringify(err) + '2');
                }
                //選出剛剛寫入的文章id
                connection.query('select article_id, title, createtime from article_info where title=? && createtime=?', [articleTitle, publishTime], function (err, data) {
                    if (err) {
                        res.send(JSON.stringify(err) + '3');
                    }
                    const artId = JSON.stringify(data[0].article_id);
                    // console.log(data[0].article_id);
                    //把summernote東西寫入artice_content表單
                    connection.query('insert into artice_content(article_info_article_id, content) values(?, ?)', [artId, summernote], function (err, succ) {
                        // 導向該文章頁
                        res.redirect(`/articlePage/blogPage/${artId}`)
                    })
                })
            })
        })
    });
})

//往搜尋結果頁
router.get('/asresultPage', function (req, res, next) {
    res.render('article/asresultPage');
});

//處理留言
router.post('/newcomment', function (req, res, next) {
    const comUser = req.cookies.username;
    if (!comUser) {
        res.send('member');
        return false;
    };
    const comMsg = req.body.message;
    const comTime = moment(req.body.create_time).format("YYYY-MM-DD HH:mm:ss");
    const comScore = req.body.star;
    const articleId = req.body.artId;
    // console.log(comUser);
    // console.log(comMsg);
    // console.log(comTime);
    // console.log(comScore);
    // console.log(articleId);
    connection.query('select user_id from user where username=?', [comUser], function (err, data) {
        const comUserId = data[0].user_id;
        connection.query('insert into comment(score, content, create_time, status, user_id, accuse_count, article_info_article_id) values(?,?,?,?,?,?,?)', [comScore, comMsg, comTime, "1", comUserId, "0", articleId], function (err, data) {
            res.send('success');
        })
    })
})

//處理收藏功能
router.post('/favorite', function (req, res, next) {
    // console.log(req.body);
    const curTime = moment(req.body.nowTime).format("YYYY-MM-DD HH:mm:ss");
    connection.query('select user_id from user where username = ?', req.body.userCookie, function (err, idData) {
        const uId = idData[0].user_id;
        connection.query('select * from favorite_art where user_user_id=? && article_info_article_id=?', [uId, req.body.aricleId], function (err, data) {
            if (data[0]) {
                res.send('已經收藏過了呦');
            } else {
                // console.log(uId)
                // console.log(curTime)
                // console.log(req.body.aricleId)
                connection.query('insert into favorite_art(user_user_id, update_time, article_info_article_id) values(?,?,?)', [uId, curTime, req.body.aricleId], function (err, succ) {
                    //該文章的收藏數+1
                    connection.query('update article_info set favorite_count=favorite_count+1 where article_id=?', req.body.aricleId, function (err, result) {
                        res.send('成功加入收藏');
                    })
                })
            }
        })

    })
})

//處理被檢舉文章
router.post('/accuseart', function (req, res, next) {
    const accuseTime = moment(req.body.nowTime).format("YYYY-MM-DD HH:mm:ss");
    console.log(req.body);
    connection.query('select user_id from user where username =?', req.body.userEmail, function (err, userdata) {
        console.log(userdata[0].user_id);
        const userId = userdata[0].user_id;
        connection.query('insert into accuse_art(article_info_article_id, user_id, accuse_reason_reason_id, update_time, reason_detail) values(?,?,?,?,?)', [req.body.articleId, userId, req.body.reason, accuseTime, req.body.megReason], function (err, data) {
            if (err) {
                res.send(JSON.stringify(err));
            } else {
                res.send('檢舉成功');
            }
        })
    })
})

module.exports = router;