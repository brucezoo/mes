var layerModal,
    layerLoading,
    pageNo = 1,
    pageSize = 20,
    id,
    code = 'ZY03',
    check_id,
    mr_arr = [],
    ajaxData = {};
var typeStr = {
    ZY03: '委外定额领料',
    ZB03: '委外补料',
    ZY06: '委外定额退料',
    ZY05: '委外超耗补料',
    ZY04: '委外超发退料'
};

$(function () {
    resetParam();
    setAjaxData();
    getPickingList();
    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try {
            JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).type_code='ZB03';
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            var parentForm = $('#searchForm');
            parentForm.find('#code').val(ajaxData.code);
            parentForm.find('#type_code').val(ajaxData.type_code);

            // $('.el-select-dropdown-item[data-id=' + ajaxData.type_code + ']').addClass('selected');

            parentForm.find('#start_time_input').text(ajaxData.start_time);
            parentForm.find('#end_time_input').text(ajaxData.end_time);
            // parentForm.find('#start_time').val('');
            // parentForm.find('#end_time').val('');
            parentForm.find('#creator_name').val(ajaxData.creator_name);
            parentForm.find('#salesOrderCode').val(ajaxData.sales_order_code);
            parentForm.find('#supplierCode').val(ajaxData.LIFNR);
            parentForm.find('#DWERKS').val(ajaxData.DWERKS);
        } catch (e) {
            resetParam();
        }
    }
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        start_time: '',
        end_time: '',
        creator_name: '',
        code: '',
        type_code: 'ZB03',
        LIFNR: '',
        sales_order_code: '',
        DWERKS: '',
        cn_name: '',
        repairstatus: ''
    };
}

function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
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
    $('body').on('click', '.el-select-dropdown-item', function (e) {
        e.stopPropagation();
        var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval = $(this).attr('data-id'), formerVal = ele.find('.val_id').val();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
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


    $('body').on('click', '.item_submit', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行推送操作！?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            submint(id);
        });

    });
    $('body').on('click', '.delete', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行删除操作，请通知wms同步删除！', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            deletePicking(id);
        });

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
                start_time: parentForm.find('#start_time').val(),
                end_time: parentForm.find('#end_time').val(),
                creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                type_code: "ZB03",
                LIFNR: encodeURIComponent(parentForm.find('#supplierCode').val().trim()),
                sales_order_code: encodeURIComponent(parentForm.find('#salesOrderCode').val().trim()),
                DWERKS: encodeURIComponent(parentForm.find('#DWERKS').val().trim()),
                cn_name: encodeURIComponent(parentForm.find('#cn_name').val().trim()),
                repairstatus: encodeURIComponent(parentForm.find('#repairstatus').val().trim())
            };
            pageNo = 1;
            getPickingList();
        }
    });
    //重置搜索框值
    $('body').on('click', '#searchForm .reset', function (e) {
        e.stopPropagation();
        var parentForm = $('#searchForm');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        parentForm.find('#code').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#supplierCode').val('');
        parentForm.find('#salesOrderCode').val('');
        parentForm.find('#DWERKS').val('');
        parentForm.find('#repairstatus').val('');
        parentForm.find('#repairStatusText').val('--请选择--');
        resetParam();
        getPickingList();
    });

    $('body').on('click', '.el-checkbox_input_item', function (e) {
        $(this).toggleClass('is-checked');
        var id = $(this).attr("data-id")
        if ($(this).hasClass('is-checked')) {
            if (mr_arr.indexOf(id) == -1) {
                mr_arr.push(id);
            }
        } else {
            var index = mr_arr.indexOf(id);
            mr_arr.splice(index, 1);
        }
    });
    $('body').on('click', '#check_input_all', function (e) {
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            mr_arr = [];
            $('#work_order_table .table_tbody tr').each(function (k, v) {
                $(this).find('.el-checkbox_input_item').addClass('is-checked');
                mr_arr.push($(v).find('.el-checkbox_input_item').attr('data-id'));
            });

        } else {
            $('#work_order_table .table_tbody tr').each(function (k, v) {
                $(this).find('.el-checkbox_input_item').removeClass('is-checked');
                mr_arr.push($(v).find('.el-checkbox_input_item').attr('data-id'));
            });
            mr_arr = [];
        }
    });
    $('body').on('click', '.print_all', function (e) {
        e.stopPropagation();

        layer.confirm('是否合并领料单打印？', {
            icon: 3,
            btn: ['是','否'],
            closeBtn: 0,
            title: false,
            offset: '250px'
        },function(index){
            layer.close(index);
            getData()
        },function(index){
            layer.close(index);
            AjaxClient.get({
                url: URLS['outsource'].getBatchprinting + "?" + _token + "&ids=" + mr_arr,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    $('#print_list').html('')
                    rsp.results.forEach(function (item) {
                        showPrintList(item);
                    });
                    $("#print_list").show();
                    $("#print_list").print();
                    $("#print_list").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail', '打印失败！');
                }
            }, this)
        });

    })

    // 导出
    $('body').on('click', '#exportBtn', function (e) {
        var parentForm = $('#searchForm');
        var urlLeft = '';
        e.stopPropagation();
        var parentForm = $(this).parents('#searchForm');
        $('.el-sort').removeClass('ascending descending');
        ajaxData = {
            _token: '8b5491b17a70e24107c89f37b1036078',
            start_time: parentForm.find('#start_time').val(),
            end_time: parentForm.find('#end_time').val(),
            creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
            code: encodeURIComponent(parentForm.find('#code').val().trim()),
            type_code: 'ZB03',
            LIFNR: encodeURIComponent(parentForm.find('#supplierCode').val().trim()),
            sales_order_code: encodeURIComponent(parentForm.find('#salesOrderCode').val().trim()),
            DWERKS: encodeURIComponent(parentForm.find('#DWERKS').val().trim()),
            repairstatus: encodeURIComponent(parentForm.find('#repairstatus').val().trim())
        };
        for (var param in ajaxData) {
            urlLeft += `&${param}=${ajaxData[param]}`;
        }
        let url = "/OutMachineZy/FeedingExport?" + urlLeft;
        $('#exportExcel').attr('href', url)
    });

}

function getData() {
    AjaxClient.get({
        url: URLS['outsource'].getBatchprinting + "?" + _token + "&ids=" + mr_arr,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#print_list').html('');
            var num_str = {};
            if(rsp.results.length>0){
                rsp.results.forEach(function (item) {
                    if(!num_str.hasOwnProperty(item.type_code)){
                        num_str[item.type_code] = []
                    }
                    num_str[item.type_code].push(item)

                });
                for(var i in num_str){
                    setData(num_str[i])
                }
            }
            $("#print_list").show();
            $("#print_list").print();
            $("#print_list").hide();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', '打印失败！');
        }
    }, this)
}
function setData(data) {
    var formData = [];
    if(data.length>0){
        data.forEach(function (item) {
            var flag = true;
            var dataItem = {};
            formData.forEach(function (fitem) {
                if(fitem.partner_name == item.partner_name && fitem.LIFNR == item.LIFNR && fitem.DWERKS == item.DWERKS && fitem.sales_order_code == item.sales_order_code && fitem.time.substr(0,10) == item.time.substr(0,10)){
                    flag = false;
                    return false;
                }
            });
            if(flag){
                dataItem.groups = [];
                dataItem.DWERKS = item.DWERKS;
                dataItem.EBELN = item.EBELN;
                dataItem.LIFNR = item.LIFNR;
                dataItem.VBELN = item.VBELN;
                dataItem.code = item.code;
                dataItem.creator_id = item.creator_id;
                dataItem.ctime = item.ctime;
                dataItem.employee_id = item.employee_id;
                dataItem.employee_name = item.employee_name;
                dataItem.factory_code = item.factory_code;
                dataItem.from = item.from;
                dataItem.id = item.id;
                dataItem.mtime = item.mtime;
                dataItem.out_picking_id = item.out_picking_id;
                dataItem.partner_name = item.partner_name;
                dataItem.pick_id = item.pick_id;
                dataItem.sales_order_code = item.sales_order_code;
                dataItem.sales_order_project_code = item.sales_order_project_code;
                dataItem.status = item.status;
                dataItem.time = item.time.substr(0,10);
                dataItem.type = item.type;
                dataItem.type_code = item.type_code;
                formData.push(dataItem);
            }
        });

    }
    formData.forEach(function (fitem) {
        data.forEach(function (item) {
            if(fitem.partner_name == item.partner_name && fitem.LIFNR == item.LIFNR && fitem.DWERKS == item.DWERKS && fitem.sales_order_code == item.sales_order_code && fitem.time.substr(0,10) == item.time.substr(0,10)){

                item.groups.forEach(function (gitem) {
                    var flag = true;
                    fitem.groups.forEach(function (fgitem) {
                        if(gitem.material_code == fgitem.material_code){
                            fgitem.lc_number = (Number(fgitem.lc_number) + Number(gitem.lc_number)).toFixed(3);
                            fgitem.sap_number = (Number(fgitem.sap_number) + Number(gitem.sap_number)).toFixed(3);
                            fgitem.XQSL = (Number(fgitem.XQSL) + Number(gitem.XQSL)).toFixed(3);
                            fitem.sales_order_project_code = '';
                            fitem.EBELN = '';
                            flag = false;
                            return false;
                        }
                    })
                    if(flag){
                        fitem.groups.push(gitem);
                    }
                })
            }

        })
    })

    formData.forEach(function (item) {
        showPrintList(item)
    })
}

function showPrintList(formDate) {
    var materialsArr = [];
    var type_string = typeStr[formDate.type_code];
    if (formDate.groups.length > 0) {
        materialsArr = formDate.groups;
        var newObj = {
            one:[],
            two:[],
            three:[]
        };
        materialsArr.forEach(function (item) {
            if(item.material_code.substr(0,4)=="6105" || item.material_code.substr(0,2)=="99"){
                newObj.one.push(item);
            }else if(item.material_code.substr(0,4)=="6113"){
                newObj.two.push(item)
            }else {
                newObj.three.push(item)
            }
        })

        var plan_start_time = formDate.time,
            employee_name = tansferNull(formDate.employee_name),
            send_depot = formDate.DWERKS,
            partner_name = formDate.partner_name,
            EBELN = formDate.EBELN,
            workbench_name = '',
            sales_order_code = formDate.sales_order_code,
            sales_order_project_code = formDate.sales_order_project_code,
            dispatch_time = '',
            code = formDate.code;
        var tootle = Math.ceil(newObj.one.length / 3)+Math.ceil(newObj.two.length / 3)+Math.ceil(newObj.three.length / 3);
        var index = 1;
        for(var j in newObj){
            for (var i = 0; i < newObj[j].length;i = i + 3) {
                var _table = `<table style="table-layout：fixed" class="show_border">
                        <thead>
                            <tr>
                                <th style="height: 30px;width:100px;">物料编码</th>
                                <th style="width:100px;">浪潮编码</th>
                                <th  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">物料名称</th>
                                <th >SAP需求数量</th>
                                <th >需求数量</th>
                                <th >BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_no}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_number}${newObj[j][i].sap_unit_commercial}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_number}${tansferNull(newObj[j][i].lc_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].XQSL}${tansferNull(newObj[j][i].XQSLDW)}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_number + newObj[j][i + 1].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_number + tansferNull(newObj[j][i + 1].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].XQSL + tansferNull(newObj[j][i + 1].XQSLDW) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_number + newObj[j][i + 2].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_number + tansferNull(newObj[j][i + 2].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].XQSL + tansferNull(newObj[j][i + 2].XQSLDW) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
                        </tbody>
                      </table>`
                var print_html = `<div style="page-break-after: always;">
                                <div style="display: flex;">
                                    <div style="flex: 1"></div>
                                    <div style="flex: 9"><h3 style="text-align: center;">梦百合家居科技股份有限公司${type_string}单</h3></div>
                                    <div style="flex: 1">
                                        <p style="margin: 0;font-size: 5px;">白联：仓</p>
                                        <p style="margin: 0;font-size: 5px;">红联：财</p>
                                        <p style="margin: 0;font-size: 5px;">黄联：车</p>
                                        <p style="margin: 0;font-size: 5px;">${index}/${tootle}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}日期:</div>
                                            <div style="flex: 2;">${plan_start_time}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">仓库:</div>
                                            <div style="flex: 2;">${send_depot}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">单据编码:</div>
                                            <div style="flex: 2;">${code}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">供应商:</div>
                                            <div style="flex: 2;">${partner_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}人:</div>
                                            <div style="flex: 2;">${employee_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">工位:</div>
                                            <div style="flex: 2;">${tansferNull(workbench_name)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">销售订单号${sales_order_project_code?'/行项号':''}:</div>
                                            <div style="flex: 2;">${sales_order_code}${sales_order_project_code?'/'+sales_order_project_code:''}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">采购凭证号:</div>
                                            <div style="flex: 2;">${EBELN}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">配送时间:</div>
                                            <div style="flex: 2;">${dispatch_time}</div>
                                        </div>
                                    </div>
                                </div>
                                ${_table}
                                <div>
                                <div style="display: flex;height:40px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">发货人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">${type_string}人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">审批人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>`;
                index++;
                $('#print_list').append(print_html);
            }
        }

    }

}


//获取粗排列表
function getPickingList() {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    AjaxClient.get({
        url: URLS['outsource'].OutMachineZy + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layerLoading = LayerConfig('load');
            }
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            ajaxData.pageNo = pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            mr_arr = [];
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {

                createHtml($('#work_order_table .table_tbody'), rsp.results);
            } else {
                noData('暂无数据', 13);
            }
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation').html('');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试', 13);
        }
        ,
        complete: function () {
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }

    }, this)
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
            getPickingList();
        }
    });
}
function createHtml(ele, data) {
    ele.html('');
    data.forEach(function (item, index) {
        var tr = `
            <tr>
            <td>
			    <span class="el-checkbox_input el-checkbox_input_item" id="check_input_${item.id}" data-id="${item.id}">
                    <span class="el-checkbox-outset"></span>
                </span>
            </td>
            <td>${tansferNull(item.code)}</td>
            <td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
            <td>${tansferNull(item.LIFNR)}</td>
			<td>${checkReturnStatus(item.type_code)}（${item.type_code}）</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.DWERKS)}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.time)}</td>
            <td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '执行中' : item.status == 3 ? '入库中' : '')}</td>
            <td>${tansferNull(item.EBELN)}</td>
            <td>${tansferNull(item.printcount)}</td>
            <td>${tansferNull(item.cn_name)}</td>
            <td>${tansferNull(item.repairstatus == 1 ? '已审核' : '未审核')}</td>
			<td class="right">
	        <!-- <a class="button pop-button view" href="/Outsource/editOutsource?id=${item.id}&type=${item.type_code}">审核</a> -->
	         <a class="button pop-button view" href="/Out/editOut?id=${item.id}&type=${item.type_code}">审核</a>
	        </td>
			</tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });


}
function checkReturnStatus(type_code) {
    switch (type_code) {
        case 'ZY03':
            return '委外定额领料';
            break;
        case 'ZB03':
            return '委外补料';
            break;
        case 'ZY06':
            return '委外定额退料';
            break;
        case 'ZY05':
            return '委外超耗补料';
            break;
        case 'ZY04':
            return '委外超发退料';
            break;
        default:
            break;
    }
}


function submint(id) {
    AjaxClient.get({
        url: URLS['outsource'].pushOutMachineZy + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.RETURNCODE == 0) {
                LayerConfig('success', '推送成功！');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', 'SAP推送失败！错误日志为：' + rsp.message);
        }
    }, this)
}
function deletePicking(id) {
    AjaxClient.get({
        url: URLS['outsource'].destroyZy + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', '删除成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message);
        }
    }, this)
}

