casper.test.begin('Mr. RoGato: Doc Creation With Registration and Checkout Regression Test', function suite(test) {
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
    //load the landing page and verify it is correct
    casper.start( getStartingPoint("/document/exhibit.rl"), function(response) {
        if(response.status != 200)
            casper.die('Unable to connect to the env', 101);
        this.echo("====== Beginning Test Suite ====== Env: " + environment);
        test.assertHttpStatus(200, 'Connected to Doc Landing page');
        test.assertTitle('Exhibit - Legal Attachments (Form With Sample)', 'Title is correct');
    });

    //click the Make Document button
    casper.then(function(){
        this.clickLabel('Make Document', 'a');
    });

    //wait for the next page of the interview to load
    casper.wait(waitTime, function() {
        //this.echo("I'm waiting for the page to update for " + waitTime/1000 + " secs.");
    });

    //verify that the interview has started
    casper.then(function(){
        test.assertUrlMatch(/questions/g , 'Doc Interview Started');
    });

    //fill in the first question
    casper.then(function(){
        this.fill('form#aspnetForm', {
            'ctl00$ctl00$SiteMasterBody$RedDesignBody$interview$Exhibit_Title':    'test',
        }, true);
    });

    //submit the first answer
    casper.then(function(){
        this.clickLabel('Continue', 'a');
    });

    //wait for the next page of the interview to load
    casper.wait(waitTime, function() {
        //this.echo("I'm waiting for the page to update for " + waitTime/1000 + " secs.");
    });

    //verify that the first question was answered and the second one is being displayed
    casper.then(function(){
        test.assertUrlMatch(/q2/g , 'Doc Interview Question Answered');
    });

    //no need to answer second question, lets just move through
     casper.then(function(){
        this.clickLabel('Continue', 'a');
    });

    //wait for the next page of the interview to load
    casper.wait(waitTime, function() {
        //this.echo("I'm waiting for the page to update for " + waitTime/1000 + " secs.");
    });

    //lets take some screenshots
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/doc-interview/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });
        this.echo("Taking Screenshots in all Device Aspect Ratios");
        //next question
        this.clickLabel('Continue', 'a');
    });

    //wait for the next page to load
    casper.wait(waitTime, function() {
        //this.echo("I'm waiting for the page to update for " + waitTime/1000 + " secs.");
    });

    //verify next page is the login and that the interview is complete
    casper.then(function(){
        test.assertUrlMatch(/login-register/g , 'DOC COMPLETE -> Login Page');
    });

    //generate a user name
    var randomUser = 'casper+' + (Math.random()*1000) + '@rocketlawyer.com';

    //create a new account
    casper.then(function(){
        this.fill('form#registerForm', {'email': randomUser,'pass': 'testpass1',}, true);
        //lets log who the user is
        this.echo('User: ' + randomUser)
    });


    //wait for the next page to load
    casper.wait(waitTime, function() {
        //this.echo("I'm waiting for the page to update for " + waitTime/1000 + " secs.");
    });

    //verify next page is doc checkout
    casper.then(function(){

        test.assertUrlMatch(/checkout-document/g , 'REG COMPLETE -> Checkout Page');

         // Fill out the Checkout Info
        casper.evaluate(function() {
          $('#first-name').val('Casper');
          $('#last-name').val('Headless');
          $('#card-number').val('4111111111111111');
          $('#security-code').val('512');
          $('#expiration-year').val('2016');
          $('#billing-zip').val('94114');
        });

    });
    casper.then(function(){
      casper.each(viewports, function(casper, viewport) {
        this.viewport(viewport.viewport.width, viewport.viewport.height);
        this.capture(screenshotFolder +'/doc-checkout/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });
        this.echo("Taking Screenshots in all Device Aspect Ratios");
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

    //wait for the checkout to complete (long wait here)
    casper.wait(waitTime*3, function() {
        this.echo("I'm waiting for the checkout to complete.");
    });


    //verify next page is the login and that the interview is complete
    casper.then(function(){
        test.assertUrlMatch(/confirmation.rl/g , 'PURCHASE COMPLETE -> Confirmation Page');
        //take screenshots
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/purchase-confirmation/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });
        this.echo("Taking Screenshots in all Device Aspect Ratios")
        this.echo("=^..^=");
    });

    casper.run(function() {
        test.done();
    });
});
