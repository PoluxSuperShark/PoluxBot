const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription("Affiche les infos d'un utilisateur")
        .addUserOption(option =>
            option.setName('user')
                .setDescription("L'utilisateur à vérifier")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('color')
                .setDescription("Mentionner un rôle pour colorer l'embed")
                .setRequired(false)
        ),
    
    /**
     * 
     * @param {*} interaction
     * Replies with the embed and 
     */
    execute: async (interaction) => {

        // Get basic infos
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const role = interaction.options.getRole('color');
        
        // Build a new embed with basic user infos
        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .// Fields (ID, if bot, date of account, arrival date, roles)
            addFields(
                { name: 'ID', value: `${user.id}`, inline: true },
                { name: 'Bot', value: `${user.bot ? '✅ Oui' : '❌ Non'}`, inline: true },
                { name: 'Date de création du compte', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Date d\'arrivée sur le serveur', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'N/A', inline: false },
                { name: 'Rôles', value: member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.name).join(', ') || 'Aucun' : 'N/A', inline: false }
            )
            .setColor(role ? role.color : '#00FF00') // couleur de l'embed basée sur le rôle mentionné
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        
        // Replies to the user with the banner
        await interaction.reply({ embeds: [embed] });
    },

};
