#!/bin/bash
# Specific test cases for demonstration

curl -s "http://localhost:3000/search?query=ed" | jq .

curl -s "http://localhost:3000/search?query=the" | jq .

curl -s "http://localhost:3000/search?query=beethoven" | jq .

curl -s \
  -X POST "http://localhost:3000/artist" \
  -H "Content-Type: application/json" \
  -d '{"genre": "Classical", "artist": "Beethoven"}' | jq .

curl -s "http://localhost:3000/search?query=beethoven" | jq .
