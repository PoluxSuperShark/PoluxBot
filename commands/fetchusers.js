const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

const USERS_PER_PAGE = 10 // 10 users are shown per page

module.exports = {
    // Build a new cmd called "fetchusers"
    data: new SlashCommandBuilder()
        .setName('fetchusers')
        .setDescription('Affiche la liste des membres avec pagination')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        
        // Reply
        await interaction.deferReply({ ephemeral: false })

        // Get all members (cache + API)
        const members = await interaction.guild.members.fetch()
        const users = [...members.values()]

        let page = 0 // Page 1 from default (0 = 1 page)
        const maxPage = Math.ceil(users.length / USERS_PER_PAGE) - 1

        // Build the embed with users listing
        const getEmbed = (page) => {
            const start = page * USERS_PER_PAGE
            const current = users.slice(start, start + USERS_PER_PAGE)

            // Build new embed
            return new EmbedBuilder()
                .setTitle(`👥 Membres du serveur`)
                .setColor(0x5865F2)
                .setFooter({ text: `Page ${page + 1} / ${maxPage + 1} • ${users.length} membres` })
                .setDescription(
                    current.map((m, i) =>
                        `**${start + i + 1}.** <@${m.id}>\n🆔 \`${m.id}\``
                    ).join('\n\n')
                )
        }

        const getRow = (page) =>

            /**
             * Uses the buttons to navigate between users
             */
            new ActionRowBuilder().addComponents(
                // New button previous
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                // New button next
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === maxPage)
            )

        // Build message
        const message = await interaction.editReply({
            embeds: [getEmbed(page)],
            components: [getRow(page)]
        })

        const collector = message.createMessageComponentCollector({
            time: 2 * 60 * 1000 // 2 minutes
        })

        collector.on('collect', async (i) => {

            // If the users does not owns this cmd / menu
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: '❌ Ce menu ne t’appartient pas.', ephemeral: false })
            }

            if (i.customId === 'prev') page-- // Previous
            if (i.customId === 'next') page++ // Next

            // Update the embed
            await i.update({
                embeds: [getEmbed(page)],
                components: [getRow(page)]
            })

        })

        // Replies with embed and buttons
        collector.on('end', async () => {
            await interaction.editReply({ components: [] })
        })
    }
}
