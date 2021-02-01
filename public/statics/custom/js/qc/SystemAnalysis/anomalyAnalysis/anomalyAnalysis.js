let departmentArr = [], costArr = [], percentArr = [], total_cost;

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
  }
}

function bindEvent() {
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time',
      // max: max,
      format: 'yyyy-MM',
      show: true,
      // closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
        var valArr=value.split('-');
        var fullYear=valArr[0];
        var month=valArr[1];
        var fullEndOfMonth=new Date(fullYear, month, 0).getDate();
        var start_date=fullYear+'-'+month+'-'+'01';
        var end_date=fullYear+'-'+month+'-'+fullEndOfMonth;
        $('#input_start_time').val(start_date);
        $('#input_end_time').val(end_date);
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
        start_time: parentForm.find('#input_start_time').val().trim(),
        end_time: parentForm.find('#input_end_time').val().trim(),
      }
      getAnomalyAnalysis();
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
      start_time: parentForm.find('#input_start_time').val().trim(),
        end_time: parentForm.find('#input_end_time').val().trim()
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/Systemsanalysis/badPrint?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });
}

function getAnomalyAnalysis() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['anomaly'].anomalyAnalysis + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      const date = $('#start_time_input').text();
        var results=rsp.results;
      if (results) {
        let purchaseDepartment = results.one,
            inOutgoingDepartment = results.two,
            outgoingDepartment = results.thr,
            workshopDepartment = results.for,
            outBound=results.fiv;
        
        var anomalyAnalysisHtml = '';
        if(purchaseDepartment){
          anomalyAnalysisHtml+=`<tr>
          <td class="center nowrap tight" style="font-size: 1.5em;" rowspan="3">进库</td>
          <td class="center tight" style="font-size: 1.5em;height:56px;">采购部</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.iqc_number}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.compromisenumber}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.eturngoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.specialgoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.count}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.iqc_percent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.goalPercent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${purchaseDepartment.GAP}</td>
          </tr>`
        }
        if(inOutgoingDepartment){
          anomalyAnalysisHtml+=`<tr>
          <td class="center tight" style="font-size: 1.5em;">外发部(内)</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.in_number}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.compromisenumber}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.eturngoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.specialgoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.count}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.in_percent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.goalPercent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${inOutgoingDepartment.GAP}</td>
          </tr>`
        }
        if(outgoingDepartment){
          anomalyAnalysisHtml+=`<tr>
          <td class="center tight" style="font-size: 1.5em;">外发部(外)</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.out_number}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.compromisenumber}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.eturngoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.specialgoods}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.count}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.out_percent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.goalPercent}</td>
          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${outgoingDepartment.GAP}</td>
          </tr>`
        }
        if(workshopDepartment&&workshopDepartment.length){
          workshopDepartment.forEach(function (item, index) {
            if(index==0){
              // var monthHtml=createMonthHtml(item.datalist.month);
              anomalyAnalysisHtml+= `<tr>
                          <td class="center tight" style="font-size: 1.5em;" rowspan="${workshopDepartment.length}">生产</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.work_shop_name}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.iqc_number}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.compromisenumber}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.eturngoods}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.specialgoods}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.count}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.goodsPercent}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.goalPercent}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.GAP}</td>
                          </tr>`;
            }else{
              anomalyAnalysisHtml+= `<tr>
                                      <td class="center tight" style="font-size: 1.5em;height:56px;">${item.datalist.work_shop_name}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.iqc_number}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.compromisenumber}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.eturngoods}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.specialgoods}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.count}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.goodsPercent}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.goalPercent}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.GAP}</td>
                                    </tr>`;
            }
          })
        }
        if(outBound&&outBound.length){
          outBound.forEach(function (item, index) {
            if(index==0){
              // var monthHtml=createMonthHtml(item.datalist.month);
              anomalyAnalysisHtml+= `<tr>
                          <td class="center nowrap tight" style="font-size: 1.5em;" rowspan="${workshopDepartment.length}">出货</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${tansferNull(item.factory_name)}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.oqc_number}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.compromisenumber}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.eturngoods}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.specialgoods}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.count}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.oqc_percent}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.goalPercent}</td>
                          <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.GAP}</td>
                          </tr>`;
            }else{
              anomalyAnalysisHtml+= `<tr>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${tansferNull(item.factory_name)}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.oqc_number}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.compromisenumber}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.eturngoods}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.specialgoods}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.count}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.oqc_percent}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.goalPercent}</td>
                                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.GAP}</td>
                                    </tr>`;
            }
          })
        }
        $('#anomalyAnalysisTable').html(`<div class="wrap_table_div has-border">
        <table id="customerComplaint" style="table-layout: fixed;border:1px solid #000 !important;">
          <thead>
            <tr style="text-align:center;">            
              <th class="center nowrap tight">过程</th>
              <th class="center nowrap tight">检验项目</th>
              <th class="center nowrap tight">生产总批次</th>
              <th class="center nowrap tight">让步批次</th>
              <th class="center nowrap tight">退货批次</th>
              <th class="center nowrap tight">特采批次</th>
              <th class="center nowrap tight">不合格批次</th>
              <th class="center nowrap tight">合格率</th>
              <th class="center nowrap tight">目标合格率</th>
              <th class="center nowrap tight">GAP</th>
            </tr>
          </thead>
          <tbody class="table_tbody_statistics" style="border:1px solid #000 !important;">
            ${anomalyAnalysisHtml}
          </tbody>
        </table>
        </div>`);
        // uniteTdCells('customerComplaint');
      } else {
        $('#anomalyAnalysisTable').html('暂无数据');
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
      layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.WERKS').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail: function (rsp) {
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
    },
    fail:function (rsp) {
      layer.close(layerLoading);
    }
  })
}