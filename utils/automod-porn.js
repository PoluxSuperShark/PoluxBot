module.exports = async function setupAutoMod(bot) {
  const GUILD_ID = process.env.GUILD_ID

  const guild = await bot.guilds.fetch(GUILD_ID)

  const rules = await guild.autoModerationRules.fetch()
  const exists = rules.find(r => r.name === 'Blocage Porn')

  if (exists) {
    console.log('🔁 AutoMod Porn déjà présent')
    return
  }

  await guild.autoModerationRules.create({
    name: 'Blocage Porn',
    eventType: 1, // MessageSend
    triggerType: 1, // Keyword
    triggerMetadata: {
      // Blocks pornographic lexical terms
      keywordFilter: ['porn', 'youporn', 'porno', 'pornhub', 'pornographie', 'pornographique']
    },
    actions: [
      {
        type: 1, // BlockMessage
        metadata: {
          customMessage: '🚫 Mot interdit'
        }
      }
    ],
    enabled: true
  })

  console.log('✅ AutoMod "Blocage Porn" ACTIVÉ')
}
