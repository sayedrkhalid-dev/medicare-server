require("dotenv").config();

const stripe = require("./src/lib/stripe");

(async () => {
  const balance = await stripe.balance.retrieve();

  console.log(balance);
})();
