
//Імпортуємо модуль nconf і зчитуємо рядок підключення до БД
//var nconf = require('nconf');
http = require('http');

//var mongo = require('mongodb');
//var MongoClient = mongo.MongoClient, format = require('util').format;
//var Server = mongo.Server,
//    Db = mongo.Db,
//    BSON = mongo.BSONPure;

var request = require('request');
var htmlToText = require('html-to-text');
var iconv = require('iconv-lite');

//nconf.env().file({ file: 'config.json' });
//var connectionString = nconf.get("MONGOLAB_URI");

var item_url = "https://www.dropbox.com/s/d42jo5fq89t0517/books.txt?dl=1";

//Реалізація функцій веб-сервісу

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving pkg: ' + id);  
    
    //Отримуємо файл із списком книг з сховища (Dropbox)   
    request({ uri: item_url, method: 'GET', encoding: 'binary', json: true}, 
                    function (err, result, page) {
        try {
            // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
            var str = JSON.stringify(page);
            var BookList =iconv.decode(new Buffer(str, 'binary'), 'win1251');            
            var json = JSON.parse(BookList);
            var element = findElement(json, "_id", id); //Шукаємо в списку книг книгу з потрібним ідентифікатором
            
            //Робимо запит для отримання тексту книги                                
            request({ uri: element.url, method: 'GET', encoding: 'binary' },
                                function (err, result, page) {
                // Міняємо кодування тексту і видаляємо зайві html-теги 
                var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                //Знаходимо кількість сторінок в книзі
                var textArray = text.split(' ');                
                var PageCount = Math.round(textArray.length / 450);
                //Формуємо відповідь                
                res.send({ _id: element._id, id: element.id, name: element.name, author: element.author, url: element.url, pagecount: PageCount });
                     });    
              }
             catch (ex) {
                res.send({ status: '-1', text: ex }
            );
        }
         
    });         
};


function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];
}

exports.findAll = function (req, res) {
    try {
        //Отримуємо файл із списком книг з сховища (Dropbox)   
        request({ uri: item_url, method: 'GET', encoding: 'binary', json: true },
                    function (err, result, page) {
            // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
            try {
                var str = JSON.stringify(page);
                var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
                var json = JSON.parse(BookList);
                res.send(json);
            }
            catch (ex) {
                res.send({ status: '-1', text: ex }); 
            }            
        });
    }
    catch (ex) {
        res.send({ status: '-1', text: ex }); 
    }

            
};


exports.getBookAugur = function (req, res) {
    var id = req.params.id;
    var page_id = req.params.page_id;
    var row_id = req.params.row_id;
    //Перевіряємо чи номер сторінки і рядка не менше 0
    if (page_id <= 0) { res.send({ status: '-3', text: 'Uncorrect page number' }); }
    if ((row_id <= 0) || (row_id > 45)) { res.send({ status: '-4', text: 'Uncorrect row number' }); }    
    console.log('Retrieving pkg: ' + id);    
    //Отримуємо файл із списком книг з сховища (Dropbox)   
    request({ uri: item_url, method: 'GET', encoding: 'binary', json: true},
                    function (err, result, page) {
        // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
        var str = JSON.stringify(page);
        var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
        var json = JSON.parse(BookList);
        var element = findElement(json, "_id", id); //Шукаємо в списку книг книгу з потрібним ідентифікатором
        //
        request({ uri: element.url, method: 'GET', encoding: 'binary' },
                    function (err, result, page) {
            // Міняємо кодування тексту і видаляємо зайві html-теги 
            var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
            var substr = GetTextPart(text, page_id, row_id);
            if (substr == null) { res.send({ status: '-2', text: 'Can`t get augur' }); }
            //console.log('begin: ' + begin_len);
            //console.log('end: ' + end_len);
            console.log(substr);
            res.send({ status: '1', text: substr });
        });
    });

    //// Запит до БД на пошук запису по ідентифакатору
    //MongoClient.connect(connectionString, function (err, db) {
    //    if (err) { res.send({ status: '-1', text: err }); }        ;
    //    if (!err) {
    //        db.collection('books', function (err, collection) {
    //            collection.findOne({ '_id': new BSON.ObjectID(id) }, { fields: ['url'] },
    //                function (err, item) {
    //                var str = item.toString();
    //                console.log('Text item: ' + item.url);
    //                //Отримання файла за url-адресою з БД                    
    //                request({ uri: item.url, method: 'GET', encoding: 'binary' },
    //                function (err, result, page) {
    //                    // Міняємо кодування тексту і видаляємо зайві html-теги 
    //                    var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
    //                    var substr = GetTextPart(text, page_id, row_id);
    //                    if (substr == null) { res.send({ status: '-2', text: 'Can`t get augur' }); }
    //                    //console.log('begin: ' + begin_len);
    //                    //console.log('end: ' + end_len);
    //                    console.log(substr);
    //                    res.send({ status: '1', text: substr });
    //                });
    //            });
    //        });
    //    }
    //})
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
            if ((text.substring(i, i + 1) == '.') || (text.substring(i, i + 1) == '?') || (text.substring(i, i + 1) == '!')) {
                begin_len = i;
                break;
            }
        }
    }
    if ((text.substring(begin_len + 1, begin_len + 2) != '.') || (text.substring(begin_len + 1, begin_len + 2) != '?') || (text.substring(begin_len + 1, begin_len + 2) != '!')) {
        for (var i = begin_len + 1; i < text.length; i++) {
            if ((text.substring(i, i + 1) == '.') || (text.substring(i, i + 1) == '?') || (text.substring(i, i + 1) == '!')) {
                end_len = i;
                break;
            }
        }
    }
    //Отримуємо частину тексту від початкового до кінцевого слова
    var substr = text.substring(begin_len + 1, end_len + 1).trim();
    return substr;
}


exports.addPkg = function (req, res) {
    var pkg = req.body;
    console.log('Adding pkgs: ' + JSON.stringify(pkg));
    MongoClient.connect(connectionString, function (err, db) {
        if (err) throw err;
        if (!err) {
            db.collection('pkgs', function (err, collection) {
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
            db.collection('pkgs', function (err, collection) {
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

exports.deletePkg = function (req, res){
    var id = req.params.id;    
    console.log('Deletibg pkgs: ' + id);

    MongoClient.connect(connectionString, function (err, db) {
    if (err) throw err;
        if (!err) {
            db.collection('pkgs', function (err, collection) {
                collection.remove({ '_id': new BSON.ObjectID(id)}
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


// Заповнюємо клієнт данними 
var populateDB = function (db) {
    var body = "";
    var url = "http://storage.appsforazure.com/appsforazureobjectstest/servicepackages.json";
    http.get(url, function (res2) {
        res2.on('data', function (chunk) {
            body += chunk;
        });
        res2.on("end", function () {
            var pkgs = JSON.parse(body)
            db.collection('pkgs', function (err, collection) {
                collection.insert(pkgs, { safe: true }, function (err, result) { });
            });
        });
        res2.on("error", function (error) {
        // Здесь можно вести дальнейшее протоколирование
            console.log('My Error' + error);
        })
    });
    
 };