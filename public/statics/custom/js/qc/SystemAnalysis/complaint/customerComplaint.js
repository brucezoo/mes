let departmentArr = [], costArr = [], percentArr = [], total_cost;

$(function () {
  bindEvent();
  getFactory();
  $('.check_resource .el-select-dropdown-item[data-id=' + 1 + ']').click();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    start_time: '',
    end_time: '',
    factory_id:'',
    department_id:'',
    missing_id:''
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
        start_time: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
        end_time: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
        factory_code: parentForm.find('#WERKS').val().trim(),
        department_id: parentForm.find('#workshop_id').val().trim(),
        missing_id: parentForm.find('#harmful_item').val().trim(),
      }
      getCustomerComplaint();
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
      start_time: parentForm.find('#start_time_input').text().trim()+' 00:00:00',
        end_time: parentForm.find('#end_time_input').text().trim()+' 23:59:59',
        factory_id: parentForm.find('#WERKS').val().trim(),
        department_id: parentForm.find('#workshop_id').val().trim(),
        missing_id: parentForm.find('#harmful_item').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/qc/ComplaintDetailPrint?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });
}

function getCustomerComplaint() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['complaint'].customerComplaint + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      const date = $('#start_time_input').text();
        var results=rsp.results;
      if (results.first.length) {
        let factoryComplaint = results.first;
        let categoryComplaint = results.sec;
        
        var factoryComplaintHtml = '',
        anomalyAnalysisHtml = '',
      nameArr = [], numArr = [], swNumArr = [], compromiseArr = [], returnArr = [], teceArr = [], goalrateArr = [], passrateArr = [];
      factoryComplaint.forEach(function (item, index) {        
        if(index==0){
          var monthHtml=createMonthHtml(item.datalist.month);
          factoryComplaintHtml+= `<tr>
                      <td class="center nowrap tight" style="font-size: 1.5em;" rowspan="${factoryComplaint.length}">厂区</td>
                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;width:100px;">${tansferNull(item.factory_name)}</td>
                      ${monthHtml}
                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.sum}</td>
                      </tr>`;
        }else{
          var monthHtml=createMonthHtml(item.datalist.month);
          factoryComplaintHtml+= `<tr>
                      <td class="center tight" style="font-size: 1.5em;height:56px;">${item.factory_name}</td>
                      ${monthHtml}
                      <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item.datalist.sum}</td>
                      </tr>`;
        }
      })
      categoryComplaint.forEach(function (item, index) {
        item.datalist.forEach(function(ditem,dindex){
          if(dindex==0){
            var monthHtml=createMonthHtml(ditem.month);
            anomalyAnalysisHtml+= `<tr>
                        <td class="center tight" style="font-size: 1.5em;" rowspan="${item.datalist.length}">${tansferNull(item.factory_name)}</td>
                        <td class="center tight" style="font-size: 1.5em;height:56px;width:100px;">${tansferNull(ditem.item_name)}</td>
                        ${monthHtml}
                        <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${ditem.sum}</td>
                        </tr>`;
          }else{
            var monthHtml=createMonthHtml(ditem.month);
            anomalyAnalysisHtml+= `<tr>
                        <td class="center tight" style="font-size: 1.5em;height:56px;">${tansferNull(ditem.item_name)}</td>
                        ${monthHtml}
                        <td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${ditem.sum}</td>
                        </tr>`;
          }    
        })
            
      })
        $('#customerComplaintTable').html(`<div class="wrap_table_div has-border">
        <table id="customerComplaint" style="table-layout: fixed;border:1px solid #000 !important;">
          <thead>
            <tr>
              <th class="center nowrap tight" colspan='2' rowspan="2">项目</th>
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
          <tbody class="table_tbody_statistics" style="border:1px solid #000 !important;">
            ${factoryComplaintHtml}
            <tr>
              <td class="center tight" colspan='2' style="font-size: 1.5em;height:56px;">异常分析</td>
              <td class="center nowrap tight" colspan='13' style="font-size: 1.5em;height:56px;"></td>
            </tr>
            ${anomalyAnalysisHtml}
          </tbody>
        </table>
        </div>`);
        // uniteTdCells('customerComplaint');
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
function createMonthHtml(data){
  var dataHtml='';
  if(data&&data.length){
    data.forEach(function(item,index){
      dataHtml+=`<td class="center nowrap tight" style="font-size: 1.5em;height:56px;">${item}</td>`;
    })
  }
  return dataHtml;
}

function uniteTdCells(tableId) {
  var table = document.getElementById(tableId);
  for (let i = 0; i < table.rows.length; i++) {
    for (let c = 1; c < 5; c++) {
      for (let j = i + 1; j < table.rows.length; j++) {
        let cell1 = table.rows[i].cells[c].getAttribute('data-content');
        let cell2 = table.rows[j].cells[c].getAttribute('data-content');
        if (cell1 && cell2 && cell1 == cell2) {
          table.rows[j].cells[c].style.display = 'none';
          table.rows[j].cells[c].style.verticalAlign = 'middle';
          table.rows[i].cells[c].rowSpan++;

          // table.rows[i].style.backgroundColor='#ddeaf98a';
          // table.rows[j].style.backgroundColor='#ddeaf98a';
          table.rows[i].cells[c].style.backgroundColor = '#eef1f6';
          table.rows[j].cells[c].style.backgroundColor = '#eef1f6';
          // table.rows[i].style.borderTop="2px solid #ccc";
          // table.rows[i].style.borderLeft="2px solid #ccc";
          // table.rows[i].style.borderRight="2px solid #ccc";
          // table.rows[i].cells[c].style.borderBottom="2px solid #ccc";
          // table.rows[j].style.borderBottom="2px solid #ccc";
          // table.rows[j].style.borderRight="2px solid #ccc";
          // table.rows[j].cells[c].style.borderTop="2px solid #ccc";
        } else {
          table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
          break;
        };
      }
    }

  }
};


function createTableHtml(data) {
  let days = getDays();
  let thHtml = '', itemHtml = '',width=0;
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
    width=days.length*180;
  let check_resource=$('#check_resource').val();
  
  let _html = `<div class="wrap_table_div has-border">
      <table id="annualSummaryTable" style="table-layout: fixed;border:1px solid #000 !important;width:${width}px;">
        <thead>
          <tr style="text-align:center;">
            ${check_resource==3?`<th class="center" rowspan="2">工序</th>`:(check_resource==2?`<th class="center" rowspan="2">工序</th>`:`<th class="center" rowspan="2">供应商</th>`)}
            ${thHtml}
            <th class="center" colspan="5">汇总</th>
          </tr>
          <tr style="text-align:center;">
            ${itemHtml}
            <th class="center">检验批次</th>
            <th class="center">特采批次</th>
            <th class="center">让步批次</th>
            <th class="center">退货批次</th>
            <th class="center">不合格率</th>
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

function getHarmfulItem(){
  AjaxClient.get({
    url: URLS['dropdown'].getMissingItems + _token,
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
          _html+=`<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
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