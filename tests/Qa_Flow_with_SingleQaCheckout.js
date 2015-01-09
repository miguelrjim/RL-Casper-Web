casper.test.begin('Regression Q&A Funnel with Single Question Purchase', function suite(test) {
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
          'viewport': {width: 1280, height: 1280}
        }
      ];

    //load the Home Page and verify it is correct
    casper.start( getStartingPoint(""), function(response) {
        if(response.status != 200)
            casper.die('Unable to connect to the env', 101);
        this.echo("======= Beginning Test Suite =======");
        this.echo("======= Environment is " + environment + "=========");
        test.assertHttpStatus(200, 'Connected to Home page');
        test.assertTitle('Affordable Legal Services, Free Legal Documents, Advice & Ask a Lawyer | Rocket Lawyer', 'Title is correct');
    });

    //screenshots of the homepage
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/Home-Page/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'homepage.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        //click the Ask a Lawyer button in the Header Nav
        this.clickLabel('Ask a Lawyer', 'a');

    });

    // On ask-a-lawyer landing page
    // Fill in question textarea
    casper.then(function() {
        this.echo('On Ask a Lawyer Landing Page');
        this.echo('==========================================');

        this.fillSelectors('form[name="questionForm"]', {
            'textarea[name="questionText"]': 'I am an immigrant who holds a green card.  Can I leave the USA without jeopardizing my residency or green card status?'
        }, false);

        test.assertEval(function() {
            return document.querySelector('textarea[name="questionText"]').value ==
                  'I am an immigrant who holds a green card.  Can I leave the USA without jeopardizing my residency or green card status?'
        }, 'Question text is correct.');        

    });  

    //lets take some screenshots of ask-a-lawyer landing page
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/ask-a-lawyer-landing/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'ask-a-lawyer.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        //go to question detail or tagging page
        // casper.evaluate(function() {
        //     window.location.href= '/legal-advice/legal-advice.rl#/questionDetail?questionText=I am an immigrant who holds a green card.  Can I leave the USA without jeopardizing my residency or green card status?&from=FAL'
        // });
        this.click('.btn-large');
        this.wait(waitTime);

    });

    // On /legal-advice/legal-advice.rl question details page
    // Fill in question textarea
    casper.then(function() {
        test.assertUrlMatch(/#\/questionDetail[0-9]*/ , 'Question detail page loaded');

        this.echo('On tagging Page');
        this.echo('==========================================');

        //Select state and verify that correct state is selected
        this.fillSelectors('form[name="questionDetailForm"]', {
            'select#statePickerSelect': '2'
        }, true);  

        test.assertEval(function() {
            return document.querySelector('#statePickerSelect').value == '2';
        }, 'Correct state is selected'); 

        //select the radio and the corresponding dropdown   
        this.click('#radios-0');

        this.fillSelectors('form[name="questionDetailForm"]', {
            'select.meSelect': '5'
        }, true);                
    });

    // Take some screenshots of question detail page
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/tagging_page/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'question-details.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        this.click('#rlQuestionDetailContinueButton');
        this.wait(waitTime);
    });

    // On Login Page 
    //Create a new account
    casper.then(function(){
        // Verify next page is the login and that the interview is complete
        test.assertUrlMatch(/login-register/g , 'Login Page loaded');
        this.echo('==========================================');

        // Generate a user name
        //var user = 'ocallejas+' + (Math.random()*1000) + 'testing@rocketlawyer.com';
        var user = 'casper+' + (Math.random()*1000) + '@rocketlawyer.com';
        this.fill('form#registerForm', {'email': user,'pass': user,}, false);
        this.echo('User: ' + user);
        this.echo('==========================================');
        
    });

    // Take screen shots of the qa checkout page
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/login/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'login.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        this.clickLabel('Continue', 'button');
        this.wait(waitTime);        
    });

    // Verify next page is doc checkout
    casper.then(function(){

        test.assertUrlMatch(/checkout-qa/g , 'Checkout Page loaded');

        //select purchase of single legal answer
        this.click('#single-item-purchase');

        // Fill out the Checkout Info
        casper.evaluate(function() {
            $('#first-name').val('Casper');
            $('#last-name').val('Headless');
            $('#card-number').val('4111111111111111');
            $('#security-code').val('512');
            $('#expiration-year').val('2016');
            $('#billing-zip').val('94114');
        });

        casper.evaluate(function() {
            var angularScope = angular.element($(".checkout-page-body")).scope();
            angularScope.$apply(function(){
                angularScope.lname = $('#last-name').val();
                angularScope.fname = $('#first-name').val();
                angularScope.zip = $('#billing-zip').val();
                angularScope.ccNum = $('#card-number').val();
                angularScope.secCode = $('#security-code').val();
            });
        });       

    });

    // Take screen shots of the qa checkout page
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/checkout/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'checkout.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        this.click('#checkout-continue');
        this.wait(waitTime*3);
        this.echo("I'm waiting for the checkout to complete.");
        this.echo('==========================================');

    });

    // Verify next page is the thank you page
    casper.then(function(){

        test.assertUrlMatch(/thankYou/g , 'Thank you page loaded');
        this.echo('==========================================');
        //take screenshots
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/thank_you/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'thanks_you.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        //continue to dashboard.rl
        this.click('.btn-primary');
        this.wait(waitTime);

    });

    casper.then(function(){
        test.assertUrlMatch(/dashboard/g , 'Dashboard page loaded');
        this.echo('==========================================');        
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/dashboard/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'dashboard.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        //continue to question-answer.rl
        this.click('.answers');

    });

    // Take screen shots of the account details page
    casper.then(function(){
        test.assertUrlMatch(/question-answer/g , 'Question-answer page loaded');        
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/question-answer/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'question-answer.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });

        //continue to account details page
        this.click('.rlHeaderTopIconButtonOuterSettings');
        this.click('a.rlMenuPopupGenericItemLink');  

    });

    // Take screen shots of the account details page
    casper.then(function(){
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder +'/account_details/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + 'account_details.png', {top: 0,left: 0,width: viewport.viewport.width,height: viewport.viewport.height});
        });
    });

    casper.run(function() {
        test.done();
    });
});