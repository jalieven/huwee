var HueApi = require("node-hue-api").HueApi;

var hostname = "192.168.0.28",
    userDescription = "huwee";

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));
};

var displayError = function(err) {
    console.log(err);
};

var hue = new HueApi();

// --------------------------
// Using a promise
hue.registerUser(hostname, userDescription)
    .then(displayUserResult)
    .fail(displayError)
    .done();

// --------------------------
// Using a callback (with default description and auto generated username)
hue.createUser(hostname, function(err, user) {
    if (err) throw err;
    displayUserResult(user);
});