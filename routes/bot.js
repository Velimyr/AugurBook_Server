var TelegramBot = require('node-telegram-bot-api');
//var token = '160583204:AAFq3l4ic23SXINaUSUN3R9Q25mOi7XYZPQ'; //test
var token = '138332427:AAFS2xZQBaUVgIZKCGKkc99OJ_dBMIZm4PE'; //work
var bot = new TelegramBot(token, { polling: true }); // poling version
//Наразі працює polling-версія боту, webHook- версія не працює


//=====================
//web hook version
//var options = {
//    webHook: true
//        //port: 443,
//        //key: __dirname + '/cert/AugurBook.crt',
//        //cert: __dirname + '/cert/AugurBook_PEM.cer'
    
//};

//var cert = '-----BEGIN CERTIFICATE-----^M' +
//'MIIDGTCCAgGgAwIBAgIQVqeKpdsSb6pFSkpvGbh1NjANBgkqhkiG9w0BAQsFADAv ^ M' +
//'MS0wKwYDVQQDDCRodHRwczovL2F1Z3VyYm9vay5henVyZXdlYnNpdGVzLm5ldC8w ^ M' +
//'HhcNMTYwMzEzMDkxNDI5WhcNMTcwMzEzMDkzNDI5WjAvMS0wKwYDVQQDDCRodHRw ^ M' +
//'czovL2F1Z3VyYm9vay5henVyZXdlYnNpdGVzLm5ldC8wggEiMA0GCSqGSIb3DQEB ^ M' +
//'AQUAA4IBDwAwggEKAoIBAQCtGFee2IWV7Puoi6BP8ih6jeWE0Z8ku2L68a4a5WuJ ^ M' +
//'qEs94BUocW1YUCuOcanh4QZUf96l7aO / TkYp0 / V98kmOBieoLB8//mUlyKJ1aiJH^M' +
//'dmpNadBEYvwGnliZSmEToZfi5seeKCxTP + nvHL0JZec9qpnP8DBA9PGOoUWlTIih ^ M' +
//'T48mI0pCGNj18byI4hHWWlh466LNj/V9wAS/ZOnpXfP0fhvmdbScKqE1RR8bxd5d^M' +
//'3W9K + awSLz6HgVe7yqVeTdVWJOxGJeCNRFlJOCmMxhsSA5JW8Zj3hO6MayRfJtmp ^ M' +
//'DKdAkhyF3 + hjHQnBZoOzs3CB / h00Bx0Z0eNl0u8m81MRAgMBAAGjMTAvMB0GA1Ud ^ M' +
//'DgQWBBRiUHCtLHII8Tfit7EDbDlwxdJIdTAOBgNVHQ8BAf8EBAMCB4AwDQYJKoZI ^ M' +
//'hvcNAQELBQADggEBADiIsk6DC20zyQEseqgv/F0gXygb0Z01N2Xjvnbd9fHaln5F^M' +
//'26U3ueFq2 + 5j2efb34Dov8namjUuZL0nPLe3zINzqSFW15pMutRa / pDWyYwOQ5Zm ^ M' +
//'lUetuKpJ68TZulpKFtKBBh5Q94huQeMTwvT800ORqRYnMMeUG86tjRiBIn1 / gK6P ^ M' +
//'fBkCf9aYENfJhDTQ7 / nkmiRK0dCu / yASoQDJ0hiIuWomQpLvjmux2XsrcP3H8SpN ^ M' +
//'DCP6+GTacSy4qbcKB421z/5z4WAlipfRWDGp6bbFBY78lE3qyDDrhQCN+9nAu9tA^M' +
//'2Wd3u+VXcDH1dEWCjrjt+DGT+MyhKn5afR5F5jM=^M'+
//'-----END CERTIFICATE-----^M';

//var webhook_url = "https://augurbook.azurewebsites.net/bot/msg";
//var bot = new TelegramBot(token, options); // web hook version
//bot.setWebHook(webhook_url, cert);

//======================
//OPENSHIFT Version

//var port = process.env.OPENSHIFT_NODEJS_PORT;
//var host = process.env.OPENSHIFT_NODEJS_IP;
//var domain = process.env.OPENSHIFT_APP_DNS;

//var bot = new TelegramBot(token, { webHook: { port: port, host: host } });
//// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
//bot.setWebHook(domain + ':443/bot/msg' + token);

//===========================


var request = require("request");
var global_name = "";
var global_author = "";

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
//========================================
bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.username;
    messageText = messageText.replace("@AugurBookBot", "");
    switch (messageText) {
        case '/booklist': {
            request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
                var answer = "";
                var json = JSON.parse(body);
                console.log(body);
                for (var i in json) {
                    answer = answer + (parseInt(i) + 1).toString() + '. ' + json[i].langs[0].name + " (" + json[i].langs[0].author + ')\r\n';
                }
                bot.sendMessage(chatId, answer, { caption: "I'm a Velimyr's bot!" });
               // res.send({ "answer": answer });
            });
            break;
        }
        case '/random':
            {
                request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
                    var json = JSON.parse(body);
                    var rand = randomIntInc(1, json.length);
                    var rand_page = randomIntInc(1, json[rand].langs[0].pagecount);
                    var rand_row = randomIntInc(1, 45);
                    global_name = json[rand].langs[0].name;
                    global_author = json[rand].langs[0].author;
                    var augurrequst = "http://augurbook.azurewebsites.net/books/v3/getaugur/" + json[rand]._id + '&' + rand_page + '&' + rand_row + '&' + json[rand].langs[0].locale;
                    console.log(augurrequst);
                    request(augurrequst, function (error, response, body) {
                        bot.sendMessage(chatId, "Авгур каже: \r\n\r\n " + '"' + JSON.parse(body).text + '"' + "\r\n\r\n " + global_name + "  (" + global_author + ')' , { caption: "I'm a Velimyr's bot!" });
                      //  res.send({ "answer": answer });
                    });
                });
                
                break;
            }
        default:
            {
                bot.sendMessage(chatId, "Для того щоб отримати пророцтво - наберіть команду /random \r\n Для перегляд списку книг, по яких робить пророцтва Авгур наберіть - /booklist \r\n \r\n Побажання і пропозиції присилайте на velimyr@gmail.com", { caption: "I'm a Velimyr's bot!" });
               // res.send({ "answer": answer });
                break;
            }
    }
    console.log(msg);
});



//========================================
exports.setWebHook = function (req, res) {
    bot.setWebHook("https://augurbook.azurewebsites.net/bot/msg", "LS0tLS1CRUdJTiBORVcgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tDQpNSUlESFRD    Q0FnV2dBd0lCQWdJUUdRSERWcmZPSG9SSnJlSjJNbDgwaVRBTkJna3Foa2lHOXcw    QkFRc0ZBREF4DQpNUzh3TFFZRFZRUUREQ1pvZEhSd09pOHZZWFZuZFhKaWIyOXJZ    bTkwTG1GNmRYSmxkMlZpYzJsMFpYTXVibVYwDQpMekFlRncweE5qQXhNak13T0RN    eU1ETmFGdzB4TnpBeE1qTXdPRFV5TUROYU1ERXhMekF0QmdOVkJBTU1KbWgwDQpk    SEE2THk5aGRXZDFjbUp2YjJ0aWIzUXVZWHAxY21WM1pXSnphWFJsY3k1dVpYUXZN    SUlCSWpBTkJna3Foa2lHDQo5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBMXpN    YVpQZXhQcUFrV2lJNndncjlLTlBDYTV2a05sQ3FOK3ljDQptcDJlbVdhSzhwa3E4    ZTh2NDd4U0VOcUN3aWZtREpyUVZQQzlZV1drVThtZCtYcFQ4WXJOTkF4WjRwbkE0    OXI3DQo0Z0V1eS9MdVZnOEJ0eThFenFjTXBzV3lpMFhreWt4djZMTTdpUDR2KzhZ    RTNZejZmdnRQMk91Wm9vclZTWTFHDQoxZ1JkQ0VsNTFjOGs2MmkxY1g3TVova3Yv    QjM3WDhKVTNlOWExVkw3UllZTlZ6ajV2dXVLNW5VS0VLTDVVc1FrDQo2dGpGY3J0    YzhmL28vYmhKVVA1Si9IMHJCclZDYU9lNW1PTmlncEIzVmhOOEs3WTNHT25aK28y    SVdqdnpaS1ZuDQpqMnQ1MGFLRzJEYmp3YWpXR3pBeERTNHJHTG04NlQxaXVzRDc1    T1NuamNncFJWOGZmUUlEQVFBQm96RXdMekFkDQpCZ05WSFE0RUZnUVVqOGg4QzNu    Vkc0L0c4VDhXSWgxVlF5R2JOdWN3RGdZRFZSMFBBUUgvQkFRREFnZUFNQTBHDQpD    U3FHU0liM0RRRUJDd1VBQTRJQkFRQ1lkVmlIY3hYLzVXQzhQVk9jTEQva2ZZNExR    Q0FoRnliamxsb29ZblB3DQplUGNjZEdnNmFnNDFVblMyUVNHYW9udUk2Sy90Q3pi    Vmo3NFBVSE9rWGRLRDJRaE0xTnZPNTdZSkZmaTRqL3dGDQp6V0daVTVkbC9vZVVE    ZTZZOWFQWVNvUVpzQ1ltUGs0N25wTEhBTDJlcnREV1ZiamkxNXJDc3ViSGtUd3Zr    RU81DQpaU2ttRXhNS3RYRTlscW5zNzB0TXkzb0w3d0pVN0EweTVPcXh2N0pVWkVh    dStUQThyODNWaDdDQXJEYUREVE55DQprUkVEYVJNYnRrZ09YVldwUHZ6cUJsbjI0    RUFieEY1YzRDblVWZmh3OEhObFpLS1laUGFka0VsL1phck1JU281DQphVXBkcDh0    TkpXczVzSlpNMkxTeFBNWkt5Q1RJS3ZoZzNFYUcrM3NXZUFQcA0KLS0tLS1FTkQg    TkVXIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLQ0K");
    res.send({ "command": "SetUp webHook" });
};

exports.deleteWebHook = function (req, res) {
    bot.setWebHook("");
    res.send({ "command": "Delete webHook" });
};

exports.getMessages = function (req, res) {    
    //bot.on('message', function (msg) {
    //    var chatId = msg.chat.id;
    //    var messageText = msg.text;
    //    var messageDate = msg.date;
    //    var messageUsr = msg.from.username;        
    //    messageText = messageText.replace("@AugurBookBot", "");
    //    switch (messageText) {
    //        case '/booklist': {
    //            request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
    //                var answer = "";
    //                var json = JSON.parse(body);
    //                console.log(body);
    //                for (var i in json) {
    //                    answer = answer + (parseInt(i) + 1).toString() + '. ' + json[i].langs[0].name + " (" + json[i].langs[0].author + ')\r\n';
    //                }
    //                bot.sendMessage(chatId, answer, { caption: "I'm a Velimyr's bot!" });
    //                res.send({ "answer": answer });
    //            });
    //            break;
    //        }
    //        case '/random':
    //            {
    //                request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
    //                    var json = JSON.parse(body);
    //                    var rand = randomIntInc(1, json.length);                                               
    //                    var rand_page = randomIntInc(1, json[rand].langs[0].pagecount);
    //                    var rand_row = randomIntInc(1, 45);
    //                    global_name = json[rand].langs[0].name;
    //                    global_author = json[rand].langs[0].author;
    //                    var augurrequst = "http://augurbook.azurewebsites.net/books/v3/getaugur/" + json[rand]._id + '&' + rand_page + '&' + rand_row + '&' + json[rand].langs[0].locale;
    //                    console.log(augurrequst);
    //                    request(augurrequst, function (error, response, body) {
    //                        bot.sendMessage(chatId, "Авгур каже: \r\n\r\n " + '"' + JSON.parse(body).text + '"' + "\r\n\r\n " + global_name + "  (" + global_author + ')' , { caption: "I'm a Velimyr's bot!" });
    //                        res.send({ "answer": answer });
    //                    });                                      
    //                });
                    
    //                break;
    //            }      
    //        default:
    //            {
    //                bot.sendMessage(chatId, "Для того щоб отримати пророцтво - наберіть команду /random \r\n Для перегляд списку книг, по яких робить пророцтва Авгур наберіть - /booklist \r\n \r\n Побажання і пропозиції присилайте на velimyr@gmail.com", { caption: "I'm a Velimyr's bot!" });
    //                res.send({ "answer": answer });
    //                break;
    //            }
    //    }
    //    console.log(msg);    
    //});
};


 exports.Msg = function (req, res) {
        //bot.on('message', function (msg) {
        //    var chatId = msg.chat.id;
        //    var messageText = msg.text;
        //    var messageDate = msg.date;
        //    var messageUsr = msg.from.username;
        //    messageText = messageText.replace("@AugurBookBot", "");
        //    switch (messageText) {
        //        case '/booklist': {
        //            request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
        //                var answer = "";
        //                var json = JSON.parse(body);
        //                console.log(body);
        //                for (var i in json) {
        //                    answer = answer + (parseInt(i) + 1).toString() + '. ' + json[i].langs[0].name + " (" + json[i].langs[0].author + ')\r\n';
        //                }
        //                bot.sendMessage(chatId, answer, { caption: "I'm a Velimyr's bot!" });
        //                res.send({ "answer": answer });
        //            });
        //            break;
        //        }
        //        case '/random':
        //            {
        //                request("http://augurbook.azurewebsites.net/books/v3", function (error, response, body) {
        //                    var json = JSON.parse(body);
        //                    var rand = randomIntInc(1, json.length);
        //                    var rand_page = randomIntInc(1, json[rand].langs[0].pagecount);
        //                    var rand_row = randomIntInc(1, 45);
        //                    global_name = json[rand].langs[0].name;
        //                    global_author = json[rand].langs[0].author;
        //                    var augurrequst = "http://augurbook.azurewebsites.net/books/v3/getaugur/" + json[rand]._id + '&' + rand_page + '&' + rand_row + '&' + json[rand].langs[0].locale;
        //                    console.log(augurrequst);
        //                    request(augurrequst, function (error, response, body) {
        //                        bot.sendMessage(chatId, "Авгур каже: \r\n\r\n " + '"' + JSON.parse(body).text + '"' + "\r\n\r\n " + global_name + "  (" + global_author + ')' , { caption: "I'm a Velimyr's bot!" });
        //                        res.send({ "answer": answer });
        //                    });
        //                });
                        
        //                break;
        //            }
        //        default:
        //            {
        //                bot.sendMessage(chatId, "Для того щоб отримати пророцтво - наберіть команду /random \r\n Для перегляд списку книг, по яких робить пророцтва Авгур наберіть - /booklist \r\n \r\n Побажання і пропозиції присилайте на velimyr@gmail.com", { caption: "I'm a Velimyr's bot!" });
        //                res.send({ "answer": answer });
        //                break;
        //            }
        //    }
        //    console.log(msg);
        //});
};
