var pageNo = 1,
  pageSize = 50,
  line_depot_id,
  out_flag = 1,
  id = 0,
  edit = '',
  pageNo = 1,
  pageSize = 50,
  pageNoItem = 1,
  pageSizeItem = 50;
var arr = [];
var day2 , s2;
var gys_is_checked = [];
$(function () {
  id = getQueryString('id');
  edit = getQueryString('type');
  if (id == null) {
    // $('#work_order_form').focus();
    $('.search').show();
    $('.submit').removeClass('is-disabled');
    $('.submit_SAP').addClass('is-disabled');
  } else {
    getBusteWorkForm(id);
    $('.search').hide();
    $('.submit').addClass('is-disabled');
    $('.submit_SAP').removeClass('is-disabled');
  }
  bindEvent();
});


$(window).keydown(function (e) {
  var key = window.event ? e.keyCode : e.which;
  if (key.toString() == "13") {
    var arr = $('#work_order_form').val();
    $('#work_order_form').blur();
    //wo_number = arr.substr(arr.indexOf('WO'), 15);
    if(arr.indexOf('WO')==0){
      wo_number = arr.substr(arr.indexOf('WO'), 15);
    }else if(arr.indexOf('wo')==0){
      wo_number = arr.substr(arr.indexOf('wo'), 15);
    }else if(arr.indexOf('Wo')==0){
      wo_number = arr.substr(arr.indexOf('Wo'), 15);
    }else if(arr.indexOf('wO')==0){
      wo_number = arr.substr(arr.indexOf('wO'), 15);
    }
    $('#JsBarcode').JsBarcode(wo_number);

    if (wo_number) {
      $('#ready_qty').show();
      getBusteList(wo_number)
    }
  }
});

function bindEvent() {
  // $('body').on('blur', '#work_order_form', function (e) {
  //   if (edit != 'edit') {
  //     var arr = $('#work_order_form').val();
  //     wo_number = arr.substr(arr.indexOf('WO'), 15);
  //     $('#JsBarcode').JsBarcode(wo_number);
  //     if (wo_number) {
  //       $('#ready_qty').show();
  //       getBusteList(wo_number)
  //     }
  //   }
  // });

  $('body').on('focus', '#work_order_form', function (e) {
    $('#work_order_form').val('');
  });

  //查询按钮
  $('body').on('click', '.search:not(.is-disabled)', function (e) {
    // e.stopPropagation();
    if (edit != 'edit') {
      var wo_number_text = $('#work_order_form').val();
      if(wo_number_text.indexOf('WO')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('WO'), 15);
      }else if(wo_number_text.indexOf('wo')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wo'), 15);
      }else if(wo_number_text.indexOf('Wo')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('Wo'), 15);
      }else if(wo_number_text.indexOf('wO')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wO'), 15);
      }
      $('#JsBarcode').JsBarcode(wo_number);
      if (wo_number) {
        $('#ready_qty').show();
        getBusteList(wo_number)
      } else {
        layer.msg('请先扫描工单号', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  });

  //打印按钮
  $('body').on('click','.print:not(.is-disabled)',function(e){
    if (edit != 'edit') {
      var wo_number_text = $('#work_order_form').val();
      // wo_number = wo_number_text.substr(wo_number_text.indexOf('WO'), 15);
      if(wo_number_text.indexOf('WO')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('WO'), 15);
      }else if(wo_number_text.indexOf('wo')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wo'), 15);
      }else if(wo_number_text.indexOf('Wo')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('Wo'), 15);
      }else if(wo_number_text.indexOf('wO')==0){
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wO'), 15);
      }
      $('#JsBarcode').JsBarcode(wo_number);
      if (wo_number) {
		getCarryTapeList(wo_number);
		day2= new Date();
		day2.setTime(day2.getTime());
		var hour = day2.getHours()
		var minu = day2.getMinutes();
		var sec = day2.getSeconds();
		if (hour < 10){
			hour = "0" + hour;
		} 
		if (minu < 10){
			minu = "0" + minu;
		} 
		if (sec < 10){
			sec = "0" + sec;
		}

		s2 = day2.getFullYear() + "-" + (day2.getMonth() + 1) + "-" + day2.getDate() + " " + hour + ":" + minu + ":" + sec;
      } else {
        layer.msg('请先扫描工单号', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  });

  //报工按钮
  $('body').on('click', '.submit:not(.is-disabled)', function (e) {
	e.stopPropagation();

    // var flag = true;
    // var str = '';
    // var count = 0;
    // if (edit == 'edit') {
    //   editBuste();
    // } else {
    //   item_no.forEach(function (nitem) {
    //     $('#show_in_material .table_tbody tr').each(function (k, v) {
    //       var trDataMt = $(v).data('trDataMt');
    //       if (trDataMt.item_no == nitem) {
    //         count += Number($(v).find('.beath_qty').val());
    //       }
    //     });
    //     if (nitem != '99999999') {
    //       if (count.toFixed(3) * 1000 == 0) {
    //         str = nitem + '物料的定额总量等于0,是否强制报工！';
    //         flag = false;
    //         return false;
    //       }
    //     }
    //   });
    //   if (flag) {
    //     addBuste();
    //   } else {
    //     layer.confirm(str, {
    //       icon: 3, title: '提示', offset: '250px', end: function () {
    //         $('.uniquetable tr.active').removeClass('active');
    //       }
    //     }, function (index) {
    //       layer.close(index);
    //       addBuste()
    //     });
    //   }
	// }

	  layer.confirm('请确认所填数据，是否进行预报工操作！', {
		  icon: 3, title: '提示', offset: '250px', end: function () {
		  }
	  }, function (index) {
		  layer.close(index);
		  addBuste();
	  });
  });

  //推送操作
  $('body').on('click', '.submit_SAP:not(.is-disabled)', function (e) {
    e.stopPropagation();

    layer.confirm('您将执行推送操作！?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      checkHasOverDeclare(id);
    });

  });

  //产成品实报数量失去焦点事件
  $('body').on('keyup', '#show_out_material .consume_num.deal', function (e) {
    var len = $("#show_out_material .table_tbody tr").length;
    var realNumber = Number($(this).val()).toFixed(3);
    var planNumber = Number($('#show_out_material .qty').text()).toFixed(3);

    if (len == 1) {
      $("#show_in_material .table_tbody tr").each(function () {
        var this_qty = Number($(this).find('.qty').text());
        var newQty = ((realNumber / planNumber) * this_qty).toFixed(3);
        $(this).find('.beath_qty.deal').val(newQty);
        // $(this).find('.consume_num.deal').val(newQty);
        $(this).find('.difference_num.deal').val(0);
      })
    }
  });

  $('body').on('click', '.select', function (e) {
	e.stopPropagation();
	showCause($(this).attr('data-ids'))
	  
  });

  $('body').on('click', '.el-checkbox_input_check', function () {
    if (edit != 'edit') {
      $(this).toggleClass('is-checked');
    }
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

  //消耗数量
  $("body").on('blur', '.consume_num', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).val() - $(this).parent().parent().find('.beath_qty').val();
      $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

  //额定领料数量
  $("body").on('blur', '.beath_qty', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).parent().parent().find('.consume_num').val() - $(this).val()
      $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

  //已报工单
  $("body").on('click', '.view-report-wo', function (e) {
    e.stopPropagation();
    var wo_number = $("#work_order_form").val();
    if (wo_number) {
      showBusteList(wo_number)
    } else {
      LayerConfig('fail', '请先输入工单号！')
    }
  })


  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
    var width = $(this).width();
    var offset = $(this).offset();
    $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33, left: offset.left });
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
      ele.find('.plan_type_id').val($(this).attr('data-plan-type-id'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });

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

  $('body').on('click', '.btn-group:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });
}

function showBusteList(wo_number) {
  var _html = '';
  layerModal = layer.open({
    type: 1,
    title: '已报工单',
    offset: '50px',
    area: ['1200px', '600px'],
    shade: 0.1,
    shadeClose: false,
    resize: true,
    content: `<form class="viewAttr formModal" id="viewCause">
                  <input type="hidden" id="itemId" value="${id}">
                  <div class="table_page">
                      
                  </div>
                  
              </form>`,
    success: function (layero, index) {
      var urlLeft = '';
      // <div class="el-form-item">
      //             <div class="el-form-item-div btn-group" style="justify-content: center;bottom:10px;">
      //                 <button type="button" class="el-button el-button--primary cause_submit" style="width:100px;height:30px;">确定</button>
      //             </div>
      //         </div>
      urlLeft += '&workOrder_number=' + wo_number;

      urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
      AjaxClient.get({
        url: URLS['work'].pageIndex + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          _html = createHtml(rsp);
          $('.table_page').html(_html);
        }
      })
    }
  })
}

function getCurrentDateZore() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 00:00:00';
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
      if (rsp.results[0].status == 1) {
        $('.submit').addClass("is-disabled");
        $('.submit_SAP').removeClass("is-disabled");
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

      // if (rsp.results && rsp.results.length) {
      //   if (!rsp.results[0].plan_LGPRO) {
      //     var textarea = rsp.results[0].workOrder_number
      //     $('#work_order_form').val(textarea);
      //   } else {
      //     var textarea = rsp.results[0].workOrder_number
      //     $('#work_order_form').val(textarea);
      //   }
      // }
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
    //   if (rsp.results.isover == 1) {
    //     layer.confirm('当前工单已超报，是否继续报工？', {
    //       icon: 3, title: '提示', offset: '250px', end: function () {
    //       }
    //     }, function (index) {
    //       layer.close(index);
    //       submint(id);
    //     });
    //   }
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
        window.location.href = "/Buste/bustePad"
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function addBuste() {
  var employee_id = $('#employee_id').val();
  // if(!employee_id){
  //     LayerConfig('fail','请选择责任人！');
  // }else {
  var flag = true;
  var in_materials = [], out_materials = [];
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
    // if (count.toFixed(3) * 1000 > Number(qty).toFixed(3) * 1000) {
    //   LayerConfig('fail', nitem + '物料的定额总量不能大于计划数量');
    //   flag = false;
    //   return false;
    // }
  });

  $('#show_in_material .table_tbody tr').each(function (k, v) {
    var trData = $(v).data('trData');
    var trDataMt = $(v).data('trDataMt');
    // if (Number($(v).find('.beath_qty').val()).toFixed(3) * 1000 > Number(trData.storage_number).toFixed(3) * 1000) {
    //   LayerConfig('fail', trDataMt.item_no + '物料的额定数量不能大于库存数量')
    //   flag = false;
    //   return false;
    // } else if (Number($(v).find('.consume_num').val()).toFixed(3) * 1000 > Number(trData.storage_number).toFixed(3) * 1000) {
    //   LayerConfig('fail', trDataMt.item_no + '物料的消耗数量不能大于库存数量')
    //   flag = false;
    //   return false;
    // } else {
      if (trDataMt.item_no !== "99999999") {
		var _ele = $(v).find('.MKPF_BKTXT'), arr_couse = [];
        _ele.find('span').each(function (item) {

          arr_couse.push($(this).data('spanData').preselection_id)
        });
        // if($(v).find('.consume_num').val()!=0&&(Number($(v).find('.qty').text()*1000) < (Number($(v).find('.deals').val()*1000)+Number($(v).find('.total-consume').text()*1000)))) {
        //   if ($(v).find('.vals').text() == '') {
        //     layer.alert(trDataMt.item_no + '消耗数量大于计划数量，请填写原因！');
        //     flag = false;
        //     return false;
        //   }
        // }
		var str = arr_couse.join();
		var item = $(v).find('.is3002 p');
		var _spa = '';
		if(item.length != 0) {
			for(let i=0; i<item.length; i++) {
				if(i == 0) {
					_spa = $(item[i]).attr('data-id');
				}else {
					_spa = _spa + ',' + $(item[i]).attr('data-id');
				}
			}
		}else {
			_spa = '';
		}
		

        in_materials.push({
          id: '',
          material_id: $(v).attr('data-id'),
          LGFSB: $(v).attr('data-LGFSB'),
          LGPRO: $(v).attr('data-LGPRO'),
          GMNGA: $(v).find('.consume_num').val(),
          lot: $(v).find('.batch').text(),
          batch_qty: $(v).find('.beath_qty').val(),
          unit_id: $(v).find('.unit').attr('data-unit'),
          qty: $(v).find('.qty').text(),
          conversion: 0,
          MKPF_BKTXT: str,
          diff_remark:$(v).find('.diff_remark').val(),          
          MSEG_ERFMG: $(v).find('.difference_num').val(),
          is_spec_stock: $(v).attr('data-spec_stock') ? $(v).attr('data-spec_stock') : '',
          batch: trData.batch,
          depot_id: trData.depot_id,
          inve_id: trData.inve_id,
		  storage_number: trData.storage_number,
		  leave_qty: $(v).find('.yuLiao').val(),
		  LIFNR: _spa,
		});
		
      }
    // }
  });
  $('#show_out_material .table_tbody tr').each(function (k, v) {
    var $itemPo = $(v).find('.line_depot');
    var line_depot_id = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
      $itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').id : '';
    var line_depot_code = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
      $itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').code : '';
    out_materials.push({
      id: '',
      material_id: $(v).attr('data-id'),
      LGFSB: $(v).attr('data-LGFSB'),
      LGPRO: $(v).attr('data-LGPRO'),
      GMNGA: $(v).find('.consume_num').val(),
      unit_id: $(v).find('.unit').attr('data-unit'),
      conversion: 0,
      qty: $(v).find('.qty').text(),
      line_depot_id: line_depot_id,
      line_depot_code: line_depot_code,
      MKPF_BKTXT: '',
      MSEG_ERFMG: '',
      is_spec_stock: $(v).attr('data-spec_stock') ? $(v).attr('data-spec_stock') : '',
    })
  });
  var workCenter = $('#show_workcenter .work_center_item');
  var workCenterArr = [];
  workCenter.each(function (k, v) {
    workCenterArr.push({
      id: '',
      standard_item_id: $(v).attr('data-id'),
      standard_item_code: $(v).attr('data-code'),
      value: $(v).find('.workValue').val() ? $(v).find('.workValue').val() : '',
    })
  });
  var data = {
    work_order_id: work_order_id,
    routing_node_id: routing_node_id,
    employee_id: employee_id,
    sale_order_code: sales_order_code,
    sales_order_project_code: sales_order_project_code,
    product_order_code: po_number,
    factory_id: factory_id,
    line_depot_id: depot_id,
    start_time: getCurrentDateZore(),
    end_time: getCurrentTime(),
    BUDAT:getCurrentTime,
    in_materials: JSON.stringify(in_materials),
    out_materials: JSON.stringify(out_materials),
    stands: JSON.stringify(workCenterArr),
    is_teco: $('#is_teco').hasClass('is-checked') ? 1 : 0,
    _token: TOKEN
  };
if(flag){
	AjaxClient.post({
	  url: '/WorkDeclareOrder/preStore',
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.confirm('预报工成功！', {
          icon: 1, title: '提示', offset: '250px', end: function () {
          }
        }, function (index) {
          layer.close(index);
          window.location.href = "/Buste/bustePad";
        });
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);
      }
    }, this)
}


//   if (flag) {
//     AjaxClient.post({
//       url: URLS['work'].WorkDeclareOrder,
//       data: data,
//       dataType: 'json',
//       beforeSend: function () {
//         layerLoading = LayerConfig('load');
//       },
//       success: function (rsp) {
//         layer.close(layerLoading);
//         layer.confirm('报工成功！', {
//           icon: 1, title: '提示', offset: '250px', end: function () {
//           }
//         }, function (index) {
//           layer.close(index);
//           window.location.href = "/Buste/bustePad";
//         });
//       },
//       fail: function (rsp) {
//         layer.close(layerLoading);
//         LayerConfig('fail', rsp.message);
//       }
//     }, this)
//   }
}

//获取打印的跟包带详情
function getCarryTapeList(wo_number){
  AjaxClient.get({
    url: URLS['work'].getCarryTape + "?" + _token + "&wo_number="+wo_number,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
	  var result=rsp.results;
	  let time = getTime();
		let _year = time.slice(0,4);
		let _date = time.slice(6,8);
		let _month = time.slice(4, 6);
		let s3 = _year + '-' + _month + '-' + _date;
      $('#showCarryTapes').html('')
      if(rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item){
          // <div style="text-align:center;font-size:24px;">
          //       <span>跟包带</span>
          //     </div>
          var thtml = `<div style="width:200px;height:260px;margin:0;page-break-after: always;font-size:20;">
			  <div class="printContent">
                <h4 style="text-align:left;margin:6px 5px;">${item.po_number}</h4>
                <h4 style="text-align:left;margin:6px 5px;">${item.item_no}</h4>
                <h4 style="text-align:left;margin:6px 5px;">${item.specifications}</h4>
                <h4 style="text-align:left;margin:6px 5px;">进料: ${item.name}</h4>
                <h4 style="text-align:left;margin:6px 5px;">出料: ${item.material_code}</h4>
                <h4 style="text-align:left;margin:6px 5px;">尺寸: ${item.definition}</h4>
                <h4 style="text-align:left;margin:6px 5px;">工位: ${item.work_shift_name} 数量:</h4>
              <!--  <h4 style="text-align:left;margin:6px 5px;"></h4> -->
				<h4 style="text-align:left;margin:6px 5px;">时间: ${s3}</h4>
				<svg id="bar_code"></svg>
			</div></div>`;
			
			$("#showCarryTapes").append(thtml);
			if (item.production_number != '' ) {
				JsBarcode("#bar_code", item.production_number, {
					width: 2,// 设置条之间的宽度
					height: 55,// 高度
					displayValue: true
				});
			}
		
		});
		

		// rsp.results.forEach(function(item){
		// 	var qrcodewt = new QRCode(document.getElementById("qrcode" + item.po_number), {
		// 		width: 60,
		// 		height: 60,
		// 		correctLevel: QRCode.CorrectLevel.L
		// 	});

		// 	makeCode(item.production_number, qrcodewt);
		// })



        $("#showCarryTapes").show();
        $("#showCarryTapes").print();
        $("#showCarryTapes").hide();
      }

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取跟包带信息失败，请刷新重试', 12);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}


// function makeCode(str, qrcode) {
// 	qrcode.makeCode(str);
// }


function getTime() {
	var time = '';
	AjaxClient.get({
		url: '/WorkOrder/beforeHoliday' + '?' + _token,
		dataType: 'json',
		async: false,
		success: function (rsp) {
			time = rsp.results;
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);

	return time;
}

//获取工单详情
function getBusteList(wo_number) {
  $("#work_order_form").val(wo_number);
  var urlLeft = '';

  urlLeft += '&workOrder_number=' + wo_number;

  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['work'].pageIndex + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getWorkOrderform(wo_number);
      array_arr = [];
      rsp.results.forEach(function (item) {
        item.out.forEach(function (oitem) {
          if (array_arr.length > 0) {
            var flagf = true;
            array_arr.forEach(function (a) {
              if (a.name == oitem.item_no) {
                flagf = false;
                a.GMNGA = (Number(a.GMNGA) + Number(oitem.GMNGA)).toFixed(3)
              }
            });
            if (flagf) {
              array_arr.push({
                name: oitem.item_no,
                GMNGA: oitem.GMNGA,
                qty: oitem.qty
              })
            }
          } else {
            array_arr.push({
              name: oitem.item_no,
              GMNGA: oitem.GMNGA,
              qty: oitem.qty
            })
          }

        })
      });
      var str = '';
      array_arr.forEach(function (item) {
        if (Number(item.qty) <= Number(item.GMNGA)) {
          str += "物料" + item.name + "已完成报工。<br/>";
        }
      });
      $("#showNumber").html(str);
      $("#showNumber").show();

      var totalData = rsp.paging.total_records;
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation.unpro').html('');
      }
      // if (rsp.results.length > 0) {
      //   uniteTdCells('work_order_table');
      // }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取领料单列表失败，请刷新重试', 12);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成已报工列表数据
function createHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      trs += `
   <!-- <tr>
    <td style="font-size:18px;" data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.production_order_code)}</td>
    <td style="font-size:18px;" data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
    <td style="font-size:18px;" data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${item.out[0].qty}</td>
    <td style="font-size:18px;" data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}" width="200px;">${item.out[0].name}</td>
    <td style="font-size:18px;">${item.out[0].GMNGA}</td>
    <td style="font-size:18px;">${tansferNull(item.code)}</td>
    <td style="font-size:18px;">${tansferNull(item.ISDD + item.ISDZ)}</td>
    <td style="font-size:18px;">${tansferNull(item.IEDD + item.IEDZ)}</td>
    <td style="font-size:18px;">${tansferNull(formatTime(item.ctime))}</td>
    <td style="font-size:18px;">${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
    <td style="font-size:18px;color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
    </tr> -->
    `;
      // <a class="button pop-button view" href="${viewurl}?id=${item.id}&type=edit">查看</a>	         
    })
  } else {
    trs = '<tr><td colspan="12" class="center">暂无数据</td></tr>';
  }
  var thtml = `<div class="wrap_table_div">
          <table id="work_order_table" class="sticky uniquetable   table-bordered">
              <thead>
                  <tr>
                   <!--   <th class="left nowrap tight">生产订单号</th>
                      <th class="left nowrap tight">工单号</th>
                      <th class="left nowrap tight">计划数量</th>
                      <th class="left nowrap tight">产出品</th>
                      <th class="left nowrap tight">产出品数量</th>
                      <th class="left nowrap tight">报工单号</th>
                      <th class="left nowrap tight">开始执行</th>
                      <th class="left nowrap tight">执行结束</th>
                      <th class="left nowrap tight">创建时间</th>
                      <th class="left nowrap tight">状态</th>
					  <th class="left nowrap tight">报工类型</th> -->
					  
					  <th class="left nowrap tight">责任人</th>
					  <th class="left nowrap tight">供应商</th>
					  <th class="left nowrap tight">差异原因</th>
					  <th class="left nowrap tight">差异备注</th>
					  <th class="left nowrap tight">余料数量</th>
					  <th class="left nowrap tight">消耗数量</th>
					  <th class="left nowrap tight">实报数量</th>
					  <th class="left nowrap tight">预报工登录人</th>
					  <th class="left nowrap tight">预报工时间</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">${trs}</tbody>
          </table>
      </div>
      <div id="pagenation" class="pagenation unpro"></div>`;
  return thtml;
}

//工单form
function getWorkOrderform(wo_number) {
  AjaxClient.get({
    url: URLS['order'].workOrderShow + _token + "&wo_number=" + wo_number,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      work_order_id = rsp.results.work_order_id;
      routing_node_id = rsp.results.routing_node_id;
      sales_order_code = rsp.results.sales_order_code;
      sales_order_project_code = rsp.results.sales_order_project_code;
      po_number = rsp.results.po_number;
      factory_id = rsp.results.factory_id;
      depot_id = rsp.results.depot_id;
      getWorkcenter(rsp.results.workcenter_id);
		getEmployee(rsp.results.workbench_id, '', rsp.results.emplyee_name, rsp.results.emplyee_id);
      $("#wo_attr").html(" 规格:  " + rsp.results.attr);
		$("#sales_order_code").html(" 销售订单号/行号:  " + sales_order_code + '/' + sales_order_project_code);
      in_material = JSON.parse(rsp.results.in_material);
      out_material = JSON.parse(rsp.results.out_material);
      var material_arr = [];
      item_no = [];
      in_material.forEach(function (item) {
        material_arr.push(item.material_id);
        item_no.push(item.item_no);
      });
      line_depot_id = rsp.results.line_depot_id, line_depot_code = rsp.results.line_depot_code, depot_name = rsp.results.depot_name;
      if (material_arr.length > 0) {
        getMaterialBatch(rsp.results.po_number, rsp.results.sales_order_code, rsp.results.wo_number, material_arr);
      } else {
        showOutItem();
      }

      if (rsp.results.operation_info) {
        let opName = rsp.results.operation_info.name;
        $('#operationName').html(opName);
        $('.op-infor').show();
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    }
  }, this)
}

//获取employee
function getEmployee(id, employee_id, name, ids) {
  AjaxClient.get({
    url: URLS['work'].select + "?" + _token + "&workbench_id=" + id,
    dataType: 'json',
    success: function (rsp) {
      if (rsp.results && rsp.results.length) {
        BOMGroup = rsp.results;
		  var lis = '', innerhtml = '';
        rsp.results.forEach(function (item) {
			if (name != item.emplyee_name) {
				lis += `<li data-id="${item.emplyee_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.emplyee_name}</li>`;
			}else {
				$('#employee_id').val(ids);
				$('#inp').val(name);
			}
			

        });
		  innerhtml = `<li data-id="${ids}" class="el-select-dropdown-item selected" class=" el-select-dropdown-item">${name}</li>${lis}`;
        $('.el-form-item.employee').find('.el-select-dropdown-list').html(innerhtml);
      }
      if (employee_id) {
        $('.el-select-dropdown-item[data-id=' + employee_id + ']').click();
        $('.update').show();
      }
    },
    fail: function (rsp) {
      console.log('获取物料清单分组失败');
    }
  }, this);
}

//获取工作中心
function getWorkcenter(id) {
  AjaxClient.get({
    url: URLS['order'].workcenter + "?" + _token + "&workcenter_id=" + id,
    dataType: 'json',
    success: function (rsp) {
      var workCenterHtml = ''
      rsp.results.forEach(function (item) {
        if (item.code == 'ZPP001' || item.code == 'ZPP002') {
        } else {
          workCenterHtml += `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
        }
      });
      $('#show_workcenter').html(workCenterHtml);
      $('#show_workcenter').show();
    },
    fail: function (rsp) {
      console.log('获取车间列表失败');
    }
  });
}

function getMaterialBatch(po, so, wo, mt) {
  AjaxClient.get({
    url: URLS['order'].getMaterialBatch + _token + "&work_order_code=" + wo + "&sale_order_code=" + so + "&product_order_code=" + po + "&material_ids=" + mt + "&line_depot_id=" + line_depot_id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      new_in_material = [];
      in_material.forEach(function (item) {
        var batch_arr = [];
        var materials = rsp.results[item.material_id];
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
				LIFNR: mater.LIFNR
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
      showInItem(new_in_material);
      showOutItem();
      // getWorkOrderform(wo_number,rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      // LayerConfig('fail','获取工单详情失败，请刷新重试')
    }
  }, this)
}

//进料
function showInItem(data) {
	console.log(data);
  var _ele = $("#show_in_material .table_tbody");
  _ele.html("");
  data.forEach(function (item,index) {
	let opt = '';
    if (item.item_no != "99999999") {
      item.batchs.forEach(function (bitem) {
		  opt = '';
		  if (bitem.LIFNR != undefined && bitem.LIFNR.length != 0 ) {
			  bitem.LIFNR.forEach(items => {
				  opt += `<option data-id="${items.NAME1}" value="${items.LIFNR}">${items.NAME1}</option>`;
			  })
		  }

        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock ? item.special_stock : ''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                      <td width="150px;" style="font-size:12px;"><p style="font-weight:bold;font-size:16px;">${tansferNull(item.item_no)}</p>${tansferNull(item.name)}</td>
                      <td class="batch">${bitem.batch}</td>
                      <td class="qty ${tansferNull(item.item_no)}">${item.qty}</td>
                      <td><p><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  placeholder="" class="beath_qty deal" style="line-height:30px;width: 100px;font-size: 24px;"/></p>${tansferNull(bitem.changesum)}  ${tansferNull(bitem.changeunit)}</td>
					  <td class="storage  kuCun">${tansferNull(bitem.storage_number)}</td>
					  <td><input type="number" min="0" max="" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0"  placeholder="" class="yuLiao deal" style="line-height:30px;width: 100px;font-size: 24px;"/></td>
                      <td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.qty}" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                      <td style="padding: 3px;" class="total-consume">${item.total_consume_qty}</td>
                      <td class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
					  <td class="supplier">
					 		<div class="layui-inline">
								<div class="layui-input-inline">
									<div class="layui-input-inline">
										<div id="gys${bitem.inve_id}"  style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" class="MKPF_BKTXT vals isFlag is3002" ></div>
										<button type="button" data-id="${item.material_id}" data-ids="${bitem.inve_id}" class="button pop-button gys_select">选择</button>
									</div>
								</div>
							</div> 
					  </td>
					  <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                      <td style="padding: 3px;">
                          <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}${bitem.inve_id}" class="MKPF_BKTXT" ></div>
                          <button type="button" data-ids="${item.material_id}${bitem.inve_id}" data-id="${item.material_id}" class="button pop-button select">选择</button>
                      </td>
                      <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3" style="font-size:24px;"></textarea></td>
                 </tr>`;
        _ele.append(tr);
		_ele.find('tr:last-child').data("trData", bitem).data("trDataMt", item);
		
      });
    }
  });
  // uniteTdCells('show_in_material');
  // uniteTdCellsitem('show_in_material');
}


/**
 *  供应商选择
 */

$('body').on('click', '.gys_select', function () {
	gys_is_checked = [];
	let id = $(this).attr('data-id');
	let invd = $(this).attr('data-ids');
	let span = $(this).parent().find('#gys' + invd).find('p');
	if (span.length != 0) {
		for (let i = 0; i < span.length; i++) {
			gys_is_checked.push($(span[i]).attr('data-id'));
		}
	}
	layerModal = layer.open({
		type: 1,
		title: '选择供应商',
		offset: '100px',
		area: ['500px', '500px'],
		shade: 0.1,
		shadeClose: false,
		resize: true,
		content: `
                <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table>
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">供应商</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="gys_tbody"></tbody>
                            </table>
                        </div>
                    <div class="el-form-item">
						<div class="el-form-item-div btn-group">
							<button type="button" style="width:100px;height:30px;margin-top:8px;" class="el-button el-button--primary submits" data-ids="${invd}">确定</button>
						</div>
                	</div>
                </div>
                `,
		success: function (layero, index) {

			getGysList(id, gys_is_checked);
		}
	})
})


function getGysList(id, gys_arr) {

	AjaxClient.get({
		url: '/WorkDeclareOrder/getSupplierByIqc' + "?" + _token + '&material_ids=' + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let tr = ''
			rsp.results.forEach(item => {
				tr += `<tr data-id="${item.LIFNR}" data-span="${item.NAME1}">
					<td>${item.NAME1}</td>
					<td class="right">
						<span class="el-checkbox_input el-checkbox_input_check  ${gys_arr.indexOf(item.LIFNR) != -1 ? 'is-checked' : ''}" id="gys${item.LIFNR}"  data-id="${item.LIFNR}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
					</td>
				</tr>`;
			})

			$('.gys_tbody').append(tr);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			console.log(rsp);
		}
	}, this);
}


$('body').on('click', '.submits', function () {

	let tr = $(this).parent().parent().parent().find('.gys_tbody tr'), gys_arr = [];
	let ids = $(this).attr('data-ids');
	$('#gys' + ids).html('');
	for (let i = 0; i < tr.length; i++) {
		if ($(tr[i]).find('#gys' + $(tr[i]).attr('data-id')).hasClass('is-checked')) {
			gys_arr.push($(tr[i]).attr('data-id'));
			$('#gys' + ids).append(`<p class="layui-badge layui-bg-blue" data-id="${$(tr[i]).attr('data-id')}">${$(tr[i]).attr('data-span')}</p>`)
		}
	}
	layer.close(layerModal);

})



$('body').on('change', '.yuLiao', function() {

	var ele = $(this).parent().parent();

	if (Number($(ele).find('.storage').text()) - Number($(ele).find('.yuLiao').val()) < -0.00000001) {
		layer.alert('消耗数量不能为负,请重新填写余料');
	}else{
		$(ele).find('.consume_num').val(Number($(ele).find('.kuCun').text() - $(ele).find('.yuLiao').val()).toFixed(3));

		let num = $(ele).find('.consume_num').val() - $(ele).find('.beath_qty').val();
		$(ele).find('.difference_num').val(num.toFixed(3));
	}

})

//出料
function showOutItem() {
  $('#batch').hide();
  var ele = $('#show_out_material .table_tbody');
  ele.html("");

  out_material.forEach(function (item, index) {
    var tempt = item.material_attributes;
    var inattrs = '';
    tempt.forEach(function (item) {
      inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
    });
    if (array_arr.length > 0) {
      array_arr.forEach(function (aitem) {

        if (item.item_no == aitem.name) {
          var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock ? item.special_stock : ''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                  <td width="150px;" style="font-size:12px;"><p style="font-weight:bold;font-size:16px;">${tansferNull(item.item_no)}</p>${tansferNull(item.name)}</td>
                  <td class="qty"><p>${tansferNull(item.qty)}<p>${tansferNull(item.changesum)}  ${tansferNull(item.changeunit)}</td>
                  <td class="ready_id">${tansferNull(aitem.GMNGA)}</td>
                  <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
                  <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(((item.qty * 1000) - (aitem.GMNGA * 1000)) / 1000 < 0 ? 0 : ((item.qty * 1000) - (aitem.GMNGA * 1000)) / 1000)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                  <td  class="firm" style="padding: 3px;">
                      <div class="el-select-dropdown-wrap">
                              <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${line_depot_id}" value="${line_depot_code}" style="line-height:30px;width: 95%;font-size: 24px;">
                      </div>
                  </td>
              </tr>`;
          ele.append(tr);
          ele.find('tr:last-child').data("trData", item);
          ele.find('tr:last-child .consume_num.deal').keyup();
        }
      })
    } else {
      var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock ? item.special_stock : ''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                  <td width="150px;"  style="font-size:12px;"><p style="font-weight:bold;font-size:16px;">${tansferNull(item.item_no)}</p>${tansferNull(item.name)}</td>
                  <td class="qty"><p>${tansferNull(item.qty)}</p>${tansferNull(item.changesum)}  ${tansferNull(item.changeunit)}</td>
                  <td class="ready_qty">0</td>
                  <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
                  <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(item.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                  <td  class="firm" style="padding: 3px;">
                      <div class="el-select-dropdown-wrap">
                              <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${line_depot_id}" value="${line_depot_code}" style="line-height:30px;width: 100px;font-size: 24px;">
                      </div>
                  </td>
              </tr>`;
      ele.append(tr);
      ele.find('tr:last-child').data("trData", item);
    }

    if (depot_name) {
      $('#line_depot' + out_flag).val(depot_name + '（' + line_depot_code + '）').data('inputItem', { id: line_depot_id, depot_name: depot_name, code: line_depot_code }).blur();
    }
    $('#line_depot' + out_flag).autocomplete({
      url: URLS['work'].storageSelete + "?" + _token + "&is_line_depot=1",
      param: 'depot_name',
      showCode: 'depot_name'
    });
    out_flag++;
  })
}

// 出料
function showOutItemView(data, status) {
  var ele = $('#show_out_material .table_tbody');
  ele.html("");
  data.forEach(function (item, index) {
    var tr = `<tr data-id="${item.material_id}"  data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                      <td style="font-size:12px;"><p style="font-weight:bold;font-size:16px;">${tansferNull(item.material_item_no)}</p><span style="font-size:12px;">${tansferNull(item.material_name)}</span></td>
                      <td>${tansferNull(item.lot)}</td>
                      <td class="qty"><p>${tansferNull(item.qty)}</p>${tansferNull(item.changesum)}  ${tansferNull(item.changeunit)}</td>
                      <td  class="unit"  data-unit="${item.unit_id}">${tansferNull(item.commercial ? item.commercial : '')}</td>
                      <td  class="firm" style="padding: 3px;"><input type="number" ${status != 1 ? 'readonly="readonly"' : ''}  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                      <td  class="firm" style="padding: 3px;">
                          <div class="el-select-dropdown-wrap">
                                   <input type="text"  class="el-input line_depot" ${status != 1 ? 'readonly="readonly"' : ''} id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.line_depot_id}" value="${item.line_depot_code}" style="line-height:30px;width: 100px;font-size: 24px;">
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
                      <td style="font-size:12px;"><p style="font-weight:bold;font-size:16px;">${tansferNull(item.material_item_no)}</p>${tansferNull(item.material_name)}</td>
                      <td class="batch">${tansferNull(item.lot)}</td>
                      <td class="qty ${tansferNull(item.material_item_no)}">${tansferNull(item.qty)}</td>
                      <td class="batch_qty"><p><input type="number" min="0" readonly class="batch_qty deal" value="${tansferNull(item.batch_qty)}" style="line-height:30px;width: 100px;font-size: 24px;"/></p>${tansferNull(item.changesum)}  ${tansferNull(item.changeunit)}</td>
                      <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                      <td  class="unit" data-unit="${item.unit_id}">${tansferNull(item.commercial)}</td>
                      <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="${item.MSEG_ERFMG}" style="line-height:30px;width: 100px;font-size: 24px;"></td>
                      <td  class="firm" style="padding: 3px;"><textarea name="" readonly id="" class="MKPF_BKTXT" cols="20" rows="3">${item.MKPF_BKTXT}</textarea></td>
                  </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  });
  // uniteTdCells('show_in_material');
  // uniteTdCellsitem('show_in_material');
}

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

function showCause(id) {
	console.log(id);
  var _ele = $("#material" + id), arr_couse = [];

  _ele.find('span').each(function (item) {
    arr_couse.push($(this).data('spanData'))
  });
  layerModal = layer.open({
    type: 1,
    title: '选择原因',
    offset: '100px',
    area: ['500px', '510px'],
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
                                  <th class="left nowrap tight" style="font-size:18px;">名称</th>
                                  <th class="left nowrap tight" style="font-size:18px;">备注</th>
                                  <th class="right nowrap tight" style="font-size:18px;">操作</th>
                              </tr>
                              </thead>
                              <tbody class="table_tbody"></tbody>
                          </table>
                      </div>
                      <div id="pagenationItem" class="pagenation bottom-page"></div>
                  </div>
                  <div class="el-form-item">
                  <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle" style="width:60px;height:30px;font-size:16px;">取消</button>
                      <button type="button" class="el-button el-button--primary cause_submit" style="width:60px;height:30px;font-size:16px;">确定</button>
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
    url: URLS['cause'].pageIndex + '?' + _token + urlLeft,
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