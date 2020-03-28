import sys
import os.path
from os import path

filesToCheck = sys.argv[1].split(";")

for file in filesToCheck:
    if(path.exists(file) == False):
        raise Exception(file + " is not exist!")
    else:
        print(file + " is exist...")
sys.exit(0)