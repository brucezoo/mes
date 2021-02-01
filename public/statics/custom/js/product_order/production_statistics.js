const _token = "8b5491b17a70e24107c89f37b1036078";
$(function () {
  getLaydate();
  bindEvent();
  // getWorkBenchCount();
  getAllWorkBench();
})

function getLaydate() {
  var _date = _getCurrentDate();
  laydate.render({
    elem: '#date',
    value: _date,
    done: function (value) {
      $('.work_station_time').find('.errorMessage').hide().html('');
    }
  });
}

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

function getWorkBenchCount() {
  let flag = false;
  if (!$("#date").val()) {
    $(".work_station_time").find(".errorMessage").show().html('*请选择时间');
  } else {
    flag = true;
  }
  $("#benchName").html($("#workBench").val());
  var date = $("#date").val();
  var start_time = date + " 00:00:00";
  var now_time = new Date(start_time);
  var next_day_time = new Date(now_time.getTime()/1000 + 24 * 60 * 60);
  var nextDayEndTime = dateFormat(next_day_time,'Y-m-d');
  var startTime=date+" 07:30:00";
  var endTime=nextDayEndTime+" 07:29:59";
  if (flag) {
    let work_bench_id = '';
    if ($("#work_bench_id").val()) {
      work_bench_id = $("#work_bench_id").val();
    }
    AjaxClient.get({
      url: "/WorkDeclareCount/getCompletedList?_token=" + _token + "&start_time=" + startTime + "&end_time=" + endTime + "&workbench_id=" + work_bench_id,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        if (rsp.results && rsp.results.length) {
          getBenchData($('#ProductionStatistics .table_tbody'), rsp.results);
        } else {
          $('#ProductionStatistics .table_tbody').html('<tr><td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td></tr>');
        }
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        console.log('获取工位产量失败');
      }
    });
  }
}

function getBenchData(ele, data) {
  ele.html('');
  data.forEach(function (item) {
    var prohtml = $(`<tr class="no-line-tr">
                      <td class="text-center">${tansferNull(item.sales_order_code)}</td>
                      <td class="text-center">${tansferNull(item.work_order_code)}</td>
                      <td class="text-center">${tansferNull(item.material_code)}</td>
                      <td class="text-center">${tansferNull(item.material_name)}</td>
                      <td class="text-center">${tansferNull(item.plan_number)}</td>
                      <td class="text-center">${tansferNull(item.dayShiftNumber)}</td>
                      <td class="text-center">${tansferNull(item.nightShiftNumber)}</td>
                    </tr>`);
    ele.append(prohtml);
  });
}

//关联工位页获取所有工位列表
function getAllWorkBench() {
  //var id = $('#workcenter_id').val();
  AjaxClient.get({
    url: '/WorkBench/select?_token=' + _token + '&status=1&workcenter_id=221',
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '', innerHtml = '';
      $('.el-form-item.bench').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`;
        });
        //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
        innerHtml = `${lis}`;
        $('.el-form-item.bench').find('.el-select-dropdown-list').html(innerHtml);
      }
      // setTimeout(function () {
      //   getLayerSelectPosition($(layerEle));
      // }, 200);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工位列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

function _getCurrentDate() {
  var date = new Date();
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

function bindEvent() {
  //搜索
  $('body').on('click', '.btn-group .search', function () {
    getWorkBenchCount();
  })

  // 导出 
  $('body').on('click', '.wrap .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    var date = $("#date").val();
    var start_time = date + " 00:00:00",
      end_time = date + " 23:59:59";
    var now_time = new Date(start_time);
    var next_day_time = new Date(now_time.getTime()/1000 + 24 * 60 * 60);
    var nextDayEndTime = dateFormat(next_day_time,'Y-m-d');
    var startTime=date+" 07:30:00";
    var endTime=nextDayEndTime+" 07:29:59"
    if (parentForm.find('#date').val()) {
      workStationStartDate = parentForm.find('#date').val() + ' 00:00:00';
      workStationEndDate = parentForm.find('#date').val() + ' 23:59:59';
    }
    ajaxData = {
      _token: _token,
      start_time: encodeURIComponent(startTime),
      end_time: encodeURIComponent(endTime),
      export: 1
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/WorkDeclareCount/getCompletedList?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });

  $('body').on('click', '.el-select', function () {
    if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
    } else {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
      $(this).find('.el-input-icon').addClass('is-reverse');
      $(this).siblings('.el-select-dropdown').show();
    }
  });

  //下拉选择
  $('body').on('click', '.el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });
}
