

WorkReport(function (wr) {
    var table = wr.init_PageListData();
    wr.init_BindEvent(table);
});

function WorkReport(AppName) {

    var obj = function () { };

    var statusMsg = {
        0: '未发布',
        1: '已拆单',
        2: '已排产',
        3: '领料中',
        4: '已领料',
        5: '部分报工',
        6: '完工'
    };

    var els = {
        'DataTable': $("#DataTable")
    }

    obj.prototype.init_PageListData = function () {
        var table = obj.DataTable(els.DataTable, {
            ajax: {
                type: 'GET',
                url: obj.GetWOrders({}, true),
                beforeSend: function () {
                    layer.load(2);
                }
            },
            columns: [
                {
                    title: '销售订单号/行项号', render: function (a, b, c) {
                        if (!c.sales_order_code && c.sales_order_project_code == 0) {
                            return '<span style="color:red">暂缺</span>';
                        }
                        return c.sales_order_code + (c.sales_order_project_code != 0 ? "/" + c.sales_order_project_code : '');
                    }
                },
                {
                    title: '生产订单号', data: 'po_number', render: function (a, b, c) {
                        var sv = $('input[name="productOrder_no"]').val();
                        if (sv) {
                            c.po_number = c.po_number.replace(sv, '<span style="color:red">' + sv + '</span>');
                        }
                        return c.po_number;
                    }
                },
                {
                    title: '工单号', render: function (a, b, c) {
                        var sv = $('input[name="workOrder_no"]').val();
                        if (sv) {
                            c.wo_number = c.wo_number.replace(sv, '<span style="color:red">' + sv + '</span>');
                        }
                        return c.wo_number;
                    }
                },
                {
                    title: '物料相关', render: function (a, b, c) {
                        c = JSON.parse(c.out_material);
                        var sv = $('input[name="materiel_no"]').val();
                        if (sv) {
                            c[0].item_no = c[0].item_no.replace(sv, '<span style="color:red">' + sv + '</span>');
                        }
                        if (c[0].item_no == c[0].name) {
                            return "<p><b>" + c[0].item_no + "</b></p><p>" + c[0].material_category_name + '<span style="color:red"></span>&nbsp;-&nbsp;' + c[0].material_attributes.length + '</p>';
                        }
                        return '<p><b>' + c[0].item_no + '</b></p><p>' + c[0].name + '</p>';
                    }, width: '200px'
                },
                { title: '数量', data: 'qty' },
                { title: '工作中心', data: 'work_center' },
                { title: '工厂', data: 'factory_name' },
                {
                    title: '计划日期', render: function (a, b, c) {
                        return c.work_station_time == 0 ? '<span style="color:red">暂缺</span>' : c.work_station_time;
                    }
                },
                {
                    title: '实际排产日期', render: function (a, b, c) {
                        if (c.status == 0) {
                            return '<span style="color:red">尚未细排</span>';
                        }
                        return '<p>工时 [ ' + dateDiff(c.plan_diff_time) + ' ]</p>' +
                            '<p>' + c.plan_start_time + ' ~ ' + c.plan_end_time + '</p>';
                    }
                },
                { title: '浪潮销售订单号	', data: 'inspur_sales_order_code' },
                { title: '浪潮物料号', data: 'inspur_material_code' },
                {
                    title: '工单状态', render: function (a, b, c) {
                        var status = 0;
                        if (c.po_status != 0) {
                            if (c.po_status == 2 || c.po_status == 3) { // PO单状态为2、3
                                status = 1;
                                if (c.wt_status == 2) {
                                    status = 2;
                                }
                            }
                        }
                        return statusMsg[status];
                    }
                },
                {
                    title:
                        `<div style="float:left;margin-right:10px;">工序</div>
                        <div class="TableHeadTips">
                            <div class="box GXupper">&nbsp;</div><div class="msg">上道</div>
                            <div class="box GXcurrent">&nbsp;</div><div class="msg">当前</div>
                            <div class="box GXnext">&nbsp;</div><div class="msg">后道</div>
                        </div>
                    </div>`,
                    defaultContent: '<i class="ace-icon fa fa-spinner fa-spin light-grey bigger-110"></i>'
                },
                { title: '后道加工商', defaultContent: '<i class="ace-icon fa fa-spinner fa-spin light-grey bigger-110"></i>' },
            ]
        }, tableInitRun);
        table.on('draw.dt', function () {
            tableInitRun(table);
        });
        // private dateDiff 人性化的显示时间
        // date 两个日期的差值，秒
        function dateDiff(date) {
            var daysRound = Math.floor(date / 60 / 60 / 24);
            var hoursRound = Math.floor(date / 60 / 60 - (24 * daysRound));
            var minutesRound = Math.floor(date / 60 - (24 * 60 * daysRound) - (60 * hoursRound));
            var secondsRound = Math.floor(date - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound));
            if (hoursRound <= 0) {
                return "<b>" + minutesRound + "</b>分<b>" + secondsRound + "</b>秒";
            }
            if (daysRound <= 0) {
                return "<b>" + hoursRound + "</b>时<b>" + minutesRound + "</b>分<b>" + secondsRound + "</b>秒";
            }
            return "<b>" + daysRound + "</b>天<b>" + hoursRound + "</b>时<b>" + minutesRound + "</b>分<b>" + secondsRound + "</b>秒";
        }
        // private 表格加载完成时调用
        function tableInitRun(table) {
            tableShowTraceTechnics(table);
            tableShowStatus(table);
        }
        // private 取得表格中某一列的值集合
        // table    Datatable object
        // fn       列名称
        function tableGetFieldList(table, fn) {
            var i = 0, data = table.data(), ret = [];
            for (; i < data.length; i++) {
                ret.push(data[i][fn]);
            }
            return ret;
        }
        // private 在表格上显示工序
        function tableShowTraceTechnics(table) {
            if ($(document).data('AjaxTraceTechnicIsLock') == true) {
                return;
            }
            $(document).data('AjaxTraceTechnicIsLock', true);
            var xhr = obj.GetTraceTechnics(tableGetFieldList(table, 'poid'), function (resp) {
                // tempCheckData 防止因拆单后多道工序重复显示
                var i = 0, tempCheckData = {}, lastOpid = [];
                for (; i < table.rows()[0].length; i++) {
                    var row = els.DataTable.find("tr:eq(" + (i + 1) + ")");   // 行
                    var col = row.find('td:eq(12)');                    // 列
                    var dat = table.row(row).data();                    // 行 数据
                    var tec = [];
                    var color = 'GXupper', currentIndex = -1;
                    if (typeof resp[dat.poid] == 'undefined') {
                        continue;
                    }
                    resp[dat.poid].forEach(function (v, i) {
                        var k = dat.work_order_id + '_' + '_' + v.opid;
                        if (typeof tempCheckData[k] != 'undefined') {
                            return true;
                        }
                        if (v.wtid == dat.wtid) {
                            currentIndex = i;
                            color = 'GXnext';
                            tec.push('<span class="GXcurrent" style="padding:1px 5px;">' + v.opname + '</span>');
                        } else {
                            if (typeof resp[dat.poid][i + 1] != 'undefined' && resp[dat.poid][i + 1].wtid == dat.wtid) {
                                currentIndex = i;
                                color = 'GXnext';
                                tec.push('<span class="GXcurrent" style="padding:1px 5px;">' + v.opname + '</span>');
                            } else {
                                tec.push('<span class="' + color + '" style="padding:1px 5px;">' + v.opname + '</span>');
                            }
                        }
                        tempCheckData[k] = 1;
                    });
                    table.cell(row, col).data(tec.join('<i class="fa fa-angle-right" style="padding:0px 4px;font-size:120%;vertical-align:bottom;color:#ccc;"></i>'));
                    col.find('.GXcurrent:last').prev().prev().removeClass('GXcurrent').addClass('GXupper');
                    var GxElement = col.find('.GXnext:first');
                    // 后道工序处理逻辑
                    col = row.find('td:eq(13)');                    // 列
                    if (GxElement.length <= 0) {
                        table.cell(row, col).data('<span style="color:red">自制</span>');
                        continue;
                    }
                    // 后道工序数据
                    lastOpid.push({
                        woid: dat.work_order_id,
                        opid: resp[dat.poid][currentIndex + 1].opid,
                        data: JSON.parse(dat.confirm_number)
                    });
                }
                // 委外PO单 110000042044
                obj.GetLastGxInfo(lastOpid, function (resp) {
                    var i = 0;
                    for (; i < table.rows()[0].length; i++) {
                        var row = els.DataTable.find("tr:eq(" + (i + 1) + ")");   // 行
                        var dat = table.row(row).data();                    // 行 数据
                        var td = table.cell(row, row.find('td:eq(13)'));
                        if (typeof resp[dat.work_order_id] == 'undefined') {
                            td.data('<span style="color:red">自制</span>');
                        } else {
                            var r = resp[dat.work_order_id];
                            if (typeof r == 'string') {
                                r = r.split('_');
                                switch (r[0]) {
                                    case 'unknown:BANFN':
                                        r[1] = r[1].split('#');
                                        td.data('<span style="color:red">自制： ' + r[1][1] + '（' + r[1][0] + '）</span>');
                                        break;
                                    case 'unknown:pickid':
                                        td.data('<span style="color:red">无采购凭证，采购申请编号 ' + r[1] + '</span>');
                                        break;
                                    case 'unknown:lifnr':
                                        td.data('<span style="color:red">无供应商编号，采购凭证ID ' + r[1] + '</span>');
                                        break;
                                    case 'unknown:partner':
                                        td.data('<span style="color:red">供应商不存在，编号 ' + r[1] + '</span>');
                                        break;
                                }
                            } else {
                                td.data('<p>' + r.name + '</p><p>' + r.phone + '</p>');
                            }
                        }
                    }
                    table.columns.adjust();
                });
                table.columns.adjust();
            });
            xhr.always(function () {
                $(document).data('AjaxTraceTechnicIsLock', false);
            });
        }
        // private 在表格上显示工单状态
        function tableShowStatus(table) {
            if ($(document).data('AjaxStatusIsLock') == true) {
                return;
            }
            $(document).data('AjaxStatusIsLock', true);
            var xhr = obj.GetStatus(tableGetFieldList(table, 'work_order_id'), function (resp) {
                var i = 0;
                for (; i < table.rows()[0].length; i++) {
                    var row = els.DataTable.find("tr:eq(" + (i + 1) + ")");   // 行
                    var col = row.find('td:eq(11)');                    // 列
                    var dat = table.row(row).data();
                    if (typeof resp[dat.work_order_id] != 'undefined') {
                        var status = resp[dat.work_order_id];
                        col.html(statusMsg[status]);
                    }
                }
                table.columns.adjust();
            });
            xhr.always(function () {
                $(document).data('AjaxStatusIsLock', false);
            });
        }
        return table;
    }

    obj.prototype.init_BindEvent = function (table) {
        obj.SearchEffect();
        $('.submit').on('click', table.draw);
        $('.reset').on('click', function () {
            $('#searchSTallo_from')[0].reset();
            table.draw();
        });
    }

    // Ajax 获得工单列表
    obj.prototype.GetWOrders = function (opts, successCallback) {
        opts = opts ? opts : {};
        opts.page_no = typeof (opts.page_no) == 'undefined' ? 1 : opts.page_no;
        opts.page_size = typeof (opts.page_size) == 'undefined' ? 20 : opts.page_size;
        opts.status = typeof (opts.status) == 'undefined' ? 2 : opts.status;
        opts._token = TOKEN;
        var url = '/WorkOrder/pageIndex?' + $.param(opts);
        if (typeof successCallback != 'function' && successCallback == true) {
            return url;
        }
        return $.get(url, function (resp) {
            typeof successCallback == 'function' && successCallback(resp.results);
        }, 'json');
    }

    // Ajax 获得工单隶属的生产工单的工艺列表
    obj.prototype.GetTraceTechnics = function (poids, successCallback) {
        var opts = {
            poid: poids.join(','),
            _token: TOKEN
        };
        var url = '/WorkOrder/getTraceTechnics?' + $.param(opts);
        if (typeof successCallback != 'function' && successCallback == true) {
            return url;
        }
        return $.get(url, function (resp) {
            typeof successCallback == 'function' && successCallback(resp.data);
        }, 'json');
    }

    // Ajax 获得工单状态列表
    obj.prototype.GetStatus = function (woids, successCallback) {
        var opts = {
            woid: woids.join(','),
            _token: TOKEN
        };
        var url = '/WorkOrder/getStatus?' + $.param(opts);
        if (typeof successCallback != 'function' && successCallback == true) {
            return url;
        }
        return $.get(url, function (resp) {
            typeof successCallback == 'function' && successCallback(resp.data);
        }, 'json');
    }

    // Ajax 获得工单最后一个工序的供应商
    obj.prototype.GetLastGxInfo = function (data, successCallback) {
        var url = '/WorkOrder/getLastGxInfo?_token=' + TOKEN;
        if (typeof successCallback != 'function' && successCallback == true) {
            return url;
        }
        return $.post(url, { data: data, _token: TOKEN }, function (resp) {
            typeof successCallback == 'function' && successCallback(resp.data);
        }, 'json');
    }

    // 表格组件
    obj.prototype.DataTable = function (element, option, successCallback) {
        var tableHeight = $(window).height();
        tableHeight -= $('#navbar').height();
        tableHeight -= $('#breadcrumbs').height();
        tableHeight -= $('#searchForm').height();
        tableHeight -= 100;
        var table = element.DataTable({
            searching: false,       // 关闭其自带的搜索功能
            bLengthChange: false,   // 不允许改变表格每页显示的记录数
            processing: false,      // 不显示处理状态，已使用其它方案
            serverSide: true,       // 从服务器端刷数据
            paging: true,           // 开启分页功能
            iDisplayLength: 120,    // 每页列举内容数量
            ordering: false,        // 关闭排序功能
            // 固定表头
            scrollY: tableHeight + "px",
            scrollX: true,
            scrollCollapse: true,
            fixedColumns: {
                leftColumns: 3,
                heightMatch: 'semiauto'
            },
            // 语言配置
            oLanguage: {
                sProcessing: '',
                sLengthMenu: '每页显示_MENU_条 ',
                oPaginate: { sFirst: '首页', sLast: '尾页', sNext: '下一页', sPrevious: '上一页' },
                sEmptyTable: '<div class="icon text-danger"></div>',
                sInfo: '当前_START_至_END_条 共_TOTAL_条数据',
                sInfoFiltered: '(有 _MAX_ 条结果过滤)',
                sZeroRecords: '没有找到匹配的记录',
                sInfoEmpty: ''
            },
            aoColumnDefs: [{
                className: 'control',
                orderable: false,
                targets: 0,
                bSortable: false
            }],
            order: typeof (option.order) === 'undefined' ? [1, 'asc'] : option.order,
            ajax: $.extend({}, {
                type: 'POST',
                beforeSend: function () {
                    layer.load(2);
                },
                data: function (data, table) {
                    var SDat = {
                        paging: { pn: data.start, pl: data.length }
                    };
                    $.each($('#searchSTallo_from').serializeArray(), function (i, input) {
                        if (input.value) {
                            if (typeof SDat.search == 'undefined') {
                                SDat.search = {};
                            }
                            SDat.search[input.name] = input.value;
                        }
                    });
                    return SDat;
                },
                dataSrc: function (resp) {
                    return resp.results;
                }
            }, option.ajax),
            columns: option.columns
        });
        // private 外部CSS更变滚动条样式，导致固定列与其它行之间不对齐，此处处理
        // 在表格事件内部调用
        function tableFixedAdjustment() {
            var height = 0;
            height = $('.DTFC_LeftBodyWrapper').height() - 1;
            $('.DTFC_LeftBodyWrapper,.DTFC_LeftBodyLiner').css('height', height + 'px');
            height = $('.DTFC_LeftBodyLiner tbody tr:first').height() - 0.5;
            $('.DTFC_LeftBodyLiner tbody tr:first').css('height', height + 'px');
        }
        table.on('init.dt', function (e) {
            layer.closeAll();
            $('#DataTable_wrapper').css('width', $('#pageMain').width() + 'px');
            tableFixedAdjustment();
            // callback
            typeof (successCallback) == 'function' && successCallback(table);
        });
        table.on('column-sizing.dt', function (e) {
            layer.closeAll();
            tableFixedAdjustment();
        });
        // table.on('page.dt', function () {
        //     var page = table.page.info();
        // });
        return table;
    }

    // 搜索显示效果
    obj.prototype.SearchEffect = function () {
        laydate.render({ elem: '#work_station_time', range: true });
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

    obj = new obj();
    if (typeof (AppName) == 'function') {
        return AppName(obj);
    }
    return obj;
}