import { pg } from './src/config/db.js';
import { setupTable } from './src/services/sessionService.js';
import { startBot } from './src/services/whatsappService.js';

pg.connect()
    .then(setupTable)
    .then(startBot)
    .catch(console.error);