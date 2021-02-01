var wo_number, work_order_id, in_flag = 1, out_flag = 1, out_material_flag = 1, id = 0, edit = '', production_order_id = 0, operation_order_id = 0, scrollTop = 0;
var line_depot_id, line_depot_code, depot_name, out_line_depot_id, out_line_depot_code, out_depot_name, moreOrder;
var new_in_material = [];
var new_in_material_arr = [];
var item_no = [];
var array_arr = [];
var rwdo_arrs = [];
var wo_arr_json = [], wo_arr = [];
var in_material_arr = [];
var out_material_arr = [];
var pageNo = 1,
  pageSize = 50,
  pageNoItem = 1,
  pageSizeItem = 50,
  depot_id,
  woLen = 0;
$(function () {
  id = getQueryString('ids');
  edit = getQueryString('type');
  if (edit != null) {
    getBusteWorkForm(id)
  } else {
    mergeBuste(id);
  }
  bindEvent();
});

//获取工位员工
function getEmployee(id, employee_id) {
  AjaxClient.get({
    url: URLS['work'].select + "?" + _token + "&workbench_id=" + id,
    dataType: 'json',
    success: function (rsp) {
      if (rsp.results && rsp.results.length) {
        BOMGroup = rsp.results;
        var lis = '', innerhtml = '';
        rsp.results.forEach(function (item) {
          lis += `<li data-id="${item.emplyee_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.emplyee_name}</li>`;
        });
        innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
        $('.el-form-item.employee').find('.el-select-dropdown-list').html(innerhtml);
      }
      if (employee_id) {
        $('.el-select-dropdown-item[data-id=' + employee_id + ']').click();
        $('.update').show();
      }
    },
    fail: function (rsp) {
      console.log('获取责任人数据失败');
    }
  }, this);
}

//合并报工的工单数据
function mergeBuste(data) {
  AjaxClient.get({
    url: URLS['buste'].show + "?ids=" + data + "&" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var data = rsp.results;
      moreOrder = data;
      var maBatches = [];
      woLen = data.length;
      data.forEach(function (item) {
        var work_order_code = item.wo_number;
        var sales_order_code = item.sales_order_code;
        var product_order_code = item.po_number;
        var line_depot_id = item.line_depot_id;
        var material_arr = [];
		  var in_material = item.in_list;
        var out_material = item.out_list;
        in_material.forEach(function (initem) {
          material_arr.push(initem.material_id);
        })
        var material_arr_str = material_arr.join(',');
        var maBatch = { "work_order_code": work_order_code, "sale_order_code": sales_order_code, "product_order_code": product_order_code, "material_ids": material_arr_str, "line_depot_id": line_depot_id }
        maBatches.push(maBatch);
        in_material_arr.push(in_material);
        out_material_arr.push(out_material);
        wo_arr_json.push({ "workOrder_number": work_order_code });
        wo_arr.push(work_order_code);
      });
      if (data.length > 0) {
        combineInAndOut();
      } else {
        LayerConfig('fail', '找不到该工单数据！');
      }
      $('.merge-buste').removeClass('is-disabled');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      $('.merge-buste').removeClass('is-disabled');
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}

//获取已报工数据
function getRWDoList(data, arr) {
  var urlLeft = '';
  urlLeft += '&work_number_list=' + data;
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['buste'].getDeclareOrder + "?" + _token + urlLeft,
    dataType: 'json',
    success: function (rsp) {
      rwdo_arrs = [];
      arr.forEach(function (item) {
        rwdo_arr = [];
        rsp.results.forEach(function (ritem) {
          if (ritem.workOrder_number == item) {
            ritem.out.forEach(function (oitem) {
              if (rwdo_arr.length > 0) {
                var flagf = true;
                rwdo_arr.forEach(function (a) {
                  if (a.name == oitem.item_no) {
                    flagf = false;
                    a.GMNGA = (Number(a.GMNGA) + Number(oitem.GMNGA)).toFixed(3)
                  }
                });
                if (flagf) {
                  rwdo_arr.push({
                    name: oitem.item_no,
                    GMNGA: oitem.GMNGA,
                    qty: oitem.qty
                  })
                }
              } else {
                rwdo_arr.push({
                  name: oitem.item_no,
                  GMNGA: oitem.GMNGA,
                  qty: oitem.qty
                })
              }
            })
          }
        })
        rwdo_arrs.push(rwdo_arr);
      })
      combineInAndOut();
    }
  })
}

//组合进出料数据
function combineInAndOut() {
  var wolen = woLen;
  var inAndOut_arr = [];
  for (var i = 0; i < woLen; i++) {
    var inAndOut = {
      'work_order_id': moreOrder[i].work_order_id,
      'po_number': moreOrder[i].po_number,
      'TXZ01': moreOrder[i].TXZ01,
      'EBELN': moreOrder[i].EBELN,
      'operation_order_code': moreOrder[i].operation_order_code,
      'production_order_id': moreOrder[i].production_order_id,
      'work_center_id':moreOrder[i].workcenter_id,
      'picking_id':moreOrder[i].picking_id,
      'picking_line_id':moreOrder[i].picking_line_id,
      'sub_id': moreOrder[i].sub_id,
      'wo_number': moreOrder[i].wo_number,
      'out_depot_name': moreOrder[i].out_depot_name,
      'routing_node_id': moreOrder[i].routing_node_id,
      'product_order_code': moreOrder[i].po_number,
      'factory_id': moreOrder[i].factory_id,
      'line_depot_id': moreOrder[i].line_depot_id,
      'in_material': in_material_arr[i],
      'out_material': out_material_arr[i],
      // 'array_arr': rwdo_arrs[i]
    };
    inAndOut_arr.push(inAndOut);
  }
  getWorkOrderList(inAndOut_arr);
}

//渲染整个合并报工页面
function getWorkOrderList(data) {
  var thtml = '';
  data.forEach(function (item) {
    var in_material = '', out_material = '';
    item['in_material'].forEach(function (nitem, index) {
      if (nitem.material_code != "99999999") {
        if (nitem.material_code.substring(0, 4) == '3002') {
			in_material += `<tr data-id="${nitem.material_id}" data-spec_stock="${nitem.special_stock ? nitem.special_stock : ''}" data-tr-mt='${JSON.stringify(nitem)}' data-LGFSB="${nitem.LGFSB}" data-LGPRO="${nitem.LGPRO}"  data-inve-id="${nitem.inve_id}" data-depot-id="${nitem.depot_id}">
                        <td width="100px;">${tansferNull(nitem.material_code)}</td>
                        <td width="300px;">${tansferNull(nitem.material_name)}</td>
                        <td class="qty" data-qty="${nitem.plan_qty}">${tansferNull(item.plan_qty)}</td>
                        <td class="expend">${tansferNull(nitem.expend)}</td>
                        <td class="unit" data-unit="${nitem.bom_unit_id}">${nitem.bom_commercial}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(nitem.plan_qty)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <!--<td class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>-->
                        <!--<td class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe_difference deal"></td>-->
                        <!--<td class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
                        <td style="padding: 3px;">
                            <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${nitem.material_id}" class="MKPF_BKTXT" ></div>
                            <button type="button" data-id="${nitem.material_id}" class="button pop-button select">选择</button>
                        </td>
                        <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3"></textarea></td>
                      </tr>`;
        } else {
			in_material += `<tr data-id="${nitem.material_id}" data-spec_stock="${nitem.special_stock ? nitem.special_stock : ''}" data-tr-mt='${JSON.stringify(nitem)}' data-LGFSB="${nitem.LGFSB}" data-LGPRO="${nitem.LGPRO}"  data-inve-id="${nitem.inve_id}" data-depot-id="${nitem.depot_id}">
                        <td width="100px;">${tansferNull(nitem.material_code)}</td>
                        <td width="300px;">${tansferNull(nitem.material_name)}</td>
                        <td class="qty ${tansferNull(nitem.material_code)}" data-qty="${nitem.plan_qty}">${nitem.plan_qty}</td>
                        <td class="expend">${tansferNull(nitem.expend)}</td>
                        <td class="unit"  data-unit="${nitem.bom_unit_id}">${tansferNull(nitem.bom_commercial ? nitem.bom_commercial : '')}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(nitem.plan_qty)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <td style="padding: 3px;">
                            <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${nitem.material_id}" class="MKPF_BKTXT" ></div>
                            <button type="button" data-id="${nitem.material_id}" class="button pop-button select">选择</button>
                        </td>
                        <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3"></textarea></td>
                    </tr>`;
        }
      }
    })
    item['out_material'].forEach(function (oitem, index) {
      // if (item['array_arr'].length > 0) {
      //   item['array_arr'].forEach(function (aitem) {
      //     if (oitem.material_code == aitem.name) {
      //       if (oitem.material_code.substring(0, 4) == '3002') {
      //         out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
      //                           <td width="100px;">${tansferNull(oitem.material_code)}</td>
      //                           <td width="150px;">${tansferNull(oitem.material_name)}</td>
      //                           <td class="qty">${tansferNull(oitem.plan_qty)}</td>
      //                           <td class="unit"  data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
      //                           <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(((oitem.plan_qty * 1000) - (aitem.GMNGA * 1000)) / 1000 < 0 ? 0 : ((oitem.plan_qty * 1000) - (aitem.GMNGA * 1000)) / 1000)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
      //                           <td class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>
      //                           <td class="firm" style="padding: 3px;">
      //                             <div class="el-select-dropdown-wrap">
      //                               <input type="text" class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${oitem.line_depot_id}" value="" style="line-height:20px;width: 100px;font-size: 10px;">
      //                             </div>
      //                           </td>
      //                         </tr>`;
      //         //ele.append(tr);
      //         //ele.find('tr:last-child').data("trData", oitem);
      //         //ele.find('tr:last-child .consume_num.deal').keyup();
      //       } else {
      //         out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
      //                           <td width="100px;">${tansferNull(oitem.material_code)}</td>
      //                           <td width="150px;">${tansferNull(oitem.material_name)}</td>
      //                           <td class="qty">${tansferNull(oitem.plan_qty)}</td>
      //                           <td class="unit" data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
      //                           <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(((oitem.plan_qty * 1000) - (aitem.GMNGA * 1000)) / 1000 < 0 ? 0 : ((oitem.plan_qty * 1000) - (aitem.GMNGA * 1000)) / 1000)}" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
      //                           <td class="firm" style="padding: 3px;">
      //                             <div class="el-select-dropdown-wrap">
      //                               <input type="text" class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${oitem.line_depot_id}" data-code="${oitem.line_depot_code}" value="" style="line-height:20px;width: 100px;font-size: 10px;">
      //                             </div>
      //                           </td>
      //                         </tr>`;
      //         //ele.append(tr);
      //         //ele.find('tr:last-child').data("trData", oitem);
      //         //ele.find('tr:last-child .consume_num.deal').keyup();
      //       }
      //     }
      //   })
      // } else {
        if (oitem.material_code.substring(0, 4) == '3002') {
          out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                      <td width="100px;">${tansferNull(oitem.material_code)}</td>
                      <td width="300px;">${tansferNull(oitem.material_name)}</td>
                      <td class="qty">${tansferNull(oitem.plan_qty)}</td>
                      <td class="unit"  data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                      <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(oitem.plan_qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                      <td class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                          <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-code="${oitem.depot_code}" data-id="${oitem.line_depot_id}" value="${oitem.depot_name}(${oitem.depot_code})" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                      </td>
                  </tr>`;
          //ele.append(tr);
          //ele.find('tr:last-child').data("trData", oitem);
        } else {
          out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                      <td width="100px;">${tansferNull(oitem.material_code)}</td>
                      <td width="150px;">${tansferNull(oitem.material_name)}</td>
                      <td class="qty">${tansferNull(oitem.plan_qty)}</td>
                      <!--<td class="ready_qty">0</td>-->
                      <td class="unit" data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                      <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(oitem.plan_qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                      <td class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                          <input type="text" class="el-input line_depot" data-code="${oitem.depot_code}" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${oitem.line_depot_id}" value="${oitem.depot_name}(${oitem.depot_code})" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                      </td>
                  </tr>`;
          //ele.append(tr);
          //ele.find('tr:last-child').data("trData", oitem);
        }
      // }
      out_flag++;
    })
    thtml += `<div class="work_order_wrap">
    <input type="hidden" class="production_order_id" value="${item['production_order_id']}"/>
    <input type="hidden" class="sub_id" value="${item['sub_id']}"/>
    <input type="hidden" class="routing_node_id" value="${item['routing_node_id']}"/>
    <input type="hidden" class="picking_id" value="${item['picking_id']}"/>
    <input type="hidden" class="picking_line_id" value="${item['picking_line_id']}"/>
    <input type="hidden" class="operation_order_code" value="${item['operation_order_code']}"/>
    <input type="hidden" class="work_center_id" value="${item['work_center_id']}"/>
    <input type="hidden" class="line_depot_id" value="${item['line_depot_id']}"/>
      <div class="work_order_left">
        <textarea  name="" class="work_order_form" cols="30" rows="8" readonly="readonly" style="margin-top: 10px; text-align: center; padding:20px;overflow: hidden;height:270px;">
          ${item.wo_number}
        </textarea>
      </div>
      <div class="work_order_btn"><span></span></div>
      <div class="work_order_right" >
        <div style="border: solid 1px #d1dbe5; padding: 5px;">
          <div class="el-form-item">
            <div style="display: inline-block;width: 600px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 300px;text-align: center;color:#000;">报工单执行时间</label>
                <span class="el-input span start_time"><span class="start_time_input"></span><input type="text" class="start_time" placeholder="开始时间" value=""></span>——
                <span class="el-input span end_time"><span class="end_time_input"></span><input type="text" class="end_time" placeholder="结束时间" value=""></span>
              </div>
            </div>
            <div class="el-form-item-div" style="display: inline-block;float: right;">
              <label class="el-form-item-label" style="width: 150px;text-align: center;color: black">最后一次报工</label>
              <span class="el-checkbox_input el-checkbox_input_check is_teco" style="margin-top: 8px;">
                <span class="el-checkbox-outset"></span>
              </span>
            </div>
            <div class="el-form-item-div" style="display: inline-block;float: right;">
              <label class="el-form-item-label" style="width: 150px;text-align: center;color: black">异常报工</label>
              <span class="el-checkbox_input el-checkbox_input_check differient" style="margin-top: 8px;">
                <span class="el-checkbox-outset"></span>
              </span>
            </div>
          </div>
          <div style="display: flex;">
            <div class="el-form-item employee" style="width: 345px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 169px;text-align: center;color:#000;">责任人</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id employee_id" value="">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                      <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 170px;text-align: center;color:#000;">过账时间</label>
            <input type="text" class="el-input BUDAT" placeholder="请选择过账时间" value="">
          </div>
        </div>
        <div class="show_workcenter" style="border: solid 1px #d1dbe5; padding: 5px;margin-top:15px;">
          <div class="op-infor" style="font-size:16px;display:flex;"><div style="flex:1;"><label>工序：</label><span class="operationName">${item.TXZ01}</span></div>&nbsp;&nbsp;<div style="flex:1;"><label>生产订单：</label><span>${item.po_number}</span></div><div style="flex:1;"><label>采购订单：</label><span>${item.EBELN}</span></div></div>
        </div>
        <div>
          <h3>消耗品</h3>
          <table class="show_in_material">
            <thead>
              <tr>
                <th class="center">物料编码</th>
                <th class="center">物料名称</th>
                <th class="center">数量</th>
                <th class="center">计划数量</th>
                <th class="center">单位</th>
                <th class="center">消耗数量</th>
                <th class="center">组件差异数量</th>
                <th class="center">差异原因</th>
                <th class="center">差异备注</th>
              </tr>
            </thead>
            <tbody class="table_tbody">
              ${in_material}
            </tbody>
          </table>
        </div>
        <div>
          <h3>产成品</h3>
            <div style="display: none;color: red;" class="showNumber"></div>
            <table class="show_out_material">
            <thead>
              <tr>
                <th class="center">物料编码</th>
                <th class="center">物料名称</th>
                <th class="center">数量</th>
                <th class="center">单位</th>
                <th class="center">实报数量</th>
                <th class="center">库存地</th>
              </tr>
            </thead>
            <tbody class="table_tbody">
              ${out_material}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>`;
  });
  $("#workOrder_from").html(thtml);
  $('#workOrder_from .work_order_wrap').each(function (k, v) {
    $(v).each(function (key, value) {
      $(value).find('tr:last-child .consume_num.deal').keyup();
    })
  })
  $(".BUDAT").val(getCurrentDateNow);
  $(".start_time").val(getCurrentDateZore);
  $(".end_time").val(getCurrentTime);
  data.forEach(function (item) {
    console.log(out_material_flag)
    console.log(item.out_depot_name)
    if (item.out_depot_name) {
      $('#line_depot' + out_material_flag).val(item.out_depot_name + '（' + item.out_line_depot_code + '）').data('inputItem', { id: out_line_depot_id, out_depot_name: depot_name, code: item.out_line_depot_code }).blur();
    }
    $('#line_depot' + out_material_flag).autocomplete({
      url: URLS['work'].storageSelete + "?" + _token + "&is_line_depot=1",
      param: 'depot_name',
      showCode: 'depot_name'
    });
    out_material_flag++;
  })
}

function checkHasOverDeclare(id) {
  AjaxClient.get({
    url: URLS['work'].checkHasOverDeclare + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results.isover == 0) {
        submint(id);
      }
      if (rsp.results.isover == 1) {
        layer.confirm('当前工单已超报，是否继续报工？', {
          icon: 3, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
          submint(id);
        });
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function submint(id) {
  AjaxClient.get({
    url: URLS['work'].submitBuste + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results.RETURNCODE == 0) {
        LayerConfig('success', '推送成功！');
        window.location.href = "/Buste/busteIndex";
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}
function updateEmployee(employee_id) {
  AjaxClient.get({
    url: URLS['work'].updateEmployee + "?" + _token + "&id=" + id + "&employee_id=" + employee_id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '修改成功！', function () {
        window.location.reload()
      })
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message, function () {
        window.location.reload()
      })
    }
  }, this)
}
function bindEvent() {
  $("body").on('keyup', '.consume_num', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).val() - Number($(this).parent().parent().find('.qty').attr('data-qty'));
      $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

  // $("body").on('blur', '.beath_qty', function (e) {
  //   e.stopPropagation();
  //   if (edit != 'edit') {
  //     var num = $(this).parent().parent().parent().find('.consume_num').val() - $(this).val()
  //     $(this).parent().parent().parent().find('.difference_num').val(num.toFixed(3));
  //   }
  // });

  $('body').on('click', '.update', function (e) {
    e.stopPropagation();
    var employee_id = $('#employee_id').val();
    updateEmployee(employee_id);
  })

  //下拉框点击事件
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
    var width = $(this).width();
    var offset = $(this).offset();
    $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33, left: offset.left });
  });

  //下拉框item点击事件
  $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
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

  $('body').on('click', '.submit_SAP', function (e) {
    e.stopPropagation();
    layer.confirm('您将执行推送操作！?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      checkHasOverDeclare(id);
    });
  });

  $('body').on('click', '.submit', function (e) {
    e.stopPropagation();
    var flag = true;
    var str = '';
    var count = 0;
    item_no.forEach(function (nitem) {
      $('#show_in_material .table_tbody tr').each(function (k, v) {
        var trDataMt = $(v).data('trDataMt');
        if (trDataMt.material_code == nitem) {
          count += Number($(v).find('.beath_qty').val());
        }
      });
      if (nitem != '99999999') {
        if (count.toFixed(3) * 1000 == 0) {
          str = nitem + '物料的定额总量等于0,是否强制报工！';
          flag = false;
          return false;
        }
      }
    });
    if (flag) {
      addBuste();
    } else {
      layer.confirm(str, {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        addBuste()
      });
    }
  });

  $(window).scroll(function () {
    scrollTop = $(document).scrollTop();
    $('.line_depot,.depot').each(function (k, v) {
      var that = $(v);
      var width = $(v).width();
      var offset = $(v).offset();
      $(v).siblings('.el-select-dropdown').width(width * 3).css({ top: offset.top + 33 - scrollTop, left: offset.left })
    })
  });

  $('body').on('click', '.line_depot,.depot', function (e) {
    e.stopPropagation();
    var that = $(this);
    var width = $(this).width();
    var offset = $(this).offset();
    $(this).siblings('.el-select-dropdown').width(width * 3).css({ top: offset.top + 33 - scrollTop, left: offset.left })
  });

  $('body').on('click', '.table_tbody .delete', function () {
    var that = $(this);
    layer.confirm('您将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      that.parents().parents().eq(0).remove();
    });
  });

  //产成品实报数量失去焦点事件
  $('body').on('keyup', '.show_out_material .consume_num.deal', function (e) {
    var len = $(this).parent().parent().parent().find("tr").length;
    var realNumber = Number($(this).val()).toFixed(3);
    var planNumber = Number($(this).parent().parent().find('.qty').text()).toFixed(3);
    if (len == 1) {
      $(this).parent().parent().parent().parent().parent().parent().find(".show_in_material .table_tbody tr").each(function () {
        var this_qty = Number($(this).find('.qty').text());
        var newQty = ((realNumber / planNumber) * this_qty).toFixed(3);
        $(this).find('.beath_qty.deal').val(newQty);
        $(this).find('.consume_num.deal').val(newQty);
        $(this).find('.difference_num.deal').val(newQty-this_qty);
      })
    }
  });

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var that = $(this);
      var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
      start_time = laydate.render({
        elem: '#start_time_input',
        max: max,
        format: 'yyyy-MM-dd HH:mm:ss',
        type: 'time',
        show: true,
        closeStop: '#start_time',
        done: function (value, date, endDate) {
          that.val(value);
        }
      });
    }
  });

  $('#end_time').on('click', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var that = $(this);
      var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
      end_time = laydate.render({
        elem: '#end_time_input',
        min: min,
        format: 'yyyy-MM-dd HH:mm:ss',
        max: getCurrentDate(),
        type: 'time',
        show: true,
        closeStop: '#end_time',
        done: function (value, date, endDate) {
          that.val(value);
        }
      });
    }
  });

  $('body').on('click', '.print', function (e) {
    e.stopPropagation();
    showPrintModal()
  });

  $('body').on('click', '.el-checkbox_input_check', function () {
    if (edit != 'edit') {
      $(this).toggleClass('is-checked');
    }
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
        _ele.append(`<span>
                      <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
                    </span>`);
        _ele.find('span:last-child').data("spanData", itemc);
      }
    })
  });
}

function showCause(id) {
  var _ele = $("#material" + id), arr_couse = [];

  _ele.find('span').each(function (item) {
    arr_couse.push($(this).data('spanData'))
  });
  layerModal = layer.open({
    type: 1,
    title: '选择原因',
    offset: '100px',
    area: ['500px', '500px'],
    shade: 0.1,
    shadeClose: false,
    resize: true,
    content: `<form class="viewAttr formModal" id="viewCause">
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
function bindPagenationClickItem(totalData, pageSize) {
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
      getSpecialCauseData();
    }
  });
}
function getSpecialCauseData(arr_couse) {
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
        createHtmlItem($('#practice_table .table_tbody'), rsp.results, arr_couse)
      } else {
        noData('暂无数据', 9)
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
        if (item.preselection_id == itemc.preselection_id) {
          var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
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
      // console.log(arr_couse.length-1);
      if (index_arr == 0) {
        var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
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
                    <td>${item.name}</td>
                    <td>${item.description}</td>
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
      getBusteList();
    }
  });
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function getCurrentDateZore() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 00:00:00';
}

function getCurrentDateNow() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day;
}

function getCurrentTime() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate(),
    _h = curDate.getHours(),
    _m = curDate.getMinutes(),
    _s = curDate.getSeconds();
  return _year + '-' + _month + '-' + _day + ' ' + _h + ':' + _m + ':' + _s;
}

function addBuste() {
  var employee_id = $('#employee_id').val();
  // if(!employee_id){
  //     LayerConfig('fail','请选择责任人！');
  // }else {
  var flag = true;
  var dataArr = [];
  $('#workOrder_from .work_order_wrap').each(function (k, v) {
    var in_materials = [], out_materials = [];
    var sub_id = $(v).find(".sub_id").val();
    var picking_id=$(v).find(".picking_id").val();
    var picking_line_id=$(v).find(".picking_line_id").val();
    var production_order_id = $(v).find(".production_order_id").val();
    var routing_node_id = $(v).find(".routing_node_id").val();
    var operation_order_code = $(v).find(".operation_order_code").val();
    var work_center_id = $(v).find(".work_center_id").val();
    $(v).find('.show_in_material .table_tbody tr').each(function (key, value) {
      var trDataMt = JSON.parse($(value).attr('data-tr-mt'));
      if (trDataMt.material_code !== "99999999") {
		var _ele = $(value).find('.MKPF_BKTXT'), arr_couse = [];
		var inve_id = $(value).attr('data-inve-id'), depot_id = $(value).attr('data-depot-id');
        _ele.find('span').each(function (item) {
          arr_couse.push($(this).data('spanData').preselection_id)
        });
        // if ($(value).find('.beath_qty').val() > 0 || $(value).find('.consume_num').val() > 0) {
          
            var str = arr_couse.join();
            in_materials.push({
			  id: '',
			  inve_id: inve_id,
			  depot_id: depot_id,
              material_id: $(value).attr('data-id'),
              LGFSB: $(value).attr('data-LGFSB'),
              LGPRO: $(value).attr('data-LGPRO'),
              GMNGA: $(value).find('.consume_num').val(),
              unit_id: $(value).find('.unit').attr('data-unit'),
              material_spec:'',
              expend: $(value).find('.expend').text(),
              qty: $(value).find('.qty').attr('data-qty'),
              line_depot_id:'',
			  line_depot_code:'',
			  conversion: $(value).attr('data-conversion') ? $(value).attr('data-conversion') : '',
              MKPF_BKTXT: str,
              diff_remark:$(value).find('.diff_remark').val(),
              // length_for_robe: $(value).find('.length_for_robe').val() ? $(value).find('.length_for_robe').val() : '',
              // unit_for_length: $(value).find('.unit_for_length').val() ? $(value).find('.unit_for_length').val() : '',
              // diff_for_robe: $(value).find('.length_for_robe_difference').val() ? $(value).find('.length_for_robe_difference').val() : '',
              MSEG_ERFMG: $(value).find('.difference_num').val(),
              is_spec_stock: $(value).attr('data-spec_stock') ? $(value).attr('data-spec_stock') : '',
            });
          
        // }
      }
    });

    $(v).find('.show_out_material .table_tbody tr').each(function (key, value) {
      var trData = JSON.parse($(value).attr('data-tr'));
      if ((!($(value).find('.length_for_robe').val())) && trData.material_code.substring(0, 4) == '3002') {
        LayerConfig('fail', trData.material_code + '物料的长度不能为空！')
        flag = false;
        return false;
      } else {
        var $itemPo = $(value).find('.line_depot');
        var line_depot_id = $(value).find('.line_depot').attr('data-id');
        var line_depot_code = $(value).find('.line_depot').attr('data-code');
        out_materials.push({
          id: '',
          material_id: $(value).attr('data-id'),
          LGFSB: $(value).attr('data-LGFSB'),
          LGPRO: $(value).attr('data-LGPRO'),
          line_depot_id: line_depot_id,
          line_depot_code: line_depot_code,
          GMNGA: $(value).find('.consume_num').val(),
          unit_id:$(value).find('.unit').attr('data-unit'),
          // lot: $(value).find('.batch_out').val() ? $(value).find('.batch_out').val() : '',
          // unit_for_length: $(value).find('.unit_for_length').val() ? $(value).find('.unit_for_length').val() : '',
          // unit_id: $(value).find('.unit').attr('data-unit'),
          material_spec:'',
          qty: $(value).find('.qty').text(),
          MKPF_BKTXT: '',
          MSEG_ERFMG: '',
          is_spec_stock: $(value).attr('data-spec_stock') ? $(value).attr('data-spec_stock') : '',
        })
      }
    });
    var workCenter = $(v).find('.show_workcenter .work_center_item');
    var workCenterArr = [];
    workCenter.each(function (key, value) {
      workCenterArr.push({
        id: '',
        standard_item_id: $(value).attr('data-id'),
        standard_item_code: $(value).attr('data-code'),
        value: $(value).find('.workValue').val() ? $(value).find('.workValue').val() : '',
      })
    });
	  console.log(in_materials);
    var data = {
      production_id:production_order_id,
      operation_order_code:operation_order_code,
      work_center_id:work_center_id,
      routing_node_id: routing_node_id,
      sub_id: sub_id,
      picking_id:picking_id,
      picking_line_id:picking_line_id,
      start_time: $(v).find('.start_time').val(),
      end_time: $(v).find('.end_time').val(),
      in_materials: JSON.stringify(in_materials),
      out_materials: JSON.stringify(out_materials),
      stands: JSON.stringify(workCenterArr),
      is_teco: $(v).find('.is_teco').hasClass('is-checked') ? 1 : 0,
    };
    dataArr.push(data);
  });
  // item_no.forEach(function (nitem) {
  //   var count = 0;
  //   var qty = 0;
  //   var mater = ''
  //   $('#show_in_material .table_tbody tr').each(function (k, v) {
  //     var trDataMt = $(v).data('trDataMt');
  //     if (trDataMt.material_code == nitem) {
  //       qty = trDataMt.qty;
  //       count += Number($(v).find('.beath_qty').val());
  //     }
  //     mater = trDataMt.material_code
  //   });

  //   if (count.toFixed(3) * 1000 > Number(qty).toFixed(3) * 1000) {
  //     LayerConfig('fail', nitem + '物料的定额总量不能大于计划数量');
  //     flag = false;
  //     return false;
  //   }
  // });
  dataArr = { moreItems: JSON.stringify(dataArr), _token: '8b5491b17a70e24107c89f37b1036078' }
  // if ($('#start_time').val().length < 0 || $('#end_time').val() < 0) {
  //   LayerConfig('fail', '请选择报工单执行时间！');
  // } else {

  if (flag) {
    AjaxClient.post({
      url: URLS['buste'].store,
      data: dataArr,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.confirm('工单保存成功！', {
          icon: 1, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
          var insert_ids = [];
          rsp.results.forEach(function (item) {
            insert_ids.push(item);
          })
          window.location.href = "/Buste/bustePageIndex?declare_ids=" + insert_ids;
        });
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);

      }
    }, this)
  }
  // }
  // }
}

function uniteTdCellsitem(tableId) {
  var table = document.getElementById(tableId);
  for (let i = 0; i < table.rows.length; i++) {
    for (let c = 0; c < table.rows[i].cells.length; c++) {
      if (c == 0 || c == 1) { //选择要合并的列序数，去掉默认全部合并
        for (let j = i + 1; j < table.rows.length; j++) {
          let cell1 = table.rows[i].cells[c].innerHTML;
          let cell2 = table.rows[j].cells[c].innerHTML;
          if (cell1 == cell2) {
            table.rows[j].cells[c].style.display = 'none';
            table.rows[j].cells[c].style.verticalAlign = 'middle';
            table.rows[i].cells[c].rowSpan++;
          } else {
            table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
            break;
          };
        }
      }
    }
  }
};
function uniteTdCells(tableId) {
  var table = document.getElementById(tableId);
  for (let i = 0; i < table.rows.length; i++) {
    var c = 3;
    for (let j = i + 1; j < table.rows.length; j++) {
      let cell1 = table.rows[i].cells[c].getAttribute('class');
      let cell2 = table.rows[j].cells[c].getAttribute('class');
      if (cell1 == cell2) {
        table.rows[j].cells[c].style.display = 'none';
        table.rows[j].cells[c].style.verticalAlign = 'middle';
        table.rows[i].cells[c].rowSpan++;
      } else {
        table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
        break;
      };
    }
  }
};