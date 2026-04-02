// src/controllers/messageController.js
export async function handleMessage(sock, message) {
    if (!message.message) return;
    if (message.key.fromMe) return;

    const text = message.message.conversation
        || message.message.extendedTextMessage?.text
        || '';

    console.log(`Received message: ${text}`);

    await sock.sendMessage(message.key.remoteJid, {
        text: `EN: I'm creating a bot, you received this message by mistake, I'm sorry for the disturbance. I'm Gaspar, and please do not respond to this message.\n\nPT: Estou a criar um bot, recebeste essa mensagem por um erro. Peço perdao pelo disturbio. Sou Gaspar, e por favor nao responda a essa mensagem.`
    }, { quoted: message });
}