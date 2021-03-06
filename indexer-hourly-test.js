'use strict';

//test

var unirest = require('unirest');
//ip of clockwork server
var ip = 'internal-test-cloc-Componen-2TSUPOGSEET-1015819263.eu-west-1.elb.amazonaws.com';
var id = 0;
var index = 0;
var interval = null;
var line = 0;

var tail = function() {

    var error = 0;
    var finished = 0;

    console.log('http://' + ip + ':3000/indexed/tail/' + id + '/' + index);

    unirest.get('http://' + ip + ':3000/indexed/tail/' + id + '/' + index)
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


unirest.get('http://' + ip +':3000/indexed/start')
.end(function(result) {
    if (result.status === 200) {
        console.log(result.raw_body);
        id = result.body.id;
        interval = setInterval(tail, 2000);
    } else {
        console.log(result);
        console.log('exit with 1');
        process.exit(1);
    }
});






