const { createApp } = require("./app");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function main() {
  const app = createApp();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
  });
}

main();