import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/requestLogger.middleware";

const app = express();

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use("/api", routes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

app.use(requestLogger);

export default app;