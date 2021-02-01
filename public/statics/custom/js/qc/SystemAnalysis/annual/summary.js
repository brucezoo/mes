let inspectionArr = [],
  exemptionArr = [],
  testArr = [],
  compromiseArr = [],
  returnArr = [],
  goalrateArr = [],
  passrateArr = [];

function createCharts(year, xdata) {
  let myChart = echarts.init(document.getElementById('main'));
  // 指定图表的配置项和数据
  let option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    title: {
      text: year + '年检验合格率月度趋势',
      textStyle: {
        //文字颜色
        color: '#000',
        //字体风格,'normal','italic','oblique'
        fontStyle: 'normal',
        //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
        fontWeight: 'bold',
        //字体系列
        fontFamily: 'sans-serif',
        //字体大小
        fontSize: 18,
      }
    },
    toolbox: {
      feature: {
        restore: {
          show: true
        },
        saveAsImage: {
          show: true
        }
      }
    },
    legend: {
      data: ['检验批', '比例']
    },
    xAxis: [{
      type: 'category',
      data: ['FAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      axisPointer: {
        type: 'shadow'
      }
    }],
    yAxis: [{
        type: 'value',
        name: '检验批',
        min: 0,
        max: xdata + 50,
        interval: ((xdata + 50) / 4).toFixed(0),
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '合格率',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [{
        name: '检验批',
        type: 'bar',
        data: inspectionArr,
        showAllSymbol: true,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      },
      {
        name: '合格率',
        type: 'line',
        yAxisIndex: 1,
        showAllSymbol: true,
        data: passrateArr,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      },
      {
        name: '目标合格率',
        type: 'line',
        yAxisIndex: 1,
        showAllSymbol: true,
        data: goalrateArr,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      }
    ]
  };
  myChart.setOption(option);
}


$(function () {
  bindEvent();
  getWerks();
  $('.check_resource .el-select-dropdown-item[data-id=' + 1 + ']').click();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    start_time: '',
    end_time: '',
    LGFSB: '',
    LIFNR: '',
    WERKS: '',
    operation_name: '',
    is_workshop:'',
    // workshop_id: '',
    work_shop_id: '',
    // department_id: '',
    MC: '',
    sub_number: '',
    check_resource:''
  }
}

function bindEvent() {
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
      // type: 'datetime',
      format: 'yyyy-MM-dd',
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
      // type: 'datetime',
      format: 'yyyy-MM-dd',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value+' 23:59:59');
        // $("#end_time_input").text(value+' 23:59:59')
      }
    });
  });

  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#start_time').val('');
    parentForm.find('#end_time').val('');
    parentForm.find('#LGFSB').val('');
    parentForm.find('#LIFNR').val('');
    parentForm.find('#WERKS').val('');
    parentForm.find('.WERKS .el-input').val('--请选择--');
    parentForm.find('.workshop .el-input').val('--请选择--');
    parentForm.find('.work-shop .el-input').val('--请选择--');
    parentForm.find('.check_resource .el-input').val('--请选择--');
    parentForm.find('.department_id .el-input').val('--请选择--');
    parentForm.find('.mc .el-input').val('--请选择--');
    // parentForm.find('.operation_id .el-input').val('--请选择--');
    parentForm.find('#operation_name').val('');
    // parentForm.find('#workshop_id').val('');
    parentForm.find('#work_shop_id').val('');
    // parentForm.find('#department_id').val('');
    parentForm.find('#MC').val('');
    parentForm.find('#NAME1').val('');
    parentForm.find('#check_resource').val('');
    $('#annualSummaryTable').html('');
    $('#main').html('');
  });

  //搜索数据
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    let flag = true;
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        start_time: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
        end_time: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
        LGFSB: parentForm.find('#LGFSB').val().trim(),
        LIFNR: parentForm.find('#LIFNR').val().trim(),
        WERKS: parentForm.find('#WERKS').val().trim(),
        // is_workshop: parentForm.find("input[name='check_result']:checked").val(),
        operation_name: parentForm.find('#operation_name').val().trim(),
        // workshop_id: parentForm.find('#workshop_id').val().trim(),
        work_shop_id: parentForm.find('#work_shop_id').val().trim(),
        // department_id: parentForm.find('#department_id').val().trim(),
        MC: parentForm.find('#MC').val().trim(),
        NAME1: parentForm.find('#NAME1').val().trim(),
        check_resource:parentForm.find('#check_resource').val().trim()
      }
      console.log($('#check_resource').val()=='')
      if ($('#start_time_input').text() && $('#end_time_input').text()&&$('#check_resource').val()) {
        flag = true;
      } else if (!$('#start_time_input').text()) {
        layer.msg('请先选择开始时间', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
        flag = false;
        $(this).removeClass('is-disabled');
      } else if (!$('#end_time_input').text()) {
        layer.msg('请先选择结束时间', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
        flag = false;
        $(this).removeClass('is-disabled');
      } else if($('#check_resource').val()==''){
        layer.msg('请先选择检验来源', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
        flag=false;
        $(this).removeClass('is-disabled');
      }
      if (flag) {
        getInvalidCostReport();
      }
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

  //导出细排工单
  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      start_time: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
      end_time: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
      LGFSB: parentForm.find('#LGFSB').val().trim(),
      LIFNR: parentForm.find('#LIFNR').val().trim(),
      WERKS: parentForm.find('#WERKS').val().trim(),
      // is_workshop: parentForm.find("input[name='check_result']:checked").val(),
      operation_name: parentForm.find('#operation_name').val().trim(),
      // workshop_id: parentForm.find('#workshop_id').val().trim(),
      work_shop_id: parentForm.find('#work_shop_id').val().trim(),
      // department_id: parentForm.find('#department_id').val().trim(),
      MC: parentForm.find('#MC').val().trim(),
      NAME1: parentForm.find('#NAME1').val().trim(),
      check_resource: parentForm.find('#check_resource').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/Systemsanalysis/printData?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });
}

function sum(data) {
  let sum = 0;
  if (data.length) {
    data.forEach(function (item, index) {
      sum += Number(item);
    })
  }
  return sum;
}

function max(data) {
  let max = 0;
  if (data.length) {
    data.forEach(function (item, index) {
      if (item > max)
        max = item;
    })
  }
  return max;
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
      getWorkShop();
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
      getDutyWorkShop();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}


function getDutyWorkShop() {
  AjaxClient.get({
    url: URLS['dropdown'].workshop + _token+'&company_id=15',
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
        $('.work-shop').find('.el-select-dropdown-list').html(_html)
      }
      getDepartment();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getDepartment() {
  AjaxClient.get({
    url: URLS['dropdown'].department + _token,
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
        $('.department_id').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getInvalidCostReport() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['annual'].inspectionSummary + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var inspectionHtml = '',
        testHtml = '',
        exemptionHtml = '',
        compromiseHtml = '',
        duty_compromiseHtml = '',
        returnHtml = '',
        duty_returnHtml = '',
        teceHtml = '',
        duty_teceHtml = '',
        goalrateHtml = '',
        passrateHtml = '',
        moment_passrateHtml='',
        factoryHtml='',
        workshopHtml='',
        operationHtml='',
        departmentHtml='',
        denominator = 0,
        factory_show=false,
        workshop_show=false,
        operation_show=false,
        department_show=false,
        parentForm = $(this).parents('#searchForm');
      inspectionArr = [], exemptionArr = [], testArr = [], compromiseArr = [],duty_compromiseArr = [], returnArr = [],duty_returnArr = [], teceArr = [], duty_teceArr=[],goalrateArr = [], passrateArr = [],moment_passrateArr=[];
      const year = $('#start_time_input').text().split('-')[0];

      if (rsp.results) {
        rsp.results.forEach(function (item, index) {
          if (item.inspectionlot != 0) {
            denominator = denominator + 1;
          }
          
          inspectionArr.push(item.inspectionlot);
          testArr.push(item.work_number);
          exemptionArr.push(item.exemptionlot);
          compromiseArr.push(item.compromisenumber);
          duty_compromiseArr.push(item.moment_compromisenumber);
          returnArr.push(item.eturngoods);
          duty_returnArr.push(item.moment_eturngoods);
          teceArr.push(item.specialgoods);
          duty_teceArr.push(item.moment_specialgoods);
          passrateArr.push(Number(item.passrate).toFixed(2));
          moment_passrateArr.push(Number(item.moment_passrate).toFixed(2));
          goalrateArr.push(99.80);
          inspectionHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.inspectionlot}</td>`;
          testHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.work_number}</td>`;
          exemptionHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.exemptionlot}</td>`;
          compromiseHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.compromisenumber}</td>`;
          duty_compromiseHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.moment_compromisenumber}</td>`;
          returnHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.eturngoods}</td>`;
          duty_returnHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.moment_eturngoods}</td>`;
          teceHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.specialgoods}</td>`;
          duty_teceHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.moment_specialgoods}</td>`;
          goalrateHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">99.80%</td>`
          moment_passrateHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.moment_passrate}%</td>`
          passrateHtml += `<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.passrate}%</td>`
        })

        $('#annualSummaryTable').html(`<div style="text-align:center;font-size:36px;">
            <span>${year}年检验汇总列表</span>
          </div>
          <div class="wrap_table_div has-border">
            <table style="table-layout: fixed;border:1px solid #000 !important;">
            <thead>
            <tr style="text-align:center;">
              <th class="center nowrap tight" rowspan="2">目标</th>
              <th class="center nowrap tight" colspan="12">月份达成</th>
              <th class="center nowrap tight" rowspan="2">汇总</th>
            </tr>
            <tr style="text-align:center;">
              <th class="center nowrap tight">JAN</th>
              <th class="center nowrap tight">FEB</th>
              <th class="center nowrap tight">MAR</th>
              <th class="center nowrap tight">APR</th>
              <th class="center nowrap tight">MAY</th>
              <th class="center nowrap tight">JUN</th>
              <th class="center nowrap tight">JUL</th>
              <th class="center nowrap tight">AUG</th>
              <th class="center nowrap tight">SEP</th>
              <th class="center nowrap tight">OCT</th>
              <th class="center nowrap tight">NOV</th>
              <th class="center nowrap tight">DEC</th>
            </tr>
          </thead>
          <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">送检批</td>
              ${testHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(testArr)}</td>
            </tr>
            <!--<tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">免检批</td>
              ${exemptionHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(exemptionArr)}</td>
            </tr>-->
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">检验批</td>
              ${inspectionHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(inspectionArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">让步批</td>
              ${compromiseHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(compromiseArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">责任单位让步批</td>
              ${duty_compromiseHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(duty_compromiseArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">退货批</td>
              ${returnHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(returnArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">责任单位退货批</td>
              ${duty_returnHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(duty_returnArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">特采批</td>
              ${teceHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(teceArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">责任单位特采批</td>
              ${duty_teceHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${sum(duty_teceArr)}</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">目标合格率</td>
              ${goalrateHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">99.80%</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">检出率</td>
              ${passrateHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${(sum(passrateArr) / denominator).toFixed(2)}%</td>
            </tr>
            <tr style="text-align:center;">
              <td class="has-border" style="font-size: 1.5em;height:56px;">合格率</td>
              ${moment_passrateHtml}
              <td class="has-border" style="font-size: 1.5em;height:56px;">${(sum(moment_passrateArr) / denominator).toFixed(2)}%</td>
            </tr>
          </tbody>
          </table>
        </div>`);
        xdata = max(inspectionArr);
        createCharts(year, xdata);
      } else {
        $('.task-table-card').html('暂无数据');
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