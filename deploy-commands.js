const { REST, Routes } = require('discord.js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

// Get bot infos with Dotenv
const TOKEN = process.env.TOKEN             // ! SENSIBLE : BOT TOKEN
const CLIENT_ID = process.env.CLIENT_ID     // BOT ID "PoluxBot"
const GUILD_ID = process.env.GUILD_ID       // SERVER "PoluxSuperShark" ID

// Cmds empty per default
const commands = []

// Get directory of cmds by files
function getCommandFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  let jsFiles = [] // No cmds per default
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    if (file.isDirectory()) jsFiles = jsFiles.concat(getCommandFiles(fullPath))
    else if (file.isFile() && file.name.endsWith('.js')) jsFiles.push(fullPath)
  }
  return jsFiles // Return cmds in JS format
}

// Get path for cmds : /commands/
const commandFiles = getCommandFiles(path.join(__dirname, 'commands'))

// Get filename and name with a slash cmd name
for (const file of commandFiles) {
  const command = require(file)
  if (command.data) commands.push(command.data.toJSON())
}

// REST API with token (v10)
const rest = new REST({ version: '10' }).setToken(TOKEN)

// ! DEPLOY COMMANDS IF A NEW ONE IS CREATED
// Async function for making deployement more speedy
;(async () => {
  try {
    // Loging and REST cmds (test if can be deployed)
    console.log(`⏳ Déploiement de ${commands.length} commandes sur le serveur ${GUILD_ID}...`)
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    console.log('✅ COMMANDES DEPLOY')
    console.log(commands.map(c => c.name))
  } catch (error) {
    // Error if cmd is not deployed in Discord
    console.error('❌ Erreur deploy:', error)
  }
})()
