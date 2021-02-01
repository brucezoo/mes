var id,
  pickingList = '',
  push_type, type, pageNoItem = 1,
  MRCode = 0,
  pageSizeItem = 50;
$(function () {
  id = getQueryString('id');
  status = getQueryString('status');

  if (id != undefined) {
    getPickView();
  } else {
    layer.msg('url缺少链接参数，请给到参数', {
      icon: 5,
      offset: '250px'
    });
  }
  bindEvent();
});

function getPickView() {

  AjaxClient.get({
    url: URLS['order'].workPick + "?" + _token + "&material_requisition_id=" + id + '&is_production_feeding=1',
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      pickingList = rsp.results;
      push_type = rsp.results.push_type;
      type = rsp.results.type;
      $('#status').val(rsp.results.status);

      MRCode = rsp.results.code;
      if (rsp.results.type == 7) {
        if (status == 0) {
          $(".audit").show();
        } else {
          $(".anti-audit").show();
        }
        $('#cause').show();
        $('#causeRemark').show();
        if (rsp.results.push_type == 2) {
          $('#picking_title').text('车间补料单');
        } else if (rsp.results.push_type == 1) {
          $('#picking_title').text('SAP补料单');
        } else if (rsp.results.push_type == 0) {
          $('#picking_title').text('线边仓补料单');
          $(".confirmDeletion").hide();
          $(".rejectDeletion").hide();
        }
        if (rsp.results.status == 4 || rsp.results.status == 2 || rsp.results.status == 1) {
          $('.save').hide();
        } else {
          $('.save').text('入库');
          $('.save').show();
        }

        $('#basic_form_show').html(`<div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="margin:0px;">工单</label>
                            <input type="text" id="wo_number" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="margin:0px;">单号</label>
                            <input type="text" id="code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                     
                    ${rsp.results.push_type == 2 ? '' : `
                            <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">采购仓储</label>
                                        <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入采购仓储" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>`}
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">开单人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" readonly id="creator" class="el-input" placeholder="请输入开单人" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">生产补料</label>
                                        <textarea id="select_res_arr" rows="5" cols="43" readonly value="" style="margin: 0px; width: 194px; height: 161px;"></textarea>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                            </div>
                            <div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">销售单号</label>
                                        <input type="text" id="sales_order_code" style="min-width:160px;" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">工位</label>
                                        <input type="text" id="workbench_code" style="min-width:160px;" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">需求库存地点</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="storage_wo" style="min-width:160px;" readonly class="el-input" placeholder="请输入需求库存地点" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item" id="delete-reason-wrap">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">删单原因</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="delete-reason" readonly class="el-input" placeholder="" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                            </div>
                            <div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">销售行项目号</label>
                                        <input type="text" id="sales_order_project_code" style="min-width:160px;" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="margin:0px;">责任人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="employee" class="el-input" style="min-width:160px;" placeholder="请输入责任人" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="margin:0px;">计划时间</label>
                            <input type="text" id="plan_start_time" readonly style="min-width:160px;" class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                      </div>
                    
                    </div>
                    <div>
                      <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="margin:0px;">合并工单</label>
                            <div id="combine_wo" style="width:465px;height:280px;border:1px solid #ccc;"></div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                     </div>
                    </div>
                </div>`);
        $('#status').val(rsp.results.status);
        $('#send_depot').val(rsp.results.send_depot);
        $('#workbench_code').val(rsp.results.workbench_code);
        $('#wo_number').val(rsp.results.work_order_code);
        $('#plan_start_time').val(rsp.results.plan_start_time);
        $('#code').val(rsp.results.code);
        $('#storage_wo').val(rsp.results.line_depot_name);
        $('#combine_wo').val(rsp.results.wo_nubmers);
        $('#select_res_arr').val(rsp.results.select_res_arr);
        $('#storage_wo_send').val(rsp.results.send_depot_name);
        if (rsp.results.push_type == 1) {
          $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
          $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
        }
        $('#sales_order_code').val(rsp.results.sales_order_code);
        $('#creator').val(rsp.results.cn_name ? rsp.results.cn_name : rsp.results.creator_name);
        $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
        if (rsp.results.push_type == 0) {
          getShopMergerPickingDetail(rsp.results.work_order_code, rsp.results.materials, rsp.results.sales_order_code, rsp.results.sales_order_project_code, rsp.results.status, rsp.results.push_type);
          getPickingList(rsp.results.work_order_code, rsp.results.sales_order_code, rsp.results.sales_order_project_code);
        } else {
          if (rsp.results.materials) {
            showInItem(rsp.results.sales_order_code, rsp.results.sales_order_project_code, rsp.results.materials, rsp.results.status, rsp.results.push_type);
          }
        }
        $('#employee').autocomplete({
          url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10",
          param: 'name'
        });
        $('#employee').val(rsp.results.employee_name).data('inputItem', {
          id: rsp.results.employee_id,
          name: rsp.results.employee_name
        }).blur();

        var deleteReason = rsp.results.delete_reason;
        if (deleteReason) {
          $('#delete-reason').val(deleteReason);
        } else {
          $('#delete-reason-wrap').remove();
        }
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      // layer.msg('获取工单详情失败，请刷新重试', 9);
    }
  }, this)
}

//进料
function showReturnInItem(data) {
  var ele = $('.storage_blockquote .item_table .t-body');
  $('#operation').hide();
  $('#salere').hide();
  $('#rbqty').hide();
  $('#runit').hide();
  ele.html("");
  data.forEach(function (item, index) {
    var piciHtml = createREturnPiciHtml(item.batches)
    var tr = `
      <tr data-id="${item.item_id}" class="show_item">                
        <td >${tansferNull(item.material_code)}</td>
        <td >${tansferNull(item.material_name)}</td>
        <td>
          ${piciHtml}
        </td>
      </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  })
}

function createREturnPiciHtml(data, status, unit) {
  var trs = '';
  if (data && data.length) {
    data.forEach(function (item, index) {
      trs += `
			<tr data-id="${item.batch_id}">
			<td>${tansferNull(item.order)}</td>
			<td>${tansferNull(item.batch)}</td>
			<td>
        <input readonly type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input actual_receive_qty"   value="${tansferNull(item.actual_send_qty)}">
      </td>
			<td>${tansferNull(item.actual_receive_qty)}</td>
			
			<td>${tansferNull(unit ? unit : item.bom_unit)}</td>
			
			</tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="8" class="center">暂无数据</td></tr>';
  }
  var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">序号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">退料数量</th>
                        <th class="left nowrap tight">实退数量</th>
                        <th class="left nowrap tight">单位</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
  return thtml;
}

//获取已生成补料单列表
function getPickingList(work_order_code, so, spo) {

  AjaxClient.get({
    url: URLS['order'].blList + "?" + _token + "&work_order_code=" + work_order_code + "&material_requisition_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      pickingList = rsp.results;
      let tr = ''
      pickingList.forEach(function (item, index) {
        if (item.mrcodecode != MRCode) {
          if (push_type == 0) {
            tr += showReplenishedMRcode(so, spo, item);
          } else {
            tr += showReplenishedMRcode(item.sales_order_code, item.sales_order_project_code, item.materials, item.status, push_type, item.mrcode);
          }
        }
      })
      if (tr) {

        let _html = `<h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">已生成补料单</h4>
            <div class="basic_info">
              <div class="table-container">
                <table class="storage_table item_table table-bordered">
                  <thead>
                    <tr>
                      <th class="thead">操作</th>
                      <th class="thead">销售订单</th>
                      <th class="thead">单号</th>
                      <th class="thead">名称</th>
                      <th class="thead" id="rbqty_show">计划数量</th>
                      <th class="thead" id="rbqty">补料数量</th>
                      <th class="thead" id="runit">补料单位</th>
                      <th class="thead">差异原因</th>
                      <th class="thead" id="deport">仓库</th>
                      <th class="thead">补料比例</th>
                    </tr>
                  </thead>
                  <tbody class="t-body">
                    ${tr}
                  </tbody>
                </table>
              </div>
            </div>`;
        $("#storage_item").html(_html);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  })
}

function showReplenishedMRcode(code, line, data, status, push_type, mrcode) {
  if (push_type == 1) {
    let html = '';
    let readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }
    data.forEach(function (item, index) {
      html += `<tr data-id="${item.item_id}" class="show_item">
                  <td>
                ${item.special_stock == 'E' ? `<div>
                    <p>销售订单号：${code}</p>
                    <p>行项目号：${line}</p>
                  </div>`: ''}
                </td>
                <td>${tansferNull(mrcode)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.rated_qty)}</td>
                <td>
                  <input ${readonly1}  type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                </td>
                <td>${tansferNull(item.demand_unit)}</td>
                <td>
                  ${countRadio(item.rated_qty, item.demand_qty)}
                </td>
              </tr>`;
    })
    return html;
  } else {
    let html = '',
      readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }
    console.log(data)

    html = `
                <tr data-id="${data.material_id}" class="show_item">
                <td>${data.repairstatus==0?`<button type="button" data-id="${data.mrid}" data-material='${JSON.stringify(data)}' class="audit-item" data-ebeln="">审核</button>`:`<button type="button" data-id="${data.mrid}" data-material='${JSON.stringify(data)}' class="item-anti-audit">反审</button>`}</td>                
                <td>
                  
                    <p>销售订单号：${code}</p>
                    <p>行项目号：${line}</p>
                  </div>
                </td>
                <td>${data.repairstatus==0?`<a href="/WorkOrder/auditPickingList?id=${data.mrid}&status=0">${tansferNull(data.mrcode)}</a>`:`<a href="/WorkOrder/auditPickingList?id=${data.mrid}&status=1">${tansferNull(data.mrcode)}</a>`}</td>
                <td>${tansferNull(data.material_name)}</td>
                <td>${tansferNull(data.demand_qty)}</td>
                <td>
                  <input ${readonly1}  type="number" min="0" readonly style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(data.actual_receive_qty)}">
                </td>	
                <td>${tansferNull(data.demand_unit)}</td>
                <td>${showQCReasonHtml(data.MKPF_BKTXT_ARR)}</td>
                <td>${tansferNull(data.depot_code)}</td>
                <td>
                  ${countRadio(data.demand_qty, data.actual_receive_qty)}
                </td>
              </tr>`;

    return html;
  }
}

function getShopMergerPickingDetail(wo, materials, so, spo, status, push_type) {
  let materialIds = [];
  materials.forEach(function (item, index) {
    materialIds.push(item.material_id);
  })
  AjaxClient.get({
    url: URLS['order'].getOtherMergerByWorkOrder + "?" + _token + "&work_order_code=" + wo + "&material_ids=" + materialIds.join(','),
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      let tr = '';
      if (rsp.results && rsp.results.length) {
        showInItem(so, spo, materials, status, push_type);
        rsp.results.forEach(function (item, index) {
          tr += `<tr>
                  <td>${item.sales_order_code}</td>
                  <td>${item.product_order_code}</td>
                  <td>${item.material_code}</td>
                  <td>${item.work_order_code}</td>
                  <td>${item.rated_qty}</td>
                  <td>${item.qty}</td>
                </tr>`
        })
      } else {
        showInItem(so, spo, materials, status, push_type);
      }
      let html = `<table class="storage_table item_table table-bordered">
                  <thead>
                    <tr>
                      <th class="thead">销售订单号</th>
                      <th class="thead">生产订单号</th>
                      <th class="thead">物料编码</th>
                      <th class="thead">工单号</th>
                      <th class="thead">计划数量</th>
                      <th class="thead">实收数量</th>
                    </tr>
                  </thead>
                  <tbody class="t-body">
                    ${tr}
                  </tbody>
                </table>`;
      $("#combine_wo").html(html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  })
}

function bindEvent() {
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
                                <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                            </div>`);
        _ele.find('.cause_item:last-child').data("spanData", itemc);
      }
    })
  });
  $("body").on('click', '.audit', function (e) {
    var audit_arr = [],
      flag = true;
    var $employee = $('#employee');
    var employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
      $employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
    $('#show_item .show_item').each(function (k,v) {
      var item = $(v).data('trData');
      var item_id = item.item_id;
      var remark = $(this).find('.remark').val();
      var _ele = $("#material" + item.material_id),
        arr_cause = [];
      _ele.find('.cause_item').each(function (citem) {
        arr_cause.push($(this).data('spanData').preselection_id);
      });
      if (arr_cause.length > 0) {
        audit_arr.push({
          item_id: item_id,
          remark: remark,
          reason: arr_cause.join(),
        });
      } else {
        LayerConfig('fail', '请补全补料原因！');
        flag = false;
        return;
      }
    })
    if (flag) {
      AjaxClient.post({
        url: URLS['work'].audit,
        data: {
          data: audit_arr,
          employee_id: employee,
          _token: TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          if (rsp.results == 200) {
            layer.confirm("审核成功！", {
              icon: 1,
              title: '提示',
              offset: '250px',
              end: function () {}
            }, function (index) {
              layer.close(index);
              self.location = document.referrer;
              // window.location.reload();
            });
          }
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message)
        }
      }, this)
    }
  });

  $("body").on('click', '.anti-audit', function (e) {
    var data = {
      'id': id,
      '_token': TOKEN
    };
    AjaxClient.post({
      url: URLS['order'].blCounterTrial,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        if (rsp.results == 200) {
          // LayerConfig('success','审核成功')
          layer.confirm("反审成功！", {
            icon: 1,
            title: '提示',
            offset: '250px',
            end: function () {}
          }, function (index) {
            layer.close(index);
            self.location = document.referrer;
            // window.location.reload();
          });
        }
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message)
      }
    }, this)

  });

  $("body").on('click', '.audit-item', function (e) {
    var audit_arr = [],arr_cause=[],
      flag = true;
    var $employee = $('#employee');
    var employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
      $employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
    var item_id=$(this).attr('data-id');
    var data_material=JSON.parse($(this).attr('data-material'));
    data_material.MKPF_BKTXT_ARR.forEach(function(item,index){
      arr_cause.push(item.id);
    })
      if (arr_cause.length > 0) {
        audit_arr.push({
          item_id: item_id,
          remark: data_material.diff_remark,
          reason: arr_cause.join(),
        });
      } else {
        LayerConfig('fail', '当前补料单没有请补全补料原因！');
        flag = false;
        return;
      }
    
    if (flag) {
      AjaxClient.post({
        url: URLS['work'].audit,
        data: {
          data: audit_arr,
          employee_id: employee,
          _token: TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          if (rsp.results == 200) {
          LayerConfig('success','审核成功')
            layer.confirm("审核成功！", {
              icon: 1,
              title: '提示',
              offset: '250px',
              end: function () {}
            }, function (index) {
              layer.close(index);
              self.location = document.referrer;              
            });
          }
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message)
        }
      }, this)
    }
  });

  $("body").on('click', '.item-anti-audit', function (e) {
    var id=$(this).attr('data-id');
    var data = {
      'id': id,
      '_token': TOKEN
    };
    AjaxClient.post({
      url: URLS['order'].blCounterTrial,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        if (rsp.results == 200) {
          layer.confirm("反审成功！", {
            icon: 1,
            title: '提示',
            offset: '250px',
            end: function () {}
          }, function (index) {
            layer.close(index);
            self.location = document.referrer;
            // window.location.reload();
          });
        }
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message)
      }
    }, this)

  });

  //确认删除补料单
  $("body").on('click', '.confirmDeletion', function (e) {
    layer.confirm('将执行删除操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {}
    }, function (index) {
      layer.close(index);
      AjaxClient.post({
        url: URLS['work'].feedingListdelete,
        data: {
          id: id,
          _token: TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          if (rsp.results == 200) {
            layer.confirm("删除成功！", {
              icon: 1,
              title: '提示',
              offset: '250px',
              end: function () {}
            }, function (index) {
              layer.close(index);
              self.location = document.referrer;
              // window.location.reload();
            });
          }
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message)
        }
      }, this)
    });
  });

  //  qc 驳回删除补料单
  $("body").on('click', '.rejectDeletion', function (e) {
    layer.confirm('将执行驳回删除操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {

      }
    }, function (index) {
      layer.close(index);
      AjaxClient.post({
        url: URLS['work'].feedingListrepulse,
        data: {
          id: id,
          _token: TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          if (rsp.results == 200) {
            layer.confirm("驳回成功！", {
              icon: 1,
              title: '提示',
              offset: '250px',
              end: function () {}
            }, function (index) {
              layer.close(index);
              self.location = document.referrer;
              // window.location.reload();
            });
          }
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message)
        }
      }, this)
    });
  });

  $('body').on('click', '.print', function (e) {
    e.stopPropagation();
    $("#addSBasic_form").print();
  })
}

function showCause(id) {
  var _ele = $("#material" + id),
    arr_couse = [];
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
        if (item.preselection_id == itemc) {
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
      var tr = `<tr>
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

//进料
function showInItem(code, line, data, status, push_type) {
  if (push_type == 1) {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    $('#deport').hide();
    var readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }
    data.forEach(function (item, index) {
      let qcReasonHtml = showQCReasonHtml(item.qc_reason);
      var tr = `<tr data-id="${item.item_id}" class="show_item">
                  <td >
                    ${item.special_stock == 'E' ? `<div>
                      <p>销售订单号：${code}</p>
                      <p>行项目号：${line}</p>
                    </div>`: ''}
                  </td>
                  <td>${tansferNull(item.material_code)}</td>
                  <td>${tansferNull(item.material_name)}</td>
                  <td>${tansferNull(item.rated_qty)}</td>
                  <td>
                    <input ${readonly1}  type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                  </td>	
                  <td>${tansferNull(item.demand_unit)}</td>	
                  <td>
                    ${countRadio(item.rated_qty, item.demand_qty)}
                  </td>
                  ${type == 7 ? `<td style="padding: 3px;">
                    <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                    <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                  </td>
                  <td>
                      <div style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" class="Qc_Reason">
                        ${qcReasonHtml}
                      </div>
                  </td>
                  <td>
                    <textarea name="remark" class="remark" id="" cols="15" rows="5" style="line-height: 20px;">${item.remark}</textarea>
                  </td>`: ''}  
                  <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="${item.item_id}" style="font-size: 2em;"></i></td>
                </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", item);
      var _ele = ele.find('tr:last-child .MKPF_BKTXT');
      item.reason.forEach(function (i) {
        let itemc = {
          preselection_id: i.id,
          description: i.description,
          name: i.name,
        }
        _ele.append(`<div class="cause_item" style="height: 20px;">
                      <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                    </div>`);
        _ele.find('.cause_item:last-child').data("spanData", itemc);
      })
    })
  } else {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    $('#deport').show();
    $('#totalNum').show();
    $('#totalRadio').show();
    $('#operation').hide();
    var readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }
    data.forEach(function (item, index) {
      batches = item.batches;
      var bl_qty = 0;
      batches.forEach(function (bitem, bindex) {
        bl_qty += Number(bitem.actual_receive_qty);
      })
      let qcReasonHtml = showQCReasonHtml(item.qc_reason);
      var tr = `<tr data-id="${item.item_id}" class="show_item">
                  <td>
                  ${item.special_stock == 'E' ? `<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>`: ''}
                  </td>
                  <td >${tansferNull(item.material_code)}</td>
                  <td >${tansferNull(item.material_name)}</td>
                  <td >${tansferNull(item.rated_qty)}</td>
                  <td >
                    <input ${readonly1}  type="number" min="0" readonly style="line-height: 40px;width:80px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(bl_qty.toFixed(2))}">
                  </td>	
                  <td >${tansferNull(item.demand_unit)}</td>
                  <td >${tansferNull(item.depot_code)}</td>	
                  <td>
                      ${countRadio(item.rated_qty, bl_qty.toFixed(2))}
                  </td>
                  ${type == 7 ? `<td style="padding: 3px;">
                    <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT"></div>
                    <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                  </td>
                  <td>
                    <div style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" class="Qc_Reason">
                      ${qcReasonHtml}
                    </div>
                  </td>
                  <td>
                      <textarea name="remark" class="remark" id="" cols="15" rows="5" style="line-height: 20px;">${item.diff_remark}</textarea>
                  </td>
                  <td>
                      ${tansferNull(item.all_bl_aty)}
                  </td>
                  <td>
                      ${countTotalRadio(item.rated_qty,Number(item.all_bl_aty).toFixed(2))}
                  </td>`: ''}
                </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", item);
      var _ele = ele.find('tr:last-child td .MKPF_BKTXT');
      item.MKPF_BKTXT_ARR.forEach(function (i) {
        let itemc = {
          preselection_id: i.id,
          description: i.description,
          name: i.name,
        }
        _ele.append(`<div class="cause_item" style="height: 20px;">
                      <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                    </div>`);
        _ele.find('.cause_item:last-child').data("spanData", itemc);
      })
    })
  }
}

function showQCReasonHtml(qcreson) {
  let _html = '';
  if (qcreson && qcreson.length) {
    qcreson.forEach(function (item, index) {
      _html += `<div style="display: inline-block;">${item.name}-${item.description}</div>`;
    })
  }
  return _html;
}

// 计算补料比例
function countRadio(rated_qty, need_qty) {
  var ratio = 0;
  try {
    var demandQty = Number(need_qty) * 100,
      ratedQty = Number(rated_qty) * 100;
    if (ratedQty !== 0) {
      rateArr = String(((demandQty / ratedQty) * 100).toFixed(7)).split('.');
      ratio = rateArr[0] + '.' + rateArr[1].substring(0, 2) + '%';
      // ratioDecimal = String(((demandQty / ratedQty) * 100).toFixed(6)).split('.')[0];
    }
  } catch (e) {
    console.log(e);
  }
  return ratio;
}

function countTotalRadio(rated_qty, all_bl_aty) {
  var ratio = 0;
  try {
    var demandQty = Number(all_bl_aty) * 100,
      ratedQty = Number(rated_qty) * 100;
    if (ratedQty !== 0) {
      rateArr = String(((demandQty / ratedQty) * 100).toFixed(6)).split('.');
      ratio = rateArr[0] + '.' + rateArr[1].substring(0, 2) + '%';
      // ratioDecimal = String(((demandQty / ratedQty) * 100).toFixed(6)).split('.')[0];
    }
  } catch (e) {
    console.log(e);
  }
  return ratio;
}