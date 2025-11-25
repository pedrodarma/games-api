import { MongoDB } from '@databases';
import { Errors } from '@errors';
import { LogsRepository } from '@repositories';
import { Request, Response } from 'express';

export class LogsController {
	static async get(req: Request, res: Response) {
		try {
			if (!req.params.gameKey && !req.query.gameKey && !req.body.gameKey) {
				return res.status(400).json({ error: 'Game KEY is required' });
			}

			const gameKey =
				req.query.gameKey || req.params.gameKey || req.body.gameKey;

			const repository = new LogsRepository(MongoDB.initialize());
			const logs = await repository.fetchLogs(gameKey);

			return res.status(200).json(logs);
		} catch (error) {
			const _err = error instanceof Error ? error : new Error(error as any);
			Errors.controllers(_err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	static async list(req: Request, res: Response) {
		try {
			if (!req.params.gameKey && !req.query.gameKey && !req.body.gameKey) {
				return res.status(400).json({ error: 'Game KEY is required' });
			}

			const gameKey =
				req.query.gameKey || req.params.gameKey || req.body.gameKey;

			const repository = new LogsRepository(MongoDB.initialize());
			const logs = await repository.fetchLogs(gameKey);

			return res.status(200).json(logs);
		} catch (error) {
			const _err = error instanceof Error ? error : new Error(error as any);
			Errors.controllers(_err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	static async create(req: Request, res: Response) {
		try {
			if (!req.params.gameKey && !req.query.gameKey && !req.body.gameKey) {
				return res.status(400).json({ error: 'Game KEY is required' });
			}

			const gameKey =
				req.query.gameKey || req.params.gameKey || req.body.gameKey;

			const repository = new LogsRepository(MongoDB.initialize());
			const success = await repository.addLog(gameKey, req.body);

			if (!success) {
				return res
					.status(500)
					.json({ error: 'Failed to create log entry in the database' });
			}

			return res
				.status(201)
				.json({ message: 'Log entry created successfully' });
		} catch (error) {
			const _err = error instanceof Error ? error : new Error(error as any);
			Errors.controllers(_err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
}
