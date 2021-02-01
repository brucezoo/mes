/*
*
* pageNo,pageSize  分页参数
*
* */

var pageNo = 1,
  pageSize = 20,
  ajaxData = {},
  creator_token = '',
  excelData = {};

$(function () {
  creator_token = '88t8r9m70r2ea5oqomfkutc753';
  bindEvent()
});

function setAjaxData() {
  var ajaxDataStr = window.location.hash;
  var planStartTime = '';
  try {
    ajaxData = {
      order: 'desc',
      sort: 'id'
    }
    delete ajaxData.pageNo;
    // pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
  } catch (e) {
    resetParam();
  }
  //}
}

// 重置搜索参数
function resetParam() {
  var parentForm = $("#searchReleased_from");
  var planStartDate = '', planStartTime = '', workStationDate = '', workStationTime = '';
  if ($('#work_station_time').val()) {
    workStationDate = new Date($('#work_station_time').val() + ' 00:00:00');
    workStationTime = Math.round(workStationDate.getTime() / 1000);
  }
  if (parentForm.find("#plan_start_time").val()) {
    planStartDate = new Date(parentForm.find('#plan_start_time').val() + ' 00:00:00');
    planStartTime = Math.round(planStartDate.getTime() / 1000);
  }
  ajaxData = {
    order: 'desc',
    sort: 'id'
  }
}

// 生成订单列表
function createPro(ele, data) {
  ele.html('');
  data.forEach(function (item) {
    prohtml = `<tr class="no-line-tr">
    <td data-order-id="${item.order_id}" data-content='${JSON.stringify(item)}'>${tansferNull(item.order_id)}</td>
    </tr>`;
    ele.append(prohtml);
  });
}

function getPoList() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['tool'].getPO +"?"+ _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      var pageTotal = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createPro($('#product_order_table .table_tbody'), rsp.results);
        layer.msg("拉取成功", { icon: 1 });
      } else {
        $('#product_order_table .table_tbody').html('<tr><td class="nowrap" colspan="18" style="text-align: center;">暂无数据</td></tr>');
      }
      if (pageTotal > pageSize) {
        bindPagenationClick(pageTotal, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取待处理订单列表失败');
    }
  });
}

function deletePO() {
  AjaxClient.get({
    url: URLS['tool'].delete+ "?" + _token,
	dataType: 'json',
	timeout: 3600000,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
		if (rsp.code == 200) {
			layer.close(layerLoading);
			layer.confirm('删除成功!', {
				closeBtn:0,
				btn: ['确定', ] //按钮
			}, function (index) {
				layer.close(index);
				layer.closeAll('dialog');
				getPoList();
			}, function () {
		
			});
		}
		
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message)
      }
    }
  })
}

function showExcelModal() {
  layerModal = layer.open({
    type: 1,
    title: '生产订单导入',
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content: `<form class="addExcelModal formModal formMateriel" id="addExcel_form">
                  <div style="min-height: 155px;padding-top:20px">
                      <div class="excelInput">
                          <a href="javascript:;" class="file">
                              <input type="file" name="attachment" id="files_excel">选择Excel文件
                          </a>
                          <span class="filename"></span>
                      </div>
                      <p class="excelError"></p>
                  </div>
                  <div class="el-form-item btnShow">
                      <div class="el-form-item-div btn-group">
                          <button type="button" class="el-button cancle">取消</button>
                          <button type="button" class="el-button el-button--primary submit is-disabled">确认</button>
                      </div>
                  </div>  
              </form>`,
    complete: function () {

    }
  })

}

function bindEvent() {
  //详情输入框的事件
  $('body').on('focus', '.work_order_condition .el-input', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '.work_order_condition .el-input:not([readonly])', function () {
    var name = $(this).attr("id");
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name)
  });

  //导入订单excel
  $('body').on('click', '.actions #importExcel', function () {
    showExcelModal()
  });

  //拉取生产订单
  $('body').on('click', '.actions #pull', function () {
    getPoList();
  });

  //删除生产订单
  $('body').on('click', '.actions #delete', function () {
    layer.confirm('将执行删除操作?', { icon: 3, title: '提示', offset: '250px' }, function (index) {
      layer.close(index);
      deletePO();;
    });
  });

  $('body').on('click', '#addExcel_form .submit:not(".is-disabled")', function (ev) {
    var reader = new FileReader();
    var zzexcel, file;
    excelData._token = _token;
    excelData.creator_token = creator_token;
    reader.readAsBinaryString(document.getElementById("files_excel").files[0]);
    reader.onload = function (e) {
      var data = e.target.result;
      zzexcel = XLSX.read(data, {
        type: 'binary'
      });
      file = XLSX.utils.sheet_to_json(zzexcel.Sheets[zzexcel.SheetNames[0]]);
      var param = '';

      for (var i in excelData) {
        param += `&${i}=${excelData[i]}`;
      }
      var dateInfo = {
        file: file,
        _token: TOKEN
      }

      AjaxClient.post({
        url: URLS['tool'].uploadFile,
        data: dateInfo,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          layer.close(layerModal);
          layer.msg("导入成功", { icon: 1 });
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          layer.close(layerModal);
          if (rsp && rsp.message != undefined && rsp.message != null) {
            LayerConfig('fail', rsp.message)
          }
        }
      }, this)
    };
  })

  //监听上传的文件
  $("body").on("change", "#files_excel", function (e) {
    var filePath = $(this).val();
    if (filePath.indexOf('xlsx') != -1 || filePath.indexOf('xls') != -1 || filePath.indexOf('XLSX')) {
      if (document.getElementById("files_excel").files[0].size < (1 << 20)) {
        $(".excelError").html("").hide();
        $('#addExcel_form .submit').removeClass('is-disabled');
        var arr = filePath.split('\\');
        var fileName = arr[arr.length - 1];
        $('.filename').html(fileName).attr('title', fileName);
      } else {
        $('.filename').html('');
        $('.excelError').html('上传文件超过1兆（MKB）').show();
        $('#addExcel_form .submit').addClass('is-disabled')
      }
    } else {
      $('.filename').html('');
      $('.excelError').html('上传文件类型错误').show();
      $('#addExcel_form .submit').addClass('is-disabled')
    }
  });

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });

  $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });
  
  // 导出 
  $('body').on('click', '.actions .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078'
    };
    for (var param in ajaxData) {
      urlLeft += `${param}=${ajaxData[param]}`;
    }
    let url = URLS['tool'].export+'?' + urlLeft;
    $('#exportExcel').attr('href', url)
  });
}

// 日历组件方法调用
function getSelectDate(ele) {
  ele.forEach(function (item, index) {
    laydate.render({
      elem: `#${item}`,
      done: function (value, date, endDate) {
        $('#searchReleased_from .submit').removeClass('is-disabled');
      }
    });
  })
}

// 分页
function bindPagenationClick(total, size) {
  var status = $("#status-spans").find(".active").attr("data-status");
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: total,
    showData: size,
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
      getPoList();
    }
  });
}

function formatDuring(data) {
  var hours = parseInt((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = parseInt((data % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = parseInt((data % (1000 * 60)) / 1000);
  if (minutes >= 0 && minutes <= 9) {
    minutes = '0' + minutes
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = '0' + seconds
  }

  return hours + ":" + minutes + ":" + seconds;
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

function loadLayer() {
  layerLoading = LayerConfig('load');
}