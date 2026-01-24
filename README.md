# PerformYard-Challenge

A simple Node-native API that searches a data set and adds to a dataset.

This has 3 main layers:

`index.ts`, runs the actual server.

`Routes` layer, exposes the routes and contains the router files for each route that parses the data.

`Services` layer, works with the databaseService to parse data or add to the data.

`databaseService` layer, loads the data from the .json file and stores and loads data in memory for any queries. 

# Developing

How to run:
`npm install`
`npm run build`
`npm run start`

Some sample CURLs:
curl -s "http://localhost:3000/search?query=ed" | jq .

curl -s \
  -X POST "http://localhost:3000/artist" \
  -H "Content-Type: application/json" \
  -d '{"genre": "Classical", "artist": "Beethoven"}' | jq .

# Testing
Unit tests can be run using `npm run test`
Coverage can be checked using `npm run test:coverage`

# Linting
This project uses `Biome` to lint.
Linting can be run with `npm run lint`