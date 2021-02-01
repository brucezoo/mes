let departmentArr = [], costArr = [], percentArr = [],total_cost;
function createCharts(ydata) {
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
    toolbox: {
      feature: {
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    legend: {
      data: ['失效金额', '比例']
    },
    xAxis: [
      {
        type: 'category',
        data: departmentArr,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '失效金额',
        min: 0,
        max: total_cost,
        interval: (Number(ydata)/5).toFixed(2),
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '金额比例',
        min: 0,
        max:100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '失效金额',
        type: 'bar',
        data: costArr,
        itemStyle : { normal: {label : {show: true}}}
      },
      {
        name: '金额比例',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: percentArr,
        itemStyle : { normal: {label : {show: true}}}
      }
    ]
  };
  myChart.setOption(option);
}


$(function () {
  bindEvent();
  getFactory();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    start_time: '',
    end_time: '',
    factory_code:'',
    department_id:'',
    harmful_item:''
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
        start_time: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
        end_time: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
        factory_code: parentForm.find('#WERKS').val().trim(),
        department_id: parentForm.find('#workshop_id').val().trim(),
        harmful_item: parentForm.find('#harmful_item').val().trim(),
      }
      getInvalidCostReport();
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
        factory_code: parentForm.find('#WERKS').val().trim(),
        department_id: parentForm.find('#workshop_id').val().trim(),
        harmful_item: parentForm.find('#harmful_item').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/InvalidCost/exportSystemAnalysisReport?" + urlLeft;
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
}

function getInvalidCostReport() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['invalidCost'].systemAnalysisReport + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var departmentHtml='',costHtml='',percentHtml='',totalRateHtml='';
      costArr = [], percentArr = [],departmentArr=[];
      const month=$('#start_time_input').text().split('-')[1];
      if (rsp.results) {
        total_cost=rsp.results.total_cost;
        rsp.results.every_department_cost.forEach(function (item, index) {
          departmentArr.push(item.name);
          costArr.push(Number(item.mouth_total_cost));
          percentArr.push((Number(item.total_defective_rate * 100)).toFixed(2));
          departmentHtml+=`<th class="center tight" style="width:80px;">${item.name}</th>`;
          costHtml+=`<td class="center tight" style="font-size: 1.5em;height:56px;">${item.mouth_total_cost}</td>`;
          percentHtml+=`<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${(Number(item.defective_rate)*100).toFixed(2)}%</td>`;
          totalRateHtml+=`<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${(Number(item.total_defective_rate)*100).toFixed(2)}%</td>`
        })

        $('#invalidAnalysisTable').html(`<div style="text-align:center;font-size:36px;">
            <span><span id='monthShow'></span>责任部门失效成本比例</span>
          </div>
          <div class="wrap_table_div has-border" style="overflow-x:auto;">
            <table id="annualSummaryTable" style="table-layout: fixed;border:1px solid #000 !important;">
              <thead>
                <tr style="text-align:center;">
                  <th class="center tight" style="width:80px;">责任部门</th>
                  ${departmentHtml}
                  <th class="center tight" style="width:80px;">合计</th>
                </tr>
              </thead>
              <tbody class="table_tbody" style="border:1px solid #000 !important;">
                <tr style="text-align:center;">
                  <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">失效金额</td>
                  ${costHtml}
                  <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${total_cost}</td>
                </tr>
                <tr style="text-align:center;">
                  <td class="has-border" style="font-size: 1.5em;height:56px;">不良率</td>
                  ${percentHtml}
                </tr>
                <tr style="text-align:center;">
                  <td class="has-border" style="font-size: 1.5em;height:56px;">累计%</td>
                  ${totalRateHtml}
                </tr>
              </tbody>
            </table>
          </div>`);
        createCharts(total_cost);
      }else{
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

function getHarmfulItem(){
  AjaxClient.get({
    url: URLS['dropdown'].getInvalidEnum + _token+'&&type=0&&page_no=1&&page_size=20',
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success:function(rsp){
      layer.close(layerLoading);
      var _html=`<li data-id=""class="el-select-dropdown-item">--请选择--</li>`;
      if(rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
          _html+=`<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.harmfulItem').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail:function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getDepartment(){
  AjaxClient.get({
    url: URLS['dropdown'].getDepartment + _token+"&company_id=15",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success:function(rsp){
      layer.close(layerLoading);
      var _html=`<li data-id=""class="el-select-dropdown-item">--请选择--</li>`;
      if(rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
          _html+=`<li data-id="${item.department_id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.workshop').find('.el-select-dropdown-list').html(_html)
      }
      getHarmfulItem();
    },
    fail:function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getFactory(){
  AjaxClient.get({
    url: URLS['dropdown'].factory + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success:function(rsp){
      // layer.close(layerLoading);
      var _html=`<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if(rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
          _html+=`<li data-id="${item.code}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.WERKS').find('.el-select-dropdown-list').html(_html)
      }
      getDepartment();
    },
    fail:function (rsp) {
      layer.close(layerLoading);
    }
  })
}