from django.conf.urls import url
from . import views

app_name = 'table'

urlpatterns = [
  # /table/
  url(r'^$', views.index, name='index'), ##default home page

  # /table/ajax
  url(r'^api$', views.api, name='api'), ##default home page
]
