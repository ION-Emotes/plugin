const { SlashCommandBuilder } = require('discord.js');
const {ghtoken} = require('./config.json');

module.exports = [
        {
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with Pong!'),
            async execute(client, interaction) {
                await interaction.reply({content: 'Pong!', ephemeral: true});
            },
	},
	{
	   data: new SlashCommandBuilder()
		.setName("add")
		.setDescription("Add an emote")
		.addStringOption(option =>
		option
			.setName('emote')
			.setDescription('The emoji to add')
			.setRequired(true)),
	   async execute(client, interaction) {
		   // <a:pink_Nodders:937079880473014362>
		const reason = interaction.options.getString('emote') || null;
		const emotes = (reason ==="all") ? Array.from((await interaction.guild.emojis.fetch()).values()) : [(await interaction.guild.emojis.fetch()).get(reason.split(":")[2].replace(">", ""))];
		
		if (!emotes[0]) return interaction.reply({content: "Not Found!", ephemeral: true});

		// console.log(reason.split(":")[2].replace(">", ""), (await interaction.guild.emojis.fetch()));
		const formatted = emotes.map((em) => ({id: em.id, name: em.name, animated: em.animated, serverId: interaction.guild.id}));
		console.log(formatted);
		interaction.reply({content: reason || "NONE", ephemeral: true});
	   }
	}
]
