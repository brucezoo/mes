let departmentArr = [],
  costArr = [],
  percentArr = [],
  total_cost;

$(function () {
  bindEvent();
  $('.type_dropdown .el-select-dropdown-item[data-id=' + 1 + ']').click();
  $('.status_dropdown .el-select-dropdown-item[data-id=' + 1 + ']').click();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    start_time: '',
    end_time: '',
    type: '',
    repairstatus: '',
  }
}

function bindEvent() {
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
	  show: true,
		type: 'datetime',
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#end_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#end_time_input',
      // max: max,
	  show: true,
		type: 'datetime',
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  //搜索数据
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        start_time: parentForm.find('#start_time_input').text().trim(),
        end_time: parentForm.find('#end_time_input').text().trim(),
        type: parentForm.find('#type').val(),
        repairstatus: parentForm.find('#repairstatus').val(),
      }
		$('#numberlb').html('');
		$('#datalb').html('');
      getBLReport();
    }
  });

  $('body').on('click', '#searchForm .update', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        start_time: parentForm.find('#start_time_input').text().trim(),
        end_time: parentForm.find('#end_time_input').text().trim(),
        type: parentForm.find('#type').val(),
        repairstatus: parentForm.find('#repairstatus').val(),
      }
      updateBLData();
    }
  });

  //下拉列表项点击事件
  $('body').on('click', '.el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
    }
    $(this).parents('.el-select-dropdown').hide();
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

  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      start_time: parentForm.find('#start_time_input').text().trim(),
      end_time: parentForm.find('#end_time_input').text().trim(),
      type: parentForm.find('#type').val().trim(),
      repairstatus: parentForm.find('#repairstatus').val(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/MaterialRequisition/exportBlListReport?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });

  //更多搜索条件下拉
  $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
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

function updateBLData() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.post({
    url: URLS['bl'].updateBlData + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '更新成功');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    },
    complete: function () {
      $('#searchForm .update').removeClass('is-disabled');
    }
  }, this);
}

function getBLReport() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['bl'].blListReport + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var results = rsp.results;
      if (results.bl_number.length) {
        let blNumber = results.bl_number;
        let blDate = results.bl_data;

        var nameHtml = '',
          numHtml = '',
          swNumHtml = '',
          compromiseHtml = '',
          nameArr = [],
          numArr = [],
          swNumArr = [],
          compromiseArr = [],
          returnArr = [],
          teceArr = [],
          goalrateArr = [],
		  passrateArr = [];
        // const year = $('#start_time_input').text().split('-')[0];
        blNumber.forEach(function (item, index) {
          nameArr.push(item.name);
          numArr.push(item.num);
          swNumArr.push(item.sw_num);
          nameHtml += `<th class="center tight" style="font-size: 1.5em;height:56px;width:80px;">${tansferNull(item.name)}</th>`;
          numHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.num}</td>`;
          swNumHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.sw_num}</td>`;
        })

        $('#blReportNumberTable').html(`<div class="wrap_table_div has-border">
            <table style="table-layout: fixed;border:1px solid #000 !important;" id="numberlb">
            <thead>
            <tr style="text-align:center;">
              <th class="center nowrap tight" style="width:80px;">补料单位</th>
              ${nameHtml}
            </tr>
          </thead>
          <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">补料次数</td>
              ${numHtml}
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">操作失误</td>
              ${swNumHtml}
            </tr>
          </tbody>
          </table>
        </div>`);
      } else {
        $('#blReportTable').html('暂无数据');
      }
      if (results.bl_number.length) {
        let blDate = results.bl_date;
        var nameHtml = '',
          numHtml = '',
          percentageHtml = '',
          totalPercentageHtml = '';
        blDate.forEach(function (item, index) {
          nameHtml += `<th class="center tight" style="font-size: 1.5em;height:56px;">${item.name}</th>`;
          numHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.num}</td>`;
          percentageHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${(parseFloat(item.percentage)*100).toFixed(2)}%</td>`;
          totalPercentageHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${(parseFloat(item.all_percentage)*100).toFixed(2)}%</td>`;
        })

        $('#blReportDateTable').html(`<div class="wrap_table_div has-border">
            <table style="table-layout: fixed;border:1px solid #000 !important;" id="datalb">
            <thead>
            <tr style="text-align:center;">
              <th class="center tight">问题</th>
              ${nameHtml}
            </tr>
          </thead>
          <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">数量</td>
              ${numHtml}
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">百分比</td>
              ${percentageHtml}
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">累计百分比</td>
              ${totalPercentageHtml}
            </tr>
          </tbody>
          </table>
        </div>`);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this);
}

function getWerks() {
  AjaxClient.get({
    url: URLS['dropdown'].factory + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.WERKS').find('.el-select-dropdown-list').html(_html)
      }
      getOperation();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getOperation() {
  AjaxClient.get({
    url: URLS['dropdown'].operation + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results.list && rsp.results.list.length) {
        rsp.results.list.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.operation_id').find('.el-select-dropdown-list').html(_html)
      }
      getWorkShop();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getWorkShop() {
  AjaxClient.get({
    url: URLS['dropdown'].workshop + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = `<li data-id=""class="el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.workshop').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getDays(data) {
  let startTime = $("#start_time_input").text() + ' 00:00:00';
  let endTime = $("#end_time_input").text() + ' 00:00:00';
  let startTimeMs = new Date(startTime).getTime();
  let endTimeMs = new Date(endTime).getTime();
  let dateArr = [];
  if (data == 'empty') {
    for (let i = 0; i < 365; i++) {
      if (startTimeMs <= endTimeMs) {
        startTimeMs += 24 * 3600 * 1000;
        dateArr.push('');
      }
    }
  } else {
    dateArr = [$("#start_time_input").text()]
    for (let i = 0; i < 365; i++) {
      if (startTimeMs < endTimeMs) {
        startTimeMs += 24 * 3600 * 1000;
        dateArr.push(dateFormat(startTimeMs, 'Y-m-d'));
      }
    }
  }
  return dateArr;
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

  var myDate = new Date(timestamp);

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