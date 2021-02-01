var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {};
$(function () {
  getAbnormalReply();
  resetParam();
});

//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    names_str: '',
    order: 'desc',
    sort: 'id'
  };
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
      getAbnormalReply();
    }
  });
};

//获取异常单回复列表
function getAbnormalReply() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['abnormal'].replyList + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results);
      } else {
        noData('暂无数据', 10);
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      noData('获取异常单回复列表失败，请刷新重试', 10);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}

//生成异常单回复列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var inerHtml = '';
    item.groups.forEach(function (oitem, index) {
      inerHtml += oitem.item_no + ',';
    });
    var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td style='color: red; font-size:20px;'>${item.repulse== 1 ? '': '需要重新填写'}</td>
                <td>${item.code}</td>
                <td>${inerHtml}</td>
                <td>${item.supplier==null?'':item.supplier}</td>
                <td>${item.cn_name}</td>
                <td>${item.question_description}</td>
                <td>${item.temp_way}</td>
                <td>${tansferNull(item.cause)}</td>
                <td>${tansferNull(item.final_method)}</td>
                <td>${tansferNull(item.result_final_method)}</td>
                <td>${item.names_str}</td>       
                <td>${item.rtime}</td>
                <td>${item.ctime}</td>
                <td class="right">
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                    <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                </td>>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
};

//查看异常单回复
$('.table_tbody').on('click', '.view', function () {
  $(this).parents('tr').addClass('active');
  window.location.href = '/QC/viewAbnormalReply?id=' + $(this).attr('data-id');
});

//编辑异常单回复
$('.table_tbody').on('click', '.edit', function () {
  $(this).parents('tr').addClass('active');
  window.location.href = '/QC/editAbnormalReply?id=' + $(this).attr('data-id');
});

//重置搜索框值
$('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
  e.stopPropagation();
  $(this).addClass('is-disabled');
  $('#searchForm .el-item-hide').slideUp(400, function () {
    $('#searchForm .el-item-show').css('background', 'transparent');
  });
  $('.arrow .el-input-icon').removeClass('is-reverse');
  var parentForm = $(this).parents('#searchForm');
  parentForm.find('#abnormalCode').val('');
  parentForm.find('#create_name').val('');
  $('.el-select-dropdown-item').removeClass('selected');
  $('.el-select-dropdown').hide();
  pageNo = 1;
  resetParam();
  getAbnormalReply();
});

//搜索编号
$('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
  e.stopPropagation();
  $('#searchForm .el-item-hide').slideUp(400, function () {
    $('#searchForm .el-item-show').css('background', 'transparent');
  });
  $('.arrow .el-input-icon').removeClass('is-reverse');
  if (!$(this).hasClass('is-disabled')) {
    $(this).addClass('is-disabled');
    var parentForm = $(this).parents('#searchForm');
    $('.el-sort').removeClass('ascending descending');
    pageNo = 1;
    ajaxData = {
      code: parentForm.find('#abnormalCode').val().trim(),
      names_str: parentForm.find('#create_name').val().trim(),
      order: 'desc',
      sort: 'id'
    }
    console.log(JSON.stringify(ajaxData))
    getAbnormalReply();
  }
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


