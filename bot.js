// init discord vars
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
// init API vars
const request = require('request');
const panda_token = auth.panda_token;
// init maps
const role_map = new Map([
	['ow', "Overwatch"],
	['lol', "League of Legends"],
	['csgo', 'Counter Strike: Global Offensive'],
	['dota', 'Dota 2'],
	['r6', "Rainbow 6"]
])


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

});

client.on('message', msg => {
  
    // simple greeting
    if (msg.content === 'Colgate') {
      msg.reply('Our alma mater!!!');
    }

    // trigger commands
   if (msg.content[0] == '!'){
     // tokenize into command and args
     args = msg.content.substring(1,).split(" ");
     cmd = args[0];

     // currently running tournaments
     if (cmd == 'esports') {
       printRunningTournaments(msg);
     }
   }

  });


client.on('raw', event => {
	if (event['t'] == 'MESSAGE_REACTION_ADD' || event['t'] == 'MESSAGE_REACTION_REMOVE') {
		if (event['d']['message_id'] == '609016117473574912') {
			// grab reacting user
			let server = client.guilds.get(event['d']['guild_id']);
			let member = server.members.get(event['d']['user_id']);
			// grab role
			role_name = role_map.get(event['d']['emoji']['name']);
			let test_role = server.roles.find(r => r.name === role_name);
			// add or remove role
			if (event['t'] == 'MESSAGE_REACTION_REMOVE'){
				member.removeRole(test_role).catch(console.error);
			} else {
				member.addRole(test_role).catch(console.error);
			}
		}
	}
});

function printRunningTournaments(msg){
  var url = 'https://api.pandascore.co/tournaments/running?token='
  request(url + panda_token, { json: true }, (err, res, body) => {
    // handle error
    if (err) { return console.log(err); }
    // init rich embed
    const embed = new Discord.RichEmbed()
    embed.setTitle("_Current Esports Tournaments_")
    embed.setAuthor("The Raider", "https://i.imgur.com/9Uoud6Y.jpg")
    embed.setColor(0x00AE86)
    embed.setFooter("Built using PandaScore.co live API", "https://pbs.twimg.com/profile_images/1039524362989252608/Uv4L4Gbe_400x400.jpg")
    //embed.setThumbnail("https://i.imgur.com/9Uoud6Y.jpg")
    embed.setTimestamp()
    //.setDescription("This is the main body of text, it can hold 2048 characters.")
    // grab event names
    var [lol_events, ow_events, csgo_events, dota_events] = ["", "", "", ""];
    for (let index = 0; index < body.length; index++) {
      const element = body[index];
      var event_name = element['league']['name'];
      var game_name = element['videogame']['slug'];
      var url = element['league']['url'];
      //var emote = client.emojis.find(emoji => emoji.name === element['videogame']['slug'].replace(/\W/g, ''));
      // add to appropriate string
      if (game_name == "league-of-legends")  { lol_events = lol_events + event_name + ", " }
      if (game_name == "ow")  { ow_events = ow_events + event_name + ", " }
      if (game_name == "dota")  { dota_events = dota_events + event_name + ", " }
      if (game_name == "csgo")  { csgo_events = csgo_events + event_name + ", " }
    }
    // find empty strings
    if (lol_events.length == 0) { lol_events = "None  "}
    if (ow_events.length == 0) { ow_events = "None  "}
    if (dota_events.length == 0) { dota_events = "None  "}
    if (csgo_events.length == 0) { csgo_events = "None  "}
    // emoji constants
    const lol = client.emojis.find(emoji => emoji.name === "lol");
    const ow = client.emojis.find(emoji => emoji.name === "ow");
    const csgo = client.emojis.find(emoji => emoji.name === "csgo");
    const dota = client.emojis.find(emoji => emoji.name === "dota");
    embed.addField(`${lol}` + " League of Legends", lol_events.substring(0, lol_events.length -2) + ".");
    embed.addField(`${ow}` + " Overwatch", ow_events.substring(0, ow_events.length -2) + ".");
    embed.addField(`${csgo}` + " Counter-Strike: Global Offensive", csgo_events.substring(0, csgo_events.length -2) + ".");
    embed.addField(`${dota}` + " Dota 2", dota_events.substring(0, dota_events.length -2) + ".");
    msg.channel.send({embed});
  });
}

client.login(auth.dev_token);

