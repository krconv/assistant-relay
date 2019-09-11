import express from "express";
import readline from "readline";
import fs from "fs";
import path from "path";

import GoogleAssistant from "google-assistant";

const ROOT_DIR = process.cwd();

declare global {
  namespace Express {
    interface Request {
      assistant: AssistantRelay;
    }
  }
}

export const initialize = (
  keyFile: string,
  tokensFile: string
): express.Handler => {
  const config = {
    keyFilePath: path.resolve(ROOT_DIR, keyFile),
    savedTokensPath: path.resolve(ROOT_DIR, tokensFile)
  };

  const assistant = new AssistantRelay(config);

  return (req, res, next) => {
    req.assistant = assistant;
    next();
  };
};

interface IRelayConfig {
  keyFilePath: string;
  savedTokensPath: string;
}

export class AssistantRelay {
  assistant: GoogleAssistant;
  ready: boolean = false;

  constructor(config: IRelayConfig) {
    if (!fs.existsSync(config.keyFilePath)) {
      throw new Error(`Key file does not exist: ${config.keyFilePath}`);
    }

    this.assistant = new GoogleAssistant(config);
    this.assistant.on("ready", () => {
      console.log("Google Assistant connection established.");
      this.ready = true;
    });
  }

  send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject("Google Assistant connection is not ready");
        return;
      }

      this.assistant.start(
        {
          textQuery: command
        },
        conversation => {
          if (conversation instanceof Error) {
            reject(conversation);
            return;
          }

          conversation.on("response", resolve).on("error", reject);
        }
      );
    });
  }
}
