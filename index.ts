import dotenv from 'dotenv';
dotenv.config();

import { AppConfig } from '@config';
import Databases from '@databases';
import { router } from '@routes';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { WebsocketClient } from './src/websocket/websocket';

const app: express.Application = express();
const server = createServer(app);

Databases.initialize();

WebsocketClient.initialize();

app.use(cors());
app.set('trust proxy', true);

app.use('/', router);

const port = AppConfig.server.port;
server.listen(port, () => {
	// eslint-disable-next-line no-console
	console.warn(`Server listening on port ${port}`);
});
