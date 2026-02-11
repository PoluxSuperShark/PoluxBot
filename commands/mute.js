const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute un membre avec une durée personnalisée')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le membre à mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duree')
                .setDescription('Ex: 8s, 10m, 2h, 1d, 1w')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du mute')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('utilisateur')
        const dureeInput = interaction.options.getString('duree')
        const reason = interaction.options.getString('raison') || 'Aucune raison'

        if (!member) {
            return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: false })
        }

        if (!member.moderatable) {
            return interaction.reply({ content: '❌ Je ne peux pas mute ce membre.', ephemeral: false })
        }

        const dureeMs = ms(dureeInput)

        if (!dureeMs) {
            return interaction.reply({
                content: '❌ Durée invalide. Utilise : `5s`, `10m`, `2h`, `1d`, `1w`',
                ephemeral: false
            })
        }

        const MIN = 5 * 1000
        const MAX = 28 * 24 * 60 * 60 * 1000

        if (dureeMs < MIN) {
            return interaction.reply({ content: '❌ Minimum : **5 secondes**.', ephemeral: false })
        }

        if (dureeMs > MAX) {
            return interaction.reply({ content: '❌ Maximum : **28 jours**.', ephemeral: false })
        }

        try {
            // 📩 MP au membre
            try {
                await member.send(
                    `🔇 Tu as été **mute** sur **${interaction.guild.name}**\n !` +
                    `⏱️ Durée : **${dureeInput}**\n` +
                    `📝 Raison : ${reason}`
                )
            } catch (dmError) {
                console.warn(`MP impossible à ${member.user.tag}`)
            }

            // ⛔ Timeout
            await member.timeout(dureeMs, reason)

            // ✅ Confirmation publique
            await interaction.reply(
                `🔇 **${member.user.tag}** mute pour **${dureeInput}**\n📝 Raison : ${reason}`
            )

        } catch (err) {
            console.error(err)
            await interaction.reply({ content: '❌ Erreur lors du mute.', ephemeral: false })
        }

    }
}
