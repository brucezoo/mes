var id,
  pickingList = '', push_type, type, pageNoItem = 1,
  pageSizeItem = 50;
$(function () {
  id = getQueryString('id');

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
    url: URLS['order'].workPick + "?" + _token + "&material_requisition_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      pickingList = rsp.results;
      type = rsp.results.type;
      showPrintList(pickingList);
      push_type = rsp.results.push_type;
      $('#status').val(rsp.results.status);
      if (rsp.results.type == 1) {
        if (rsp.results.status == 3) {
          $('.save').text('');
          $('.save').text('入库');
        }
        if (rsp.results.push_type == 2) {
          $('#picking_title').text('车间领料单');
        } else if (rsp.results.push_type == 1) {
          $('#picking_title').text('SAP领料单');
        } else if (rsp.results.push_type == 0) {
          $('#picking_title').text('线边仓领料单');
        }
        if (rsp.results.status == 4 || rsp.results.status == 2 || rsp.results.status == 1) {
          $('.save').hide();
        } else {
          $('.save').show();
        }
        if (rsp.results.status == 2) {
          $('.delete').show();
        }
        if (rsp.results.push_type == 0) {
          $('.save').hide();
        }
        $('#basic_form_show').html(`<div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">工单</label>
                            <input type="text" id="wo_number" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">单号</label>
                            <input type="text" id="code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    
                     
                    
                    ${rsp.results.push_type == 2 ? '' : `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">采购仓储</label>
                            <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入采购仓储" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>`}
                    ${rsp.results.push_type == 1 ? `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">生产订单号</label>
                            <input type="text" id="po_number" readonly class="el-input" placeholder="请输入生产订单号" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>` : ''}
                    ${rsp.results.push_type != 1 ? `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">配送时间</label>
                            <input type="text" id="show_date" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>` : ''}
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
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">需求库存地点</label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" id="storage_wo" readonly class="el-input" placeholder="请输入需求库存地点" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    ${rsp.results.push_type == 1 ? `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">配送时间</label>
                            <input type="text" id="show_date" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>` : ''}
                               
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
                                        <label class="el-form-item-label">责任人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="employee" readonly class="el-input" placeholder="请输入责任人" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">计划时间</label>
                                        <input type="text" id="plan_start_time" readonly class="el-input"  value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                               
                               
                            </div>`);
        $('#status').val(rsp.results.status);
        $('#workbench_code').val(rsp.results.workbench_name);
        $('#show_date').val(rsp.results.dispatch_time);
        $('#send_depot').val(rsp.results.send_depot);
        $('#wo_number').val(rsp.results.work_order_code);
        $('#code').val(rsp.results.code);
        $('#storage_wo').val(rsp.results.line_depot_name);
        $('#plan_start_time').val(rsp.results.plan_start_time);
        $('#storage_wo_send').val(rsp.results.send_depot_name);
        $('#po_number').val(rsp.results.product_order_code);
        $('#employee').val(rsp.results.employee_name);
        if (rsp.results.push_type == 1) {
          $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
          $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
        }
        $('#sales_order_code').val(rsp.results.sales_order_code);
        $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
        if (rsp.results.materials) {
          showInItem(rsp.results.sales_order_code, rsp.results.sales_order_project_code, rsp.results.materials, rsp.results.status, rsp.results.push_type);
        }
        if (rsp.results.status == 4) {
          $('.save').hide();
        }

      }
      if (rsp.results.type == 2) {
        if (rsp.results.status == 1) {
          $('.save').text('');
          $('.save').text('出库');
        } else {
          $('.save').hide();
        }
        if (rsp.results.push_type == 2) {
          $('#picking_title').text('车间退料单');
          if (rsp.results.status == 2) {
            $('.save').text('');
            $('.save').text('确认退料');
            $('.save').show();
          }

        } else if (rsp.results.push_type == 1) {
          $('#picking_title').text('SAP退料单');
        } else if (rsp.results.push_type == 0) {
          $('#picking_title').text('线边仓退料单');
        }
        $('#basic_form_show').html(`<div>
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
                            <label class="el-form-item-label">计划时间</label>
                            <input type="text" id="plan_start_time" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                      
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">单号</label>
                                <input type="text" id="code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>   
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人</label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" readonly id="employee" class="el-input" placeholder="请输入责任人" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
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
                        
                    </div>`);
        $('#storage_wo').val(rsp.results.line_depot_name + '（' + rsp.results.line_depot_code + '）');
        $('#po_number').val(rsp.results.product_order_code);
        $('#code').val(rsp.results.code);
        $('#workbench_code').val(rsp.results.workbench_name);
        $('#plan_start_time').val(rsp.results.plan_start_time);
        $('#wo_number').val(rsp.results.work_order_code);
        $('#factory').val(rsp.results.factory_name);
        $('#sales_order_code').val(rsp.results.sale_order_project_code);
        $('#employee').val(rsp.results.employee_name);
        if (rsp.results.push_type == 1) {
          $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
          $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
        }
        if (rsp.results.materials) {
          showReturnInItem(rsp.results.materials, rsp.results.status);
        }

      }
      if (rsp.results.type == 7) {
        $(".audit").show();
        $('#cause').show();
        $('#causeRemark').show();
        if (rsp.results.push_type == 2) {
          $('#picking_title').text('车间补料单');
        } else if (rsp.results.push_type == 1) {
          $('#picking_title').text('SAP补料单');
        } else if (rsp.results.push_type == 0) {
          $('#picking_title').text('线边仓补料单');
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
                            <label class="el-form-item-label">工单</label>
                            <input type="text" id="wo_number" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">单号</label>
                            <input type="text" id="code" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                     
                    ${rsp.results.push_type == 2 ? '' : `
                            <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">采购仓储</label>
                                        <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入采购仓储" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>`}
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
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">需求库存地点</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="storage_wo" readonly class="el-input" placeholder="请输入需求库存地点" value="">
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
                                        <label class="el-form-item-label">责任人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="employee" readonly class="el-input" placeholder="请输入责任人" value="">
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                </div>
                                <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">计划时间</label>
                            <input type="text" id="plan_start_time" readonly class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                            </div>`);
        $('#status').val(rsp.results.status);
        $('#send_depot').val(rsp.results.send_depot);
        $('#workbench_code').val(rsp.results.workbench_name);
        $('#wo_number').val(rsp.results.work_order_code);
        $('#plan_start_time').val(rsp.results.plan_start_time);
        $('#code').val(rsp.results.code);
        $('#storage_wo').val(rsp.results.line_depot_name);
        $('#storage_wo_send').val(rsp.results.send_depot_name);
        $('#employee').val(rsp.results.employee_name);
        if (rsp.results.push_type == 1) {
          $('.push_type.yes').parent('.el-radio-input').removeClass('is-radio-checked');
          $('.push_type.no').parent('.el-radio-input').addClass('is-radio-checked');
        }
        $('#sales_order_code').val(rsp.results.sales_order_code);
        $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
        if (rsp.results.materials) {
          showInItem(rsp.results.sales_order_code, rsp.results.sales_order_project_code, rsp.results.materials, rsp.results.status, rsp.results.push_type);
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
function showReturnInItem(data, status) {
  var ele = $('.storage_blockquote .item_table .t-body');
  $('#salere').hide();
  $('#rbqty').hide();
  $('#runit').hide();

  ele.html("");
  data.forEach(function (item, index) {
    var flag = true;
    if (item.batches.length > 0) {
      item.batches.forEach(function (item) {
        if (item.actual_receive_qty > 0) {
          flag = false;
        }
      })
    } else {
      flag = false;
	}
	item.batches[0].remark = item.remark ;
	var piciHtml = createREturnPiciHtml(item.batches)
    var tr = `
            <tr data-id="${item.item_id}" class="show_item">                
            <td >${tansferNull(item.material_code)}</td>
            <td >${tansferNull(item.material_name)}</td>
            <td>
                 ${piciHtml} 
            </td>
            <td>${ status != 1 && flag ? `<i class="fa fa-trash oper_icon delete_speacil_return" title="删除" data-id="${item.item_id}" style="font-size: 2em;"></i>` : ''}</td>         
            </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);

  })

}

function createREturnPiciHtml(data, status, unit) {
  var trs = '';
  if (data && data.length) {
	  console.log(data);
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
			<td>${tansferNull(item.remark)}</td>
			
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
                        <th class="left nowrap tight">退料原因</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
  return thtml;
}

function bindEvent() {
  $('body').on('click', '.save', function (e) {
    e.stopPropagation();
    var msg = '';
    var status = $('#status').val();
    if (status == 1 && pickingList.type == 2) {
      msg = '是否确认出库？';
    } else if (status == 3 && pickingList.type == 1) {
      msg = '是否确认入库？';
    } else {
      msg = '是否确认保存？';
    }
    layer.confirm(msg, {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      submitPickingList(status);
    });

  });
  $('body').on('click', '.table-bordered .delete', function () {
    $(this).parents().parents().eq(0).remove();
    var id = $(this).attr('data-id');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      deleteItem(id);
    });
  });
  $('body').on('click', '.table-bordered .delete_speacil', function () {
    $(this).parents().parents().eq(0).remove();
    var id = $(this).attr('data-id');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      deleteItemSpeacil(id);
    });
  });

  //删除行项
  $('body').on('click', '.delete:not(.is-disabled)', function (e) {
    e.stopPropagation();

    layer.confirm("确认删除未发料行项？", {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      deletePickingNotSendLine();
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
                                <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                            </div>`);
        _ele.find('.cause_item:last-child').data("spanData", itemc);
      }
    })
  });
  $('body').on('click', '.print', function (e) {
    e.stopPropagation();
    $("#print_list").show();
    $("#print_list").print();
    $("#print_list").hide();

  })
  $('body').on('click', '.table-bordered .delete_speacil_return', function () {
    $(this).parents().parents().eq(0).remove();
    var id = $(this).attr('data-id');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      deleteItemSpeacilReturn(id);
    });
  });
}
function deleteItemSpeacilReturn(id) {
  AjaxClient.get({
    url: URLS['work'].DeleteRetreatRowitem + '?' + _token + '&item_id=' + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '删除成功！', function () {
        window.location.reload();
      });

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '删除失败！', function () {
        window.location.reload();
      })
    }
  }, this)
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


//按单删除未发料行项
function deletePickingNotSendLine() {
  AjaxClient.post({
    url: URLS['work'].deletePickingNotSendLine,
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
      LayerConfig('success', '删除成功！', function () {
        window.location.reload();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message, function () {
        window.location.reload();
      })
    }
  }, this)
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

function submitPickingList(status) {
  var data = {};
  var url = '';
  if (status == 1) {
    var pickItems = [];
    $('#show_item .show_item').each(function (k, v) {
      pickItems.push({
        item_id: $(v).attr('data-id'),
        demand_qty: $(v).find('.demand_qty').val(),
      })
    });

    data = {
      material_requisition_id: id,
      demands: pickItems,
      _token: TOKEN
    };
    url = URLS['work'].updateItem;
  } else {
    var flag = true;
    if (push_type == 2) {
      var pickItems = [];
      $('#work_order_table .table_tbody tr').each(function (k, v) {
        pickItems.push({
          batch_id: $(v).attr('data-id'),
          actual_receive_qty: $(v).find('.actual_receive_qty').val(),
        })
      })
      data = {
        material_requisition_id: id,
        status: status,
        type: type,
        batches: pickItems,
        _token: TOKEN
      };
      url = URLS['work'].workShopConfirmAndUpdate;
    } else {
      var pickItems = [];
      $('#work_order_table .table_tbody tr').each(function (k, v) {
        pickItems.push({
          batch_id: $(v).attr('data-id'),
          actual_receive_qty: $(v).find('.actual_receive_qty').val(),
        })
      });
      $("#show_item .show_item").each(function (k, v) {
        if ($(v).find('#work_order_table .table_tbody .work_order_table_item').length == 0) {
          flag = false;
          return;
        }
      });
      data = {
        material_requisition_id: id,
        batches: pickItems,
        _token: TOKEN
      };
      url = URLS['work'].updateActualReceive;
    }

  }
  var msg = '';
  if (status == 1 && pickingList.type == 2) {
    msg = '出库成功';
  } else if (status == 3 && pickingList.type == 1) {
    msg = '入库成功';
  } else {
    msg = '保存成功';
  }

  // if (flag) {
  AjaxClient.post({
    url: url,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results == 200) {
        layer.confirm(msg, {
          icon: 1, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
          window.location.reload();
        });
      }

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
  // } else {
  //     layer.confirm('数据没到齐！', {
  //         icon: 3, title: '提示', offset: '250px', end: function () {
  //         }
  //     }, function (index) {
  //         layer.close(index);
  //     });
  // }

}

function deleteItem(id) {
  AjaxClient.post({
    url: URLS['work'].deleteItem,
    data: {
      item_id: id,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '删除成功！', function () {
        window.location.reload();
      })

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '删除失败！', function () {
        window.location.reload();
      })
    }
  }, this)
}

function deleteItemSpeacil(id) {
  AjaxClient.get({
    url: URLS['work'].sapdelete + "?" + _token + "&item_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '删除成功！', function () {
        window.location.reload();
      });

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '删除失败！', function () {
        window.location.reload();
      })
    }
  }, this)
}

//进料
function showInItem(code, line, data, status, push_type) {
  if (push_type == 1) {
    //sap
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    $('#deport').hide();
    $('.show_all_old').show();
    if(data[0].reason&&data[0].reason.length){
      $('.show_feeding').show();
    }
    if(data[0].remark){
      $('.remark').show();
    }
    var flag = false;
    var readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }
    data.forEach(function (item, index) {

      var piciHtml = createPiciHtml(item.batches, status, '', push_type);

      var isDelete = item.item_is_delete ? 'style="background:#F56C6C;"' : '';
      var span='';
      if(item.reason&&item.reason.length){
        item.reason.forEach(function(value){
          span+=`<span>${value.name}--${value.description}</span><br/>`
        })
      }
      var tr = `
                    <tr data-id="${item.item_id}" class="show_item" ${isDelete}>
                     <td >
                                    ${item.special_stock == 'E' ? `<div>
                                            <p>销售订单号：${code}</p>
                                            <p>行项目号：${line}</p>
                                        </div>` : ''}
                                    </td>
                     <td >${tansferNull(item.material_code)}</td>
                    <td >${tansferNull(item.material_name)}</td>
                    <td >${item.item_is_delete ? '终止' : '正常'}</td>
                    <td >${tansferNull(item.old_material_code)}</td>
                    <td >
                          <input ${readonly1}  type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                    </td>	
                    <td >${tansferNull(item.demand_unit)}</td>
                    ${span!=''?`<td >${span}</td>`:''}
                    <td>
                         ${piciHtml} 
                    </td> 
                    ${item.remark!=''?`<td >${item.remark}</td>`:''}
                    <td>${((status == 2 || status == 3) && item.batches.length == 0) ? `<i class="fa fa-trash oper_icon delete_speacil" title="删除" data-id="${item.item_id}" style="font-size: 2em;"></i>` : ''}</td>
                    </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", data);
    })
  } else {
    //车间
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    $('#deport').show();
    $('#operation').hide();
    var readonly1 = '';
    if (status == 2 || status == 3 || status == 4) {
      readonly1 = 'readonly="readonly"';
    }

    data.forEach(function (item, index) {
      var piciHtml = createPiciHtml(item.batches, status, item.demand_unit, push_type);

      var tr = `
                <tr data-id="${item.item_id}" class="show_item">
                <td >
                ${item.special_stock == 'E' ? `<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>` : ''}
                </td>
                <td >${tansferNull(item.material_code)}</td>
                <td >${tansferNull(item.material_name)}</td>
                <td >
                      <input ${readonly1}  type="number" min="0" readonly style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input demand_qty"   value="${tansferNull(item.demand_qty)}">
                </td>	
                <td >${tansferNull(item.demand_unit)}</td>
                <td >${tansferNull(item.depot_code)}</td>	
                <td>
                     ${piciHtml} 
                </td>
                </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", data);

    })
  }


}

function createPiciHtml(data, status, unit, push_type) {
  var readonly2 = '';
  if (status == 4 || (status == 3 && push_type == 2)) {
    readonly2 = 'readonly="readonly"';
  }
  if (status == 4 || (status == 3 && push_type == 1)) {
    readonly2 = 'readonly="readonly"';
  }
  if (push_type == 0) {
    readonly2 = 'readonly="readonly"';
  }

  var flag = false;
  data.forEach(function (item, index) {
    if (item.m_display == 1) {
      flag = true;
    }
  })
  var trs = '';
  if (data && data.length) {
    data.forEach(function (item, index) {

      trs += `
			<tr data-id="${item.batch_id}" class="work_order_table_item">
			<td>${tansferNull(item.order)}</td>
			<td>${tansferNull(item.batch)}</td>
			<td>${tansferNull(item.actual_send_qty)}</td>
			<td>
                <input ${readonly2} type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="el-input actual_receive_qty"   value="${push_type == 1 ? item.actual_send_qty : item.actual_receive_qty}">
            </td>
			<td>${tansferNull(item.bom_unit)}</td>
			${flag ? `<td>${tansferNull(item.m_value)}${tansferNull(item.m_unit)}</td>` : ''}
            </tr>`;
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
                        <th class="left nowrap tight">需求数量</th>
                        <th class="left nowrap tight">实发数量</th>
                        <th class="left nowrap tight">单位</th>
                        ${flag ? `<th class="left nowrap tight">米数</th>` : ''}

                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
  return thtml;
}

function creatSPWHtml(data) {

  var trs = '';
  if (data && data.length) {
    data.forEach(function (item, index) {

      trs += `
			<tr >
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
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
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
  return thtml;
}

function showPrintList(formDate) {
  var materialsArr = [];
  var type_string = formDate.type == 1 ? '领料' : formDate.type == 2 ? '退料' : formDate.type == 7 ? '补料' : '';
  if (formDate.materials.length > 0) {
    materialsArr = formDate.materials;
    var newObj = {
      one: [],
      two: [],
      three: []
    };
    materialsArr.forEach(function (item) {
      if (item.material_code.substr(0, 4) == "6105" || item.material_code.substr(0, 2) == "99") {
        newObj.one.push(item);
      } else if (item.material_code.substr(0, 4) == "6113") {
        newObj.two.push(item)
      } else {
        newObj.three.push(item)
      }
    })
    var plan_start_time = formDate.ctime,
      employee_name = formDate.employee_name,
      send_depot = formDate.send_depot,
      line_depot_name = formDate.line_depot_name,
      product_order_code = formDate.product_order_code,
      work_order_code = formDate.work_order_code,
      cn_name = formDate.cn_name,
      workbench_name = formDate.bench_no,
      sales_order_code = formDate.sales_order_code,
      sales_order_project_code = formDate.sales_order_project_code,
      dispatch_time = formDate.dispatch_time,
      code = formDate.code;
    var tootle = Math.ceil(newObj.one.length / 3) + Math.ceil(newObj.two.length / 3) + Math.ceil(newObj.three.length / 3);
    var index = 1;
    for (var j in newObj) {
      for (var i = 0; i < newObj[j].length; i = i + 3) {
        var _table = `<table style="table-layout：fixed" class="show_border">
                        <thead>
                            <tr>
                                <th style="height: 30px;width:100px;">物料编码</th>
                                <th style="width:100px;">浪潮编码</th>
                                <th  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">物料名称</th>
                                <th>SAP需求数量</th>
                                <th>需求数量</th>
                                <th>BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].old_material_code}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_demand_qty}${newObj[j][i].sap_demand_unit}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_demand_qty}${tansferNull(newObj[j][i].lc_demand_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].demand_qty}${tansferNull(newObj[j][i].demand_unit)}</td>
                                <td >${newObj[j][i].remark}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_demand_qty + newObj[j][i + 1].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_demand_qty + tansferNull(newObj[j][i + 1].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].demand_qty + tansferNull(newObj[j][i + 1].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].remark : ''}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_demand_qty + newObj[j][i + 2].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_demand_qty + tansferNull(newObj[j][i + 2].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].demand_qty + tansferNull(newObj[j][i + 2].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].remark : ''}</td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
                        </tbody>
                      </table>`
        var print_html = `<div style="page-break-after: always;">
                                <div style="display: flex;">
                                    <div style="flex: 1"></div>
                                    <div style="flex: 9"><h3 style="text-align: center;">梦百合家居科技股份有限公司${type_string}单</h3></div>
                                    <div style="flex: 1">
                                        <p style="margin: 0;font-size: 5px;">白联：仓</p>
                                        <p style="margin: 0;font-size: 5px;">红联：财</p>
                                        <p style="margin: 0;font-size: 5px;">黄联：车</p>
                                        <p style="margin: 0;font-size: 5px;">${index}/${tootle}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}日期:</div>
                                            <div style="flex: 2;">${plan_start_time}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">仓库:</div>
                                            <div style="flex: 2;">${send_depot}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">单据编码:</div>
                                            <div style="flex: 2;">${code}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}部门:</div>
                                            <div style="flex: 2;">${line_depot_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}人:</div>
                                            <div style="flex: 2;">${employee_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">工位:</div>
                                            <div style="flex: 2;">${tansferNull(workbench_name)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">销售订单号/行项号:</div>
                                            <div style="flex: 2;">${sales_order_code}/${sales_order_project_code}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">生产订单号:</div>
                                            <div style="flex: 2;">${product_order_code}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">配送时间:</div>
                                            <div style="flex: 2;">${dispatch_time}</div>
                                        </div>
                                    </div>
                                </div>
                                ${_table}
                                <div>
                                <div style="display: flex;height:40px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">发货人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">制单人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;">${cn_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">审批人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>`;
        index++;
        $('#print_list').append(print_html);
      }
    }

  }

}
