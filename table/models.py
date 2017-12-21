from django.db import models
from django.core.files import File
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os
import json

class MetaFiles(models.Model):

    def ScanDIR():
        # Scan dir, then loop through all meta files to get data
        # merge the the newFile to the alreadyExistFile
        path = os.path.join(settings.BASE_DIR, 'table/metafiles/')
        mergedfile = []
        oldfiles = []
        for entry in os.scandir(path):
            path = os.path.join(settings.BASE_DIR, 'table/metafiles/',entry.name)
            fs = open(path,'r')
            try:
                newfile = json.loads(fs.read())
            except json.decoder.JSONDecodeError:
                print(entry.name + "has invalid JSON format, skipping...")
                continue;
            mergedfile = newfile + oldfiles
            oldfiles = mergedfile
        return mergedfile
