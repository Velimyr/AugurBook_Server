var mongoose = require('mongoose');
//Імпортуємо модуль nconf і зчитуємо рядок підключення до БД
//var nconf = require('nconf');
//nconf.env().file({ file: 'config.json' });
var connectionString = nconf.get("MONGOLAB_URI");


mongoose.connect(connectionString);
var db = mongoose.connection;

// Schemas
var Schema = mongoose.Schema;
var Books = new Schema({
    "_id": {type: String, required : true}, 
    "id": { type: String, required : true }, 
    "name": { type: String, required : true }, 
    "author": { type: String, required : true }, 
    "url": { type: String, required : true }
});

var BookModel = mongoose.model('Books', Books);

module.exports.BookModel = BookModel;