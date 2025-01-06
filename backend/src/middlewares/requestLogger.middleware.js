import morgan from "morgan";
import chalk from "chalk";

const formatTime = () => {
  const now = new Date();
  return now
    .toLocaleString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

morgan.token("time", () => formatTime());

morgan.token("username", (req) =>
  req.user && req.user.userName ? req.user.userName : "Guest"
);

morgan.token("params", (req) => {
  return req.params && Object.keys(req.params).length
    ? `Params: ${JSON.stringify(req.params)}`
    : "";
});
morgan.token("query", (req) => {
  return req.query && Object.keys(req.query).length
    ? `Query: ${JSON.stringify(req.query)}`
    : "";
});
morgan.token("body", (req) => {
  return req.body && Object.keys(req.body).length
    ? `Body: ${JSON.stringify(req.body)}`
    : "";
});

morgan.token("method-colored", (req) => {
  const method = req.method;
  switch (method) {
    case "GET":
      return chalk.green(method);
    case "POST":
      return chalk.blue(method);
    case "PUT":
      return chalk.yellow(method);
    case "DELETE":
      return chalk.red(method);
    case "PATCH":
      return chalk.magenta(method);
    default:
      return chalk.white(method);
  }
});

morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
});

const logFormat = `
  :time :method-colored :url :status-colored :response-time ms - :res[content-length]
  Username: :username
  :params :query :body
`;

const requestLogger = morgan(logFormat);

export default requestLogger;
