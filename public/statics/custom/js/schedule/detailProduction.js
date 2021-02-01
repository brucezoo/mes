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
  var _date = _getCurrentDate('work_station_time');
  $("#work_station_time").val(_date);
  getLaydate('work_start_time');//设置初始时间
  getLaydate('work_end_time');//设置初始结束时间
  getLaydate('operation_start_time');//设置开始时间  
  setAjaxData();//初始搜索条件
  getPo(1);//获取工单
  bindEvent();//绑定按钮事件
  getAllOperation();//获取所有工序
});

function setAjaxData() {
  var ajaxDataStr = window.location.hash;
  var planStartTime = '';
  try {
    ajaxData = {
      plan_start_date: planStartTime,
      plan_end_date:'',
      rank_plan_id: '',
      sales_order_code: '',
      sales_order_project_code: '',
      production_order_number: '',
      work_order_number: '',
      status: '',
      operation_start_time: '',
      start_time: '',
      end_time: '',
      work_center_id: '',
      operation_id: '',
      work_shift_id: '',
      // component:'',
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
    plan_start_date: planStartTime,
    plan_start_date: '',
    plan_end_date: '',
    rank_plan_id: '',
    status: '',
    sales_order_code: '',
    sales_order_project_code: '',
    production_order_number: '',
    work_order_number: '',
    operation_start_time: '',
    start_time: '',
    end_time: '',
    work_center_id: '',
    operation_id: '',
    work_shift_id: '',
    item_no: '',
    // component:'',
    order: 'desc',
    sort: 'id'
  }
}

// 获取细排订单
function getPo(status) {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
  $('.table_tbody').html('');
  $('#total').css('display','none');
  AjaxClient.get({
    url: URLS['pro'].workOrderList + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
      clearInterval(count_down);
    },
    success: function (rsp) {


	if(rsp.paging.total_records < 20) {
		$('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
	} else {
		$('#total').css('display','none').text(' ');
	}


      layer.close(layerLoading);
      window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      var pageTotal = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createPro($('#product_order_table .table_tbody'), rsp.results);
      } else {
        $('#product_order_table .table_tbody').html('<tr><td class="nowrap" colspan="19" style="text-align: center;">暂无数据</td></tr>');
      }
      if (pageTotal > pageSize) {
        bindPagenationClick(pageTotal, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取待处理订单列表失败');
    }
  });
}

//分拆工单modal
$('body').on('click', '.wo_partition', function () {
  var list = $(this).attr('data-content');
  list = JSON.parse(list);
  layerModal = layer.open({
    type: 1,
    title: '拆单',
    offset: '100px',
    area: '350px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    content: `<form class="splitwo formModal formMateriel" id="splitWO" >
        <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
            <div class="woinfo">
                <p><span>工单号：<span class="highlight">${list.wo_number}</span></span></p>
                <p><span>数量[<span>${list.commercial}</span>]:<span class="highlight" id="qtyNum">${list.qty}</span></span></p>
                <p><span>工作中心：<span class="highlight" v-text="woSplitData.operation_name">${list.work_center}</span></span><p>
                <input type="hidden" id="work_order_id" value="${list.work_order_id}"/>
                <input type="hidden" id="factory_id" value="${list.factory_id}"/>
                <input type="hidden" id="operation_id" value="${list.operation_id}"/>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <span style="width: 134px;flex: none;">拆出数量[<span>${list.commercial}</span>]：<span class="mustItem">*</span></span>
                    <input type="number" min="1" step="1" id="splitNum" class="el-input splitNum" value="" >
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit split-submit">确定</button>
            </div>
        </div>   
    </form>`})
})

function html2Escape(sHtml) {
  return sHtml.replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
}

function html2Quto(sHtml) {
  return sHtml.replace(/'/g, '"');
}

// 生成订单列表
function createPro(ele, data) {
  ele.html('');
  data.forEach(function (item) {
    var in_materials = '', prohtml = '', in_length;
    if (item.out_material && item.out_material.length) {
      temp = JSON.parse(item.out_material);
    } else {
      temp = [{ name: '' }]
    }
    if (item.in_material && item.in_material.length) {
      in_materials = JSON.parse(item.in_material);
      in_length = in_materials.length;
    }
    item.in_material = html2Quto(item.in_material);
    var plan_start_time = item.plan_start_time == 0 ? '' : dateFormat(item.plan_start_time, 'Y-m-d H:i:s');
    var operation_start_time = item.operation_start_time == 0 ? '' : dateFormat(item.operation_start_time, 'Y-m-d H:i:s');
    var operation_end_time = item.operation_end_time == 0 ? '' : dateFormat(item.operation_end_time, 'Y-m-d H:i:s');
    var plan_end_time = item.plan_end_time == 0 ? '' : dateFormat(item.plan_end_time, 'Y-m-d H:i:s');

    var routChangeHtml = '',changeFactoryHtml='';
    if (item.version_change == 1) {
        routChangeHtml = `<button type="button" class="el-button version-change"  data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
    }
    if (item.change_factory == 1) {
        changeFactoryHtml = `<button type="button" class="el-button" style="color: #20a0ff;cursor: pointer;padding: 4px; font-weight: bold;">转厂</button>`;
    }
    prohtml = item.status == 1 ? $(`<tr class="no-line-tr">
    <td><span class="el-checkbox_input el-checkbox_item" data-work-order-id="${item.work_order_id}" data-content='${JSON.stringify(item)}' data-id="${item.work_center_id}"><span class="el-checkbox-outset"></span></span></td>
    <td>${routChangeHtml}</td>
    <td>${changeFactoryHtml}</td>
    <td>${tansferNull(item.sales_order_code)}</td>
    <td>${item.sales_order_project_code != 0 ? item.sales_order_project_code : ''}</td>
    <td>${tansferNull(item.po_number)}</td>
    <td>${tansferNull(item.wo_number)}</td>
    <td class="work_bench" style="background-color: ${in_length > 2 ? "#89B2D1" : ""}"></td>
    <td style="max-width:200px;min-width:50px;word-break: break-all;">${item.item_no}: ${item.name}</td>
    <td align="center">${tansferNull(item.qty)}</td>
    <td align="center">${tansferNull(item.operation_name)}</td>
    <td align="center">${tansferNull(operation_start_time)}</td>
    <td align="center">${tansferNull(operation_end_time)}</td>
    <td align="center" class="work-center" data-id="${item.work_center_id}">${tansferNull(item.work_center)}</td>
    <td align="center">${tansferNull(item.factory_name)}</td>
    <td align="center" data-work-hour="${item.total_workhour}" class="work-hour">${tansferNull(item.total_workhour)}[s]</td>
    
    <td align="center">${tansferNull(item.NEXT_LIFNR)}</td>
    <td align="center">${tansferNull(item.old_version)}.0</td>
    <td align="center">
      <button class="button pop-button view wo_partition" data-content='${JSON.stringify(item)}' data-id="${item.product_order_id}">拆单</button>
      <button class="button pop-button wo_detail" data-id="${item.work_order_id}"  id="${item.work_order_id}" data-status="${item.status}" data-commercial="${item.commercial}">详情</botton>
      <button class="button pop-button view viewWorkPlan" data-work-center-name="${item.work_center}" data-work-order-id="${item.work_order_id}" data-actual-work-center-id="${item.actual_work_center_id}" data-id="${item.work_center_id}">查看排班</button>
      <button class="order_item button pop-button view" data-id="${item.work_center_id}" data-work-order-id="${item.work_order_id}" data-content='${html2Escape(JSON.stringify(item))}'>排单</button>
      <button class="button pop-button view viewAttachment" data-id="${item.work_order_id}" data-type="1">附件</button>
      <button class="button pop-button view viewRouing" data-id="${item.work_order_id}">工艺文件</button>
      <!--<button class="button pop-button view viewProcess" data-id="${item.work_order_id}"><a style="color:#00a0e9;" href="/BomManagement/bomSoView?sales_order_code=${item.sales_order_code}&sales_order_project_code=${item.sales_order_project_code}">工艺文件</a></button>-->
    </td>
    </tr>`) : $(`<tr style="background-color:#f5f5f5;" class="has-line-tr" data-id=${tansferNull(item.work_order_id)}>
    <td><span class="el-checkbox_input el-checkbox_item" data-id="${item.work_order_id}"><span class="el-checkbox-outset"></span></span></td>
    <td>${routChangeHtml}</td>
    <td>${changeFactoryHtml}</td>
    <td>${tansferNull(item.sales_order_code)}</td>
    <td>${item.sales_order_project_code != 0 ? item.sales_order_project_code : ' '}</td>
    <td>${tansferNull(item.po_number)}</td>
    <td>${tansferNull(item.wo_number)}</td>
    <td class="work_bench" style="background-color: ${in_length > 2 ? "#89B2D1" : ""}"></td>
    <td align="center">${item.item_no}: ${item.name}</td>
    <td align="center">${tansferNull(item.qty)}</td>
    <td align="center">${tansferNull(item.operation_name)}</td>
    <td align="center">${tansferNull(operation_start_time)}</td>
    <td align="center">${tansferNull(operation_end_time)}</td>
    <td align="center">${tansferNull(item.work_center)}</td>
    <td align="center">${tansferNull(item.work_shift_name)}</td>
    <td align="center">${tansferNull(item.factory_name)}</td>
    <td align="center" data-work-hour="${item.total_workhour}" class="work-hour">${tansferNull(item.total_workhour)}[s]</td>
    <td align="center">${tansferNull(plan_start_time)}</td>
    <td align="center">${tansferNull(plan_end_time)}</td>
   
    <td align="center">${tansferNull(item.NEXT_LIFNR)}</td>
    <td align="center">${tansferNull(item.version)}</td>
    <td align="center">
      <button class="button pop-button wo_detail" data-id="${item.work_order_id}" data-plan-start-time="${item.plan_start_time}" data-operation-id="${item.operation_id}" id="${item.work_order_id}" data-status="${item.status}" data-commercial="${item.commercial}">详情</botton>
      <button class="button pop-button view viewWorkPlan" data-work-center-name="${item.work_center}" data-plan-start-time="${item.plan_start_time}" data-actual-work-center-id="${item.actual_work_center_id}" data-id="${item.work_center_id}">查看排班</button>
      <button class="button pop-button view cancelCombineRow" data-id="${item.work_order_id}" data-ids="${item.po_id}">撤销排入</button>
      <button class="button pop-button view viewAttachment" data-id="${item.work_order_id}" data-type="1">附件</button>
      <button class="button pop-button view viewRouing" data-id="${item.work_order_id}">工艺文件</button>
      <!--<button class="button pop-button view viewProcess" data-id="${item.work_order_id}"><a style="color:#00a0e9;" href="/BomManagement/bomSoView?sales_order_code=${item.sales_order_code}&sales_order_project_code=${item.sales_order_project_code}">工艺文件</a></button>-->
    </td>
    </tr>`);
    if (item.in_material && item.in_material.length) {
      if (typeof (item.in_material) == String) {
        in_materials = JSON.parse(item.in_material);
      }
      workBenchHtml = '';
      if (in_materials.length > 2) {
        for (var i = 0; i < 2; i++) {
          _whtml = prohtml.find('.work_bench');
          workBenchHtml = `<p style="">${in_materials[i].material_code}:${in_materials[i].name}</p>`;
          _whtml.append(workBenchHtml)
        }
      } else if (in_materials.length >= 1 || in_materials.length <= 2) {
        for (var i = 0; i < in_materials.length; i++) {
          _whtml = prohtml.find('.work_bench');
          workBenchHtml = `<p>${in_materials[i].material_code}:${in_materials[i].name}</p>`;
          _whtml.append(workBenchHtml)
        }
      }
    }
    ele.append(prohtml);
  });
}

//生成工单详情页二维码
function makeCode(po_number, sales_order_code, wt_number, qty, qrcode) {
  var elText = "生产订单号：" + po_number + "\r\n销售订单号：" + sales_order_code + "\r\n工单：" + wt_number + "\r\n工单数量[PCS]：" + qty;
  qrcode.makeCode(elText);
}

//获取工单详情
function woDetail(id, commercial, status, operation_id, time) {
  var url = `/WorkOrder/show` + '?' + _token;
  var data = {
    work_order_id: id
  }
  var operation_id = operation_id;
  AjaxClient.get({
    url: url,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var data = rsp.results;
      work_center_id = data.workcenter_id;
      var actual_work_center_id = data.actual_work_center_id;
      abilityValue = data.total_workhour;
      if (rsp) {
        var indata = [], outdata = [];
        var _this = rsp;
        var height = ($(window).height() - 200) + 'px';
        var labelWidth = 100, btnShow = 'btnShow';
        var title = `详情&排单`;
        layerModal = layer.open({
          type: 1,
          title: title,
          offset: '80px',
          area: '1200px',
          shade: 0.1,
          shadeClose: true,
          resize: false,
          content: `
        <div class="wo-deinfo-wrap" style="max-height: ${height};overflow-y: auto;position: relative;">
          <div class="qrcode-content">
            <div id="qrcode" style="width:100px; height:100px;float:right;border:1px solid #ccc;">
              <div id="qrCodeIco"></div>
            </div>
          </div>
          <div class="block-div" style="height: 100px;">
            <div class="basic-infos" style="margin-top: 10px;">
              <p><span>&nbsp;&nbsp;工单号：<span class="highlight">${data.wo_number}</span><input type="hidden" class="wt-input-number">&nbsp;&nbsp&nbsp;&nbsp;<span class="highlight">${status == 1 ? `未排` : `已排`}</span></p>
              <p><span>&nbsp;&nbsp;数量：<span class="highlight">${data.qty}(${commercial})</span></span>&nbsp;&nbsp;&nbsp;&nbsp;</p>
              <p><span>&nbsp;&nbsp;工作中心：<span class="highlight">${data.workcenter_name}</span></span></p>
              <p><span>&nbsp;&nbsp;总工时：<span class="highlight">${data.total_workhour}s</span></span></p>
            </div>
          </div>
          ${status == 1 ? `<div class="work_order_condition">
          <div class="block-div"><h4>排单</h4></div>
          <input type="hidden" id="itemId" value="${data.work_order_id}"/>
          <input type="hidden" id="totalworkhour" value="${data.total_workhour}"/>
          <input type="hidden" id="workcenter_id" value="${data.workcenter_id}"/>
          <input type="hidden" id="factory_id" value="${data.factory_id}"/>
          <input type="hidden" id="workshop_id" value="${data.workshop_id}"/>
          <input type="hidden" id="operationability_id" value="${data.operation_ability_id}"/>
          <div class="search_info">
            <div class="el-form-item bench" style="height:58px;">
              <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: ${labelWidth}px;font-size:12px;text-align:left;color:#666;">&nbsp;&nbsp;工位</label>
                  <div class="el-select-dropdown-wrap">
                      <div class="el-select">
                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                          <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                          <input type="hidden" class="val_id" id="work_bench_id" value="">
                      </div>
                      <div class="el-select-dropdown">
                          <ul class="el-select-dropdown-list" id="select-work-bench">
                          </ul>
                      </div>
                  </div>
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
            </div>
            <div class="el-form-item select_date" style="height:58px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;font-size:12px;text-align:left;color:#666;">&nbsp;&nbsp;开始日期</label>
                <input type="text" id="date" class="el-input" placeholder="选择日期" autocomplete="off" value="">
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
            </div>
            <div class="el-form-item select_rank_plan" style="height:58px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;font-size:12px;text-align:left;color:#666;">&nbsp;&nbsp;班次</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" id="workRankPlan" class="el-input" placeholder="--请选择--">
                    <input type="hidden" class="val_id" id="rankplan_id" value=""/>
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
            </div>
          </div>
        </div>
        <div class="el-form-item ${btnShow}">
          <div class="el-form-item-div btn-group">
            <button type="button" class="el-button cancle">取消</button>
            <button type="button" data-content=${JSON.stringify(data)} class="el-button el-button--primary submit scheduling-wo">排单</button>
          </div>
        </div>` : ''}
        ${status == 2 ? `<div class="block-div">
          <h4>排班详情</h4>
          <div class="basic_info yipai_info">
            <div class="table-wrap">
              <table class="sticky uniquetable commontable" style="width:992px;">
                <thead>
                  <tr>
                    <th>排单日期</th>
                    <th>工厂</th>
                    <th>车间</th>
                    <th>工作中心</th>
                    <th>工作台</th>
                  </tr>
                </thead>
                <tbody class="table_tbody">
                  <tr>
                    <td><span id="workorder_time"></span></td>
                    <td><span id="factory_name"></span></td>
                    <td><span id="workshop_name"></span></td>
                    <td><span id="workcenter_name"></span></td>
                    <td><span id="workbench_name"></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>`: ''}
        <div class="block-div">
          <h4>进料</h4>
          <div class="basic-info income">
            <div class="table_page">
		          <div class="table-wrap">
		            <table class="sticky uniquetable commontable">
		              <thead>
		                <tr>
		                  <th>编码</th>
                      <th>名称</th>
                      <th>数量</th>
                      <th>物料属性</th>
                      <th>工艺属性</th>
                      <th>图纸</th>
                      <th>是否排单</th>
		                </tr>
		              </thead>
		              <tbody class="table_tbody">
		                <tr><td colspan="7">暂无数据</td></tr>
		              </tbody>
		            </table>
		          </div>
		        </div>
          </div>
        </div>
        <div class="block-div">
          <h4>出料</h4>
          <div class="basic-info outcome">
            <div class="table_page">
		          <div class="table-wrap">
		            <table class="sticky uniquetable commontable">
		              <thead>
		                <tr>
		                  <th>编码</th>
                      <th>名称</th>
                      <th>数量</th>
                      <th>物料属性</th>
                      <th>工艺属性</th>
                      <th>图纸</th>
                      <th>是否排单</th>
		                </tr>
		              </thead>
		              <tbody class="table_tbody">
		                <tr><td colspan="7">暂无数据</td></tr>
		              </tbody>
		            </table>
		          </div>
		        </div>
          </div>
          </div>
        </div>`,
          success: function (layero, index) {
            $("#qrcode").html('');
            //二维码
            var qrcode = new QRCode(document.getElementById("qrcode"), {
              width: 100,
              height: 100,
            });
            var ele = $('#work_station_time').val();
            layerEle = layero;
            showWorkCenterRankPlan(work_center_id, actual_work_center_id, ele);
            //获取工作台
            getAllWorkBench(work_center_id);
            getLaydate('date', ele, abilityValue);
            makeCode(data.po_number, data.sales_order_code, data.wt_number, data.qty, qrcode);
            $('.wo-deinfo-wrap span.wt-number').html(rsp.results.wt_number);
            $('.wo-deinfo-wrap span.wt-input-number').val(rsp.results.wt_number);
            $('.wo-deinfo-wrap #workorder_time').html(dateFormat(time));
            $('.wo-deinfo-wrap #factory_name').html(rsp.results.factory_name);
            $('.wo-deinfo-wrap #workcenter_name').html(rsp.results.workcenter_name);
            $('.wo-deinfo-wrap #workshop_name').html(rsp.results.workshop_name);
            $('.wo-deinfo-wrap #workbench_name').html(rsp.results.workbench_name);
          },
          end: function () {
            $("#qrCodeIco11").html('');
          }
        });
        if (data.in_material) {
          indata = JSON.parse(data.in_material);
        }
        var inhtml = createwoDetail(indata, status);
        $('.basic-info.income .table_tbody').html(inhtml);
        if (data.out_material) {
          outdata = JSON.parse(data.out_material);
        }
        var outhtml = createwoDetail(outdata, status);
        $('.basic-info.outcome .table_tbody').html(outhtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取工单详情失败');
    }
  })
}

//生成工单详情表格
function createwoDetail(data, status) {
  var trs = '';
  if (data && data.length) {
    data.forEach(function (item) {
      var mattrs = item.material_attributes,
        opattr = [],
        imgs = item.drawings,
        mattrhtml = '',
        opattrhtml = '',
        imghtml = '';
      if (item.operation_attributes) {
        opattr = item.operation_attributes
      }
      mattrs.length && mattrs.forEach(function (k, v) {
        mattrhtml += `<p><span>${k.name}: </span><span>${k.value}${k.unit ? k.unit : ''}</span></p>`;
      });
      opattr.length && opattr.forEach(function (k, v) {
        opattrhtml += `<p><span>${k.name}: </span><span>${k.value}${k.unit ? k.unit : ''}</span></p>`;
      });
      imgs.length && imgs.forEach(function (k, v) {
        imghtml += `<p attachment_id="${k.drawing_id}" data-creator="${k.creator_name}" data-ctime="${k.ctime}" data-url="${k.image_path}"  title="${k.name}"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" src="/storage/${k.image_path}" data-src="/storage/${k.image_path}" alt="${k.name}"></p>`;
      });
      trs += `<tr>
            <td>${item.item_no}</td>
            <td>${item.name}</td>
            <td>${item.qty} [${item.bom_commercial}]</td>
            <td>${mattrhtml}</td>
            <td>${opattrhtml}</td>
            <td>${imghtml}</td>
            <td>${status == 1 ? `未排` : `已排`}</td>
        </tr>`;
    });
  } else {
    trs = '<tr><td colspan="7">暂无数据</td></tr>';
  }
  return trs;
}

//新工位获取所有工位列表
function getAllWorkBenchByNewWorkCenter(wcid) {
  AjaxClient.get({
    url: URLS['thinPro'].benchList + '?' + _token + '&status=1&workcenter_id=' + wcid,
    dataType: 'json',
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.id}" data-factor="${item.factor}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
        //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
        innerHtml = `${lis}`;
        $('.el-form-item.new-bench').find('.el-select-dropdown-list').html(innerHtml);
      } else {
        $('.el-form-item.new-bench').find('.el-select-dropdown-list').html("<li data-id='0' class='el-select-dropdown-item'>当前工作中心下没有工位</li>");
      }
      setTimeout(function () {
        getLayerSelectPosition($(layerEle));
      }, 200);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工位列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

//关联工位页获取所有工位列表
function getAllWorkBench(wcid) {
  AjaxClient.get({
    url: URLS['thinPro'].benchList + '?' + _token + '&status=1&workcenter_id=' + wcid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.id}" data-factor="${item.factor}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.bench').find('.el-select-dropdown-list').html(innerHtml);
      }
      setTimeout(function () {
        getLayerSelectPosition(layerEle);
      }, 100);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工位列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

//获取工作中心绑定的班次
function getWorkCenterRankPlan(id, time) {
  AjaxClient.get({
    url: URLS['thinPro'].rankPlan + '?' + _token + '&work_center_id=' + id + '&work_station_time=' + time,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.rank_plan_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}  ${item.work_time_start}~${item.work_time_end}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工作中心列表失败', { icon: 5, offset: '250px', time: 1500 });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

//时间组件
function getLaydate(flag, normal, val,time) {
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
      value:time,
      position: 'fixed',
      done: function (value) {
        // var str = normal + " " + value, reg = str.split(' ');
        // if (reg[0] == normal) {
        //   var formatTimeS = new Date(str).getTime(),
        //     formatTimeMin = new Date(minRange).getTime(),
        //     formatTimeMax = new Date(maxRange).getTime(),
        //     _time = formatTimeS + (val * 1000);
        //   if (_time > formatTimeMin && _time < formatTimeMax) {
        //     $('.el-form-item.select_date').find('.errorMessage').hide().html('');
        //     startTimeCorrect = 1;
        //   } else {
        //     $('.el-form-item.select_date').find('.errorMessage').show().html('超出产能时间，点击确定按钮强制排单');
        //   }
        // } else {
        //   $('.el-form-item.select_date').find('.errorMessage').show().html('时间范围不正确');
        // }
        $('.work_station_time').find('.errorMessage').hide().html('');
      }
    });
  } else if (flag == "operation_start_time") {
    laydate.render({
      elem: '#' + flag,
      done: function (value) {
        $('.operation_start_time').find('.errorMessage').hide().html('');
      }
    });
  } else if (flag == 'plan_start_time') {
    var _date = $("#work_station_time").val();
    laydate.render({
      elem: '#' + flag,
      done: function (value) {
        $('.plan-start-time').find('.errorMessage').hide().html('');
        laydate.render({
          elem: '#plan_end_time',
          min:$("#plan_start_time").val()
        })
      }
    });
  }else if (flag == 'work_end_time') {
    var _date = $("#work_station_time").val();
    laydate.render({
      elem: '#' + flag,
      done: function (value) {
        $('.work_end_time').find('.errorMessage').hide().html('');
      }
    });
  } else if (flag == 'work_start_time') {
    laydate.render({
      elem: '#' + flag,
      done: function (value) {
        $('.work_start_time').find('.errorMessage').hide().html('');
      }
    });
  } else if (flag == 'date') {
    $('.el-form-item.select_date').find('.errorMessage').hide().html('');
    if (workCenterPlan) {
      var startDate = workCenterPlan[0].work_time_start;
      var endDate = workCenterPlan[workCenterPlan.length - 1].work_time_end;
      //排班开始时间毫秒数
      var startDateMs = new Date(normal + " " + startDate).getTime();
      //排班结束时间毫秒数
      var startMs = new Date(normal + ' 00:00:00').getTime();
      var work_center_id = $("#workcenter_id").val();
      laydate.render({
        elem: '#' + flag,
        type: 'date',
        format: 'yyyy-MM-dd',
        value:time,
        position: 'fixed',
        done: function (value) {
          if ($("#rankplan_id").val()) {
            if($("#factor").val()>0){
              getRemainCapacity(value, $("#rankplan_id").val(),$("#factor").val())
            }else{
              LayerConfig("fail",'请输入大于0的系数！');
            }
          }
          if (!value) {
            $('.el-form-item.select_date').find('.errorMessage').show().html('*请选择时间');
          } else {
            $('.el-form-item.select_date').find('.errorMessage').html('');
            AjaxClient.get({
              url: URLS['thinPro'].rankPlan + '?' + _token + '&work_center_id=' + work_center_id + '&work_station_time=' + value,
              dataType: 'json',
              beforeSend: function () {
                layerLoading = LayerConfig('load');
              },
              success: function (rsp) {
                layer.close(layerLoading);
                $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
                var lis = '', innerHtml = '';
                if (rsp.results && rsp.results.length) {
                  rsp.results.forEach(function (item) {
                    var workStartTimeVal = dateToDayTime(item.work_time_start);
                    var workEndTimeVal = dateToDayTime(item.work_time_end);
                    lis += `<li data-id="${item.rank_plan_id}" data-plan-type-id="${item.rank_plan_type_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
                  });
                  innerHtml = `${lis}`;
                  $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
                }
                setTimeout(function () {
                  getLayerSelectPosition($(layerEle));
                }, 200);
              },
              fail: function (rsp) {
                layer.close(layerLoading);
                layer.msg('获取工作中心列表失败', { icon: 5, offset: '250px', time: 1500 });
              }
            })
          }
        }
      });
    }
  } else {
    var _date = _getCurrentDate(flag);
    laydate.render({
      elem: '#' + flag,
      // min: _date,
      // value: _date,
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

//工位排单页
function showThinOrderModal(data,woids) {
  var abilityValue, commercial;
  var labelWidth = 120, readonly = 'readonly', btnShow = 'btnShow', _hours = '';
  if(data instanceof Array){
    list = data[0];
  }else{
    list=JSON.parse(data);
  }
  var abilityValue = list.total_workhour;
  var work_task_id = list.work_task_id;
  var work_shop_id = list.work_shop_id;
  var work_center_id = list.work_center_id;
  var operation_id = list.operation_id;
  var operation_ability_id = list.operation_ability_id;
  layerModal = layer.open({
    type: 1,
    title: '工位排单',
    offset: '20px',
    area: ['1200px', '680px'],
    shade: 0.1,
    shadeClose: false,
    move: '.layui-layer-title',
    resize: true,
    content: `<form class="addThinProduction formModal" id="addThinProduction_form" data-abilityValue="${abilityValue}" data-task-id="${work_task_id}" style="display:flex;justify-content:flex-start;">
              <div id="work-order-info" class="work_order_info" style="flex:1;">
                <div class="title" style="display:flex;">
                  <h5>工单信息</h5>
                  <h5 class="el-form-item-label" style="margin-left:30px;width: ${labelWidth + 15}px;color:#20A0FF;">工位剩余产能</h5>
                  <h5 id="remainCapacity" style="width:150px;color:#20A0FF;"></h5>
                  <div id="progressBar" style="width:200px;"></div>
                  <input type="hidden" id="workorder_ids" value="${woids}">
                  <input type="hidden" id="workcenter_id" value="${work_center_id}">
                  <input type="hidden" id="workshop_id" value="${work_shop_id}">
                  <input type="hidden" id="current_operation_id" value="${operation_id}">
                  <input type="hidden" id="operation_ability_id" value="${operation_ability_id}">
                </div>
                <p id="overCapacity" class="errorMessage" style="height:32px;line-height:32px;padding-left: ${labelWidth - 20}px;display:block;"></p>
                <div class="table-wrap">
                  <table id="table" class="sticky uniquetable commontable" style="height:100px;">
                    <thead>
                      <tr>
                        <th>工单号</th>
                        <th>基础数量</th>
                        <th>工序</th>
                        <th>能力</th>
                        <th>总工时</th>
                      </tr>
                    </thead>
                    <tbody class="table_tbody" style="overflow-y:auto;">
                      <tr><td colspan="5" style="text-align:center;">暂无数据</td></tr>
                    </tbody>
                  </table>
                </div>
            </div>
            <div class="work_order_condition" style="flex:1;">
              <div class="title" style="margin-top:20px;"><h5 style="font-weight:500;">排入选项</h5></div>
              <div class="search_info">
              <div class="el-form-item combine-model"  style="height:58px;line-height:58px;">
              <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: ${labelWidth - 15}px;">&nbsp;&nbsp;排入模式</label>
                  <div class="el-radio-group">
                      <label class="el-radio">
                          <span class="el-radio-input is-radio-checked">
                              <span class="el-radio-inner"></span>
                              <input name="radio" class="yes" type="hidden" value="1">
                          </span>
                          <span class="el-radio-label">顺序</span>
                      </label>
                      <label class="el-radio">
                          <span class="el-radio-input">
                              <span class="el-radio-inner"></span>
                              <input name="radio" class="yes" type="hidden" value="2">
                          </span>
                          <span class="el-radio-label">拼单</span>
                      </label>
                    </div>
                  </div>
              </div>
              <div class="el-form-item bench" style="height:58px;">
                  <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;工位</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="work_bench_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select-work-bench">
                                       
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                    </div>
                    <div class="el-form-item select_date" style="height:58px;">
                        <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;开始日期</label>
                          <input type="text" id="date" class="el-input" placeholder="选择日期" autocomplete="off" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    
                  <div class="el-form-item factor" style="height:58px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;系数</label>
                        <input type="text" id="factor" class="el-input" placeholder="" autocomplete="off" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                  </div>
                  <div class="el-form-item select-change-work-center" style="height:58px;line-height:58px;">
                    <div class="el-form-item-div" id="select_switch_workcenter">
                      <label class="el-form-item-label" style="width: ${labelWidth}px;"></label>
                      <div style="width:100%;">
                        <span class="el-checkbox_input el-checkbox_item  el_change_item">
                          <span class="el-checkbox-outset"></span>
                          <span style="font-size:14px;padding: 11px 12px 11px 0;">切换工作中心</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="el-form-item work-center-name" style="height:58px; margin-bottom: 10px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;切换工作中心</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="workCenterName" class="el-input" placeholder="--请选择--">
                                <input type="hidden" class="val_id" id="workCenter_sel" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list" id="select-work-center-id">                                  
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px; margin-top: 0px !important;  display:block;"></p>
                  </div>
                  <div class="el-form-item new-bench" style="height:58px;">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;新工位</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="newWorkBench" class="el-input" placeholder="--请选择--">
                                <input type="hidden" class="val_id" id="new_work_bench_id" value="">
                            </div>
                            <div class="el-select-dropdown">
                                <ul class="el-select-dropdown-list" id="new-select-work-bench">
                                   
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                  </div>
                    <div class="el-form-item select_rank_plan" style="height:58px;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;班次</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" id="workRankPlan" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="rankplan_id" value=""/>
                                    <input type="hidden" class="plan_type_id" id="rankplan_type_id" value=""/>
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select_rankplan_id">
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item switch-plan-start-time" style="height:58px;line-height:58px;">
                      <div class="el-form-item-div" id="switch_plan_start_time">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;"></label>
                        <div style="width:100%;">
                          <span class="el-checkbox_input el-checkbox_item">
                            <span class="el-checkbox-outset"></span>
                            <span style="font-size:14px;padding: 11px 12px 11px 0;">选择排入时间点</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="el-form-item plan_start_hour" style="height:58px;display:none;">
                      <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;开始时间</label>
                        <input type="text" id="time" class="el-input" placeholder="选择时间点" autocomplete="off" value="">
                      </div>
                      <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                </div>
                <div class="el-form-item ${btnShow}">
                  <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle">取消</button>
                    <button type="button" data-content='${JSON.stringify(list)}' class="el-button el-button--primary submit saveRelation_bench">确定</button>
                  </div>
                </div>
              </div>
            </form>`,
    success: function (layero, index) {
      layerEle = layero;
      $(".work-center-name").toggle();
      $(".new-bench").toggle();
      getAllWorkBench(work_center_id);
      var ele = $('#work_station_time').val(),
        lis = '',
        total_workhours = 0;
      $('.work_order_info').find('.table_tbody').html('');
      if (data instanceof Array&&data && data.length) {
        data.forEach(function (item) {
          if(typeof(item)=='string'){
            item = JSON.parse(item)
          }
          if (item) {
            work_order_id = item.work_order_id, commercial = item.commercial, qty = item.qty, wo_number = item.wo_number, operation_name = item.operation_name, total_workhour = item.total_workhour, ability_name = item.ability_name
          }
          lis += `<tr data-id="${work_order_id}"  data-total-workhour="${total_workhour}" class="el-select-dropdown-item work-hour">
                    <td>${wo_number}</td>
                    <td>${qty}[${commercial}]</td>
                    <td>${operation_name}</td>
                    <td>${ability_name}</td>
                    <td>${(Number(total_workhour) / 60).toFixed(2)}[min]</td>
                  </tr>`;
          total_workhours += Number(total_workhour);
        });
        lis += `<tr class="el-select-dropdown-item">
                  <td colspan="4"></td>
                  <td>${(Number(total_workhours) / 60).toFixed(2)}[min]</td>
                </tr>`;
        innerHtml = `${lis}`;
        $('.work_order_info').find('.table_tbody').append(innerHtml);
      }else{
          var item = JSON.parse(data);
          if (item) {
            work_order_id = item.work_order_id, commercial = item.commercial, qty = item.qty, wo_number = item.wo_number, operation_name = item.operation_name, total_workhour = item.total_workhour, ability_name = item.ability_name
          }
          lis += `<tr data-id="${work_order_id}"  data-total-workhour="${total_workhour}" class="el-select-dropdown-item work-hour">
                    <td>${wo_number}</td>
                    <td>${qty}[${commercial}]</td>
                    <td>${operation_name}</td>
                    <td>${ability_name}</td>
                    <td>${(Number(total_workhour) / 60).toFixed(2)}[min]</td>
                  </tr>`;
          total_workhours += Number(total_workhour);
        lis += `<tr class="el-select-dropdown-item">
                  <td colspan="4"></td>
                  <td>${(Number(total_workhours) / 60).toFixed(2)}[min]</td>
                </tr>`;
        innerHtml = `${lis}`;
        $('.work_order_info').find('.table_tbody').append(innerHtml);
      }
      
      setTimeout(function () {
        getLayerSelectPosition($(layerEle));
      }, 200);
      // getLaydate('date', ele, abilityValue);
      dragTable();
      var dragElement = document.getElementById("table");
      dragManager.main(dragElement);
    }
  })
}

//获取班次
function getRankPlan() {
  AjaxClient.get({
    url: URLS['aps'].getRankPlan + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '', innerHtml = '';
      lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
      // $('.el-form-item.rank-plan-name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.rank-plan-name').find('.el-select-dropdown-list').html(innerHtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取班次列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}

//获取已经排单的工单
function getcarefulPlan(wcid, acid, stime, time) {
  var data = {}, startDate;
  if (stime != undefined && stime) {
    data = {
      _token: TOKEN,
      plan_start_time: stime,
      work_center_id: wcid,
      actual_work_center_id: acid,
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
      var data = rsp.results;
      var arrLength = '';
      data.forEach(function (val, i) {
        if (arrLength == '') {
          arrLength = val.task_list.length;
        } else {
          if (arrLength < val.task_list.length) {
            arrLength = val.task_list.length;
          }
        }
      })
      if (arrLength <= 4) {
        tdHeight = 100;
      } else {
        tdHeight = (arrLength - 4) * 25 + 100;
      }
      $('.gantt-div-wrap .GanttWrap').html('');
      if (rsp && rsp.results && rsp.results.length) {
        var ganttChart = function () {
          $(".GanttWrap").GanttTool({
            'startDate': startDate,
            'ajaxUrl': null,
            'arrdata': rsp.results,
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

//搜索框获取工作中心下所有工位
function getAllWorkBenchByWorkCenter(wcid) {
  AjaxClient.get({
    url: URLS['pro'].getWorkbench + '?' + _token + '&workcenter_id=' + wcid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('.el-form-item.work_bench_name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
        //<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
        innerHtml = `${lis}`;
        $('.el-form-item.work_bench_name').find('.el-select-dropdown-list').append(innerHtml);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工位列表失败', { icon: 5, offset: '250px', time: 1500 });
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

//获取工序下所有工作中心
function getAllWorkCenterByOperationId(oid) {
  AjaxClient.get({
    url: URLS['pro'].workCenters + '?' + _token + '&workshop_id=' + oid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('.el-form-item.work-center-name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.workcenter_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.workcenter_name}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.work-center-name').find('.el-select-dropdown-list').append(innerHtml);
      }
      setTimeout(function () {
        getLayerSelectPosition($(layerEle));
      }, 200);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工作中心列表失败', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this);
}

function saveThinData(data) {
  var status = $("#status-spans").find(".active").attr("data-status");
  AjaxClient.post({
    url: URLS['aps'].rankCarefulPlan,
    data: data,
    dataType: 'json',
    // beforeSend: function () {
    //   layerLoading = LayerConfig('load');
    // },
    success: function (rsp) {
      layer.close(layerModal);
      LayerConfig('success', '排单成功');
      getPo(status);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this)
}

function getRemainCapacity(value, id, factor) {//获取剩余产能
  for (var type in validatorConfig) {
    validatorConfig[type]
      && validatorToolBox[validatorConfig[type]]
      && validatorToolBox[validatorConfig[type]](type)
  }
  if (!value) {
    $('.el-form-item.select_date').find('.errorMessage').show().html('*请选择时间');
  } else if (benchCorrect) {
    $('.el-form-item.select_date').find('.errorMessage').hide().html('');
    var work_center_id = $("#workcenter_id").val();
    var work_bench_id = $("#work_bench_id").val();
    if ($('#workCenter_sel').val()) { work_center_id = $('#workCenter_sel').val() }
    if ($("#new_work_bench_id").val()) { work_bench_id = $("#new_work_bench_id").val() }
    var data = {
      _token: TOKEN,
      work_center_id: work_center_id,
      work_shop_id: $("#workshop_id").val(),
      work_shift_id: work_bench_id,
      workcenter_operation_to_ability_id: $("#operation_ability_id").val(),
      date: value,
      factor: factor,
      rank_plan_id: id
    };
    AjaxClient.get({
      url: URLS['aps'].getRemainCapacity,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        $("#remainCapacity").html((Number(rsp.results.left_capacity) / 60).toFixed(2) + '[min]');
        $("#progressBar").html('');
        var percent = (rsp.results.has_capacity / rsp.results.total_capacity).toFixed(2) * 100 > 100 ? 100 : (rsp.results.has_capacity / rsp.results.total_capacity).toFixed(2) * 100;
        var progressBar = `<div class="progress" style="margin-top:10px;margin-bottom:10px;">
        <div class="progress-bar progress-bar-info text-center" role="progressbar"
             aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
             style="width: ${percent}%;background-color:#20A0FF;color:#000000;">
            <span>${percent}%</span>
        </div>
    </div>`;
        $("#progressBar").append(progressBar);
        var calc_total_workhours = 0;
        $("#table .table_tbody tr.work-hour").each(function () {
          calc_total_workhours += Number($(this).attr("data-total-workhour"))
        });
        if (calc_total_workhours > rsp.results.left_capacity) {
          $(".work_order_info").find("#overCapacity").show().html("当前排单工时超出剩余产能，点击按钮强制排单");
        } else {
          $(".work_order_info").find("#overCapacity").hide();
        }
      },
      fail: function (rsp) {
        if (rsp && rsp.message) {
          LayerConfig('fail', rsp.message);
        }
        layer.close(layerLoading);
      }
    })
  }
}

//获取工单计划开始时间
function getPlanStartTime(woids,work_shift_id){
  AjaxClient.get({
    url: URLS['aps'].getPlanStartTime+'?'+_token+'&work_order_id='+woids+'&work_shift_id='+work_shift_id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getLaydate('date','','',rsp.results.date);
      getLaydate('time','','',rsp.results.time);
      // rsp.results.plan_start_time;
    },
    fail: function (rsp) {
      if (rsp && rsp.message) {
        LayerConfig('fail', rsp.message);
      }
      layer.close(layerLoading);
    }
  })
}

// 点击工艺变更红标识
$('body').on('click', '.version-change', function () {
  let desc = $(this).attr('data-desc');
  let oldVersion = $(this).attr('data-oldVersion') + '.0';
  let newVersion = $(this).attr('data-newVersion') + '.0';
  layerModal = layer.open({
      type: 1,
      title: '信息',
      offset: '100px',
      area: ['400px', '300px'],
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form class="viewAttr formModal" style="width: 340px;margin: 0 auto;">
                  <div style="height: 40px;text-align: left;">
                      <span>当前工单版本：</span>
                      ${oldVersion}
                  </div>
                  <div style="height: 40px;text-align: left;">
                      <span>工艺新版本：</span>
                      ${newVersion}
                  </div>
                  <div style="height: 120px;text-align: left;">
                      <span>新版本描述：</span>
                      ${desc}
                  </div>
              </form>`,
      success: function (layero, index) {
      
      },
      end: function () {
          
      }

  })
});

$('body').on('click', '.wo_detail', function (e) {
  e.stopPropagation()
  var id = $(this).attr('data-id'), commercial = $(this).data('commercial'), status = parseInt($(this).attr('data-status')), operation_id = $(this).attr('data-operation-id'), time = $(this).attr('data-plan-start-time');
  woDetail(id, commercial, status, operation_id, time);
  // 二维码
});

function bindEvent() {
  //时分秒显示
  $('body').on('click', '.text-center .switchTime', function () {
    var state = $(this).attr('data-time');
    switch (state) {
      case '0':
        $(this).html('分');
        $(this).attr('data-time', 1);
        $(".table_tbody").find(".work-hour").each(function (index, item) {
          $(this).html($(item).attr("data-work-hour") + '[s]');
        });
        break;
      case '1':
        $(this).html('时');
        $(this).attr('data-time', 2);
        $(".table_tbody").find(".work-hour").each(function (index, item) {
          $(this).html((Number($(item).attr("data-work-hour")) / 60).toFixed(2) + '[min]');
        });
        break;
      case '2':
        $(this).html('秒');
        $(this).attr('data-time', 0);
        $(".table_tbody").find(".work-hour").each(function (index, item) {
          $(this).html((Number($(item).attr("data-work-hour")) / 3600).toFixed(2) + '[h]');
        })
        break;
      default:
        break;
    }
  });
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

  //详情输入框的事件
  $('body').on('focus', '.work_order_condition .el-input', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '.work_order_condition .el-input:not([readonly])', function () {
    var name = $(this).attr("id");
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name)
  });

  //排序
  $('.sort-caret').on('click', function (e) {
    e.stopPropagation();
    $('.el-sort').removeClass('ascending descending');
    var status = $("#status-spans").find(".active").attr("data-status");
    if ($(this).hasClass('ascending')) {
      $(this).parents('.el-sort').addClass('ascending')
    } else {
      $(this).parents('.el-sort').addClass('descending')
    }
    $(this).attr('data-key');
    ajaxData.order = $(this).attr('data-sort');
    ajaxData.sort = $(this).attr('data-key');
    getPo(status);
  });

  //排单
  $('body').on('click', '.order_item:not(.is-disabled)', function (e) {
    var listArr = [];
    var list = $(this).attr('data-content');
    var listArr=list;
    $('.el-form-item.workcenter').find('.errorMessage').hide().html(' ');
    var time = $('#work_station_time').val();
    var id = $(this).attr('data-id');
    var acid = JSON.parse(list).actual_work_center_id;
    var woid=$(this).attr('data-work-order-id');
    workOrderIdAndWorkhour = [];
    //获取排班
    if (time != '') {
      showWorkCenterRankPlan(id, acid, time);
    }
    //显示关联工位modal
    showThinOrderModal(listArr,woid);
  })
  $('body').on('click', '.el-radio .el-radio-input', function () {
    if (!$(this).hasClass('is-radio-checked')) {
      $(this).addClass('is-radio-checked').parents('.el-radio').siblings('.el-radio').find('.el-radio-input').removeClass('is-radio-checked');
    }
  })

  //已排未排切换
  $('body').on('click', '.el-tap-wrap .el-tap', function () {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      var status = $(this).attr('data-status');
      if (status == 1) {
        $("#work_bench").hide();
        $("#exportBtn").hide();
        $("#printBtn").hide();
        $(".work_station_time").show();
        $(".plan-start-time").hide();
        $(".rank-plan-name").hide();
        $(".work_bench_name").hide();
        $(".plan_start_time").hide();
        $(".plan_end_time").hide();
        $(".combineRow").show();
        $("#exportCropBtn").hide();
        // $(".all-inmate-check").show();
      } else {
        $("#work_bench").show();
        $("#exportBtn").show();
        $("#printBtn").show();
        $(".work_station_time").hide();
        $(".plan-start-time").show();
        $(".rank-plan-name").show();
        $(".work_bench_name").show();
        $(".plan_start_time").show();
        $(".plan_end_time").show();
        $(".combineRow").hide();
        $("#exportCropBtn").show();
        // $(".all-inmate-check").hide();
        getLaydate('plan_start_time');
        getLaydate('plan_end_time');
        getRankPlan();
      }
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
      var parentForm = $('#searchReleased_from');
      var status = $("#status-spans").find(".active").attr("data-status");
      getLaydate('work_station_time');
      getLaydate('work_end_time');
      getLaydate('plan_start_time');
      parentForm.find('#operation_name').val('--请选择--');
      parentForm.find('#rank_time_name').val('--请选择--');
      parentForm.find('#work_center_name').val('--请选择--');
      parentForm.find('#work_bench_name').val('--请选择--');
      parentForm.find('#work_center_id').val('');
      parentForm.find('#operation_id').val('');
      parentForm.find('#sales_order_code').val('');
      parentForm.find('#sales_order_project_code').val('');
      parentForm.find('#product_order_number').val('');
      parentForm.find('#work_order_number').val('');
      // parentForm.find('#component').val('');
      resetParam();
      pageNo = 1;
      window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      getPo(status);
    }
  });

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });

  //组合排入
  $('body').on('click', '.combineRow', function (e) {
    e.stopPropagation();
    var isTrue = true,
      work_center_id = [],
    workOrderIdAndWorkhour = [],
    workOrderIds=[];
    if ($('body').find('.table_tbody')) {
      var _this = $('.table_tbody').find('.no-line-tr');
      var listArr = [];
      _this.each(function (index, item) {
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var list = JSON.parse($(item).find(".is-checked").attr("data-content"));
          listArr.push(list);
          //list = JSON.parse(list);
          work_center_id.push(parseInt($(item).find(".is-checked").attr("data-id")));
          workOrderIdAndWorkhour.push(list.work_order_id + ':' + list.total_workhour);
          workOrderIds.push(list.work_order_id);
        }
      })
      for (var i = 0; i < work_center_id.length; i++) {
        if (work_center_id.indexOf(work_center_id[i]) != 0) {//用indexOf来判断是否一样
          isTrue = false;
          break;
        } else {
          orderList = $('.table_tbody').find('.no-line-tr').find('.is-checked').attr('data-content');
        }
      }
      if (work_center_id.length > 0) {
        if (!isTrue) {
          layer.msg('所选工单属于不同的工作中心，请重新选择！', { icon: 5, offset: '250px', time: 1500 });
        } else {
          var list = orderList;
          list = JSON.parse(list);
          $('.el-form-item.workcenter').find('.errorMessage').hide().html(' ');
          var time = $('#work_station_time').val();
          var id = list.work_center_id;
          var acid = list.actual_work_center_id;
          //获取排班
          if (time != '') {
            showWorkCenterRankPlan(id, acid, time);
          }
          showThinOrderModal(listArr,workOrderIds);
        }
      } else {
        layer.msg('当前未选择工单，请选择需要排入的工单！', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  })

  //查看排班
  $('body').on('click', '.viewWorkPlan', function (e) {
    var id = $(this).attr("data-id"),
      acid = $(this).attr("data-actual-work-center-id"),
      work_center_name = $(this).attr("data-work-center-name"),
      plan_start_time = $(this).attr("data-plan-start-time"),
      time = $("#work_station_time").val();
    layerModal = layer.open({
      type: 1,
      title: '排班详情',
      offset: '90px',
      area: '1200px',
      shade: 0.1,
      shadeClose: false,
      move: false,
      resize: false,
      content: `<div class="gantt-div-wrap" style="background:#FAFBFC;border-radius: 3px;box-shadow: #e0e0e0 0px 0px 20px 1px;">
              <div class="workcenter" style="width:100%;height:70px;border-radius: 3px;color: #119BE7;display:flex;background: #F3F3F3;">
                <div style="width:200px;font-size:18px;margin-left:10px;height:35px;line-height:35px;display:flex;"><span>工作中心: </span><div id="work-center-name" style="width:120px;padding-left: 10px;"></div></div>
                <div id="work-center-rank-plan"></div>
                <input type="hidden" class="el-input" id="work-center-id" value="">
              </div>
					<div class="GanttWrap"><span style="margin-left:10px;">暂无数据</span></div>
        </div>`,
      success: function (layero, index) {
        $("#work-center-name").html(work_center_name);
        showWorkCenterRankPlan(id, acid, time);
        getcarefulPlan(id, acid, plan_start_time, time);
      }
    })
  })

  //点击撤销排入
  $('body').on('click', '.cancelCombineRow', function (e) {
    e.stopPropagation();
	var status = $("#status-spans").find(".active").attr("data-status");
	var po_id = parseInt($(this).attr("data-ids"));
    var id = parseInt($(this).attr("data-id"));
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行撤销排入操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
	  layer.close(index);
			var ids = [];
			ids.push(id);
			AjaxClient.get({
				url: URLS['aps'].cancelGroupCarefulPlan + "?_token=" + TOKEN + "&ids=" + JSON.stringify(ids),
				dataType: 'json',
				beforeSend: function () {
					layerLoading = LayerConfig('load');
				},
				success: function (rsp) {
					layer.close(layerLoading);
					LayerConfig('success', '撤消成功');
					getPo(status);
				},
				fail: function (rsp) {
					LayerConfig('fail', rsp.message);
					layer.close(layerLoading);
				}
			})

	// AjaxClient.get({
	// 	url: '/ProductOrder/checkCanDelete' + "?_token=" + TOKEN + '&product_order_id=' + po_id,
    //     dataType: 'json',
    //     beforeSend: function () {
    //       layerLoading = LayerConfig('load');
    //     },
    //     success: function (rsp) {
	// 		if(rsp.results.status == 1) {
	// 			  var ids = [];
	// 			  ids.push(id);
	// 			  AjaxClient.get({
	// 			    url: URLS['aps'].cancelGroupCarefulPlan + "?_token=" + TOKEN + "&ids=" + JSON.stringify(ids),
	// 			    dataType: 'json',
	// 			    beforeSend: function () {
	// 			      layerLoading = LayerConfig('load');
	// 			    },
	// 			    success: function (rsp) { 
	// 				  layer.close(layerLoading);
	// 			      LayerConfig('success', '撤消成功');
	// 			      getPo(status);
	// 			    },
	// 			    fail: function (rsp) {
	// 			      LayerConfig('fail', rsp.message);
	// 			      layer.close(layerLoading);
	// 			    }
	// 			  })
	// 		}else {
	// 			layer.close(layerLoading);
	// 			layer.alert(rsp.results.warning[0]);
	// 		}
    //     },
    //     fail: function (rsp) {
    //       LayerConfig('fail', rsp.message);
    //       layer.close(layerLoading);
    //     }
    //   })


    });
  })

  
  $('body').on('click', '.submit:not(.is-disabled)', function (e) {

	  console.log($('#workCenterName').val(), $('#workCenterName').text());
    //排单
    if ($(this).hasClass('saveRelation_bench')) {
      e.stopPropagation();
      for (var type in validatorConfig) {
        validatorConfig[type]
          && validatorToolBox[validatorConfig[type]]
          && validatorToolBox[validatorConfig[type]](type)
      }
      var parentForm = $('#addThinProduction_form'),
        work_task_id = 0,
        id = parentForm.find('#itemId').val(),
        plan_start_date = parentForm.find('#date').val(),
        plan_start_hour = "00:00:00",
        ability_value = parentForm.attr('data-abilityValue'),
        currentTime = $('#time').val(),
        currentDate = $('#work_station_time').val(),
        rank_plan_id = $("#rankplan_id").val(),
        rank_plan_type_id = $("#rankplan_type_id").val();
      var ssid = [];
      var carefulplan_sort = $(".combine-model").find(".is-radio-checked").find(".yes").val();
      var new_work_bench_id = 0;
      if ($("#new_work_bench_id").val()) { new_work_bench_id = $("#new_work_bench_id").val() }
      var actual_work_center_id = 0;
      if ($('#workCenter_sel').val()) { actual_work_center_id = $('#workCenter_sel').val() }
      $("#table .table_tbody tr").not(':last').each(function () {
        var sid = $(this).attr("data-id") + ':' + $(this).attr("data-total-workhour")
        ssid.push(sid);
      });
      //验证班次是否为空
      if (!$('#workRankPlan').val()) {
        $('.el-form-item.select_rank_plan').find('.errorMessage').show().html('*请选择班次');
        rankPlanCorrect = !1;
      } else {
        $('.el-form-item.select_rank_plan').find('.errorMessage').hide().html('');
        rankPlanCorrect = 1;
      }
      //验证时间是否为空
      if (plan_start_date != '') {
        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
        startTimeCorrect = 1;
      } else {
        $('.el-form-item.select_date').find('.errorMessage').show().html('*请选择时间');
        startTimeCorrect = !1;
	  }
	  
// maomao
	var worksCenter = 1;
	var worksBench = 1;
		if ($(this).parent().parent().parent().find('.el_change_item').hasClass('is-checked') ) {
			if ($('#workCenterName').val() == '' || $('#workCenterName').val() == '--请选择--') {
				worksCenter = !1;
				$('.work-center-name').find('.errorMessage').show().html('*请选择工作中心');
			}else {
				worksCenter = 1;
				$('work-center-name').find('.errorMessage').hide().html('');
			}

			if ($('#newWorkBench').val() == '' || $('#newWorkBench').val() == '--请选择--') {
				worksBench = !1;
				$('.new-bench').find('.errorMessage').show().html('*请选择新工位');
			} else {
				worksBench = 1;
				$('.new-bench').find('.errorMessage').hide().html('');
			}
		}
      var list = $(this).attr('data-content');
      list = JSON.parse(list);

      var work_shift_id = parentForm.find('#work_bench_id').val();

      if (benchCorrect && startTimeCorrect && rankPlanCorrect && worksCenter && worksBench) {
        loadLayer();
        var factory_id = list.factory_id,
          work_center_id = list.work_center_id,
          work_shop_id = list.work_shop_id;

        var work_station_time = $('#work_station_time').val();
        var plan_start_time = work_station_time + " " + parentForm.find('#time').val();
        var str_date_time = plan_start_time.split(' '),
          str_mm_time = str_date_time[1].split(':');
        var is_switch_workcenter = 0, is_select_time = 0;
        if ($("#select_switch_workcenter").find(".el-checkbox_input").hasClass('is-checked')) {
          is_switch_workcenter = 1
        }
        if ($("#switch_plan_start_time").find(".el-checkbox_input").hasClass('is-checked')) {
          is_select_time = 1
        }
        var work_equip_id = $("#work_equip_id").val();
        var factor = $("#factor").val();
        var plan_start_hour = $("#time").val();
        var _time = str_mm_time[0] * 3600000 + str_mm_time[1] * 60000 + ability_value * 1000;
        end_time = $('#work_station_time').val() + " " + showWorkCenterRankPlan(work_center_id, actual_work_center_id, plan_start_time, _time);
        if (end_time != undefined) {
          saveThinData({
            ids: JSON.stringify(ssid),
            actual_work_center_id: actual_work_center_id,
            work_center_id: work_center_id,
            is_switch_workcenter: is_switch_workcenter,
            is_select_time: is_select_time,
            carefulplan_sort: carefulplan_sort,
            work_shop_id: work_shop_id,
            work_task_id: work_task_id,
            work_shift_id: work_shift_id,
            actual_work_shift_id: new_work_bench_id,
            work_device_id: work_equip_id,
            factory_id: factory_id,
            rank_plan_id: rank_plan_id,
            rank_plan_type_id: rank_plan_type_id,
            plan_start_hour: plan_start_hour,
            plan_start_date: plan_start_date,
            work_station_time: work_station_time,
            factor: factor,
            _token: TOKEN
          })
        }
      }
    } else if ($(this).hasClass('searchWo-submit')) {//工单搜索
      e.stopPropagation();
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
      var time = $('#work_station_time').val();
      var parentForm = $("#searchReleased_from");
      var workStationDate = '',
        workStationTime = '',
        workStartDate = '',
        workStartTime = '',
        workEndDate = '',
        workEndTime = '',
        planStartDate = '',
        planStartTime = '',
        planEndDate='',
        planEndTime='';
      var status = $("#status-spans").find(".active").attr("data-status");
      if (parentForm.find('#operation_start_time').val()) {
        workStationDate = new Date(parentForm.find('#operation_start_time').val() + ' 00:00:00');
        workStationTime = Math.round(workStationDate.getTime() / 1000);
      }
      if (parentForm.find('#work_start_time').val()) {
        workStartDate = new Date(parentForm.find('#work_start_time').val() + ' 00:00:00');
        workStartTime = Math.round(workStartDate.getTime() / 1000);
      }
      if (parentForm.find('#work_end_time').val()) {
        workEndDate = new Date(parentForm.find('#work_end_time').val() + ' 00:00:00');
        workEndTime = Math.round(workEndDate.getTime() / 1000);
      }
      if (parentForm.find('#plan_start_time').val()) {
        planStartDate = new Date(parentForm.find('#plan_start_time').val() + ' 00:00:00');
        planStartTime = Math.round(planStartDate.getTime() / 1000);
      }
      if (parentForm.find('#plan_end_time').val()) {
        planEndDate = new Date(parentForm.find('#plan_end_time').val() + ' 23:59:59');
        planEndTime = Math.round(planEndDate.getTime() / 1000);
      }
      pageNo = 1;
      ajaxData = {
        plan_start_date: encodeURIComponent(planStartTime),
        plan_end_date: encodeURIComponent(planEndTime),
        operation_start_time: encodeURIComponent(workStationTime),
        start_time: encodeURIComponent(workStartTime),
        end_time: encodeURIComponent(workEndTime),
        status: encodeURIComponent(status.trim()),
        rank_plan_id: encodeURIComponent(parentForm.find('#rank_plan_id').val().trim()),
        operation_id: encodeURIComponent(parentForm.find('#operation_id').val().trim()),
        work_center_id: encodeURIComponent(parentForm.find('#work_center_id').val().trim()),
        sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
        sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
        work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
        production_order_number: encodeURIComponent(parentForm.find('#product_order_number').val().trim()),
        work_shift_id: encodeURIComponent(parentForm.find('#work_bench_number').val().trim()),
        item_no: encodeURIComponent(parentForm.find('#ma_item_no').val().trim()),
        // component: encodeURIComponent(parentForm.find('#component').val().trim()),
        order: 'desc',
        sort: 'id',
      };
      if (time != '') {
        $('.el-form-item').find('.errorMessage').html('');
        getPo(status);
      } else {
        if (time == '') {
          $('.el-form-item.work_station_time').find('.errorMessage').show().html('*请选择时间');
        }
      }
    } else if ($(this).hasClass('split-submit')) {//拆分工单
      e.stopPropagation();
      var proNum = $('#qtyNum')[0].innerHTML;
      var originSplitNum = $('.el-form-item-div #splitNum')[0].value;
      var splitNum = parseFloat(originSplitNum);
      var splitStatus = 0;
      var status = $("#status-spans").find(".active").attr("data-status");
      var re = /^\d*\.{0,1}\d{0,1}$/;
      if (splitNum < proNum && splitNum > 0 && re.exec(originSplitNum)) {
        $('.splitwo').find('.errorMessage').html('');
        splitStatus = 1;
      } else {
        $('.splitwo').find('.errorMessage').html('请输入正确的数值');
        splitStatus = 0;
      }
      var select_date = $('#work_station_time').val();
      if (splitStatus == 1 && splitStatus) {
        AjaxClient.post({
          url: URLS['aps'].splitwo,
          data: {
            _token: TOKEN,
            id: $('#work_order_id').val(),
            qty: originSplitNum
          },
          dataType: 'json',
          beforeSend: function () {
            layerLoading = LayerConfig('load');
          },
          success: function (rsp) {
            LayerConfig('success', '拆单成功');
            layer.close(layerModal);
            layer.close(layerLoading);
            getPo(status);
          },
          fail: function (rsp) {
            LayerConfig('fail', rsp.message);
            layer.close(layerModal);
            layer.close(layerLoading);
          }
        })
      } else {
        return;
      }
    } else if ($(this).hasClass('scheduling-wo')) {//详情页排单
      e.stopPropagation()
      for (var type in validatorConfig) {
        validatorConfig[type]
          && validatorToolBox[validatorConfig[type]]
          && validatorToolBox[validatorConfig[type]](type)
      }
      var detailBenchCorrect = 0,
        rankPlanCorrect = 0,
        startTimeCorrect = 0,
        work_task_id = '',
        id = [],
        total_workhour = $('#totalworkhour').val(),
        plan_start_date = $('#date').val(),
        plan_start_hour = "00:00:00",
        rank_plan_id = $('#rankplan_id').val(),
        rank_plan_type_id = $("#rankplan_type_id").val();
      var id_arr = $('#itemId').val() + ":" + total_workhour;
      id.push(id_arr);
      if (!$('#workBench').val()) {
        $('.el-form-item.bench').find('.errorMessage').show().html('*请选择工位');
        detailBenchCorrect = !1;
      } else {
        $('.el-form-item.bench').find('.errorMessage').hide().html('');
        detailBenchCorrect = 1;
      }
      //验证班次是否为空
      if (!$('#workRankPlan').val()) {
        $('.el-form-item.select_rank_plan').find('.errorMessage').show().html('*请选择班次');
        rankPlanCorrect = !1;
      } else {
        $('.el-form-item.select_rank_plan').find('.errorMessage').hide().html('');
        rankPlanCorrect = 1;
      }
      //验证时间是否为空
      if (plan_start_date != '') {
        $('.el-form-item.select_date').find('.errorMessage').hide().html('');
        startTimeCorrect = 1;
      } else {
        $('.el-form-item.select_date').find('.errorMessage').show().html('*请选择时间');
        startTimeCorrect = !1;
      }
      work_shift_id = $('#work_bench_id').val();
      if (detailBenchCorrect && startTimeCorrect && rankPlanCorrect) {
        var factory_id = $('#factory_id').val(),
          work_center_id = $('#workcenter_id').val(),
          work_shop_id = $('#workshop_id').val();
        var work_station_time = $('#work_station_time').val();
        var select_date = $('#date').val();
        var plan_start_time = select_date + " " + $('#time').val();
        var str_date_time = plan_start_time.split(' '),
          str_mm_time = str_date_time[1].split(':');
        var actual_work_center_id = 0;
        var work_equip_id = $("#work_equip_id").val();
        var _time = str_mm_time[0] * 3600000 + str_mm_time[1] * 60000 + abilityValue * 1000;
        end_time = $('#date').val() + " " + showWorkCenterRankPlan(work_center_id, actual_work_center_id, plan_start_time, _time);
        if (end_time != undefined) {
          saveThinData({
            ids: JSON.stringify(id),
            work_center_id: work_center_id,
            actual_work_center_id: actual_work_center_id,
            carefulplan_sort: 1,
            work_shop_id: work_shop_id,
            work_task_id: work_task_id,
            work_shift_id: work_shift_id,
            work_device_id: work_equip_id,
            factory_id: factory_id,
            rank_plan_id: rank_plan_id,
            rank_plan_type_id: rank_plan_type_id,
            plan_start_hour: plan_start_hour,
            plan_start_date: plan_start_date,
            work_station_time: work_station_time,
            _token: TOKEN
          })
        }
      }
    }
  })

  $('body').on('focus', '.splitNum', function (e) {
    var proNum = $('#qtyNum')[0].innerHTML;
    var originSplitNum = $('.el-form-item-div #splitNum')[0].value;
    var splitNum = parseInt(originSplitNum);
    $('.splitwo').find('.errorMessage').html('*请输入小于' + proNum + '至多一位小数的数值');
  })

  $('body').on('blur', '#factor', function (e) {
    var date = $("#date").val();
    var rankplanId = $("#rankplan_id").val();
    var factor = $("#factor").val();
    if(rankplanId){
      if(factor>0){
        getRemainCapacity(date, rankplanId, factor);
      }else{
        LayerConfig('fail','请输入大于0的系数！');
      }
    }else{
      LayerConfig('fail','请选择班次！');
    }
  })

  $('body').on('blur', '.splitNum', function (e) {
    var proNum = $('#qtyNum')[0].innerHTML;
    var originSplitNum = $('.el-form-item-div #splitNum')[0].value;
    var splitNum = parseInt(originSplitNum);
    if (splitNum > proNum) {
      $('.el-form-item-div #splitNum').val(proNum - 1)
    }
    $('.splitwo').find('.errorMessage').html('');
  })

  //全选
  $('body').on('click', '.all-inmate-check', function (e) {
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      $('.table_tbody').find('.el-checkbox_item').removeClass('is-checked');
      ele.removeClass('is-checked');
    } else {
      $('.table_tbody').find('.el-checkbox_item').addClass('is-checked');
      ele.addClass("is-checked");
    }
  });

  //单选
  $('body').on('click', '.el-checkbox_item', function (e) {
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      ele.removeClass('is-checked');
    } else {
      if (work_center_id.length > 0) {
        if (work_center_id[0] == ele.attr("data-id")) {
          work_center_id.push(ele.attr("data-id"));
          ele.addClass("is-checked");
        } else {
          layer.msg('所选工单属于不同的工作中心，请重新选择！', { icon: 5, offset: '250px', time: 1500 });
        }
      } else {
        orderList = ele.attr("data-content");
        ele.addClass("is-checked");
      }
    }
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
      if($(this).attr('data-factor')){
        $("#addThinProduction_form").find('#factor').val($(this).attr('data-factor'));
      }
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

  //点击切换工作中心
  $('body').on('click', '.el-select-dropdown #select-work-center-id .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var workCenter_sel = $("#workCenter_sel").val();
    $("#newWorkBench").val('--请选择--');
    $("#new_work_bench_id").val('');
    getAllWorkBenchByNewWorkCenter(workCenter_sel);
  })

  //点击班次
  $('body').on('click', '.el-select-dropdown #select_rankplan_id .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var date = $("#date").val();
    var rankplanId = $("#rankplan_id").val();
    var factor = $("#factor").val();
    if(factor>0){
      getRemainCapacity(date, rankplanId, factor);
    }else{
      LayerConfig('fail','请输入大于0的系数！');
    }
  })

  //点击切换工作中心
  $('body').on('click', '.select-change-work-center', function (e) {
    e.stopPropagation();
    var workshop_id = $("#workshop_id").val();
    if ($('.select-change-work-center').find('.el-checkbox_input').hasClass('is-checked')) {
      $(".work-center-name").show();
      $(".new-bench").show();
      getAllWorkCenterByOperationId(workshop_id);
    } else {
      $("#newWorkBench").val('--请选择--');
      $("#new_work_bench_id").val('');
      $("#workCenterName").val('--请选择--');
      $("#workCenter_sel").val('');
      $(".work-center-name").hide();
      $(".new-bench").hide();
    }
  })

  //点击选择排入时间点
  $('body').on('click', '.switch-plan-start-time', function (e) {
    e.stopPropagation();
    var operation_id = $("#current_operation_id").val();
    if ($('.switch-plan-start-time').find('.el-checkbox_input').hasClass('is-checked')) {
      $(".plan_start_hour").show();
      getLaydate('time');
    } else {
      $(".plan_start_hour").hide();
    }
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

  //搜索页点击工作中心
  $('body').on('click', '.el-select-dropdown #select-work-center .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var work_center_id = $("#work_center_id").val()
    var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
    var idval = $(this).attr('data-id');
    $("#work_bench_name").val('--请选择--');
    $("#work_bench_number").val('');
    getAllWorkBenchByWorkCenter(work_center_id);
  })

  //排入选项中点击工位
  $('body').on('click', '.el-select-dropdown #select-work-bench .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var woids = $("#workorder_ids").val();
    var work_shift_id=$(this).attr('data-id');
    getPlanStartTime(woids,work_shift_id);
  })

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
    parentForm.find('#plan_start_time').val('');
    parentForm.find('#plan_end_time').val('');
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
    // parentForm.find('#component').val('');
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

  // 日期的提示信息
  var desc_show = '';
  $('body').on('mouseenter', '#start_end .el-input', function () {
    var msg = $(this).attr('data-desc');
    if (msg != '') {
      desc_show = layer.tips(msg, this,
        {
          tips: [2, '#20A0FF'], time: 0
        });
    }
  }).on('mouseleave', '#start_end .el-input', function () {
    layer.close(desc_show);
  })

  //导出细排工单
  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    var date = new Date();
    date = dateFormat(date / 1000, 'Y-m-d');
    var start_time = date + " 00:00:00",
      end_time = date + " 23:59:59";
    if (parentForm.find('#date').val()) {
      workStationStartDate = parentForm.find('#date').val() + ' 00:00:00';
      workStationEndDate = parentForm.find('#date').val() + ' 23:59:59';
    }
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      start_time: encodeURIComponent(start_time),
      end_time: encodeURIComponent(end_time),
      plan_start_time: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),//排入时间
      plan_end_time: encodeURIComponent(parentForm.find('#plan_end_time').val().trim()),//排入时间
      rank_plan_id: encodeURIComponent(parentForm.find('#rank_plan_id').val().trim()),//班次id
      operation_id: encodeURIComponent(parentForm.find('#operation_id').val().trim()),//工序id
      operation_start_time: encodeURIComponent(parentForm.find('#operation_start_time').val().trim()),//工序开始时间
      sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),//销售订单号
      sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),//销售行项号
      work_start_time: encodeURIComponent(parentForm.find('#work_start_time').val().trim()),//主排开始时间
      work_end_time: encodeURIComponent(parentForm.find('#work_end_time').val().trim()),//主排开始时间
      work_center_id: encodeURIComponent(parentForm.find('#work_center_id').val().trim()),//工作中心id
      product_order_number: encodeURIComponent(parentForm.find('#product_order_number').val().trim()),//生产订单号
      work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),//工单号
      work_shift_id: encodeURIComponent(parentForm.find('#work_bench_number').val().trim()),//工位id
      ma_item_no: encodeURIComponent(parentForm.find('#ma_item_no').val().trim()),//产成品编码
      // component: encodeURIComponent(parentForm.find('#component').val().trim()),//组件消耗
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/WorkOrder/getPlannedexport?" + urlLeft;
    $('#exportExcel').attr('href', url)
  });

  $('body').on('click', '.formPullOrder:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#addPullOrder_from'),
      order_no = parentForm.find('#order').val(),
      date = parentForm.find('#time').val(),
      start = date.substr(0, 10),
      end = date.substr(13, 10);
    location.href = "pullOrderIndex?order_no=" + order_no + "&startDate=" + start + "&endDate=" + end;
  });

  $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  $('body').on('click', '#exportCropBtn', function (e) {
    var work_order_id = [];
    var status = $("#status-spans").find(".active").attr("data-status");
    var _this = $('.table_tbody').find('.has-line-tr');
    _this.each(function (index, item) {
      if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
        work_order_id.push(parseInt($(item).find(".is-checked").attr("data-id")));
      }
    });
    if (work_order_id != [] && work_order_id.length) {
      var url = URLS['aps'].Transferexport + '?' + _token + '&work_order_id=' + work_order_id;
      $("#exportCropExcel").attr('href', url);
    } else {
      layer.msg('请先选择工单后导出', { icon: 5, offset: '250px', time: 1500 });
    }
  })

  //点击打印流转卡
  $('body').on('click', '#printBtn', function (e) {
    e.stopPropagation();
    var work_order_id = [];
    var status = $("#status-spans").find(".active").attr("data-status");
    var _this = $('.table_tbody').find('.has-line-tr');
    _this.each(function (index, item) {
      if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
        work_order_id.push(parseInt($(item).find(".is-checked").attr("data-id")));
      }
    });
    if (work_order_id != [] && work_order_id.length) {
      layer.confirm("是否合并打印？", {
        icon: 3,
        btn: ['是', '否'],
        closeBtn: 0,
        title: false,
        offset: '250px'
      }, function (index) {
        layer.close(index);
        AjaxClient.get({
          url: URLS['aps'].TransferPrinting + '?' + _token + '&work_order_id=' + work_order_id+'&number=4',
          dataType: 'json',
          success: function (rsp) {
            if (status == 2) {
              $('#print_list').html('')
              rsp.results.forEach(function (item) {
                showPrintList(item);
              });
              $("#print_list").show();
              $("#print_list").print();
              $("#print_list").hide();
            }
          },
          fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取流转卡数据失败，请刷新重试', { icon: 5, offset: '250px', time: 1500 });
          },
          complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
          }
        }, this)
      }, function (index) {
        AjaxClient.get({
          url: URLS['aps'].TransferPrinting + '?' + _token + '&work_order_id=' + work_order_id,
          dataType: 'json',
          success: function (rsp) {
            if (status == 2) {
              $('#print_list').html('')
              rsp.results.forEach(function (item) {
                showPrintList(item);
              });
              $("#print_list").show();
              $("#print_list").print();
              $("#print_list").hide();
            }
          },
          fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取流转卡数据失败，请刷新重试', { icon: 5, offset: '250px', time: 1500 });
          },
          complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
          }
        }, this)
      });
    } else {
      layer.msg('请先选择工单后打印', { icon: 5, offset: '250px', time: 1500 });
    }
  });
}

function showPrintList(formData) {
  var trs = '';
  var dataLength = formData.length > 5 ? formData.length : 5;
  if (formData.length > 0) {
    formData.forEach(function (bitem, i) {
      trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.item_no)}</td> 
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.po_number)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.specifications)}</td>           
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;">${tansferNull(bitem.name)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;">${tansferNull(bitem.material_code)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px">${tansferNull(bitem.definition)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.number)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
        </tr>`;
    })
    if (dataLength > formData.length) {
      for (var i = 0; i < dataLength - formData.length; i++) {
        trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td> 
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
        </tr>`;
      }
    }
    trs += `<tr class="has-border"><td colspan=2 style="border-bottom:1px solid #000;">审核：</td><td colspan=3 style="border-bottom:1px solid #000;">检验状态：</td><td colspan=3 style="border-bottom:1px solid #000;">仓库：</td></tr>`
  } else {
    trs = '<tr><td colspan="8" style="text-align:center">暂无数据</td></tr>';
  }
  var thtml = `<div id="clearHeight" class="wrap_table_div has-border">
                <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
                    <thead>
                    <tr style="text-align:center;">
                        <th class="left nowrap tight">半成品编码</th>
                        <th class="left nowrap tight">订单号/行项号</th>
                        <th class="left nowrap tight">规格</th>
                        <th class="left nowrap tight">进料</th>
                        <th class="left nowrap tight">出料</th>
                        <th class="left nowrap tight">尺寸</th>
                        <th class="left nowrap tight">数量</th>
                        <th class="left nowrap tight">完成数</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">${trs}</tbody>
                </table>
            </div>`;
  var print_html = `<form class="viewAttr formModal">
            <div class="printPage" style="page-break-after: always;">
              <div style="text-align:center;font-size:36px;">
                <span>作业流转卡</span>
              </div>
              <div style="display:flex;font-size:18px;">
                <div style="flex:8;text-align:left;"><span>姓名:${formData[0].emplyee_name}</span></div>
                <div style="flex:4;text-align:left;"><span>生产单位:${formData[0].NEXT_LIFNR}</span></div>
              </div>
              <div style="display:flex;font-size:18px;">
                <div style="flex:8;text-align:left;"><span>工号:${formData[0].emplyee_code}</span></div>
                <div style="flex:4;text-align:left;"><span>日期:</span></div>
              </div>
              ${thtml}
            </div>
        </form>`;
  $('#print_list').append(print_html);
}

function deleteProductOrder(id) {
  var status = $("#status-spans").find(".active").attr("data-status");
  AjaxClient.get({
    url: URLS['order'].orderDelete + "?" + _token + "&product_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getPo(status);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message) {
        LayerConfig('fail', rsp.message);
      } else {
        LayerConfig('fail', '删除失败');
      }
      if (rsp.code == 404) {
        getPo(status);
      }
    }
  }, this);
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

// 分页
function bindPagenationClick(total, size) {
  var status = $("#status-spans").find(".active").attr("data-status");
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: total,
    showData: size,
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
      ajaxData.start_time='';
      ajaxData.end_time='';
      getPo(status);
    }
  });
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