const app = require("./index");
const { PORT } = require("./config/env");
const connectDB = require("./config/db.js");

const main = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("failed to start the server!", error.message);
    process.exit(1);
  }
};

main();
