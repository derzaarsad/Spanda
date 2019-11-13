#!/bin/bash
set -e
docker run --rm -p 5432:5432 --name postgres -v ${PWD}/postgres:/docker-entrypoint-initdb.d postgres:12
