const app = require("./app");
const { connectDB } = require("./config/db");
const { initAuth, getAuth, mountAuth } = require("./lib/auth");
const { PORT } = require("./config/env");

const main = async () => {
  try {
    await connectDB();
    initAuth();
    mountAuth(app, getAuth());

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("failed to start the server!", error.message);
    process.exit(1);
  }
};

main();
