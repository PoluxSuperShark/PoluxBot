const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js')

module.exports = {
  // Build a new cmd called invites
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Gère les invitations du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    // Defines the action
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Supprimer toutes les invites', value: 'clear' },
          { name: 'Créer une invitation', value: 'create' },
          { name: 'Supprimer une invitation', value: 'delete' }
        )
    )

    // Channel creation
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Salon pour l’invitation')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
    )

    // Duration (in secs)
    .addIntegerOption(option =>
      option
        .setName('max_age')
        .setDescription('Durée de validité en secondes (0 = infini)')
    )

    // Max user (can be unlimited)
    .addIntegerOption(option =>
      option
        .setName('max_uses')
        .setDescription('Nombre d’utilisations (0 = illimité)')
    )

    // Invitation code to delete
    .addStringOption(option =>
      option
        .setName('code')
        .setDescription('Code de l’invitation à supprimer')
    ),

  /**
   * 
   * @param {*} interaction 
   * @returns 
   * Removes the invitation in the server
   */
  async execute(interaction) {
    // Action
    const action = interaction.options.getString('action')

    await interaction.deferReply({ ephemeral: false })

    // Clears the invites in the server
    if (action === 'clear') {
      const invites = await interaction.guild.invites.fetch()

      if (!invites.size) {
        return interaction.editReply('ℹ️ Aucune invitation à supprimer.')
      }

      await Promise.all(invites.map(invite => invite.delete()))

      return interaction.editReply(`🧹 **${invites.size} invitations supprimées.**`)
    }

    // Create an invite in a specific channel
    if (action === 'create') {
      const channel = interaction.options.getChannel('channel')
      if (!channel) {
        // Error
        return interaction.editReply('❌ Tu dois spécifier un **salon**.')
      }

      // The age of the invite to define by the mod
      const maxAge = interaction.options.getInteger('max_age') ?? 0
      const maxUses = interaction.options.getInteger('max_uses') ?? 0

      // Declares a new invite in the Discord server
      const invite = await channel.createInvite({
        maxAge,
        maxUses,
        unique: true,
        reason: `Créée par ${interaction.user.tag}`
      })

      /**
       * Returns success message invite, e.g. :
       * Invitation créée :
       * 🔗 discord.gg/XXXXXXXX
       * Utilisation max : XXX (ou infini)
       */
      return interaction.editReply(
        `✅ **Invitation créée :**\n🔗 ${invite.url}\n` +
        `⏱️ Durée : ${maxAge === 0 ? '∞' : `${maxAge}s`}\n` +
        `👥 Utilisations : ${maxUses === 0 ? '∞' : maxUses}`
      )
    }

    // Delete an invite and get invite code
    if (action === 'delete') {
      const code = interaction.options.getString('code')
      if (!code) {
        return interaction.editReply('❌ Tu dois fournir un **code d’invitation**.')
      }

      // Get invites code
      const invites = await interaction.guild.invites.fetch()
      const invite = invites.find(i => i.code === code)

      // If invite is not foundable
      if (!invite) {
        return interaction.editReply('❌ Invitation introuvable.')
      }

      // Delete the invite
      await invite.delete()

      // Replies the invitation
      return interaction.editReply(`🗑️ Invitation **${code}** supprimée.`)
    }
  }
}
