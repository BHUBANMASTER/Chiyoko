const fs = require("fs");

const config = {
  name: "poke",
  version: "1.1",
  author: "Bhuban",
  countDown: 5,
  role: 0,
  shortDescription: {
    vi: "Short description in Vietnamese",
    en: "Short description in English",
  },
  longDescription: {
    vi: "Long description in Vietnamese",
    en: "Long description in English",
  },
  category: "Category",
  guide: "Guide",
};

async function findAndReplyPokemon({ message, args }) {
  const msg = args.join(" ");
  if (!msg) return message.reply("Please enter a Pokémon name.");

  try {
    const pokos = JSON.parse(fs.readFileSync('pokos.json', 'utf8'));
    const poke = pokos.find(e => e.name === msg.toLowerCase() || e.name.split("-")[0] === msg.toLowerCase());

    if (!poke) return message.reply("Pokémon not found.");

    console.log(pokos.indexOf(poke));
    message.reply({ attachment: await global.utils.getStreamFromURL(poke.image) });
  } catch (e) {
    console.error(e);
    message.reply('🥺 Server busy. Please try again later.');
  }
}

module.exports = {
  config,
  onStart: findAndReplyPokemon,
};
