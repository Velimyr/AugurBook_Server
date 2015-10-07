
//Імпортуємо модулі і зчитуємо рядок підключення до БД
//var nconf = require('nconf');
var http = require('http');
var mongo = require('mongodb');
var htmlToText = require('html-to-text');
var iconv = require('iconv-lite');
var request = require('request');
var MongoClient = mongo.MongoClient, format = require('util').format;
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;


//nconf.env().file({ file: 'config.json' });
//var connectionString = nconf.get("MONGOLAB_URI");
var connectionString = 'mongodb://velimyr:qwert123@ds056727.mongolab.com:56727/AugurBook';

//var sleep = require('sleep');


//Ініціалізуємо клієнта БД (mongodb)
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient
MongoClient.connect(connectionString, function (err, db) {
    if (err) throw err;
    if (!err) {
        console.log("Connected to 'books' database");
        db.collection('books', { strict: true }, 
      function (err, collection) {
            if (err) {
                console.log("The 'books' collection doesn't exist.");
               // populateDB(db);
            }
        });
    }
})

//Реалізація функцій веб-сервісу
exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving pkg: ' + id);
    MongoClient.connect(connectionString, function (err, db) {
        if (err) { res.send({ status: '-1', text: err }); }        ;
        if (!err) {
            db.collection('books', function (err, collection) {
                collection.findOne({ '_id': new BSON.ObjectID(id) },
            function (err, item) {
                    //Отримання файла за url-адресою з БД                    
                    request({ uri: item.url, method: 'GET', encoding: 'binary' },
                    function (err, result, page) {
                        // Міняємо кодування тексту і видаляємо зайві html-теги 
                        var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                        var textArray = text.split(' ');
                        var PageCount = Math.round(textArray.length / 450);
                        //var PageCount = GetTextPageCount(text);
                        console.log(PageCount);
                        console.log('Array: ' + textArray.length);
                        res.send({ _id: item._id, id: item.id, name: item.name, author: item.author, url: item.url, pagecount: PageCount });
                    });                                                         
                });
            });
        }
    })
};

exports.findAll = function (req, res) {
    MongoClient.connect(connectionString, function (err, db) {
        if (err)  { res.send({ status: '-1', text: err }); };
        if (!err) {
            
            //setTimeout(function () {
            //    console.log('Blah blah blah blah extra-blah');

                db.collection('books', function (err, collection) {
                    collection.find().sort({author:1}).toArray(function (err, items) {
                        res.send(items);
                    });
                });

          //  }, 10000);

           
        }
    })
};
exports.addPkg = function (req, res) {
    var pkg = req.body;
    console.log('Adding pkgs: ' + JSON.stringify(pkg));
    MongoClient.connect(connectionString, function (err, db) {
        if (err) throw err;
        if (!err) {
            db.collection('books', function (err, collection) {
                collection.insert(pkg, { safe: true }, function (err, result) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred' });
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(result[0]);
                    }
                });
            });
        }
    })
};
exports.updatePkg = function (req, res) {
    var id = req.params.id;
    var pkg = req.body;
    console.log('Updating pkgs: ' + id);
    console.log(JSON.stringify(pkg));
    MongoClient.connect(connectionString, function (err, db) {
        if (err) throw err;
        if (!err) {
            db.collection('books', function (err, collection) {
                collection.update({ '_id': new BSON.ObjectID(id) },
          pkg, { safe: true }, function (err, result) {
                    if (err) {
                        console.log('Error updating pkg: ' + err);
                        res.send({ 'error': 'An error has occurred' });
                    } else {
                        console.log('' + result + ' document(s) updated');
                        res.send(pkg);
                    }
                });
            });
        }
    })
};
exports.deletePkg = function (req, res) {
    var id = req.params.id;
    console.log('Deletibg pkgs: ' + id);
    
    MongoClient.connect(connectionString, function (err, db) {
        if (err) throw err;
        if (!err) {
            db.collection('books', function (err, collection) {
                collection.remove({ '_id': new BSON.ObjectID(id) }
                , { safe: true }, function (err, result) {
                    if (err) {
                        console.log('Error deleting pkg: ' + err);
                        res.send({ 'error': 'An error has occurred' });
                    } else {
                        console.log('' + result + ' document(s) deleted');
                        res.send(req.body);
                    }
                });
            });
        }
    })
}

exports.getBookAugur = function (req, res) {
    var id = req.params.id;
    var page_id = req.params.page_id;
    var row_id = req.params.row_id;
    //Перевіряємо чи номер сторінки і рядка не менше 0
    if (page_id <= 0) { res.send({ status: '-3', text: 'Uncorrect page number' }); }
    if ((row_id <= 0) || (row_id>45)) { res.send({ status: '-4', text: 'Uncorrect row number' }); }

    console.log('Retrieving pkg: ' + id);       
    // Запит до БД на пошук запису по ідентифакатору
    MongoClient.connect(connectionString, function (err, db) {
        if (err) { res.send({status: '-1', text: err }); };
        if (!err) {            
            db.collection('books', function (err, collection) {
              collection.findOne({ '_id': new BSON.ObjectID(id) }, {fields:['url']},
                    function (err, item) {
                    var str = item.toString();
                    console.log('Text item: ' + item.url);
                    //Отримання файла за url-адресою з БД                    
                    request({ uri: item.url, method: 'GET', encoding: 'binary' },
                    function (err, result, page) {
                        // Міняємо кодування тексту і видаляємо зайві html-теги 
                        var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                        var substr = GetTextPart(text, page_id, row_id);
                        if (substr == null) { res.send({ status: '-2', text: 'Can`t get augur' }); }
                        //console.log('begin: ' + begin_len);
                        //console.log('end: ' + end_len);
                        console.log(substr);
                        res.send({status:'1', text: substr });
                    });                                      
                });                
            });
        }
    })    
};

//Функції для роботи з текстом

function GetTextPart(text, page_id, row_id) {
    //Розбиваємо текст на масив слів                        
    var textArray = text.split(' ');
    //Отримуємо кількість сторінок, перевіряємо чи введений номер сторінки не перевищує максимального
    var PageCount = Math.round(textArray.length / 450);
    if (page_id > PageCount) { return null; }

    //Визначаємо номер початкового слова і номер кінцевого слова
    var begin_word = 450 * (page_id - 1) + row_id * 10;
    var end_word = 450 * (page_id - 1) + row_id * 10 + 10;
   
    //Визначаємо позицію початкового слова і кінцевого слова
    var begin_len = 0;
    var end_len = 0;
    //!!!!
    for (var i = 0; i < begin_word; i++) {
        begin_len = begin_len + textArray[i].toString().length + 1;
    }
    //!!!!
    for (var i = 0; i < end_word; i++) {
        end_len = end_len + textArray[i].toString().length + 1;
    }
    //Перевіряємо чи початкова і кінцева позиції є початком\кінцем речення і якщо ні, зміщуємо їх на відповідні позиції
    if ((text.substring(begin_len, begin_len + 1) != '.') || (text.substring(begin_len, begin_len + 1) != '?') || (text.substring(begin_len, begin_len + 1) != '!')) {
        for (var i = begin_len; i > 0; i--) {
            if ((text.substring(i, i + 1) == '.') || (text.substring(i, i + 1) == '?')|| (text.substring(i, i + 1) == '!')) {
                begin_len = i;
                break;
            }
        }
    }
    if ((text.substring( begin_len+1, begin_len + 2) != '.') || (text.substring(begin_len + 1, begin_len + 2) != '?')|| (text.substring(begin_len + 1, begin_len + 2) != '!')){
        for (var i = begin_len+1; i < text.length; i++) {
            if ((text.substring(i, i + 1) == '.') || (text.substring(i, i + 1) == '?') || (text.substring(i, i + 1) == '!')) {
                end_len = i;
                break;
            }
        }
    }
    //Отримуємо частину тексту від початкового до кінцевого слова
    var substr = text.substring(begin_len + 1, end_len+1).trim();
    return substr;
}

//================================================================================
// Тестові функції:
//================================================================================


exports.EncodeText = function (req, res) {
    var id = req.params.id;
    var page_id = req.params.page_id;
    var row_id = req.params.row_id;
    console.log('Retrieving pkg: ' + id);
    
    //===========================================================
    // Запит до БД на пошук запису по ідентифакатору
    MongoClient.connect(connectionString, function (err, db) {
        if (err) { res.send({ status: 'Fail', text: err }); }        ;
        if (!err) {
            db.collection('books', function (err, collection) {
                collection.findOne({ '_id': new BSON.ObjectID(id) }, { fields: ['url'] },
                    function (err, item) {
                    
                    var str = item.toString();
                    console.log('Text item: ' + item.url);
                    //Отримання файла за url-адресою з БД                    
                    request({ uri: item.url, method: 'GET', encoding: 'binary' },
                    function (err, result, page) {
                        // Міняємо кодування тексту і видаляємо зайві html-теги 
                        var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                        var res_text = GetTextPart(text, page_id, row_id);                      
                        console.log(res_text);
                        res.send({ status: 'ok', text: res_text });
                    });
                });
            });
        }
    })
};


