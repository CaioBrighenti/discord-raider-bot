// init discord vars
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
// init API vars
const request = require('request');
const panda_token = auth.panda_token;
// init bot vars
const prefix = "!";
const role_map = new Map([
	['ow', "Overwatch"],
	['lol', "League of Legends"],
	['csgo', 'Counter Strike: Global Offensive'],
	['dota', 'Dota 2'],
  ['r6', "Rainbow 6"],
  ['smash', "Super Smash Bros"],
  ['fortnite', "Fortnite"],
  ['apex', "Apex Legends"],
  ['pubg', "PUBG"]
])


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);


});

client.on('message', msg => {
  // avoid responding to bots and ignore not commands
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  // tokenize into command and args
	const args = msg.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd == 'esports' || cmd == 'e') {
    // send guide
    if (args.length == 0) {printEsportsGuide(msg);}
    // currently running tournaments
    if (args[0] == 'r') {printRunningTournaments(msg);}
    else if (args[0] == 'u') {msg.reply("This command isn't ready yet! Stay tuned.");}
    else if (args[0] == 'd') {printTournamentDetails(msg,args);}
  } else if (cmd == 'matches' || cmd == 'm') {
    // send guide
    if (args.length == 0) {printEsportsGuide(msg);}
    // currently running tournaments
    if (args[0] == 'r') {msg.reply("This command isn't ready yet! Stay tuned.");}
    else if (args[0] == 'u') {msg.reply("This command isn't ready yet! Stay tuned.");}
    else if (args[0] == 'd') {msg.reply("This command isn't ready yet! Stay tuned.");}
  }

  });


  
client.on('raw', event => {
  // add roles for certain games
	if (event['t'] == 'MESSAGE_REACTION_ADD' || event['t'] == 'MESSAGE_REACTION_REMOVE') {
		if (event['d']['message_id'] == '609016117473574912') {
			addGameRole(event);
		}
	}
});

function addGameRole(event){
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

function printEsportsGuide(msg){
  const embed = new Discord.RichEmbed()
    .setTitle("Esports Command Guide")
    .setDescription("Commands with strikethrough are not yet implemented.")
    //.setAuthor("The Raider", "https://i.imgur.com/9Uoud6Y.jpg")
    .setColor(0x00AE86)
    .setTimestamp()
    .addBlankField()
    .addField(":trophy: Tournaments","Commands for getting information on Esports tournaments")
    .addField("Currently running", "`!esports r`", true)
    .addField("Upcoming", "~~`!esports u`~~", true)
    .addField("Details", "~~`!esports d <tournament id>`~~", true)
    .addBlankField()
    .addField(":video_game: Matches","Commands for getting information on Esports matches")
    .addField("Currently running", "~~`!matches r`~~", true)
    .addField("Upcoming", "~~`!matches u`~~", true)
    .addField("Details", "~~`!matches d <match id>`~~", true);
  msg.channel.send({embed});
}

function printRunningTournaments(msg){
  var url = 'https://api.pandascore.co/tournaments/running?token='
  request(url + panda_token, { json: true }, (err, res, body) => {
    // handle error
    if (err) { return console.log(err); }
    // init rich embed
    const embed = new Discord.RichEmbed()
    embed.setTitle("_Current Esports Tournaments_")
    //embed.setAuthor("The Raider", "https://i.imgur.com/9Uoud6Y.jpg")
    embed.setColor(0x00AE86)
    embed.setFooter("Built using PandaScore.co live API", "https://pbs.twimg.com/profile_images/1039524362989252608/Uv4L4Gbe_400x400.jpg")
    //embed.setThumbnail("https://i.imgur.com/9Uoud6Y.jpg")
    embed.setTimestamp()
    //.setDescription("This is the main body of text, it can hold 2048 characters.")
    // grab event names
    var [lol_events, ow_events, csgo_events, dota_events] = ["", "", "", ""];
    for (let index = 0; index < body.length; index++) {
      const element = body[index];
      start_date = new Date(element['begin_at']);
      end_date = new Date(element['end_at']);
      date_str = getDayMonth(start_date) + " to " + getDayMonth(end_date);
      event_name = element['league']['name'];
      game_name = element['videogame']['slug'];
      console.log(game_name);
      url = element['league']['url'];
      //var emote = client.emojis.find(emoji => emoji.name === element['videogame']['slug'].replace(/\W/g, ''));
      // add to appropriate string
      if (game_name == "league-of-legends")  { lol_events = lol_events + "**" + event_name + "** - " + date_str + " \n" }
      if (game_name == "ow")  { ow_events = ow_events + event_name + " \n" }
      if (game_name == "dota")  { dota_events = dota_events + event_name + " \n" }
      if (game_name == "csgo")  { csgo_events = csgo_events + event_name + " \n" }
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
    embed.addField(`${lol}` + " League of Legends", lol_events.substring(0, lol_events.length -2));
    embed.addField(`${ow}` + " Overwatch", ow_events.substring(0, ow_events.length -2));
    embed.addField(`${csgo}` + " Counter-Strike: Global Offensive", csgo_events.substring(0, csgo_events.length -2));
    embed.addField(`${dota}` + " Dota 2", dota_events.substring(0, dota_events.length -2));
    msg.channel.send({embed});
  });
}

function printTournamentDetails(msg,args){
  event_name = args.slice(1).join(" ");
  slug = getSlug(event_name);
  var url = 'https://api.pandascore.co/tournaments/' + slug + '?token='
  console.log(url);
  // request(url + panda_token, { json: true }, (err, res, body) => {
  //   // handle error
  //   if (err) { return console.log(err); }
  //   console.log('body:', body);
  // });
}

function getSlug(event_name){
  // get list of tournaments
  url = "https://api.pandascore.co/tournaments?token="
    request(url + panda_token, { json: true }, (err, res, body) => {
    // handle error
    if (err) { return console.log(err); }
    console.log('body:', body[1]['slug']);
  });
}

function getDayMonth(date){
  day = date.getDate().toString();
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  month = months[date.getMonth()];
  return month + " " + day;
}

client.login(auth.dev_token);

