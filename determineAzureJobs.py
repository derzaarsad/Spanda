import sys
from subprocess import check_output
currentBranch = check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).split(b'\n')
changedFilesList = check_output(['git', 'diff', '--name-only', currentBranch[0].decode('utf-8'), 'origin/master']).split(b'\n')
anyApp = any(item.startswith(b'SpandaApp/') for item in changedFilesList)
anyServerless = any(item.startswith(b'DinodimeBackend/') for item in changedFilesList)
anyShared = any(item.startswith(b'DinodimeShared/') for item in changedFilesList)

retText = '##vso[task.setvariable variable=jobName;isOutput=true]'

if anyShared == True:
    print(retText + 'All')
elif anyApp == False:
    print(retText + 'Serverless')
elif anyServerless == False:
    print(retText + 'App')
else:
    print(retText + 'All')
sys.exit(0)