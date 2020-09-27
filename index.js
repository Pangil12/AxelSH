const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const got = require('got');
const fetch = require('node-fetch');
const timerInterval = 120000; //2 mins
const onlineInterval = 43200000; //12 hours
const ubaeURL = 'https://www.twitch.tv/ubaeph';

let twitchEmbed = '';
let announce = false;

/*app.get("/", (request, response) => 
{ 
  response.sendStatus(200);
});

app.listen(process.env.PORT);
setInterval(() => 
{
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 2800);*/

client.on('ready', () =>
{
    console.log(`Logged in as ${client.user.tag}!`);
    
    activeMessage();
    var dayMilliseconds = 1000 * 60 * 5;
    setInterval(function(){
      activeMessage();
    }, dayMilliseconds)
})

function activeMessage()
{
    client.channels.cache.get(config.zoomiesCh).send('Up');
}

//duel feature
function duelStart(fighter1, fighter2)
{
    let hp1 = 100;
    let hp2 = 100;
    let turn1 = Math.floor(Math.random());
    let turn2 = Math.floor(Math.random());
    let maxDamage = 11;
    let minDamage = 0;
    let damage = 0;
    let challenger = fighter1.id;

    if(turn1 > turn2)
    {
        while(hp1 > 0 && hp2 > 0)
        {
            damage = Math.floor(Math.random() * (+maxDamage - +minDamage) + +minDamage);
            hp2 -= damage;
            client.channels.get(config.duelCh).send(`${fighter2.username} took ${damage} damage, and has ${hp2} hp left!`);

            if(hp2 <= 0)
            {
                break;
            }
            else
            {
                damage = Math.floor(Math.random() * (+maxDamage - +minDamage) + +minDamage);
                hp1 -= damage;
                client.channels.get(config.duelCh).send(`${fighter1.username} took ${damage} damage, and has ${hp1} hp left!`);
            }
        }
    }
    else
    {
        while(hp1 > 0 && hp2 > 0)
        {
            damage = Math.floor(Math.random() * (+maxDamage - +minDamage) + +minDamage);
            hp1 -= damage;
            client.channels.get(config.duelCh).send(`${fighter1.username} took ${damage} damage, and has ${hp1} hp left!`);

            if(hp1 <= 0)
            {
                break;
            }
            else
            {
                damage = Math.floor(Math.random() * (+maxDamage - +minDamage) + +minDamage);
                hp2 -= damage;
                client.channels.get(config.duelCh).send(`${fighter2.username} took ${damage} damage, and has ${hp2} hp left!`);
            }
        }
    }

    if(hp2 <= 0)
    {
        client.channels.get(config.duelCh).send(`<@${fighter1.id}> is the winner with ${hp1} hp left.`);
    }
    else
    {
        client.channels.get(config.duelCh).send(`<@${fighter2.id}> is the winner with ${hp2} hp left.`);
    }
}

//Request for new Twitch access token
function twitchApiPost()
{
    let options = {
        hostname: `id.twitch.tv`,
        path: `/oauth2/token?client_id=${config.twitchClientID}&client_secret=${config.twitchClientSecret}&grant_type=client_credentials`,
        method: 'POST'
    }
    
    let url = `https://id.twitch.tv/oauth2/token?client_id=${config.twitchClientID}&client_secret=${config.twitchClientSecret}&grant_type=client_credentials`;
    
    fetch(url, {
        method: 'post',
        headers: {
            'Client-ID': config.twitchClientID,
            'Client-Secret': config.twitchClientSecret
        }
    })
    .then(res => res.json())
    .then(json => console.log(json));
}

//checks if streamer is online
async function callTwitchApi()
{
    let options = {
        hostname: `api.twitch.tv`,
        path: `/helix/streams?user_login=${config.UbaePH}`,
        method: 'GET',
        headers: {
            'Access-Token': config.twitchAccessToken,
            'Client-ID': config.twitchClientID,
            'Token-Type': 'bearer'
        }
    };
  
    https.get(options, (res) => {
        let body = '';
      
        res.on ('data', (chunk) => {
            body += chunk;
        });
      
        res.on('end', async () => {
            let json;
          
            try
            {
                json = JSON.parse(body);
                console.log(json);
            }
            catch(err)
            {
                print(err);
                return;
            }
          
            if(json.status == 404)
            {
                return twitchApiCallback('404');
                test = false;
            }
            else
            {
                //checks if payload is not empty
                try
                {
                    await twitchApiCallback(json);
                }
                catch(err)
                {
                    console.log('Non 404 error');
                }
            }
        }).on('error', (err) => {
            print(err);
        });
    }); 
    announce = true;
}

//sends a message in Discord if online
function twitchApiCallback(res)
{
    if(res.data === '' || res === '404')
    {
        console.log(res.data + " testest");
    }
    else if(res.data[0].type === 'live')
    {
        console.log(res.data[0].type); 
        console.log(res.data[0].title);
        console.log(res.data[0].thumbnail_url);
      
        twitchEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle(res.data[0].title)
          .setAuthor(config.UbaePH, `https://static-cdn.jtvnw.net/jtv_user_pictures/${config.imageUbaePH}-profile_image-150x150.png`)
          .setURL('https://www.twitch.tv/ubaeph/')
          .setThumbnail(`https://static-cdn.jtvnw.net/jtv_user_pictures/${config.imageUbaePH}-profile_image-150x150.png`)
          .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${config.UbaePH}-1920x1080.jpg`);
      
        client.channels.cache.get(config.testCh).send(`Hey <@&${config.notifSquad}>, UbaePH is now live on <${ubaeURL}> \n LET'S GO GET DAT ICE CREAAAAAAAAAMMMMMMM!`);
        client.channels.cache.get(config.testCh).send(twitchEmbed);
    }
}

function isOnline()
{
    announce = false;
}

//log the bot using the token
client.login(process.env.TOKEN);

if(announce === false)
{
    //client.setInterval(callTwitchApi, timerInterval);
}
else
{
    client.setInterval(isOnline, onlineInterval);
}

client.on('message', msg =>
{  
    //ping pong messages
    if(msg.content.toLowerCase() === 'ping')
    {
        msg.channel.send('Pong!'); //<:blobHeart:624465581558464512>');
    }
    else if(msg.content.toLowerCase() === 'pong')
    {
        msg.channel.send('Ping!')
    }
  
    if(msg.content.toLowerCase() == 'all hail queen ube')
    {
        if(msg.author.id === config.queenUbe || msg.author.id === config.creatorPang)
        {
            msg.channel.send(`All hail Queen <@${config.queenUbe}>`);
        }
    }
  
    if(msg.mentions.users.first() !== null)
    {
        let user = msg.mentions.users.findKey(val => val.id === `${config.axel}`);
        if(user === `${config.axel}`) 
        {
            msg.channel.send('Bark! Bark!');
        }
    }

    //bot reply when called 
    if(msg.content.toLowerCase() === 'axel')
    {
        if(msg.author.id === config.queenUbe)
        {
            msg.channel.send(`You called my queen <@${config.queenUbe}>?`);
        }
        else if(msg.author.id === config.creatorPang)
        {
            msg.channel.send(`You called creator <@${config.creatorPang}>?`);
        }
        else
        {
            msg.channel.send(`Hello there <@${msg.author.id}>`); //<:blobHeart:624465581558464512>');
        }
    }
    
    //Axel responds to I love you 
    if(msg.content.toLowerCase() === 'axel i love you' || msg.content.toLowerCase() === 'i love you axel' || msg.content.toLowerCase() === 'axel, i love you')
    {
        if(msg.author.id === config.queenUbe)
        {
            msg.channel.send(`Bark bark! I love you too Queen <@${config.queenUbe}>!`);
        }
        else
        {
            msg.channel.send(`Bark! bark! I love you too <@${msg.author.id}>!`);
        }
    }
  
    //Axel responds to 'do you love me?'
    if(msg.content.toLowerCase() === 'axel do you love me?' || msg.content.toLowerCase() === 'do you love me axel?' || msg.content.toLowerCase() === 'axel do you love me?')
    {
        if(msg.author.id === config.queenUbe)
        {
            msg.channel.send(`Yes, yes Queen <@${config.queenUbe}>`);
        }
        else
        {
            msg.channel.send(`Yes, yes`);
        }
    }
  
    if(msg.content.toLowerCase() === '!pet')
    {
        msg.channel.send("Woof woof!");
    }
  
    //Tells Ubae is cute too
    if(msg.content.toLowerCase() === "axel you're cute" || msg.content.toLowerCase() === "you're cute axel" || msg.content.toLowerCase() === "axel, you're cute")
    {
        msg.channel.send("Bark bark! Thank you, but it's because Queen Ubae is cute too!");
    }
  
    //Pings Ubae
    if(msg.content.toLowerCase() === 'axel get ubae for me' || msg.content.toLowerCase() === 'axel, get ubae for me')
    {
        if(msg.author.id === config.creatorPang)
        {
            msg.channel.send(`<@${config.queenUbe}>, Pang is calling for you!`);
        }
        else if(msg.author.id === config.queenUbe)
        {
            msg.channel.send(`<@${config.queenUbe}>, Ubae is calling for you!`);
        }
    }
  
    //8ball feature
    if(msg.content.toLowerCase().includes('axel') && msg.content.includes('?'))
    {
        let answers = 
        [
            "It is certain",
            "It is decidedly so",
            "Without a doubt",
            "Yes - definitely",
            "You may rely on it",
            "As I see it, yes",
            "Most likely",
            "Outlook good",
            "Yes",
            "Signs point to yes",
            "Don't count on it",
            "My reply is no",
            "My sources say no",
            "Outlook not so good",
            "Very doubtful",
            "Reply hazy, try again",
            "Ask again later",
            "Better not tell you",
            "Cannot predict now",
            "Concentrate and ask again"
        ];
      
        let num = Math.floor(Math.random() * Math.floor(answers.length));
        
        let response = answers[num];
      
        msg.channel.send(response);
    }

    //Confession read, post & delete
    if(msg.channel.id === config.confessCh)
    {
        /*let category = msg.content.split(" ", 1)[0];
        let confession = msg.content.split("confession ")[1];
      
        if(category.toLowerCase() === 'confession')
        {
            client.channels.get(config.anonymousCh).send('>>> ```' + confession + '```' + '\n「ˢᴴ」ᴬⁿᵒⁿʸᵐᵒᵘˢ ᶜᵒⁿᶠᵉˢˢᶦᵒⁿˢ');
            msg.delete();
        }
        else if(category.toLowerCase() == "nsfw")
        {
            client.channels.get(config.nsfwCh).send('>>> ```' + msg.content + '```' + '\n「ˢᴴ」ᴬⁿᵒⁿʸᵐᵒᵘˢ ᶜᵒⁿᶠᵉˢˢᶦᵒⁿˢ');
            msg.delete();
        }
        else if(category.toLowerCase() == "meme")
        {
            client.channels.get(config.memeCh).send('>>> ```' + msg.content + '```' + '\n「ˢᴴ」ᴬⁿᵒⁿʸᵐᵒᵘˢ ᶜᵒⁿᶠᵉˢˢᶦᵒⁿˢ');
            msg.delete();
        }
        else
        {
            msg.delete();
        }*/
      
        client.channels.get(config.anonymousCh).send('>>> ```' + msg.content + '```' + '\n「ˢᴴ」ᴬⁿᵒⁿʸᵐᵒᵘˢ ᶜᵒⁿᶠᵉˢˢᶦᵒⁿˢ');
        msg.delete();

        return;
    }
    
    //Duel
    if(msg.channel.id == config.duelCh)
    {
        let command = msg.content;

        if(command.startsWith(`${config.prefix}duel`))
        {
            let challenger1 = msg.author;
            let opponent = msg.mentions.users.first();

            //checks if an opponent is mentioned
            if(!opponent)
            {
                return msg.reply("you did not challenge anyone");
            }
            
            //checks if the user challenged themselves or a bot
            if(challenger1.id == opponent.id)
            {
                return msg.reply("you cannot challenge yourself!");
            }
            else if(opponent.bot == true)
            {
                return msg.reply("you cannot challenge a bot");
            }

            //challenger and opponent user ID
            let fighter1 = challenger1.id;
            let fighter2 = opponent.id;

            //sends a message to the channel, and pings the opponent if they accept the challenge or not
            let challenged = opponent.toString();
            msg.channel.send(`${challenged}, <@${fighter1}> has challenged you to a duel. Will you accept, yes or no?`)
            .then(() =>
            {
                msg.channel.awaitMessages(response => response.content.toLowerCase() == 'yes' && response.author.id == fighter2 || response.content.toLowerCase() == 'no' && response.author.id == fighter2,
                {
                    max: 1,
                    time: 60000,
                    errors: ['time'],
                })
                .then((collected) =>
                {
                    if(collected.first().content.toLowerCase() == 'yes')
                    {
                        msg.channel.send(`${challenged} has accepted the challenge`);
                        duelStart(challenger1, opponent);
                    }
                    else if(collected.first().content.toLowerCase() == 'no')
                    {
                        msg.channel.send(`${challenged} has declined the challenge`);
                    }
                })
                .catch(() =>
                {
                    msg.channel.send(`No response from ${challenged}. The fight has been cancelled.`);
                });
            });
        }
    }
});