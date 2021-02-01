var layerModal,
  layerLoading,
  pageNo = 1,
  pageWoNo = 1,
  pageSize = 20,
  e = {},
  ajaxData = {},
  ajaxWoData = {};

// function setAjaxData() {
//   var ajaxDataStr = sessionStorage.getItem('work_order_page_index');
//   try {
//     ajaxData = JSON.parse(ajaxDataStr);
//     delete ajaxData.pageNo;
//     delete ajaxData.status;
//     delete ajaxData.work_order_code;
//     pageNo = JSON.parse(ajaxDataStr).pageNo;
//     status = JSON.parse(ajaxDataStr).status;
//     work_order_code = JSON.parse(ajaxDataStr).work_order_code;
//     work_order_id = JSON.parse(ajaxDataStr).work_order_id;
//   } catch (e) {
//     resetParam();
//   }
// }

//获取当前时间，格式YYYY-MM-DD
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

$(function () {
  getRankPlan();
  laydateRender();
  // setAjaxData();
  var status = getQueryString('status');
  // if(status===1){
  //   $(".el-tap-wrap").find()
  //   getWorkOrder()
  // }else{
  // getInventoryList();
  // }
  getWorkOrder();
  bindEvent();
  resetParam();
  resetWoParam();
});

//重置工单搜索参数
function resetWoParam() {
  ajaxWoData = {
    work_order_number: '',
    work_task_number: '',
    production_order_number: '',
    sales_order_code: '',
    sales_order_project_code: '',
    name: '',
    plan_start_date: '',
    plan_end_date: '',
    schedule: '',
    rankplan: '',
    picking_status: '',
    send_status: '',
    order: 'desc',
    sort: 'id',
    type: '',
    work_order_code: '',
    inventory_status: ''
  };
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
//获取班次
function getRankPlan() {
  AjaxClient.get({
    url: URLS['thinPro'].rankPlanList + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
    },
    success: function (rsp) {
      $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
        rsp.results.forEach(function (item) {
          var workStartTimeVal = dateToDayTime(item.from);
          var workEndTimeVal = dateToDayTime(item.to);
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
      }

    },
    fail: function (rsp) {
      layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
    }
  })
}

function laydateRender() {
  //日期时间选择器
  laydate.render({
    elem: '#work_station_time',
    type: 'date'
  });
}

function bindWoPagenationClick(totalData, pageSize) {
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageWoNo,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageWoNo = api.getCurrent();
      getWorkOrder();
    }
  });
}

function bindPagenationClick(totalData, pageSize) {
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageNo,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageNo = api.getCurrent();
      getInventoryList();
    }
  });
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    sales_order_code: '',
    wo_number: '',
    po_number: '',
    specification: '',
    item_no: '',
    date_begin_time: '',
    date_end_time: '',
    date_time: '',
    print_num: '',
    export_num: '',
    declare_status: '',
    group: '',
    order: 'desc',
    sort: 'id'
  };
}

//获取列表工单
function getWorkOrder() {
  var urlLeft = '';
  for (var param in ajaxWoData) {
    urlLeft += `&${param}=${ajaxWoData[param]}`;
  }
  urlLeft += "&page_no=" + pageWoNo + "&page_size=" + pageSize + "&status=2";
  AjaxClient.get({
    url: URLS['WorkOrder'].NewPageIndex + _token + urlLeft,
    dataType: 'json',
    cache: false,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      var _shtml = createProducedHtml(rsp);
	  $('.table_page').html(_shtml);

		if (rsp.paging.total_records < 20) {
			$('#total_gd').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
		} else {
			$('#total_gd').css('display', 'none').text(' ');
		}

      if (totalData > pageSize) {
        bindWoPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation.produce').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取清单列表失败，请刷新重试', 9);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成粗排列表数据
function createProducedHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      var temp = [];
      if (item.out_material != null && item.out_material.length > 0) {
        temp = JSON.parse(item.out_material);
      }
      var checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}" data-work_id="${item.work_order_id}">
                    <span class="el-checkbox-outset"></span>
                </span>`;

      var routChangeHtml = '';
      if (item.version_change == 1) {
        routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
      }

      trs += `
      <tr>
            <td>${checkedHtml}</td>
            <td>${routChangeHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="200px;">${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.work_center)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.inventory_status == 0 ? '未入托盘清单' : (item.inventory_status == 1 ? '部分已入托盘清单' : '全部入托盘清单'))}</td>
			<td>${tansferNull(item.on_off == 0 ? '订单关闭' : '订单开启')}</td>
			<td>${tansferNull(item.picking_status == 0 ? '未领' : item.picking_status == 1 ? '领料中' : item.picking_status == 2 ? '已领' : '')}</td>
			<td style="color: ${item.send_status == 1 ? 'red' : ''}">${tansferNull(item.is_sap_picking == 0 ? '' : item.send_status == 0 ? '未发' : item.send_status == 1 ? '少发' : item.send_status == 2 ? '正常' : item.send_status == 3 ? '超发' : '')}</td>
			<td>${tansferNull(item.schedule_status)==0?'未报工':tansferNull(item.schedule_status)==1?'部分报工':tansferNull(item.schedule_status)==2?'已报工':''}</td>
			<td>${tansferNull(item.inventory_qty)}</td>
			</tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="18" style="text-align: center;">暂无数据</td></tr>';
  }
  var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th>
                      <span class="el-checkbox_input all-inmate-check">
                          <span class="el-checkbox-outset"></span>
                      </span>
                    </th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th width="200px;" class="left nowrap tight">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">工时</th>
                    <th class="left nowrap tight">托盘清单状态</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th>
                    <th class="left nowrap tight">报工状态</th>
                    <th class="left nowrap tight">托盘清单数量</th>
                </tr>
                </thead>
                <tbody class="table_tbody_producted">${trs}</tbody>
            </table>
		</div>
		<div id="total_gd" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation" style="margin-top: 5px;"></div>`;
  $('#showPickingList').show();
  return thtml;
}

//获取清单列表
function getInventoryList() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['Inventory'].getWorkOrderInventoryList + _token + urlLeft,
    dataType: 'json',
    cache: false,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      var _shtml = createInventoryListHtml(rsp);
	  $('.table_page').html(_shtml);
	  
		if (rsp.paging.total_records < 20) {
			$('#total_qd').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
		} else {
			$('#total_qd').css('display', 'none').text(' ');
		}

      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation.produce').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取清单列表失败，请刷新重试', 9);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成清单列表数据
function createInventoryListHtml(data) {
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      var temp = [];
      if (item.out_material != null && item.out_material.length > 0) {
        temp = JSON.parse(item.out_material);
      }
      var checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.id}" data-work_id="${item.work_order_id}">
                  <span class="el-checkbox-outset"></span>
              </span>`;

      var routChangeHtml = '';
      if (item.version_change == 1) {
        routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
      }
      trs += `
    <tr>
          <td>${checkedHtml}</td>
          <td>${routChangeHtml}</td>
    <td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
    <td>${tansferNull(item.item_no)}</td>
    <td width="200px;">${tansferNull(item.specification)}</td>
    <td>${tansferNull(item.qty)}</td>
    <td>${tansferNull(item.po_number)}</td>
    <td>${tansferNull(item.wo_number)}</td>
    <td>${tansferNull(item.group)}</td>
    <td>${tansferNull(item.employee_name)}</td>
    <td>${tansferNull(item.date_time)}</td>
    <td>${tansferNull(item.export_num)}</td>
    <td>${tansferNull(item.declare_status == 0 ? '未报工' : item.declare_status == 1 ? '部分报工' : item.declare_status == 2 ? '已完工' : '未知')}</td>
    <td style="max-width:100px;">${tansferNull(item.remark)}</td>
    <td class="right"><button class="button pop-button delete" data-id="${item.id}">删除</button></td>
    </tr>
    `;
    })
  } else {
    trs = '<tr><td colspan="18" style="text-align: center;">暂无数据</td></tr>';
  }
  var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
          <table id="inventory_order_table" class="sticky uniquetable commontable">
              <thead>
              <tr>
                  <th class="left nowrap tight">
                    <span class="el-checkbox_input all-inmate-check">
                        <span class="el-checkbox-outset"></span>
                    </span>
                  </th>
                  <th class="left nowrap tight"></th>
                  <th class="left nowrap tight">销售订单号/行项号</th>
                  <th class="left nowrap tight">物料编码</th>
                  <th width="200px;" class="left nowrap tight">规格</th>
                  <th class="left nowrap tight">数量</th>
                  <th class="left nowrap tight">生产订单号</th>
                  <th class="left nowrap tight">工单号</th>
                  <th class="left nowrap tight">组号</th>
                  <th class="left nowrap tight">责任人</th>
                  <th class="left nowrap tight">日期</th>
                  <th class="left nowrap tight">导出次数</th>
                  <th class="left nowrap tight showStatus">报工状态</th>
                  <th class="left nowrap tight" style="max-width:100px;">备注</th>
                  <th class="right nowrap tight">操作</th>
                  </tr>
              </thead>
              <tbody class="table_tbody_inventory">${trs}</tbody>
          </table>
	  </div>
	  <div id="total_qd" style="float:right; display:none;" ></div>
      <div id="pagenation" class="pagenation" style="margin-top: 5px;"></div>`;
  $('#showPickingList').show();
  return thtml;
}

function resetAll() {
  var parentForm = $('#searchForm');
  parentForm.find('#sales_order_code').val('');
  parentForm.find('#wo_number').val('');
  parentForm.find('#po_number').val('');
  parentForm.find('#specification').val('');
  parentForm.find('#item_no').val('');
  parentForm.find('#date_begin_time').text('');
  parentForm.find('#date_end_date').text('');
  parentForm.find('#group').text('');
  parentForm.find('#print_num').text('').siblings('.el-input').val('--请选择--');
  parentForm.find('#export_num').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#declare_status').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#inventory_status').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#wo_sales_order_code').val(''),
    parentForm.find('#sales_order_project_code').val(''),
    parentForm.find('#work_order_number').val(''),
    parentForm.find('#work_task_number').val(''),
    parentForm.find('#production_order_number').val(''),
    parentForm.find('#schedule').val('').siblings('.el-input').val('--请选择--'),
    parentForm.find('#picking_status').val('').siblings('.el-input').val('--请选择--'),
    parentForm.find('#send_status').val('').siblings('.el-input').val('--请选择--'),
    parentForm.find('#date_start_time').val(''),
    parentForm.find('#start_time').val(''),
    parentForm.find('#end_time').val(''),
    parentForm.find('#name').val(''),
    parentForm.find('#rankplan').val(''),
    pageNo = 1;
  resetParam();
  resetWoParam();
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function bindEvent() {
  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
    if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
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
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
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

  //Tap切换
  $('body').on('click', '.el-tap-wrap .el-tap', function () {
    var form = $(this).attr('data-item');
    if (!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      var status = $(this).attr('data-status');
      $('#pageNnber').val(1)
      $('#status').val(status);
      if (status == 1) {
        $(".export").hide();
        $(".print").hide();
        $(".merge-buste").hide();
        $("#searchWo_from").show();
        $("#searchSTallo_from").hide();
        resetAll();
        getWorkOrder(status);
      } else if (status == 2) {
        $(".export").show();
        $(".print").show();
        $(".merge-buste").show();
        $("#searchWo_from").hide();
        $("#searchSTallo_from").show();
        resetAll();
        getInventoryList();
      } else {
        // $(".declare").show();
      }

    }
  });

  //搜索
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('backageground', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var status = $('.el-tap.active').attr('data-status');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      if (status == 2) {
        var workStationDate = '';
        var workStationTime = '';
        if (parentForm.find('#work_station_time').val()) {
          workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
          workStationTime = Math.round(workStationDate.getTime() / 1000);
        }

        ajaxData = {
          sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
          wo_number: encodeURIComponent(parentForm.find('#wo_number').val().trim()),
          po_number: encodeURIComponent(parentForm.find('#po_number').val().trim()),
          specification: encodeURIComponent(parentForm.find('#specification').val().trim()),
          item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
          date_begin_time: encodeURIComponent(parentForm.find('#date_begin_time').text()),
          date_end_time: encodeURIComponent(parentForm.find('#date_end_time').text()),
          date_time: encodeURIComponent(parentForm.find('#date_start_time').text()),
          print_num: encodeURIComponent(parentForm.find('#print_num').val()),
          export_num: encodeURIComponent(parentForm.find('#export_num').val()),
          declare_status: encodeURIComponent(parentForm.find('#declare_status').val().trim()),
          group: encodeURIComponent(parentForm.find('#group').val().trim()),
          order: 'desc',
          sort: 'id',
        };
        getInventoryList();
      } else {
        ajaxWoData = {
          sales_order_code: encodeURIComponent(parentForm.find('#wo_sales_order_code').val().trim()),
          sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
          work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
          work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
          production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
          schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
          picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
          send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
          plan_start_date: parentForm.find('#start_time_input').text(),
          plan_end_date: parentForm.find('#end_time_input').text(),
          name: parentForm.find('#work_shift_name').val(),
          rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
          inventory_status: encodeURIComponent(parentForm.find('#inventory_status').val().trim()),
          order: 'desc',
          sort: 'id'
        };
        getWorkOrder(status);
      }
      pageNo = 1;
    }
  });

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetAll();
    var status = $('.el-tap.active').attr('data-status');
    if (status == 2) {
      getInventoryList();
    } else {
      getWorkOrder(status);
    }
  });

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#date_end_time').text() ? $('#date_end_time').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#date_begin_time',
      // max: max,
      type: 'datetime',
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
    var min = $('#date_begin_time').text() ? $('#date_begin_time').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#date_end_time',
      min: min,
      // max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#wo_start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
      type: 'datetime',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#wo_end_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#end_time_input',
      min: min,
      // max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#wo_end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#date_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    end_time = laydate.render({
      elem: '#date_start_time',
      // max: getCurrentDate(),
      type: 'datetime',
      format: 'yyyy-MM-dd HH',
      show: true,
      closeStop: '#date_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  })

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

  //点击选择工单
  $('body').on('click', '.el-checkbox_input_check', function () {
    if ($(this).hasClass('is-checked')) {
      $(this).removeClass('is-checked');
    } else {
      $(this).addClass('is-checked');
    }
  });

  //清单列表多选框全选/全不选
  $('body').on('click', '#inventory_order_table .el-checkbox_input.all-inmate-check', function (e) {
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      $('.table_tbody_inventory').find('.el-checkbox_input').removeClass('is-checked');
      ele.removeClass('is-checked');
    } else {
      $('.table_tbody_inventory').find('.el-checkbox_input').addClass('is-checked');
      ele.addClass("is-checked");
    }
  })

  //工单列表多选框全选/全不选
  $('body').on('click', '#worker_order_table .el-checkbox_input.all-inmate-check', function (e) {
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      $('.table_tbody_producted').find('.el-checkbox_input').removeClass('is-checked');
      ele.removeClass('is-checked');
    } else {
      $('.table_tbody_producted').find('.el-checkbox_input').addClass('is-checked');
      ele.addClass("is-checked");
    }
  })

  $('body').on('click', '.delete', function (e) {
    e.stopPropagation();
    var that = $(this);
    layer.confirm("确认删除未发料行项？", {
      icon: 3, title: '提示', offset: '250px', end: function () { }
    }, function (index) {
      layer.close(index);
      var id = that.attr("data-id");
      console.log(id)
      deleteInventoryItem(id);
    });
  });

  //加入托盘清单
  $('body').on('click', '#searchWo_from .addlist', function (e) {
    e.stopPropagation();
    var listArr = [], woArr = [];
    if ($('body').find('.table_tbody_producted')) {
      var _this = $('.table_tbody_producted').find('tr');
      _this.each(function (index, item) {
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var list = $(item).find(".is-checked").attr("data-work_id");
          var wo = $(item).find(".is-checked").attr("data-id");
          listArr.push(list);
          woArr.push(wo);
        }
      })
      if (listArr.length > 0) {
        var listArrStr = listArr.join();
        window.location.href = '/WorkOrder/InventorySave?ids=' + listArrStr;
      } else {
        layer.msg('当前未选择清单，请选择需要保存的工单！', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  })

  //合并报工
  $('body').on('click', '#searchSTallo_from .merge-buste', function (e) {
    e.stopPropagation();
    var listArr = [], inventoryArr = [];
    if ($('body').find('.table_tbody_inventory')) {
      var _this = $('.table_tbody_inventory').find('tr');
      _this.each(function (index, item) {
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var list = $(item).find(".is-checked").attr("data-work_id");
          var inventory = $(item).find(".is-checked").attr("data-id");
          listArr.push(list);
          inventoryArr.push(inventory);
        }
      })
      if (listArr.length > 0) {
        var listArrStr = listArr.join();
        var inventoryArrStr = inventoryArr.join();
        window.open("/Buste/inventoryMergeBusteIndex?ids=" + inventoryArrStr);
      } else {
        layer.msg('当前未选择清单，请选择需要报工的清单！', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  })

  //导出功能
  $('body').on('click', '#searchSTallo_from .exportInventory', function (e) {
    e.stopPropagation();
    var inventoryArr = [], inventoryArrStr = '';
    if ($('body').find('.table_tbody_inventory')) {
      var _this = $('.table_tbody_inventory').find('tr');
      _this.each(function (index, item) {
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var inventory = $(item).find(".is-checked").attr("data-id");
          inventoryArr.push(inventory);
        }
      })
      if (inventoryArr.length > 0) {
        inventoryArrStr = inventoryArr.join();
      }
    }
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
      wo_number: encodeURIComponent(parentForm.find('#wo_number').val().trim()),
      po_number: encodeURIComponent(parentForm.find('#po_number').val().trim()),
      specification: encodeURIComponent(parentForm.find('#specification').val().trim()),
      item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
      date_begin_time: encodeURIComponent(parentForm.find('#date_begin_time').val()),
      date_end_time: encodeURIComponent(parentForm.find('#date_end_time').val()),
      date_time: encodeURIComponent(parentForm.find('#date_start_time').text()),
      print_num: encodeURIComponent(parentForm.find('#print_num').val()),
      export_num: encodeURIComponent(parentForm.find('#export_num').val()),
      declare_status: encodeURIComponent(parentForm.find('#declare_status').val().trim()),
      group: encodeURIComponent(parentForm.find('#group').val().trim()),
      ids: inventoryArrStr
    }
    var urlLeft = '';
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    window.location.href = '/Inventory/inventoryExportExcel?' + _token + urlLeft;
  })

  //打印功能
  $('body').on('click', '#searchSTallo_from .print', function (e) {
    e.stopPropagation();
    if ($('body').find('.table_tbody_inventory')) {
      var inventoryArr = [];
      var _this = $('.table_tbody_inventory').find('tr');
      _this.each(function (index, item) {
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var inventory = $(item).find(".is-checked").attr("data-id");
          inventoryArr.push(inventory);
        }
      })
      if (inventoryArr.length > 0) {
        var inventoryArrStr = inventoryArr.join();
        printInventoryList(inventoryArrStr);
        printNumberCount(inventoryArrStr);
      } else {
        layer.msg('当前未选择清单，请选择清单后打印！', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  })
}

//统计打印次数
function printNumberCount(ids) {
  AjaxClient.post({
    url: URLS['Inventory'].printNum,
    data: {
      ids: ids,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // getInventoryList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

//打印
function printInventoryList(idStr) {
  AjaxClient.get({
    url: URLS['Inventory'].getInventorDetail + _token + "&id_batch=" + idStr,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // LayerConfig('success', '成功！');
      $('#print_list').html('')
      rsp.results.forEach(function (item,index) {
        showPrintList(item,index);
      });
      $("#print_list").show();
      $("#print_list").print();
      $("#print_list").hide();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}


function showPrintList(formData,page) {
  console.log(formData)
  var trs = '';
  var dataLength = formData.length > 6 ? formData.length : 6;
  if (formData.length > 0) {
    formData.forEach(function (bitem, i) {
      trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.sales_order_code)}/${tansferNull(bitem.sales_order_project_code)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-break:break-all;">${tansferNull(bitem.specification)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-break:break-all;">${tansferNull(bitem.item_no)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-break:break-all;">${tansferNull((bitem.work_shop_name).substring(0, 2) == '缝纫' ? '缝纫' : bitem.work_shop_name)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(Number(bitem.qty).toFixed(0))}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
        </tr>`;
    })
    if (dataLength > formData.length) {
      for (var i = 0; i < dataLength - formData.length; i++) {
        trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
        </tr>`;
      }
    }
    //trs += `<tr class="has-border"><td colspan=2 style="border-bottom:1px solid #000;">审核：</td><td colspan=3 style="border-bottom:1px solid #000;">检验状态：</td><td colspan=3 style="border-bottom:1px solid #000;">仓库：</td></tr>`
  } else {
    trs = '<tr><td colspan="8" style="text-align:center">暂无数据</td></tr>';
  }
  var thtml = `<div class="wrap_table_div has-border">
                <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
                    <thead>
                    <tr style="text-align:center;">
                        <th class="left nowrap tight" style="">订单号/行项号</th>
                        <th class="left nowrap tight" style="max-width:200px;">规格</th>
                        <th class="left nowrap tight">物料编码</th>
                        <th class="left nowrap tight">生产车间</th>
                        <th class="left nowrap tight">入库数量(箱/个)</th>
                        <th class="left nowrap tight" style="min-width:80px;">备注</th>
                        <th class="left nowrap tight">签字确认</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">${trs}</tbody>
                </table>
            </div>`;
  var print_html = `<form class="viewAttr formModal">
            <div class="printPage" style="page-break-after: always;">
              <div style="text-align:center;font-size:36px;">
                <span>入库对点表</span>
              </div>
              <div style="display:flex;font-size:18px;height:28px;line-height:28px;">
                <div style="flex:2;text-align:left;"><span>组号:${formData[0].group}</span></div>
                <div style="flex:2;text-align:left;"><span>负责人:${formData[0].employee_name}</span></div>
                <div style="flex:2;text-align:left;"><span>日期:${dateFormat(formData[0].date_time)}</span></div>
                <div style="flex:2;text-align:left;"><span>页码:${page+1}</span></div>
              </div>
              ${thtml}
            </div>
        </form>`;
  $('#print_list').append(print_html);
}

function deleteInventoryItem(id) {
  AjaxClient.post({
    url: URLS['Inventory'].delInventory + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '删除成功！');
      getInventoryList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}


function bindItemPagenationClick(totalData, pageSize) {
  $('#item_pagenation').show();
  $('#item_pagenation').pagination({
    totalData: totalData,
    showData: pageSize,
    current: itemPageNo,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      itemPageNo = api.getCurrent();
      getPickingList();
    }
  });
}

function checkType(type) {
  switch (type) {
    case 1:
      return '领料';
      break;
    case 2:
      return '退料';
      break;
    case 7:
      return '补料';
      break;
    default:
      break;
  }
}

function checkPickingStatus(status) {
  switch (status) {
    case 1:
      return '未发送';
      break;
    case 2:
      return '已推送';
      break;
    case 3:
      return '进行中';
      break;
    case 4:
      return '完成';
      break;
    default:
      break;
  }
}

function checkReturnStatus(status) {
  switch (status) {
    case 1:
      return '待推送';
      break;
    case 2:
      return '进行中';
      break;
    case 3:
      return '待出库';
      break;
    case 4:
      return '完成';
      break;
    default:
      break;
  }
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