import sys
from subprocess import check_output
currentBranch = check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).split(b'\n')
changedFilesList = check_output(['git', 'diff', '--name-only', currentBranch[0], 'origin/master']).split(b'\n')
anyApp = any(item.startswith(b'SpandaApp/') for item in changedFilesList)
anyServerless = any(item.startswith(b'SpandaServerless/') for item in changedFilesList)

retText = '##vso[task.setvariable variable=jobName;isOutput=true]'

if anyApp == False:
    print(retText + 'Serverless')
    sys.exit(0)
if anyServerless == False:
    print(retText + 'App')
    sys.exit(0)
print(retText + 'All')
sys.exit(0)