casper.options.viewportSize = {
    width: 1280,
    height: 1024
}
casper.options.verbose = true;
//casper.options.logLevel = "debug";
casper.test.begin('Mr. RoGato: Doc Creation With Registration and Checkout Regression Test', function (test) {
    var shortWaitTime = 800,
        waitTime = 2000,
        mediumWaitTime = 8000,
        longWaitTime = 12000,
        reallyLongWaitTime = 20000;
    var screenshotFolder = casper.cli.get('scr');
    var date = new Date();
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

    casper.start(getStartingPoint('/sem/bid-bond.rl'), function(response) {
        if(response.status != 200)
            casper.die('Unable to connect to the env', 101);
        this.echo("====== Beginning Test Suite ======");
        test.assertHttpStatus(200, 'Connected to Doc Landing page');
        test.assertTitle('Bid Bond Form, Sample, Template', 'Title is correct');
    });

    //click the Make Document button
    casper.then(function(){
        this.clickLabel('Make Document', 'a');
    });

    //casper.then(function() {
    casper.waitForUrl("/secure/interview/questions.aspx", function() {
        test.assertUrlMatch(/\/secure\/interview\/questions.aspx/, 'Doc Interview Started');
        this.fill('form#aspnetForm', {
            'ctl00$ctl00$SiteMasterBody$RedDesignBody$interview$Contractor_name': 'Doc Funnel Casper'
        }, false);
        this.click('#cmdRefresh');
        this.wait(longWaitTime);
    });

    casper.then(function() {
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.captureSelector(screenshotFolder + '/interview-preview/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', '#previewImageLocation');
        });
    });

    var clickContinue = function() {
        if(casper.exists('#btnNext')) {
            casper.then(clickContinue);
            casper.click('#btnNext');
            casper.wait(waitTime);
        }
    }

    casper.then(clickContinue);

    casper.then(function() {
        test.assertUrlMatch(/\/login-register.rl/, 'Landed on Registration Page');
        var user='casper+docfunnel+' + date.getTime() + '@rocketlawyer.com';
        this.echo("Created user is: " + user);
        this.fill('form#registerForm', {
            'email': user,
            'pass': user
        }, false);
        this.clickLabel('Continue', 'button');
    });

    casper.waitForUrl(/\/checkout-document.rl/, function() {
        test.assert(true, 'Landed on Checkout Document');
        this.evaluate(function() {
            var s=$('[ng-controller="CheckoutCtrl"]').scope();
            s.$apply(function() {
                s.fname = 'Doc Funnel';
                s.lname = 'Casper';
                s.ccNum = 4111111111111111;
                s.secCode = 898;
                s.zip = 12312;
            })
        });
        this.click('#checkout-continue');
        this.wait(longWaitTime);
    });

    casper.waitForUrl(/\/purchase-confirmation.rl/, function() {
        test.assert(true, 'Landed on Purchase Confirmation')
        this.clickLabel('Continue', 'a');
    });

    casper.then(function() {
        test.assertUrlMatch(/\/document.rl/, 'Landed on Document Summary');
        this.wait(mediumWaitTime);
    });

    casper.then(function() {
        this.click(".rlModal.choose [ng-click=\"select('sign')\"]");
        this.wait(shortWaitTime);
    });

    casper.then(function() {
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder + '/document/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png');
        });
        test.assertTextExists('WHEREAS, Doc Funnel Casper', 'Document Preview has the expected text');
    });

    casper.then(function() {
        test.assertVisible('div.expand-collapse:first-child', 'Sign tab is visible');
        var inv='casper+docfunnel+inv+' + date.getTime() + '@rocketlawyer.com';
        this.echo('Invitee: ' + inv);
        this.evaluate(function() {
            var s=$('[ng-controller="EsignController"]').scope();
            s.$apply(function() {
                s.esignInfo.invite.sigNameView = 'Doc Funnel Casper';
                s.signPerson.first = 'Doc Funnel';
                s.signPerson.last = 'Casper Invitee';
                s.signPerson.email = inv;
            })
        });
        this.click("a[ng-click=\"validateInputs('sigName', 'iFirstName', 'iLastName', 'iEmail')\"]");
        this.click('a[ng-click="submitInvite();"]');
        this.wait(reallyLongWaitTime);
    })

    casper.then(function() {
        test.assertVisible("div[ng-show=\"sharedScope.currentView == 'sent' && !sharedScope.showDraft && !user.share && !docInfo.isIncorpDoc\"]", 'Signing sent successfully');
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder + '/document-esign/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png');
        });
    })

    casper.then(function() {
        test.assertVisible('div.expand-collapse:nth-child(2)', 'Ask a lawyer tab is visible');
        this.click('.expand-collapse:nth-child(2)');
        this.evaluate(function() {
            var s=$('[ng-controller="QAController"]').scope();
            s.$apply(function() {
                s.qaScope.question = 'How do I know if this Bid Bond is legal?';
                s.qaState = s.qaGetSelectedState('AK');
            });
        });
        this.click('a[ng-click="qaSubmitQuestion()"]');
        this.wait(mediumWaitTime);
    })

    casper.then(function() {
        test.assertVisible('div.see-question', 'QA Question submitted correctly');
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder + '/document-qa/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png');
        });
    })

    casper.then(function() {
        this.click('a[href="/dashboard.rl"]');
        this.wait(500);
    });

    casper.then(function() {
        test.assertTextExists('My Bid Bond', 'Bid Bond is showing up on dashboard');
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder + '/dashboard/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png');
        });
        this.click('a[href="/account-details.rl#/membership"]');
    });

    casper.waitForUrl(/\/account-details.rl#\/membership/);
    casper.wait(waitTime);

    casper.then(function() {
        test.assertTextExists('Your Membership: Complete Monthly Legal Plan Trial', 'Plan Information Matches');
        casper.each(viewports, function(casper, viewport) {
            this.viewport(viewport.viewport.width, viewport.viewport.height);
            this.capture(screenshotFolder + '/account-details/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png');
        });
    })

    casper.run(function() {
        test.done();
    });
});
