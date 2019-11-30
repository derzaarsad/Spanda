#!/usr/bin/python

import json
import sys
from subprocess import check_output
response = check_output(['curl', '-X', 'POST', '-H','Content-Type:application/json', '-H','Authorization:Bearer ' + sys.argv[1], '--data', '{\"bankId\":277672}', 'https://sandbox.finapi.io/api/v1/bankConnections/import']).split(b'\n')[0]
webformId = json.loads(response)["errors"][0]["message"]
response = check_output(['curl', '-X', 'GET', '-H','Content-Type:application/json', '-H','Authorization:Bearer ' + sys.argv[1], 'https://sandbox.finapi.io/api/v1/webForms/' + webformId ]).split(b'\n')[0]
webformUrl = 'https://sandbox.finapi.io/webForm/' + json.loads(response)["token"]
print(webformUrl)
sys.exit(0)