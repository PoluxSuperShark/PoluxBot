const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js')

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(option =>
      option
        .setName('utilisateur')
        .setDescription('Membre à expulser')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du kick')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {

    // Cmd opts
    const user = interaction.options.getUser('utilisateur')
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie'
    const member = await interaction.guild.members.fetch(user.id).catch(() => null)

    // If the member is not in guild, ignore
    if (!member) {
      return interaction.reply({
        content: '❌ Impossible de trouver ce membre sur le serveur.',
        ephemeral: false
      })
    }

    // Can't kick the user
    if (!member.kickable) {
      return interaction.reply({
        content: '❌ Je ne peux pas expulser ce membre (permissions insuffisantes).',
        ephemeral: false
      })
    }

    // Try to send a MP
    let dmSent = false
    try {
      const dlink = "discord.gg/PSUBkRvQVx"; // Discord official link
      await user.send(
        `👢 Tu as été expulsé du serveur **${interaction.guild.name}**\n📝 Raison : ${reason}`
        `Tu peux revenir dans le serveur si tu as compris(e) la raison.\n L'erreur est humaine, mais ne recommence pas ! \n ** ${dlink} **`
      )
      dmSent = true
    } catch {
      dmSent = false // If DM is not sent
    }

    // Public answer into channel
    await interaction.reply({
      content: `✅ L'utilisateur **${user.tag}** a été **expulsé** du serveur.` +
               `\n > ** Raison ** : ${reason} +
               \n > Modérateur : ${interaction.user.name} `
                (dmSent ? '✅ DM envoyé' : '⚠️ Impossible d’envoyer le DM'),
      // ephemeral: false
    })

    // Log embed
    /**
     * ! Error : Logs channel does not work here
     */
    try {
      const logChannel = await interaction.guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null)

      if (logChannel && logChannel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('👢 Kick')
          .setColor('Orange')
          .addFields(
            { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: false },
            { name: 'Modérateur', value: interaction.user.tag, inline: true },
            { name: 'DM envoyé', value: dmSent ? '✅ Oui' : '❌ Non', inline: true },
            { name: 'Raison', value: reason }
          )
          .setTimestamp()

        await logChannel.send({ embeds: [embed] })
      }
    } catch (err) {
      console.error('Erreur log kick :', err)
    }
  }
}
