
//Імпортуємо модуль nconf і зчитуємо рядок підключення до БД
//var nconf = require('nconf');
http = require('http');

var request = require('request');
var htmlToText = require('html-to-text');
var iconv = require('iconv-lite');
//var requestsync = require('sync-request');


var item_url = "https://www.dropbox.com/s/usjbxoxunva1u9z/books2.txt?dl=1";

//Реалізація функцій веб-сервісу

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving pkg: ' + id);
    
    //Отримуємо файл із списком книг з сховища (Dropbox)   
    request({ uri: item_url, method: 'GET', encoding: 'binary', json: true }, 
                    function (err, result, page) {
        try {
            // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
            var str = JSON.stringify(page);
            var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
            var json = JSON.parse(BookList);
            var element = findElement(json, "_id", id); //Шукаємо в списку книг книгу з потрібним ідентифікатором
                       
            res.send(element);
         
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

//Тестова функція отртимання кількості сторінок у всіх книгах
//exports.GetPageCount = function (req, res) {
//    try {
//        var mode = req.params.mode; //Параметр mode показує чи використовувати оновлення для всіх книг (all) або містить ідентифікатор книги для якої треба отримати к-ть сторінок
//        //if (mode == 'all') {
//        //    res.send({status:1, msg:'test'});
//        //}
//        var rePattern = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/ig);
//        //Отримуємо файл із списком книг з сховища (Dropbox)   
//        request({ uri: item_url, method: 'GET', encoding: 'binary', json: true },
//                    function (err, result, page) {
//            // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
//            try {
//                var str = JSON.stringify(page);
//                var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
//                var json = JSON.parse(BookList);
                
//                if (mode == 'all') { //Якщо параметр mode = 'all' отримуємо к-ть сторінок для всіх книг
//                    var resultArray = [];
//                    var arrMatches = BookList.match(rePattern);
//                    //for (var match in arrMatches) {
//                    //    //====Отримуємо текст книги
//                    //    var resultBook = requestsync('GET', arrMatches[match]);
//                    //    var text = htmlToText.fromString(iconv.decode(new Buffer(resultBook.getBody(), 'binary'), 'win1251') , { wordwrap: 130 });
//                    //    //Знаходимо кількість сторінок в книзі
//                    //    var textArray = text.split(' ');
//                    //    var PageCount = Math.round(textArray.length / 450);
//                    //    resultArray.push({ url: arrMatches[match], pagecount: PageCount });
//                    //    console.log({ url: arrMatches[match], pagecount: PageCount });
//                    //}
//                    resultArray = GetAllBooksPageCount(arrMatches, resultArray, 0);
                    
//                    //res.send(resultArray);
//                }
//                else {
//                    //Тут буде код отримання к-ті сторінок для окремої книги
//                }
//            }
//            catch (ex) {
//                res.send({ status: '-1', text: ex });
//            }
//        });
//    }
//    catch (ex) {
//        res.send({ status: '-1', text: ex });
//    }
//};


//function GetAllBooksPageCount(LinkList, ResultArray, CurrentLinkID)
//{
//    if (LinkList.length >= CurrentLinkID) {
//        var CurrentLink = LinkList[CurrentLinkID];
        
//        request({ uri: CurrentLink, method: 'GET', encoding: 'binary', json: true },
//                    function (err, result, page) {
//            var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
//            var textArray = text.split(' ');
//            var PageCount = Math.round(textArray.length / 450);
//            ResultArray.push({ url: CurrentLink, pagecount: PageCount });
//            console.log({ url: CurrentLink, pagecount: PageCount });
//            GetAllBooksPageCount(LinkList, ResultArray, CurrentLinkID + 1);
//        });
//    }
//    else {
//        return ResultArray;
//    }                
//}


exports.GetBookPageCount = function (req, res) {
    var id = req.params.id;
    var lang = req.params.lang;
     if ((lang != 'ua') && (lang != 'ru') && (lang != 'en')) { res.send({ status: '-5', text: 'Uncorrect lang' }); }
    //Отримуємо список книг
    request({ uri: item_url, method: 'GET', encoding: 'binary', json: true },
            function (err, result, page) {
        var str = JSON.stringify(page);
        var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
        var json = JSON.parse(BookList);
        var element = findElement(json, "_id", id); //Шукаємо в списку книг книгу з потрібним ідентифікатором
        // Перебираємо список посилань на книгу з різними мовами і шукаємо потрібне посилання                
        var request_url = '';
        for (var i in element.langs) {          
            if (element.langs[i].locale == lang) {
                request_url = element.langs[i].url;
            }
        }
        //Якщо посилання на книгу порожнє (нема посилання з такою мовою книги)
        if (request_url == '') {
            res.send({ status: '-6', text: 'Uncorrect lang for this book' });
        }
        else {
            request({ uri: request_url, method: 'GET', encoding: 'binary', json: true },
                    function (err, result, page) {
                var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                var textArray = text.split(' ');
                var PageCount = Math.round(textArray.length / 450);
                
                console.log({ url: request_url, lang:lang, pagecount: PageCount });
                res.send({ url: request_url, lang: lang, pagecount: PageCount });
       
            });
        }
    });
}

exports.getBookAugur = function (req, res) {
    var id = req.params.id;
    var page_id = req.params.page_id;
    var row_id = req.params.row_id;
    var lang = req.params.lang; //lang - ua, ru, en
    //Перевіряємо чи номер сторінки і рядка не менше 0 і чи значення мови знаходиться в правильному діапазоні значень
    if (page_id <= 0) { res.send({ status: '-3', text: 'Uncorrect page number' }); }
    if ((row_id <= 0) || (row_id > 45)) { res.send({ status: '-4', text: 'Uncorrect row number' }); }
    if ((lang != 'ua') && (lang != 'ru') && (lang != 'en')) { res.send({ status: '-5', text: 'Uncorrect lang' }); }
    console.log('Retrieving pkg: ' + id);
    //Отримуємо файл із списком книг з сховища (Dropbox)   
    request({ uri: item_url, method: 'GET', encoding: 'binary', json: true },
                    function (err, result, page) {
        // Перетворюємо отриманий JSONArray в рядок,  міняємо кодування тексту і знову перетворюємо на JSONArray
        var str = JSON.stringify(page);
        var BookList = iconv.decode(new Buffer(str, 'binary'), 'win1251');
        var json = JSON.parse(BookList);
        var element = findElement(json, "_id", id); //Шукаємо в списку книг книгу з потрібним ідентифікатором
        console.log(element);
        // Перебираємо список посилань на книгу з різними мовами і шукаємо потрібне посилання                
        var request_url = '';
        for (var i in element.langs) {
            //var curent_lang_element = element.langs[i];
            //console.log(curent_lang_element);
            if (element.langs[i].locale == lang) {
                request_url = element.langs[i].url;
            }
        }
        //Якщо посилання на книгу порожнє (нема посилання з такою мовою книги)
        if (request_url == '')
        {
            res.send({ status: '-6', text: 'Uncorrect lang for this book' });
        }
        else {
                //Отримуємо текст книги
             request({ uri: request_url, method: 'GET', encoding: 'binary' },
             function (err, result, page) {
                // Міняємо кодування тексту і видаляємо зайві html-теги 
                var text = htmlToText.fromString(iconv.decode(new Buffer(page, 'binary'), 'win1251') , { wordwrap: 130 });
                var substr = GetTextPart(text, page_id, row_id); //Шукаємо пророцтво в книзі
                if (substr == null) { res.send({ status: '-2', text: 'Can`t get augur' }); }              
                console.log(substr);
                res.send({ status: '1', text: substr });

         });
        }
       
    });
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
