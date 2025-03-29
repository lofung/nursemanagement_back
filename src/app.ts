import * as express from "express";
import * as bodyParser from "body-parser";
import todoRoutes from "./routes";
import * as cors from "cors";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/", todoRoutes);

app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}....`);
});
