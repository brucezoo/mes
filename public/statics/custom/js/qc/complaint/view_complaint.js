var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {};


$(function () {
  resetParam();
  getComplaint();
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
      getComplaint();
    }
  });
};
//重置搜索参数
function resetParam() {
  ajaxData = {
    complaint_code: '',
    customer_name: '',
    status: '',
    finish_status: '',
    item_no: ''
  };
}
//获取质检类别列表
function getComplaint() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${encodeURIComponent(ajaxData[param])}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['complaint'].select + "?" + _token + urlLeft,
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
      noData('获取物料列表失败，请刷新重试', 10);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);

};
//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var materialNo = [];
    var materialName = [];
    if (Array.isArray(item.material)) {
      item.material.forEach(function (material) {
        materialNo.push(material.item_no);
        materialName.push(material.material_name);
      })
    }

    var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td>${item.complaint_code}</td>
                <td>${item.customer_name}</td>
                <td>${item.factory_name || ''}</td>
                <td>${materialNo.join('<br>')}</td>
                <td>${materialName.join('<br>')}</td>
                <td>${item.finish_status==1?'归档':item.finish_status==2?'终止':item.status==1?'未审核':item.status==2?'审核中':item.status==3?"审核未通过":item.status==4?"审核通过":''}</td>
                <td>${item.create_time}</td> 
                <td class="right">
                <a href="/QC/viewComplaintById?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a> 
                </td>
                
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
};

function bindEvent() {
  $('body').on('click', '#searchForm .el-select', function () {
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

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
      type: 'datetime',
      format: 'yyyy-MM-dd HH:mm:ss',
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
    start_time = laydate.render({
      elem: '#end_time_input',
      // max: max,
      type: 'datetime',
      format: 'yyyy-MM-dd HH:mm:ss',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
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
    parentForm.find('#customer_name').val('');
    parentForm.find('#complaint_code').val('');
    parentForm.find('#item_no').val('');
    parentForm.find('#start_time_input').text(''),
    parentForm.find('#end_time_input').text(''),
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#over_status').val('').siblings('.el-input').val('--请选择--');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getComplaint();
  });
  // 搜索
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
        customer_name: parentForm.find('#customer_name').val().trim(),
        complaint_code: parentForm.find('#complaint_code').val().trim(),
        status: parentForm.find('#status').val().trim(),
        start_time: parentForm.find('#start_time_input').text().trim(),
        end_time: parentForm.find('#end_time_input').text().trim(),
        finish_status: parentForm.find('#over_status').val().trim(),
        item_no: parentForm.find('#item_no').val().trim()
      }
      getComplaint();
    }
  });

}

// 导出
$('body').on('click', '#exportBtn', function (e) {
  var parentForm = $('#searchForm');
  var urlLeft = '';
  e.stopPropagation();
  var parentForm = $(this).parents('#searchForm');
  $('.el-sort').removeClass('ascending descending');
  ajaxData = {
    _token: TOKEN,
    customer_name: parentForm.find('#customer_name').val().trim(),
    complaint_code: parentForm.find('#complaint_code').val().trim(),
    start_time: parentForm.find('#start_time_input').text().trim(),
    end_time: parentForm.find('#end_time_input').text().trim(),
    status: parentForm.find('#status').val().trim(),
    finish_status: parentForm.find('#over_status').val().trim(),
    item_no: parentForm.find('#item_no').val().trim()
  };
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  let url = "/CustomerComplaint/customerComplaintexport?" + urlLeft;
  $('#exportExcel').attr('href', url)
});


$('body').on('input', '.el-item-show input', function (event) {
  event.target.value = event.target.value.replace(/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im, "");
})