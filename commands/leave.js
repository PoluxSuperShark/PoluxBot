const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Fait quitter le bot de la vocal.'),
    
    // Tries to deconnect the bot or send an error message
    execute: async (interaction) => {

        // If bot is not in a channel
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply({ content: '❌ Je ne suis pas dans un canal vocal !', ephemeral: false });
        }

        // Bot quits the channel
        // Disconects and replies
        connection.destroy();
        return interaction.reply({ content: '✅ Je viens de quitter le canal vocal.', ephemeral: false });
    },
};
