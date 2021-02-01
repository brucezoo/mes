let supplierArr = [],
  NPLRatioArr = [],
  testArr = [],
  badArr = [],
  countArr = [],
  passrateArr = [],
  sumPassrateArr = [],
  teceArr = [],
  itemsArr = [],
  returnArr = [],
  compromiseArr = [];

function createCharts(month) {
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
      text: month + '月份面料不良趋势图',
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
      data: supplierArr,
      axisPointer: {
        type: 'shadow'
      },
      axisLabel: {
        interval: 0
      }
    }],
    yAxis: [{
        type: 'value',
        name: '检验批',
        min: 0,
        max: testArr[0] + 50,
        interval: ((testArr[0] + 50) / 4).toFixed(0),
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
        data: testArr,
        showAllSymbol: false,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      },
      {
        name: '不合格批次',
        type: 'bar',
        showAllSymbol: true,
        data: badArr,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      },
      {
        name: '不良率',
        type: 'line',
        yAxisIndex: 1,
        showAllSymbol: true,
        data: NPLRatioArr,
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

function createParetoCharts(month, count) {
  let myChart = echarts.init(document.getElementById('pareto'));
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
      text: month + '月份面料不良分类Pareto图',
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
      data: ['不良批次', '累计不良率']
    },
    xAxis: [{
      type: 'category',
      data: itemsArr,
      axisPointer: {
        type: 'shadow'
      },
      axisLabel: {
        interval: 0
      }
    }],
    yAxis: [{
        type: 'value',
        name: '不良批次',
        min: 0,
        max: count,
        interval: (count / 4).toFixed(0),
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '累积不良率',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [{
        name: '不良批次',
        type: 'bar',
        data: countArr,
        showAllSymbol: false,
        itemStyle: {
          normal: {
            label: {
              show: true
            }
          }
        }
      },
      {
        name: '累积不良率',
        type: 'line',
        yAxisIndex: 1,
        showAllSymbol: true,
        smooth:true,
        data: sumPassrateArr,
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
    workshop_id: '',
    department_id: '',
    process: '',
    check_resource: '',
    missingitems: ''
  }
}

function bindEvent() {
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
      format: 'yyyy-MM-dd',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value + ' 00:00:00');
      }
    });
  });

  $('#end_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#end_time_input',
      // max: max,
      format: 'yyyy-MM-dd',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value + ' 23:59:59');
      }
    });
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
      ajaxData = {
        start_time: parentForm.find('#start_time_input').text().trim() + ' 00:00:00',
        end_time: parentForm.find('#end_time_input').text().trim() + ' 23:59:59',
        LGFSB: parentForm.find('#LGFSB').val().trim(),
        LIFNR: parentForm.find('#LIFNR').val().trim(),
        WERKS: parentForm.find('#WERKS').val().trim(),
        operation_name: parentForm.find('#operation_name').val().trim(),
        workshop_id: parentForm.find('#workshop_id').val().trim(),
        department_id: parentForm.find('#department_id').val().trim(),
        process: parentForm.find('#MC').val().trim(),
        check_resource: parentForm.find('#check_resource').val().trim(),
        missingitems: parentForm.find('#missing_item').val().trim()
      }
      if (!$('#start_time_input').text()) {
        layer.msg('请先选择月份', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
        flag = false;
        $(this).removeClass('is-disabled');
      }
      if (flag) {
        if (ajaxData.check_resource == 2) {
          getNewBadClassification();
        } else {
          getBadClassification();
        }
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

  //导出数据
  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      start_time: parentForm.find('#start_time_input').text().trim() + ' 00:00:00',
      end_time: parentForm.find('#end_time_input').text().trim() + ' 23:59:59',
      LGFSB: parentForm.find('#LGFSB').val().trim(),
      LIFNR: parentForm.find('#LIFNR').val().trim(),
      WERKS: parentForm.find('#WERKS').val().trim(),
      operation_name: parentForm.find('#operation_name').val().trim(),
      workshop_id: parentForm.find('#workshop_id').val().trim(),
      department_id: parentForm.find('#department_id').val().trim(),
      process: parentForm.find('#MC').val().trim(),
      check_resource: parentForm.find('#check_resource').val().trim(),
      missingitems: parentForm.find('#missing_item').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/Systemsanalysis/exportData?" + urlLeft;
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

function getNewBadClassification() {
  let urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['monthly'].badClassification + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var missing_items = '';
      supplierArr = [], NPLRatioArr = [], testArr = [], badArr = [], returnArr = [], compromiseArr = [], teceArr = [], countArr = [], passrateArr=[], sumPassrateArr = [], itemsArr = [];
      const results = rsp.results;
      if (results) {
        missing_items = results.data[0][0].missing_items;
        results.data.forEach(function (item, index) {
          item.forEach(function (iitem, index) {
            supplierArr.push(iitem.NAME1);
            NPLRatioArr.push(iitem.passrate);
            testArr.push(iitem.inspectionlot);
            badArr.push(iitem.unqualifiedlot);
            returnArr.push(iitem.eturngoods);
            teceArr.push(iitem.special_batch);
            compromiseArr.push(iitem.compromisenumber);
          })
        });
        const month = $('#start_time_input').text().split('-')[1];
        let colspan = results.total.length,
          thHtml = '',
          trCountHtml = `<td class="center nowrap tight" colspan="7"></td>`,
          trPassrateHtml = `<td class="center nowrap tight" colspan="7">不良率</td>`,
          trSumPassrateHtml = `<td class="center nowrap tight" colspan="7">累计不良率</td>`;
        let width = 600 + colspan * 100;
        results.total.forEach(function (titem, index) {
          countArr.push(titem);
          trCountHtml += `<td class="center tight">${titem}</td>`;
        })
        missing_items.forEach(function (mitem, index) {
          itemsArr.push(mitem.name);
          thHtml += `<th class="center tight" style="width:100px;">${mitem.name}</th>`;
        })
        results.passrate.forEach(function (pitem, index) {
          passrateArr.push(pitem);
          trPassrateHtml += `<td class="center tight">${Number(pitem).toFixed(2)}%</td>`;
        })
        results.sum_passrate.forEach(function (sitem, index) {
          sumPassrateArr.push(sitem);
          trSumPassrateHtml += `<td class="center tight">${Number(sitem).toFixed(2)}%</td>`;
        })
        let totalCount = sum(countArr);
        tbodyHtml = createNewTbodyHtml(results.data);
        $('#monthlySummaryTable').html(`<div class="wrap_table_div has-border" style="overflow-x:auto;">
          <table style="table-layout: fixed;border:1px solid #000 !important;width:${width}px;">
            <thead>
              <tr style="text-align:center;">
                <th class="center tight" rowspan="2" style="width:100px;">车间</th>
                <th class="center tight" rowspan="2" style="width:100px;">异常供应商月检验批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">让步接收批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">退货批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">特采批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">不合格批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">不良率</th>
                <th class="center tight" colspan="${colspan}" style="width:${100*colspan}px;">问题点</th>
              </tr>
              <tr style="text-align:center;">
                ${thHtml};
              </tr>
            </thead>
          <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
              ${tbodyHtml}
              <tr style="text-align:center;height:56px;">
                <td class="center tight">合计：</td>
                <td class="center tight">${sum(testArr)}</td>
                <td class="center tight">${sum(compromiseArr)}</td>
                <td class="center tight">${sum(returnArr)}</td>
                <td class="center tight">${sum(teceArr)}</td>
                <td class="center tight">${sum(badArr)}</td>
                <td class="center tight">${isNaN((sum(badArr)*100/sum(testArr)).toFixed(2))?'0.00':(sum(badArr)*100/sum(testArr)).toFixed(2)}%</td>
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trCountHtml}
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trPassrateHtml}
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trSumPassrateHtml}
              </tr>
          </tbody>
          </table>
        </div>`);
        // console.log(isNaN((sum(badArr)*100/sum(testArr)).toFixed(2)))
        createCharts(month);
        createParetoCharts(month, totalCount);
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

function getBadClassification() {
  let urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['monthly'].badClassification + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      supplierArr = [], NPLRatioArr = [], testArr = [], badArr = [], returnArr = [], compromiseArr = [], teceArr = [];
      if (rsp.results) {
        rsp.results.forEach(function (item, index) {
          supplierArr.push(item.NAME1);
          NPLRatioArr.push(item.passrate);
          testArr.push(item.inspectionlot);
          badArr.push(item.unqualifiedlot);
          returnArr.push(item.eturngoods);
          teceArr.push(item.special_batch);
          compromiseArr.push(item.compromisenumber);
        });
        getMonthlyReport(rsp.results);
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

function getMonthlyReport(data) {
  let urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['monthly'].problemPoint + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      countArr = [], sumPassrateArr = [], itemsArr = [];
      const month = $('#start_time_input').text().split('-')[1];
      if (rsp.results) {
        let colspan = rsp.results.length,
          thHtml = '',
          trCountHtml = `<td class="center nowrap tight" colspan="7"></td>`,
          trPassrateHtml = `<td class="center nowrap tight" colspan="7">不良率</td>`,
          trSumPassrateHtml = `<td class="center nowrap tight" colspan="7">累计不良率</td>`;
        let width = 600 + colspan * 100;
        rsp.results.forEach(function (item, index) {
          countArr.push(item.count);
          sumPassrateArr.push((item.sumpassrate).toFixed(2));
          itemsArr.push(item.name);
          thHtml += `<th class="center tight" style="width:100px;">${item.name}</th>`;
          trCountHtml += `<td class="center tight">${item.count}</td>`;
          trPassrateHtml += `<td class="center tight">${(item.passrate).toFixed(2)}%</td>`;
          trSumPassrateHtml += `<td class="center tight">${(item.sumpassrate).toFixed(2)}%</td>`;
        })

        let totalCount = sum(countArr);
        tbodyHtml = createTbodyHtml(data);
        $('#monthlySummaryTable').html(`<div class="wrap_table_div has-border" style="overflow-x:auto;">
          <table style="table-layout: fixed;border:1px solid #000 !important;width:${width}px;">
            <thead>
              <tr style="text-align:center;">
                <th class="center tight" rowspan="2" style="width:100px;">供应商</th>
                <th class="center tight" rowspan="2" style="width:100px;">异常供应商月检验批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">让步接收批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">退货批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">特采批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">不合格批次</th>
                <th class="center tight" rowspan="2" style="width:100px;">不良率</th>
                <th class="center tight" colspan="${colspan}" style="width:${100*colspan}px;">问题点</th>
              </tr>
              <tr style="text-align:center;">
                ${thHtml};
              </tr>
            </thead>
          <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
              ${tbodyHtml}
              <tr style="text-align:center;height:56px;">
                <td class="center tight">合计：</td>
                <td class="center tight">${sum(testArr)}</td>
                <td class="center tight">${sum(compromiseArr)}</td>
                <td class="center tight">${sum(returnArr)}</td>
                <td class="center tight">${sum(teceArr)}</td>
                <td class="center tight">${sum(badArr)}</td>
                <td class="center tight">${isNaN((sum(badArr)*100/sum(testArr)).toFixed(2))?'0.00':(sum(badArr)*100/sum(testArr)).toFixed(2)}%</td>
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trCountHtml}
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trPassrateHtml}
              </tr>
              <tr style="text-align:center;height:56px;">
                ${trSumPassrateHtml}
              </tr>
          </tbody>
          </table>
        </div>`);
        // console.log(isNaN((sum(badArr)*100/sum(testArr)).toFixed(2)))
        createCharts(month);
        createParetoCharts(month, totalCount);
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

function createNewTbodyHtml(data) {
  let _html = '';
  data.forEach(function (item, index) {
    item.forEach(function (iitem, index) {
      let tdHtml = '';
      iitem.missing_items.forEach(function (mitem, mindex) {
        tdHtml += `<td class="center tight">${mitem.count}</td>`;
      })
      _html += `<tr style="text-align:center;height:56px;">
                    <td class="center tight">${iitem.NAME1}</td>
                    <td class="center tight">${iitem.inspectionlot}</td>
                    <td class="center tight">${iitem.compromisenumber}</td>
                    <td class="center tight">${iitem.eturngoods}</td>
                    <td class="center tight">${iitem.special_batch}</td>
                    <td class="center tight">${iitem.unqualifiedlot}</td>
                    <td class="center tight">${Number(iitem.passrate).toFixed(2)}%</td>
                    ${tdHtml}
                  </tr>`
    })
  })
  return _html;
}

function createTbodyHtml(data) {
  let _html = '';
  data.forEach(function (item, index) {
      let tdHtml = '';
      item.missing_items.forEach(function (mitem, mindex) {
        tdHtml += `<td class="center tight">${mitem.count}</td>`;
      })
      _html += `<tr style="text-align:center;height:56px;">
                    <td class="center tight">${item.NAME1}</td>
                    <td class="center tight">${item.inspectionlot}</td>
                    <td class="center tight">${item.compromisenumber}</td>
                    <td class="center tight">${item.eturngoods}</td>
                    <td class="center tight">${item.special_batch}</td>
                    <td class="center tight">${item.unqualifiedlot}</td>
                    <td class="center tight">${Number(item.passrate).toFixed(2)}%</td>
                    ${tdHtml}
                  </tr>`
  })
  return _html;
}

function getSumArr(arr){
  var sumArr=[];
  if(arr&&arr.length){
    for(var i=0;i<=arr.length-1;i++){
      if(i=0){
        sumArr=arr[i];
      }else{
        sumArr=arr[i]+arr[i-1]
      }
    }
  }
  return sumArr;
}

function getSortArr(arr){
  // var sortArr=[];
  if(arr&&arr.length){
    return arr.sort(function (a, b) {
      return b - a;
    })
  }
}

function getWerks() {
  AjaxClient.get({
    url: URLS['dropdown'].factory + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.WERKS').find('.el-select-dropdown-list').html(_html)
      }
      getWorkShop()
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
      getHarmfulItem();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getHarmfulItem() {
  AjaxClient.get({
    url: URLS['dropdown'].getMissingItems + _token,
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
        $('.missing-item').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}