/* 

Vocabulary Notebook App
Mar 5 2015

*/

// We will need 'Express' module
var express = require('express');
// To be able to decipher post request, we need to require body-parser
var bodyParser = require('body-parser');
// Refer our server to 'app'
// Reference at http://expressjs.com/api.html
// http://erichonorez.wordpress.com/2013/02/04/a-basic-web-server-with-node-js-and-express/
var app = express();
var fs = require('fs');

//Urban Dictionary API
/*================================*/
var urban = require('urban');
// var trollface = urban('ddddd');

// trollface.first(function(json) {
//     console.log(json);
// });
/*================================*/


// .use is a middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log('incoming request from ---> ' + ip);
    // Show the target URL that the user just hit
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);
    next();
});

app.use('/', express.static(__dirname + '/public'));

/* 
Routers
*/

// Get all projects
app.get('/words', function(req, res) {
    // Fetch data from a file
    fs.readFile(PATH_TO_JSON_FILE + '/' + req.query.email, 'utf8', function(err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        data = JSON.parse(data);

        // console.log(data);

        res.json({
            data: data
        });
    });
});

// (Optional) get a project
app.get('/word', function(req, res) {

});

// Create a project
app.post('/word', function(req, res) {
    // console.log(req.body);
    // First we have to read a user's file and parse it in a proper array format
    fs.readFile(PATH_TO_JSON_FILE + '/' + req.body.user, 'utf8', function(err, data) {
        data = JSON.parse(data);
        
         //Get definition from Urban Dictionary
        /*=============================*/
        var word;
        var wordDef;
        word = urban(req.body.p_title);
        word.first(function(json){
            if(json != undefined){
                // console.log('has such word');
                wordDef = json.definition;

                //change re-write function position
                /*=====================*/
                 // Prepend a new json object into `data` array using `.unshift`
                data.unshift({
                    id: new Date().getTime(),
                    title: req.body.p_title,
                    definition: wordDef,
                    done: 'New'
                });
                // Re-write the file
                fs.writeFile(PATH_TO_JSON_FILE + '/' + req.body.user, JSON.stringify(data), function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                        // res.json({
                        //     status: 'OK'
                        // });
                    }
                });
                /*=====================*/
                res.json({
                    hasWord: true
                });

            } else {
                // console.log('no such word');
                res.json({
                    hasWord: false
                });
            }

        });
        /*=============================*/

    });
});

// Update a project
app.put('/word', function(req, res) {
    // Put the status of Done into txt file
    fs.readFile(PATH_TO_JSON_FILE + '/' + req.body.user, 'utf8', function(err, data) {
        data = JSON.parse(data);

        data.forEach(function(item){
            if(item.id == req.body.id){
                if(req.body.done == 'New'){
                    item.done = 'Old';
                } else {
                    item.done = 'New';
                }

            }
        });

        // console.log(data);
        // Re-write the file
        fs.writeFile(PATH_TO_JSON_FILE + '/' + req.body.user, JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
                res.json({
                    status: 'OK'
                });
            }
        });
    });
});

// Delete a project
app.delete('/word', function(req, res) {
    // console.log('deleting ' + req.body.id);
    // Read and find id
    fs.readFile(PATH_TO_JSON_FILE + '/' + req.body.user, 'utf8', function(err, data) {
        data = JSON.parse(data);
        data.forEach(function(item) {
            if (item.id == req.body.id) {
                // console.log(item);
                data.splice(data.indexOf(item), 1);
            }
        });
        // console.log('AFTER vvv');
        // console.log(data);
        // Re-write the file
        fs.writeFile(PATH_TO_JSON_FILE + '/' + req.body.user, JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
                res.json({
                    status: 'OK'
                });
            }
        });
    });
});

// Bonus!
app.post('/register', function(req, res) {
    // console.log(req.body);
    // Create an empty file for this user (if not exist)
    // http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
    if (!fs.existsSync(PATH_TO_JSON_FILE + '/' + req.body.email)) {
        // Do something
        fs.writeFile(PATH_TO_JSON_FILE + '/' + req.body.email, '[]', function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("New user, create a file for this user");
                res.json({
                    email: req.body.email
                });
            }
        });
    } else {
        console.log("User exists, no need to create a new file.");
        res.json({
            email: req.body.email
        });
    }
});

/*

Database Utility
At this point we will use .json file to keep our data.
With that, it's wise to write functions handling CRUD.
This can be applied to real database like MongoDB or
cloud database like Parse.

*/
var PATH_TO_JSON_FILE = 'data';
var db = {};

db.create = function() {

};

db.readAll = function() {

};

db.readOne = function() {

};

db.updateOne = function() {

};

db.deleteOne = function() {

};

db.deleteAll = function() {

};

/*

Initialize server

*/

var PORT = 3000; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});