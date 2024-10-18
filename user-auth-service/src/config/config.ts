import { config } from "dotenv";

const configFile = `./.env`;
config({ path: configFile });

const { MONGO_URI, PORT, JWT_SECRET, NODE_ENV, RABBITMQ_URL, DB_NAME } =
  process.env;

export default {
  MONGO_URI,
  PORT,
  JWT_SECRET,
  env: NODE_ENV,
  rabbitmqURL: RABBITMQ_URL,
  DB_NAME
};