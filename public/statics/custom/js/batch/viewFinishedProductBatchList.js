var layerModal,
  layerLoading,
  pageNo = 1,
  status = 2;
pageSize = 20,
  work_order_code = '',
  ajaxSerialData = {};
const rank_plan_arr=['白班','夜班'];

$(function () {
  resetSerialParam();
  getWorkCenter();
  bindEvent();
});

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
      getBatchList();
    }
  });
}

// 重置搜索参数
function resetSerialParam() {
  ajaxSerialData = {
    workcenter_id: '',
    workbench_id: '',
    rankplan_id: '',
    order: 'desc',
    sort: 'id'
  };
}

function resetAll() {
  var parentForm = $('#searchForm');
  parentForm.find('#work_center_id').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#work_bench_id').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#rank_plan_id').val('').siblings('.el-input').val('--请选择--');
  pageNo = 1;
  resetSerialParam();
}

function getWorkCenter() {
  var workcenter_id = sessionStorage.getItem('batch_work_center_id');
  AjaxClient.get({
    url: URLS['option'].getWorkCenter + _token+"&type=4",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.workcenter_name}(${item.code})</li>`
        })
        $('.work-center').find('.el-select-dropdown-list').html(_html)
      } else {
        $('.work-center').find('.el-select-dropdown-list').html(_html)
      }
      if (workcenter_id) {
        $('.work-center .el-select-dropdown-item[data-id=' + workcenter_id + ']').click();
      }
      getRankPlan();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getWorkBench(id) {
  const workbench_id = sessionStorage.getItem('batch_work_bench_id');
  AjaxClient.get({
    url: URLS['option'].getWorkBench + _token + '&workcenter_id=' + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.workbench_name}(${item.code})</li>`
        })
        $('.work-bench').find('.el-select-dropdown-list').html(_html)
      } else {
        $('.work-bench').find('.el-select-dropdown-list').html(_html)
      }
      layer.close(layerLoading);
      if (workbench_id) {
        $('.work-bench .el-select-dropdown-item[data-id=' + workbench_id + ']').click();
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getRankPlan() {
  const rankplan_id = sessionStorage.getItem('batch_rank_plan_id');
  AjaxClient.get({
    url: URLS['option'].getRankPlan + _token + '&page_no=1&page_size=20',
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.rankplan_id}" class="el-select-dropdown-item">${item.type_name}</li>`
        })
        $('.rank-plan').find('.el-select-dropdown-list').html(_html)
      } else {
        $('.rank-plan').find('.el-select-dropdown-list').html(_html)
      }
      layer.close(layerLoading);
      if (rankplan_id) {
        $('.rank-plan .el-select-dropdown-item[data-id=' + rankplan_id + ']').click();
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

// 获取列表方法
function getBatchList() {
  let urlSerialLeft = '';
  for (var param in ajaxSerialData) {
    urlSerialLeft += `&${param}=${ajaxSerialData[param]}`;
  }
  urlSerialLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['batch'].getBatchList + _token + urlSerialLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
      $("#batch_list_table .table_tbody").html(_html);
      // if (totalData > pageSize) {
      //   bindPagenationClick(totalData, pageSize);
      // } else {
      //   $('#pagenation.bottom-page').html('');
      // }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('数据加载失败', 7); //，请确认搜索条件是否正确
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

// 获取批次追溯列表html
function createHtml(data) {
  var viewurl = $('#batch_view').val();
  var trs = '';
  if (data && data.results.list && data.results.list.length) {
    data.results.list.forEach(function (item) {
      item.batch = data.results.defalt.batch;
      trs += `
            <tr>
                <td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.production_code)}</td>
                <td>${tansferNull(item.work_order_code)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td style="width:350px;">${tansferNull(item.material_name)}</td>
                <td class="right">
                  <a class="button pop-button view" target="blank" href="${viewurl}?wo=${item.work_order_code}&batch=${item.batch}&plan_qty=${item.plan_qty}&material_code=${item.material_code}&material_name=${item.material_name}">扫码</a>
                </td>
			      </tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="3" class="center">暂无数据</td></tr>';
  }
  return trs;
}

function makeCode(str, qrcode) {
  qrcode.makeCode(str);
}

// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
function dateFormat(timestamp, formats) {
  // formats格式包括
  // 1. Y-m-d
  // 2. Y-m-d H:i:s
  // 3. Y年m月d日
  // 4. Y年m月d日 H时i分
  formats = formats || 'Y-m-d H:i:s.L';

  var zero = function (value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };

  var zeroMili = function (value) {
    if (value < 10) {
      return '00' + value;
    } else if (value >= 10 && value < 100) {
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
  var milisecond = zeroMili(myDate.getMilliseconds());
  return formats.replace(/Y|m|d|H|i|s|L/ig, function (matches) {
    return ({
      Y: year,
      m: month,
      d: day,
      H: hour,
      i: minite,
      s: second,
      L: milisecond
    })[matches];
  });
};

function saveBatchData(code,batch,wo,weight,length,rank_plan_id){
  const material={
    out_material_code:code,
    out_batch:batch,
    work_order_code:wo,
    weight:weight,
    length:length,
    type:1,
    rankplan_id:rank_plan_id,
    '_token':TOKEN
  }
  AjaxClient.post({
    url: URLS['batch'].saveBatchData,
    data: material,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('#printWt').removeClass('is-disabled');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
      $('#printWt').removeClass('is-disabled');
    }
  }, this)
}

function bindEvent() {

  // 点击弹框内部关闭dropdown
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

  // 下拉选择
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
    if ($(this).parents('.el-form-item').hasClass('work-center')) {
      getWorkBench($(this).attr('data-id'));
    }
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

  // 搜索
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // $('#searchForm .el-item-hide').slideUp(400, function () {
    //     $('#searchForm .el-item-show').css('backageground', 'transparent');
    // });
    // $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $(this).parents('#searchForm');
    var correct = 1;

    if (!parentForm.find('#work_center_id').val()) {
      correct = 0;
      $('#work_center_id').parents('.el-form-item').find('.errorMessage').html('*请选择工作中心');
    } else {
      $('#work_center_id').parents('.el-form-item').find('.errorMessage').html('');
    }
    if (!parentForm.find('#work_bench_id').val()) {
      correct = 0;
      $('#work_bench_id').parents('.el-form-item').find('.errorMessage').html('*请选择工位');
    } else {
      $('#work_bench_id').parents('.el-form-item').find('.errorMessage').html('');
    }
    if (!parentForm.find('#rank_plan_id').val()) {
      correct = 0;
      $('#rank_plan_id').parents('.el-form-item').find('.errorMessage').html('*请选择班组');
    } else {
      $('#rank_plan_id').parents('.el-form-item').find('.errorMessage').html('');
    }
    if (correct) {
      if (!$(this).hasClass('is-disabled')) {
        $(this).addClass('is-disabled');
        sessionStorage.setItem('batch_work_center_id', $("#work_center_id").val());
        sessionStorage.setItem('batch_work_bench_id', $("#work_bench_id").val());
        sessionStorage.setItem('batch_rank_plan_id', $("#rank_plan_id").val());
        ajaxSerialData = {
          workcenter_id: encodeURIComponent(parentForm.find('#work_center_id').val().trim()),
          workbench_id: encodeURIComponent(parentForm.find('#work_bench_id').val().trim()),
          rankplan_id: encodeURIComponent(parentForm.find('#rank_plan_id').val().trim()),
          order: 'desc',
          sort: 'id'
        };
        pageNo = 1;
        getBatchList();
      }
    }
  });

  // 重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetAll();
    getBatchList();
  });

  $('body').on('click', '.view-qrcode', function (e) {
    e.stopPropagation();
    let data = JSON.parse($(this).attr('data-item'));
    if (data.weight == 0) {
      const material = {
        work_order_code: data.work_order_code,
        material_id: data.material_id,
        workbench_id: $("#work_bench_id").val(),
        '_token': TOKEN
      }
      AjaxClient.post({
        url: URLS['batch'].getWeight,
        data: material,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          // LayerConfig('success','序列号生成成功！');
          getBatchList();
          data.weight = rsp.results.weight;
          let print_str_qrcode = {
            "invcode": data.material_code,
            "qty": data.qty,
            "batch": data.batch,
            "weight": data.weight,
            "mdate": dateFormat(),
            "width": data.width,
            "high": data.high,
            "wide": data.wide
          }
          layerModal = layer.open({
            type: 1,
            title: '打印二维码',
            offset: '200px',
            area: ['400px', '420px'],
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: false,
            content: `<form class="viewAttr formModal" id="viewattr">
                      <div class="el-form-item" style="height: 40px;text-align: right;">
                        <button data-id="" type="button" class="button el-button" data-material-code="${data.material_code}" data-batch="${data.batch}" data-work-order-code="${data.work_order_code}" data-weight="${data.weight}" data-length="${data.length}" id="printWt">打印</button>
                      </div>
                      <div id="dowPrintWt" style="width: 10cm;height: 7cm;border: 1px;font-size:18px;color:#000;">
                        <div style="display: flex;">
                          <div style="flex: 2;height:">
                            <div class="el-form-item-div" style='width:240px;'>
                              <label class="el-form-item-label" style="width:85px;">物料编码:</label>
                              <div style="font-size:20px;color:#000;">${data.material_code}</div>
                            </div>
                            <div class="el-form-item-div" style='width:240px;'>
                              <label class="el-form-item-label" style="width:85px;">描述:</label>
                              <div style="font-size:18px;color:#000;">${data.material_name}</div>
                            </div>
                            <div class="el-form-item-div" style='width:240px;'>
                              <label class="el-form-item-label" style="width:85px;">批次号:</label>
                              <div style="font-size:22px;color:#000;font-weight:600;">${data.batch}</div>
                            </div>
                          </div>
                          <div style="flex: 1;">
                            <div id="qrcodewt" class="center" style="width:120px; height:120px;">
                              <div id="qrCodeIcowt"></div>
                            </div>
                          </div>
                        </div>
                        <div style="display: flex;">
                          <div style="flex: 1;">
                            <div id="qrcode" class="center" style="width:200px; height:200px;">
                              <div id="qrCodeIco"></div>
                            </div>                            
                          </div>
                          <div style="flex: 1;margin-top:15px;margin-left:15px;">
                            <div class="el-form-item-div" style="padding-bottom:10px;">
                              <label class="el-form-item-label" style="width:85px;">门幅:</label>
                              <div style="font-size:20px;color:#000;">${data.width}</div>
                            </div>
                            <div class="el-form-item-div" style="padding-bottom:10px;">
                              <label class="el-form-item-label" style="width:85px;">长度:</label>
                              <div style="font-size:20px;color:#000;">${data.length}</div>
                            </div>
                            <div class="el-form-item-div" style="padding-bottom:10px;">
                              <label class="el-form-item-label" style="width:85px;">重量:</label>
                              <div style="font-size:20px;color:#000;">${data.weight}</div>
                            </div>
                            <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width:85px;">班组:</label>
                              <div style="font-size:20px;color:#000;">${rank_plan_arr[$('#rank_plan_id').val()-1]}</div>
                            </div>
                          </div>
                        </div>		
                      </div>
                    </form>`,
            success: function (layero, index) {
              //二维码
              var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
                width: 120,
                height: 120,
                correctLevel: QRCode.CorrectLevel.L
              });
              var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 180,
                height: 180,
                correctLevel: QRCode.CorrectLevel.L
              });
              makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
              makeCode(JSON.stringify(print_str_qrcode), qrcode);
            },
            end: function () {
              $('.out_material .item_out .table_tbody').html('');
            }
          })
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message);
        }
      }, this)
    } else {
      layer.confirm('是否获取重量', {
        title: false,
        offset: '250px', //弹框的大小
        btn: ['获取重量', '打印二维码'], //按钮
      }, function (index) {
        layer.close(index);
        const material = {
          work_order_code: data.work_order_code,
          material_id: data.material_id,
          workbench_id: $("#work_bench_id").val(),
          '_token': TOKEN
        }
        AjaxClient.post({
          url: URLS['batch'].getWeight,
          data: material,
          dataType: 'json',
          beforeSend: function () {
            layerLoading = LayerConfig('load');
          },
          success: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('success','序列号生成成功！');
            data.weight = rsp.results.weight;
            let print_str_qrcode = {
              "invcode": data.material_code,
              "qty": data.qty,
              "batch": data.batch,
              "weight": data.weight,
              "mdate": dateFormat(),
              "width": data.width,
              "high": data.high,
              "wide": data.wide
            }
            layerModal = layer.open({
              type: 1,
              title: '打印二维码',
              offset: '200px',
              area: ['400px', '420px'],
              shade: 0.1,
              shadeClose: false,
              resize: false,
              move: false,
              content: `<form class="viewAttr formModal" id="viewattr">
                        <div class="el-form-item" style="height: 40px;text-align: right;">
                          <button data-id="" type="button" class="button el-button" data-material-code="${data.material_code}" data-batch="${data.batch}" data-work-order-code="${data.work_order_code}" data-weight="${data.weight}" data-length="${data.length}" id="printWt">打印</button>
                        </div>
                        <div id="dowPrintWt" style="width: 10cm;height: 7cm;border: 1px;font-size:18px;color:#000;">
                          <div style="display: flex;">
                            <div style="flex: 2;height:">
                              <div class="el-form-item-div" style='width:240px;'>
                                <label class="el-form-item-label" style="width:85px;">物料编码:</label>
                                <div style="font-size:20px;color:#000;">${data.material_code}</div>
                              </div>
                              <div class="el-form-item-div" style='width:240px;'>
                                <label class="el-form-item-label" style="width:85px;">描述:</label>
                                <div style="font-size:18px;color:#000;">${data.material_name}</div>
                              </div>
                              <div class="el-form-item-div" style='width:240px;'>
                                <label class="el-form-item-label" style="width:85px;">批次号:</label>
                                <div style="font-size:22px;color:#000;font-weight:600;">${data.batch}</div>
                              </div>
                            </div>
                            <div style="flex: 1;">
                              <div id="qrcodewt" class="center" style="width:120px; height:120px;">
                                <div id="qrCodeIcowt"></div>
                              </div>
                            </div>
                          </div>
                          <div style="display: flex;">
                            <div style="flex: 1;">
                              <div id="qrcode" class="center" style="width:200px; height:200px;">
                                <div id="qrCodeIco"></div>
                              </div>                              
                            </div>
                            <div style="flex: 1;margin-top:15px;margin-left:15px;">
                              <div class="el-form-item-div" style="padding-bottom:10px;">
                                <label class="el-form-item-label" style="width:85px;">门幅:</label>
                                <div style="font-size:20px;color:#000;">${data.width}</div>
                              </div>
                              <div class="el-form-item-div" style="padding-bottom:10px;">
                                <label class="el-form-item-label" style="width:85px;">长度:</label>
                                <div style="font-size:20px;color:#000;">${data.length}</div>
                              </div>
                              <div class="el-form-item-div" style="padding-bottom:10px;">
                                <label class="el-form-item-label" style="width:85px;">重量:</label>
                                <div style="font-size:20px;color:#000;">${data.weight}</div>
                              </div>
                              <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width:85px;">班组:</label>
                                <div style="font-size:20px;color:#000;">${rank_plan_arr[$('#rank_plan_id').val()-1]}</div>
                              </div>
                            </div>
                          </div>		
                        </div>
                      </form>`,
              success: function (layero, index) {
                //二维码
                var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
                  width: 120,
                  height: 120,
                  correctLevel: QRCode.CorrectLevel.L
                });
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                  width: 180,
                  height: 180,
                  correctLevel: QRCode.CorrectLevel.L
                });
                makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
                makeCode(JSON.stringify(print_str_qrcode), qrcode);
              },
              end: function () {
                $('.out_material .item_out .table_tbody').html('');
              }
            })
          },
          fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message);
          }
        }, this)
      }, function (index) {
        layer.close(index);
        let print_str_qrcode = {
          "invcode": data.material_code,
          "qty": data.qty,
          "batch": data.batch,
          "weight": data.weight,
          "mdate": dateFormat(),
          "width": data.width,
          "high": data.high,
          "wide": data.wide
        }
        layerModal = layer.open({
          type: 1,
          title: '打印二维码',
          offset: '200px',
          area: ['400px', '420px'],
          shade: 0.1,
          shadeClose: false,
          resize: false,
          move: false,
          content: `<form class="viewAttr formModal" id="viewattr">
                    <div class="el-form-item" style="height: 40px;text-align: right;">
                      <button data-id="" type="button" class="button el-button" data-material-code="${data.material_code}" data-batch="${data.batch}" data-work-order-code="${data.work_order_code}" data-weight="${data.weight}" data-length="${data.length}" id="printWt">打印</button>
                    </div>
                    <div id="dowPrintWt" style="width: 10cm;height: 7cm;border: 1px;font-size:18px;color:#000;">
                      <div style="display: flex;">
                        <div style="flex: 2;height:">
                          <div class="el-form-item-div" style='width:240px;'>
                            <label class="el-form-item-label" style="width:85px;">物料编码:</label>
                            <div style="font-size:20px;color:#000;">${data.material_code}</div>
                          </div>
                          <div class="el-form-item-div" style='width:240px;'>
                            <label class="el-form-item-label" style="width:85px;">描述:</label>
                            <div style="font-size:18px;color:#000;">${data.material_name}</div>
                          </div>
                          <div class="el-form-item-div" style='width:240px;'>
                            <label class="el-form-item-label" style="width:85px;">批次号:</label>
                            <div style="font-size:22px;color:#000;font-weight:600;">${data.batch}</div>
                          </div>
                        </div>
                        <div style="flex: 1;">
                          <div id="qrcodewt" class="center" style="width:120px; height:120px;">
                            <div id="qrCodeIcowt"></div>
                          </div>
                        </div>
                      </div>
                      <div style="display: flex;">
                        <div style="flex: 1;">
                          <div id="qrcode" class="center" style="width:200px; height:200px;">
                            <div id="qrCodeIco"></div>
                          </div>
                          
                        </div>
                        <div style="flex: 1;margin-top:15px;margin-left:15px;">
                          <div class="el-form-item-div" style="padding-bottom:10px;">
                            <label class="el-form-item-label" style="width:85px;">门幅:</label>
                            <div style="font-size:20px;color:#000;">${data.width}</div>
                          </div>
                          <div class="el-form-item-div" style="padding-bottom:10px;">
                            <label class="el-form-item-label" style="width:85px;">长度:</label>
                            <div style="font-size:20px;color:#000;">${data.length}</div>
                          </div>
                          <div class="el-form-item-div" style="padding-bottom:10px;">
                            <label class="el-form-item-label" style="width:85px;">重量:</label>
                            <div style="font-size:20px;color:#000;">${data.weight}</div>
                          </div>
                          <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width:85px;">班组:</label>
                            <div style="font-size:20px;color:#000;">${rank_plan_arr[$('#rank_plan_id').val()-1]}</div>
                          </div>
                        </div>
                      </div>		
                    </div>
                  </form>`,
          success: function (layero, index) {
            //二维码
            var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
              width: 120,
              height: 120,
              correctLevel: QRCode.CorrectLevel.L
            });
            var qrcode = new QRCode(document.getElementById("qrcode"), {
              width: 180,
              height: 180,
              correctLevel: QRCode.CorrectLevel.L
            });
            makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
            makeCode(JSON.stringify(print_str_qrcode), qrcode);
          },
          end: function () {
            $('.out_material .item_out .table_tbody').html('');
          }
        })
      })
    }
  })

  $('body').on('click', '#printWt', function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    $("#dowPrintWt").print();
    const wo=$(this).attr('data-work-order-code');
    const batch=$(this).attr('data-batch');
    const weight=$(this).attr('data-weight');
    const length=$(this).attr('data-length');
    const item_no=$(this).attr('data-material-code');
    const rank_plan_id=$('#rank_plan_id').val();
    saveBatchData(item_no,batch,wo,weight,length,rank_plan_id);
    // layer.close(layerModal);
  });

  $('body').on('click', '.get-weight', function (e) {
    e.stopPropagation(e);
    const data = JSON.parse($(this).attr('data-item'));
    const material = {
      work_order_code: data.work_order_code,
      material_id: data.material_id,
      workbench_id: $("#work_bench_id").val(),
      '_token': TOKEN
    }
    AjaxClient.post({
      url: URLS['batch'].getWeight,
      data: material,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        getBatchList();
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);
      }
    }, this)
  })

  $('body').on('click', '.update-weight', function (e) {
    e.stopPropagation(e);
    const data = JSON.parse($(this).attr('data-item'));
    layerModal = layer.open({
      type: 1,
      title: '填写重量',
      offset: '200px',
      content: `<form class="formModal formPush" id="modifyWeightForm" data-flag="">
                <div class="el-form-item weight-input">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>输入重量</label>
                    <input type="number" id="weight" min='0' class="el-input" placeholder="请输入重量" value="">
                  </div>
                  <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle">取消</button>
                    <button type="button" class="el-button el-button--primary submit" data-item='${JSON.stringify(data)}'>确定</button>
                  </div>
                </div>
              </form>`,
      success: function (layero, index) {
        console.log('ok');
      },
      end: function () {
        console.log('close');
      }
    })
  })

  $('body').on('click', '.update-mile', function (e) {
    e.stopPropagation(e);
    const data = JSON.parse($(this).attr('data-item'));
    layerModal = layer.open({
      type: 1,
      title: '填写米数',
      offset: '200px',
      content: `<form class="formModal formPush" id="modifyMileForm" data-flag="">
                <div class="el-form-item mile-input">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>输入米数</label>
                    <input type="number" id="mile" min='0' class="el-input" placeholder="请输入米数" value="">
                  </div>
                  <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle">取消</button>
                    <button type="button" class="el-button el-button--primary submit" data-item='${JSON.stringify(data)}'>确定</button>
                  </div>
                </div>
              </form>`,
      success: function (layero, index) {
        console.log('ok');
      },
      end: function () {
        console.log('close');
      }
    })
  })

  $('body').on('click', '#modifyMileForm .submit', function (e) {
    e.stopPropagation();
    let data = JSON.parse($(this).attr('data-item'));
    const mileVal = $('#mile').val();
    const material = {
      work_order_code: data.work_order_code,
      material_id: data.material_id,
      length: mileVal,
      '_token': TOKEN
    }
    if ($('#mile').val()) {
      layer.close(layerModal);
      AjaxClient.post({
        url: URLS['batch'].updateLength,
        data: material,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          getBatchList();
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message);
        }
      }, this)
    } else {
      $('.mile-input').find('.errorMessage').html('*请先输入米数');
    }
  })

  $('body').on('click', '#modifyWeightForm .submit', function (e) {
    e.stopPropagation();
    let data = JSON.parse($(this).attr('data-item'));
    const weightVal = $('#weight').val();
    const material = {
      work_order_code: data.work_order_code,
      material_id: data.material_id,
      weight: weightVal,
      '_token': TOKEN
    }
    if ($('#weight').val()) {
      layer.close(layerModal);
      AjaxClient.post({
        url: URLS['batch'].updateWeight,
        data: material,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          getBatchList();
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          LayerConfig('fail', rsp.message);
        }
      }, this)
    } else {
      $('.weight-input').find('.errorMessage').html('*请先输入重量');
    }
  })

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });

  // 更多搜索条件下拉
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
}