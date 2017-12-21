(function(factory){
  console.log('installing myTableApp');
  window.myTableApp = factory({});
}(function(myTableApp){
  var config = {
    appContainerId : "default_app_container",
    apiURL : "/table/api",
    updatePeriod : 3000,
  };
  var data = {
    BEdata : {},
    Newdata : {},
    sort : {
      'date' : null,
      'filename' : null,
      'action' : null,
      'submit-type' : null,
      'rating' : null,
    },
    ratingMapping : {
      'clean' : 1,
      'low-risk' : 2,
      'medium-risk' : 3,
      'high-risk' : 4,
      'malicious' : 5
    },
    filter : {
      '24-hours' : 60*60*24*1000,
      '7-days' : 60*60*24*7*1000,
      '4-weeks' : 60*60*24*7*4*1000
    },
    periodFilter: 'all'
  }

  myTableApp.data = data;
  myTableApp.config = config;
  myTableApp.ping = function(callback) {
    if (data.busy) return;
    data.busy = true;
    $.ajax({
      type : "get",
      url : config.apiURL,
      dataType: 'json',
      success : function(response){
        console.log('ping response:',response);
        data.busy = false;
        if(typeof(callback) == 'function'){
          callback(response.data);
        }
      }
    });
  };

  myTableApp.boot = function(cfg){
    myTableApp.loadConfig(cfg);
    //start periodic update on data
    myTableApp.ping((d)=>{
      data.BEdata = d;
      buildView();
    });
    //Save new data, but do NOT build view yet
    setInterval(()=>{
      console.log("Pining");
      myTableApp.ping((d)=>{
        data.Newdata = d;
        detectDataChange();
      });
    },config.updatePeriod)
  }

  function detectDataChange(){
    var filteredData = {
      'new' : [],
      'old' : []
    };
    //Apply Same Filter to both NEW and OLD data
    filteredData['new'] = data.Newdata.filter((e,i)=>{
      var dateNow = Date.now();//return in Ms
      var dateTS = new Date(e.date).getTime();
      var timeDiff = dateNow - dateTS;
      if(data.periodFilter == 'all'){
        return true;
      }else if(timeDiff < data.filter[data.periodFilter]){
        return true;
      }else{
        return false;
      };
    });
    filteredData['old'] = data.BEdata.filter((e,i)=>{
      var dateNow = Date.now();
      var dateTS = new Date(e.date).getTime();
      var timeDiff = dateNow - dateTS;
      if(data.periodFilter == 'all'){
        return true;
      }else if(timeDiff < data.filter[data.periodFilter]){
        return true;
      }else{
        return false;
      };
    })
    //if the of old and new is NOT the same, then alert user to reload
    console.log("New Data Count:",filteredData['new'].length);
    console.log("Old Data Count:",filteredData['old'].length);
    var countNewData = filteredData['new'].length;
    var countOldData = filteredData['old'].length;
    if(countNewData != countOldData){
      console.log("Please Reload");
      $('.error-msg').html('Data is outdated, please reload');
      $('.alert-led').css("color","red");
    }
    return
  }

  myTableApp.loadConfig = function(cfg){
    console.log('loading Config');
    config = $.extend(config,cfg);
  };

  function buildView(){
    var view = "";
    view += buildTimeDropDown();
    view += buildAlertandReloadBtn();
    view += '<div class="table">';
    view += buildTableHeaderView();
    view += `<div class="table-body">`
    view += buildTableBodyView();
    view += '</div>';
    view += '</div>';
    $("#"+config.appContainerId).empty();
    $("#"+config.appContainerId).html(view);
    Events();
  }

  function buildAlertandReloadBtn(){
    var view = "";
    view = `
    <div class="reload-button">
      <button class="reload-btn" type="button">Reload</button>
    </div>
    <div class="reload-alert">
      <i class="fa fa-circle alert-led" aria-hidden="true"></i>
      <span class="error-msg"></span>
    </div>
    `;
    return view;
  }

  function buildTimeDropDown(){
    var view = "";
    view += `
    <div class="selectlable">View data within: </div>
    <select id="period">
      <option value="all"></option>
      <option value="24-hours">24-hours</option>
      <option value="7-days">7-days</option>
      <option value="4-weeks">4-weeks</option>
    </select>
    `;
    return view;
  }

  function buildTableHeaderView(){
    var view = "";
    view += `
    <div class="header">
      <div class="col col1" onclick="myTableApp.togglesort('date')">Date
        <i id="date_sort" class="sort fa fa-sort" aria-hidden="true"></i>
      </div>
      <div class="col col2" onclick="myTableApp.togglesort('filename')">File Name
        <i id="filename_sort" class="sort fa fa-sort" aria-hidden="true"></i>
      </div>
      <div class="col col3" onclick="myTableApp.togglesort('action')">Action
        <i id="action_sort" class="sort fa fa-sort" aria-hidden="true"></i>
      </div>
      <div class="col col4" onclick="myTableApp.togglesort('submit-type')">Submit Type
        <i id="submit-type_sort" class="sort fa fa-sort" aria-hidden="true"></i>
      </div>
      <div class="col col5" onclick="myTableApp.togglesort('rating')">Rating
        <i id="rating_sort" class="sort fa fa-sort" aria-hidden="true"></i>
      </div>
    </div>`
    return view;
  }

  function buildTableBodyView(){
    var view = "";
    data.BEdata.filter((e,i)=>{
      var dateNow = Date.now();//return in Ms
      var dateTS = new Date(e.date).getTime();
      // console.log("Period: ",data.periodFilter);
      // console.log('Now:', dateNow);
      // console.log('TS:', dateTS);
      var timeDiff = dateNow - dateTS;
      // console.log('timeDiff:', timeDiff);
      // console.log('filter:',data.filter[data.periodFilter]);
      if(data.periodFilter == 'all'){
        return true;
      }else if(timeDiff < data.filter[data.periodFilter]){
        return true;
      }else{
        return false;
      };
    }).forEach((e)=>{
      view += `
      <div class="myrow ${e.rating}">
        <div class="col col1">${e.date}</div>
        <div class="col col2">${e.filename}</div>
        <div class="col col3">${e.action}</div>
        <div class="col col4">${e["submit-type"]}</div>
        <div class="col col5" value="${e.rating}">${e.rating}</div>
      </div>
      `;
    });
    return view;
  }

  function rebuildTableView(){
    $('.table-body').empty();
    var view = buildTableBodyView();
    $('.table-body').html(view);
  }

  myTableApp.togglesort = function(key){
    data.sort[key] = !data.sort[key]
    $('.sort').removeClass('fa-sort fa-sort-asc fa-sort-desc').addClass('fa-sort');
    if(data.sort[key]){
      $(`#${key}_sort`).removeClass('fa-sort').addClass('fa-sort-asc');
    }else{
      $(`#${key}_sort`).removeClass('fa-sort').addClass('fa-sort-desc');
    }
    sortTable(key);
    rebuildTableView();
  };

  function sortTable(key){
    var isNumber = false;
    var asc = data.sort[key];

    if(key == 'date' || key == 'rating'){ isNumber = true; };
    return data.BEdata.sort((ele1,ele2)=>{
      //sort using  ele1[key]   ele2[key]
      //determine asec  dec

      if(key == 'date' || key == 'rating'){
        if(key == 'date'){
          //get timestamp -> easier to compare
          var data1 = new Date(ele1[key]).getTime();
          var data2 = new Date(ele2[key]).getTime();
        }else{
          //rating -> map to number (1~5)
          var data1 = data.ratingMapping[ele1[key]];
          var data2 = data.ratingMapping[ele2[key]];
        }
        var output = data1-data2; //(asc)
        if (!asc){//desc
          output = output*-1;
        }
        return output;
      }else{
        var output = ele1[key].localeCompare(ele2[key]);//asc
        if(!asc){//desc
          output = output*-1;
        }
        return output;
      }
    });
  }
  myTableApp.sortTable = sortTable;
  function Events(){
    console.log("Binding Events");
    $('#period').change(function(){
      myTableApp.data.periodFilter = $(this).val();
      rebuildTableView();
    });
    $('.reload-btn').click(function(){
      console.log("Reload btn clicked");
      //write new data to old data(or current data)
      //rebuild table views
      //delete error msg, and turn off alter LED
      var NEWdata = data.Newdata;
      data.BEdata = NEWdata;
      rebuildTableView();
      $('.alert-led').css('color','gray');
      $('.error-msg').empty();
    })
    return;
  };

  return myTableApp;
}))
