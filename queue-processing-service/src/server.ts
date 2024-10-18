import express, { Express } from "express";
import { Server } from "http";
import processingRouter from "./routes/processingRoutes";
import { errorConverter, errorHandler } from "./middleware";
import { connectDB } from "./database";
import config from "./config/config";

const app: Express = express();
let server: Server;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(processingRouter);
app.use(errorConverter);
app.use(errorHandler);

connectDB();

server = app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
