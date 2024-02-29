const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents:
        [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,]
});

const config = require('./config.json');
const TOKEN = config.token;
const prefix = config.prefix;
const embedColor = config.embedColor;
//const Pagination = require('discord-paginationembed');
const api = require("./api.json");
const Fuse = require('fuse.js');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        activities: [{
            name: "Capturer des cartes",
            type: "PLAYING", // PLAYING, STREAMING, LISTENING, WATCHING
            url: "https://www.twitch.tv/madeinbryan"
        }],
        status: "idle" // online, idle, dnd, offline
    });
});

let values = Object.values(api);
client.on("messageCreate", async function (message) {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    var arguments = args.toString();
    arguments = arguments.split(",,").join(";");
    arguments = arguments.split(",").join(" ");
    arguments = arguments.split(";").join(",");
    arguments = arguments.split(',');

    if (command === "aide") {
        let embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Liste des commades")
            .setDescription("le prefixe est : " + "`" + prefix + "`")
            .addFields(
                { name: "random", value: "```Afficher une carte aléatoire```" },
                { name: "id `Id de la carte recherchée`", value: "```Chercher une carte par l'ID```" },
                { name: "number `Numéro de la carte recherchée`", value: "```Chercher une carte par son numéro```" },
                { name: "name `Nom anglais de la carte recherchée`", value: "```Chercher une carte par son nom anglais```" },
                { name: "namefr `Nom francais de la carte recherchée`", value: "```Chercher une carte par son nom francais```" },
                { name: "gamecard `Carte à jouer de la carte de clow recherchée`", value: "```Chercher une carte par la carte à jouer```" },
                { name: "keyword `Mot clé de la carte recherchée`", value: "```Chercher une ou plusieurs carte.s par mot clé```" },
                { name: "capture `épisode/film [numéro]`", value: "```Chercher une ou plusieurs carte.s avec son épisode de capture```" },
                { name: "list", value: "```Affiche la liste des cartes```" }
            )
        message.channel.send({ embeds: [embed] });
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
        let cardResult = idResults[0];

        if (idResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("L'id de la carte n'a pas été trouvé\n**Merci de mettre un nombre entre 0 et 54**");
        }
    }

    ///////Chercher une carte par son numéro/////////
    else if (command === "number") {
        let arg = arguments[0];

        const findNumber = new Fuse(values, {
            keys: ['num'],
            threshold: 0,
            tokenize: true
        });

        const searchArg = findNumber.search(arg);
        const argResults = searchArg.map(Keyword => Keyword.item);
        let cardResult = argResults[0];

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
        let cardResult = nameResults[0];

        if (nameResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Le nom de la carte n'a pas été trouvé");
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
        let cardResult = nameFrResults[0];

        if (nameFrResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Le nom Francais de la carte n'a pas été trouvé");
        } ActionRowBuilder, ButtonBuilder
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
        let cardResult = gameCardResults[0];

        if (gameCardResults.length > 0) {
            cardShow(cardResult);

        } else {
            cardError("Cette carte n'a pas été trouvé");
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

        if (keywordResults.length > 0) {
            keywordResults.forEach(card => {
                cardShow(card);
            });

        } else {
            cardError("Aucune carte n'a été trouvé avec ce mot clé");
        }
    }

    ///////Chercher une ou plusieurs carte.s par épisode/////////
    else if (command === "capture") {
        let arg = arguments[0];

        const findKeyword = new Fuse(values, {
            keys: ['episode'],
            threshold: -1,
            tokenize: true,
        });

        const searchKeyword = findKeyword.search(arg);
        const keywordResults = searchKeyword.map(Keyword => Keyword.item);

        if (keywordResults.length > 0) {
            keywordResults.forEach(card => {
                cardShow(card);
            });

        } else {
            cardError("Aucune carte n'a capturée dans cet épisode");
        }
    }

    ///////Afficher la liste des cartes/////////
    else if (command === "list") {
        await showPage(message, 1);
        /*function sendCardList() {
            const pages = [];
            const itemsPerPage = 25;
            let pageNum = 1; // Initialisation du numéro de page

            for (let i = 0; i < values.length; i += itemsPerPage) {
                const currentCards = values.slice(i, i + itemsPerPage);

                const pageEmbed = new EmbedBuilder()
                    .setTitle("Carte de Clow")
                    .setColor(embedColor)
                    .setDescription('**Liste des Cartes**')
                    .addFields(
                        currentCards.map(carte => ({
                            name: carte.name,
                            value: carte.vfName,
                            inline: true,
                        })),
                    )
                    .setFooter(`Page ${pageNum}/${Math.ceil(values.length / itemsPerPage)}`);

                pages.push(pageEmbed);
                pageNum++; // Incrémentation du numéro de page
            }

            return pages;
        }

        // Créez une instance de Pagination
        const pages = sendCardList();
        const paginatedEmbed = new Pagination.Embeds()
            .setArray(pages)
            .setChannel(message.channel)
            .setPage(1)
            .setAuthorizedUsers([message.author.id]);

        // Envoyez la première page
        paginatedEmbed.build();*/
    }


    function cardShow(value) {
        const attachment = new AttachmentBuilder('cards/' + value.url);
        if (value.id >= 0 && value.id <= 51) {
            let embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle("Carte de Clow")
                .addFields(
                    { name: "Nom de la carte", value: value.name, inline: true },
                    { name: "Nom VF de la carte", value: value.vfName, inline: true },
                    { name: "Numéro de la carte", value: `${value.num}`, inline: true },
                    { name: "Carte de jeu associé à la carte", value: `${value.gameCard}`, inline: true },
                    { name: "Capture", value: `${value.episode}`, inline: true },
                    { name: "Description de la carte dans la série", value: `${value.description_lore}` },
                    { name: "Description de la carte au tarot", value: `${value.description_tarot}` },
                    { name: "Message de la carte", value: `${value.message}` },
                    { name: "Avertissement de la carte", value: `${value.caution}` },
                )
                .setImage('attachment://' + value.url);
            message.channel.send({ embeds: [embed], files: [attachment] });

        } else if (value.id >= 52 && value.id <= 54) {
            let embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle("Carte de Clow")
                .addFields(
                    { name: "Nom de la carte", value: value.name, inline: true },
                    { name: "Nom VF de la carte", value: value.vfName, inline: true },
                    { name: "Numéro de la carte", value: `${value.num}`, inline: true },
                    { name: "Capture", value: `${value.episode}`, inline: true },
                    { name: "Description de la carte dans la série", value: `${value.description_lore}` },
                )
                .setImage('attachment://' + value.url);
            message.channel.send({ embeds: [embed], files: [attachment] });
        }
    }

    function cardError(desc) {
        let embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Carte de Clow")
            .setDescription(desc);
        message.channel.send({ embeds: [embed] });
    }

    async function showPage(message, page) {
        const itemsPerPage = 25;
        const totalPages = Math.ceil(values.length / itemsPerPage);

        const startIndex = (page - 1) * itemsPerPage;
        const pageItems = values.slice(startIndex, startIndex + itemsPerPage);

        const components = [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages)
                )
        ];

        let embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Carte de Clow")
            .setDescription("La Liste des Cartes")
            .addFields(
                pageItems.map((item, index) => {
                    return { name: `${startIndex + index + 1}. ${item.name}`, value: `${item.vfName}`, inline: true };
                })
            )
            .setFooter({ text:`Page ${page}/${totalPages}`})

       const msg = await message.channel.send({
            embeds: [embed],
            components: components
        });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'prev') {
                await interaction.update({
                    components: components,
                    embeds: [embed]
                });
                await showPage(message, page - 1);
            } else if (interaction.customId === 'next') {
                await interaction.update({
                    components: components,
                    embeds: [embed]
                });
                await showPage(message, page + 1);
            }
        });

        collector.on('end', () => {
            msg.edit({
                components: [],
                embeds: [embed]
            });
        });
    }
});

client.login(TOKEN);