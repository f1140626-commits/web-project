require('dotenv').config({ path: '../.env' });
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const Pusher = require('pusher');

let pusher;
if (process.env.PUSHER_APP_ID) {
    pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true
    });
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);
    console.log(`等待處理網站端的開票請求...`);
    if (pusher) console.log(`🚀 Pusher 已經設定完成，可以即時推播訊息`);
});

client.on(Events.MessageCreate, async message => {
    // 忽略所有機器人發送的訊息（包含使用者從網站代發的訊息，以及系統的上下線通知）
    // 只有非機器人的真實客服發言，才即時推送到前端
    if (message.author.bot) return;

    // 將新訊息即時推送到該頻道專屬的 Pusher 頻道
    if (pusher) {
        pusher.trigger(`chat-${message.channel.id}`, 'new-message', {
            id: message.id,
            content: message.content,
            authorId: message.author.id,
            authorName: message.author.username,
            isBot: message.author.bot,
            createdAt: new Date(message.createdTimestamp).toISOString()
        }).catch(err => console.error('Pusher error:', err));
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'close_ticket') {
        if (pusher) {
            pusher.trigger(`chat-${interaction.channel.id}`, 'ticket-closed', {}).catch(err => console.error('Pusher error:', err));
        }

        await interaction.reply({ content: `🔒 管理員 <@${interaction.user.id}> 已關閉此票口。頻道將在 5 秒後結案並刪除...`, ephemeral: false });
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (err) {
                console.error("無法刪除頻道:", err);
            }
        }, 5000);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
