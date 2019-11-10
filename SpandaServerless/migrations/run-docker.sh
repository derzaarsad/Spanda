#!/bin/bash
set -e
docker run --name postgres -v ${PWD}/postgres:/docker-entrypoint-initdb.d postgres:12
