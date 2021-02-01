var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    codeCorrect=!1,
    nameCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1): 
                !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"), nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1): 
                (codeCorrect=1,!0);
        }

    },
    remoteValidatorToolbox={

        remoteCheckCode: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {name: "checkName", code: "checkCode"},
    remoteValidatorConfig={code: "remoteCheckCode"};
$(function(){
    getdevice();
    bindEvent();
    getSearch();
    resetParam();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDeviceList_form').find('.submit').removeClass('is-disabled');
}
//重置搜索参数
function resetParam(){
    ajaxData={
        device_code: '',
        device_name: '',
        device_type: ''
    };
}

//选择日期
function getSelectDate(ele,flag) {
    if(flag !='view'){
        laydate.render({
            elem: ele,
            done: function(value, date, endDate){
            }
        });
    }
}
function bindPagenationClick(totalData,pageSize){
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
            getdevice();
        }
    });
};
//获取列表
function getdevice() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${encodeURIComponent(ajaxData[param])}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['deviceRepair'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'), rsp.results);
            }else{
                noData('暂无数据',17);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取列表失败，请刷新重试',17);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele, data){
    data.forEach(function(item,index){
        console.log(typeof(item.accept_user_info));
        item.repair_user_info = item.repair_user_info ? JSON.parse(item.repair_user_info) : [];
        item.accept_user_info = item.accept_user_info ? JSON.parse(item.accept_user_info) : [];
        item.repair_type_info = item.repair_type_info ? JSON.parse(item.repair_type_info) : [];
        item.time_accept = item.time_accept ? item.time_accept : '';
        switch (item.status) {
            case 'wait':
                item.status_msg = '<span style="color:orange">待接单</span>';
                item.bgColor = '#ffa50015';
                item.btn = `
                    <button data-id="${item.id}" class="button pop-button reminder">催促</button>
                    <button data-id="${item.id}" class="button pop-button cancel">撤单</button>
                `;
                break;
            case 'under-repair':
                item.status_msg = '<span style="color:red">维修中</span>';
                item.bgColor = '#ff000015';
                break;
            case 'finish':
                item.status_msg = '<span style="color:red">维修完成</span>';
                item.bgColor = '#00800015';
                break;
            case 'cancel':
                item.status_msg = '已撤单';
                item.bgColor = '#ffffff';
                break;
                case 'completed':
                item.status_msg = '<span style="color:green">已完成</span>';
                item.bgColor = '#00800015';
                break;
        }
        var tr=`
            <tr class="tritem" data-id="${item.id}" style="background-color: ${item.bgColor};">
                <td>
                    <div class="checkbox no-margin">
                        <label>
                            <input name="selectCheckbox" type="checkbox" value="${item.id}" class="ace" />
                            <span class="lbl"></span>
                        </label>
                    </div>
                </td>
                <td>${item.order_no}</td>
                <td>${item.device_name}</td>
                <td>${item.device_code}</td>
                <td>${item.placement_address}</td>
                <td>${item.device_dept_name}</td>
                <td>${item.repair_type_info.name} / ${item.repair_type_info.sub.name}</td>
                <td>${item.repair_user_info.join(' ')}<br/><span style="color:#ccc">${item.time_repair}</span></td>
                <td>${item.accept_user_info.join(' ')}<br/><span style="color:#ccc">${item.time_accept}</span></td>
                <td>${item.status_msg}</td> 
                <td>
                    ${item.is_finish == 'Y' ? '<span style="color:red">已结</span>' : '<span style="color:green">待结</span>'}
                    <span style="color:#ccc">${item.time_finish ? ('<br/>' + item.time_finish) : ''}</span>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};
function bindEvent(){
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
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    // 全选/反选
    $(document).on('click', 'input[name="selectCheckboxAll"]', function (e) {
        var isSelected = $(this).prop('checked');
        $('.table_tbody').find('input[name="selectCheckbox"]').prop('checked', isSelected);
    });
    // 列举全部
    $(document).on('click', '.show-status', function (e) {
        pageNo = 1;
        $(this).closest('.actions').find('.show-status').removeClass('active');
        $(this).addClass('active');
        ajaxData['status'] = $(this).attr('status');
        getdevice();
    });
    // 通知 -----------------------------------------------------
    $('body').on('click', '#order_notice', function () {
        var ids = [];
        $('input[name="selectCheckbox"]:checked').each(function () {
            var data = $(this).closest('tr').data('trData');
            if (data.status != 'wait') {
                return true;
            }
            ids.push(data.order_no);
        });
        if (ids.length <= 0) {
            layer.alert('请选择须要通知的工单！');
            return;
        }
        layerModal = layer.open({
            type: 1,
            title: '发送钉钉工单通知',
            fixed: true,
            offset: '100px',
            area: '680px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            content: `<div class="row no-margin">
                <div class="col-sm-12">
                    <form class="form-horizontal" role="form">
                        <div class="form-group" style="margin-top:10px;">
                            <label class="col-sm-2 control-label no-padding-right"> 通知订单 </label>
                            <div class="col-sm-10">
                                <div id="tagElement" class="tags" style="width:100%;border:1px solid #D5D5D5">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label no-padding-right"> 通知方式 </label>
                            <div class="col-sm-10">
                                <div class="radio">
                                    <label>
                                        <input name="method" type="radio" value="1" class="ace" checked="checked">
                                        <span class="lbl"> 首次通知</span>
                                    </label>
                                </div>
                                <div class="radio">
                                    <label>
                                        <input name="method" type="radio" value="2" class="ace">
                                        <span class="lbl"> 催单通知</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>` ,
            success: function() {
                var i = 0, tags = '';
                for (; i < ids.length; i++) {
                    tags += `<span class="tag" id="${ids[i]}" style="padding-right: 6px">${ids[i]}</span>`;
                }
                $('#tagElement').html(tags);
            },
            btn: ['发送通知', '取消'],
            btn1: function () {
                function noticeOrder(i, ids) {
                    if (typeof(ids[i]) == 'undefined') return;
                    if ($('#' + ids[i]).attr('isSend') == '1') {
                        if (typeof(ids[i+1]) != 'undefined') {
                            noticeOrder(i+1, ids);
                        } else {
                            layer.alert('已全部通知！');
                        }
                        return;
                    }
                    if ($('#' + ids[i]).attr('isSend') == '2') {
                        return;
                    }
                    $('#' + ids[i]).html(ids[i] + '&nbsp;<i class="ace-icon fa fa-spinner fa-spin"></i>').attr('isSend', '2');
                    $.get('/api/dd/sendNoticeDeviceOrder', {type: $('[name="method"]:checked').val(), order_no: ids[i]}, function (resp) {
                        if (resp.code == 0) {
                            $('#' + ids[i]).css('background-color', '#337ab7').html(ids[i]).attr('isSend', '1');
                        } else {
                            $('#' + ids[i]).css('background-color', 'red').html(ids[i]).attr('isSend', '1');
                        }
                        if (typeof(ids[i+1]) != 'undefined') {
                            noticeOrder(i+1, ids);
                        } else {
                            layer.alert('已全部通知！');
                        }
                    }, 'json');
                }
                noticeOrder(0, ids);
            }
        });
    });
    // 撤单 -----------------------------------------------------
    $('body').on('click', '#order_cancel', function () {
        var ids = [];
        $('input[name="selectCheckbox"]:checked').each(function () {
            var data = $(this).closest('tr').data('trData');
            if (data.status != 'wait') {
                return true;
            }
            ids.push({uid: data.repair_user_did, order_no: data.order_no});
        });
        if (ids.length <= 0) {
            layer.alert('请选择须要撤消的工单！');
            return;
        }
        layerModal = layer.open({
            type: 1,
            title: '报修工单撤消',
            fixed: true,
            offset: '100px',
            area: '680px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            content: `<div class="row no-margin">
                <div class="col-sm-12">
                    <form class="form-horizontal" role="form">
                        <div class="form-group" style="margin-top:10px;">
                            <label class="col-sm-2 control-label no-padding-right"> 撤消订单 </label>
                            <div class="col-sm-10">
                                <div id="tagElement" class="tags" style="width:100%;border:1px solid #D5D5D5">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>` ,
            success: function() {
                var i = 0, tags = '';
                for (; i < ids.length; i++) {
                    tags += `<span class="tag" id="${ids[i].order_no}" style="padding-right: 6px">${ids[i].order_no}</span>`;
                }
                $('#tagElement').html(tags);
            },
            btn: ['撤消', '取消'],
            btn1: function () {
                function cancelOrder(i, ids) {
                    if (typeof(ids[i]) == 'undefined') return;
                    if ($('#' + ids[i].order_no).attr('isSend') == '1') {
                        if (typeof(ids[i+1]) != 'undefined') {
                            cancelOrder(i+1, ids);
                        } else {
                            layer.alert('已全部撤单！');
                        }
                        return;
                    }
                    if ($('#' + ids[i].order_no).attr('isSend') == '2') {
                        return;
                    }
                    $('#' + ids[i].order_no).html(ids[i].order_no + '&nbsp;<i class="ace-icon fa fa-spinner fa-spin"></i>').attr('isSend', '2');
                    $.get('/api/dd/cancelOrder', ids[i], function (resp) {
                        if (resp.code == 0) {
                            $('#' + ids[i].order_no).css('background-color', '#337ab7').html(ids[i].order_no).attr('isSend', '1');
                        } else {
                            $('#' + ids[i].order_no).css('background-color', 'red').html(ids[i].order_no).attr('isSend', '1');
                        }
                        if (typeof(ids[i+1]) != 'undefined') {
                            cancelOrder(i+1, ids);
                        } else {
                            layer.alert('已全部撤单！');
                        }
                    }, 'json');
                }
                cancelOrder(0, ids);
            }
        });
    });
    // 详情 -----------------------------------------------------
    $('body').on('click', '#order_detail', function () {
        var data = {};
        $('input[name="selectCheckbox"]:checked').each(function () {
            data = $(this).closest('tr').data('trData');
            return false;
        });
        if (typeof(data.order_no) == 'undefined') {
            layer.alert('请选择要查看的工单！');
            return;
        }
        layerModal = layer.open({
            type: 1,
            title: `工单信息 [${data.device_name}]`,
            fixed: true,
            offset: '100px',
            area: '680px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            content: `<div class="row no-margin">
                <div class="col-sm-12" style="padding: 15px 0px;">
                    <div class="col-sm-12">
                        <div class="col-sm-6">
                            <h5><b>故障描述</b></h5>
                            <hr style="margin-top:10px;margin-bottom:10px;" />
                            <p>${data.depict ? data.depict : '无记录'}</p>
                        </div>
                        <div class="col-sm-6">
                            <h5><b>维修经验</b></h5>
                            <hr style="margin-top:10px;margin-bottom:10px;" />
                            <p>${data.programme ? data.programme : '无记录'}</p>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="col-sm-12">
                            <h5><b>故障图片</b></h5>
                            <hr style="margin-top:10px;margin-bottom:10px;" />
                            <ul class="ace-thumbnails clearfix"></ul>
                        </div>
                    </div>
                </div>
            </div>` ,
            success: function() {
                if (data.repair_imgs) {
                    data.repair_imgs = JSON.parse(data.repair_imgs);
                    var i = 0, list = [];
                    for (; i < data.repair_imgs.length; i++) {
                        var img = data.repair_imgs[i].replace('http://mlily.vaiwan.com', '');
                        list.push(
                        `<li>
                            <a href="${img}" target="_repair_img">
                                <img width="150" height="150" alt="150x150" src="${img}">
                            </a>
                        </li>`);
                    }
                    $('.ace-thumbnails').html(list.join(''));
                } else {
                    $('.ace-thumbnails').html('无记录');
                }
            }
        });
    });
    // 搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo = 1;
            ajaxData['device_code'] = encodeURIComponent(parentForm.find('#device_code').val().trim())
            getdevice();
        }
    });
    $('body').on('click','#searchForm .el-select',function(){
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
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#device_code').val('');
        parentForm.find('#device_name').val('');
        parentForm.find('#device_type').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getdevice();
    });




    $('#device_add').on('click',function (e) {
        e.stopPropagation();
        Model(0,"add");
    })

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
    //弹窗下拉
    $('body').on('click','.formDeviceList:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //输入框的相关事件
    $('body').on('focus', '.formDeviceList:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formDeviceList:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addDeviceList_form').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });
    $('body').on('click', '#qrcodePrint', function () {
        location.href = '/Device/deviceListQRcode';
    });
    //下拉选择
    $('body').on('click','.formDeviceList .el-select-dropdown-item:not(".disabled,.company_flag")',function(e){
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //添加和编辑的提交
    $('body').on('click', '.formDeviceList:not(".disabled") .submit', function (e) {
        e.stopPropagation();
        if (!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addDeviceList_form'),
                id = parentForm.find('#itemId').val(),
                flag = parentForm.attr("data-flag");
            for (var type in validatorConfig) {
                validatorToolBox[validatorConfig[type]](type);
            }
            if (nameCorrect && codeCorrect ) {
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var deviceName = parentForm.find('#name').val().trim(),
                    deviceCode = parentForm.find('#code').val().trim(),
                    device_type_id = parentForm.find('#device_type_id').val().trim(),
                    spec = parentForm.find('#spec').val(),
                    useful_life = parentForm.find('#useful_life').val(),
                    purchase_time = parentForm.find('#purchase_time').val(),
                    device_sign_id = parentForm.find('#device_sign_id').val(),
                    use_status_id = parentForm.find('#use_status_id').val(),
                    use_department_id = parentForm.find('#use_department_id').val(),
                    use_employee_id = parentForm.find('#use_employee_id').val(),
                    // repair_group_id = parentForm.find('#repair_group_id').val(),
                    placementAddress = parentForm.find('#placementAddress').val(),
                    prepare_work_hour = parentForm.find('#prepare_work_hour').val(),
                    rated_value = parentForm.find('#rated_value').val(),
                    rent_partner_id = parentForm.find('#rent_partner_id').val(),
                    genway = parentForm.find('#genway').val(),
                    provider_id = parentForm.find('#provider_id').val(),
                    leader_id = parentForm.find('#leader_id').val(),
                    remark = parentForm.find('#remark').val();
                $(this).hasClass('edit') ? (
                    editDevice({
                        id: id,
                        name: deviceName,
                        code: deviceCode,
                        device_type: device_type_id,
                        spec: spec,
                        rent_partner: rent_partner_id,
                        procude_partner: genway,
                        supplier: provider_id,
                        useful_life: useful_life,
                        purchase_time: Date.parse(new Date(purchase_time))/1000,
                        initial_price: prepare_work_hour,
                        net_price: rated_value,
                        employee_id: leader_id,
                        device_sign: device_sign_id,
                        use_status: use_status_id,
                        use_department: use_department_id,
                        use_employee: use_employee_id,
                        placement_address: placementAddress,
                        remark: remark,
                        _token: TOKEN
                    })
                ) : (
                    addDevice({
                        name: deviceName,
                        code: deviceCode,
                        device_type: device_type_id,
                        spec: spec,
                        rent_partner: rent_partner_id,
                        procude_partner: genway,
                        supplier: provider_id,
                        useful_life: useful_life,
                        purchase_time: Date.parse(new Date(purchase_time))/1000,
                        initial_price: prepare_work_hour,
                        net_price: rated_value,
                        employee_id: leader_id,
                        device_sign: device_sign_id,
                        use_status: use_status_id,
                        use_department: use_department_id,
                        use_employee: use_employee_id,
                        placement_address: placementAddress,
                        remark: remark,
                        _token: TOKEN
                    })
                )
            }
        }
    });
};

function viewDevice(id,flag) {
    AjaxClient.get({
        url: URLS['deviceRepair'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Model(id,flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getDeviceType();
            }
        }
    },this);
}
function deleteDevice(id,leftNum) {
    AjaxClient.get({
        url: URLS['deviceRepair'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getdevice();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                pageNo? null:pageNo=1;
                getdevice();
            }
        }
    },this);
}
function addDevice(data) {
    AjaxClient.post({
        url: URLS['deviceRepair'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getdevice();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
                $('body').find('#addDeviceList_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            }

        }
    },this);
}
function editDevice(data) {
    AjaxClient.post({
        url: URLS['deviceRepair'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getdevice();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addDevice_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}



function Model(id,flag,data) {
    var {address='',department_id='',device_code='',device_id='',device_name='',device_spec='',devtype_id='',employee_id='',initial_price='',net_price='',procude_partner='',purchase_time='',remark='',rentpartner_id='',sign_id='',status_id='',supplier_id='',useful_life='',user_id=''}={};
    if(data){
        ({address='',department_id='',device_code='',device_id='',device_name='',device_spec='',devtype_id='',employee_id='',initial_price='',net_price='',procude_partner='',purchase_time='',remark='',rentpartner_id='',sign_id='',status_id='',supplier_id='',useful_life='',user_id=''}=data);
    }

    var labelWidth=150,
        btnShow='btnShow',
        title='查看设备',


        textareaplaceholder='',
        readonly='',
        // typeHtml=selectHtml(option_category_id,flag),
        noEdit='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加设备':(title='编辑设备',textareaplaceholder='',noEdit='readonly="readonly"'));


    layerModal=layer.open({
        type: 1,
        title: title,
        fixed: true,
        offset: '100px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="formModal formDeviceList" id="addDeviceList_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${id}">      
                <div class="workHour_wrap" >
                       <div class="workHour_left"> 
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">设备名称<span class="mustItem">*</span></label>                               
                                <input type="text" id="name"  class="el-input" ${noEdit} ${readonly} value="${device_name}">                                       
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                         </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">设备编码<span class="mustItem">*</span></label>                                
                                <input type="text" id="code" ${noEdit} class="el-input" ${readonly} value="${device_code}">                                        
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                         </div>
                         <div class="el-form-item deviceType">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">设备类别</label>
                                ${flag == 'view' ?`<input type="text" id="device_Type_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap deviceType">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="device_type_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>   
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">规格型号</label>                                
                                <input type="text"  class="el-input" ${readonly} id="spec" value="${device_spec}">                                        
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>   
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">使用寿命</label>                                
                                <input type="number" onkeyup="value=value.replace(/\\-/g,'')" onblur="value=value.replace(/\\-/g,'')" onchange="value=value.replace(/\\-/g,'')"  class="el-input" ${readonly} id="useful_life" value="${useful_life}">                                        
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>     
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">购买时间</label>                                
                                <input type="text" ${readonly} class="bom-ladder-input el-input"  id="purchase_time"  value="${purchase_time?timestampToTime(purchase_time):''}">                                       
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>  
                         <div class="el-form-item deviceSign">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">设备分类</label>
                                ${flag == 'view' ?`<input type="text" id="device_sign_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap deviceSign">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="device_sign_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div> 
                         <div class="el-form-item useStatus">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">使用状况</label>
                                ${flag == 'view' ?`<input type="text" id="use_status_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap useStatus">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="use_status_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div> 
                         <div class="el-form-item useDepartment">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">使用部门</label>
                                ${flag == 'view' ?`<input type="text" id="use_department_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap useDepartment">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="use_department_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>  
                         <div class="el-form-item useEmployee">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">操作人</label>
                                ${flag == 'view' ? `<input type="text" id="use_employee_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap useEmployee">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="use_employee_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                               
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>    
                         
                         
                         
                       </div>
                       <div class="workHour_btn">
                            <span></span>
                       </div>
                       <div class="workHour_ability_right">
                             <div class="el-form-item leader">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">资产负责人</label>
                                ${flag == 'view' ?`<input type="text" id="leader_view" readonly class="el-input" value="">` :`
                                <div class="el-select-dropdown-wrap leader">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="leader_id" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                    </div>
                                </div> `}
                               
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                         </div>  
                              
                             <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">安装地点</label>                                  
                                    <input type="text"  class="el-input" ${readonly} id="placementAddress" value="${address}">                                           
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                             </div> 
                           
                           <div class="el-form-item">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">资产原值</label>
                                     <input type="number" onkeyup="value=value.replace(/\\-/g,'')" onblur="value=value.replace(/\\-/g,'')" onchange="value=value.replace(/\\-/g,'')" id="prepare_work_hour" ${readonly} data-name="" class="el-input" placeholder="" value="${initial_price}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                           </div>
                            
                           <div class="el-form-item">
                                <div class="el-form-item-div">
                                     <label class="el-form-item-label" style="width: ${labelWidth}px;">资产净值</label>
                                     <input type="number" onkeyup="value=value.replace(/\\-/g,'')" onblur="value=value.replace(/\\-/g,'')" onchange="value=value.replace(/\\-/g,'')" id="rated_value" ${readonly} data-name="" class="el-input" placeholder="" value="${net_price}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                           </div>
                           <div class="el-form-item rentPartner">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">租用单位</label>
                                    ${flag == 'view' ?`<input type="text" id="rent_partner_view" readonly class="el-input" value="">` :`
                                    <div class="el-select-dropdown-wrap rentPartner">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="rent_partner_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div> `}                                        
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                           </div>
                           <div class="el-form-item deviceType">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">生产厂商</label>
                                    <input type="text" id="genway" ${readonly} data-name="" class="el-input" placeholder="" value="${procude_partner}">
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                           </div> 
                           <div class="el-form-item provider">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">供应商</label>                                    
                                    ${flag == 'view' ?`<input type="text" id="provider_view" readonly class="el-input" value="">` :`
                                    <div class="el-select-dropdown-wrap provider">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="provider_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div> `}                                       
                                </div>
                                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                           </div> 
                           
                           <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                                    <textarea type="textarea" ${readonly} maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="">${remark}</textarea>
                                </div>
                                <p class="errorMessage" style="display: block;"></p>
                           </div>    
                       </div>
                    </div>
                    
                   
                    <div class="el-form-item ${btnShow}" style="margin-top: 20px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
</form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            getSelectDate('#purchase_time',flag);
            selectDeviceType(devtype_id,flag);
            selectDeviceSign(sign_id,flag);
            selectUseStatus(status_id,flag);
            selectDepartment(department_id,flag);
            selectEmployee(user_id,flag);
            selectLeader(employee_id,flag);
            selectPartner(rentpartner_id,flag);
            selectvendor(supplier_id,flag);
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());

    return Y+M+D;
}
//获取设备类型列表
function selectDeviceType(val,flag){
    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                lis +=selecttreeHtml(rsp.results,rsp.results[0].parent_id);
                rsp.results.forEach(function(item){
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#device_Type_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.deviceType').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.deviceType').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
};
function selectDeviceSign(val,flag) {
    AjaxClient.get({
        url: URLS['otherOption'].select+'?'+_token+'&category_id=7',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.option_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.option_name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.option_id){
                            $('#device_sign_view').val(item.option_name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.deviceSign').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.deviceSign').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
function selectUseStatus(val,flag) {
    AjaxClient.get({
        url: URLS['otherOption'].select+'?'+_token+'&category_id=0',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.option_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.option_name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.option_id){
                            $('#use_status_view').val(item.option_name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.useStatus').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.useStatus').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
function selectDepartment(val,flag) {
    AjaxClient.get({
        url: URLS['deviceRepair'].department+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                $('.el-form-item.useDepartment').find('.el-select-dropdown-list').html(deptHtml(rsp.results,val,flag));

                if(val){
                    $('.el-select-dropdown-wrap.useDepartment').find('.el-select-dropdown-item[data-id='+val+']').click()
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function deptHtml(data,val,flag) {

    var lis='',loopList='';
    if(data&&data.length){
        data.forEach(function (item) {
            loopList = deptTreeCopy(item.factory,1,val,flag);
            lis+=`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                    <li class="el-select-dropdown-item  company_flag" style="" data-name="${item.company_name}" data-id="${item.company_id}" data-company-id="${item.company_id}">${item.company_name}</li>
                    ${loopList}`;

        })
    }

    return lis;
}
function deptTreeCopy(data,level,val,flag) {
    var _html='';

    if(data&&data.length){
        data.forEach(function (item,index) {

            var lastClass=index===data.length-1? 'last-tag' : '',span='';

            span=`<div style="padding-left:${20*level}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`;

            _html+= `<li class="el-select-dropdown-item dept_flag" data-company-id="${item.company_id}" data-forfather="${item.forefathers}" data-name="${item.name}" data-id="${item.id}">${span}</li>
                    ${deptTreeCopy(item.children,level+1)}`;
            if(val && flag == 'view'){
                if(val == item.id){
                    $('#use_department_view').val(item.name);
                }
            }
        })
    }
    return _html;
}
function selectEmployee(val,flag) {
    AjaxClient.get({
        url: URLS['deviceRepair'].chargeShow+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#use_employee_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.useEmployee').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.useEmployee').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
function selectLeader(val,flag) {
    console.log(val);
    AjaxClient.get({
        url: URLS['deviceRepair'].chargeShow+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#leader_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.leader').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.leader').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
function selectPartner(val,flag) {
    AjaxClient.get({
        url: URLS['deviceRepair'].getpartners+'?'+_token+'&is_vendor=1',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#rent_partner_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.rentPartner').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.rentPartner').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
function selectvendor(val,flag) {
    AjaxClient.get({
        url: URLS['deviceRepair'].getpartners+'?'+_token+'&is_vendor=1',
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var lis = '',innerHtml='';
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                    if(val && flag == 'view'){
                        if(val == item.id){
                            $('#provider_view').val(item.name)
                        }
                    }
                });
                innerHtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.provider').find('.el-select-dropdown-list').html(innerHtml);
                if(val){
                    $('.el-select-dropdown-wrap.provider').find('.el-select-dropdown-item[data-id='+val+']').click();
                }
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}


function getSearch(item=''){
    $.when(getDeviceType())
        .done(function(deviceTypeRsp){
            var deviceTypelis='';
            if(deviceTypeRsp&&deviceTypeRsp.results&&deviceTypeRsp.results.length){
                deviceTypelis=selectHtml(deviceTypeRsp.results,deviceTypeRsp.results[0].parent_id);
                $('.deviceType').find('.el-select-dropdown-wrap').html(deviceTypelis);
            }

        }).fail(function(unitrsp,dataTypersp){
        console.log('获取设备类型失败');
    }).always(function(){
        layer.close(layerLoading);
    });
};
//生成下拉框数据
function selectHtml(fileData,parent_id){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);


        innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="device_type" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;


    itemSelect=[];
    return innerhtml;
}
//获取设备类型列表
function getDeviceType(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['deviceType'].treeIndex+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
            deviceTypeList=rsp.results;
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//检测唯一性
function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['deviceRepair'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
        }
    },this);
}


layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	//日期
	laydate.render({
		type: 'datetime',
		elem: '#date'
	});
	laydate.render({
		type: 'datetime',
		elem: '#date1'
	});
});


$('body').on('click', '#load', function() {
	let startTime = $('#date').val();
	let endTime = $('#date1').val();
	$('#load').attr('href', '/deviceRepair/exportDeviceRepair?_token=8b5491b17a70e24107c89f37b1036078' + '&start_time=' + startTime + '&end_time=' + endTime);
})
