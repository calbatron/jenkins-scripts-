'use strict';

//live

var unirest = require('unirest');
//ip of clockwork
var ip = '10.38.167.117';
var id = 0;
var index = 0;
var interval = null;
var line = 0;

var tail = function() {

    var error = 0;
    var finished = 0;

    unirest.get('http://' + ip + ':3000/hourly-comscore/tail/' + id + '/' + index)
    .end(function(result) {
        if (result.status === 200) {
            var last = result.body.length - 1;

            if (result.body[last] && result.body[last].line) {
                index = result.body[last].line;
            } else {
                index = 0;
            }

            if (Array.isArray(result.body)) {
                result.body.forEach(function(row){


                    if (line !== row.line) {
                        console.log('Line ' + row.line + ': ' + row.message);
                        line = row.line;
                    }

                    if (row.status === 'finished') {
                        finished++;
                    }

                    if (row.status === 'error') {
                        console.log('error:', row);
                        error++;
                    }



                });

                if (error > 0) {
                    clearInterval(interval);
                    console.log('exit with 1');
                    process.exit(1);
                }

                if (finished > 0) {
                    clearInterval(interval);
                    console.log('exit with 0');
                    process.exit(0);
                }

            } else {

                console.log('Line ' + result.body.line + ':' + result.body.message);

                if (result.body.status === 'finished') {
                    clearInterval(interval);
                    console.log('exit with 0');
                    process.exit(0);
                }

                 if (result.body.status === 'error') {
                    clearInterval(interval);
                    console.log('exit with 1');
                    process.exit(1);
                }
            }
        }
    });
};


unirest.get('http://' + ip +':3000/hourly-comscore/start')
.end(function(result) {
    if (result.status === 200) {
        id = result.body.id;
        interval = setInterval(tail, 2000);
    } else {
        console.log('exit with 1');
        process.exit(1);
    }
});






