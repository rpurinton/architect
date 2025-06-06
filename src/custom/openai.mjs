import 'dotenv/config';
import fs from 'fs';
import log from '../log.mjs';
import { OpenAI } from 'openai';
import { getCurrentDirname } from '../esm-filename.mjs';
import exp from 'constants';

const dirname = getCurrentDirname(import.meta);
const aiConfig = JSON.parse(fs.readFileSync(`${dirname}/openai.json`, 'utf8'));

if (!process.env.OPENAI_API_KEY) {
    log.error('OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getReply(myUserId, messages) {
    return "Hello";
}