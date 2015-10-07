
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var pkgs = require('./routes/pkgs.js');
//var books = require('./routes/books.js'); //Поточний набір скриптів
var books2 = require('./routes/books2.js'); //Запасний набір скриптів (для версії API 3.0) 


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/books/V2', pkgs.findAll);
app.get('/books/V2/:id', pkgs.findById);
app.post('/books/V2', pkgs.addPkg);
app.put('/books/V2/:id', pkgs.updatePkg);
app.delete('/books/V2/:id', pkgs.deletePkg);
app.get('/books/V2/getaugur/:id&:page_id&:row_id', pkgs.getBookAugur);



//app.get('/books', books.findAll);
//app.get('/books/:id', books.findById);
//app.post('/books', books.addPkg);
//app.put('/books/:id', books.updatePkg);
//app.delete('/books/:id', books.deletePkg);
//app.get('/books/getbook/:id&:page_id&:row_id', books.getBookAugur);

//app.get('/encode/:id&:page_id&:row_id', books.EncodeText);

//===============================
// 09-2015 review
//===============================
app.get('/books/V3', books2.findAll);
app.get('/books/V3/:id', books2.findById);

app.get('/books/V3/getaugur/:id&:page_id&:row_id&:lang', books2.getBookAugur);


app.get('/books/V3/getpagecount/:id&:lang', books2.GetBookPageCount);

//==================================

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
