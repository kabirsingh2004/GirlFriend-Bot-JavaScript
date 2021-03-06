const { Client, Intents } = require("discord.js");
const { Player } = require("discordaudio");
const { getAudioUrl } = require("google-tts-api");
const fetch = require("node-fetch");
const { addSpeechEvent } = require("discord-speech-recognition");
const { joinVoiceChannel } = require("@discordjs/voice");
const { TOKEN } = require("./config");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS,
  ],
});

addSpeechEvent(client, {
  ignoreBots: true,
});

client.on("ready", async () => {
  console.log(`bot is online`);
  client.application.commands.set([
    {
      name: "join",
      description: `join your voice channel`,
      type: "CHAT_INPUT",
    },
  ]);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.user.bot || !interaction.guild) return;
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case "join":
        {
          const voiceChannel = interaction.member?.voice.channel;
          if (voiceChannel) {
            joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: voiceChannel.guild.id,
              adapterCreator: voiceChannel.guild.voiceAdapterCreator,
              selfDeaf: false,
            });
          }
          interaction.reply(`joined ${voiceChannel}`);
        }
        break;

      default:
        break;
    }
  }
});

client.on("speech", async (message) => {
  // start
  console.log(`content ${message.content}`);
  let string = message.content;
  if (string == undefined || string == "") return;
  const url = `https://api.simsimi.net/v2/?text=${encodeURIComponent(
    string
  )}&lc=en`;
  // let chatbot_gender = "Female";
  // let chatbot_name = "Priya"
  // const url = `https://api.udit.tk/api/chatbot?message=${encodeURIComponent(string)}&gender=${encodeURIComponent(chatbot_gender)}&name=${encodeURIComponent(chatbot_name)}`
  // const url = `https://chatbot-api.vercel.app/api/?message=${encodeURIComponent(
  //   string
  // )}`;
  // const url =  `https://api.affiliateplus.xyz/api/chatbot?message=${string}&botname=${client.user.username}&ownername=${"tech boy"}&user=${"kabu"}`
  let response = await fetch(url).then((res) => res.json());
  response.success.replace("uck", "fuck");
  console.log(`responce ${response.success}`);
  const stream = await getAudioUrl(String(response.success), {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });
  let voiceChannel =
    message.member.voice.channel || message.guild.me.voice.channel;
  const player = new Player(voiceChannel);

  await player.play(stream, {
    autoleave: false,
    quality: "high",
    selfDeaf: true,
    selfMute: false,
    audiotype: "arbitrary",
  });

  player.on("disconnect", async () => {
    player.reconnect(2000);
  });
});

client.login(TOKEN);
