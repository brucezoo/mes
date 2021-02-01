/*
*
* pageNo,pageSize  分页参数
* ajaxData 存放搜索参数
* selectDate 根据参数调用日期组件
* order_mode : 1(截止日期) 2（开始日期） 3（优先级）
* status： 0（未发布）1(已发布)2（已拆完）3（已排完）
*
* */

var pageNo = 1,
  pageSize = 15,
  ajaxData = {},
  count_down,
  workCenterPlan,
  close = 1,
  work_center_id = [],
  orderList = {},//组合排数据对象
  workOrderIdAndWorkhour = [],
  workOrderIschecked = {},
  dragManager,
  splitStatus = 0;

var validatorToolBox = {
  checkWorkBench: function (name) {
    var value = $('#' + name).val().trim();
    return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (benchCorrect = !1, !1) :
      Validate.checkNull(value) ? (showInvalidMessage(name, "*请选择工作台"), benchCorrect = !1, !1) :
        (benchCorrect = 1);
  }
},
  validatorConfig = {
    workBench: "checkWorkBench",
  };

//显示错误信息
function showInvalidMessage(name, val) {
  $('.addThinProduction').find('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addThinProduction_form').find('.submit').removeClass('is-disabled');
}

var pOrderList = [];

$(function () {
  getLaydate('start_time');//设置初始时间
  getLaydate('end_time');//设置初始结束时间
  bindEvent();//绑定按钮事件
  getAllOperation();//获取所有工序
});

function setAjaxData() {
  var ajaxDataStr = window.location.hash;
  var planStartTime = '';
  try {
    ajaxData = {
      start_time: planStartTime,
      end_time: '',
      work_center_id: '',
      operation_id: '',
      work_shift_id: '',
      order: 'desc',
      sort: 'id'
    }
    delete ajaxData.pageNo;
    // pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
  } catch (e) {
    resetParam();
  }
  //}
}

// 重置搜索参数
function resetParam() {
  var parentForm = $("#searchReleased_from");
  var planStartDate = '', planStartTime = '', workStationDate = '', workStationTime = '';
  if ($('#work_station_time').val()) {
    workStationDate = new Date($('#work_station_time').val() + ' 00:00:00');
    workStationTime = Math.round(workStationDate.getTime() / 1000);
  }
  if (parentForm.find("#plan_start_time").val()) {
    planStartDate = new Date(parentForm.find('#plan_start_time').val() + ' 00:00:00');
    planStartTime = Math.round(planStartDate.getTime() / 1000);
  }
  ajaxData = {
    start_time: planStartTime,
    end_time: '',
    work_center_id: '',
    operation_id: '',
    work_shift_id: '',
    order: 'desc',
    sort: 'id'
  }
}

//时间组件
function getLaydate(flag, normal, val) {
  if (flag == 'time') {
    $('.el-form-item.select_time').find('.errorMessage').hide().html('');
    var startDate = workCenterPlan[0].work_time_start;
    var endDate = workCenterPlan[workCenterPlan.length - 1].work_time_end;
    //排班开始时间毫秒数
    var startDateMs = new Date(normal + " " + startDate).getTime();
    //排班结束时间毫秒数
    var startMs = new Date(normal + ' 00:00:00').getTime();
    var minRange = startDateMs > startMs ? normal + " " + startDate : normal + ' 00:00:00',
      maxRange = normal + " " + endDate;
    laydate.render({
      elem: '#' + flag,
      type: 'time',
      format: 'HH:mm:ss',
      position: 'fixed',
      done: function (value) {
        $('.work_station_time').find('.errorMessage').hide().html('');
      }
    });
  } else {
    var _date = _getCurrentDate(flag);
    laydate.render({
      elem: '#' + flag,
      value: _date,
      done: function (value) {
        $('.work_station_time').find('.errorMessage').hide().html('');
      }
    });
  }
}

//31:30:00 to DAY +1 07:30:00
function dateToDayTime(val) {
  var dayTime = val.split(":");
  var dayTimeVal;
  if (dayTime[0] / 24 >= 1) {
    dayTimeVal = "DAY +" + Math.floor(dayTime[0] / 24) + ((dayTime[0] % 24) < 10 ? " 0" + dayTime[0] % 24 : " " + dayTime[0] % 24) + ":" + dayTime[1] + ":" + dayTime[2];
  } else {
    dayTimeVal = val;
  }
  return dayTimeVal;
}

//获取当前格式化时间
function _getCurrentDate(flag, normal) {
  var date = new Date();
  if (flag == 'date') {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }

    var _date = date.getFullYear() + seperator1 + month + seperator1 + strDate;

    if (_date == normal) {
      return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    } else {
      return false;
    }
  } else {
    var _month = date.getMonth() + 1;
    var _date = date.getDate();
    if (_month >= 1 && _month <= 9) {
      _month = '0' + _month
    }
    if (_date >= 1 && _date <= 9) {
      _date = '0' + _date
    }
    var _current = date.getFullYear() + '-' + _month + '-' + _date;
    return _current;
  }
}

//获取工作中心绑定的排班
//添加排班时间休息时间
function showWorkCenterRankPlan(id, acid, time, end_time) {
  var str_date_time = time.split(' ');
  var _time = formatDuring(end_time);
  AjaxClient.get({
    url: URLS['thinPro'].rankPlan + '?' + _token + '&work_center_id=' + id + '&actual_work_center_id=' + acid + '&work_station_time=' + str_date_time[0],
    dataType: 'json',
    async: false,
    success: function (rsp) {
      var data = rsp.results;
      var restTime = [];
      var html = `<div style="height:35px;line-height:35px;color:#000;">班次时间: `;
      var rhtml = `<div style="height:35px;line-height:35px;color:#000;">休息时间: `;
      var bgc = '';
      if (data && data.length) {
        workCenterPlan = data;
        data.forEach(function (val, i) {
          if (i == 0) {
            bgc = '#FAF2EB';
          } else if (i == 1) {
            bgc = '#EBFAEF';
          } else if (i == 2) {
            bgc = '#FFF1F8';
          }
          var rest_time_start = val.rest_time_start.split(":");
          var rest_time_end = val.rest_time_end.split(":");
          var work_time_start = val.work_time_start.split(":");
          var work_time_end = val.work_time_end.split(":");
          if (rest_time_start[0] / 24 >= 1) {
            rest_time_start_val = "DAY +" + Math.floor(rest_time_start[0] / 24) + ((rest_time_start[0] % 24) < 10 ? " 0" + rest_time_start[0] % 24 : " " + rest_time_start[0] % 24) + ":" + rest_time_start[1] + ":" + rest_time_start[2];
          } else {
            rest_time_start_val = val.rest_time_start;
          }
          if (rest_time_end[0] / 24 >= 1) {
            rest_time_end_val = "DAY +" + Math.floor(rest_time_end[0] / 24) + ((rest_time_end[0] % 24) < 10 ? " 0" + rest_time_end[0] % 24 : " " + rest_time_end[0] % 24) + ":" + rest_time_end[1] + ":" + rest_time_end[2];
          } else {
            rest_time_end_val = val.rest_time_end;
          }
          if (work_time_start[0] / 24 >= 1) {
            work_time_start_val = "DAY +" + Math.floor(work_time_start[0] / 24) + " " + ((work_time_start[0] % 24) < 10 ? " 0" + work_time_start[0] % 24 : " " + work_time_start[0] % 24) + ":" + work_time_start[1] + ":" + work_time_start[2];
          } else {
            work_time_start_val = val.work_time_start;
          }
          if (work_time_end[0] / 24 >= 1) {
            work_time_end_val = "DAY +" + Math.floor(work_time_end[0] / 24) + " " + ((work_time_end[0] % 24) < 10 ? " 0" + work_time_end[0] % 24 : " " + work_time_end[0] % 24) + ":" + work_time_end[1] + ":" + work_time_end[2];
          } else {
            work_time_end_val = val.work_time_end;
          }
          restTime.push({ 'rest_time_start': val.rest_time_start, 'rest_time_end': val.rest_time_end });
          html += `<span style="background:${bgc};margin-left: 10px">${val.name}:&nbsp;&nbsp;${work_time_start_val} ~ ${work_time_end_val}</span>`;
          rhtml += `<span style="background-color:#F0F0F0;margin-left:10px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${rest_time_start_val} ~ ${rest_time_end_val}</span>`;
        })
        html += `</div>`
        rhtml += `</div>`
        $("#work-center-rank-plan").html(html);
        $("#work-center-rank-plan").append(rhtml);
        //班次结束时间
        var work_time_end = "23:59:59";
        work_time_end_arr = work_time_end.split(':');
        var work_order_end_time = work_time_end_arr[0] * 3600000 + work_time_end_arr[1] * 60000 + work_time_end_arr[2] * 1000;
        if (end_time && restTime && restTime.length) {
          restTime.forEach(function (val, i) {
            var rest_time_start_arr = val.rest_time_start.split(':');
            var rest_time_end_arr = val.rest_time_end.split(':');
            var time_diff = (rest_time_end_arr[0] * 3600000 + rest_time_end_arr[1] * 60000 + rest_time_end_arr[2] * 1000) - (rest_time_start_arr[0] * 3600000 + rest_time_start_arr[1] * 60000 + rest_time_start_arr[2] * 1000);
            //排班开始时间毫秒数
            var work_time_start_arr = str_date_time[1].split(':');
            var work_time_start_ms = work_time_start_arr[0] * 3600000 + work_time_start_arr[1] * 60000 + work_time_start_arr[2] * 1000;
            //开始休息时间毫秒数
            var rest_time_start_arr_ms = rest_time_start_arr[0] * 3600000 + rest_time_start_arr[1] * 60000 + rest_time_start_arr[2] * 1000;
            //if (rest_time_start_arr_ms > work_time_start_ms && rest_time_start_arr_ms < end_time) {
            //如果排班包含休息时间，加休息时间
            //end_time += time_diff;
            if (work_order_end_time < end_time) {
              end_time = work_order_end_time;
              _time = formatDuring(end_time);
              //break;
            } else {
              _time = formatDuring(end_time);
            }
            //}
          })

        }
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
  return _time;
}

function formatTimeNow(time) {
  var cur = new Date(time);
  var hour = cur.getHours() < 10 ? '0' + cur.getHours() : cur.getHours();
  var min = cur.getMinutes() < 10 ? '0' + cur.getMinutes() : cur.getMinutes();
  var sec = cur.getSeconds() < 10 ? '0' + cur.getSeconds() : cur.getSeconds();
  var dateStr = cur.getFullYear() + '/' + Number(cur.getMonth() + 1) + '/' + cur.getDate() + ' ' + hour + ':' + min + ':' + sec;
  return dateStr;
}

//获取所有工序列表
function getAllOperation() {
  //var id = $('#workcenter_id').val();
  AjaxClient.get({
    url: URLS['pro'].operation + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '', innerHtml = '';
      $('.el-form-item.operation_name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      if (rsp.results && rsp.results.list.length) {
        rsp.results.list.forEach(function (item) {
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.operation_name').find('.el-select-dropdown-list').append(innerHtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工序列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

//获取工序下所有工作中心
function getAllWorkCenter(oid) {
  AjaxClient.get({
    url: URLS['pro'].getWorkCentersByOperation + '?' + _token + '&operation_id=' + oid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('.el-form-item.work_center_name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.workcenter_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.workcenter_name}</li>`;
        });
        //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
        innerHtml = `${lis}`;
        $('.el-form-item.work_center_name').find('.el-select-dropdown-list').append(innerHtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工作中心列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

//获取已经排单的工单
function getcarefulPlan(stime, time) {
  var data = {}, startDate;
  var flag=true;
  var op_id=$("#operation_id").val();
  var wcid = $("#work_center_id").val();
  if(!op_id){
    layer.msg('请先选择工序', { icon: 5, offset: '250px', time: 1500 });
    flag=false;
  }else if(!wcid){
    layer.msg('请先选择工作中心', { icon: 5, offset: '250px', time: 1500 });
    flag=false;
  }
  
  if(flag){
  if (stime != undefined && stime) {
    data = {
      _token: TOKEN,
      plan_start_time: stime,
      work_center_id: wcid,
      actual_work_center_id: '',
      time: time
    };
    startDate = dateFormat(stime, 'Y-m-d');
  } else {
    data = {
      _token: TOKEN,
      plan_start_time: '',
      work_center_id: wcid,
      time: time
    };
    startDate = time;
  }
  AjaxClient.post({
    url: URLS['thinPro'].carefulPlan,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var data = [];
        rsp.results.forEach(function (item) {
          var infor = {};
            infor.device = item.device;
            infor.name = item.name;
            infor.name = item.name;
            infor.task_list = item.task_list.reverse();
            data.push(infor);
            infor = null;
        })

      // for(var i=0;i<)

      $('.gantt-div-wrap .GanttWrap').html('');

      if (rsp && rsp.results && rsp.results.length) {
          // data.forEach(function (item) {
          //     if(item.task_list.length>0){
          //         item.task_list = item.task_list.reverse();
          //     }
          // })
        var ganttChart = function () {
          $(".GanttWrap").GanttTool({
            'startDate': startDate,
            'ajaxUrl': null,
            'arrdata': data,
            'layer': null,
            'parameters': {}, //其他参数
            'fn': null //回调方法
          });
        };
        ganttChart();
      }
      var theight = $('.GanttTitle').find('tbody').height();
      $('.GanttTaskWrap .GanttTaskDiv').height(theight + 60);
      //激活拖动事件
      $('.GanttTask').drag({
        isLimit: true,
        boundaryElem: '.GanttTaskDiv'
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}
}

//全屏方法
function toggleFullScreen(el) {
  var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
  if (!isFullscreen) {//进入全屏,多重短路表达式
    (el.requestFullscreen && el.requestFullscreen()) ||
      (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
      (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen());
    el.style.background="white";
    //el.style.fontSize="20px";
    document.getElementById('GanttWrap').style.width = (document.documentElement.clientWidth) + "px";
    document.getElementById('GanttWrap').style.height = (document.documentElement.clientHeight) + "px";
    // var dom = document.getElementsByClassName('showItem')
    // for (var i = 0; i < dom.length; i++) {
    //   dom[i].style.display = 'none';
    // }
  } else {	//退出全屏,三目运算符
    document.exitFullscreen ? document.exitFullscreen() :
      document.mozCancelFullScreen ? document.mozCancelFullScreen() :
        document.webkitExitFullscreen ? document.webkitExitFullscreen() : '';
    //el.style.color="#393939";
    document.getElementById('GanttWrap').style.height = "433px";
    //el.style.fontSize="12px";
    // var dom = document.getElementsByClassName('showItem')
    // for (var i = 0; i < dom.length; i++) {
    //   dom[i].style.display = 'block';
    // }
  }
}

function bindEvent() {
  //点击全屏
  $('body').on('click', '#searchReleased_from .toggleFullScreen', function (e) {
    let ele = document.getElementById('content_wrap');
    var el = document.getElementById('toggleFullScreen');//target兼容Firefox
    el.innerHTML == '点我全屏' ? el.innerHTML = '退出全屏' : el.innerHTML = '点我全屏';
    toggleFullScreen(ele);
  });

  //点击提交按钮
  $('body').on('click', '.submit:not(.is-disabled)', function (e) {
    //工单搜索
    if ($(this).hasClass('searchWo-submit')) {
      e.stopPropagation();
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
      var parentForm = $("#searchReleased_from");
      var workStartTime = '',
        workEndTime = '';
      var status = $("#status-spans").find(".active").attr("data-status");
      if (parentForm.find('#start_time').val()) {
        workStartDate = new Date(parentForm.find('#start_time').val() + ' 00:00:00');
        workStartTime = Math.round(workStartDate.getTime() / 1000);
      }
      var operation_id=parentForm.find('#operation_id').val();
      var work_center_id=parentForm.find('#work_center_id').val();
      pageNo = 1;
      ajaxData = {
        start_time: encodeURIComponent(workStartTime),
        operation_id: encodeURIComponent(parentForm.find('#operation_id').val().trim()),
        work_center_id: encodeURIComponent(parentForm.find('#work_center_id').val().trim()),
        order: 'desc',
        sort: 'id',
      };
      if (workStartTime != '') {
        $('.el-form-item.work-start-time').find('.errorMessage').html('');
      } else {
        if (workStartTime == '') {
          $('.el-form-item.work-start-time').find('.errorMessage').show().html('*请选择开始时间');
        }
      }

      var time = parentForm.find('#start_time').val();
      var stime = Date.parse(parentForm.find('#start_time').val() + ' 00:00:00') / 1000;
      getcarefulPlan(stime, time);
    }
  })

  //排班输入框的相关事件
  $('body').on('focus', '#addThinProduction_form .el-input', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '#addThinProduction_form .el-input:not([readonly])', function () {
    var flag = $('#addFactory_from').attr("data-flag"),
      name = $(this).attr("id");
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name)
  });

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });

  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  // 下拉框item点击事件
  $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      ele.find('.plan_type_id').val($(this).attr('data-plan-type-id'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //点击工序
  $('body').on('click', '.el-select-dropdown #select-operation .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var operation_id = $("#operation_id").val()
    var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
    var idval = $(this).attr('data-id');
    $("#work_center_name").val('--请选择--');
    $("#work_center_id").val('');
    getAllWorkCenter(operation_id);
  })

  //点击其他区域下拉框消失
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
    if (!obj.hasClass('searchModal') && obj.parents(".searchModal").length === 0) {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
    }
  });

  // 搜索重置
  $('body').on('click', '#searchReleased_from .reset', function (e) {
    e.stopPropagation();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $(this).parents('#searchReleased_from');
    var status = $("#status-spans").find(".active").attr("data-status");
    getLaydate('work_station_time');
    getLaydate('work_end_time');
    getLaydate('plan_start_time');
    parentForm.find('#operation_name').val('--请选择--');
    parentForm.find('#rank_plan_name').val('--请选择--');
    parentForm.find('#work_center_name').val('--请选择--');
    parentForm.find('#work_bench_name').val('--请选择--');
    parentForm.find('#work_center_id').val('');
    parentForm.find('#operation_id').val('');
    parentForm.find('#sales_order_code').val('');
    parentForm.find('#sales_order_project_code').val('');
    parentForm.find('#product_order_number').val('');
    parentForm.find('#work_order_number').val('');
    parentForm.find('#work_bench_number').val('');
    parentForm.find('#ma_item_no').val('');
    resetParam();
    getPo(status);
  });

  // 更多搜索条件下拉
  $('#searchReleased_from').on('click', '.arrow:not(".noclick")', function (e) {
    e.stopPropagation();
    $(this).find('.el-icon').toggleClass('is-reverse');
    var that = $(this);
    that.addClass('noclick');
    if ($(this).find('.el-icon').hasClass('is-reverse')) {
      $('#searchForm .el-item-show').css('background', '#e2eff7');
      $('#searchForm .el-item-hide').slideDown(400, function () {
        that.removeClass('noclick');
      });
    } else {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
        that.removeClass('noclick');
      });
    }
  });
}

//注册左右移动事件
$.fn.extend({
  drag: function (options) {
    var dragStart, dragMove, dragEnd,
      $boundaryElem, b_width,
      limitObj, diffX,
      win_width = $(window).width();

    function _initOptions() {
      var noop = function () { }, defaultOptions;

      defaultOptions = {          // 默认配置项
        boundaryElem: 'body',   // 边界容器
        isLimit: false          // 是否限制拖动范围
      };
      options = $.extend(defaultOptions, options || {});

      // 边界元素及其宽高
      $boundaryElem = $(options.boundaryElem);
      b_width = $boundaryElem.innerWidth();
      b_height = $boundaryElem.innerHeight();

      dragStart = options.dragStart || noop,
        dragMove = options.dragMove || noop,
        dragEnd = options.dragEnd || noop;
    }

    function _drag(e) {
      var clientX, offsetLeft, width, height,
        $target = $(this), self = this;

      // 记录鼠标按下时的位置及拖动元素的相对位置
      clientX = e.clientX;
      offsetLeft = this.offsetLeft;

      width = $target.outerWidth();
      height = $target.outerHeight();

      limitObj = {
        _left: 0,
        _right: (b_width || win_width) - width
      };

      // 拖动元素是否超出了限制边界
      isBeyound = width > b_width && height > b_height;
      if (isBeyound) {
        diffX = b_width - width;
      }

      dragStart.apply(this, arguments);
      $(document).bind('mousemove', moveHandle)
        .bind('mouseup', upHandle);

      // 鼠标移动事件处理
      function moveHandle(e) {

        var e_diffX = e.clientX - clientX,
          x = e_diffX + offsetLeft;

        if (options.isLimit && !isBeyound) {
          x = Math.max(Math.min(x, limitObj._right), limitObj._left);
        }

        if (options.isLimit && isBeyound) {
          x = e_diffX < 0 ? Math.max(x, diffX) : Math.min(x, 0);
        }

        $('.GanttTask,.GanttTaskFixed').css({
          left: x + 'px'
        });

        dragMove.apply(self, arguments);
        // 阻止浏览器默认行为(鼠标在拖动图片一小段距离，会出现一个禁止的小提示，即：图片不能再拖动)
        e.preventDefault();
      }

      // 鼠标弹起事件处理
      function upHandle(e) {
        $(document).unbind('mousemove', moveHandle);
        dragEnd.apply(self, arguments);
      }
    }

    _initOptions(); // 初始化配置对象

    $(this)
      .css({ position: 'absolute' })
      .each(function () {
        $(this).bind('mousedown', function (e) {
          if ($(this).data('data-resize')) {
            return;
          }
          _drag.apply(this, [e]);
          // 阻止区域文字被选中 for chrome firefox ie9
          e.preventDefault();
          // for firefox ie9 || less than ie9
          window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        });
      });
    return this;
  }
});

function dragTable() {
  //绑定事件
  var addEvent = document.addEventListener ? function (el, type, callback) {
    el.addEventListener(type, callback, !1);
  } : function (el, type, callback) {
    el.attachEvent("on" + type, callback);
  }
  //移除事件
  var removeEvent = document.removeEventListener ? function (el, type, callback) {
    el.removeEventListener(type, callback);
  } : function (el, type, callback) {
    el.detachEvent("on" + type, callback);
  }
  //精确获取样式
  var getStyle = document.defaultView ? function (el, style) {
    return document.defaultView.getComputedStyle(el, null).getPropertyValue(style)
  } : function (el, style) {
    style = style.replace(/-(w)/g, function ($, $1) {
      return $1.toUpperCase();
    });
    return el.currentStyle[style];
  }
  dragManager = {
    clientY: 0,
    draging: function (e) {//mousemove时拖动行
      var dragObj = dragManager.dragObj;
      if (dragObj) {
        e = e || event;
        if (window.getSelection) {//w3c
          window.getSelection().removeAllRanges();
        } else if (document.selection) {
          document.selection.empty();//IE
        }
        var y = e.clientY;
        var down = y > dragManager.clientY;//是否向下移动
        var tr = document.elementFromPoint(e.clientX, e.clientY);
        if (tr && tr.nodeName == "TD") {
          tr = tr.parentNode
          dragManager.clientY = y;
          if (dragObj !== tr) {
            tr.parentNode.insertBefore(dragObj, (down ? tr.nextSibling : tr));
          }
        };
      }
    },
    dragStart: function (e) {
      e = e || event;
      var target = e.target || e.srcElement;
      if (target.nodeName === "TD") {
        target = target.parentNode;
        dragManager.dragObj = target;
        if (!target.getAttribute("data-background")) {
          var background = getStyle(target, "background-color");
          target.setAttribute("data-background", background)
        }
        //显示为可移动的状态
        target.style.backgroundColor = " #ccc";
        target.style.cursor = "move";
        dragManager.clientY = e.clientY;
        addEvent(document, "mousemove", dragManager.draging);
        addEvent(document, "mouseup", dragManager.dragEnd);
      }
    },
    dragEnd: function (e) {
      var dragObj = dragManager.dragObj
      if (dragObj) {
        e = e || event;
        var target = e.target || e.srcElement;
        if (target.nodeName === "TD") {
          target = target.parentNode;
          // dragObj.style.backgroundColor = dragObj.getAttribute("data-background");
          // dragObj.style.cursor = "default";
          dragManager.dragObj = null;
          removeEvent(document, "mousemove", dragManager.draging);
          removeEvent(document, "mouseup", dragManager.dragEnd);
        }
      }
    },
    main: function (el) {
      addEvent(el, "mousedown", dragManager.dragStart);
    }
  }
}
// 日历组件方法调用
function getSelectDate(ele) {
  ele.forEach(function (item, index) {
    laydate.render({
      elem: `#${item}`,
      done: function (value, date, endDate) {
        $('#searchReleased_from .submit').removeClass('is-disabled');
      }
    });
  })
}

function formatDuring(data) {
  var hours = parseInt((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = parseInt((data % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = parseInt((data % (1000 * 60)) / 1000);
  if (minutes >= 0 && minutes <= 9) {
    minutes = '0' + minutes
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = '0' + seconds
  }

  return hours + ":" + minutes + ":" + seconds;
}

// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
function dateFormat(timestamp, formats) {
  // formats格式包括
  // 1. Y-m-d
  // 2. Y-m-d H:i:s
  // 3. Y年m月d日
  // 4. Y年m月d日 H时i分
  formats = formats || 'Y-m-d';

  var zero = function (value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };

  var myDate = timestamp ? new Date(timestamp * 1000) : new Date();

  var year = myDate.getFullYear();
  var month = zero(myDate.getMonth() + 1);
  var day = zero(myDate.getDate());

  var hour = zero(myDate.getHours());
  var minite = zero(myDate.getMinutes());
  var second = zero(myDate.getSeconds());

  return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
    return ({
      Y: year,
      m: month,
      d: day,
      H: hour,
      i: minite,
      s: second
    })[matches];
  });
};

function loadLayer() {
  layerLoading = LayerConfig('load');
}