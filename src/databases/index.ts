import { MongoDB } from './mongodb';

const Databases = {
	initialize: () => {
		// new MongoDB();
		MongoDB.initialize();
	},
	// mongo: new MongoDB(),
};
// DB.mongo.

export default Databases;
export { MongoDB };
