var casper = require('casper').create(),
	environment = casper.cli.get("env"),
    urlPrefix,
    user = casper.cli.get("user"),
    password = casper.cli.get("password"),
    times = casper.cli.get("times"),
    waitTime = 800;

casper.options.viewportSize = {
    width: 1280,
    height: 1024
}
//casper.options.logLevel = "debug";
//casper.options.verbose = true;
casper.options.waitTimeout = 60000;

if(!user || !password || !times) {
	casper.die("Please pass env, user and password");
}

casper.start(getStartingPoint('/login-register.rl#/login?hd=navreg'), function() {
	this.fill('form#loginForm', {
        'email': user,
        'pass': password
    }, false);
    this.clickLabel('Submit', 'button');
});

var gotten=0,
	getExhibit = function() {
		casper.open(getStartingPoint('/StartDocument.aspx?id=135&try=1'));
		casper.then(function() {
			casper.clickLabel('Start New', 'a');
			casper.then(clickContinue);
			casper.then(function() {
				if(++gotten < times) {
					casper.echo('Exhibit #' + gotten);
					getExhibit();
				}
				else
					casper.echo('Done.')
			})
		})
	},
	clickContinue = function() {
        if(casper.exists('#btnNext')) {
            casper.then(clickContinue);
            casper.click('#btnNext');
            casper.wait(waitTime);
        }
        else
        	casper.waitForUrl(/\/document.rl/);
    },
    clickSkip = function() {
        casper.click('');
        casper.waitForUrl(/\/document.rl/);
    }

casper.waitForUrl(/\/dashboard.rl/, getExhibit);

casper.run();