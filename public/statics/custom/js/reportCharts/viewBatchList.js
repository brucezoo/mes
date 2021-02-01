var layerModal,
  layerLoading,
  push_type = 1,
  pageNo = 1,
  status = 2;
pageSize = 20,
  work_order_code = '',
  e = {},
  ajaxData = {},
  ajaxSerialData = {};

$(function () {
  resetSerialParam();
  getBatchList();
  bindEvent();
});

function setAjaxData() {
  var ajaxDataStr = window.location.hash;
  if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
    try {
      ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
      delete ajaxData.pageNo;
      pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
    } catch (e) {
      resetParam();
    }
  }
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
      getBatchList();
    }
  });
}

// 重置搜索参数
function resetParam() {
  ajaxData = {
    material_code: '',
    batch: '',
    order: 'desc',
    sort: 'id'
  };
}

// 重置搜索参数
function resetSerialParam() {
  ajaxSerialData = {
    material_code: '',
    serial_code: '',
    order: 'desc',
    sort: 'id'
  };
}

function resetAll() {

  var parentForm = $('#searchForm');
  parentForm.find('#material_code').val('');
  parentForm.find('#batch').val('');
  pageNo = 1;
  resetParam();
  resetSerialParam();
}

// 序列号追溯获取列表方法
function getBatchList() {
  let urlSerialLeft = '';
  for (var param in ajaxSerialData) {
    urlSerialLeft += `&${param}=${ajaxSerialData[param]}`;
  }
  urlSerialLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['BatchTrace'].serialNumberTrace + '?' + _token + urlSerialLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
      $("#batch_list_table .table_tbody").html(_html);
        $(".serial_code").show();
        $(".operation").hide();
        // if (totalData > pageSize) {
      //   bindPagenationClick(totalData, pageSize);
      // } else {
      //   $('#pagenation.bottom-page').html('');
      // }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('暂无数据', 10); //，请确认搜索条件是否正确
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//正向追溯
function getForwardTraceBatchList() {
  let urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['BatchTrace'].forwardTrace + '?' + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
      $("#batch_list_table .table_tbody").html(_html);
      $(".serial_code").hide();
      $(".operation").show();
        // if (totalData > pageSize) {
      //   bindPagenationClick(totalData, pageSize);
      // } else {
      //   $('#pagenation.bottom-page').html('');
      // }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('暂无数据', 10); //，请确认搜索条件是否正确
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}


//反向追溯
function getBackTraceBatchList() {
  let urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['BatchTrace'].backTrace + '?' + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
      $("#batch_list_table .table_tbody").html(_html);
      $(".serial_code").hide();
      $(".hperation").show();

      // if (totalData > pageSize) {
      //   bindPagenationClick(totalData, pageSize);
      // } else {
      //   $('#pagenation.bottom-page').html('');
      // }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('暂无数据', 10); //，请确认搜索条件是否正确
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

// 获取批次追溯列表html
function createHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item) {
      trs += `
            <tr>
                <td>${tansferNull(item.sales_order_code)}${item.sales_order_line_code != 0 ? "/" + item.sales_order_line_code : ''}</td>
                <td>${tansferNull(item.production_order_code)}</td>
                <td>${tansferNull(item.work_order_code)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td style="width:350px;">${tansferNull(item.name)}</td>
                <td class="serial_code">${tansferNull(item.serial_code)}</td>
                <td>${tansferNull(item.batch)}</td>
                <td>${tansferNull(item.type) == 1 ? '绵泡' : tansferNull(item.type) == 2 ? '切割绵' : tansferNull(item.type) == 3 ? '复合绵' : tansferNull(item.type) == 4?'成品':''}</td>
                <td class="right operation">
                  <a class="button pop-button view" target="blank" href="${viewurl}?id=${item.id}">明细</a>
                </td>
			</tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="10" class="center">暂无数据</td></tr>';
  }
  return trs;
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
    if (!$(this).hasClass('is-disabled') && $(".el-tap-wrap .el-tap.active").attr('data-status') == 3) {
      // $(this).addClass('is-disabled');
      $('.el-sort').removeClass('ascending descending');
      ajaxSerialData = {
        material_code: encodeURIComponent(parentForm.find('#material_code').val().trim()),
        serial_code: encodeURIComponent(parentForm.find('#batch').val().trim()),
        order: 'desc',
        sort: 'id'
      };
      pageNo = 1;
      if (!parentForm.find('#batch').val()) {
        correct = 0;
        $('#batch').parents('.el-form-item').find('.errorMessage').html('*请输入序列号');
      } else {
        $('#batch').parents('.el-form-item').find('.errorMessage').html('');
      }
      if(correct==1){
        getBatchList();
      }
    } else if ($(".el-tap-wrap .el-tap.active").attr('data-status') == 2) {
      // $(this).addClass('is-disabled');
      $('.el-sort').removeClass('ascending descending');
      ajaxData = {
        material_code: encodeURIComponent(parentForm.find('#material_code').val().trim()),
        batch: encodeURIComponent(parentForm.find('#batch').val().trim()),
        order: 'desc',
        sort: 'id'
      };
      pageNo = 1;
      if (!parentForm.find('#material_code').val()) {
        correct = 0;
        $('#material_code').parents('.el-form-item').find('.errorMessage').html('*请输入物料编码');
      } else {
        $('#material_code').parents('.el-form-item').find('.errorMessage').html('');
      }
      if (!parentForm.find('#batch').val()) {
        correct = 0;
        $('#batch').parents('.el-form-item').find('.errorMessage').html('*请输入批次号');
      } else {
        $('#batch').parents('.el-form-item').find('.errorMessage').html('');
      }
      if(correct==1){
        getBackTraceBatchList();
      }
    } else {
      // $(this).addClass('is-disabled');
      $('.el-sort').removeClass('ascending descending');
      ajaxData = {
        material_code: encodeURIComponent(parentForm.find('#material_code').val().trim()),
        batch: encodeURIComponent(parentForm.find('#batch').val().trim()),
        order: 'desc',
        sort: 'id'
      };
      pageNo = 1;
      if (!parentForm.find('#material_code').val()) {
        correct = 0;
        $('#material_code').parents('.el-form-item').find('.errorMessage').html('*请输入物料编码');
      } else {
        $('#material_code').parents('.el-form-item').find('.errorMessage').html('');
      }
      if (!parentForm.find('#batch').val()) {
        correct = 0;
        $('#batch').parents('.el-form-item').find('.errorMessage').html('*请输入批次号');
      } else {
        $('#batch').parents('.el-form-item').find('.errorMessage').html('');
      }
      if(correct==1){
        getForwardTraceBatchList();
      }
    }
  });

  // 重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetAll();
    getBatchList();
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

  //tab切换显示
  $('body').on('click', '.el-tap-wrap .el-tap', function () {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      var _type = $(this).attr('data-status');
      push_type = _type;
      if (push_type == 3) {
        $("#batchLabel").text('序列号');
        $("#batch").attr('placeholder', '请输入序列号');
        $("#serial_code").show()
        // getBatchList(push_type);
      } else {
        $("#batchLabel").text('批次号');
        $("#batch").attr('placeholder', '请输入批次号');
        $("#serial_code").hide()
      }
      // resetAll();
    }
  });
}