/*

This will be the filings flow for a California LLC for a Logged Out user.  It can be run to verify 
the story This flow will be run to verify the story 
https://www2.v1host.com/RocketLawyer/story.mvc/Summary?oidToken=Story:198237
command:
RL-Casper$ casperjs test --includes=./resources/generalFunctions.js ./smoke/Filings_RWD_with_Checkout.js --env=test
command for stage env: 
casperjs test --ssl-protocol=any --includes=./resources/generalFunctions.js ./smoke/Filings_RWD_with_Checkout.js --env=stage

*/
// TODO: Create a common file that will store all of the
// viewport sizes and other common elements

// var views = phantom.page.injectJs('../requires/screensizes.js');
// var casper = require("casper").create();
// var views = require('../requires/screensizes.js');

casper.test.begin('Filings Flow RWD Interview and Checkout Regression Test', function suite (test) {
    var waitTime = 3000;
    var screenshotFolder = casper.cli.get('scr');
    var viewports = [
            {
              'name': 'smartphone-portrait',
              'viewport': {width: 320, height: 480}
            },
            {
              'name': 'smartphone-landscape',
              'viewport': {width: 480, height: 320}
            },
            {
              'name': 'tablet-portrait',
              'viewport': {width: 768, height: 1024}
            },
            {
              'name': 'tablet-landscape',
              'viewport': {width: 1024, height: 768}
            },
            {
              'name': 'desktop-standard',
              'viewport': {width: 1280, height: 1024}
            }
          ];

  casper.start(getStartingPoint("/incorporation-register-rwd.rl"), function(response) {
    if(response.status != 200)
      casper.die('Unable to connect to the env', 101);
    this.echo("============== Beginning Test Suite ==============");
    this.echo("============== Environment is " + environment + " ==============");
    test.assertHttpStatus(200, "Connected to the Incorporation Registration page");
    test.assertTitle("Register for Your Incorporation", "Title is correct");
  });

  //====================================== REGISTRATION PAGE ======================================//
  casper.then(function() {
    //generate a random user
    var randomUser = 'casper+test' + (Math.random()*1000) + '@rocketlawyer.com';

    this.fill('form[name="incorporationRegForm"]', {
      "firstName": "Tester",
      "lastName": "McTester",
      "email": randomUser,
      "confirmEmail": randomUser,
      "address": "555 Testing Avenue",
      "city": "Testville",
      "state": "Louisiana",
      "zipcode": "94597",
      "phone": "415-555-5555"
    }, true);

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/01-register-page.png" );

    this.echo("============== Filled Out the Form ==============");
    this.echo("============== New User: " + randomUser + " ==============");
  });

  // Wait for the service to respond, and register a new user
  casper.wait(waitTime, function () {
    this.echo("Waiting for the interview to submit");
  });

  //====================================== STATE AND ENTITY ======================================//

  casper.then(function() {
    test.assertUrlMatch("/interview/incorporation/view/", "We're now at the beginning of the interview");
    test.assertExists('input[value="LLC"][checked="checked"]', "We have selected the LLC option");
    test.assertExists("option[value='California'][selected='selected']", "We have selected the California option");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/02-entity-page.png" );
    this.fill('form#incorporation-interview-form', {}, true);
  });

  //wait for the next page to load
  casper.wait(waitTime, function() {
      this.echo("Submitted a state and entity selection", "COMMENT");
  });

  //====================================== COMPANY INFO ======================================//
  casper.then(function () {
    test.assertExists("input[value='YES'][checked='checked']", "We have selected the primary member will be a member of the LLC")

    casper.evaluate(function() {
      // Filing Out the form the ghetto way
      $('#incorporation-interview-form').find('input').eq(0).val("Testalicious Brownies");
      $('#incorporation-interview-form').find('select').eq(1).val("LLC");

      $('#incorporation-interview-form').find('input').eq(1).val("Testalicious Brownies serves amazing brownies all day");
      $('#incorporation-interview-form').find('select').eq(1).val("Restaurant");

    });

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/03-company-info-page.png" );
    // this.echo("# Took a screenshot");

    this.fill('form#incorporation-interview-form', {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitted the Business Information including company name", "COMMENT");
  });

  //====================================== ADDITIONAL MEMBERS SELECTION ======================================//

  casper.then(function () {
    test.assertExists("input[value='NO'][checked='checked']", "We have selected no additional members")

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/04-member-selection-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitted the Additional members selection", "COMMENT");
  });

  //====================================== FILING SPEED SELECTION ======================================//

  casper.then(function () {
    var entityToTest = this.fetchText("h3");
    test.assertMatch(entityToTest, /^California LLC/, "Displaying filings speed options for a California LLC");
    test.assertExists("input[value='STANDARD'][checked='checked']", "The no rush option is selected");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/05-filing-speed-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitted the Filing speed page", "COMMENT");
  });

  //====================================== TAX ID SELECTION PAGE ======================================//

  casper.then(function () {
    test.assertExists("input[value='ROCKET_LAWYER'][checked='checked']", "Selecting the RL option to purchase the Tax ID");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/06-tax-id-selection-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  })

  casper.wait(waitTime, function () {
    this.echo("Submitted the Tax ID Selection", "COMMENT");
  });

  //====================================== TAX ID INPUT PAGE ======================================//

  casper.then(function () {
    var pageTitle = this.fetchText("h2.rlFont26");

    test.assertMatch(pageTitle, /^Tax ID/, "We are on the Tax ID input page");

    casper.evaluate(function () {
      $('#incorporation-interview-form').find('input').eq(0).val("555-55-5555");
    });

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/07-tax-id-input-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitted the Tax ID value", "COMMENT");
  });

  //====================================== CORPORATE KIT PAGE ======================================//

  casper.then(function(){
    var pageTitle = this.fetchText("h2.rlFont26");
    test.assertMatch(pageTitle, /Corporate Kit/, "We are on the corporate kit page");
    test.assertExists("input[value='KIT'][checked='checked']", "We have selected to purchase the Corporate Kit & Seal");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/08-corporate-kit-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitted the Corporate Kit Selection", "COMMENT");
  });

  //====================================== TRIAL SELECTION PAGE ======================================//


  casper.then(function() {
    var pageTitle = this.fetchText("h2.rlFont26");
    test.assertMatch(pageTitle, /free trial/, "We are on the trial selection page")
    test.assertExists("input[value='Free_Processing_With_Trial'][checked='checked']", "We have selected the free trial option");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/09-trial-selection-page.png" );
    // this.echo("# Took a screenshot");
    this.fill('form#incorporation-interview-form', {}, true);
  });


  casper.wait(waitTime, function () {
    this.echo("Submitted Trial Selection", "COMMENT");
  });

  //====================================== REVIEW PAGE ======================================//

 //click main button
  casper.then(function(){
    var pageTitle = this.fetchText(".columns.small-12.medium-8.large-8 > h2");
    test.assertMatch(pageTitle, /Please review/, "We are on the review page");

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/10-review-page.png" );
    // this.echo("# Took a screenshot");
    this.fill(".actions form", {}, true);
  });

  casper.wait(waitTime, function () {
    this.echo("Submitting review page", "COMMENT");
  });


  //====================================== CHECKOUT PAGE ======================================//
  casper.then(function() {
    test.assertUrlMatch("checkout-incorp.rl", "We're now at the checkout page, taking a Screenshot!");

    // Fill out the Checkout Info
    casper.evaluate(function() {
      $('#first-name').val('Casper');
      $('#last-name').val('The Headless Browser');
      $('#card-number').val('4111 1111 1111 1111');
      $('#security-code').val('512');
      $('#expiration-year').val('2016');
      $('#billing-zip').val('94114');
    });
  });

  //We need to let angular know to update scope based on inputs as dom bindings are not triggered
  casper.then(function(){
    casper.evaluate(function() {
     var angularScope = angular.element($(".checkout-page-body")).scope();
      angularScope.$apply(function(){
          angularScope.lname = $('#last-name').val();
           angularScope.fname = $('#FIRST-name').val();
           angularScope.zip = $('#billing-zip').val();
           angularScope.ccNum = $('#card-number').val();
           angularScope.secCode = $('#security-code').val();
      });
      $('.btn-primary').click();
    });
  });

  casper.then(function () {
    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/11-filings-checkout.png" );
  });

  //click main button
  casper.then(function(){
      casper.evaluate(function() {
        $('.btn-primary').click();
      });
  });

  casper.wait(waitTime*3, function () {
    this.echo("Submitted Checkout");
  });


  //====================================== PPCP PAGE ======================================//

  // Confirm that we are at the post purchase confirmation page
  casper.then(function() {
    test.assertUrlMatch("confirmation.rl", "Success, Purchase complete");
    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/12-filings-post-purchase-confirmation.png" );
  });


  //====================================== DASBOARD ======================================//

  casper.thenOpen(getStartingPoint("/dashboard.rl"), function() {
    test.assertHttpStatus(200, "The dashboard is up");
    test.assertUrlMatch("/dashboard.rl", "We're at the dashboard");

    this.click("a.pull-right.dontStart");
  });


  // Confirm that there is an incorporation in the dashboard
  casper.then(function () {

    this.viewport(1280, 1024);
    this.capture(screenshotFolder + "/13-filings-dashboard.png" );
  });

  casper.run(function () {
    test.done();
  });

});
