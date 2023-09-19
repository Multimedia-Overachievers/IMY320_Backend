const express = require('express');
var app = express();
var fs = require("fs")

var server = app.listen(5000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server listening on port: %s", port)
})

app.get('/modules', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
       console.log("Modules Requested");
       res.end(data);
    });
})