import sys
from subprocess import check_output
changedFilesList = check_output([b'git', b'diff', b'--name-only']).split(b'\n')
anyApp = any(item.startswith(b'SpandaApp/') for item in changedFilesList)
anyServerless = any(item.startswith(b'SpandaServerless/') for item in changedFilesList)

retText = b'##vso[task.setvariable variable=jobName;isOutput=true]'

if anyApp == False:
    print(retText + b'Serverless')
    sys.exit(0)
if anyServerless == False:
    print(retText + b'App')
    sys.exit(0)
print(retText + b'All')
sys.exit(0)