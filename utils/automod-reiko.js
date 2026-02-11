require('dotenv').config();

/**
 * 
 * @param {*} bot 
 * @returns 
 * This rule protects my girlfriend from mentions and
 * spamming to her. She's not harass anomore because
 * she's important for me. I love you Reiko !
 */
module.exports = async function setupReikoAutoMod(bot) {
  
  // IDs consts created for better visibily
  const GUILD_ID = process.env.GUILD_ID
  const LUNA_ID = process.env.LUNA_ID // Récupérer l'ID de Reiko

  // Gets the guild
  const guild = await bot.guilds.fetch(GUILD_ID)

  // Moderation sys vars
  const rules = await guild.autoModerationRules.fetch()
  const exists = rules.find(r => r.name === 'Protection Reiko')

  if (exists) {
    console.log('🔁 AutoMod Reiko déjà présent')
    return
  }

  /**
   * Creates a new Automod rule to protect Reiko.
   * She's so protected after this rule is in place.
   */
  await guild.autoModerationRules.create({
    name: 'Protection Reiko', // Rule name
    eventType: 1, // MessageSend
    triggerType: 1, // Keyword
    triggerMetadata: {
      keywordFilter: [
        `<@${LUNA_ID}>`,   // <@1387300868008968223>
        `<@!${LUNA_ID}>`,  // <@!1387300868008968223>
        `${LUNA_ID}`       // 1387300868008968223 (sans mention)
      ]
    },
    actions: [
      {
        type: 1, // Block Message for members
        metadata: {
          customMessage: `Ne dérange pas <@${LUNA_ID}>` // Ne dérange pas @Luna91
        }
      }
    ],
    enabled: true // This rule is enabled since the bot was online
  })

  const success_message_protect_reiko = "🛡️ Reiko est désormais protégée par l'AutoMod !";
  console.log(success_message_protect_reiko);
}
