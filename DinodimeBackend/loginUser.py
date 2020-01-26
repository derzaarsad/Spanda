#!/usr/bin/python

import json
import sys
from subprocess import check_output
response = check_output(['curl', '-X', 'POST', '-H','Content-Type:application/x-www-form-urlencoded', '--data', 'grant_type=password&client_id=' + sys.argv[1] + '&client_secret=' + sys.argv[2] + '&username=' + sys.argv[3] + '&password=' + sys.argv[4], 'https://sandbox.finapi.io/oauth/token']).split(b'\n')[0]
access_token = json.loads(response)["access_token"]
print(access_token)
sys.exit(0)