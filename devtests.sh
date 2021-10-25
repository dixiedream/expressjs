#!/bin/sh

trap ctrl_c INT

function closeAll {
  docker-compose -f docker-compose.test.yaml down
}

function ctrl_c() {
  closeAll
}

#docker-compose -f docker-compose.test.yaml up
docker-compose -f docker-compose.test.yaml run tests

closeAll