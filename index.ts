import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { router } from '@routes';
import Databases from '@databases';
import { WebsocketClient } from './src/websocket/websocket';

const app: express.Application = express();
const server = createServer(app);

Databases.initialize();

WebsocketClient.initialize();

app.use(cors());
app.set('trust proxy', true);

app.use('/', router);

const port = process.env.PORT || 8060;
server.listen(port, () => {
	// eslint-disable-next-line no-console
	console.warn(`Server listening on port ${port}`);
});
