var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ids = [],
  work_order_ids = [],
  ajaxData = {},
  declare_ids = '';

$(function () {
  bindEvent();
  resetParam();
  $('.type_dropdown .el-select-dropdown-item[data-id=' + 1 + ']').click();
  getTraceBatchList();
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
      getTraceBatchList();
    }
  });
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    begin_time: '',
    end_time: '',
    work_order_code: '',
    batch: '',
    material_code: '',
    type:1,
  };
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

//获取粗排列表
function getTraceBatchList() {
  var type=$("#type").val();
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;

  AjaxClient.get({
    url: URLS['batch'].getBatchTraceDeclareList + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
		  layer.close(layerLoading);
      ajaxData.pageNo = pageNo;
      window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
	    $('.table_page .table_tbody').html(_html);
	  
      if (rsp.paging.total_records < 20) {
        $('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
      } else {
        $('#total').css('display', 'none').text(' ');
      }

      if(type==1){
        $('body').find('.length').show();
        $('body').find('.weight').show();
        $('body').find('.operation').show();
        $('body').find('.number').hide();
      }else if(type==2){
        $('body').find('.length').hide();
        $('body').find('.weight').hide();
        $('body').find('.operation').hide();
        $('body').find('.number').show();
      }else{
        $('body').find('.length').hide();
        $('body').find('.weight').hide();
        $('body').find('.operation').hide();
        $('body').find('.number').hide();
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取领料单列表失败，请刷新重试', 9);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成列表数据
function createHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      trs += `
                <tr>
                  <td>${tansferNull(item.work_order_code)}</td>
                  <td>${tansferNull(item.material_code)}</td>
                  <td>${tansferNull(item.batch)}</td>
                  <td>${tansferNull(item.num)}</td>
                  <td class="weight">${tansferNull(item.weight)}</td>
                  <td class="length">${tansferNull(item.length)}</td>
                  <td>${tansferNull(item.ctime)}</td>
                  <td class="right operation">
                    <button data-id="${item.id}" data-attr='${JSON.stringify(item)}' class="button pop-button view-qrcode">生成二维码</button>
                    <button data-id="${item.id}" data-attr='${JSON.stringify(item)}' class="button pop-button update-data">修改</button>
                  </td>
                </tr>`;
    })
  } else {
    trs = '<tr><td colspan="7" class="center">暂无数据</td></tr>';
  }
  return trs;
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
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

function makeCode(str, qrcode) {
  qrcode.makeCode(str);
}

function bindEvent() {
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
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_time_input',
      max: max,
      type: 'datetime',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });
  $('#end_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#end_time_input',
      min: min,
      max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });
  //更多搜索条件下拉
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

  //点击弹框内部关闭dropdown
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
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
  });

  //搜索
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('backageground', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      ajaxData = {
        work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
        batch: encodeURIComponent(parentForm.find('#batch').val().trim()),
        material_code: encodeURIComponent(parentForm.find('#material_code').val().trim()),
        type: encodeURIComponent(parentForm.find('#type').val().trim()),
        begin_time: parentForm.find('#start_time').val(),
        end_time: parentForm.find('#end_time').val(),
      };
      pageNo = 1;
      getTraceBatchList();
    }
  });

  $('body').on('click', '.view-qrcode', function (e) {
    e.stopPropagation();
    let data = JSON.parse($(this).attr('data-attr'));
    const rank_plan_arr=['','白班','夜班'];
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
                              <div style="font-size:20px;color:#000;">${rank_plan_arr[data.rankplan_id]}</div>
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

  $('body').on('click', '#printWt', function (e) {
    e.stopPropagation();
    // $(this).addClass('is-disabled');
    $("#dowPrintWt").print();
  });

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    var parentForm = $('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#production_sales_order_code').val('');
    parentForm.find('#production_sales_order_project_code').val('');
    parentForm.find('#work_order_code').val('');
    parentForm.find('#WERKS').val('');
    parentForm.find('#workshop_id').val('');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#start_time').val('');
    parentForm.find('#end_time').val('');
    parentForm.find('#item_no').val('');
    parentForm.find('#report_code').val('');
    resetParam();
    getTraceBatchList();
  });

  $('body').on('click', '.update-data', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');

    var data = JSON.parse($(this).attr('data-attr'));
    var $html =`<form class="formModal formPush" data-flag="">
                  <input type="hidden" id="batchId" value="${id}"/>
                  <div class="el-form-item" style="margin-bottom:20px;">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 104px;">重量</label>
                      <input type="number" id="batchWeight" class="el-input" placeholder="请输入重量" value="${data.weight}">
                    </div>
                  </div>
                  <div class="el-form-item" style="margin-bottom:20px;">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 104px;">长度</label>
                      <div class="el-select-dropdown-wrap">
                        <input type="number" id="batchLength" class="el-input" placeholder="请输入长度" value="${data.length}" autocomplete="off">
                      </div>
                    </div>
                  </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle">取消</button>
                      <button type="button" class="el-button el-button--primary submit confirm-update">确定</button>
                    </div>
                  </div>
    </form>`;
    
      layerModal = layer.open({
        type: 1,
        title: '更改',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `${$html}`,
        success: function (layero, index) {
          getLayerSelectPosition($(layero));
        },
        end: function () {
          $('.table_tbody tr.active').removeClass('active');
        }
      });
    
  });

  $('body').on('click', '.confirm-update', function (e) {
    var weight = $('#batchWeight').val();
    var length = $('#batchLength').val();
    var id = $('#batchId').val();
    const material={
      id:id,
      length:length,
      weight:weight,
      '_token':TOKEN
    }
    AjaxClient.post({
      url: URLS['batch'].updateBatchTraceDeclare,
      data: material,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.close(layerModal);
        LayerConfig('success','修改成功')
        getTraceBatchList();
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);
      }
    }, this)    
  });

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });
};