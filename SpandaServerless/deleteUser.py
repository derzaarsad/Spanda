#!/usr/bin/python

import json
import sys
from subprocess import check_output
print(sys.argv)
sys.exit(0)
response = check_output(['curl', '-X', 'POST', '-H','Content-Type:application/x-www-form-urlencoded', '--data', 'grant_type=client_credentials&client_id=' + sys.argv[1] + '&client_secret=' + sys.argv[2], 'https://sandbox.finapi.io/oauth/token']).split(b'\n')[0]
access_token = json.loads(response)["access_token"]
response = check_output(['curl', '-X', 'POST', '-H','Content-Type:application/json', '-H','Authorization:Bearer ' + access_token, '--data', '{\"userIds\":[\"' + sys.argv[3] + '\"]}', 'https://sandbox.finapi.io/api/v1/mandatorAdmin/deleteUsers']).split(b'\n')[0]
print(response)
sys.exit(0)