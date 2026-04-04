import { pg, startHeartbeat } from './src/config/db.js';
import { setupTable } from './src/services/sessionService.js';
import { startBot } from './src/services/whatsappService.js';

pg.connect()
  .then(() => {
    console.log('Connected to the database');

    startHeartbeat(); // inicia heartbeat

    return setupTable();
  })
  .then(startBot)
  .catch(console.error);

pg.on('error', (err) => {
  console.error('Unexpected DB error:', err);
});