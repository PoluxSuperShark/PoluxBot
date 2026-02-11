const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vocal')
        .setDescription('Fait rejoindre le bot en vocal.'),
    execute: async (interaction) => {

        // Récupération complète du membre
        const member = await interaction.guild.members.fetch(interaction.user.id);

        // Verify if the channel is a voice channel
        const channel = member.voice.channel;
        if (!channel) {
            return interaction.reply({ content: '❌ Tu dois être dans un canal vocal pour utiliser cette commande !', ephemeral: false });
        }

        // Make the bot join channel
        joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Join with success
        return interaction.reply({ content: `✅ Je suis maintenant dans **${channel.name}** !`, ephemeral: false });
    },
};
