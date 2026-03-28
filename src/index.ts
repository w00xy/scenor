import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const IP = process.env.IP || '0.0.0.0';

const server = app.listen(PORT, IP ,() => {
  console.log(`Server started on port ${PORT}`);
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
