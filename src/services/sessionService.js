import fs from 'fs';
import path from 'path';
import { pg } from '../config/db.js';
import { setupTableQuery, saveSessionQuery, loadSessionQuery } from '../models/session.js';

export const SESSION_DIR = '.baileys_session';

export async function setupTable() {
    await pg.query(setupTableQuery());
}

export async function loadSession() {
    const result = await pg.query(loadSessionQuery());
    return result.rows.length > 0 ? result.rows[0].session_data : null;
}

export async function saveSession(data) {
    await pg.query(saveSessionQuery(data));
    console.log('Session saved to database');
}

export async function syncSessionFromDB() {
    const data = await loadSession();
    if (!data) return false;

    fs.mkdirSync(SESSION_DIR, { recursive: true });
    for (const [filename, content] of Object.entries(data)) {
        fs.writeFileSync(path.join(SESSION_DIR, filename), JSON.stringify(content));
    }
    console.log('Session restored from database');
    return true;
}

export async function syncSessionToDB() {
    if (!fs.existsSync(SESSION_DIR)) {
        console.log('Session dir missing, skipping sync');
        return;
    }
    const files = fs.readdirSync(SESSION_DIR);
    if (files.length === 0) return;

    const data = {};
    for (const file of files) {
        const content = fs.readFileSync(path.join(SESSION_DIR, file), 'utf-8');
        try {
            data[file] = JSON.parse(content);
        } catch {
            data[file] = content;
        }
    }
    await saveSession(data);
}