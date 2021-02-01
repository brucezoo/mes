var layerModal,
    layerLoading,
    pageNo=1,
    itemPageNo=1,
    pageSize=20,
    push_type=1,
    ajaxData={},
    mr_arr= [],
    workbench_id_all='',
    status_all='',
    type_all='',
    ajaxItemData={};
$(function () {
    getRankPlan();
    setAjaxData();
    getDeplants('');
    if(!itemPageNo){
        itemPageNo=1;
    }
    $('.el-tap[data-status='+push_type+']').addClass('active').siblings('.el-tap').removeClass('active');
    if(push_type==1){
        $('.send_deport_wrap').show();
        $('.picking_all').show();
    }else {
        $('.send_deport_wrap').hide();
        $('.picking_all').hide();
    }
    getPickingList(push_type);
    bindEvent();
    $('#storage_wo').autocomplete({
        url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
        param:'depot_name'
    });

    $('#employee').autocomplete({
        url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });
    $('#workBench').autocomplete({
        url: URLS["pickAll"].benchList+"?"+_token+"&page_no=1&page_size=10",
        param:"name",
        showCode:"workbench_name"
    });
});

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.push_type;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            push_type=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).push_type;
        }catch (e) {
            resetParam();
        }
    }
}
function bindPagenationClick(totalData,pageSize,push_type){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getPickingList(push_type);
        }
    });
}
//获取厂区列表
function getDeplants(val) {
    AjaxClient.get({
        url: URLS['picking'].getAllFactory + _token,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (rsp) {
            if (rsp.results && rsp.results.length) {
                var lis = '',
                    innerhtml = '';
                rsp.results.forEach(function (item, index) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                })
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.abilitySelect').find('.el-select-dropdown-list').html(innerhtml);
                if (val.length) {
                    val.forEach(function (item) {
                        $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id=' + item.id + ']').click();

                    })
                }
            }
        },
        fail: function (rsp) {
            layer.msg('获取厂区列表失败', {
                icon: 5,
                offset: '250px',
                time: 1500
            });
        }
    }, this);
}

//重置搜索参数
function resetParam(){
    ajaxData={
        sales_order_code: '',
        sales_order_project_code: '',
        code: '',
        work_order_code: '',
        product_order_code: '',
        inspur_sales_order_code: '',
        inspur_material_code: '',
        type: '',
        rankplan: '',
        employee_name  : '',
        line_depot_id: '',
        workbench_id: '',
        is_depot_picking:'',
        send_deport:'',
        status: '',
        factory_id: '',
        dispatch_start_time:'',
        dispatch_end_time:'',

    };
}

//获取领料列表
function getPickingList(push_type){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].MaterialRequisition+"?"+_token+urlLeft+"&push_type="+push_type,
        dataType: 'json',
        cache:false,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            mr_arr=[];
            ajaxData.pageNo=pageNo;
            ajaxData.push_type=push_type;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
			$('.table_page').html(_html);
			
			if (rsp.paging.total_records < 20) {
				$('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
			} else {
				$('#total').css('display', 'none').text(' ');
			}

            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,push_type);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',16);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成领料列表数据
function createHtml(data){
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            trs+= `
			<tr data-id="${item.material_requisition_id}">
			<td>
			    <span class="el-checkbox_input el-checkbox_input_item" 
			          id="check_input_${item.material_requisition_id}" 
			          data-id="${item.material_requisition_id}"
			          data-status="${item.status}"
			          data-type="${item.type}">
                    <span class="el-checkbox-outset"></span>
                </span>
            </td>
            <td style="color: red">${tansferNull(item.type==7 && item.qc_is_delete == 3 ?'质检不同意删除':'')}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.sale_order_code)}</td>
			<td>${tansferNull(item.sale_order_project_code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.line_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.workbench_name)}</td>
            <td>${item.push_type == 0 ?
                `<span style="display: inline-block;border: 1px solid red;color: red;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">线边</span>`
                :item.push_type == 1 ?
                    `<span style="display: inline-block;border: 1px solid green;color: green;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">SAP</span>`
                    :item.push_type == 2 ?
                        `<span style="display: inline-block;border: 1px solid #debf08;color: #debf08;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">车间</span>`:
                        ''
                }
            </td>			
            <td>${tansferNull(item.employee_name)}</td>
			<td style="color: ${item.status==3?'red':''}">${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
			<td>${tansferNull(checkType(item.type))}</td>
			<td>${tansferNull(item.inspur_sales_order_code)}</td>
			<td>${tansferNull(item.inspur_material_code)}</td>
			<td>${tansferNull(item.send_depot)}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.dispatch_time)}</td>
			<td>${tansferNull(item.printingcount)}</td>
			<td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>
	         ${(item.status == 2||item.status == 1) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" data-status="${item.status}" class="button pop-button delete">删除</button>`:''}
	         ${(item.push_type==0&&item.status == 4) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button returnAudit">反审</button>`:''}
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="18" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">
                            <span class="el-checkbox_input el-checkbox_input" id="check_input_all">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th class="left nowrap tight"></th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发送至</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">浪潮销售订单号</th>
                        <th class="left nowrap tight">浪潮物料号</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">配送时间</th>
                        <th class="left nowrap tight">打印次数</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
		</div>
		<div id="total" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}

function check(id) {
    AjaxClient.get({
        url: URLS['work'].check +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');

                getPickingList(push_type);

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}
function returnAudit(id) {
    AjaxClient.get({
        url: URLS['work'].returnAudit +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');
                getPickingList(push_type);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function deleteItem(id, deleteReason) {
    AjaxClient.post({
        url: URLS['work'].deleteMergerPicking,
        data:{
            material_requisition_id:id,
            _token:TOKEN,
            delete_reason: deleteReason
        },
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','删除成功！');
            getPickingList(push_type);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function submint(id,type) {
    AjaxClient.get({
        url: URLS['work'].submit +"?"+ _token + "&id=" + id+ "&type=" + type+ "&date=" + " " + "&time=" + " ",
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                layer.confirm('推送成功！', {
                    icon: 1,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                    getPickingList(push_type);
                });


            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message)
        }
    }, this)
}
function resetAll() {
    var parentForm=$('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#work_order_code').val('');
    parentForm.find('#product_order_code').val('');
    parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    pageNo = 1;
    resetParam();
}
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
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
//获取班次
function getRankPlan() {
    AjaxClient.get({
        url: URLS['thinPro'].rankPlanList + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (rsp) {
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
            layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
        }
    })
}

function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var _type = $(this).attr('data-status');
            push_type=_type;
            if(push_type==1){
                $('.send_deport_wrap').show();
                $('.picking_all').show();
            }else {
                $('.send_deport_wrap').hide();
                $('.picking_all').hide();
            }

            if (push_type == 0) {
                $('.update-receive-batch').hide();
            } else {
                $('.update-receive-batch').show();
            }

            resetAll();
            getPickingList(push_type);
        }
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

    $('body').on('click','.choose_status',function(e){
        e.stopPropagation();
        var type = $(this).attr('data-id');
        var _html = chooseStatus(type);
        $('#show_status').html(_html);
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
//更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });
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
    $('body').on('click','.el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $(document).keydown(function(event){
        if(event.keyCode == 13){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('backageground','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                var parentForm=$("#searchForm .submit").parents('#searchForm');
                $('.el-sort').removeClass('ascending descending');
                ajaxData={
                    code: encodeURIComponent(parentForm.find('#code').val().trim()),
                    work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                    product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                    type: encodeURIComponent(parentForm.find('#type').val().trim()),
                    status: encodeURIComponent(parentForm.find('#status').val().trim()),
                    send_deport: encodeURIComponent(parentForm.find('#send_deport').val().trim()),
                };
                pageNo=1;
                getPickingList(push_type);
            }
        }
    });
    //搜索
    $('body').on('click','#searchForm .submit',function(e){
        e.stopPropagation();
        e.preventDefault();
        var parentForm=$(this).parents('#searchForm');

        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('backageground','transparent');
        });
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';
        var $workBench=$('#workBench');
        var workbench_id=$workBench.data('inputItem')==undefined||$workBench.data('inputItem')==''?'':
            $workBench.data('inputItem').workbench_name==$workBench.val().trim().replace(/\（.*?）/g,"")?$workBench.data('inputItem').workbench_id:'';
        $('.arrow .el-input-icon').removeClass('is-reverse');
        workbench_id_all=storage_wo;
        type_all=encodeURIComponent(parentForm.find('#type').val().trim());
        status_all=encodeURIComponent(parentForm.find('#status').val().trim());
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            $('.el-sort').removeClass('ascending descending');
            ajaxData={
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                is_depot_picking: encodeURIComponent(parentForm.find('#is_depot_picking').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
                inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
                type: encodeURIComponent(parentForm.find('#type').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
                employee_name: encodeURIComponent(parentForm.find('#employee').val().trim()),
                rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
                send_deport: encodeURIComponent(parentForm.find('#send_deport').val().trim()),
                workbench_id: workbench_id,
                line_depot_id: storage_wo,
                factory_id: encodeURIComponent(parentForm.find('#factory_id').val().trim()),
                dispatch_start_time: parentForm.find('#start_time').val(),
                dispatch_end_time: parentForm.find('#end_time').val(),
            };
            pageNo=1;
            getPickingList(push_type);
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#code').val('');
        parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#is_depot_picking').val('');
        parentForm.find('#inspur_sales_order_code').val('');
        parentForm.find('#inspur_material_code').val('');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#factory_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#storage_wo').val('');
        parentForm.find('#employee').val('');
        parentForm.find('#workBench').val('');
        parentForm.find('#send_deport').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        pageNo=1;
        resetParam();
        getPickingList(push_type);
    });
    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id,type);
        });

    });


    $('body').on('click','.delete',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var status = $(this).attr('data-status');
        var type = $(this).attr('data-type');

        var str = '';
        if(status==1){
            str = "您将执行删除操作！";
        }
        if(status==2){
            str = "注意：删除【已推送】状态的领料单，请同时联系仓库部对应删除，否则会造成数据不同步！"
        }

        // 判断补料
        if (type == 7) {
            str += "<div><label for='delete-reason'><span style='color: red;'>*</span>删单理由： </label><input type='text' class='el-input' id='delete-reason'  /></div>";
        }

        layer.confirm(str, {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            // 判断补料
            if (type == 7) {
                var deleteReason = $('#delete-reason').val().trim();
                if (!deleteReason) {
                    alert('请填写删单理由！');
                    return;
                }

                layer.close(index);
                deleteItem(id, deleteReason);
            } else {
                layer.close(index);
                deleteItem(id);
            }
        });

    });
    $('body').on('click','.item_check',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            check(id);
        });

    });
    $('body').on('click','.returnAudit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            returnAudit(id);
        });

    });


    $('body').on('click','.el-checkbox_input_item',function(e){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id")
        if($(this).hasClass('is-checked')){
            if(mr_arr.indexOf(id)==-1){
                mr_arr.push(id);
            }
        }else{
            var index=mr_arr.indexOf(id);
            mr_arr.splice(index,1);
        }
    });
    $('body').on('click','#check_input_all',function(e){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id")
        if($(this).hasClass('is-checked')){
            mr_arr=[];
            $('#work_order_table .table_tbody tr').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').addClass('is-checked');
                mr_arr.push($(v).attr('data-id'));
            });

        }else{
            $('#work_order_table .table_tbody tr').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').removeClass('is-checked');
                mr_arr.push($(v).attr('data-id'));
            });
            mr_arr=[];
        }
    });
    $('body').on('click','.picking_all',function (e) {
        e.stopPropagation();
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').depot_name:'';

        if(workbench_id_all==''){
            layer.confirm("请选择线边仓!", {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        }else
        if(mr_arr.length==0){
            layer.confirm("请选择领料单!", {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        }else if(type_all!=1){
            layer.confirm("请筛选出所有的领料单!", {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        }else if(status_all!=1){
            layer.confirm("请筛选出所有未推送的领料单!", {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        }else {
            window.location.href = '/PickingAll/addPickingAllItems?'+'&workbench_id='+workbench_id_all+'&workBenchName='+storage_wo+'&banchs='+mr_arr;
        }
    });
    $('body').on('click','.print_all',function (e) {
        e.stopPropagation();
        AjaxClient.get({
            url: URLS['work'].getBatchprinting +"?"+ _token + "&material_requisition_id=" + mr_arr,
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
                LayerConfig('fail','打印失败！');
            }
        }, this)

    })
    $('body').on('click','.print',function (e) {
        e.stopPropagation();


    })

    $('body').on('click', '.el-form-item-div .export', function (e) {
      e.stopPropagation();
      var parentForm=$(this).parents('#searchForm');
      var urlLeft='';
      $('#searchForm .el-item-hide').slideUp(400,function(){
        $('#searchForm .el-item-show').css('backageground','transparent');
      });
      var $storage_wo=$('#storage_wo');
      var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
          $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';
      var $workBench=$('#workBench');
      var workbench_id=$workBench.data('inputItem')==undefined||$workBench.data('inputItem')==''?'':
          $workBench.data('inputItem').workbench_name==$workBench.val().trim().replace(/\（.*?）/g,"")?$workBench.data('inputItem').workbench_id:'';  
      $('.arrow .el-input-icon').removeClass('is-reverse');
  
      pickAjaxData={
        sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
        sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
        code: encodeURIComponent(parentForm.find('#code').val().trim()),
        work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
        is_depot_picking: encodeURIComponent(parentForm.find('#is_depot_picking').val().trim()),
        product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
        inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
        inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
        type: encodeURIComponent(parentForm.find('#type').val().trim()),
        status: encodeURIComponent(parentForm.find('#status').val().trim()),
        employee_name: encodeURIComponent(parentForm.find('#employee').val().trim()),
        rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
        send_deport: encodeURIComponent(parentForm.find('#send_deport').val().trim()),
        workbench_id: workbench_id,
        line_depot_id: storage_wo,
        factory_id: encodeURIComponent(parentForm.find('#factory_id').val().trim()),
        dispatch_start_time: parentForm.find('#start_time').val(),
        dispatch_end_time: parentForm.find('#end_time').val(),
        is_merger:2,
        push_type:push_type,
        order: 'desc',
        sort: 'id'
      };
      for (var param in pickAjaxData) {
        urlLeft += `&${param}=${pickAjaxData[param]}`;
      }
      let url = "/MaterialRequisition/getListexport?" +_token+ urlLeft;
      $('#exportExcel').attr('href', url)
    })

    // 一键入库
    $('body').on('click','.update-receive-batch',function (e) {
        e.stopPropagation();

        if (!mr_arr.length) {
            LayerConfig('fail', '请先选择');
            return;
        }

        // 检验状态, 领料补料 并且状态是待入库
        var checkStatus = mr_arr.every(item => {
            var $checkedEle = $(`#check_input_${item}`);
            return ($checkedEle.data('type') == 1 || $checkedEle.data('type') == 7) && $checkedEle.data('status') == 3;
        });

        if (!checkStatus) {
            LayerConfig('fail', '请选择类型为领料或补料并且状态为待入库的单号');
            return;
        }

        if (push_type == 1) {
            updateActualReceiveBatch();
        } else if (push_type == 2){
            workShopConfirmAndUpdateBatch();
        }
    })
}

// sap一键入库
function updateActualReceiveBatch() {
    layer.confirm('您将执行一键入库操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
        layer.close(index);

        AjaxClient.post({
            url: URLS['work'].updateActualReceiveBatch,
            data:{
                material_requisition_id_arr: mr_arr.join(','),
                _token: TOKEN
            },
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (rsp) {
                layer.confirm('入库成功！', {
                    icon: 1,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                    getPickingList(push_type);
                });
            },
            fail: function (rsp) {
                LayerConfig('fail', rsp.message || '一键入库失败！');
            }
        }, this)
    });
}

// 车间一键入库
function workShopConfirmAndUpdateBatch() {
    // 不能同时选择领料和补料
    var mr_arr_type = $(`#check_input_${mr_arr[0]}`).data('type');
    var checkStatus = mr_arr.every(item => {
        return $(`#check_input_${item}`).data('type') == mr_arr_type;
    });

    if (!checkStatus) {
        LayerConfig('fail', '不能同时选择领料和补料的单号, 请重新选择');
        return;
    }

    layer.confirm('您将执行一键入库操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
        layer.close(index);

        AjaxClient.post({
            url: URLS['work'].workShopConfirmAndUpdateBatch,
            data:{
                material_requisition_id_arr: mr_arr.join(','),
                type: parseInt(mr_arr_type),
                _token: TOKEN
            },
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (rsp) {
                layer.confirm('入库成功！', {
                    icon: 1,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                    getPickingList(push_type);
                });
            },
            fail: function (rsp) {
                LayerConfig('fail', rsp.message || '一键入库失败！');
            }
        }, this)
    });
}

function showPrintList(formDate) {
    var materialsArr = [];
    var type_string = formDate.type == 1 ? '领料' : formDate.type == 2 ? '退料' : formDate.type == 7 ? '补料' : '';
    if (formDate.materials.length > 0) {
        materialsArr = formDate.materials;
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
        var plan_start_time = formDate.ctime,
            employee_name = formDate.employee_name,
            send_depot = formDate.send_depot,
            line_depot_name = formDate.line_depot_name,
            product_order_code = formDate.product_order_code,
            work_order_code = formDate.work_order_code,
            cn_name = formDate.cn_name,
            workbench_name = formDate.bench_no,
            sales_order_code = formDate.sales_order_code,
            sales_order_project_code = formDate.sales_order_project_code,
            dispatch_time = formDate.dispatch_time,
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
                                <th>SAP需求数量</th>
                                <th>需求数量</th>
                                <th>BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].old_material_code}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_demand_qty}${newObj[j][i].sap_demand_unit}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_demand_qty}${tansferNull(newObj[j][i].lc_demand_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].demand_qty}${tansferNull(newObj[j][i].demand_unit)}</td>
                                <td >${newObj[j][i].remark}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_demand_qty+newObj[j][i + 1].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_demand_qty+tansferNull(newObj[j][i + 1].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].demand_qty+tansferNull(newObj[j][i + 1].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].remark : ''}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_demand_qty+newObj[j][i + 2].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_demand_qty+tansferNull(newObj[j][i + 2].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].demand_qty+tansferNull(newObj[j][i + 2].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].remark : ''}</td> 
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
                                            <div style="flex: 1;">${type_string}部门:</div>
                                            <div style="flex: 2;">${line_depot_name}</div>
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
                                            <div style="flex: 1;">销售订单号/行项号:</div>
                                            <div style="flex: 2;">${sales_order_code}/${sales_order_project_code}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">生产订单号:</div>
                                            <div style="flex: 2;">${product_order_code}</div>
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
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">制单人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;">${cn_name}</div>
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
function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未发送';
            break;
        case 2:
            return '已推送';
            break;
        case 3:
            return '待入库';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch (status) {
        case 1:
            return '待推送';
            break;
        case 2:
            return '进行中';
            break;
        case 3:
            return '待出库';
            break;
        case 4:
            return '完成';
            break;
        case 5:
            return '反审完成';
            break;
        default:
            break;
    }
}

function checkType(type) {
    switch(type)
    {
        case 1:
            return '领料';
            break;
        case 2:
            return '退料';
            break;
        case 7:
            return '补料';
            break;
        default:
            break;
    }
}

function chooseStatus(type) {
    switch(Number(type))
    {
        case 1:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 2:
            return `<li data-id="1" class=" el-select-dropdown-item">待出库</li>
                    <li data-id="2" class=" el-select-dropdown-item">待推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">进行中</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>
                    <li data-id="5" class=" el-select-dropdown-item">反审完成</li>`;
            break;
        case 7:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        default:
            break;
    }
}

