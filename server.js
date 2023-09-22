const express = require('express');
var app = express();

var fs = require("fs")
var bodyParser = require('body-parser')

var cors = require('cors');
app.use(cors());
// has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from // https://jitter-backend.onrender.com
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

const modules = ["imy320", "imy310", "cos314", "cos333"];

app.post('/set-active-module', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        data.data.forEach(module => {
            module.active = false;
        });
        data.data[req.body.moduleIndex].active = true;
        
        fs.writeFile("json/modules.json", JSON.stringify(data, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
        });
    });

    res.json({});
});

app.get('/get-active-module', function (req, res) {
    fs.readFile( "json/modules.json", 'utf8', function (err, data) {
        var activeModule = null;
        var data = JSON.parse(data);
        data.data.forEach((module, index) => {
            if(module.active) {
                activeModule = index;
            }
        });
        res.json(activeModule);
    });
});

app.get('/get-all-questions', async function (req, res) {
    var questions = {
        module: []
    };

    await Promise.all(modules.map(async module => {
        await new Promise((resolve, reject) => {
            fs.readFile( "json/" + module + ".json", 'utf8', function (err, data) {
                var data = JSON.parse(data);
                questions.module.push(data);
                resolve();
            });
        });
    })).then(() => {

        //sort modules by index
        questions.module.sort((a, b) => {
            return a.index - b.index;
        });
        res.json(questions);
    });
});

app.post('/questions', function (req, res) {
    //response contains module code
    var moduleCode = req.body.moduleCode;

    fs.readFile("json/" + moduleCode + ".json", 'utf8', function (err, data) {
        if (err) {
            res.json(null);
            return;
        }


        var data = JSON.parse(data);
        res.json(data);
    });
});

app.get('/set-all-finished', async function (req, res) {
    await Promise.all(modules.map(async module => {
        await new Promise((resolve, reject) => {
            fs.readFile( "json/" + module + ".json", 'utf8', function (err, data) {
                var data = JSON.parse(data);
                data.chapters.forEach(chapter => {
                    chapter.questions.forEach(question => {
                        question.finished = true;
                    });
                });
        
                fs.writeFile("json/" + module + ".json", JSON.stringify(data, null, 4), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                });
            });
            resolve();
        });
    })).then(() => {
        console.log("All questions set to finished");
    });
});

app.get('/set-all-unfinished', async function (req, res) {
    await Promise.all(modules.map(async module => {
        await new Promise((resolve, reject) => {
            fs.readFile( "json/" + module + ".json", 'utf8', function (err, data) {
                var data = JSON.parse(data);
                data.chapters.forEach(chapter => {
                    chapter.questions.forEach(question => {
                        question.finished = false;
                    });
                });
        
                fs.writeFile("json/" + module + ".json", JSON.stringify(data, null, 4), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                });
            });
            resolve();
        });
    })).then(() => {
        console.log("All questions set to finished");
    });
});

app.post('/update-chapter-question', function (req, res) {
    var moduleCode = GetModuleCode(req.body.moduleIndex);
    
    fs.readFile( "json/" + moduleCode + ".json", 'utf8', function (err, data) {
        var data = JSON.parse(data);
        req.body.questionIndex.forEach(questionIndex => {
            data.chapters[req.body.chapterIndex].questions[questionIndex].finished = true;
        });

        fs.writeFile("json/" + moduleCode + ".json", JSON.stringify(data, null, 4), function(err) {
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
    fs.readFile("json/modules.json", 'utf8', function (err, data) {
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

function GetModuleCode(moduleIndex) {
    switch (parseInt(moduleIndex)) {
        case 0:
            return 'imy320';
        case 1:
            return 'imy310';
        case 2:
            return 'cos314';
        case 3:
            return 'cos333';
    }
}