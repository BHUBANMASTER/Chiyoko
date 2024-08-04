 module.exports = {
    config: {
        name: 'botinfo',
        role: 0,
        category: 'Bot Info',
        author: 'UPoL',
        longDescription: 'Show Bot Status',
        guide: {
            en: '${p}bot'
        }
    },
    onStart: async function ({ api, args, message, event, usersData, threadsData }) {
        const uptime = process.uptime();
        const hour = Math.floor(uptime % ((60 * 60 * 24) / (60 * 60)));
        const minute = Math.floor((uptime % (60 * 60)) / 60);
        const second = Math.floor(uptime % 60);
        
        const UpolUptime = `${hour}hrs : ${minute}mins : ${second}secs`;
        const timeStart = Date.now();
        const ping = Date.now() - timeStart;
        const BotName = '𝘾𝙝𝙞𝙮𝙤𝙠𝙤';
        const totalThreads = await threadsData.getAll();
        const totalUsers = await usersData.getAll();
        const usersCount = totalUsers.length;
        const threadsCount = totalThreads.length;
        await message.reply('informing...');
        
        const UpolMessage = `_______[ The Bot Details ]_______\n\nBot Name: ${BotName}\nBot Users: ${usersCount}\nBot Thread: ${threadsCount}\n------[ OTHERS INFO ]------\n\nBot ping: ${ping}\nUptime: ${UpolUptime}`;
          message.reply(UpolMessage);
    }
};
