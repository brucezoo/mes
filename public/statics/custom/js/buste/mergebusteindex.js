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
var workId = [];
var work_id = '';
var brench_id = '';
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
    url: URLS['work'].mergeBuste + "?work_order_id=" + data + "&" + _token+"&hasremoveschgt=1",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
	
      layer.close(layerLoading);
	  var data = rsp.results;
	  work_id = data[0].workshop_id
      moreOrder = data;
      var maBatches = [];
      woLen = data.length;
      data.forEach(function (item) {
        var work_order_code = item.wo_number;
        var sales_order_code = item.sales_order_code;
        var product_order_code = item.po_number;
        var line_depot_id = item.line_depot_id;
        var material_arr = [];
        var in_material = JSON.parse(item.in_material);
		var out_material = JSON.parse(item.out_material);
		//mao  待测
		  window.sessionStorage.setItem('setShop', item.workshop_id);


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
        getMaterialBatch(JSON.stringify(maBatches));
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
  
//获取实时库存
function getMaterialBatch(data) {
  AjaxClient.get({
    url: URLS['work'].getMoreMaterialStorageInPW + "?" + _token + "&item=" + data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      in_material_arr.forEach(function (initem, index) {
        new_in_material = [];
        var in_material = initem;
        in_material.forEach(function (item) {
          var batch_arr = [];
          var materials = rsp.results[index][item.material_id];
          if (materials) {
            if (materials.length > 0) {
              materials.forEach(function (mater) {
                batch_arr.push({
                  batch: mater.batch,
                  inve_id: mater.inve_id,
                  depot_id: mater.depot_id,
                  depot_code: mater.depot_code,
                  unit_name: mater.unit_name,
                  unit_id: mater.unit_id,
                  storage_number: mater.storage_number,
                  sale_order_code: mater.sale_order_code,
                  product_order_code: mater.product_order_code,
                  conversion: mater.conversion,
                })
              })
            }
          } else {
            batch_arr.push({
              batch: '',
              inve_id: '',
              depot_id: '',
              depot_code: '',
              unit_name: '',
              unit_id: '',
              storage_number: '',
              sale_order_code: '',
              product_order_code: '',
              conversion: 0,
            })
          }
          item.batchs = batch_arr;
          new_in_material.push(item);
        });
        new_in_material_arr.push(new_in_material);
      })
      getRWDoList(JSON.stringify(wo_arr_json), wo_arr);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      // LayerConfig('fail','获取工单详情失败，请刷新重试')
    }
  }, this)
}

//获取已报工数据
function getRWDoList(data, arr) {

  var urlLeft = '';
  urlLeft += '&work_number_list=' + data;
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['work'].pageIndex + "?" + _token + urlLeft,
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
      'wo_number': moreOrder[i].wo_number,
      'out_depot_name': moreOrder[i].out_depot_name,
      'out_line_depot_code': moreOrder[i].out_line_depot_code,
      'out_line_depot_id': moreOrder[i].out_line_depot_id,
      'routing_node_id': moreOrder[i].routing_node_id,
      'sales_order_code': moreOrder[i].sales_order_code,
      'sales_order_project_code': moreOrder[i].sales_order_project_code,
      'product_order_code': moreOrder[i].po_number,
      'factory_id': moreOrder[i].factory_id,
      'line_depot_id': moreOrder[i].line_depot_id,
      'in_material': new_in_material_arr[i],
      'out_material': out_material_arr[i],
	  'array_arr': rwdo_arrs[i],
	  'emplyee_id': moreOrder[i].emplyee_id,
	  'emplyee_name': moreOrder[i].emplyee_name
    };
    inAndOut_arr.push(inAndOut);
  }
  getWorkOrderList(inAndOut_arr);
}

//渲染整个合并报工页面
function getWorkOrderList(data) {
  var thtml = '';
  // console.log(data)
  data.forEach(function (item) {
    var in_material = '', out_material = '';
    item['in_material'].forEach(function (nitem, index) {
      if (nitem.item_no != "99999999"&&nitem.SCHGT!="X") {
        if (nitem.item_no.substring(0, 4) == '3002') {
          var nbatchs = nitem.batchs;
          nbatchs.forEach(function (bitem) {
            in_material += `<tr data-id="${nitem.material_id}" data-spec_stock="${nitem.special_stock ? nitem.special_stock : ''}" data-tr='${JSON.stringify(bitem)}' data-tr-mt='${JSON.stringify(nitem)}' data-LGFSB="${nitem.LGFSB}" data-LGPRO="${nitem.LGPRO}" data-conversion="${tansferNull(bitem.conversion)}">
                        <td width="100px;">${tansferNull(nitem.item_no)}</td>
                        <td width="150px;">${tansferNull(nitem.name)}</td>
                        <td class="batch">${bitem.batch}</td>
                        <td class="qty ${tansferNull(nitem.item_no)}${bitem.conversion * 1000000}" data-qty="${nitem.qty}">${bitem.conversion > 0 ? (nitem.qty / bitem.conversion).toFixed(3) : nitem.qty}</td>
                        <td><p><input type="number" min="0" max="${tansferNull(bitem.conversion > 0 ? (bitem.storage_number / bitem.conversion).toFixed(3) : bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${bitem.conversion > 0 ? (nitem.qty / bitem.conversion).toFixed(3) : nitem.qty}"  placeholder="" class="beath_qty deal " value="" style="line-height:20px;width: 100px;font-size: 10px;"></p></td>
                        <td>${tansferNull(bitem.sale_order_code)}</td>
                        <td>${tansferNull(bitem.product_order_code)}</td>
                        <td class="storage">${tansferNull(bitem.conversion > 0 ? (bitem.storage_number / bitem.conversion).toFixed(3) : bitem.storage_number)}</td>
                        <td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal deals" value="${bitem.conversion > 0 ? (nitem.qty / bitem.conversion).toFixed(3) : nitem.qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td style="padding: 3px;" class="total-consume">${nitem.total_consume_qty}</td>
                        <td class="unit" data-unit="${nitem.bom_unit_id}">${bitem.conversion > 0 ? 'M' : nitem.bom_commercial}</td>
                        <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td style="padding: 3px;">
                            <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${nitem.id}${bitem.inve_id}" class="MKPF_BKTXT vals" ></div>
                            <button type="button" data-id="${nitem.id}${bitem.inve_id}" class="button pop-button select">选择</button>
                        </td>
                        <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3"></textarea></td>
                    </tr>`;
          });
        } else {
          var nbatchs = nitem.batchs;
          nbatchs.forEach(function (bitem) {
            in_material += `<tr data-id="${nitem.material_id}" data-spec_stock="${nitem.special_stock ? nitem.special_stock : ''}" data-tr='${JSON.stringify(bitem)}' data-tr-mt='${JSON.stringify(nitem)}' data-LGFSB="${nitem.LGFSB}" data-LGPRO="${nitem.LGPRO}">
                        <td width="100px;">${tansferNull(nitem.item_no)}</td>
                        <td width="150px;">${tansferNull(nitem.name)}</td>
                        <td class="batch">${bitem.batch}</td>
                        <td class="qty ${tansferNull(nitem.item_no)}" data-qty="${nitem.qty}">${nitem.qty}</td>
                        <td><p><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${nitem.qty}"  placeholder="" class="beath_qty deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></p>${bitem.conversion > 0 ? (nitem.qty / bitem.conversion).toFixed(3) + 'M' : ''}</td>
                        <td>${tansferNull(bitem.sale_order_code)}</td>
                        <td>${tansferNull(bitem.product_order_code)}</td>
                        <td class="storage">${tansferNull(bitem.storage_number)}</td>
                        <td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal deals" value="${nitem.qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <td style="padding: 3px;" class="total-consume">${nitem.total_consume_qty}</td>
                        <td class="unit"  data-unit="${nitem.bom_unit_id}">${tansferNull(nitem.bom_commercial ? nitem.bom_commercial : '')}</td>
                        <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <!--<td  class="firm" style="padding: 3px;"></td>-->
                        <td style="padding: 3px;">
                            <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${nitem.id}${bitem.inve_id}" class="MKPF_BKTXT vals" ></div>
                            <button type="button" data-id="${nitem.id}${bitem.inve_id}" class="button pop-button select">选择</button>
                        </td>
                        <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3"></textarea></td>
                    </tr>`;
          });
        }
      }
    })
    item['out_material'].forEach(function (oitem, index) {
      if (item['array_arr'].length > 0) {
        item['array_arr'].forEach(function (aitem) {
          if (oitem.item_no == aitem.name) {
            if (oitem.item_no.substring(0, 4) == '3002') {
              out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                                <td width="100px;">${tansferNull(oitem.item_no)}</td>
                                <td width="150px;">${tansferNull(oitem.name)}</td>
                                <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                                <td class="qty">${tansferNull(oitem.qty)}</td>
                                <!--<td class="ready_id">${tansferNull(aitem.GMNGA)}</td>-->
                                <td class="unit"  data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                                <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(((oitem.qty * 1000) - (aitem.GMNGA * 1000)) / 1000 < 0 ? 0 : ((oitem.qty * 1000) - (aitem.GMNGA * 1000)) / 1000)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                                <td class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>
                                <td class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>
                                <td class="firm" style="padding: 3px;">
                                  <div class="el-select-dropdown-wrap">
                                    <input type="text" class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.out_line_depot_id}" value="${item.out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                                  </div>
                                </td>
                              </tr>`;
              //ele.append(tr);
              //ele.find('tr:last-child').data("trData", oitem);
              //ele.find('tr:last-child .consume_num.deal').keyup();
            } else {
              out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                                <td width="100px;">${tansferNull(oitem.item_no)}</td>
                                <td width="150px;">${tansferNull(oitem.name)}</td>
                                <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                                <td class="qty">${tansferNull(oitem.qty)}</td>
                                <!--<td class="ready_id">${tansferNull(aitem.GMNGA)}</td>-->
                                <td class="unit" data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                                <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(((oitem.qty * 1000) - (aitem.GMNGA * 1000)) / 1000 < 0 ? 0 : ((oitem.qty * 1000) - (aitem.GMNGA * 1000)) / 1000)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                                <td class="firm" style="padding: 3px;"></td>
                                <td class="firm" style="padding: 3px;"></td>
                                <td class="firm" style="padding: 3px;">
                                  <div class="el-select-dropdown-wrap">
                                    <input type="text" class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.out_line_depot_id}" data-code="${item.out_line_depot_code}" value="${item.out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                                  </div>
                                </td>
                              </tr>`;
              //ele.append(tr);
              //ele.find('tr:last-child').data("trData", oitem);
              //ele.find('tr:last-child .consume_num.deal').keyup();
            }
          }
        })
      } else {
        if (oitem.item_no.substring(0, 4) == '3002') {
          out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                      <td width="100px;">${tansferNull(oitem.item_no)}</td>
                      <td width="150px;">${tansferNull(oitem.name)}</td>
                      <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                      <td class="qty">${tansferNull(oitem.qty)}</td>
                      <!--<td class="ready_qty">0</td>-->
                      <td class="unit"  data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                      <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(oitem.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                      <td class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>
                      <td class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>
                      <td class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                          <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.out_line_depot_id}" value="${item.out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                      </td>
                  </tr>`;
          //ele.append(tr);
          //ele.find('tr:last-child').data("trData", oitem);
        } else {
          out_material += `<tr data-id="${oitem.material_id}" data-spec_stock="${oitem.special_stock ? oitem.special_stock : ''}" data-LGFSB="${oitem.LGFSB}" data-LGPRO="${oitem.LGPRO}" data-tr='${JSON.stringify(oitem)}'>
                      <td width="100px;">${tansferNull(oitem.item_no)}</td>
                      <td width="150px;">${tansferNull(oitem.name)}</td>
                      <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                      <td class="qty">${tansferNull(oitem.qty)}</td>
                      <!--<td class="ready_qty">0</td>-->
                      <td class="unit" data-unit="${oitem.bom_unit_id}">${tansferNull(oitem.bom_commercial ? oitem.bom_commercial : '')}</td>
                      <td class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(oitem.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                      <td class="firm" style="padding: 3px;"></td>
                      <td class="firm" style="padding: 3px;"></td>
                      <td class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                          <input type="text" class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.out_line_depot_id}" value="${item.out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                      </td>
                  </tr>`;
          //ele.append(tr);
          //ele.find('tr:last-child').data("trData", oitem);
        }
      }
      out_flag++;
    })
    thtml += `<div class="work_order_wrap">
    <input type="hidden" class="work_order_id" value="${item['work_order_id']}"/>
    <input type="hidden" class="routing_node_id" value="${item['routing_node_id']}"/>
    <input type="hidden" class="sales_order_code" value="${item['sales_order_code']}"/>
    <input type="hidden" class="sales_order_project_code" value="${item['sales_order_project_code']}"/>
    <input type="hidden" class="product_order_code" value="${item['product_order_code']}"/>
    <input type="hidden" class="factory_id" value="${item['factory_id']}"/>
    <input type="hidden" class="line_depot_id" value="${item['line_depot_id']}"/>
      <div class="work_order_left">
        <textarea  name="" class="work_order_form" cols="30" rows="8" readonly="readonly" style="margin-top: 10px; text-align: center; padding:20px;overflow: hidden;height:270px;">
          ${item.wo_number}
        </textarea>
        <button type="button" class="el-button delete-buste">删除</button>
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
					<input type="checkbox" class="chioce" style="margin-top: -5px; margin-right:20px;">
					<label class="el-form-item-label" style="color:#000;">责任人</label> 
					<select class="js-example-basic-single employee_id" name="state" style="width: 200px;" >
						<option value="${item.emplyee_id != '' ? item.emplyee_id : ''}">${item.emplyee_name != '' ? item.emplyee_name : '-- 请选择 --'}</option>
					</select>		
              </div>
            </div>
          <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 170px;text-align: center;color:#000;">过账时间</label>
            <input type="text" class="el-input BUDAT" placeholder="请选择过账时间" value="">
          </div>
        </div>
        <div class="show_workcenter" style="display: none;"></div>
          <div class="op-infor" style="display: none;"><span>工序</span>：<span ="operationName"></span><div style="display: inline-block;width: 100px;"></div><span>确认号</span>：<span class="confirm_number_RUECK"></span></div>
        </div>
        <div>
          <h3>消耗品</h3>
          <table class="show_in_material">
            <thead>
              <tr>
                <th class="center">物料编码</th>
                <th class="center">物料名称</th>
                <th class="center">批次号</th>
                <th class="center">计划数量</th>
                <th class="center">额定领料数量</th>
                <th class="center">销售订单号</th>
                <th class="center">生产订单号</th>
                <th class="center storage">库存数量</th>
                <th class="center">消耗数量</th>
                <th class="center">累计消耗</th>
                <th class="center">单位</th>
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
                <th class="center">批次</th>
                <th class="center">计划数量</th>
                <th class="center ready_qty" style="display: none;">已报数量</th>
                <th class="center">单位</th>
                <th class="center">实报数量</th>
                <th class="center">长度</th>
                <th class="center">长度单位</th>
                <th class="center">库存地</th>
              </tr>
            </thead>
            <tbody class="table_tbody">
              ${out_material}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  });
  $("#workOrder_from").html(thtml);
$('.js-example-basic-single').select2();
  // laydate.render({
  //     elem: '.BUDAT'
  //     ,min: -5 //7天前
  //     ,max: 5 //7天后
  //     ,value: getCurrentDateNow()
  //     ,done: function (value) {
  //     }
  // });
  $('#workOrder_from .work_order_wrap').each(function (k, v) {
    $(v).each(function(key,value){
      $(value).find('tr:last-child .consume_num.deal').keyup();
    })
  })
  $(".BUDAT").val(getCurrentDateNow);
  $(".start_time").val(getCurrentDateZore);
  $(".end_time").val(getCurrentTime);
  data.forEach(function (item) {
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

//渲染报工单
function getBusteWorkForm(id) {
  AjaxClient.get({
    url: URLS['work'].show + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      work_order_id = rsp.results[0].workOrder_id;
      production_order_id = rsp.results[0].production_id;
      operation_order_id = rsp.results[0].operation_id;
      routing_node_id = rsp.results[0].routing_node_id;
      line_depot_id = rsp.results[0].line_depot_id;
      getEmployee(rsp.results[0].workOrder_shift_id, rsp.results[0].employee_id)
      $('#work_order_form').attr("readonly", "readonly");
      $('.storage').hide();
      if (rsp.results[0].type == 1) {
        $('#work_order_form').hide()
      }
      if (rsp.results[0].status == 2) {
        $('.submit').hide();
        $('.submit_SAP').hide();
      }
      if (rsp.results[0].status == 1) {
        $('.submit').hide();
        $('.submit_SAP').show();
      }
      var arr = [];
      if (rsp.results[0].is_teco == 1) {
        $('#is_teco').addClass('is-checked')
      }
      rsp.results[0].out_materials.forEach(function (item) {
        arr.push({
          "CHARG": item.lot,
          "BATHN": item.GMNGA
        })
      });
      if (rsp.results[0].sales_order_code == '') {
        print_str_qrcode = {
          "HEADER": {
            "SURNO": rsp.results[0].code,
            "SURST": "01",
            "CDAT": rsp.results[0].ctime.substr(0, 10),
            "WERKS": rsp.results[0].planfactory_code,
            "INTYP": "E"
          },
          "LINE": {
            "PNO": rsp.results[0].production_number,
            "PLN": "",
            "LGORT": rsp.results[0].plan_LGPRO,
            "BISMT": rsp.results[0].inspur_material_code,
            "LCORD": rsp.results[0].inspur_sales_order_code,
            "MATNR": rsp.results[0].out_materials[0].material_item_no,
            "PLNTN": rsp.results[0].out_materials[0].GMNGA,
            "MEINS": rsp.results[0].out_materials[0].commercial,
            "BATLS": arr,
          }
        };
        print_str = "生产单号：" + rsp.results[0].production_number
          + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
          + "</br> 物料名称：" + rsp.results[0].out_materials[0].material_name
          + "</br>批次号：" + rsp.results[0].out_materials[0].lot
          + "</br>完工时间：" + rsp.results[0].end_time.substr(0, 11)
          + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA + "（" + rsp.results[0].out_materials[0].commercial + "）"
          + "</br> 工厂：" + rsp.results[0].planfactory_code
          + "</br> 地点：" + rsp.results[0].plan_LGPRO
          + "</br> 下道委外加工商：" + rsp.results[0].NEXT_LIFNR
          + "</br> 浪潮物料号：" + tansferNull(rsp.results[0].inspur_material_code)
          + "</br> 浪潮销售订单号：" + tansferNull(rsp.results[0].inspur_sales_order_code)
          + "</br> 报工单号：" + tansferNull(rsp.results[0].code);

      } else {
        print_str_qrcode = {
          "HEADER": {
            "SURNO": rsp.results[0].code,
            "SURST": "01",
            "CDAT": rsp.results[0].ctime.substr(0, 10),
            "WERKS": rsp.results[0].planfactory_code,
            "INTYP": "E"
          },
          "LINE": {
            "PNO": rsp.results[0].production_number,
            "PLN": "",
            "LGORT": rsp.results[0].plan_LGPRO,
            "inspur_material_code": rsp.results[0].inspur_material_code,
            "inspur_sales_order_code": rsp.results[0].inspur_sales_order_code,
            "MATNR": rsp.results[0].out_materials[0].material_item_no,
            "PLNTN": rsp.results[0].out_materials[0].GMNGA,
            "KDAUF": rsp.results[0].sales_order_code,
            "KDPOS": rsp.results[0].sales_order_project_code,
            "MEINS": rsp.results[0].out_materials[0].commercial,
            "BATLS": arr,
          }
        };
        print_str = "销售订单号：" + rsp.results[0].sales_order_code
          + "</br>销售行项号：" + rsp.results[0].sales_order_project_code
          + "</br>生产单号：" + rsp.results[0].production_number
          + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
          + "</br> 物料名称：" + rsp.results[0].out_materials[0].material_name
          + "</br>批次号：" + rsp.results[0].out_materials[0].lot
          + "</br>完工时间：" + rsp.results[0].end_time.substr(0, 11)
          + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA + "（" + rsp.results[0].out_materials[0].commercial + "）"
          + "</br> 工厂：" + rsp.results[0].planfactory_code
          + "</br> 地点：" + rsp.results[0].plan_LGPRO
          + "</br> 下道委外加工商：" + rsp.results[0].NEXT_LIFNR
          + "</br> 浪潮物料号：" + tansferNull(rsp.results[0].inspur_material_code)
          + "</br> 浪潮销售订单号：" + tansferNull(rsp.results[0].inspur_sales_order_code)
          + "</br> 报工单号：" + tansferNull(rsp.results[0].code);

      }

      //二维码
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 255,
        height: 255,
      });

      var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
      $("#qrCodeIco").css("margin", margin);
      makeCode(JSON.stringify(print_str_qrcode), qrcode);

      if (rsp.results && rsp.results.length) {
        // console.log(rsp.results[0].inspur_material_code);
        // console.log(rsp.results[0].inspur_sales_order_code);
        if (!rsp.results[0].plan_LGPRO) {
          var textarea = "销售订单号：" + rsp.results[0].sales_order_code
            + "\r\n生产单号：" + rsp.results[0].production_number
            + "\r\n工单：" + rsp.results[0].workOrder_number
            + "\r\n完工时间：" + rsp.results[0].end_time.substr(0, 11)
            + "\r\n计划工厂：" + rsp.results[0].planfactory_code
            + "\r\n批次号：" + rsp.results[0].out_materials[0].lot
            + "\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
            + "\r\n单位：" + rsp.results[0].out_materials[0].commercial
            + "\r\n浪潮销售订单号：" + rsp.results[0].inspur_sales_order_code
            + "\r\n下道委外加工商：" + rsp.results[0].NEXT_LIFNR
            + "\r\n生产仓储地点：" + rsp.results[0].plan_LGPRO;
          +"\r\n产成品生产仓储地点未找到";
          $('#work_order_form').val(textarea);
        } else {
          var textarea = "销售订单号：" + rsp.results[0].sales_order_code
            + "\r\n生产单号：" + rsp.results[0].production_number
            + "\r\n工单：" + rsp.results[0].workOrder_number
            + "\r\n完工时间：" + rsp.results[0].end_time.substr(0, 11)
            + "\r\n计划工厂：" + rsp.results[0].planfactory_code
            + "\r\n批次号：" + rsp.results[0].out_materials[0].lot
            + "\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
            + "\r\n单位：" + rsp.results[0].out_materials[0].commercial
            + "\r\n浪潮物料号：" + rsp.results[0].inspur_material_code
            + "\r\n浪潮销售订单号：" + rsp.results[0].inspur_sales_order_code
            + "\r\n下道委外加工商：" + rsp.results[0].NEXT_LIFNR
            + "\r\n生产仓储地点：" + rsp.results[0].plan_LGPRO;
          $('#work_order_form').val(textarea);
        }
      }
      if (rsp.results[0].start_time == '1970-01-01 08:00:00') {
        $('#start_time').val(getCurrentDateZore);
        $('#end_time').val(getCurrentTime);
        $('#start_time_input').text(getCurrentDateZore);
        $('#end_time_input').text(getCurrentTime);
      } else {
        $('#start_time').val(rsp.results[0].start_time);
        $('#end_time').val(rsp.results[0].end_time);
        $('#start_time_input').text(rsp.results[0].start_time);
        $('#end_time_input').text(rsp.results[0].end_time);
      }
      if (rsp.results[0].BUDAT) {
        $("#BUDAT").val(rsp.results[0].BUDAT)
      }
      if (rsp.results[0].stands.length > 0) {
        var workCenterHtml = ''
        rsp.results[0].stands.forEach(function (item) {
          if (item.code == 'ZPP001' || item.code == 'ZPP002') {
          } else {
            workCenterHtml += `<div class="work_center_item" data-id="${item.param_item_id}" data-item_id="${item.id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
          }
        });
        $('#show_workcenter').html(workCenterHtml);
        $('#show_workcenter').show();
      }
      showInItemView(rsp.results[0].in_materials, rsp.results[0].status);
      showOutItemView(rsp.results[0].out_materials, rsp.results[0].status);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取报工单详情失败，请刷新重试')
    }
  }, this)
}
//二维码
function makeCode(str, qrcode) {
  qrcode.makeCode(str);
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
  $("body").on('blur', '.consume_num', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).val() - $(this).parent().parent().find('.beath_qty').val();
      $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

  $("body").on('blur', '.beath_qty', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).parent().parent().parent().find('.consume_num').val() - $(this).val()
      $(this).parent().parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

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
        if (trDataMt.item_no == nitem) {
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
        $(this).find('.difference_num.deal').val(0);
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
                      <div style="display: inline-block">${itemc.preselection_name}-${itemc.preselection_code}</div>
                    </span>`);
        _ele.find('span:last-child').data("spanData", itemc);
      }
    })
  });

    // 删除工单
    $('body').on('click', '.delete-buste', function (e) {
        e.stopPropagation();
        var $buste = $(this).parents('.work_order_wrap');
        var currentId = $buste.find('.work_order_id').val();
        $buste.slideUp(function () {
            $buste.remove();
        });
        var idArr = id.split(',');
        idArr.splice(idArr.indexOf(currentId), 1);

        id = idArr.join(',');

        if (!idArr.length) $('.submit').remove();
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
		// createHtmlItem($('#practice_table .table_tbody'), rsp.results, arr_couse)
		
		let shopId = window.sessionStorage.getItem('setShop');
			 AjaxClient.get({
			  url: '/Preselection/getWorkshopPreselection' + "?" + _token + "&workshop_id=" + shopId,
			  dataType: 'json',
			  success: function (rsp) {
				  let data = rsp.results;
				  // window.sessionStorage.setItem('case', JSON.stringify(data));
				  createHtmlItem($('#practice_table .table_tbody'), data, arr_couse)
			  },
			  fail: function (rsp) {

			  }
		  	}, this)
		
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
      // console.log(arr_couse.length-1);
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
    var work_order_id = $(v).find(".work_order_id").val();
    var routing_node_id = $(v).find(".routing_node_id").val();
    var sales_order_code = $(v).find(".sales_order_code").val();
    var sales_order_project_code = $(v).find(".sales_order_project_code").val();
    var product_order_code = $(v).find(".product_order_code").val();
    var factory_id = $(v).find(".factory_id").val();
    var line_depot_id = $(v).find(".line_depot_id").val();
    var employee_id = $(v).find(".employee_id").val();
    $(v).find('.show_in_material .table_tbody tr').each(function (key, value) {
      var trData = JSON.parse($(value).attr('data-tr'));
      var trDataMt = JSON.parse($(value).attr('data-tr-mt'));
      if (Number($(value).find('.beath_qty').val()).toFixed(3) * 1000 > Number($(value).find('.storage').text()).toFixed(3) * 1000) {
        LayerConfig('fail', trDataMt.item_no + '物料的额定数量不能大于库存数量')
        flag = false;
        return false;
      } else if (Number($(value).find('.consume_num').val()).toFixed(3) * 1000 > Number($(value).find('.storage').text()).toFixed(3) * 1000) {
        LayerConfig('fail', trDataMt.item_no + '物料的消耗数量不能大于库存数量')
        flag = false;
        return false;
	  }else {
    // }else if (Number($(v).find('.qty').text()) < Number($(v).find('.deals').val())){
    //   var trDataMt = JSON.parse($(value).attr('data-tr-mt'));
    //   layer.confirm('当前物料'+trDataMt.item_no+'已超报，是否继续报工？', {
    //     icon: 3, title: '提示', offset: '250px', end: function () {
    //     }
    //   }, function (index) {
    //     layer.close(index);
    //     flag=true;
    //   });
        if ($(v).find('.consume_num').val()!=0&&(Number($(v).find('.qty').text()*1000) <(Number($(v).find('.deals').val()*1000)+Number($(v).find('.total-consume').text()*1000)))) {
          // mao 待测
          if ($(v).find('.vals').text() == '') {
            layer.alert(trDataMt.item_no + '消耗数量大于计划数量，请填写原因！');
            flag = false;
            return false;
          }
        }
        if (trDataMt.item_no !== "99999999") {
          var _ele = $(value).find('.MKPF_BKTXT'), arr_couse = [];

          _ele.find('span').each(function (item) {
            arr_couse.push($(this).data('spanData').preselection_id)
          });

          // if (Number($(v).find('.qty').text()) < Number($(v).find('.deals').val())) {

          //   // mao 待测
          //   if ($(v).find('.vals').text() == '') {
          //     layer.alert(trDataMt.item_no + '消耗数量大于计划数量，请填写原因！');
          //     flag = false;
          //     return false;
          //   }
      
          // } 
          if ($(value).find('.beath_qty').val() > 0 || $(value).find('.consume_num').val() > 0) {
            {
              var str = arr_couse.join();
              in_materials.push({
                id: '',
                material_id: $(value).attr('data-id'),
                LGFSB: $(value).attr('data-LGFSB'),
                LGPRO: $(value).attr('data-LGPRO'),
                GMNGA: $(value).find('.consume_num').val(),
                lot: $(value).find('.batch').text(),
                batch_qty: $(value).find('.beath_qty').val(),
                unit_id: $(value).find('.unit').attr('data-unit'),
                qty: $(value).find('.qty').attr('data-qty'),
                conversion: $(value).attr('data-conversion') ? $(value).attr('data-conversion') : '',
                MKPF_BKTXT: str,
                diff_remark:$(value).find('.diff_remark').val(),
                length_for_robe: $(value).find('.length_for_robe').val() ? $(value).find('.length_for_robe').val() : '',
                unit_for_length: $(value).find('.unit_for_length').val() ? $(value).find('.unit_for_length').val() : '',
                diff_for_robe: $(value).find('.length_for_robe_difference').val() ? $(value).find('.length_for_robe_difference').val() : '',
                MSEG_ERFMG: $(value).find('.difference_num').val(),
                is_spec_stock: $(value).attr('data-spec_stock') ? $(value).attr('data-spec_stock') : '',
                batch: trData.batch,
                depot_id: trData.depot_id,
                inve_id: trData.inve_id,
                storage_number: trData.storage_number,
              });
            }
          }
        }
      }
    });

    $(v).find('.show_out_material .table_tbody tr').each(function (key, value) {
      var trData = JSON.parse($(value).attr('data-tr'));
    //   console.log(trData.item_no);
      if ((!($(value).find('.length_for_robe').val())) && trData.item_no.substring(0, 4) == '3002') {
        LayerConfig('fail', trData.item_no + '物料的长度不能为空！')
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
          GMNGA: $(value).find('.consume_num').val(),
          length_for_robe: $(value).find('.length_for_robe').val() ? $(value).find('.length_for_robe').val() : '',
          lot: $(value).find('.batch_out').val() ? $(value).find('.batch_out').val() : '',
          unit_for_length: $(value).find('.unit_for_length').val() ? $(value).find('.unit_for_length').val() : '',
          unit_id: $(value).find('.unit').attr('data-unit'),
          qty: $(value).find('.qty').text(),
          line_depot_id: line_depot_id,
          line_depot_code: line_depot_code,
          MKPF_BKTXT: '',
          MSEG_ERFMG: '',
          is_spec_stock: $(v).attr('data-spec_stock') ? $(v).attr('data-spec_stock') : '',
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

    var data = {
      work_order_id: work_order_id,
      routing_node_id: routing_node_id,
      employee_id: employee_id,
      sale_order_code: sales_order_code,
      sales_order_project_code: sales_order_project_code,
      product_order_code: product_order_code,
      factory_id: factory_id,
      line_depot_id: line_depot_id,
      BUDAT: $(v).find('.BUDAT').val(),
      start_time: $(v).find('.start_time').val(),
      end_time: $(v).find('.end_time').val(),
      in_materials: JSON.stringify(in_materials),
      out_materials: JSON.stringify(out_materials),
      stands: JSON.stringify(workCenterArr),
      is_teco: $(v).find('.is_teco').hasClass('is-checked') ? 1 : 0,
    };
    dataArr.push(data);
  });
  item_no.forEach(function (nitem) {
    var count = 0;
    var qty = 0;
    var mater = ''
    $('#show_in_material .table_tbody tr').each(function (k, v) {
      var trDataMt = $(v).data('trDataMt');
      if (trDataMt.item_no == nitem) {
        qty = trDataMt.qty;
        count += Number($(v).find('.beath_qty').val());
      }
      mater = trDataMt.item_no
    });

    if (count.toFixed(3) * 1000 > Number(qty).toFixed(3) * 1000) {
      LayerConfig('fail', nitem + '物料的定额总量不能大于计划数量');
      flag = false;
      return false;
    }
  });
  dataArr = { moreItems: JSON.stringify(dataArr), _token: '8b5491b17a70e24107c89f37b1036078' }
  // if ($('#start_time').val().length < 0 || $('#end_time').val() < 0) {
  //   LayerConfig('fail', '请选择报工单执行时间！');
  // } else {
  if (flag) {
    AjaxClient.post({
      url: URLS['work'].mergeReturnMore,
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
            insert_ids.push(item.insert_id);
          })
        //   console.log(insert_ids);
          window.location.href = "/Buste/bustePageIndex?declare_ids=" + insert_ids;
          // location.reload();
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
// 出料
function showOutItemView(data, status) {
  var ele = $('#show_out_material .table_tbody');
  ele.html("");
  data.forEach(function (item, index) {
    var tr = `<tr data-id="${item.material_id}"  data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td>${tansferNull(item.lot)}</td>
                        <td class="qty"><p>${tansferNull(item.qty)}</p></td>
                        <td  class="unit"  data-unit="${item.unit_id}">${tansferNull(item.commercial ? item.commercial : '')}</td>
                        <td  class="firm" style="padding: 3px;"><p><input type="number" readonly ${status != 1 ? 'readonly="readonly"' : ''}  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"></p></td>
                        <td>${tansferNull(item.length_for_robe)}</td>
                        <td>${tansferNull(item.unit_for_length)}</td>
                        <td  class="firm" style="padding: 3px;">
                            <div class="el-select-dropdown-wrap">
                                     <input type="text"  class="el-input line_depot" readonly ${status != 1 ? 'readonly="readonly"' : ''} id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.line_depot_id}" value="${item.line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                            </div>
                        </td>
                    </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
    if (item.depot_name) {
      $('#line_depot' + out_flag).val(item.depot_name + '（' + item.line_depot_code + '）').data('inputItem', { id: item.line_depot_id, depot_name: item.depot_name, code: item.line_depot_code }).blur();
    }
    $('#line_depot' + out_flag).autocomplete({
      url: URLS['work'].storageSelete + "?" + _token + "&is_line_depot=1",
      param: 'depot_name',
      showCode: 'depot_name'
    });
    out_flag++;
  })
}

//进料
function showInItemView(data, status) {
  var ele = $('#show_in_material .table_tbody');
  ele.html("");
  data.forEach(function (item, index) {
    var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td class="batch">${tansferNull(item.lot)}</td>
                        <td class="qty ${tansferNull(item.material_item_no)}"><p>${tansferNull(item.qty)}</p></td>
                        <td class="batch_qty"><input type="number" min="0" readonly class="batch_qty deal" value="${tansferNull(item.batch_qty)}" style="line-height:20px;width: 100px;font-size: 10px;"><p>${item.conversion > 0 ? (item.batch_qty / item.conversion).toFixed(3) + 'M' : ''}</p></td>
                        <td class="storage">${tansferNull(item.sale_order_code)}</td>
                        <td class="storage">${tansferNull(item.product_order_code)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"><p>${item.length_for_robe ? item.length_for_robe + 'M' : ''}</p></td>
                        <td  class="unit" data-unit="${item.unit_id}">${tansferNull(item.commercial)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="${item.MSEG_ERFMG}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <!--<td>${tansferNull(item.length_for_robe)}</td>-->
                        <!--<td>${tansferNull(item.diff_for_robe)}</td>-->
                        <!--<td>${tansferNull(item.unit_for_length)}</td>-->
                        <td  class="firm" style="padding: 3px;"><textarea name="" readonly id="" class="MKPF_BKTXT" cols="20" rows="3">${item.MKPF_BKTXT}</textarea></td>
                    </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  });
  uniteTdCells('show_in_material');
  uniteTdCellsitem('show_in_material');
}
	var val;
	var text;
//选择责任人
$('body').on('change', '.chioce', function() {

	if ($(this).prop('checked') == true) {
		val = $(this).parent().find('.js-example-basic-single').val();
		text = $(this).parent().find('.js-example-basic-single').text();
	}
	$(this).parent().find('.js-example-basic-single').html('');
	$(this).parent().find('.js-example-basic-single').append(`<option value="">-- 请选择 --</option>`);

	if ($(this).prop('checked') == true) {
		let select = $(this).parent().find('.js-example-basic-single');
		AjaxClient.get({
			url: '/WorkDeclareOrder/getWorkShopEmployee' + "?" + _token + "&workshop_id=" + work_id,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				let data = rsp.results;
				data.forEach(function(item) {
					let opt = getOpt(item);
					select.append(opt);
				})
			},
			fail: function (rsp) {
				layer.close(layerLoading);
				console.log(rsp);
			}
		}, this);
		
	}else {
		$(this).parent().find('.js-example-basic-single').html('');
		let select = $(this).parent().find('.js-example-basic-single');
		let opt = `
			<option value="${val}">${text}</option>
		`;
		select.append(opt);
	}
})

$('body').on('mouseover', '.chioce', function () {
	layer.tips('点击切换全车间搜索责任人！', this , {
		tips: [4, '#78BA32']
	});
})

function getOpt(item) {
	let opt = `
		<option value="${item.emplyee_id}">${item.emplyee_name}</option>
	`;
	return opt;
}