import { config } from "./config/env.js";
import { startServer } from "./config/DbConnection.js";
import { app } from "./app.js";

const port: number = config.PORT || 5000;

startServer(app, port);
