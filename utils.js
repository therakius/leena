
// gets the phne number of the sender
export function getSenderNumber(msg) {
    const key = msg.key;

    // ordem de prioridade (mais confiável → menos)
    const jid =
        key.participantAlt ||
        key.participant ||
        key.remoteJidAlt ||
        key.remoteJid;

    if (!jid) return null;

    // ignora IDs internos (LID)
    if (jid.endsWith('@lid')) return null;

    // garante que é número real
    if (!jid.endsWith('@s.whatsapp.net')) return null;

    return jid.split('@')[0];
}