import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import fs from 'fs';
import { pg } from '../config/db.js';
import { SESSION_DIR, syncSessionFromDB, syncSessionToDB } from './sessionService.js';
import { handleMessage } from '../controllers/messageController.js';

export async function startBot() {
    await syncSessionFromDB();

    fs.mkdirSync(SESSION_DIR, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('creds.update', async () => {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        await saveCreds();
        await syncSessionToDB();
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Scan the QR code below with WhatsApp:');
            qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
                if (!err) console.log(url);
            });
        }

        if (connection === 'open') {
            console.log('Leena WhatsApp bot is ready!');
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, status:', statusCode, 'reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                await startBot();
            } else {
                console.log('Logged out — clearing session');
                await pg.query('DELETE FROM whatsapp_sessions WHERE id = $1', ['baileys']);
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const message of messages) {
            await handleMessage(sock, message);
        }
    });
}