#!/bin/bash

ENV=$1

if [[ -z "$ENV" ]]
then
    echo "You must provide 'NODE_ENV' value as parameter!"
    echo "Can't start without it, try it again..."
    exit -1
fi

echo "Starting vhp-backend server with env: $ENV"

NODE_ENV=$ENV npm start