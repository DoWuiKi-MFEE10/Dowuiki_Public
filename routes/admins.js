var express = require('express');
var router = express.Router();
// 引用login 驗證物件
var { login_render, login_api,login_admin } = require('../models/loginCheck');
var connection = require('../models/mysql.js');
var moment = require("moment");

// 會員登入頁
router.get('/', login_admin, function (req, res, next) {
  res.render('admin/adminPage');
})


router.get('/memberadmin', login_admin, function (req, res, next) {
  res.render('admin/adminMember');
})

// 依會員狀態查詢(status 0:停權 1:正常) 
router.get('/memberadmin/status', function (req, res, next) {
  connection.query('SELECT user_id , username , create_time , self_intro\
  FROM user\
   WHERE status = ?', [req.query.status], (err, rows) => {
    //  console.log(rows);
    res.send(rows);
  })
})

// 依會員違規次數顯示需要管理的使用者資訊
router.get('/memberadmin/vio', function (req, res, next) {
  connection.query('SELECT user_id , username , vio_count , status\
  FROM user\
   WHERE vio_count >= ?', [5], (err, rows) => {
    //  console.log(rows);
    res.send(rows);
  })
})

// 取得違規留言 (暫不使用)
// (accuse_id, user_id, reason, update_time, comment_comment_id, comment_accuse_id)
router.get('/adminPage/comment', function (req, res, next) {
  connection.query('SELECT *\
   FROM accuse_comment', [],
    (err, rows) => {
      rows.map(data => {
        data.update_time = moment(data.update_time).format("YYYY-MM-DD HH:mm:ss");
      })
      res.send(rows)
    }
  )
})

// 改變留言狀態 (不使用)
router.put('/adminPage/comment/changeStatus', function (req, res, next) {
  connection.query('UPDATE accuse_comment\
  SET status = ?\
   WHERE comment_id = ?', [req.query.status, req.query.comment_id],
    (err, rows) => {
      //  console.log(rows);
      res.send(rows);
    })
})

// 取得違規文章 
// (	article_info_article_id, user_id, accuse_id, accuse_reason_reason_id, update_time, reason_detail)
router.get('/adminPage/article', function (req, res, next) {
  connection.query('SELECT *\
   FROM accuse_art', [],
    (err, rows) => {
      rows.map(data => {
        data.update_time = moment(data.update_time).format("YYYY-MM-DD HH:mm:ss");
      })

      res.send(rows)
    })
})

// STEP1. 改變文章狀態
router.put('/adminPage/changeStatus', function (req, res, next) {
  connection.query(('UPDATE article_info\
  SET status = ?\
   WHERE article_id = ?',
    [req.query.status, req.query.article_id],
    (err, rows) => {
      // STEP2. 刪除違規文章
      connection.queryAsync(
        'DELETE FROM accuse_art\
        WHERE accuse_id = ?', [req.query.accuse_id], (err) => {
        if (err) {
          console.log(err);
          return
        }
        if (req.query.status == 1) {
          res.send(rows);
          return
        }
        // STEP3. 搜尋被檢舉者Id
        connection.queryAsync(
          'SELECT aart.article_info_article_id, aif.user_user_id\
           from accuse_art as aart Join article_info as aif\
            on aart.article_info_article_id=aif.article_id\
             where article_id=?;'
          , [req.query.article_id]
          , (err, row) => {
            if (err) {
              console.log(err);
              return
            }
            console.log(row[0].user_user_id);
            // STEP4. 違規次數加一
            connection.queryAsync(
              'update user\
               set vio_count=vio_count+1\
                where user_id=?;'
              , [row[0].user_user_id]
              , (err, ans) => {
                if (err) {
                  console.log(err);
                  return
                }
                res.send(ans);
              }
            )
          }
        )
      })
    }))
})

// 更動所選文章狀態
router.put('/adminPage/changeAllStatus', function (req, res, next) {
  let selectedArray = JSON.parse(req.query.article_id);
  let accuseArray = JSON.parse(req.query.accuse_id);
  let userArray = [];
  // console.log(selectedArray);
  let sql = '';

  // 判斷是否是解除還是封鎖（最後結論都會是封鎖）
  if (req.query.status == 1) {
    sql = 'UPDATE article_info\
  SET status = 1\
   WHERE article_id = ?'

  } else if (req.query.status == 0) {
    sql = 'UPDATE article_info\
  SET status = 0\
   WHERE article_id = ?'
  } else {
    return
  }

  if (req.query.status == 0) {
    for (i = 0; i <= selectedArray.length - 1; i++) {
      connection.queryAsync(sql, [selectedArray[i]],
        (err, rows) => {
          if (err) {
            console.log(err)
            return
          }
        }
      )
      connection.queryAsync(
        'SELECT aart.article_info_article_id, aif.user_user_id\
         from accuse_art as aart Join article_info as aif\
          on aart.article_info_article_id=aif.article_id\
           where article_id=?;'
        , [selectedArray[i]]
        , (err, rows) => {
          if (err) {
            console.log(err);
            return
          }
          connection.queryAsync(
            'update user\
             set vio_count=vio_count+1\
              where user_id=?;'
            , [rows[0].user_user_id]
            , (err) => {
              if (err) {
                console.log(err);
                return
              }
            }
          )
        }
      )
    }
  }
  for (i = 0; i <= accuseArray.length - 1; i++) {
    connection.queryAsync(
      'DELETE FROM accuse_art\
      WHERE accuse_id = ?', [accuseArray[i]], (err) => {
      if (err) {
        console.log(err);
        return
      }
    })
  }
  res.send('OK');
}
)


// 更動會員狀態
router.put('/memberadmin/changeStatus', function (req, res, next) {
  let sql = '';

  // 判斷是否需要重置違規次數
  if (req.query.status == 1) {
    sql = 'UPDATE user\
  SET status = ?, vio_count = 0\
   WHERE user_id = ?'

  } else if (req.query.status == 0) {
    sql = 'UPDATE user\
  SET status = ?\
   WHERE user_id = ?'
  } else {
    return
  }

  connection.query(sql, [req.query.status, req.query.user_id],
    (err, rows) => {
      //  console.log(rows);
      res.send(rows);
    })
})

// 更動所有會員狀態
router.put('/memberadmin/changeAllStatus', function (req, res, next) {
  let selectedArray = JSON.parse(req.query.users_id);
  // console.log(selectedArray);
  let sql = '';

  // 判斷是否需要重置違規次數
  if (req.query.status == 1) {
    sql = 'UPDATE user\
  SET status = 1, vio_count = 0\
   WHERE user_id = ?'

  } else if (req.query.status == 0) {
    sql = 'UPDATE user\
  SET status = 0\
   WHERE user_id = ?'
  } else {
    return
  }

  for (i = 0; i <= selectedArray.length - 1; i++) {
    connection.queryAsync(sql, [selectedArray[i]],
      (err, rows) => {
        if (err) {
          console.log(err)
          return
        }
      })
  }
  res.send('OK');
})



module.exports = router  