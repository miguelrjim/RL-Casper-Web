/*
 * Description:
 * The goal of this script is to make sure that the ecommerce part of the plans and pricing
 * flow is working properly.
 *
 * command:
 * RL-Casper$ casperjs test --includes=./resources/generalFunctions.js ./ecommerce/plans_and_pricing_flow.js --env=test
 *
 */

casper.test.begin('Getting a trial membership via Plans and Pricing', function (test) {

    var startingUrl = getStartingPoint('/plans-pricing.rl');

    casper.echo('');
    casper.echo('starting test on: ' + startingUrl);
    casper.echo('');

    casper.start(startingUrl, function(response) {
        if(response.status != 200)
            casper.die('Unable to connect to the env', 101);
    });

    casper.waitForResource('plans-hero-image-2.jpg');

    casper.then(function () {
        test.assertTitle('Plans and Pricing', 'Title matches expected value.');
        test.assertExists('.main-container .button-hero', 'CTA (Start free trial) has been found.');
    });

    casper.thenClick('.main-container .button-hero', function () {
        this.log('going to the checkout page.', 'info');
    });

    casper.waitForUrl(/checkout-plans-pricing\.rl/, function () {
        this.evaluate(function(username) {
            var s=$('[ng-controller="CompleteMonthlyCtrl"]').scope();
            s.$apply(function() {
                s.email = username;
                s.password = username;
            });
        }, userName, userName);

        fillCheckoutFields();

        test.assertTitle('checkout plans and pricing', 'Checkout page has been reached.');
        test.assertExists('.payment-submit-body #checkout-continue', 'CTA (Continue) has been found.');
    });

    casper.thenClick('.payment-submit-body #checkout-continue', function () {
        this.log('trying to create a trial subscription for: ' + userName, 'info');
        test.assertVisible('.payment-submit-body .pleaseWaitMsg','Continue button has been hidden after clicking.');
        this.wait(10000);
    });

    casper.then(function() {
        test.assertUrlMatch(/purchase-confirmation\.rl/, 'Confirmation page has been reached out.');
        test.assertTitle('Purchase Confirmation Page', 'Order has been placed.')
    });

    casper.then(function () {
        test.assertTitle('Purchase Confirmation Page', 'Expected title on confirmation page.');
        test.assert(this.getHTML('.purchaseConfirmationMain h1.rlMainHeading') === 'Congratulations, your Free Trial is now active', 'Expected header.');

        var url = this.getCurrentUrl();
        test.assert(url.indexOf('id=')           > -1, 'ID param exists.');
        test.assert(url.indexOf('total=')        > -1, 'TOTAL param exists.');
        test.assert(url.indexOf('membershipid=') > -1, 'MEMBERSHIPID param exists.');
        test.assert(url.indexOf('sale=')         > -1, 'SALE param exists.');
        test.assert(url.indexOf('membership=')   > -1, 'MEMBERSHIP param exists.');
        test.assert(url.indexOf('frequency=')    > -1, 'FREQUENCY param exists.');
        test.assert(url.indexOf('trial=yes')     > -1, 'TRIAL param exists.');

        var newUser = getCurrentUser();
        test.assert(newUser.isEmail(userName), 'New email address is the generated one.');
        test.assert(newUser.isSubscriptionType('CompleteMonth'), 'Subscription type is Complete Monthly');
        test.assert(newUser.isInTrial, 'User is in trial');

        this.echo('');
        printUserInfo(newUser);
        this.echo('');
        printTransactionData();
        this.echo('');
    });

    casper.run(function () {
       test.done();
    });

});