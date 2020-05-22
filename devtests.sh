#!/bin/sh

trap ctrl_c INT

function ctrl_c() {
  docker-compose -f docker-compose.test.yaml down
}

docker-compose -f docker-compose.test.yaml up