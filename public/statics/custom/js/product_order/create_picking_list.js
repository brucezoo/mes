var id, type = '', sales_order_code = '', sales_order_project_code = '', in_material_arr = [], wo_number = '', po_number = '', pickingList = '', push_type = 0, no_depot_material_ids, factory_id, check_stor_type = 2, is_first, is_unfinished;
var batch = [];
var zrr = $('#zrr').text();
var zrr_id = $('#zrr_id').text();
var t ;
var returnMaterialData, pageNoItem = 1,
  pageSizeItem = 50;
$(function () {
  id = getQueryString('id');
  type = getQueryString('type');
  if (type == 1) {  // 生成领料单
    $('#picking_title').text('领料单');
    $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工艺单</label>
                                <input type="text" id="wt_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">BOM编码</label>
                                <input type="text" id="item_no" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>


                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">需求库存地点<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="storage_wo" class="el-input" placeholder="请输入需求库存地点" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项目号</label>
                                <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人"  data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">配送时间</label>
                              <input type="text" style="background-color: #fff !important;" id="chooseTime" readonly class="el-input" placeholder="请选择时间" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
                          </div>
                    </div>
                    <div id="showMESPicking" style="display:none;"></div>`);
    getworkOrderView(id)
    $('#storage_wo').autocomplete({
      url: URLS['work'].storageSelete + "?" + _token + "&is_line_depot=1",
      param: 'depot_name'
    });

    $('#employee').autocomplete({
      url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10",
      param: 'name'
	});

  }
  if (type == 2) { // 退料单
    $('#picking_title').text('退料单');
    $('.save').text('SAP退料');
    push_type = 1;
    $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">生产订单号</label>
                                <input type="text" id="po_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>                       
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工厂</label>
                                <input type="text" id="factory" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>   
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项单号</label>
                                <input type="text" id="sale_order_project_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人"  data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                             
                    </div>`);
    getReturnView(id);
    $('.nav-tabs').hide();

    $('#employee').autocomplete({
      url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10",
      param: 'name'
	});
  }
  if (type == 7) { //补料单
    $('#picking_title').text('补料单');
    $('.save').text('SAP补料');
    // $('.buquan').show();
    $('.save').show();
    $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工艺单</label>
                                <input type="text" id="wt_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">BOM编码</label>
                                <input type="text" id="item_no" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>


                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">需求库存地点<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="storage_wo" class="el-input" placeholder="请输入需求库存地点" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>   
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项目号</label>
                                <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人"  data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">配送时间</label>
                              <input type="text" style="background-color: #fff !important;" id="chooseTime" readonly class="el-input" placeholder="请选择时间" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
                          </div>
                    </div>`);
    getworkOrderView(id);

    push_type = 1;
    $('.nav-tabs').hide();
    $('#storage_wo').autocomplete({
      url: URLS['work'].storageSelete + "?" + _token + "&is_line_depot=1",
      param: 'depot_name'
    });

    $('#employee').autocomplete({
      url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10",
      param: 'name'
    });
  }
  bindEvent();
});

function getReturnView(id) {
  AjaxClient.get({
    url: URLS['order'].getCreateReturnMaterial + "?" + _token + "&work_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      returnMaterialData = rsp.results;
      $('.save').show();
      $('#storage_wo').val(returnMaterialData.line_depot_name + '（' + returnMaterialData.line_depot_code + '）');
      $('#po_number').val(returnMaterialData.product_order_code);
      $('#wo_number').val(returnMaterialData.work_order_code);
      $('#workbench_code').val(returnMaterialData.workbench_code);
      $('#factory').val(returnMaterialData.factory_name);
      $('#sales_order_code').val(returnMaterialData.sale_order_code);
      $('#sale_order_project_code').val(returnMaterialData.sale_order_project_code);
      showReturnInItem(returnMaterialData.items);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}

function createReturnPiciHtml(data) {

  var trs = '';
  if (data && data.length) {
    data.forEach(function (item, index) {

      trs += `
			<tr class="bacth_show" data-batch="${item.batch}" data-storage_number="${item.storage_number}" data-unit_id="${item.unit_id}" data-unit="${item.unit}" data-bom_unit_id="${item.bom_unit_id}" data-bom_commercial="${item.bom_commercial}" data-inve="${item.inve_id}">
			<td class="item_batch">${tansferNull(item.batch)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                <input type="number" style="line-height: 40px;" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input return_qty">
            </td>
			<td >${tansferNull(item.bom_commercial)}</td>
			</tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="8" class="center">暂无数据</td></tr>';
  }
  var thtml = `<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                        <th class="left nowrap tight">单位</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
  return thtml;
}

function showReturnInItem(data) {
  var ele = $('.storage_blockquote .item_table .t-body');
  $('#operation').hide();
  $('#salere').hide();
  $('#scck').hide();
  $('#rbqty').hide();
  $('#rqty').hide();
  $('#show_qty').hide();
  $('#runit').hide();
  $('#rattr').hide();
  $('#ruturnPici').show();
  $('#reason').show();
  ele.html("");
  data.forEach(function (item, index) {
    var batchHtml = '';
    batchHtml = createReturnPiciHtml(item.batches);
    var tr = `
            <tr class="material_item" data-material_id="${item.material_id}" data-material_code="${item.material_code}" data-material_name="${item.material_name}" data-send_depot="${item.send_depot}">
            <td></td>
            <td class="LGFSB" >${tansferNull(item.send_depot)}</td>
            <td class="item_no" >${tansferNull(item.material_code)}</td>    
            <td width="300px;">${tansferNull(item.material_name)}</td>
			<td class="storage_number">${batchHtml}</td>
			<td><textarea style="margin-top:10px;" id="text" rows="2" cols="20"></textarea></td>
            </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);

  })

}
function getworkOrderView(id) {
  AjaxClient.get({
    url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id+"&hasremoveschgt=1",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {

	window.sessionStorage.setItem('workshopId',rsp.results.workshop_id);
	
      layer.close(layerLoading);
      pickingList = rsp.results;
      if (rsp.results.depot_name) {
        $('#storage_wo').val(rsp.results.depot_name + '（' + rsp.results.line_depot_code + '）').data('inputItem', {
          id: rsp.results.line_depot_id,
          code: rsp.results.line_depot_code,
          name: rsp.results.depot_name
        }).blur();
      }
      laydate.render({
        elem: '#chooseTime',
        type: 'datetime',
        value: rsp.results.plan_start_time
      });
      $('#wo_number').val(rsp.results.wo_number);
      $('#wt_number').val(rsp.results.wt_number);
      $('#item_no').val(rsp.results.item_no);
      $('#sales_order_code').val(rsp.results.sales_order_code);
      $('#workbench_code').val(rsp.results.workbench_name).data('id', rsp.results.work_shift_id);
      $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
      in_material_arr = JSON.parse(rsp.results.in_material);
      sales_order_code = rsp.results.sales_order_code;
      factory_id = rsp.results.factory_id;
      sales_order_project_code = rsp.results.sales_order_project_code;
      wo_number = rsp.results.wo_number;
      po_number = rsp.results.po_number;
      line_depot_id = rsp.results.line_depot_id;
      if (type == 7) {
        getMaterialStorage(rsp.results.line_depot_id);
      } else {
        if (in_material_arr.length > 0) {
          getMaterialStorage(rsp.results.line_depot_id);
          check_stor_type = 2;
          no_depot_material_ids = [];
          in_material_arr.forEach(function (item) {
            if (item.LGFSB == '' || item.LGPRO == '') {
              no_depot_material_ids.push(item.material_id);
            }
          });
        }
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工单详情失败，请刷新重试', { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}
function getMaterialStorage(line_depot_id, flag) {
  var material_ids = [];
  in_material_arr.forEach(function (item) {
    material_ids.push(item.material_id);
  });
  AjaxClient.get({
    url: URLS['specialCause'].getMaterialStorage + "?" + _token + "&work_order_id=" + id + "&material_ids=" + material_ids + "&sale_order_code=" + sales_order_code + "&line_depot_id=" + line_depot_id + "&type=" + check_stor_type + '&sales_order_project_code=' + sales_order_project_code,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      batch = rsp.results;
      if (batch.is_rated_picking == 1) {
        $("#showMESPicking").show();
        $("#showMESPicking").html(`<div style="margin-left: 100px;color: red;">已完成MES领料处理，MES领料单号：${batch.mr_code}</div>`);
      }
      var transition_arr = [];
      if (is_first == 1 && push_type == 1) {
        in_material_arr.forEach(function (item) {
          var num = 0;
          if (batch.materials[item.material_id] != undefined) {
            if (batch.lzps[item.material_id].is_lzp == 0) {
              batch.materials[item.material_id].forEach(function (bitem) {
                if (bitem.is_comment == 1 && bitem.storage_number > 0) {
                  num += bitem.storage_number;
                  if (num > item.qty) {
                    transition_arr.push({
                      inve: bitem.inve_id,
                      material_code: item.material_code,
                      batch: bitem.batch,
                      number:item.qty,
                      storage_number:bitem.storage_number,
                      change_number: item.qty - (num - bitem.storage_number)
                    });
                    return;
                  } else {
                    transition_arr.push({
                      inve_id: bitem.inve_id,
                      material_code: item.material_code,
                      batch: bitem.batch,
                      number:item.qty,
                      storage_number:bitem.storage_number,
                      change_number: item.qty
                    })
                  }
                }
              })
            }

          }

        });
        var _tr = '', _table = '';
        if (transition_arr.length > 0) {
          transition_arr.forEach(function (item) {
            _tr += `<tr data-id="${item.inve_id}">
                      <td class="code">${item.material_code}</td>
                      <td class="batch">${item.batch}</td>
                      <td class="storagedNumber">${item.storage_number}</td>
                      <td class="ratedNumber">${item.number}</td>
                      <td><input type="text" class="number" max="${item.number}" style="margin-top:5px;"value="${item.change_number}" /></td>
                    </tr>`;
          })
          _table = `<table>
                                    <thead>
                                        <tr>
                                            <th>物料编码</th>
                                            <th>批次</th>
                                            <th>库存数量</th>
                                            <th>额定数量</th>
                                            <th>实际迁转数量</th>
                                        </tr>
                                    </thead>
                                    <tbody id="transition_tbody">
                                            ${_tr}                                    
                                    </tbody>
                                </table>`
        }

        if (transition_arr.length > 0) {
          var transition = 'true';
          layer.confirm(_table, {
            btn: ['迁转', '不迁转'], //可以无限个按钮
            area: ["600px", "400px;"]
          }, function (index, layero) {
            //按钮【按钮一】的回调
            layer.close(index);
            transition = 'true';
            var trans_arr=[];
            $("#transition_tbody tr").each(function(key,val){
              var inve_id=$(val).attr('data-id');
              var code=$(val).find(".code").text();
              var batch=$(val).find(".batch").text();
              var ratedNumber=$(val).find(".ratedNumber").text();
              var number=$(val).find(".number").val();
              if(Number(number)<=Number(ratedNumber)){
                trans_arr.push({
                  inve_id: inve_id,
                  material_code: code,
                  batch: batch,
                  change_number: number
                })
              }else{
                layer.msg('实际迁转数量不能大于额定数量', { icon: 5, offset: '250px', time: 2500 });
                return;
              }
            })
            if(trans_arr.length>0){
              showInItem(sales_order_code, sales_order_project_code, in_material_arr, wo_number, flag, transition);
              changeStorge(trans_arr);
            }           
          }, function (index) {
            //按钮【按钮二】的回调
            layer.close(index);
            transition = 'false';
            showInItem(sales_order_code, sales_order_project_code, in_material_arr, wo_number, flag, transition);
          });
        } else {
          showInItem(sales_order_code, sales_order_project_code, in_material_arr, wo_number, flag);
        }
      } else {
        showInItem(sales_order_code, sales_order_project_code, in_material_arr, wo_number, flag);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)

}
function changeStorge(data) {
  AjaxClient.post({
    url: URLS['specialCause'].changeStorage,
    data: {
      sale_order_code: sales_order_code,
      product_order_code: po_number,
      work_order_code: wo_number,
      sale_order_project_code: sales_order_project_code,
      data: data,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.msg("迁转成功！", { icon: 1, offset: '250px', time: 1500 }, function () {
        window.location.reload()
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 }, function () {
        window.location.reload()
      });

    }
  }, this)
}
function bindEvent() {
  $('body').on('click', '.save', function (e) {
    e.stopPropagation();
    submitPickingList()
  });
  $('body').on('click', '#storage_wo_selete .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var $storage_wo = $('#storage_wo');
    var storage_wo = $storage_wo.data('inputItem') == undefined || $storage_wo.data('inputItem') == '' ? '' :
      $storage_wo.data('inputItem').name == $storage_wo.val().replace(/\（.*?）/g, "").trim() ? $storage_wo.data('inputItem').id : '';
    line_depot_id = storage_wo;
    if (storage_wo) {
      getMaterialStorage(storage_wo)
    }
  });
  $('body').on('click', '.buquan', function (e) {
    e.stopPropagation();
    getDepot();
  });

  //单选按钮点击事件
  $('body').on('click', '.choose-push-type', function (e) {

    if (in_material_arr.length > 0) {
      $('.choose-push-type').removeClass('active');
      $(this).addClass('active');


      if (type == 2) {
		$('.nav-tabs').hide();
        showInItem(sales_order_code, sales_order_project_code, in_material_arr, wo_number);
      } else {

        push_type = $(this).attr('data-push_type');
        if (push_type == 1) {
          $('.save').text('SAP领料');
          $('.save').show();
          $("#pickingQty").hide();
          $("#orqty").hide();
          $("#rqty").show();
          check_stor_type = 2;
          $('.buquan').show();
          getOldPickingInfo();

        } else if (push_type == 0) {
          $('.save').hide();
          $("#pickingQty").hide();
          $("#orqty").hide();
          $("#rqty").show();
          check_stor_type = 2;
          getMaterialStorage(line_depot_id);
          $('.buquan').hide();
        } else if (push_type == 2) {
          $('.save').text('车间领料');
          $("#pickingQty").hide();
          $('.save').show();
          $("#orqty").show();
          $("#rqty").hide();
          $('.buquan').hide();
          check_stor_type = 3;
          getShopPackingInfo();
          // getMaterialStorage(line_depot_id);
        }
      }
    }
  });

  $('body').on('click', '.table-bordered .delete', function () {
    var that = $(this);
    layer.confirm('您将执行删除操作！?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      that.parents().parents().eq(0).remove();
    });
  });
  $('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
  });
  $('body').on('click', '.select', function (e) {
    e.stopPropagation();
    showCause($(this).attr('data-id'))
  });
  $('body').on('click', '#viewCause .cause_submit', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
    var material_id = $("#itemId").val();
    var _ele = $("#material" + material_id);
    _ele.html('');
    $('#practice_table .table_tbody tr').each(function (item) {
      if ($(this).find('.el-checkbox_input_check').hasClass('is-checked')) {
        let itemc = $(this).data('trData');
        _ele.append(`<div class="cause_item" style="height: 20px;">
                                <div style="display: inline-block;">${itemc.preselection_name}-${itemc.preselection_code}</div>
                            </div>`);
        _ele.find('.cause_item:last-child').data("spanData", itemc);
      }
    })
  });
  $('body').on('click','#viewCause .cancle',function(e){
    e.stopPropagation();
    layer.close(layerModal);
  })
}

function showCause(id) {
  var _ele = $("#material" + id), arr_couse = [];

  _ele.find('.cause_item').each(function (item) {
    arr_couse.push($(this).data('spanData').preselection_id)
  });
  layerModal = layer.open({
    type: 1,
    title: '选择原因',
    offset: '100px',
    area: ['500px', '500px'],
    shade: 0.1,
    shadeClose: false,
    resize: true,
    content: `<form class="viewAttr formModal" id="viewCause" >
                    <input type="hidden" id="itemId" value="${id}">
                    <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table id="practice_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">名称</th>
                                    <th class="left nowrap tight">备注</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody"></tbody>
                            </table>
                        </div>
                        <div id="pagenationItem" class="pagenation bottom-page"></div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary cause_submit">确定</button>
                        </div>
                    </div>
                </form>`,
    success: function (layero, index) {
      getSpecialCauseData(arr_couse)
    }
  })
}
function bindPagenationClickItem(totalData, pageSize, arr_couse) {
  $('#pagenationItem').show();
  $('#pagenationItem').pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageNoItem,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageNoItem = api.getCurrent();
      getSpecialCauseData(arr_couse);
    }
  });
}
function getSpecialCauseData(arr_cause) {
  $('#practice_table .table_tbody').html('');
  var urlLeft = '';

  urlLeft += "&page_no=" + pageNoItem + "&page_size=" + pageSizeItem;
  AjaxClient.get({
    url: URLS['specialCause'].pageIndex + '?' + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {

		/****************************    mao      *************************** */
		  let shopId = window.sessionStorage.getItem('workshopId');
		  AjaxClient.get({
			  url: '/Preselection/getWorkshopPreselection' + "?" + _token + "&workshop_id=" + shopId,
			  dataType: 'json',
			  success: function (rsp) {
				console.log(rsp,1);
				let data  =  rsp.results;
				window.sessionStorage.setItem('case', JSON.stringify(data));
				createHtmlItem($('#practice_table .table_tbody'), rsp.results,arr_cause)
			  },
			  fail: function (rsp) {
				
			  }
		  }, this)

        
      } else {
        noData('暂无数据', 3)
      }
      if (totalData > pageSizeItem) {
        bindPagenationClickItem(totalData, pageSizeItem);
      } else {
        $('#pagenationItem').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取列表失败，请刷新重试', 4);
    }
  })
}
function createHtmlItem(ele, data, arr_couse) {
  data.forEach(function (item, index) {
    if (arr_couse.length > 0) {
      var index_arr = 0;
      arr_couse.forEach(function (itemc, index) {
        if (item.preselection_id == itemc) {
          var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
          index_arr = index + 1;
          ele.append(tr);
          ele.find('tr:last-child').data("trData", item);
        }
      });
      if (index_arr == 0) {
        var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
      }

    } else {
      var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", item);
    }

  })
}
function getOldPickingInfo() {

  AjaxClient.get({
    url: URLS['specialCause'].getSapPackingInfo + "?" + _token + "&work_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      is_first = rsp.results.is_first;
      is_unfinished = rsp.results.is_unfinished;
      if (rsp.results.is_first == 0) {
        //不是第一次SAP领料
        if (rsp.results.is_unfinished == 0) {
          in_material_arr.forEach(function (item) {
            item.oldPickQty = rsp.results.materials[item.material_id]
          });
          $("#pickingQty").show();
          getMaterialStorage(line_depot_id);
          // showInItem(sales_order_code,sales_order_project_code,in_material_arr,wo_number);
        } else {
          layer.confirm("有SAP领料单未完成！", {
            icon: 3,
            btn: ['确定'],
            closeBtn: 0,
            title: false,
            offset: '250px'
          }, function (index) {
            layer.close(index);
            showInItem(sales_order_code, sales_order_project_code, [], wo_number);
          });
        }

      } else {
        //第一次SAP领料
        getMaterialStorage(line_depot_id);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}






function getShopPackingInfo(){
  AjaxClient.get({
    url: URLS['order'].getShopPackingInfo + "?" + _token + "&work_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      is_first = rsp.results.is_first;
      is_unfinished = rsp.results.is_unfinished;
      if (rsp.results.is_first == 0) {
        //不是第一次车间领料
        if (rsp.results.is_unfinished == 0) {
          in_material_arr.forEach(function (item) {
            item.oldPickQty = rsp.results.materials[item.material_id]
          });
          $("#pickingQty").show();
          getMaterialStorage(line_depot_id);
          // showInItem(sales_order_code,sales_order_project_code,in_material_arr,wo_number);
        } else {
          layer.confirm("有车间领料单未完成！", {
            icon: 3,
            btn: ['确定'],
            closeBtn: 0,
            title: false,
            offset: '250px'
          }, function (index) {
            layer.close(index);
            // showInItem(sales_order_code, sales_order_project_code, [], wo_number);
          });
        }

      } else {
        //第一次车间领料
        getMaterialStorage(line_depot_id);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
	//   layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
	  layer.alert(rsp.message);
    }
  }, this)
}

function getDepot() {
  AjaxClient.get({
    url: URLS['work'].getMaterialDepot + "?" + _token + "&factory_id=" + factory_id + "&materials=" + no_depot_material_ids,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results) {
        $('.table-bordered .t-body .material_item').each(function (k, v) {
          var material_id = $(v).attr('data-material');
          if (rsp.results[material_id]) {
            $(v).find('.LGFSB').html('');
            $(v).find('.LGPRO').html('');
            $(v).find('.LGFSB').html(`<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${rsp.results[material_id].LGFSB}"  placeholder="" class="LGFSB_input" value="" style="line-height:40px;width: 100px;">`);
            $(v).find('.LGPRO').html(`<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  value="${rsp.results[material_id].LGPRO}" placeholder="" class="LGPRO_input" value="" style="line-height:40px;width: 100px;">`);
          }
        });
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}
function Subtr(arg1, arg2) {
  var r1, r2, m, n;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
function submitPickingList() {


  if (type == 2) { //退料
    var flag = true;
    var material_arr = [];
    var $employee = $('#employee');
    var employee = ''
	  
	  // mao  测试
	  var ul = $('.el-select-dropdown-list li').length;
	  if (ul == 0) {
		  employee = $employee.attr('data-id');
	  } else {
		  employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
			  $employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
	  }

    $('.table-bordered .t-body .material_item').each(function (k, v) {
      var this_batchs = [];
      $(v).find('.bacth_show').each(function (key, value) {
        if ($(value).find('.return_qty').val() > 0) {
          if (($(value).attr('data-storage_number') * 10000) >= ($(value).find('.return_qty').val() * 10000)) {
            this_batchs.push({
              storage_number: $(value).attr('data-storage_number'),
              batch: $(value).attr('data-batch'),
              inve_id: $(value).attr('data-inve'),
              unit_id: $(value).attr('data-unit_id'),
              unit: $(value).attr('data-bom_commercial'),
			  return_number: $(value).find('.return_qty').val(),
			  reason: $('#text').val(),
            })


          } else {
            LayerConfig('fail', $(v).find('.item_no').text() + "编号的物料退料过多！");
            flag = false;
            return false;
          }
        }

      });
      material_arr.push({
        material_id: $(v).attr('data-material_id') ? $(v).attr('data-material_id') : '',
        material_name: $(v).attr('data-material_name') ? $(v).attr('data-material_name') : '',
        material_code: $(v).attr('data-material_code') ? $(v).attr('data-material_code') : '',
        send_depot: $(v).attr('data-send_depot') ? $(v).attr('data-send_depot') : '',
        batches: this_batchs
      });

    });
    if (employee == '') {
      LayerConfig('fail', '请补充责任人！');
    } else {
      var data = {
        employee_id: employee,
        line_depot_id: returnMaterialData.line_depot_id,
        line_depot_code: returnMaterialData.line_depot_code,
        line_depot_name: returnMaterialData.line_depot_name,
        work_order_id: returnMaterialData.work_order_id,
        work_order_code: returnMaterialData.work_order_code,
        product_order_code: returnMaterialData.product_order_code,
        product_order_id: returnMaterialData.product_order_id,
        sale_order_code: returnMaterialData.sale_order_code,
        sale_order_project_code: returnMaterialData.sale_order_project_code,
        factory_id: returnMaterialData.factory_id,
        factory_name: returnMaterialData.factory_name,
        push_type: push_type,
        items: material_arr,
        _token: TOKEN
      };
      AjaxClient.post({
        url: URLS['order'].storeReturnMaterial,
        data: data,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          layer.confirm('退料单创建成功！', {
            icon: 1, title: '提示', offset: '250px', end: function () {
            }
          }, function (index) {
            layer.close(index);
            window.history.back();
          });

        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message)
        } 
      }, this)
    }



  } else if (type == 1) { //领料
	var $storage_wo = $('#storage_wo');
    var storage_wo = $storage_wo.data('inputItem') == undefined || $storage_wo.data('inputItem') == '' ? '' :
      $storage_wo.data('inputItem').name == $storage_wo.val().replace(/\（.*?）/g, "").trim() ? $storage_wo.data('inputItem').id : ''; var $storage_wo = $('#storage_wo');

    var $employee = $('#employee');
    var employee = '';
    var material_arr = [];
    var flag = true, message = '';
	var date = $('#chooseTime').val();
// mao  测试
	var ul = $('.el-select-dropdown-list li').length;
	if(ul == 0) {
		employee = $employee.attr('data-id');
	} else {
		employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
			$employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
	}
    if (push_type == 1) {
      //sap
      $('.table-bordered .t-body .material_item').each(function (k, v) {
        var lgsb = $(v).find('.LGFSB_input').val();
        var lgpo = $(v).find('.LGPRO_input').val();
        var material_qty = Number($(v).find('.material_qty').text());
        var oldPick_qty = Number($(v).find('.oldPickQty').text());
        var num_qty = Subtr(material_qty, oldPick_qty);
        if (num_qty * 1000 >= Number($(v).find('.qty_num').val()) * 1000) {
          material_arr.push({
            material_id: $(v).attr('data-material') ? $(v).attr('data-material') : '',
            rated_qty: $(v).find('.material_qty').text() ? $(v).find('.material_qty').text() : '',
            demand_qty: $(v).find('.qty_num').val() ? $(v).find('.qty_num').val() : '',
            unit_id: $(v).attr('data-bom_unit') ? $(v).attr('data-bom_unit') : '',
            send_depot: lgsb,
            produce_depot: lgpo,
            special_stock: $(v).attr('data-special_stock') ? $(v).attr('data-special_stock') : '',
            batches: ''
          })
        } else {
          message = $(v).find('.item_no').text() + "的物料超领,超出的料，请去补料！"
          flag = false;
          return false;
        }


      });
      if (storage_wo == '') {
        LayerConfig('fail', '请补充需求库存地点!');
      }
      else if (!date) {
        layer.confirm('请补全配送时间！', {
          icon: 3, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
        });
      }
      else if (employee == '') {
        LayerConfig('fail', '请补充责任人！');
      }
      else if (!flag) {
        LayerConfig('fail', message);
      }
      else if (material_arr.length == 0) {
        LayerConfig('fail', '请不要生成空料单！');
      }
      else {
        if (flag) {
          if (material_arr.length == 0) {
            LayerConfig('fail', '物料信息不全！');
          } else {
            var data = {
              employee_id: employee,
              factory_id: pickingList.factory_id,
              date: (new Date(date).getTime()) / 1000,
              line_depot_id: storage_wo,
              workbench_id: pickingList.work_shift_id,
              materials: JSON.stringify(material_arr),
              work_order_id: pickingList.work_order_id,
              wo_number: tansferNull($('#wo_number').val()),
              wt_number: tansferNull($('#wt_number').val()),
              sales_order_code: tansferNull($('#sales_order_code').val()),
              push_type: push_type,
              sales_order_project_code: tansferNull($('#sales_order_project_code').val()),
              type: type,
              _token: TOKEN
            };
            AjaxClient.post({
              url: URLS['work'].store,
              data: data,
              dataType: 'json',
              beforeSend: function () {
                layerLoading = LayerConfig('load');
              },
              success: function (rsp) {
                layer.close(layerLoading);
                layer.confirm('领料单创建成功！是否继续领料？', {
                  icon: 1, title: '提示', offset: '250px', end: function () {
                    window.history.back();
                  }
                }, function (index) {
                  layer.close(index);
                  window.location.reload()
                });

              },
              fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail', rsp.message)
              }
            }, this)
          }
        }
      }

    }
    else if (push_type == 2) {
      //车间
      $('.table-bordered .t-body .material_item').each(function (k, v) {
        var num = 0;
        var this_batchs = []
        $(v).find('.bacth_show').each(function (key, value) {
          if (Number($(value).find('.storage_number').text()) * 1000 >= Number($(value).find('.actual_receive_qty').val()) * 1000) {

            if ($(value).find('.actual_receive_qty').val() != '') {
              num += Number($(value).find('.actual_receive_qty').val());
              this_batchs.push({
                inve_id: $(value).attr('data-inve'),
                batch_qty: $(value).find('.actual_receive_qty').val(),
                depot_code: $(value).find('.depot_code').text(),
                depot_id: $(value).find('.depot_code').attr('data-id'),
                batch: $(value).find('.item_batch').text(),
                unit_name: $(value).find('.unit_name').text(),
                unit_id: $(value).find('.unit_name').attr('data-id'),
              })
            }

          } else {
            message = $(v).find('.item_no').text() + "的物料的" + $(value).find('.item_batch').text() + "批次的数量不足！"
            flag = false;
            return false;
          }
        });
        if (flag) {
          if (num.toFixed(1) * 1000 > (Number($(v).find('.material_qty').text()) - Number($(v).find('.oldPickQty').text())).toFixed(1) * 1000) {
            message = $(v).find('.item_no').text() + "的物料超领！"
            flag = false;
            return false;
          } else {
            if (this_batchs.length > 0) {
              material_arr.push({
                material_id: $(v).attr('data-material') ? $(v).attr('data-material') : '',
                demand_qty: $(v).find('.material_qty').text() ? $(v).find('.material_qty').text() : '',
                unit_id: $(v).attr('data-bom_unit') ? $(v).attr('data-bom_unit') : '',
                send_depot: $(v).find('.LGFSB').text(),
                produce_depot: $(v).find('.LGPRO').text(),
                special_stock: $(v).attr('data-special_stock') ? $(v).attr('data-special_stock') : '',
                batches: this_batchs
              });
            } else {
              message = $(v).find('.item_no').text() + "的物料未领！"
              flag = false;
              return false;
            }
          }

        } else {
          flag = false;
          return false;
        }


      });

      if (storage_wo == '') {
        LayerConfig('fail', '请补充需求库存地点!');
      }
      else if (!date) {
        layer.confirm('请补全配送时间！', {
          icon: 3, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
        });
      }
      else if (employee == '') {
        LayerConfig('fail', '请补充责任人！');
      }
      else if (!flag) {
        LayerConfig('fail', message);
      }
      else if (material_arr.length == 0) {
        LayerConfig('fail', '请不要生成空料单！');
      }
      else {
        if (flag) {
          if (material_arr.length == 0) {
            LayerConfig('fail', '物料信息不全！');
          } else {
            var data = {
              employee_id: employee,
              factory_id: pickingList.factory_id,
              line_depot_id: storage_wo,
              date: (new Date(date).getTime()) / 1000,
              workbench_id: pickingList.work_shift_id,
              materials: material_arr,
              work_order_id: pickingList.work_order_id,
              wo_number: tansferNull($('#wo_number').val()),
              wt_number: tansferNull($('#wt_number').val()),
              sales_order_code: tansferNull($('#sales_order_code').val()),
              push_type: push_type,
              sales_order_project_code: tansferNull($('#sales_order_project_code').val()),
              type: type,
              _token: TOKEN
            };
            AjaxClient.post({
              url: URLS['order'].storeWorkShop,
              data: data,
              dataType: 'json',
              beforeSend: function () {
                layerLoading = LayerConfig('load');
              },
              success: function (rsp) {
                layer.close(layerLoading);
                layer.confirm('领料单创建成功！是否继续领料？', {
                  icon: 1, title: '提示', offset: '250px', end: function () {
                    window.history.back();
                  }
                }, function (index) {
                  layer.close(index);
                  window.location.reload()
                });

              },
              fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail', rsp.message)
              }
            }, this)
          }
        }
      }
    }

  } else if (type == 7) {
    var $storage_wo = $('#storage_wo');
    var storage_wo = $storage_wo.data('inputItem') == undefined || $storage_wo.data('inputItem') == '' ? '' :
      $storage_wo.data('inputItem').name == $storage_wo.val().replace(/\（.*?）/g, "").trim() ? $storage_wo.data('inputItem').id : ''; var $storage_wo = $('#storage_wo');

    var $employee = $('#employee');
    var employee = '';
    var material_arr = [];
    var date = $('#chooseTime').val();
	var flag = true, message = '';
	

	  // mao  测试
	  var ul = $('.el-select-dropdown-list li').length;
	  if (ul == 0) {
		  employee = $employee.attr('data-id');
	  } else {
		  employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
			  $employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
	  }

    $('.table-bordered .t-body .material_item').each(function (k, v) {
      var lgsb = $(v).find('.LGFSB').text() ? $(v).find('.LGFSB').text() : $(v).find('.LGFSB_input').val();
      var lgpo = $(v).find('.LGPRO').text() ? $(v).find('.LGPRO').text() : $(v).find('.LGPRO_input').val();
      var _ele = $("#material" + $(v).attr('data-material')), arr_cause = [];
      _ele.find('.cause_item').each(function (item) {
        arr_cause.push($(this).data('spanData').preselection_id);
      });
      if ($(v).find('.item_no').text().substr(0, 4) == '3002') {
        material_arr.push({
          material_id: $(v).attr('data-material') ? $(v).attr('data-material') : '',
          rated_qty: $(v).find('.material_qty').text() ? $(v).find('.material_qty').text() : '',
          demand_qty: $(v).find('.qty_num_length').val() ? $(v).find('.qty_num_length').val() : '',
          length_unit: 'M',
          unit_id: $(v).attr('data-bom_unit') ? $(v).attr('data-bom_unit') : '',
          send_depot: lgsb,
          produce_depot: lgpo,
          reason: arr_cause.join(),
          remark: $(v).find('.remark').val() ? $(v).find('.remark').val() : '',
          special_stock: $(v).attr('data-special_stock') ? $(v).attr('data-special_stock') : '',
          batches: ''
        })
      } else {
        material_arr.push({
          material_id: $(v).attr('data-material') ? $(v).attr('data-material') : '',
          rated_qty: $(v).find('.material_qty').text() ? $(v).find('.material_qty').text() : '',
          demand_qty: $(v).find('.qty_num').val() ? $(v).find('.qty_num').val() : '',
          length_unit: '',
          unit_id: $(v).attr('data-bom_unit') ? $(v).attr('data-bom_unit') : '',
          send_depot: lgsb,
          produce_depot: lgpo,
          reason: arr_cause.join(),
          remark: $(v).find('.remark').val() ? $(v).find('.remark').val() : '',
          special_stock: $(v).attr('data-special_stock') ? $(v).attr('data-special_stock') : '',
          batches: ''
        })
      }


    });
    if (storage_wo == '') {
      LayerConfig('fail', '请补充需求库存地点!');
    }
    else if (!date) {
      layer.confirm('请补全配送时间！', {
        icon: 3, title: '提示', offset: '250px', end: function () {
        }
      }, function (index) {
        layer.close(index);
      });
    }
    else if (!flag) {
      LayerConfig('fail', message);
    }
    else if (material_arr.length == 0) {
      LayerConfig('fail', '请不要生成空料单！');
    }
    else {
      if (flag) {
        if (material_arr.length == 0) {
          LayerConfig('fail', '物料信息不全！');
        } else {
          var data = {
            employee_id: employee,
            factory_id: pickingList.factory_id,
            line_depot_id: storage_wo,
            workbench_id: pickingList.work_shift_id,
            materials: JSON.stringify(material_arr),
            date: (new Date(date).getTime()) / 1000,
            work_order_id: pickingList.work_order_id,
            wo_number: tansferNull($('#wo_number').val()),
            wt_number: tansferNull($('#wt_number').val()),
            sales_order_code: tansferNull($('#sales_order_code').val()),
            push_type: push_type,
            sales_order_project_code: tansferNull($('#sales_order_project_code').val()),
            type: type,
            _token: TOKEN
          };
          AjaxClient.post({
            url: URLS['work'].store,
            data: data,
            dataType: 'json',
            beforeSend: function () {
              layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
              layer.close(layerLoading);
              layer.confirm('补料单创建成功！', {
                icon: 1, title: '提示', offset: '250px', end: function () {
                }
              }, function (index) {
                layer.close(index);
                window.history.back();
              });
            },
            fail: function (rsp) {
              layer.close(layerLoading);
              LayerConfig('fail', rsp.message)
            },
          }, this);
        }
      }
    }

  }
}

function withinErrorMargin(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}
//进料
function showInItem(code, line, data, wo_number, change) {

	var  flagArr = [];

  if (type == 1) { 
    if (push_type == 1) {//向sap领料
      var ele = $('.storage_blockquote .item_table .t-body');
      $('#show_qty').show();
      $('#operation').show();
	  ele.html("");
	  
	//  console.log(data);
		//   获取 flagArr 		//   添加标识   需要测试
		data.forEach(function (item, index) {
			var tempt = item.material_attributes;
			var stor_num = 0, storge_num = 0, comment_storage = 0;
			if (batch.materials[item.material_id]) {
				batch.materials[item.material_id].forEach(function (batch_num) {
					if (change == 'true') {
						stor_num += Number(batch_num.storage_number);
					} else {
						if (batch_num.is_comment == 0) {
							stor_num += Number(batch_num.storage_number);
						}
					}
					storge_num += Number(batch_num.storage_number);
				});
			}
			if ((batch.lzps[item.material_id]).is_lzp == 1) {
				if (!(item.item_no.substr(0, 2) == "32" || item.item_no.substr(0, 4) == "6201" || item.item_no.substr(0, 4) == "6101" || item.item_no.substr(0, 2) == "35")) {
					return;
				}
			}
			if (is_first == 1) {
				stor_num = stor_num;
			} else {
				if (is_unfinished == 0) {
					if (item.oldPickQty) {
						stor_num = Number(item.oldPickQty);
					}
				}
			}
			if (Number(item.qty) > stor_num) {
				if (item.item_no != "99999999") {

					flagArr.push({
						salesOrder: code,
						salesOrderItem: line,
						material: item.material_id
					});
				}
			}
		})

		AjaxClient.get({
			url: '/MaterialRequisition/checkMaterial' + "?" + _token + '&data=' + JSON.stringify(flagArr),
			dataType: 'json',
			success: function (res) {
					 
				list(res.results, data);
			}
		}, this)


	function list (rest,data) {
			data.forEach(function (item, index) {
					var tempt = item.material_attributes;
					var stor_num = 0, storge_num = 0, comment_storage = 0;
					if (batch.materials[item.material_id]) {
					batch.materials[item.material_id].forEach(function (batch_num) {
						if (change == 'true') {
						stor_num += Number(batch_num.storage_number);
						} else {
						if (batch_num.is_comment == 0) {
							stor_num += Number(batch_num.storage_number);
						}
						}
						storge_num += Number(batch_num.storage_number);
					});
					}
					if ((batch.lzps[item.material_id]).is_lzp == 1) {
					if (!(item.item_no.substr(0, 2) == "32" || item.item_no.substr(0, 4) == "6201" || item.item_no.substr(0, 4) == "6101" || item.item_no.substr(0, 2) == "35")) {
						return;
					}
					}
					if (is_first == 1) {
					stor_num = stor_num;
					} else {
					if (is_unfinished == 0) {
						if (item.oldPickQty) {
						stor_num = Number(item.oldPickQty);
						}
					}
					}
					if (Number(item.qty) > stor_num) {
					var num = (Number(item.qty) - stor_num).toFixed(3);
					var inattrs = '';
					tempt.forEach(function (item) {
						inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
          });
          
          console.log(item.SCHGT);

					if (item.item_no != "99999999"&&item.SCHGT != "X") { //正常物料
						let ts;
						for(let i=0; i<rest.length; i++) {
							if (rest[i].material == item.material_id) {
								ts = rest[i].flag;
							}
						}

						var tr = `
									<tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
									<td>${ts == 0 ? '' : `<img style="width:60px;height:50px;" src="../statics/custom/img/xz.png">`}</td>
									<td>
										${item.special_stock == 'E' ? `<div>
											<p>销售订单号：${code}</p>
											<p>行项目号：${line}</p>
										</div>`: ''}
									</td>
									<td class="LGFSB" ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.LGFSB}"  placeholder="" class="LGFSB_input" value="" style="line-height:40px;width: 100px;"></td>
									<td class="LGPRO" ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.LGPRO}"  placeholder="" class="LGPRO_input" value="" style="line-height:40px;width: 100px;"></td>
									<td class="item_no" >${tansferNull(item.item_no)}</td>
									<td >${tansferNull(item.name)}</td>
									<td class="material_qty">${tansferNull(item.qty)}</td>
									${is_first != 1 ? `<td class="oldPickQty">${tansferNull(item.oldPickQty)}</td>` : ''}
									<td class="storage_number" >${storge_num}</td>
									<td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="qty_num deal" value="${tansferNull(num)}" style="line-height:40px;width: 100px;"></td>
									<td >${tansferNull(item.bom_commercial)}</td>
									<td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
									<td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
									</tr>`;
						ele.append(tr);
						ele.find('tr:last-child').data("trData", data);
					}

					}
				})
	}
      
    }
    else if (push_type == 2) { //向车间领料
      var ele = $('.storage_blockquote .item_table .t-body');
      $('#show_qty').hide();
      $('#operation').show();
      $('#pickingQty').show();
      ele.html("");
      data.forEach(function (item, index) {
        var tempt = item.material_attributes;
        var batchHtml = '';
        var already_picking = 0;
        if (batch.materialarr.length > 0) {
          batch.materialarr.forEach(function (baitem) {
            if (baitem.material_id == item.material_id) {
              already_picking += Number(baitem.sum);
            }
          })
        }
        batchHtml = createPiciHtml(batch.materials[item.material_id], item.qty, '', already_picking);

        if ((batch.lzps[item.material_id]).is_lzp == 0) {
          return;
        }

        var inattrs = '';
        tempt.forEach(function (item) {
          inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        })
        var tr = item.qty==already_picking?'':`
                        <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                        <td></td>
                        <td>
                            ${item.special_stock == 'E' ? `<div>
                                <p>销售订单号：${code}</p>
                                <p>行项目号：${line}</p>
                            </div>`: ''}
                        </td>
                        <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                        <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                        <td class="item_no" >${tansferNull(item.item_no)}</td>
                        <td >${tansferNull(item.name)}</td>
                        <td class="material_qty">${tansferNull(item.qty)}</td>
                        <td class="oldPickQty">${tansferNull(already_picking)}</td>\`
                        <td class="storage_number" >${batchHtml}</td>
                        <td >${tansferNull(item.bom_commercial)}</td>
                        <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                        <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
                        </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);

      })
    }
    else {  //向mes领料
      var ele = $('.storage_blockquote .item_table .t-body');
      $('#show_qty').hide();
      $('#operation').hide();
      ele.html("");
      var height = 0;
      data.forEach(function (item, index) {
        var manumber = item.qty;
        var tempt = item.material_attributes;
        var batchHtml = '', is_ready = true;
        if (batch) {

          if (batch.materials[item.material_id]) {
            var num = 0;
            batch.materials[item.material_id].forEach(function (nitem) {
              num += Number(nitem.storage_number);
            })
            if (num < manumber) {
              is_ready = false;
            }
          } else {
            is_ready = false;
          }
        } else {
          is_ready = false;
        }
        if (batch) {
          batchHtml = createPiciHtml(batch.materials[item.material_id], item.qty, is_ready);
        }
        var inattrs = '';
        tempt.forEach(function (item) {
          inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        })
        var tr = `
                <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}"   data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                <td>${!is_ready ? `<i style="color: red;" class="fa fa-exclamation-circle fa-3x"></i>` : ''}</td>
                <td>
                    ${item.special_stock == 'E' ? `<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>`: ''}
                </td>
                <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                <td class="item_no" >${tansferNull(item.item_no)}</td>    
                <td width="200px;">${tansferNull(item.name)}</td>
                <td class="material_qty">${tansferNull(item.qty)}</td>
                <td class="storage_number">${batchHtml}</td>
                <td >${tansferNull(item.bom_commercial)}</td>
	            <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                </tr>`;
        ele.append(tr);
        if (!is_ready) {
          if (height == 0) {
            height = ele.find('tr:last-child').offset().top
          }
        }
        ele.find('tr:last-child').data("trData", data);

      });
      $("html,body").animate({ scrollTop: height + "px" }, 500);
    }
  }













  if (type == 7) {
    var ele = $('.storage_blockquote .item_table .t-body');
    $('#show_qty').show();
    $('#operation').show();
    $('#cause').show();
    $('#causeRemark').show();
    $('.pao').show()
    ele.html("");
    data.forEach(function (item, index) {
      var tempt = item.material_attributes;
      var stor_num = 0;
      if (batch.materials[item.material_id]) {
        batch.materials[item.material_id].forEach(function (batch_num) {
          stor_num += Number(batch_num.storage_number);
        });
      }
      if ((batch.lzps[item.material_id]).is_lzp == 1) {
        if (!(item.item_no.substr(0, 2) == "32" || item.item_no.substr(0, 4) == "6201"||item.item_no.substr(0, 4) == "6101" || item.item_no.substr(0, 2) == "35")) {
          return false;
        }
      }

      var num = item.qty - stor_num;
      var inattrs = '';
      tempt.forEach(function (item) {
        inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
      });
      if (item.item_no.substr(0, 4) == "3002") {
        var tr = `
                    <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                    <td></td>
                    <td>
                        ${item.special_stock == 'E' ? `<div>
                            <p>销售订单号：${code}</p>
                            <p>行项目号：${line}</p>
                        </div>`: ''} 
                    </td>
                    <td class="LGFSB" >${item.LGFSB ? item.LGFSB : `<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="LGFSB_input" value="" style="line-height:40px;width: 100px;">`}</td>
                    <td class="LGPRO" >${item.LGPRO ? item.LGPRO : `<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="LGPRO_input" value="" style="line-height:40px;width: 100px;">`}</td>
                    <td class="item_no" >${tansferNull(item.item_no)}</td>
                    <td >${tansferNull(item.name)}</td>
                    <td class="material_qty">${tansferNull(item.qty)}</td>
                    <td class="storage_number" >${stor_num}</td>
                    <td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" readonly class="qty_num deal" value="" style="line-height:40px;width: 100px;"></td>
                    <td >${tansferNull(item.bom_commercial)}</td>
                    <td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="qty_num_length deal" value="" style="line-height:40px;width: 100px;"></td>
                    <td >M</td>
                    <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                    <td style="padding: 3px;">
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                        <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                    </td>
                    <td>
                        <textarea name="remark" class="remark" id="" cols="15" rows="5" style="line-height: 20px;"></textarea>
                    </td>
                    <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
      } else {
        var tr = `
                    <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                    <td></td>
                    <td>
                        ${item.special_stock == 'E' ? `<div>
                            <p>销售订单号：${code}</p>
                            <p>行项目号：${line}</p>
                        </div>`: ''}
                    </td>
                    <td class="LGFSB" >${item.LGFSB ? item.LGFSB : `<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="LGFSB_input" value="" style="line-height:40px;width: 100px;">`}</td>
                    <td class="LGPRO" >${item.LGPRO ? item.LGPRO : `<input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="LGPRO_input" value="" style="line-height:40px;width: 100px;">`}</td>
                    <td class="item_no" >${tansferNull(item.item_no)}</td>
                    <td >${tansferNull(item.name)}</td>
                    <td class="material_qty">${tansferNull(item.qty)}</td>
                    <td class="storage_number" >${stor_num}</td>
                    <td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="qty_num deal" value="" style="line-height:40px;width: 100px;"></td>
                    <td >${tansferNull(item.bom_commercial)}</td>
                    <td></td>
                    <td></td>
                    <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                    <td style="padding: 3px;">
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                        <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                    </td>
                    <td>
                        <textarea name="remark" class="remark" id="" cols="15" rows="5" style="line-height: 20px;"></textarea>
                    </td>
                    <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
      }


    })
  }
}

function createPiciHtml(data, qty, is_ready, already_picking) {
  if (type == 1 || type == 7) {
    var trs = '';
    if (data && data.length) {
      data.forEach(function (item, index) {
        trs += `
			<tr class="bacth_show" data-inve="${item.inve_id}">
			<td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.factory_code)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td class="depot_code" data-id="${item.depot_id}">${tansferNull(item.depot_code)}</td>
			<td>${tansferNull(item.depot_name)}</td>
			<td class="item_batch">${tansferNull(item.batch)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                 ${push_type != 0 ? `<input type="number" style="line-height: 40px;" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"   class="el-input actual_receive_qty"   value="${(data.length == 1) ? tansferNull((Number(qty) - Number(already_picking)).toFixed(3)) : ''}">` : ''}
            </td>
            <td class="unit_name" data-id="${item.unit_id}">${tansferNull(item.unit_name)}</td>
			</tr>
			`;
      })
    } else {
      trs = '<tr><td colspan="9" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单/行项号</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工厂名称</th>
                        <th class="left nowrap tight">仓库</th>
                        <th class="left nowrap tight">仓库名称</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                        <th class="left nowrap tight">单位</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
  } else {
    var trs = '';
    if (data && data.length) {
      data.forEach(function (item, index) {
        trs += `
			<tr class="bacth_show">
			<td class="item_batch">${tansferNull(item.batch)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                <input type="number" style="line-height: 40px;" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input actual_receive_qty"   value="${tansferNull(item.actual_receive_qty)}">
            </td>
			
			</tr>
			`;
      })
    } else {
      trs = '<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
  }


}

