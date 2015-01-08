/*
 * Description:
 * The goal of this script is to make sure that the ecommerce part of the plans and pricing
 * flow is working properly.
 *
 * command:
 * RL-Casper$ casperjs test --includes=resources/generalFunctions.js dashboard/validate_dashboard_endpoints_for_new_user.js --env=test
 *
 */

casper.test.begin('Validates dashboard endpoints for new user', function (test) {
   
    var startingUrl = getStartingPoint('/login-register.rl#/register?hd=navreg');
    var utils = require('utils');
    var user;
    
    casper.echo('');
    casper.echo('starting test on: ' + startingUrl);
    casper.echo('');
    
    casper.start(startingUrl, function(response) {
        if(response.status != 200)
            casper.die('Unable to connect to the env', 101);
    });
    
    casper.waitForUrl(/login-register\.rl/, function () {
        this.fillSelectors('form#registerForm', {
            "input#email" : userName,
            "input#pass"  : userName
        })
    });
    
    casper.thenClick('form#registerForm .btn-primary');
    
    casper.waitForUrl(/dashboard\.rl/, function () {
        user = getCurrentUser();        
        test.assert(user.isEmail(userName), 'New user signed up.');
    });
    
    casper.then(function () {
        var endpoints = [
            { address : '/dashboard/v1/activities/needed', settings : { method: 'get', data : { '_' : Math.random() } } },
            { address : '/dashboard/v1/documents/latest',  settings : { method: 'get', data : { '_' : Math.random() } } },
            { address : '/dashboard/v1/incorps/documents', settings : { method: 'get', data : { '_' : Math.random() } } },
            { address : '/dashboard/v1/incorps/all',       settings : { method: 'get', data : { '_' : Math.random() } } },
            { address : '/dashboard/v1/fal/requests',      settings : { method: 'get', data : { '_' : Math.random() } } }
        ];
        
        for (i=0; i < endpoints.length; i++) {
            validateEndpoint(this, endpoints[i]);
        }
    });
    
    casper.then(function () {
        this.echo('');
        printUserInfo(user);
        this.echo('');
    })
    casper.run(function () {
       test.done(); 
    });
    
});