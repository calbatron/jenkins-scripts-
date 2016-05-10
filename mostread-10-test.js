'use strict';

var unirest = require('unirest');
//ip of clockwork server
var ip = 'internal-test-cloc-Componen-2TSUPOGSEET-1015819263.eu-west-1.elb.amazonaws.com';

unirest.get('http://' + ip +':3000/top/start')
.end(function(result) {
    if (result.status === 200) {
        console.log(result.raw_body);
    } else {
        console.log('failed');
        console.log(result);
        console.log('exit with 1');
        process.exit(1);
    }
});
