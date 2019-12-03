#!/usr/bin/python

import json
import sys
from subprocess import check_output
response = check_output(['curl', '-X', 'GET', '-H','Content-Type:application/json', '-H','Authorization:Bearer ' + sys.argv[1], 'https://sandbox.finapi.io/api/v1/webForms/' + sys.argv[2] ]).split(b'\n')[0]
webformUrl = 'https://sandbox.finapi.io/webForm/' + json.loads(response)["token"]
print(webformUrl)
sys.exit(0)