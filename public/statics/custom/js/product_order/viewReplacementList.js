var layerModal,
    layerLoading,
    pageNo = 1,
    pageSize = 20,
    ajaxData = {};

$(function () {
    setAjaxData();
    // getReplaceLog();
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
            getReplaceLog();
        }
    });
}

// 重置搜索参数
function resetParam() {
    ajaxData = {
        sales_order_code: '',
        sales_order_project_code: '',
        production_order_code: '',
		work_order_code: '',
		material_code: '',
        order: 'desc',
        sort: 'id'
    };
}

function resetAll() {
    var parentForm = $('#searchForm');
    parentForm.find('#sales_order_code').val('');
    parentForm.find('#sales_order_project_code').val('');
    parentForm.find('#work_order_number').val('');
	parentForm.find('#production_order_number').val('');
	parentForm.find('#wl_code').val('');
    pageNo = 1;
    resetParam();
}

// 获取列表
function getReplaceLog() {
   
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    AjaxClient.get({
        url: URLS['log'].getReplaceLog + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            var _html = createHtml(rsp);
            $("#replacement_log_table .table_tbody").html(_html);
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation.bottom-page').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取车间替换料日志列表失败，请刷新重试', 10);
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    }, this)
}

// 获取工单工艺查看列表
function createHtml(data) {
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item) {
          var date=dateFormat(item.ctime, 'Y-m-d');
            trs += `
            <tr>
                <td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
                <td>${tansferNull(item.po_no)}</td>
                <td>${tansferNull(item.work_order_code)}</td>
                <td>${tansferNull(item.material_code)}</td>
				<td>${tansferNull(item.material_name)}</td>
				<td>${tansferNull(item.source)}</td>
             <!--   <td>${tansferNull(item.material_qty)}</td>
                <td>${tansferNull(item.bom_commercial)}</td>
                <td>${tansferNull(item.factory_name)}</td>       
                <td>${tansferNull(item.workcenter_name)}</td>  -->         
				<td>${tansferNull(item.action == "新增" ? `<span style="color:green">新增</span>` : item.action == '删除' ? `<span style = "color:red" > 删除</span>` : item.action == '替换' ? `<span style = "color:green" > 替换</span >` : `<span style = "color:red" > 后台撤回</span >`)}</td>
                <td>${tansferNull(item.cn_name)}</td>
                <td>${tansferNull(item.ctime)}</td>
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

    // 搜索
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
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                production_order_code: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
				work_order_code: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
				material_code: encodeURIComponent(parentForm.find('#wl_code').val().trim()),
                order: 'desc',
                sort: 'id'
            };
           
            pageNo = 1;
            getReplaceLog();
        }
    });

    // 重置搜索框值
    $('body').on('click', '#searchForm .reset', function (e) {
        e.stopPropagation();
		resetAll();
		$('.table_tbody').html('');
		$('.table_tbody').html(`
			<tr>
						<td colspan="8" style="text-align: center;">请先搜索！</td>
					</tr>
		`)
        // getReplaceLog();
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