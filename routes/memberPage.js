var express = require('express');
var router = express.Router();
var moment = require("moment");
var nodemailer = require("nodemailer");
// 引用login 驗證物件
var {login_render,login_api} = require('../models/loginCheck');
var connection = require('../models/mysql.js');
// 引用multer進行檔案上傳
var multer = require('multer');
var mkdirp = require('mkdirp');
// 設定檔案(圖片)上傳目錄
var uploadPath = 'public/memberImg/';
var myStorage = multer.diskStorage({
   // 當目錄未產生時自動產生該目錄
   destination: uploadPath,
   //  設定檔名
   filename: function (req, file, cb) {
      let username = req.session.username;
      // 使用者帳號是信箱，把@前面的字串取出
      let newname = username.substring(username.indexOf('@'), -1)
      cb(null,
         (Date.now() + '').slice(0, 10) + '-' +
         newname + ".png");
   }
})
// 設定上傳的config
const upload = multer({
   // destination: uploadPath
   storage: myStorage
});
mkdirp.sync(uploadPath);

// 把前端上傳的圖片傳來後端寫進資料庫
router.post('/memberPage', upload.any(), function (req, res, next) {
   const username = req.session.username;
   if (req.files[0]==undefined) {
      // 如果沒有上傳圖片就直接送出表單則重新整理該頁面
      res.redirect(req.get('referer'));
   } else {
      // 設定寫入資料庫的圖片路徑名稱
      const upimgFile = "/memberImg/" + req.files[0].filename;

      connection.query(' INSERT INTO user_img (id, imgurl, user_id) VALUES (?,?,?)', ['', upimgFile, req.session.user_id], function (error, data) {
         if (error) {
            res.json({
               "status": 0,
               "msg": "上傳失敗"

            })
         } else {
            // 上傳成功後重新整理該頁面
            res.redirect(req.get('referer'));
         }
      })
   }
})

// 進入該會員頁面時讀取大頭貼
router.get('/memberPage/getImg', function (req, res, next) {
   // console.log("session id => " + req.session.user_id);
   // 根據session id取得該會員資料然後取最新的一筆
   connection.query('select * from user_img where user_id =? order by id desc limit 1', [req.session.user_id], function (error, data) {
      if (error) {
         res.json({
            "status": 0,
            "msg": "查詢失敗"
         })
      } else {
         // 成功的話把路徑告訴前端頁面
         res.json({
            "status": 1,
            "msg": "大頭貼查詢成功",
            "info": data
         })
      }
   })
})
// 會員登入頁
 router.get('/',function (req,res,next) {   
   res.render('member/loginPage');
 })
// 登入驗證
router.post('/login',function(req,res){
   let userName = req.body.username;
   let passWord = req.body.password;
   connection.query('select * from user where username = ? and password = ?',[req.body.username,req.body.password],function(error,data){
      // 將輸入條件放入sql，若db查出來有值代表OK
      if(data[0] == null){
         res.json({"msg":"帳號密碼錯誤"})
        
      }else if(data[0].status == 0 ){
         res.json({"status":0,"msg":"此帳號已停權"});
      }else if(data[0].status == 3){
         console.log(data[0]);
         req.session.user_id = data[0].user_id;
         req.session.username = req.body.username;
         req.session.userstatus = data[0].status;
         res.json({
            "status":3,
            "msg":"歡迎管理者登入",
            // "data":data
         });
      }else{
         // 登入成功，寫入cookie
         res.cookie("username",req.body.username,{maxAge:18000000});
         if(req.session.views){
            req.session.views++
         }else{
            req.session.views = 1
            console.log('您是第一次訪問!')
         }
         // 登入成功，把session_id、session_username寫入，data[0] = 該筆資料
         req.session.user_id = data[0].user_id;
         req.session.username = req.body.username;
         req.session.userstatus = data[0].status;
         res.json({"status":1,"msg":"登入成功","loginCount":req.session.views});
         
      }
   })
})
// 註冊帳號頁面
router.post('/register',function (req,res) { 
   let userName = req.body.username;
   let passWord = req.body.password;
   let nickName = req.body.nickname;
   connection.query("select * from user where username =?",[req.body.username],function(error,data){
      if(data[0] != null){
         res.json({"status":0,"msg":"帳號已存在"});
      }
      else{       
         // insert 語法
         let sql = "INSERT INTO user \
         (user_id, username, password, nickname, self_intro, coin, \
            create_time, update_time, imgurl, status,vio_count) \
            VALUES (?,?,?,?,?,?,?,?,?,?,?)"; 
         // 取當下時間，並組成所需的時間格式 yyyy-mm-dd HH:MM:SS
         let d = new Date();
         let dateTime =d.getFullYear()+"-"+parseInt(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();      
         
         // 輸入欄位資料
         let insertData = ['',userName,passWord,nickName,'','',dateTime,'','',1,'']   
         connection.query(sql,insertData,function(error,result){
            if(error){
               res.json({"status":2,"msg":"新增失敗"})
            }
         })
         res.json({"status":1,"msg":"註冊成功"});
      }   
   })
 })

// 會員登出
 router.get('/logout',function(req,res){
      //清掉session、cookie username
      req.session.destroy();
      res.clearCookie("username");
      res.json({'msg':"已登出"});
 })
// 測試頁
router.get('/loginTest',function(req,res,next){
   res.render("member/loginTest",{sessionName:req.session.username});
})

//忘記密碼
router.get('/pwdSend/:username',function(req,res,next){
   let userEmail = req.params.username
   // console.log(userEmail);
   connection.query("select * from user where username = ?",[userEmail],function(error,data){
      if(error || data[0] == "" || !data[0] || data[0]==null){
         res.json({
            "status":0,
            "msg":"查無此帳號資料!"
         })
      }else{
         // 設定發信帳號
         var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "Dowuiki@gmail.com", 
                pass: "dowuiki@1130" 
            }
        });
      //   設定信件內容
        var mailOptions = {
            from: "Dowuiki@gmail.com", 
            to: userEmail,
            subject: "忘記密碼信件 : " , 
            html: `<h1>親愛的${userEmail}你好:</h1> 
                        <p>感謝使用Dowuiki系統，以下是你的密碼:</p>
                        <p>${data[0].password}</p>`
        };
      //  信件寄出
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log("訊息發送: " + info.response);
            }
        });
      
        res.json({
           "status":1,
           "msg":"密碼信件已寄出"
        })
      }

   })
})

// 會員資料，並使用login_render驗證session
 router.get('/memberPage',login_render,function (req,res,next) { 
   res.render('member/memberPage',{sessionName:req.session.username});
})
// 登入後進到會員頁取得該會員資料
 router.get("/memberPage/user",function(req,res,next){
   connection.query('select * from user where username = ?',[req.session.username],function(error,data){
      if(error){
         res.json(error);
      }
      else{
         res.json({
            username:data[0].username,
            password:data[0].password,
            nickname:data[0].nickname,
            self_intro:data[0].self_intro,
         })
      }      
   })
 })
// 會員頁更新暱稱，成功的話回傳update success
router.put('/memberPage/updateNickname',function(req,res){
   if(req.body.newNickname){
      connection.query("update user set nickname =? where username = ?",[req.body.newNickname,req.session.username],function(error,data){
         if(error){
            res.json({"msg":"更新失敗"});
         }else{
            console.log(data[0])
            res.json({
               "msg":"暱稱更新!",
               // "newNickname":data[0].nickname
            })
         }
      })
   }else{
      res.json({
         "msg":"欄位為空"
      })
   }
})
// 會員更新密碼
router.put('/memberPage/updatePwd',function(req,res){
   // if(req.body){
   connection.query("select * from user where password =? and username = ?",[req.body.oldPassword,req.session.username],function(error,data){
      if(data[0] != null && data[0] !="" && data[0] != undefined){
         console.log(data[0]);
         // 檢查密碼
         // console.log("check params => " + req.session.username);
         // console.log("old password => "+req.body.oldPassword);
         // console.log("new password => "+req.body.newPassword);   
         // res.json({"msg":"Get Data"});     
         connection.query("update user set password =? where username = ?",[req.body.newPassword,req.session.username],function(error,data){
            if(error){
               res.json({
                  "msg":"更新密碼失敗"
               })
            }else{
               res.json({
                  "status":1,
                  "msg":"更新密碼成功"
               })
            }
         })
      }
      else{
        res.json({
           "status":0,
           "msg":"舊密碼輸入錯誤"
         });
      }
   })

})
// 更新自介
router.put('/memberPage/updateIntro',function(req,res){
   // console.log(req.body.data);
   connection.query("update user set self_intro =? where username = ?",[req.body.data,req.session.username],function(error,data){
      res.json({"msg":"自介更新囉!"});
   })   
})

// 會員文章
 router.get('/memberArticles',login_render,function (req,res,next) { 
    res.render('member/memberArticlePage',{sessionName:req.session.username})
 })
// 會員發表文章列表
 router.get('/memberArticle/info',function(req,res){
    let sql =
    "SELECT \
    article_id, \
    title, \
    createtime, \
    status, \
    accuse_count, \
    read_count, \
    description, \
    img_path, \
    sitename \
    FROM article_info \
    where user_user_id = ? \
    order by createtime desc"
    connection.query(sql,[req.session.user_id],function(error,data){
       if(error){
          res.json({
             "msg":"查詢失敗"});
       }else{
          data.map(rows=>{
             rows.createtime = moment(rows.createtime).format('YYYY-MM-DD HH:mm:ss')
          })
          res.json({
            "status":1,
            "info":data
         })
       }
     
    })
 })
//刪除會員文章
router.delete('/memberArticle/delArt',function(req,res,next){
   // console.log(req.body.schId)
   // 先刪除artice_content這張表所指定資料
   connection.query('delete from artice_content where article_info_article_id = ?',[req.body.artId],function(error,data){
      // 再刪除旅article_info指定的旅程資料
      connection.query('delete from article_info where article_id =?',[req.body.artId],function(error,data){
         if(error){
            res.json({"msg":"delete artice_content failed"})
         }
      })
      if(error){
         res.json({"msg":"delete article_info failed"})
      }
   })
   res.json({"msg":"delete success !"})
})

router.get('/memberFavArticle',function (req,res,next) { 
   res.render("member/memberFavArticle")
 })


// 讀取收藏文章
router.get('/memberArticle/favinfo',function(req,res){
  let sql =
  "SELECT \
  favorite_art.user_user_id, \
  favorite_art.update_time, \
  favorite_art.article_info_article_id, \
  article_info.title, \
  article_info.tag, \
  article_info.status, \
  article_info.description, \
  article_info.img_path, \
  article_info.sitename \
  FROM favorite_art  \
  left join article_info \
  on favorite_art.article_info_article_id = article_info.article_id \
  where favorite_art.user_user_id = ? \
  order by favorite_art.update_time"
  
   connection.query(sql,[req.session.user_id],function(error,data){
      if(error){
         res.json({
            "msg":"query failed!"
         })
      }
      else{
         res.json({
            "status":1,
            "msg":"getData",
            "info":data
         })
      }
   })
})

// 取消收藏
router.delete('/memberArticle/delFavArt',function(req,res,next){
   // console.log(req.body.artId)
   
   connection.query('delete from favorite_art where user_user_id = ? and article_info_article_id =?',[req.session.user_id,req.body.artId],function(error,data){
      
      if(error){
         res.json({"msg":"delete article_info failed"})
      }
   })
   res.json({"msg":"delete success !"})
})




 // 會員旅程收藏
 router.get('/memberSchedules',login_render,function (req,res,next) { 

    res.render('member/memberSchedulePage',{sessionName:req.session.username})
 })

// 顯示會員旅程資料，sql利用group_concat 把同個旅程不同行程的欄位資料合併在一起
 router.get('/memberSchedules/schid',function(req,res,next){
    let sql = "SELECT \
    favorite_sche.schedule_id,\
    favorite_sche.sche_name,\
    favorite_sche.update_time,\
    GROUP_CONCAT(concat(sche_location.origin_Location,'-',sche_location.end_Location))  as 'travelInfo'\
    FROM favorite_sche \
    left join sche_location on favorite_sche.schedule_id = sche_location.favorite_sche_schedule_id \
    WHERE favorite_sche.user_user_id = ? \
    GROUP by	favorite_sche.schedule_id \
    order by favorite_sche.schedule_id,sche_location.Sche_location_id desc"
   // 查db資料
    connection.query(sql,[req.session.user_id],function(error,data){
       if(error){
          console.log(error);
          res.json({"msg":"查詢失敗"});
       }
       else{   
         //  資料時間轉換，利用moment函數轉換UTC到指定格式
         data.map(rows=>{
            rows.update_time = moment(rows.update_time).format("YYYY-MM-DD HH:mm:ss");
            // rows.create_time = moment(rows.create_time).format("YYYY-MM-DD HH:mm:ss");
        
         })
         // console.log(data)
          res.json({
            "msg":"getData",    
            "data":data
         });
       }
    })
 })

 // - *會員讀取旅程
router.get('/:userName', login_render,function (req, res, next) {
   connection.query(
       'select *\
        from favorite_sche\
         where user_user_id = ?',
       [

           req.session.user_id
       ],
       function (err, rows) {
           if (err) {
               console.log(JSON.stringify(err));
               return;
           }
           // rows = JSON.parse(JSON.stringify(rows));
           // console.log(rows);
           // 放到旅程列表上....
       }
   );
   // res.send(`${JSON.stringify(req.params)} - ${JSON.stringify(req.query)}`); //?name=10 return 10;
})

//刪除旅程、行程
router.delete('/memberSchedules/delSch',function(req,res,next){
   // console.log(req.body.schId)
   // 先刪除行程(sche_location)這張表所指定schId(旅程編號)的資料
   connection.query('delete from sche_location where favorite_sche_schedule_id = ?',[req.body.scheId],function(error,data){
      // 再刪除旅程(favorite_sche)這張表指定的旅程資料
      connection.query('delete from favorite_sche where schedule_id =?',[req.body.scheId],function(error,data){
         if(error){
            res.json({"msg":"delete favorite_sche failed"})
         }
      })
      if(error){
         res.json({"msg":"delete sche_location failed"})
      }
   })
   res.json({"msg":"delete success !"})
})
// 測試API
// router.get('/user/:username/:scheId',function(req,res,next){
//    user = req.params.username;
//    scheId = req.params.scheId;
//    console.log("data => " + " "+user)
//    res.json({
//       "msg":"getData",
//       "username":user,
//       "scheId":scheId
//    }) 
// })




 module.exports = router;