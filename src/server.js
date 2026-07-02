// server.js
const app = require("./app");
const { connectDB } = require("./config/db");
const { initAuth, getAuth, mountAuth } = require("./lib/auth");
const { PORT } = require("./config/env");
const registerRoutes = require("./routes"); // Import the routing function

const main = async () => {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Initialize auth layer now that DB is active
    initAuth();

    // 3. Mount auth middleware onto express app instance
    mountAuth(app, getAuth());

    // 4. Mount application routes AFTER auth has been initialized and mounted
    registerRoutes(app);

    // 5. Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("failed to start the server!", error.message);
    process.exit(1);
  }
};

main();
