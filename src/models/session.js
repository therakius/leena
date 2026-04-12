//queries for sessions

import { pg } from "../config/db.js";

export function setupTableQuery() {
    return {
        text: 'CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (id VARCHAR(255) PRIMARY KEY, session_data JSONB)',
    }
}


export function loadSessionQuery() {
    return {
        text: `SELECT session_data FROM public.whatsapp_sessions WHERE id = $1`,
        values: ['baileys']
    };
}

export function saveSessionQuery(data) {
    return {
        text: 'INSERT INTO public.whatsapp_sessions (id, session_data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET session_data = $2',
        values: ['baileys', data]
    }
}
