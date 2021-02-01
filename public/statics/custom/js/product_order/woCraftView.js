var layerModal,
    layerLoading,
    pageNo = 1,
    status=2;
    pageSize = 20,
    work_order_code = '',
    e = {},
    ajaxData = {};

$(function () {
    getRankPlan();
    setAjaxData();
    getWorkOrder();
    bindEvent();
    getAllOperationList();
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
//获取班次
function getRankPlan() {
    AjaxClient.get({
        url: URLS['thinPro'].rankPlanList + '?' + _token + '&page_no=1&page_size=20',
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
            var lis = '', innerHtml = '';lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    var workStartTimeVal = dateToDayTime(item.from);
                    var workEndTimeVal = dateToDayTime(item.to);
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
                });
                innerHtml = `${lis}`;
                $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
        }
    })
}

function getAllOperationList() {
    AjaxClient.get({
        url: URLS['woCraftView'].getAllOperations + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            let operationList = rsp.results.list;
            let liHtml = '<li data-id="" class="el-select-dropdown-item">--请选择--</li>';
            if (operationList.length) {
                operationList.forEach(function(item) {
                    liHtml += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`;
                })
            }
            $('#select-operation').html(liHtml);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取工序列表失败，请刷新重试', 16);
        },
        complete: function () {
           
        }
    }, this)
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
        sell_order_no: '',
        sell_order_row_no: '',
        po_no: '',
        wo_no: '',
        rankplan: '',
        plan_status: '',
        picking_status: '',
        report_status: '',
        operation_id:'',
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
    parentForm.find('#proScheduleState').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#acquisitionState').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#opState').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#operation_id').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
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
        url: URLS['woCraftView'].getAllOrderList + '?' + _token + urlLeft,
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

            var routChangeHtml = '';
            if (item.version_change == 1) {
                routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
            }

            trs += `
            <tr>
                <td>${routChangeHtml}</td>
                <td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
                <td>${tansferNull(item.po_no)}</td>
                <td>${tansferNull(item.wo_no)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td width="200px;">${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.qty)}</td>     
                <td>${tansferNull(item.work_shop_name)}</td>       
                <td>${tansferNull(item.work_center_name)}</td>            
                <td>${tansferNull(!item.work_bench_name?'':item.work_bench_name)}</td>            
                <td>${tansferNull(item.factory_name)}</td>
                <td>${tansferNull(item.plan_start_time)}</td>
                <td>${tansferNull(item.inspur_sales_order_code)}</td>
                <td>${tansferNull(item.inspur_material_code)}</td>
                <td>${tansferNull(item.old_version)}.0</td>
                <td>${tansferNull(item.on_off==0?'订单关闭':'订单开启')}</td>
                <td>${tansferNull(item.plan_status==0?'未排':item.plan_status==1?'主排':item.plan_status==2?'细排':'--')}</td>
                <td>${tansferNull(item.picking_status==0?'未领料':item.picking_status==1?'领料中':item.picking_status==2?'已领料':'')}</td>
                <td>${tansferNull(item.report_status==0?'未报工':item.report_status==1?'报工中':item.report_status==2?'已报工':'')}</td>
                <td width="200px;" class="right">
                    <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}&state=1">查看</a>
                    <button class="button pop-button view viewAttachment" data-id="${item.work_order_id}" data-type="1">附件</button>
                    <button class="button pop-button view viewProcess" data-wo-number="${item.wo_no}" data-operation-id="${item.operation_id}" data-sales-order-code="${item.sales_order_code}" data-sales-order-project-code="${item.sales_order_project_code}" data-id="${item.work_order_id}">销售订单工艺</button>
                    <button class="button pop-button view viewRouing" data-id="${item.work_order_id}">工艺文件</button>
                    <button class="button pop-button view uploadFile" data-id="${item.work_order_id}" data-wo-number="${item.wo_no}">上传临时工艺</button>
                </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="17" class="center">暂无数据</td></tr>';
    }
    return trs;
}

function bindEvent() {
    // 点击工艺变更红标识
    $('body').on('click', '.version-change', function () {
        let desc = $(this).attr('data-desc');
        let oldVersion = $(this).attr('data-oldVersion') + '.0';
        let newVersion = $(this).attr('data-newVersion') + '.0';
        layerModal = layer.open({
            type: 1,
            title: '信息',
            offset: '100px',
            area: ['400px', '300px'],
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: false,
            content: `<form class="viewAttr formModal" style="width: 340px;margin: 0 auto;">
                        <div style="height: 40px;text-align: left;">
                            <span>当前工单版本：</span>
                            ${oldVersion}
                        </div>
                        <div style="height: 40px;text-align: left;">
                            <span>工艺新版本：</span>
                            ${newVersion}
                        </div>
                        <div style="height: 120px;text-align: left;">
                            <span>新版本描述：</span>
                            ${desc}
                        </div>
                    </form>`,
            success: function (layero, index) {
            
            },
            end: function () {
                
            }

        })
    });

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
                sell_order_no: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sell_order_row_no: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                po_no: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
                wo_no: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
                plan_status: encodeURIComponent(parentForm.find('#proScheduleState').val().trim()),
                picking_status: encodeURIComponent(parentForm.find('#acquisitionState').val().trim()),
                report_status: encodeURIComponent(parentForm.find('#opState').val().trim()),
                operation_id: encodeURIComponent(parentForm.find('#operation_id').val().trim()),
                rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
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
