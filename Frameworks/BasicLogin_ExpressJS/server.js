var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var initializePass = require('./passportConfig');
var passport = require('passport');
var flash = require('express-flash');
var session = require('express-session');
var methodOverride = require('method-override');


var app = express();
var user = [];

initializePass(passport, 
    email=> user.find(user=> user.email === email),
    id=> user.find(user=> user.id === id)
);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(flash());
app.use(session({
    //js object with these properties
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));

app.get('/', isLoggedIn, (req,res)=>{
    res.render('index.ejs');
})

app.get('/login', isNotLoggedIn, (req,res)=>{
    res.render('login.ejs');
});

app.get('/register', isNotLoggedIn, (req,res)=>{
    res.render('register.ejs')
})

app.post('/register', async (req,res)=>{
    try{
        var hashedPass = await bcrypt.hash(req.body.password, 12);
        user.push({
            id:Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPass,
        });
        console.log(user);
        res.redirect('/login');
    }catch{
        res.redirect('/register');
    }
})

app.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash:true
}));

app.delete('/logout', (req,res)=>{
    req.logOut();
    res.redirect('/login');
})

app.listen(3000,function(){
    console.log('Listening on Port 3000');
});

function isLoggedIn(req,res,next){
      if(req.isAuthenticated()){
          return next();
      }
      res.redirect('/login');
}

function isNotLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return next();
}