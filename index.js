const Discord = require("discord.js")
const config = require('./config.json');
const client = new Discord.Client()
const TOKEN = config.token;
const prefix = config.prefix;
const embedColor = config.embedColor
const api = require("./api.json")
const Fuse = require('fuse.js');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setPresence({
        activity: {
            name: "Capturer des cartes",
            type: "PLAYING", // PLAYING, STREAMING, LISTENING, WATCHING
            url: "https://www.twitch.tv/madeinbryan"
        },
        status: "idle" // online, idle, dnd, offline
    });
})

client.on("message", function (message) {
    let values = Object.values(api);
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    var arguments = args.toString();
    arguments = arguments.split(",,").join(";")
    arguments = arguments.split(",").join(" ")
    arguments = arguments.split(";").join(",")
    arguments = arguments.split(',');

    if (command === "test") {
        let embed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setTitle("Commmande bien recu !")
            .setDescription(`Je fonctionne bien !`)
        message.channel.send(embed);
        console.log(values)
    }

    ///////Carte Random/////////
    else if (command === "random") {
        let randomCard = values[parseInt(Math.random() * values.length)];

        cardShow(randomCard);
    }
    ///////Chercher une carte par l'ID/////////
    else if (command === "id") {
        let arg = arguments[0];

        const findId = new Fuse(values, {
            keys: ['id'],
            threshold: 0,
            tokenize: true,
            useExtendedSearch: true
        });

        const searchId = findId.search(arg);
        const idResults = searchId.map(Keyword => Keyword.item);
        let cardResult = idResults[0]
        //console.log(argResults)        
        if (idResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("L'id de la carte n'a pas été trouvé\n**Merci de mettre un nombre entre 0 et 54**")
        }
    }

    ///////Chercher une carte par son numéro/////////
    else if (command === "number") {

        let arg = arguments[0];

        const findNumber = new Fuse(values, {
            keys: ['num'],
            threshold: 0,
            tokenize: true,

        });

        const searchArg = findNumber.search(arg);
        const argResults = searchArg.map(Keyword => Keyword.item);
        let cardResult = argResults[0]
        //console.log(argResults.length)      

        if (argResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Le numéro de la carte n'a pas été trouvé\n**Merci de mettre un nombre entre 1 et 55**");

        }
    }


    ///////Chercher une carte par son nom/////////
    else if (command === "name") {
        let arg = arguments[0];

        const findName = new Fuse(values, {
            keys: ['name'],
            threshold: 0,
            tokenize: true,
        });

        const searchName = findName.search(arg);
        const nameResults = searchName.map(Keyword => Keyword.item);
        let cardResult = nameResults[0]
        //console.log(argResults)        
        if (nameResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Le nom de la carte n'a pas été trouvé")
        }
    }
    ///////Chercher une carte par son nom fr/////////
    else if (command === "namefr") {
        let arg = arguments[0];

        const findNameFr = new Fuse(values, {
            keys: ['vfName'],
            threshold: 0,
            tokenize: true,
        });

        const searchNameFr = findNameFr.search(arg);
        const nameFrResults = searchNameFr.map(Keyword => Keyword.item);
        let cardResult = nameFrResults[0]
        //console.log(argResults);      
        if (nameFrResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Le nom Francais de la carte n'a pas été trouvé")
        }
    }
    ///////Chercher une carte par la carte à jouer/////////
    else if (command === "gamecard") {
        let arg = arguments[0];

        const findGameCard = new Fuse(values, {
            keys: ['gameCard'],
            threshold: -1,
            tokenize: true,
        });

        const searchGameCard = findGameCard.search(arg);
        const gameCardResults = searchGameCard.map(Keyword => Keyword.item);
        let cardResult = gameCardResults[0]
        //console.log(gameCardResults);
        if (gameCardResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Cette carte n'a pas été trouvé")

        }
    }
    ///////Chercher une ou plusieurs carte.s par mot clé/////////
    else if (command === "keyword") {
        let arg = arguments[0];

        const findKeyword = new Fuse(values, {
            keys: ['keywords'],
            threshold: -1,
            tokenize: true,
        });

        const searchKeyword = findKeyword.search(arg);
        const keywordResults = searchKeyword.map(Keyword => Keyword.item);
        console.log(searchKeyword.length);

        if (keywordResults.length > 0) {
            keywordResults.forEach(card => {
                cardShow(card);
            });

        } else {

            cardError("Aucune carte n'a été trouvé avec ce mot clé");

        }
    }

    ///////AFFICHER LA CARTE////// 
    function cardShow(value) {

        const attachment = new Discord.MessageAttachment('cards/' + value.url);
        if (value.id >= 0 && value.id <= 51) {

            let embed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setTitle("Carte de Clow")
                .addField("Nom de la carte", value.name)
                .addField("Numéro de la carte", value.num)
                .addField("Nom VF de la carte", value.vfName)
                .addField("Carte de jeu associé à la carte", value.gameCard)
                .addField("Description de la carte", value.description)
                .addField("Message de la carte", value.message)
                .addField("Avertissement de la carte", value.caution)
                .attachFiles(attachment)
                .setImage("attachment://" + value.url)
            message.channel.send(embed);

        } else if (value.id >= 52 && value.id <= 54) {
            let embed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setTitle("Carte de Clow")
                .addField("Nom de la carte", value.name)
                .addField("Numéro de la carte", value.num)
                .addField("Nom VF de la carte", value.vfName)
                .attachFiles(attachment)
                .setImage("attachment://" + value.url)
            message.channel.send(embed);
        }
    }

    function cardError(desc) {
        let embed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setTitle("Carte de Clow")
            .setDescription(desc)
        message.channel.send(embed);
    }

});


client.login(TOKEN)
