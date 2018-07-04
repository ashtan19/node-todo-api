var env = process.env.NODE_ENV || "development";

// Separate the important secrets from the config file 
if (env === "development" || env === "test") {
    var config = require("./config.json");
    var envConfig = config[env];            //use brackets to grab properties from JSON

    //Object.keys gets all the keys from a JSON object
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    })

}