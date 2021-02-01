var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {};
$(function () {
  getDeviation();
  getLaydate('start_time');
  bindEvent();
  resetParam();
});
//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    cn_name: '',
    persons_name: '',
    start_time:'',
    end_time:'',
    order: 'desc',
	sort: 'id',
	item_no: '',
	NAME1: '',
	operation_name: ''
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
      getDeviation();
    }
  });
};
//获取异常单列表
function getDeviation() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['deviation'].view + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      console.log(rsp);
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results);
      } else {
        noData('暂无数据', 15);
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
      noData('获取异常单列表失败，请刷新重试', 15);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}
//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var condition = '', inerHtml = '';
    if (item.status == 1) {
      condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已完结</span>`;
    } else {
      condition = `<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未完结</span>`;
    }
    var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td>${item.code}</td>
				<td>${item.persons_arr}</td>
				<td>${item.item_no}</td>
				<td>${item.NAME1}</td>
				<td>${item.operation_name}</td>
                <td>${tansferNull(item.question_description)}</td>
                <td>${tansferNull(item.cause)}</td>
                <td>${tansferNull(item.status)==0?'未完结':item.status==1?'已完结':'被迫中止'}</td>
                <td>${item.replyperson}</td>
                <td>${item.cn_name}</td>
                <td>${item.ctime}</td>
                <td class="right">
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                </td>>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
  $(function () {
    $('td .is-disabled').css('pointer-events', 'none');
    $('td .is-disabled').css({
      'color': '#bfcbd9',
      'cursor': 'not-allowed',
      'background-color': '#eef1f6',
      'border-color': '#d1dbe5'
    })
  })
};
function bindEvent() {
  //点击导出按钮
  $('body').on('click', '.el-form-item-div #exportBtn', function (e) {
    e.stopPropagation;
    var parentForm = $(this).parents('#searchForm');
    var urlLeft = '';
    var ajaxData = {
      token: '8b5491b17a70e24107c89f37b1036078',
      code: parentForm.find('#abnormalCode').val().trim(),
      persons_name: parentForm.find('#responsible').val().trim(),
      cn_name: parentForm.find('#create_name').val().trim(),
      start_time: parentForm.find('#start_time').val().trim(),
	  end_time: parentForm.find('#end_time').val().trim(),
	  item_no: parentForm.find('#wl_code').val().trim(),
	  NAME1: parentForm.find('#gys_name').val().trim(),
	  operation_name: parentForm.find('#gx').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`
    }
    let url = "/AbnormalController/exportExcel?" + urlLeft;
    $('#exportExcel').attr('href', url)
  })

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

  //排序
  $('.sort-caret').on('click', function (e) {
    e.stopPropagation();
    $('.el-sort').removeClass('ascending descending');
    if ($(this).hasClass('ascending')) {
      $(this).parents('.el-sort').addClass('ascending')
    } else {
      $(this).parents('.el-sort').addClass('descending')
    }
    $(this).attr('data-key');
    ajaxData.order = $(this).attr('data-sort');
    ajaxData.sort = $(this).attr('data-key');
    getDeviation();
  });

  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //搜索
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
        persons_name: parentForm.find('#responsible').val().trim(),
        cn_name: parentForm.find('#create_name').val().trim(),
        start_time: parentForm.find('#start_time').val().trim(),
        end_time: parentForm.find('#end_time').val().trim(),
        order: 'desc',
		sort: 'id',
		item_no: parentForm.find('#wl_code').val().trim(),
		NAME1: parentForm.find('#gys_name').val().trim(),
		operation_name: parentForm.find('#gx').val().trim(),
      }
      getDeviation();
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

  //查看特采
  $('.table_tbody').on('click', '.view', function () {
    $(this).parents('tr').addClass('active');
    $(this).parents('tr').addClass('active');
    // viewAbnormal($(this).attr("data-id"),'view');
    window.location.href = '/QC/viewSpecialPurchaseApply?id=' + $(this).attr('data-id');
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
    parentForm.find('#responsible').val('');
    parentForm.find('#create_name').val('');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getDeviation();
  });

  //下拉选择
  $('body').on('click', '.formAbnormal:not(".disabled") .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parents('.el-form-item').find('.errorMessage').html('');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      ele.find('.val_id').attr('data-code', $(this).attr('data-code'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });
};

//时间组件
function getLaydate(flag){
  if (flag == 'start_time') {
    laydate.render({
      elem: '#' + flag,
      type: 'date',
      format: 'yyyy-MM-dd HH:mm:ss',
      position: 'fixed',
      done:function(e){
        getLaydate('end_time');
      }
    })
  }else if(flag=='end_time'){
    laydate.render({
      elem: '#' + flag,
      type: 'date',
      min: $("#start_time").val(),
      format: 'yyyy-MM-dd HH:mm:ss',
      position: 'fixed',
    })
  }
}