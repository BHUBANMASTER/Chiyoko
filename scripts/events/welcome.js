const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.5",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝘔𝘰𝘳𝘯𝘪𝘯𝘨",
			session2: "𝘕𝘰𝘰𝘯",
			session3: "𝘈𝘧𝘵𝘦𝘳𝘯𝘰𝘰𝘯",
			session4: "𝘌𝘷𝘦𝘯𝘪𝘯𝘨",
			welcomeMessage: "𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪 𝙛𝙤𝙧 𝙞𝙣𝙫𝙞𝙩𝙞𝙣𝙜 𝙢𝙚 𝙩𝙤 𝙩𝙝𝙚 𝙜𝙧𝙤𝙪𝙥!\n\n 𝘽𝙤𝙩 𝙥𝙧𝙚𝙛𝙞𝙭: %1\n𝙏𝙤 𝙫𝙞𝙚𝙬 𝙩𝙝𝙚 𝙡𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨, 𝙥𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧: %1help 🌝",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `𝔸𝕤𝕤𝕒𝕝𝕒𝕞𝕦~𝔸𝕝𝕒𝕚𝕜𝕦𝕞 {userName}.\n 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝚃𝚘 𝚘𝚞𝚛 𝙵𝚊𝚖𝚒𝚕𝚢: {boxName}\n\n𝙃𝙖𝙫𝙚 𝙖 𝙣𝙞𝙘𝙚 {session} 😊`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const threadData = await threadsData.get(threadID);
					const dataBanned = threadData.data.banned_ban || [];
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
