// ===================== IMPORTS =====================
require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const path = require('path')

// Automod
const protect = require('./utils/automod-reiko')
const setupAutoMod = require('./utils/automod-porn')

// Clients intents
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
})

// Cmds
bot.commands = new Map()

/**
 *  Load the commands
 */
function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    if (file.isDirectory()) loadCommands(fullPath)
    else if (file.name.endsWith('.js')) {
      const command = require(fullPath)
      if (command.data && typeof command.execute === 'function') {
        bot.commands.set(command.data.name, command)
      }
    }
  }
}

// Load all cmds
loadCommands(path.join(__dirname, 'commands'))
console.log(`✅ ${bot.commands.size} commandes chargées`)

// When the bot is ready
bot.once('ready', async () => {
  console.log(`✅ Le bot est connecté en tant que ${bot.user.tag}`)

  try {
    await setupAutoMod(bot)
  } catch (err) {
    console.error('Erreur automod porn:', err)
  }

  // Bot activity
  // bot.user.setPresence({
  //  status: 'idle,' // Yellow moon on its profile
  // })
  // activities: [
  //  {
  //    name: "Serveur Minecraft en développement"
  //  }
  // ]
  //})

// MessageCreate
bot.on('messageCreate', async message => {
  if (message.author.bot) return

  // Automod
  try {
    await protect.handleMessage(message)
  } catch (err) {
    console.error('Erreur automod:', err)
  }

})

// InteractionCreate
bot.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = bot.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction)
  } catch (err) {
    console.error('Erreur interaction:', err)

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ Une erreur est survenue',
        ephemeral: true
      })
    } else {
      await interaction.reply({
        content: '❌ Une erreur est survenue',
        ephemeral: true
      })
    }
  }
})

// Login and start with token
bot.login(process.env.TOKEN)

