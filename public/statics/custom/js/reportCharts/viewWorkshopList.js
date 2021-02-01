var layerModal,
    layerLoading,
    pageNo = 1,
    status=2;
    pageSize = 20,
    work_order_code = '',
    e = {},
    ajaxData = {};

$(function () {
    setAjaxData();
    getWorkOrder();
    laydate.render({
      elem: '#plan_start_time',
      position: 'fixed',
      done: function (value) {
        $('#plan_start_time').find('.errorMessage').hide().html('');
      }
    });
    laydate.render({
      elem: '#plan_start_date',
      position: 'fixed',
      done: function (value) {
        $('#plan_start_date').find('.errorMessage').hide().html('');
      }
    });
    bindEvent();
});

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

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try {
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.status;
            delete ajaxData.work_order_code;
            pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            status = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).status;
            work_order_code = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).work_order_code;
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
            getWorkOrder();
        }
    });
}

// 重置搜索参数
function resetParam() {
    ajaxData = {
      sales_order_code: '',
      sales_order_project_code: '',
      po_number: '',
      wo_number: '',
      plan_start_time: '',
      plan_start_date:'',
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
    parentForm.find('#plan_start_time').val('');
    parentForm.find('#plan_start_date').val('');
    pageNo = 1;
    resetParam();
}

// 获取列表
function getWorkOrder() {
   
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    AjaxClient.get({
        url: URLS['workshop'].viewList + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            var _html = createHtml(rsp);
            $("#product_order_table .table_tbody").html(_html);
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation.bottom-page').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取工单工艺查看列表失败，请刷新重试', 16);
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

            trs += `
            <tr>
                <td>${tansferNull(item.plan_factory_name)}</td>
                <td>${tansferNull(item.factory_name)}</td>
                <td>${tansferNull(item.work_shop_name)}</td>
                <td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
                <td>${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>     
                <td>${tansferNull(item.material_code)}</td>       
                <td width="200px;">${tansferNull(item.material_name)}</td>            
                <td>${tansferNull(item.plan_start_time)}</td>            
                <td>${tansferNull(item.plan_date)}</td>
                <td>${tansferNull(item.plan_sum)}</td>
                <td>${tansferNull(item.report_sum)}</td>
                <td>${tansferNull(item.report_ctime)}</td>
                <td>${tansferNull(item.picking_ctime)}</td>
                <td>${tansferNull(item.depositqty)}</td>
                <td>${tansferNull(item.depositctime)}</td>
                <td>${tansferNull(item.orderstatus)}</td>
                <td>${tansferNull(item.ratio)==''?'0':item.ratio}%</td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="17" class="center">暂无数据</td></tr>';
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
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
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
                po_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
                wo_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
                plan_start_time: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
                plan_start_date: encodeURIComponent(parentForm.find('#plan_start_date').val().trim()),
                order: 'desc',
                sort: 'id'
            };           
            pageNo = 1;
            getWorkOrder();
        }
    });

    // 重置搜索框值
    $('body').on('click', '#searchForm .reset', function (e) {
        e.stopPropagation();
        resetAll();
        getWorkOrder();
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
