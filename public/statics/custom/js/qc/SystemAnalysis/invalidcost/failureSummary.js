let departmentArr = [],
  costArr = [],
  percentArr = [],
  total_cost;

$(function () {
  bindEvent();
  getWerks();
  $('.check_resource .el-select-dropdown-item[data-id=' + 1 + ']').click();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    begintime: '',
    endtime: '',
    LGFSB: '',
    check_resource: '',
    WERKS: '',
    operation_id: '',
    workshop_id: '',
    NAME1: ''
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
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value+' 00:00:00');
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
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value+' 23:59:59');
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
        begintime: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
        endtime: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
        LGFSB: parentForm.find('#LGFSB').val().trim(),
        check_resource: parentForm.find('#check_resource').val().trim(),
        WERKS: parentForm.find('#WERKS').val().trim(),
        operation_id: parentForm.find('#operation_id').val().trim(),
        workshop_id: parentForm.find('#workshop_id').val().trim(),
        NAME1: parentForm.find('#NAME1').val().trim(),
      }

      getFailureSummary();
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

  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      begintime: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
      endtime: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
      LGFSB: parentForm.find('#LGFSB').val().trim(),
      check_resource: parentForm.find('#check_resource').val().trim(),
      WERKS: parentForm.find('#WERKS').val().trim(),
      operation_id: parentForm.find('#operation_id').val().trim(),
      workshop_id: parentForm.find('#workshop_id').val().trim(),
      NAME1: parentForm.find('#NAME1').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/InvalidCost/summaryExport?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });
}

function getFailureSummary() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['invalidCost'].summary + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      const date = $('#start_time_input').text();
      if (rsp.results) {
        let annualCostJson = [];
        let datas = [];
        rsp.results.forEach(function (item, index) {
          let days = getDays('empty');
          item.data.forEach(function (ditem, dindex) {
            if (ditem.days >= 0) {
              days[ditem.days] = ditem;

            };
          })
          datas.push(days);
        })

        datas.forEach(function (item, index) {
          item.push(rsp.results[index].total);
        })
        let tableHtml = createTableHtml(datas);
        $("#failureSummaryTable").html(tableHtml);
        // $('#invalidAnalysisTable').html(`<div style="text-align:center;font-size:36px;">
        //     <span><span id='monthShow'></span>${month}月责任部门失效成本比例</span>
        //   </div>
        //   <div class="wrap_table_div has-border">
        //     <table id="annualSummaryTable" style="table-layout: fixed;border:1px solid #000 !important;">
        //       <thead>
        //         <tr style="text-align:center;">
        //           <th class="center  tight">责任部门</th>
        //           ${departmentHtml}
        //           <th class="center  tight">合计</th>                  
        //         </tr>
        //       </thead>
        //       <tbody class="table_tbody" style="border:1px solid #000 !important;">
        //         <tr style="text-align:center;">
        //           <td class="center  tight" style="font-size: 1.5em;height:56px;">失效金额</td>
        //           ${costHtml}
        //           <td class="center  tight" style="font-size: 1.5em;height:56px;">${total_cost}</td>
        //         </tr>
        //         <tr style="text-align:center;">
        //           <td class="has-border" style="font-size: 1.5em;height:56px;">不良率</td>
        //           ${percentHtml}
        //         </tr>
        //         <tr style="text-align:center;">
        //           <td class="has-border" style="font-size: 1.5em;height:56px;">累计%</td>
        //           ${totalRateHtml}
        //         </tr>
        //       </tbody>
        //     </table>
        //   </div>`);
      } else {
        $('#failureSummaryTable').html('暂无数据');
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

function createTableHtml(data) {
  let days = getDays();
  let thHtml = '',
    itemHtml = '',
    width = 0;
  days.forEach(function (item, index) {
    thHtml += `<th class="center" colspan="4">${item}</th>`;
    itemHtml += `<th class="center">检验批次</th>
                  <th class="center">特采批次</th>
                  <th class="center">让步批次</th>
                  <th class="center">退货批次</th>`;
  })
  let tbodyHtml = createHtml(data);
  // let thHtml+=;
  // if(data[0]){
  width = days.length * 180;
  let check_resource = '';

	if ($('#check_resource').val() == 1) {
		check_resource = '供应商';
	}else {
		check_resource = '车间';
	}

  let _html = `<div class="wrap_table_div has-border">
      <table id="annualSummaryTable" style="table-layout: fixed;border:1px solid #000 !important;width:${width}px;">
        <thead>
          <tr style="text-align:center;">
           <th class="center" rowspan="2">${check_resource}</th>
            ${thHtml}
            <th class="center" colspan="5">汇总</th>
          </tr>
          <tr style="text-align:center;">
            ${itemHtml}
            <th class="center">检验批次</th>
            <th class="center">特采批次</th>
            <th class="center">让步批次</th>
            <th class="center">退货批次</th>
            <th class="center">合格率</th>
          </tr>
        </thead>
        <tbody class="table_tbody_statistics" style="border:1px solid #000 !important;">
            ${tbodyHtml}
        </tbody>
      </table>
    </div>`;
  return _html;
}

function createHtml(data) {
  let _html = '';
  data.forEach(function (item, index) {
    let _dhtml = '';
    item.forEach(function (ditem, dindex) {
      if (ditem == '') {
        _dhtml += `<td class="center" style="font-size: 1.5em;height:56px;"></td>
                <td class="center" style="font-size: 1.5em;height:56px;"></td>
                <td class="center" style="font-size: 1.5em;height:56px;"></td>
                <td class="center" style="font-size: 1.5em;height:56px;"></td>`
      } else {
        _dhtml += `<td class="center" style="font-size: 1.5em;height:56px;">${ditem.inspection_batch}</td>
                <td class="center" style="font-size: 1.5em;height:56px;">${ditem.special_batch}</td>
                <td class="center" style="font-size: 1.5em;height:56px;">${ditem.compromise_batch}</td>
                <td class="center" style="font-size: 1.5em;height:56px;">${ditem.rejected_batch}</td>`
      }
    })
    _html += `<tr>
              ${index!=(data.length-1)?`<td class="center" style="font-size: 1.5em;height:56px;width:100px;">${tansferNull(item[item.length - 1].name)}</td>`:`<td class="center" style="font-size: 1.5em;height:56px;">合计</td>`}
              ${_dhtml}
              <td class="center" style="font-size: 1.5em;height:56px;">${tansferNull(item[item.length - 1].defective_rate * 100).toFixed(2)}%</td>
            </tr>`
  })
  return _html;
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