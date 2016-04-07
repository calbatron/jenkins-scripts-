'use strict';

var unirest = require('unirest');
var AWS = require('aws-sdk');
var ec2 = new AWS.EC2({"region":"eu-west-1"});

var id = 0;
var index = 0;
var interval = null;
var line = 0;

var tail = function() {
    unirest.get('http://localhost:3000/hourly-comscore/tail/' + id + '/' + index)
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
                });

                if (result.body[last].status === 'finished' || result.body[last].status === 'error') {
                    clearInterval(interval);
                }
            } else {
                console.log('Line ' + result.body.line + ':' + result.body.message);
                if (result.body.status === 'finished' || result.body.status === 'error') {
                    clearInterval(interval);
                }
            }
        }
    });
};

var filter = {"Filters": [{"Name":"tag:BBCComponent", "Values":["clockwork"]},{"Name":"instance-state-name", "Values":["running"]},{"Name":"tag:BBCEnvironment", "Values":['test']}]};
ec2.describeInstances(filter, function(err, res) {
    if (err) {
        console.log(err);
    } else if (res.Reservations.length > 0) {
        console.log('connecting to http://' + res.Reservations[0].Instances[0].PrivateIpAddress +':3000/hourly-comscore/start');
        unirest.get('http://' + res.Reservations[0].Instances[0].PrivateIpAddress +':3000/hourly-comscore/start')
        .end(function(result) {
            if (result.status === 200) {
                id = result.body.id;
                interval = setInterval(tail, 2000);
            }
        });

    } else {
        console.log('no clockwork instances found');
    }
});



