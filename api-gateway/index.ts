import express from "express";
import proxy from "express-http-proxy";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const user_auth = proxy("http://localhost:8081");
const queue_processing = proxy("http://localhost:8082");
const queue_catalog = proxy("http://localhost:8083");

app.use("/api/user_auth", user_auth);
app.use("/api/queue_processing", queue_processing);
app.use("/api/queue_catalog", queue_catalog);

const server = app.listen(8080, () => {
  console.log("API Gateway is Listening to Port 8080");
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