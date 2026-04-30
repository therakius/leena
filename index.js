import express from 'express';
// import { pg, startHeartbeat} from './src/config/db.js';
import { setupTable } from './src/services/sessionService.js';
import { startBot } from './src/services/whatsappService.js';

const app = express();

// rota pra uptime robbot
app.get('/ping', (req, res) => res.send('bot is awake!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor HTTP rodando na porta ${PORT}`));

  setupTable()
  .then(() => {
    console.log('Database ready, starting bot...');
    return startBot();
  })
  .catch((err) => {
    console.error('Error during initialization:', err);
    process.exit(1); // Exit with failure code
   });
