var express = require('express');
var spawn = require('child_process').spawn;
const fs = require('fs')
var PythonShell = require('python-shell');

var app = express();

app.get('/', async (req , res) => {
    kw=req.query.keyword.split(' ')
    var process = spawn('python', ["./amazon.py", kw[0] , kw[1]]);
    process.stdout.on('data', function (data) {
        console.log(data.toString())
    });
    process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    process.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        var data = fs.readFileSync("amazon.txt");
        //var arr = data.toString().split('\n')
        res.send(data.toString());
    });
});

app.listen(3001, function () {
  console.log('server running on port 3001');
})