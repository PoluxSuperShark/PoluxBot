const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendmp-role')
    .setDescription('Envoyer un message privé à tous les membres d’un rôle')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Le rôle dont tu veux contacter tous les membres')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message à envoyer')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Vars
    const role = interaction.options.getRole('role')
    const messageContent = interaction.options.getString('message')
    const guild = interaction.guild

    if (!guild)
      return interaction.reply({ content: '❌ Impossible de récupérer le serveur', ephemeral: true })

    await guild.members.fetch()
    const membersWithRole = role.members.map(member => member.user)

    // Check if the member has the specified role
    if (membersWithRole.length === 0)
      return interaction.reply({ content: `❌ Aucun membre n’a le rôle ${role.name}`, ephemeral: true })

    // These results is 0 per default
    let successCount = 0
    let failCount = 0

    // Envoi avec pause pour éviter les rate limits
    for (const user of membersWithRole) {
      try {
        await user.send(messageContent)
        successCount++
      } catch {
        failCount++
      }
      // 1s pause between two message to prevent rate limis
      await new Promise(res => setTimeout(res, 1000))
    }

    // Embed to mod
    await interaction.reply({
      content: `✅ Message envoyé au rôle **${role.name}**\n` +
               `✅ Succès : ${successCount}\n` +
               `⚠️ Échecs : ${failCount}`,
      ephemeral: true
    })

    // Embed log
    if (LOG_CHANNEL_ID) {
      try {
        const logChannel = await guild.channels.fetch(LOG_CHANNEL_ID)
        if (logChannel && logChannel.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle('📩 Commande /sendmp-role')
            .setColor('Blue')
            .addFields(
              { name: 'Rôle', value: `${role.name} (${role.id})`, inline: true },
              { name: 'Modérateur', value: interaction.user.tag, inline: true },
              { name: 'Message', value: messageContent.length > 900 ? messageContent.slice(0, 900) + '…' : messageContent },
              { name: 'Succès / Échecs', value: `✅ ${successCount} / ⚠️ ${failCount}`, inline: true }
            )
            .setTimestamp()

          await logChannel.send({ embeds: [embed] })
        }
      } catch (err) {
        console.error('Erreur log /sendmp-role:', err)
      }
    }
  }
}
