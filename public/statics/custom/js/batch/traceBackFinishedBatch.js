var in_material = '',
  out_material = '',
  work_order_code = '',
  batch = '',
  serial_code = '',
  fit_bar_code = '',
  plan_qty = 0,
  wo_materials = [],
  materials = [],
  layerModal;

$(function () {
  work_order_code = getQueryString('wo'),
    batch = getQueryString('batch'),
    material_code = getQueryString('material_code'),
    plan_qty = getQueryString('plan_qty'),
    material_name = getQueryString('material_name');
  getWoList(work_order_code, batch, material_code, material_name)
  $('#work_order_form').focus();
  bindEvent();
});

$(window).keydown(function (e) {
  var key = window.event ? e.keyCode : e.which;
  if (key.toString() == "13") {
    var arr = $('#work_order_form').val();
    $('#work_order_form').blur();
    if (arr) {
      var strLen = getByteLen(arr),
        qrcode = '';
      if (strLen == 15) {
        qrcode = arr.substr(0, 15);
        if (qrcode) {
          fit_bar_code = qrcode;
          getMaterialInfo(qrcode);
        }
      } else {
        layer.msg('请扫描正确的二维码', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
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
  // $('body').on('blur', '#work_order_form', function (e) {
  //   var arr = $('#work_order_form').val();
  //   if (arr) {
  //     var strLen = getByteLen(arr),
  //       qrcode = '';
  //     if (strLen == 15) {
  //       qrcode = arr.substr(0, 15);
  //       if (qrcode) {
  //         fit_bar_code = qrcode;
  //         getMaterialInfo(qrcode);
  //       }
  //     } else {
  //       layer.msg('请扫描正确的二维码', {
  //         icon: 5,
  //         offset: '250px',
  //         time: 1500
  //       });
  //     }
  //   }
  // });

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

  $('body').on('click', '.print-batch:not("is-disabled")', function (e) {
    e.stopPropagation();
    printCode()
  });
  $('body').on('click', '#printWt', function (e) {
    e.stopPropagation();
    saveBatchData();
    $("#dowPrintWt").print();
  })
}

function getMaterialInfo(qrcode) {
  var urlLeft = '';
  urlLeft += '&fit_bar_code=' + qrcode + '&work_order_code=' + work_order_code;
  AjaxClient.get({
    url: URLS['batch'].getInfoByFitBarCode + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      in_material = {
        'type': 0,
        'code': rsp.results.material_code,
        'name': rsp.results.material_name
      };
      serial_code_num=rsp.results.serial_code_num;
      serial_code = rsp.results.serial_code;
      $("#productSerialNum").text(serial_code);
      $("#serial_code_num").text(serial_code_num);
      if (wo_materials.length > 1) {
        if (rsp.results.material_code == wo_materials[1].code) {
          return;
        } else {
          wo_materials.push(in_material);
        }
      } else {
        wo_materials.push(in_material);
      }
      showWoItem(wo_materials);
     
      $(".print-batch").removeClass('is-disabled');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

function updateMaterialInfo(qrcode) {
  var urlLeft = '';
  urlLeft += '&fit_bar_code=' + qrcode + '&work_order_code=' + work_order_code;
  AjaxClient.get({
    url: URLS['batch'].getInfoByFitBarCode + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var serial_code_num=rsp.results.serial_code_num;      
      $("#serial_code_num").text(serial_code_num);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//获取工单详情
function getWoList(wo_number, batch, code, name) {
  $("#productBatch").text(batch);
  wo_materials = [];
  var urlLeft = '';
  material_arr = [];
  out_material = {
    'type': 1,
    'code': code,
    'name': name
  };
  wo_materials.push(out_material)
  showWoItem(wo_materials);
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
  $("#plan_qty").text(plan_qty);
  if (data && data.length) {
    data.forEach(function (item) {
      var tr = `<tr>
                  <td><p style="font-weight:bold;">${tansferNull(item.code)}</p></td>
                  <td><p style="font-weight:bold;">${tansferNull(item.name)}</p></td>
                  <td class="batch">${item.type==0?`<p style='font-weight:bold;color:green;'>进</p>`:`<p style='font-weight:bold;color:red;'>出</p>`}</td>
                </tr>`;
      _ele.append(tr);
      _ele.find('tr:last-child').data("trData", item);
    });
    // batch_material_arr = [];
    // initPage();
    // $('#work_order_form').val('');
    // $('#work_order_form').focus();
  } else {
    noData('暂无数据', 2)
  }
}

function printCode() {
  let print_str_qrcode = {
    "batch": $('#productBatch').text(),
    "serial_code": $('#productSerialNum').text(),
  }
  layerModal = layer.open({
    type: 1,
    title: '打印二维码',
    offset: '200px',
    area: ['380px', '400px'],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="viewAttr formModal" id="viewattr">
              <div class="el-form-item" style="height: 40px;text-align: right;">
                <button data-id="" type="button" class="button el-button" id="printWt">打印</button>
              </div>
              <div id="dowPrintWt" style="cursor:pointer;width: 10cm;height: 7cm;border: 1px;font-size:18px;color:#000;">
                <div style="display: flex;">
                  <div style="flex: 1;">
                    <div id="qrcodewt" class="center" style="width:280px; height:260px;margin:0px auto;">
                      <div id="qrCodeIcowt"></div>
                    </div>
                    
                  </div>
                </div>
                <div style="width:35px;height:35px;position:relative; left:160px; top:-150px;margin:0px;">
                      <img style ="width:35px;height:35px;" alt="" src="/statics/custom/img/miliy_logo.png" />
                    </div>
                <div style="width:200px;margin:0px auto;">
                  ${serial_code}
                </div>
              </div>
            </form>`,
    success: function (layero, index) {
      //二维码
      var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
        width: 250,
        height: 250,
        correctLevel: QRCode.CorrectLevel.L,
        
      });
      makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
    },
    end: function () {
      $('.out_material .item_out .table_tbody').html('');
    }
  })
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

function saveBatchData() {
  var data = {
    "_token": "8b5491b17a70e24107c89f37b1036078",
    "type": 4,
    "in_material_code": in_material.code,
    "batch": batch,
    "work_order_code": work_order_code,
    "out_material_code": out_material.code,
    "serial_code": serial_code,
    "fit_bar_code": fit_bar_code
  };
  AjaxClient.post({
    url: URLS['batch'].saveBatchData,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '保存成功');
      layer.close(layerModal);
      updateMaterialInfo(fit_bar_code);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
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