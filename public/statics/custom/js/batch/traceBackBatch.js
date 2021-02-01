var material_arr = [], batch_material_arr = [], wo_number = '', wo_materials = '', materials = [], out_material_code_arr = '', layerModal;

$(function () {
  id = getQueryString('id');
  edit = getQueryString('type');
  $('#work_order_form').focus();
  // $('.search').show();
  $('.submit').removeClass('is-disabled');
  $('.submit_SAP').addClass('is-disabled');
  bindEvent();
});

// let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
// scanner.addListener('scan', function (content) {
//   console.log(content);
// });
// Instascan.Camera.getCameras().then(function (cameras) {
//   if (cameras.length > 0) {
//     scanner.start(cameras[0]);
//   } else {
//     console.error('No cameras found.');
//   }
// }).catch(function (e) {
//   console.error(e);
// });

$(window).keydown(function (e) {
  var key = window.event ? e.keyCode : e.which;
  if (key.toString() == "13") {
    var arr = $('#work_order_form').val();
    $('#work_order_form').blur();
    if (arr) {
      var strLen = getByteLen(arr);
      if (strLen > 15) {
        arr_json = JSON.parse(arr).invcode;
        if (material_arr.indexOf(arr_json) != -1) {
          if (batch_material_arr && batch_material_arr.length) {
            batch_material_arr.forEach(function (item) {
              if (item.material_code == arr_json) {
                item.number += 1;
              };
            })
          } else {
            batch_material_arr.push({ "material_code": arr_json, "batch": JSON.parse(arr).batch, "number": 1 });
          }
        } else {
          layer.msg('当前工单不包含当前批次进料！', { icon: 5, offset: '250px', time: 1500 })
        }
        getBatchList();
      } else {
        var flag = false;
        if (arr.indexOf('WO') == 0) {
          wo_number = arr.substr(arr.indexOf('WO'), 15);
          flag = true;
        } else if (arr.indexOf('wo') == 0) {
          wo_number = arr.substr(arr.indexOf('wo'), 15);
          flag = true;
        } else if (arr.indexOf('Wo') == 0) {
          wo_number = arr.substr(arr.indexOf('Wo'), 15);
          flag = true;
        } else if (arr.indexOf('wO') == 0) {
          wo_number = arr.substr(arr.indexOf('wO'), 15);
          flag = true;
        }
        if (wo_number && flag) {
          $('#ready_qty').show();
          getWoList(wo_number);
        }
      }
    }
  }
});

function getByteLen(str) {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    var a = str.charAt(i);
    if (a.match(/[^\x00-\xff]/ig) != null) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

function bindEvent() {
  $('body').on('focus', '#work_order_form', function (e) {
    $('#work_order_form').val('');
  });

  //搜索框失焦
  $('body').on('blur', '#work_order_form', function (e) {
    var arr = $('#work_order_form').val();
    // $('#work_order_form').blur();
    if (arr) {
      var strLen = getByteLen(arr);
      if (strLen > 15) {
        arr_json = JSON.parse(arr).invcode;
        if (material_arr.indexOf(arr_json) != -1) {
          if (batch_material_arr && batch_material_arr.length) {
            batch_material_arr.forEach(function (item) {
              if (item.material_code == arr_json) {
                item.number += 1;
              };
            })
          } else {
            batch_material_arr.push({ "material_code": arr_json, "batch": JSON.parse(arr).batch, "number": 0 });
          }
        } else {
          console.log('当前工单不包含当前批次进料！')
        }
        getBatchList();
      } else {
        var flag = false;
        if (arr.indexOf('WO') == 0) {
          wo_number = arr.substr(arr.indexOf('WO'), 15);
          flag = true;
        } else if (arr.indexOf('wo') == 0) {
          wo_number = arr.substr(arr.indexOf('wo'), 15);
          flag = true;
        } else if (arr.indexOf('Wo') == 0) {
          wo_number = arr.substr(arr.indexOf('Wo'), 15);
          flag = true;
        } else if (arr.indexOf('wO') == 0) {
          wo_number = arr.substr(arr.indexOf('wO'), 15);
          flag = true;
        }
        if (wo_number && flag) {
          $('#ready_qty').show();
          getWoList(wo_number);
        }
      }
    }
  });

  //查询按钮
  $('body').on('click', '.search:not(.is-disabled)', function (e) {
    // e.stopPropagation();
    if (edit != 'edit') {
      var wo_number_text = $('#work_order_form').val();
      if (wo_number_text.indexOf('WO') == 0) {
        wo_number = wo_number_text.substr(wo_number_text.indexOf('WO'), 15);
      } else if (wo_number_text.indexOf('wo') == 0) {
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wo'), 15);
      } else if (wo_number_text.indexOf('Wo') == 0) {
        wo_number = wo_number_text.substr(wo_number_text.indexOf('Wo'), 15);
      } else if (wo_number_text.indexOf('wO') == 0) {
        wo_number = wo_number_text.substr(wo_number_text.indexOf('wO'), 15);
      }
      if (wo_number) {
        $('#ready_qty').show();
        getWoList(wo_number)
      } else {
        layer.msg('请先扫描工单号', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  });

  //消耗数量
  $("body").on('blur', '.consume_num', function (e) {
    e.stopPropagation();
    if (edit != 'edit') {
      var num = $(this).val() - $(this).parent().parent().find('.beath_qty').val();
      $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
    }
  });

  //生成批次
  $("body").on('click', '.generate-batch', function (e) {
    e.stopPropagation();
    showBatchModal();
  })

  //modal确定
  $("body").on('click', '.batch_submit', function (e) {
    e.stopPropagation();
    generateBatch();
  })

  $("body").on('click', '.serial_submit', function (e) {
    e.stopPropagation();
    saveBatchInfo();
  })

  //用料检
  $("body").on('click', '.check-material', function (e) {
    e.stopPropagation();
    var flag = false;
    if (material_arr.length == batch_material_arr.length) {
      material_arr.forEach(function (item) {
        batch_material_arr.forEach(function (bitem) {
          if (item == bitem.material_code) {
            flag = true;
          }else{
            flag=false;
            return;
          }
        })
      })
      if (flag) {
        if ($(".generate-batch").hasClass('is-disabled')) {
          $(".generate-batch").removeClass('is-disabled');
        }
        if ($(".save").hasClass('is-disabled')) {
          $(".save").removeClass('is-disabled');
        }
      } else {
        layer.msg('当前有物料不属于该工单！', { icon: 5, offset: '250px', time: 1500 })
        if ($(".generate-batch").hasClass('is-disabled')) {
          $(".generate-batch").removeClass('is-disabled');
        }
        if ($(".save").hasClass('is-disabled')) {
          $(".save").removeClass('is-disabled');
        }
      }
    } else {
      layer.msg('请先确定是否扫描所有进料！', { icon: 5, offset: '250px', time: 1500 })
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
    $(this).siblings('.el-select-dropdown').width(width);
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

  $('body').on('click', '.save:not(".is-disabled")', function (e) {
    e.stopPropagation();
    // saveBatchInfo();
    saveBatchModal();
  })

  $('body').on('click', '.print-serial', function (e) {
    $("#serial-print-html").print();
  });

  $('body').on('click', '.print-batch', function (e) {
    $("#batch-print-html").print();
    //$("#batch-print").html(`<div >`)
  });
}

function saveBatchModal() {
  var labelWidth = 100;
  layerModal = layer.open({
    type: 1,
    title: '生成序列号',
    offset: '100px',
    area: ['500px', '290px'],
    shade: 0.1,
    shadeClose: false,
    resize: true,
    content: `<form class="viewAttr formModal" id="viewCause">
                  <input type="hidden" id="itemId" value="${id}">
                        <div class="el-form-item" style="height:58px;">
                                    <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;产地</label>
                                          <div class="el-select-dropdown-wrap">
                                      <div class="el-select">
                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                          <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                                          <input type="hidden" class="val_id" id="place" value="">
                                      </div>
                                      <div class="el-select-dropdown">
                                          <ul class="el-select-dropdown-list" id="select-place">
                                            <li data-id="" class="el-select-dropdown-item" class=" el-select-dropdown-item">--请选择--</li>
                                            <li data-id="N" class="el-select-dropdown-item" class=" el-select-dropdown-item">南通</li>
                                            <li data-id="S" class="el-select-dropdown-item" class=" el-select-dropdown-item">苏州</li>
                                          </ul>
                                      </div>
                                  </div>
                              </div>
                              <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                          </div>
                          <div class="el-form-item" style="height:58px;">
                              <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;工厂</label>
                                    <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="factory" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select-serial-factory">
                                      <li data-id="0" class="el-select-dropdown-item" class=" el-select-dropdown-item">0</li>
                                      <li data-id="1" class="el-select-dropdown-item" class=" el-select-dropdown-item">1</li>
                                      <li data-id="2" class="el-select-dropdown-item" class=" el-select-dropdown-item">2</li>
                                      <li data-id="3" class="el-select-dropdown-item" class=" el-select-dropdown-item">3</li>
                                      <li data-id="4" class="el-select-dropdown-item" class=" el-select-dropdown-item">4</li>
                                      <li data-id="5" class="el-select-dropdown-item" class=" el-select-dropdown-item">5</li>
                                      <li data-id="6" class="el-select-dropdown-item" class=" el-select-dropdown-item">6</li>
                                      <li data-id="7" class="el-select-dropdown-item" class=" el-select-dropdown-item">7</li>
                                      <li data-id="8" class="el-select-dropdown-item" class=" el-select-dropdown-item">8</li>
                                      <li data-id="9" class="el-select-dropdown-item" class=" el-select-dropdown-item">9</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                    </div>
                    <div class="el-form-item" style="height:58px;">
                              <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;品牌</label>
                                    <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="brand" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select-brand">
                                      <li data-id="" class="el-select-dropdown-item" class=" el-select-dropdown-item">--请选择--</li>
                                      <li data-id="0" class="el-select-dropdown-item" class=" el-select-dropdown-item">代工</li>
                                      <li data-id="1" class="el-select-dropdown-item" class=" el-select-dropdown-item">自主品牌</li>
                                      <li data-id="2" class="el-select-dropdown-item" class=" el-select-dropdown-item">自主副品牌</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                    </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle" style="width:60px;height:30px;font-size:16px;">取消</button>
                      <button type="button" class="el-button el-button--primary serial_submit" style="width:60px;height:30px;font-size:16px;">确定</button>
                    </div>
                  </div>
              </form>`,
    success: function (layero, index) {
      var serialJsonStr = sessionStorage.getItem('generate_serial_index');
      if(serialJsonStr){
        var serialJson = JSON.parse(serialJsonStr);
        var { factory, place, brand } = serialJson;
      }
      
      if (factory) {
        $('#select-serial-factory .el-select-dropdown-item[data-id=' + factory + ']').click();
      }
      if (place) {
        $('#select-place .el-select-dropdown-item[data-id=' + place + ']').click();
      }
      if (brand) {
        $('#select-brand .el-select-dropdown-item[data-id=' + brand + ']').click();
      }
    }
  })
}

function saveBatchInfo() {
  var batch_material = [], out_material_code = '', out_batch = '', out_qty = '', out_unit_id = '';
  var serialJson = {
    'place': $("#place").val(),
    'factory': $("#factory").val(),
    'brand': $("#brand").val(),
  };
  sessionStorage.setItem('generate_serial_index', JSON.stringify(serialJson));
  materials = [];
  $('#show_out_material .table_tbody tr').each(function (k, v) {
    var _ele = $(v), arr_couse = [];
    var str = arr_couse.join();
    materials.push({
      'material_code': $(v).find('.material-code').text(),
      'batch': $(v).find('.batch-code').text(),
      'qty': $(v).find('.consume_num').val(),
    });
  });
  materials.forEach(function (item) {
    wo_materials.forEach(function (witem) {
      if (item.material_code == witem.material_code) {
        batch_material.push({
          "material_code": witem.material_code,
          "batch": item.batch,
          "qty": item.qty,
          "unit_id": witem.unit_id,
          "type": witem.type
        })
        if (witem.type = 1) {
          out_material_code = witem.material_code;
          out_batch = $("#productBatch").text().trim();
          out_qty = item.qty;
          out_unit_id = witem.unit_id;
        }
      }
    })
  })
  var data = {
    'place': $("#place").val().trim(),
    'factory': $("#factory").val().trim(),
    'brand': $("#brand").val().trim(),
    'sales_order_code': wo_materials[0].sales_order_code,
    'sales_order_line_code': wo_materials[0].sales_order_line_code,
    'production_order_id': wo_materials[0].po_id,
    'production_order_code': wo_materials[0].po_number,
    'work_order_code': wo_materials[0].work_order_code,
    'out_material_code': out_material_code_arr,
    'serial_code': $('#productSerialNum').text(),
    'out_batch': out_batch,
    'out_qty': out_qty,
    'out_unit_id': out_unit_id,
    'all_materials': JSON.stringify(batch_material),
    _token: TOKEN
  };
  if (materials.length) {
    AjaxClient.post({
      url: URLS['batch'].saveBatchData2,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.close(layerModal);
        // LayerConfig('success','序列号生成成功！');
        var result = rsp.results;
        $("#productSerialNum").text(result);
        $("#serial-print-html").JsBarcode(result, {
          width: 2,// 设置条之间的宽度
          height: 60,// 高度
          displayValue: false, // 是否在条形码上下方显示文字
        });
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);
      }
    }, this)
  }
}

//获取工单详情
function getWoList(wo_number) {
  $("#work_order_form").val(wo_number);
  var urlLeft = '';
  material_arr = [];
  urlLeft += '&work_order_code=' + wo_number;
  AjaxClient.get({
    url: URLS['batch'].getWorkorderInfo2 + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      showWoItem(rsp.results);
      wo_materials = rsp.results;
      rsp.results.forEach(function (item) {
        if (item.type == 0) {
          material_arr.push(item.material_code);
        } else {
          out_material_code_arr = item.material_code;
        }
      })
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取工单信息失败，请刷新重试', 2);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//批次信息详情
function getBatchList() {
  // $("#work_order_form").val(wo_number);
  if (batch_material_arr && batch_material_arr.length) {
    showBatchItem();
  }
}

//进料
function showWoItem(data) {
  var _ele = $("#show_in_material .table_tbody");
  _ele.html("");
  if (data && data.length) {
    data.forEach(function (item) {
      var tr = `<tr data-id="${item.po_id}">
                        <td><p style="font-weight:bold;">${tansferNull(item.material_code)}</p></td>
                        <td class="batch">${tansferNull(item.type) == 1 ? `<p style='font-weight:bold;color:red;'>出</p>` : `<p style='font-weight:bold;color:green;'>进</p>`}</td>
                   </tr>`;
      _ele.append(tr);
      _ele.find('tr:last-child').data("trData", item);
    });
    batch_material_arr = [];
    initPage();
    $('#work_order_form').val('');
    $('#work_order_form').focus();
  } else {
    noData('暂无数据', 2)
  }
}

//出料
function showBatchItem() {
  var ele = $('#show_out_material .table_tbody');
  ele.html("");
  batch_material_arr.forEach(function (item, index) {
    var tr = `<tr data-id="">
                  <td class="material-code">${tansferNull(item.material_code)}</td>
                  <td class="batch-code">${tansferNull(item.batch)}</td>
                  <td class="qty"><input type="number" min="0" value="${tansferNull(item.number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:30px;width: 100px;font-size: 24px;"></td>                  
              </tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
    ele.find('tr:last-child .consume_num.deal').keyup();
    $('#work_order_form').val('');
    $('#work_order_form').focus();
  })
}

function showBatchModal() {
  var labelWidth = 100;
  layerModal = layer.open({
    type: 1,
    title: '生成批次',
    offset: '100px',
    area: ['500px', '340px'],
    shade: 0.1,
    shadeClose: false,
    resize: true,
    content: `<form class="viewAttr formModal" id="viewCause">
                  <input type="hidden" id="itemId" value="${id}">
                          <div class="el-form-item" style="height:58px;">
                              <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;工厂</label>
                                    <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="factory_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select-factory">
                                      <li data-id="0" class="el-select-dropdown-item" class=" el-select-dropdown-item">0</li>
                                      <li data-id="1" class="el-select-dropdown-item" class=" el-select-dropdown-item">1</li>
                                      <li data-id="2" class="el-select-dropdown-item" class=" el-select-dropdown-item">2</li>
                                      <li data-id="3" class="el-select-dropdown-item" class=" el-select-dropdown-item">3</li>
                                      <li data-id="4" class="el-select-dropdown-item" class=" el-select-dropdown-item">4</li>
                                      <li data-id="5" class="el-select-dropdown-item" class=" el-select-dropdown-item">5</li>
                                      <li data-id="6" class="el-select-dropdown-item" class=" el-select-dropdown-item">6</li>
                                      <li data-id="7" class="el-select-dropdown-item" class=" el-select-dropdown-item">7</li>
                                      <li data-id="8" class="el-select-dropdown-item" class=" el-select-dropdown-item">8</li>
                                      <li data-id="9" class="el-select-dropdown-item" class=" el-select-dropdown-item">9</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                    </div>
                    <div class="el-form-item" style="height:58px;">
                              <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;产线</label>
                                    <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="workcenter_id" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list" id="select-work-center">
                                      <li data-id="0" class="el-select-dropdown-item" class=" el-select-dropdown-item">0</li>
                                      <li data-id="1" class="el-select-dropdown-item" class=" el-select-dropdown-item">1</li>
                                      <li data-id="2" class="el-select-dropdown-item" class=" el-select-dropdown-item">2</li>
                                      <li data-id="3" class="el-select-dropdown-item" class=" el-select-dropdown-item">3</li>
                                      <li data-id="4" class="el-select-dropdown-item" class=" el-select-dropdown-item">4</li>
                                      <li data-id="5" class="el-select-dropdown-item" class=" el-select-dropdown-item">5</li>
                                      <li data-id="6" class="el-select-dropdown-item" class=" el-select-dropdown-item">6</li>
                                      <li data-id="7" class="el-select-dropdown-item" class=" el-select-dropdown-item">7</li>
                                      <li data-id="8" class="el-select-dropdown-item" class=" el-select-dropdown-item">8</li>
                                      <li data-id="9" class="el-select-dropdown-item" class=" el-select-dropdown-item">9</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                    </div>
                    <div class="el-form-item" style="height:58px;">
                        <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;班组</label>
                            <div class="el-select-dropdown-wrap">
                              <div class="el-select">
                                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                  <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                  <input type="hidden" class="val_id" id="workbench_id" value="">
                              </div>
                              <div class="el-select-dropdown">
                                  <ul class="el-select-dropdown-list" id="select-work-bench">
                                    <li data-id="0" class="el-select-dropdown-item" class=" el-select-dropdown-item">0-早</li>
                                    <li data-id="8" class="el-select-dropdown-item" class=" el-select-dropdown-item">8-中</li>
                                    <li data-id="9" class="el-select-dropdown-item" class=" el-select-dropdown-item">9-晚</li>
                                    <li data-id="1" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班1</li>
                                    <li data-id="2" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班2</li>
                                    <li data-id="3" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班3</li>
                                    <li data-id="4" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班4</li>
                                    <li data-id="5" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班5</li>
                                    <li data-id="6" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班6</li>
                                    <li data-id="7" class="el-select-dropdown-item" class=" el-select-dropdown-item">加班7</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                      <p class="errorMessage" style="padding-left: ${labelWidth}px;display:block;"></p>
                  </div>
                  <div class="el-form-item" style="height:58px;">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 100px;">时间</label>
                        <input type="text" style="background-color: #fff !important;" id="time" readonly class="el-input" placeholder="时间" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 100px; display: none;">请选择开始时间</p>
                  </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle" style="width:60px;height:30px;font-size:16px;">取消</button>
                      <button type="button" class="el-button el-button--primary batch_submit" style="width:60px;height:30px;font-size:16px;">确定</button>
                    </div>
                  </div>
              </form>`,
    success: function (layero, index) {
      var date = new Date();
      var dateVal = dateFormat(date / 1000, 'Y-m-d');
      $("#time").val(dateVal);
      var batchJsonStr = sessionStorage.getItem('generate_batch_index');
      if(batchJsonStr){
        var batchJson = JSON.parse(batchJsonStr);
        var { factory_id, workcenter_id, workbench_id } = batchJson;
      }
      
      if (factory_id) {
        $('#select-factory .el-select-dropdown-item[data-id=' + factory_id + ']').click();
      }
      if (workcenter_id) {
        $('#select-work-center .el-select-dropdown-item[data-id=' + workcenter_id + ']').click();
      }
      if (workbench_id) {
        $('#select-work-bench .el-select-dropdown-item[data-id=' + workbench_id + ']').click();
      }
    }
  })
}

//生成批次
function generateBatch() {
  var batchJson = {
    'workcenter_id': $("#workcenter_id").val(),
    'factory_id': $("#factory_id").val(),
    'workbench_id': $("#workbench_id").val(),
  };
  sessionStorage.setItem('generate_batch_index', JSON.stringify(batchJson));
  var urlLeft = '';
  urlLeft += '&place=' + $("#workcenter_id").val() + '&factory=' + $("#factory_id").val() + '&work_group=' + $("#workbench_id").val() + '&date=' + $("#time").val()+'&out_material_code='+out_material_code_arr;
  AjaxClient.get({
    url: URLS['batch'].createBatchCode2 + '?' + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      var result = rsp.results;
      $("#productBatch").text(result);
      var batchJson = {
        "invcode": out_material_code_arr,
        "qty": "29",
        "batch": result,
        "weight": "0",
        "mdate": "2019-10-14-16:42:00.00",
        "width": "200"
      }
      var qrcodebatch = new QRCode(document.getElementById("batch-print-html"), {
        width: 70,
        height: 70,
        correctLevel: QRCode.CorrectLevel.L
      });
      makeCode(JSON.stringify(batchJson), qrcodebatch);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail',rsp.message);
    }
  })
}

//二维码
function makeCode(str, qrcode) {
  qrcode.makeCode(str);
}

function initPage() {
  $("#show_out_material .table_tbody").html('');
  $("#productSerialNum").html('');
  $("#serial-print-html").html('');
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