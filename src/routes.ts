import express from 'express';
import { Router } from 'express';

import { LogsController } from './contollers';

const router: RouterAPI = Router();

router.get('/', async (_, res) => {
	res.send('Games API');
});

router.get('/healthcheck', (_, res) => res.sendStatus(200));

router.post('/log/:gameKey', express.json(), LogsController.create);

router.get('/logs/:gameKey', LogsController.get);
// router.get('/logs', LogsController.list);

export { router };

/**
 * ### ROUTES
 *
 * - __GET__ => Read
 * - __POST__ => Create
 * - __PUT__ => Update / Create
 * - __DELETE__ => Delete
 * - __PATCH__ => Partial Update
 *
 * #### GET
 *
 * - __Purpose__: Retrieve information(no change in server state)
 * - __Indepotent__: ✅ Yes (calling multiple times won't change the anything)
 *
 * #### POST
 *
 * - __Purpose__: Create a resource or trigger a process that changes the server state
 * - __Indepotent__: ❌ No (calling multiple times will create multiple resources or trigger the process multiple times)
 *
 * #### PUT
 *
 * - __Purpose__: Update a resource or create it if it doesn't exist
 * - __Indepotent__: ✅ Yes (calling multiple times with the same data will result in the same state)
 *
 * #### DELETE
 *
 * - __Purpose__: Remove a resource
 * - __Indepotent__: ✅ Yes (calling multiple times will result in the same state, the resource being absent)
 *
 * #### PATCH
 *
 * - __Purpose__: Partially update a resource
 * - __Indepotent__: ⚠ Deepends on implementation (calling multiple times with the same data may or may not result in the same state)
 *
 * ---
 * <br/>&nbsp;<br/>
 */
interface RouterAPI extends Router {}
// type RouterAPI = Router;
