/*
 * Description:
 * This flow will
 *
 * command:
 * RL-Casper$ casperjs test --ssl-protocol=any --includes=./resources/generalFunctions.js ./login/Login-and-Registration.js --env=test
 *
 */

casper.test.begin("Accessing the login and registration links from the homepage", function (test) {

var startingUrl = getStartingPoint("/homepage.rl");

casper.start(startingUrl, function(response) {
  if(response.status != 200)
    casper.die('Unable to connect to the env', 101);
});

casper.waitForResource("smb_hp-apr13_carousel_v4.jpg");

casper.then(function() {
  test.assertHttpStatus(200, "We're at the homepage");
  test.assertTitle("Affordable Legal Services, Free Legal Documents, Advice & Ask a Lawyer | Rocket Lawyer", "Title matches what was expected");
});


casper.thenClick(".rlHeaderTopRightLink[href='/login-register.rl#/register/?hd=navreg']", function () {
  this.echo("\nGoing to the registration page \n", "COMMENT");
});

//====================================== REGISTER USER ======================================//
casper.waitForUrl("/login-register.rl", function () {
  test.assertTitle("Login and registration", "Title matches for the registration page");

  this.fillSelectors("form#registerForm", {
    "form#registerForm #email"  : userName,
    "form#registerForm #pass"   : userName
  }, true);

  this.echo("User is:  " + userName + "\n");
});

casper.waitForUrl("/dashboard.rl", function() {
  test.assertHttpStatus(200, "The Dashboard has scucesfully launched");
  test.assertUrlMatch("/dashboard.rl", "We are indeed at the dashboard");
});

//====================================== LOG USER OUT ======================================//
casper.thenClick("a[href='/secure/registration/logout.aspx'].rlMenuPopupGenericItemLink", function() {
  this.echo("Logging the user out");
});

casper.waitForUrl("rocketlawyer.com", function() {
  test.assertUrlMatch(/\/$/, "We're back at the homepage");
});

//====================================== LOG USER IN ======================================//

casper.thenClick(".rlHeaderTopRightLink[href='/login-register.rl#/login/?hd=navreg']", function () {
  this.echo("\nGoing to the login page \n", "COMMENT");
});

casper.waitForUrl("/login-register.rl", function () {
  test.assertTitle("Login and registration", "Title matches for the login page");

  this.fillSelectors("form#loginForm", {
    "form#loginForm #email"  : userName,
    "form#loginForm #pass"   : userName
  }, true);

  this.echo("User is:  " + userName + "\n");
});

casper.waitForUrl("/dashboard.rl", function() {
  test.assertHttpStatus(200, "The Dashboard has scucesfully launched");
  test.assertUrlMatch("/dashboard.rl", "We are indeed at the dashboard");
});

casper.run(function () {
  test.done();
});


});