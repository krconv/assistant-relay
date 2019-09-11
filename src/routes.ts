import { Router } from "express";

import * as auth from './auth';

const routes = Router();

routes.use(auth.authenticate);

routes.use((req, res) => res.send("Hello World!"));

export default routes;
