const express = require('express');
var app = express();

var fs = require("fs")
var bodyParser = require('body-parser')

var cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var server = app.listen(5000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server listening on port: %s", port)
})

app.get('/modules', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
       res.end(data);
    });
});

app.get('/questions', function (req, res) {
    fs.readFile( "json/questions.json", 'utf8', function (err, data) {
       res.end(data);
    });
});

app.get('/set-all-finished', function (req, res) {
    fs.readFile( "json/questions.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        data.module.forEach(module => {
            module.chapters.forEach(chapter => {
                chapter.questions.forEach(question => {
                    question.finished = true;
                });
            });
        });

        fs.writeFile("json/questions.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved! | Set all finished");
        });
    });
});

app.get('/set-all-unfinished', async function (req, res) {
    writeQueue.push(req);
    fs.readFile( "json/questions.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        data.module.forEach(module => {
            module.chapters.forEach(chapter => {
                chapter.questions.forEach(question => {
                    question.finished = false;
                });
            });
        });

        fs.writeFile("json/questions.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved! | Set all unfinished");
        });
    });
});

app.post('/update-chapter-question', function (req, res) {
    fs.readFile( "json/questions.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        req.body.questionIndex.forEach(questionIndex => {
            data.module[req.body.moduleIndex].chapters[req.body.chapterIndex].questions[questionIndex].finished = true;
        });

        fs.writeFile("json/questions.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        });

        console.log("Question Set to finished");
    });

    res.json({});
});


app.post('/add-quiz-score', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        var module = data.data[req.body.moduleIndex];
        var chapter = module.chapters[req.body.chapterIndex];

        chapter.scores.push(parseInt(req.body.score));
        module.timeSpent += parseInt(req.body.quizTime);
        console.log("time spent", module.timeSpent);
        fs.writeFile("json/modules.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        });

        console.log("Score added");
    });

    res.json({});
});

app.get('/clear-scores', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
        //for each chapter, set scores to empty array
        var data = JSON.parse(data);
        data.data.forEach(module => {
            module.chapters.forEach(chapter => {
                chapter.scores = [];
            });
        });

        fs.writeFile("json/modules.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        });

        console.log("Scores cleared");
    });
});

//add small amount of time to each module
app.get('/add-time', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        data.data.forEach(module => {
            module.timeSpent += 1000;
        });

        fs.writeFile("json/modules.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        });

        console.log("Time added");
    });
});