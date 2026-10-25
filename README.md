# Assignment 7 — MongoDB and Express

This project implements Assignment 7 with Express.js, JavaScript, and the official MongoDB Node.js driver. It contains 19 REST API operations, equivalent Mongosh solutions, and a Roman numeral conversion bonus. It does not use Mongoose or Sequelize.

## Run the API

1. Start a local MongoDB server at `mongodb://127.0.0.1:27017`.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env` if you need to override the defaults.
4. Start the server: `npm start`.

The API listens on `http://localhost:3000` and uses the `assignment7_express` database by default.

## Other solutions

- `mongosh-solutions.txt` contains Q01–Q19 and uses the separate `assignment7_mongosh` database. Run it with `mongosh "mongodb://127.0.0.1:27017" --file ".\mongosh-solutions.txt"`.
- `bonus.js` contains the Roman numeral conversion exercise. Run it with `node bonus.js`.
