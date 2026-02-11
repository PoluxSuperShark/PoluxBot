const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js')
require('dotenv').config()

// Logging
const LOG_CHANNEL_ID = process.env.LOGS_ID_CHANNEL;

module.exports = {

  // Build a new cmd called /ban
  data: new SlashCommandBuilder()
    .setName('banid')
    .setDescription('Bannir un utilisateur')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('ID de l’utilisateur')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du bannissement')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {

    //////////////////////////////////////////////////////////////////////////////////
    /* Timestamp */
    // Build new date
    const date    = new Date()                                      // Current
    const hours   = date.getHours().toString().padStart(2, '0')     // Hours
    const minutes = date.getMinutes().toString().padStart(2, '0')   // Minutes
    const seconds = date.getSeconds().toString().padStart(2, '0')   // Seconds
    // Get the current time (e.g. 15:02)
    const currentTime = `${hours}:${minutes}:${seconds}`
    //////////////////////////////////////////////////////////////////////////////////

    // Gets the current user's ID to ban
    const userId = interaction.options.getString('id')
    
    // Gets the reason
    // "Aucune raison spécifiée" is default.
    const no_reason = `L'utilisateur ${user.tag} banni le ${currentTime} du serveur`
    const reason = interaction.options.getString('raison') || no_reason

    // If ID to search is wrong
    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: '❌ ID invalide',
        // ephemeral: false
      })
    }

    // Get guild ID
    const guild = interaction.guild

  // Check if the user is already banned
  const bans = await guild.bans.fetch()

  if (bans.has(userId)) {
    const bannedUser = bans.get(userId).user

    return interaction.reply({
      content: `⚠️ L'utilisateur ${bannedUser.tag} est déjà banni du serveur !\nConsulte la liste des bannis.`,
    })
  }


    // Try to send in MP
    let dmSent = false
    try {
      const user = await interaction.client.users.fetch(userId)
      await user.send(
        `🔨 Tu as été **banni(e)** du serveur **${guild.name}**. \n 📝 Raison : ${reason} \n`
        `Nous comprennons que tu voudras revenir, \n mais les double-comptes pour contourner un bannissement sont contre les TOS de Discord, bonne journée !`
      )
      dmSent = true // MP sent to user
    } catch {
      dmSent = false // MP not sent to user
    }

    // Ban
    try {
      await guild.members.ban(userId, { reason })
    } catch (err) {
      // Error when banning user message
      console.error(err)
      return interaction.reply({
        content: '❌ Impossible de bannir cet utilisateur',
        ephemeral: false
      })
    }

    // Embed log
    const logChannel = await guild.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null)

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🔨 Bannissement par ID')
        .setColor('Red')
        .addFields(
          { name: 'Utilisateur ID', value: userId, inline: false },
          { name: 'Modérateur', value: interaction.user.tag, inline: true },
          { name: 'MP envoyé', value: dmSent ? '✅ Oui' : '❌ Non', inline: true },
          { name: 'Raison', value: reason }
        )
        .setTimestamp()

      logChannel.send({ embeds: [embed] })
    }

    // Response to mod
    await interaction.reply({
      content: `🔨 L'utilisateur **${userId}** a été ** banni ** du serveur. \n
      \n > ** RAISON ** : ${reason}
      \n > Modérateur : ${interaction.user.name}
      \n📩 MP : ${dmSent ? 'envoyé' : 'impossible'}`
    })
    /**
     * L'utilisateur 1234567890 a été banni du serveur
     * | Raison : reason
     */

  }
}
