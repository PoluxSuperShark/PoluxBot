require('dotenv').config()
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const aiURL = process.env.AI_URL

async function askOllama(prompt) {
  try {

    // REST handle
    const res = await fetch(aiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // Uses Ollama3 model per default
        prompt: `Réponds uniquement en français en tutoyant.\n\n${prompt}`,
        stream: false
      })

    })

    // If REST is not Okay
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    // Returns answer to user's question
    const data = await res.json()
    return data.response || 'Aucune réponse.' // Returns with no answer

  } catch (err) {
    const error = "❌ Woooupsi ! Ma machine interne a rencontré une erreur";
    console.error(`${error} : `, err)
    return `${error}, je ne peux pas vous répondre. Réessayez ultérieurement !`
  }
}

module.exports = { askOllama }
