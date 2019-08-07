const request = require('request');

request('https://api.pandascore.co/tournaments/running?token=' + panda_token, { json: true }, (err, res, body) => {
    // handle error
    if (err) { return console.log(err); }
    const element = body[0];
    var event_name = element['league']['name'];
    var event_icon = element['league']['image-url'];
    var game_name = element['videogame']['name'];
    console.log(element['videogame']);
});