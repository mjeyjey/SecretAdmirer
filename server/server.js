require("dotenv").config();

const express = require("express");
const cors = require("cors");

const emailRoutes = require("./routes/emailRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const configuredClientUrl = process.env.CLIENT_URL?.trim();
const clientUrl = configuredClientUrl
  ? /^https?:\/\//i.test(configuredClientUrl)
    ? configuredClientUrl
    : `https://${configuredClientUrl}`
  : undefined;

app.use(
  cors({
    origin: clientUrl,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use("/api", emailRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Secret Admirer API is running.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});