const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js')

module.exports = {
  // Builds a new cmd called "gavel"
  data: new SlashCommandBuilder()
    .setName('gavel')
    .setDescription('🔨 Déconnecte tout le monde des vocaux (ou d’un salon précis)')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Salon vocal à cibler uniquement')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(false)
    ),

  async execute(interaction) {
    // 🔐 Permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      const err_disconnect_mod = '❌ Tu dois avoir la permission **Déplacer les membres** pour exécuter la commande !.'
      return interaction.reply({
        content: err_disconnect_mod,
        ephemeral: false
      })
    }

    // Channel to disconnect users
    const targetChannel = interaction.options.getChannel('channel')

    // Replies with deconnection 
    await interaction.reply('🔨 **GAVEL ACTIVÉ** — déconnexion en cours...')

    let voiceChannels = []

    // Specific channnel to disconnect
    if (targetChannel) {
      voiceChannels = [targetChannel]
    } 
    // Disconnect to all vocal channel
    else {
      voiceChannels = interaction.guild.channels.cache.filter(
        c => c.type === ChannelType.GuildVoice
      ).values()
    }

    const promises = []

    // Disconnects the user from the channel
    for (const channel of voiceChannels) {
      for (const member of channel.members.values()) {
        promises.push(
          member.voice.disconnect().catch(() => {})
        )
      }
    }

    await Promise.all(promises)

    // Replies with the interaction
    await interaction.editReply(
      targetChannel
        ? `🔨 **GAVEL** — salon **${targetChannel.name}** vidé.`
        : '🔨 **GAVEL** — tous les salons vocaux ont été vidés.'
    )
  }
}
