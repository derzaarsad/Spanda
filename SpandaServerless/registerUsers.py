#!/usr/bin/python

import json
import sys
from subprocess import check_output
response = check_output(['curl', '-X', 'POST', '-H','Content-Type:application/x-www-form-urlencoded', '--data', 'grant_type=client_credentials&client_id=' + sys.argv[1] + '&client_secret=' + sys.argv[2], 'https://sandbox.finapi.io/oauth/token']).split(b'\n')[0]
access_token = json.loads(response)["access_token"]
response = ""
for i in range(3,len(sys.argv)):
    response += check_output(['curl', '-X', 'POST', '-H','Content-Type:application/json', '-H','Authorization:Bearer ' + access_token, '--data', '{\"id\":\"' + sys.argv[i] + '\",\"password\":\"' + sys.argv[i] + '\"}', 'https://sandbox.finapi.io/api/v1/users']).split(b'\n')[0]
    response += '\n'
print(response)
sys.exit(0)