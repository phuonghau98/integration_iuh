const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const hbs = require('express-handlebars')

app.set('view engine', 'hbs')
app.engine( 'hbs', hbs({
  extname: 'hbs',
  defaultView: 'default',
  layoutsDir: __dirname + '/views/layouts/'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('./public'))
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

const MAIL_DATA = [
  {
    _id: 'm0001',
    from: 'pdtao@iuh.edu.vn',
    title: 'V/v chuyển trường vào trường ĐH ABC, XYZ',
    content: 'Đơn xin chuyển trường của bạn đã được chấp thuận, bạn sẽ dược chuyển vào học vào ngày 20/03/2019',
    isDeleted: false
  },
  {
    _id: 'm0002',
    from: 'congtydienluc@vn.vn',
    title: 'V/v thanh toán hóa đơn tiền điện',
    content: 'Bạn đã đăng kí thành công hóa đơn mã số KHXZ20819, để nhận hóa đơn điện tử, truy cập http://hoa.don.dien.tu.vn',
    isDeleted: false
  },
  {
    _id: 'm0003',
    from: 'visa@dt.mofa.go.jp',
    title: 'Your Immigrant Visa Application to Japan have been approved',
    content: 'Congratulations on your approved application, hope you enjoy your life in our country',
    isDeleted: true
  }
]

function checkSignIn (req, res, next) {
  if (req.session.username === 'admin') {
    next()
  } else res.redirect('/login')
}

app.get('/unreads', checkSignIn, function (req, res) {
  const unreads = MAIL_DATA.filter(mail => (mail.isDeleted === false))
  res.render('unreads', {
    layout: 'default',
    fullName: req.session.fullName,
    mailData: unreads,
    unreadsCount: unreads.length,
    deletedCount: MAIL_DATA.length - unreads.length
  })
})

app.get('/login', function (req, res) {
  res.render('login', { layout: 'default' })
})

app.get('/reset', function (req, res) {
  MAIL_DATA.forEach((mail) => {
    mail.isDeleted = false
  })
  res.render('login', { layout: 'default' })
})

app.post('/login', function (req, res) {
  if (!req.body.username && !req.body.password) {
    res.render('login', { layout: 'default', message: 'Please enter both username and password' })
  } else if (!req.body.username) {
    res.render('login', { layout: 'default', message: 'Please enter username' })
  } else if (!req.body.password) {
    res.render('login', { layout: 'default', message: 'Please enter password' })
  } else if (req.body.username === 'admin' && req.body.password === '123') {
    req.session.fullName = 'Phương Hầu'
    req.session.username = 'admin'
    req.session.save()
    res.redirect('/unreads')
  } else {
    res.render('login', { layout: 'default', message: 'Invalid credentials!' })
  }
})

app.get('/trash', checkSignIn, (req, res) => {
  const unreads = MAIL_DATA.filter(mail => (mail.isDeleted === false))
  res.render('unreads', {
    layout: 'default',
    fullName: req.session.fullName,
    mailData: MAIL_DATA.filter(mail => (mail.isDeleted === true)),
    unreadsCount: unreads.length,
    deletedCount: MAIL_DATA.length - unreads.length
  })
})

app.post('/deleteMail', function (req, res) {
  if (req.body.deleteMail) {
    MAIL_DATA.forEach((mail, i) => {
      if (mail._id === req.body.deleteMail) {
        mail.isDeleted = true
      }
    })
  }
  res.redirect('/unreads')
})

app.use(checkSignIn)
app.listen(3000, () => console.log('Listening to port 3000...'))
