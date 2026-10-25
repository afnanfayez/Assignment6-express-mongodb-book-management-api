# Assignment 6 — MongoDB and Express

An Assignment 7 implementation using Express.js, JavaScript, and the official MongoDB Node.js driver. It includes 19 REST API solutions, matching Mongosh commands, a Postman collection, and a Roman numeral conversion bonus. Mongoose and Sequelize are not used.

## Run the API

1. Start MongoDB locally at `mongodb://127.0.0.1:27017`.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` if needed.
4. Start the server with `npm start`.

The API runs at `http://localhost:3000` and uses the `assignment7_express` database by default. Import `postman/Assignment7.postman_collection.json` to try the endpoints.

## Other assignment files

- `mongosh-solutions.txt` — Q01–Q19 using the Mongosh API and the separate `assignment7_mongosh` database. Run with `mongosh "mongodb://127.0.0.1:27017" --file ".\mongosh-solutions.txt"`.
- `bonus.js` — Roman numeral conversion exercise.
- `docs/` — Setup, Compass, Mongosh, testing, and submission guides.
- `tests/` — MongoDB integration tests; run with `npm test`.
