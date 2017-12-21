from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.template import loader
from django.http import JsonResponse
from table.models import MetaFiles
import json
import os
from django.conf import settings


# Create your views here.

def index(request):
    html = """
    <h1>Let's make a table!</h1>
    """
    context = {'message':'Hello'}
    return render(request, 'index.html', context)

def api(request):
    response = {
        "data" : "",
        "status" : 1
    }
    #call ScanDIR to get file data
    filedata = MetaFiles.ScanDIR();
    response['data'] = filedata

    return JsonResponse(response,safe=False)
