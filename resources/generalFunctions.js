/*
 * This block of code helps to identify whether the script is receiving the environment
 * parameter to execute the test against it.
 *
 * Also it's setting some options to the casper object.
 *
 */

if (!casper.cli.has('env') && !casper.cli.has('host')) {
    casper.echo('either "env" or "host" is required.').exit();
}

/*casper.options.verbose = false;
casper.options.logLevel = "debug";*/
casper.options.waitTimeout = 60000;


/*
 * global variables to use during the test execution
 *
 */

var docInfo;
var userName = generateUserName();


/*
 * generic functions to setup tests
 *
 */

function getStartingPoint(pageUrl) {
    var urlPrefix = '';
    var env       = casper.cli.get('env');
    var host      = casper.cli.get('host');

    // env checks
    if (env === 'test')       { urlPrefix = 'https://www.test.rocketlawyer.com'; }
    else if (env === 'stage') { urlPrefix = 'https://www.stg.rocketlawyer.com'; }
    else if (env === 'prod')  { urlPrefix = 'https://www.rocketlawyer.com'; }

    // host checks
    else if (host != null && host.indexOf('localhost') == 0) { urlPrefix = 'http://' + host; }
    else if (host !== null)   { urlPrefix = 'https://' + host; }
    else                      { urlPrefix = 'https://www.rocketlawyer.com'; } // default it to PROD just because

    if(env == 'stage' || host == 'https://www.stg.rocketlawyer.com') {
        casper.options.pageSettings = {
            userName: 'cicero',
            password: 'chickpea'
        }
    }

    return urlPrefix + pageUrl;
}

function generateUserName() {
    return ('rkt.auto.tester+casper+' + Math.random() + '@rocketlawyer.com').replace('0.', '');
}


/*
 * generic functions to reuse in test scritps
 *
 */

function getCurrentUser() {
    return {
        email            : casper.getGlobal('userEmail'),
        firstName        : casper.getGlobal('userFirstName'),
        lastName         : casper.getGlobal('userLastName'),
        membershipId     : casper.getGlobal('userMembershipID'),
        subscriptionType : casper.getGlobal('userSubscriptionType'),
        isInTrial        : casper.getGlobal('userInTrial'),
        phoneNumber      : casper.getGlobal('userPhoneNumber'),
        isAnonymous      : casper.getGlobal('isAnon'),
        isLawyer         : casper.getGlobal('isLawyer'),
        globalId         : casper.getGlobal('userGlobalID'),

        isEmail            : function (emailToCompare) {
            return this.email === emailToCompare;
        },
        isSubscriptionType : function (typeToCompare) {
            return this.subscriptionType === typeToCompare;
        }
    };
}

function getCreditCardInfo() {
    return {
        firstName    : "Automated",
        lastName     : "Test",
        cardNumber   : "4111 1111 1111 1111",
        securityCode : "512"
    };
}

function fillCheckoutFields() {
    var ccInfo = getCreditCardInfo();
    casper.fillSelectors('div.payment-form-body', {
        "input#first-name"    : ccInfo.firstName,
        "input#last-name"     : ccInfo.lastName,
        "input#card-number"   : ccInfo.cardNumber,
        "input#security-code" : ccInfo.securityCode,
        "input#billing-zip"   : "11111"
    }, false);
}

function validateEndpoint(casperInst, endpointConfig, successField, successValue) {
    var absoluteAddr = getStartingPoint(endpointConfig.address);

    casperInst.open(absoluteAddr, endpointConfig.settings).then(function() {
        var content  = this.getPageContent();
        var response = JSON.parse(content);

        if (successField === undefined) successField = 'message';
        if (successValue === undefined) successValue = 'Success';

        casperInst.test.assert(response[successField] === successValue, endpointConfig.address + ' works.');
    });
}

/*
 * utilities
 *
 */

function padRight(value, ch, num) {
    if (!value || !ch || value.length >= num) {
        return value;
    }

    var max = (num - value.length)/ch.length;

    for (var i = 0; i < max; i++) {
        value += ch;
    }

    return value;
}

function printInfo(label, data, pad) {
    if (data == null) {
        return; // nothing to print.
    }

    casper.echo(label + ':', 'COMMENT');
    if (pad == null) {
        pad = 20;
    }

    for(var key in data) {
        casper.echo(padRight(' - ' + key + ': ', ' ', pad) + data[key]);
    }
}

function getQuerystringData() {
    var url = casper.getGlobal('location').search;
    var qs = url.substring(url.indexOf('?') + 1).split('&');

    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }

    return result;
}

function getDatetimeDirectory() {
    var utils = require('utils');
    var now   = new Date();

    return utils.format('%d/%d/%d/%d_%d_%d', now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())
}

function getDateAsString() {
    var utils = require('utils');
    var now   = new Date();

    return utils.format('%d_%d_%d-%d_%d_%d', now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())
}


/*
 * generic functions to print out information
 *
 */

function printUserInfo(user) {
    if (user == null) {
        user = getCurrentUser();
    }

    casper.echo('User information:', 'COMMENT');
    casper.echo(' - email:             ' + user.email + '   [' + user.globalId + ']');
    if (user.firstName !== '') casper.echo(' - first name:        ' + user.firstName);
    if (user.lastName  !== '') casper.echo(' - last name:         ' + user.lastName);
    casper.echo(' - subscription type: ' + user.subscriptionType);
    casper.echo(' - is in trial:       ' + user.isInTrial);
}

function printTransactionData() {
    var tranData = getQuerystringData();

    casper.echo('Transaction information:', 'COMMENT');

    for(var key in tranData) {
        casper.echo(padRight(' - ' + key + ': ', ' ', 17) + tranData[key]);
    }
}

function printDocumentInfo() {
    printInfo('Document information', docInfo, 17);
}

