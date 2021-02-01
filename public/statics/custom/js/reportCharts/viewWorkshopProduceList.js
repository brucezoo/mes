var layerLoading,
  layerModal,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {},
  string = ''

layui.use(['form', 'layedit', 'laydate'], function () {
    var form = layui.form
        , layer = layui.layer
        , layedit = layui.layedit
        , laydate = layui.laydate;

    laydate.render({
        elem: '#date2'
    });
    laydate.render({
        elem: '#date'
    });
});

$(function () {
  resetParam();
  getWorkShopProductList();
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
    endpage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageNo = api.getCurrent();
      getWorkShopProductList();
    }
  });
}

layui.use(['form', 'layedit', 'laydate'], function () {
  var form = layui.form
    , layer = layui.layer
    , layedit = layui.layedit
    , laydate = layui.laydate;

  laydate.render({
    elem: '#date2'
  });
  laydate.render({
    elem: '#date'
  });
});

//重置搜索参数
function resetParam() {
  ajaxData = {
    sale_order_code: '',
    sales_order_project_code: '',
    po_number: '',
    wo_number: '',
    factory_name: '',
    sale_order_code: '',
    storage_depot_name: '',
    item_no: '',
    material_name: '',
    work_shop_name: '',
    rwdo_status: '',
    is_lzp: '',
    type:'',
    budat_begin_time:'',
    budat_end_time:''
  };
    string = "/StatementController/statementExportExcel"+
        "? _token = 8b5491b17a70e24107c89f37b1036078 &sale_order_code=''"+
        "&sales_order_project_code ='' & po_number='' & wo_number=''&factory_name=''&storage_depot_name=''"+
        "&item_no=''&material_name=''&work_shop_name=''&rwdo_status=''&is_lzp=''&type=''&budat_begin_time=''&budat_end_time=''";

    $('#exportExcel').attr('href', '  ');

}

//获取实时库存列表
function getWorkShopProductList() {
  $('.table_tbody').html('');
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['workshop'].list + '?' + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layerLoading = LayerConfig('load');
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results)
      } else {
        noData('暂无数据', 13)
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取期初列表失败，请刷新重试', 13);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this);
}

//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var tr = `
		    <tr>
          <td></td>
          <td>${tansferNull(item.sale_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
          <td>${tansferNull(item.po_number)}</td>
          <td>${tansferNull(item.wo_number)}</td>
          <td>${tansferNull(item.item_no)}</td>
          <td>${tansferNull(item.material_name)}</td>
          <td>${tansferNull(item.quantity)}</td>
          <td>${tansferNull(item.unit_name)}</td>
          <td>${tansferNull(item.lot)}</td>
          <td>${tansferNull(item.factory_name)}</td>
          <td>${tansferNull(item.storage_depot_name)}</td>
          <td>${tansferNull(item.work_shop_name)}</td>
          <td>${tansferNull(item.rwdo_status)==0?'待报工':tansferNull(item.rwdo_status)==1?'报工中':'已报工'}</td>
          <td>${tansferNull(item.inve_age)}</td>
		      <td style="text-align:center;">${tansferNull(item.category_id)==14?'SAP领料':tansferNull(item.rwdo_status)==15?'车间领料':'其他'}</td>
	      <td>${tansferNull(item.BUDAT)}</td>
	      </tr>`;

    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });

  
}

function bindEvent() {
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
      pageNo = 1;
      ajaxData = {
        sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
        sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
        po_number: encodeURIComponent(parentForm.find('#po_number').val().trim()),
        wo_number: encodeURIComponent(parentForm.find('#wo_number').val().trim()),
        factory_name: encodeURIComponent(parentForm.find('#factory_name').val().trim()),
        storage_depot_name: encodeURIComponent(parentForm.find('#storage_depot_name').val().trim()),
        item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
        material_name: encodeURIComponent(parentForm.find('#material_name').val().trim()),
        work_shop_name: encodeURIComponent(parentForm.find('#work_shop_name').val().trim()),
        rwdo_status: encodeURIComponent(parentForm.find('#rwdo_status').val().trim()),
        is_lzp: encodeURIComponent(parentForm.find('#is_LZP').val().trim()),
        type: encodeURIComponent(parentForm.find('#inbound_type').val().trim()),
        budat_begin_time: encodeURIComponent(parentForm.find('#date2').val().trim()),
        budat_end_time: encodeURIComponent(parentForm.find('#date').val().trim()),
      }

      string = "/StatementController/statementExportExcel" +
          "? _token = 8b5491b17a70e24107c89f37b1036078 &sale_order_code=" + ajaxData.sale_order_code +
          "&sales_order_project_code =" + ajaxData.sales_order_project_code +" &po_number="+
          ajaxData.po_number + " &wo_number=" + ajaxData.wo_number +"&factory_name="+
          ajaxData.factory_name + "&storage_depot_name=" + ajaxData.storage_depot_name +
          "&item_no=" + ajaxData.item_no + "&material_name=" + ajaxData.material_name + "&work_shop_name="+
          ajaxData.work_shop_name + "&rwdo_status=" + ajaxData.rwdo_status + "&is_lzp=" + ajaxData.is_lzp + "&type="+
          ajaxData.type + "&budat_begin_time=" + ajaxData.budat_begin_time + "&budat_end_time=" + ajaxData.budat_end_time;
      $('#exportExcel').attr('href',string);

      getWorkShopProductList();
    }
  });

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#sale_order_code').val('');
    parentForm.find('#sales_order_project_code').val('');
    parentForm.find('#po_number').val('');
    parentForm.find('#wo_number').val('');
    parentForm.find('#item_no').val('');
    parentForm.find('#material_name').val('');
    parentForm.find('#factory_name').val('');
    parentForm.find('#storage_depot_name').val('');
    parentForm.find('#work_shop_name').val('');
    parentForm.find('#is_LZP_Text').val('--请选择--');
    parentForm.find('#is_LZP').val('');
    parentForm.find('#auditStatusText').val('--请选择--');
    parentForm.find('#rwdo_status').val('');
    parentForm.find('#inbound_type_text').val('--请选择--');
    parentForm.find('#inbound_type').val('--请选择--');
    parentForm.find('#date2').val('');
    parentForm.find('#date').val('');

    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getWorkShopProductList();
  });

  //下拉选择
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

  //点击显示隐藏下拉框
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
}