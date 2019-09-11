import { Router } from "express";

import * as auth from "./auth";

const routes = Router();

routes.use(auth.authenticate);

routes.post("/command", async ({ assistant, body }, res) => {
  const text = body.text;

  try {
    const response = await assistant.send(text);

    return res.send({ response });
  } catch (error) {
    res.sendStatus(500);
  }
});

export default routes;
