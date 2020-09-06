#!/usr/bin/env bash
docker rm -f merhant-producer
docker rmi -f merhant-producer
docker image prune -f
docker build . -t merhant-producer
docker run -p 8000:8000 -d --env-file=.env.dev --name=merhant-producer merhant-producer