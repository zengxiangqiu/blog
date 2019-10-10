const express =require( 'express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article');
var sysRouter = require('./routes/system');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/doc', articleRouter);
app.use('/sys', sysRouter);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); 


app.use(express.static(path.join(__dirname, 'public')));

 
app.listen(port); 
