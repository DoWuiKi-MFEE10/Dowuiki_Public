var login_render = function (req, res, next) {
    if(req.session.username) {
        next();
    } else {
        res.redirect('/member')
    }
}

var login_admin = function (req, res, next) {
    if(req.session.username && req.session.userstatus ==3) {
        next();
    } else {
        res.redirect('/member')
    }
}
var login_api = function (req, res, next) {
    if(req.session.username) {
        next();
    } else {
        res.json({
            "status": 3,
            "msg":"permission denied!"
        })
    }
}

module.exports = {
    login_render,
    login_api,
    login_admin
}