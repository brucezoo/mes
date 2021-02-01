var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    itemSelect = [],
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
    validatorConfig = {
        name: "checkName",
        code: "checkCode",
    },remoteValidatorConfig={
        code: "remoteCheckCode"
    };
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
        url: URLS['deviceMember'].pageIndex+"?"+_token+urlLeft,
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
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>
                    <div class="checkbox no-margin">
                        <label>
                            <input name="selectCheckbox" type="checkbox" value="${item.id}" class="ace" />
                            <span class="lbl"></span>
                        </label>
                    </div>
                </td>
                <td>${item.name}</td>
                <td>${item.mobile}</td>
                <td>${item.department_name}</td>
                <td>${item.team_name}</td>
                <td>${item.skill_type_name}</td>
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
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e) {
        e.stopPropagation();
    });
    // 全选/反选
    $(document).on('click', 'input[name="selectCheckboxAll"]', function (e) {
        var isSelected = $(this).prop('checked');
        $('.table_tbody').find('input[name="selectCheckbox"]').prop('checked', isSelected);
    })

    .on("click", "#add_member", function () {
        Model(0,"add");
    })

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
    $('body').on('click', '#member_remove', function () {
        var ids = [];
        var names = [];
        $('input[name="selectCheckbox"]:checked').each(function () {
            var data = $(this).closest('tr').data('trData');
            ids.push(data.id);
            names.push(data.name);
        });
        if (ids.length <= 0) {
            layer.alert('请选择要操作的条目');
            return;
        }
        layer.alert('移出后，将无法从钉钉上进入设备管理，确定移出 <span style="color:red">' + names.join(', ') + '</span> 吗? 取消点击右上方的 “ X ”',function () {
            AjaxClient.get({
                url: URLS['deviceMember'].destroy+"?"+_token+"&id="+ids.join(','),
                dataType: 'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success: function(rsp){
                    layer.closeAll();
                    getdevice();
                },
                fail: function(rsp){
                    layer.closeAll();
                    getdevice();
                }
            },this);
        });
    });
    $('body').on('click', '#member_edit', function () {
        var member = {};
        $('input[name="selectCheckbox"]:checked').each(function () {
            member = $(this).closest('tr').data('trData');
            return false;
        });
        if (typeof(member.id) == 'undefined') {
            layer.alert('请选择要操作的条目');
            return;
        }
        layerModal = layer.open({
            type: 1,
            title: '更改成员信息',
            fixed: true,
            offset: '100px',
            area: '640px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            content: `<div class="row no-margin">
                <div class="col-sm-12">
                    <form class="form-horizontal" role="form">
                        <div class="form-group" style="margin-top:10px;">
                            <label class="col-sm-2 control-label no-padding-right"> 人员列表 </label>
                            <div class="col-sm-10">
                                <div id="tagElement" class="tags" style="width:100%;height:200px;border:1px solid #D5D5D5">
                                    <span class="tag" userid="${member.id}" style="padding-right: 6px">${member.name}</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 所在班组<br /><span style="font-size:1px">按住Ctrl可多选</span> </label>
                            <div class="col-sm-10">
                                <select class="form-control" name="ascription_team" multiple="multiple">
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 所在部门 </label>
                            <div class="col-sm-10">
                                <select class="form-control tag-input-style" id="sdepart" name="select_department" multiple="multiple"  data-placeholder="请选择所在部门...">
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 擅长类目<br /><span style="font-size:1px">按住Ctrl可多选</span> </label>
                            <div class="col-sm-10">
                                <select class="form-control" name="skill_t" multiple="multiple">
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
            </div>` ,
            success: function(layero, index) {
                // 获取所有的班组
                $.get('/deviceTeam/pageIndex?_token=8b5491b17a70e24107c89f37b1036078&category_id=&category_code=&page_no=1&page_size=100', function (resp) {
                    var team = '';
                    member.team_id = typeof member.team_id == 'string' ? member.team_id.split(':') : member.team_id;
                    $.each(resp.results, function (i, row) {
                        var i = 0, isSelected = false;
                        for (; i < member.team_id.length; i++) {
                            if (member.team_id[i] == row.id) {
                                isSelected = true;
                                break;
                            }
                        }
                        if (isSelected) {
                            team += '<option value="'+row.id+'" selected="selected">'+row.name+'</option>';
                        } else {
                            team += '<option value="'+row.id+'">'+row.name+'</option>';
                        }
                    });
                    $('select[name="ascription_team"]').html(team);
                }, 'json');
                // 获取所有的部门
                $.get('/deviceDepartment/treeIndex?_token=8b5491b17a70e24107c89f37b1036078', function(resp) {
                    resp = resp.results;
                    var i = 0;
                    for (; i < resp.length; i++) {
                        var item = resp[i];
                        if (item['parent_id'] == 0) {
                            $('#sdepart').append('<option value="' + item.id + '" pid="' + item.parent_id + '">' + item.name + '</option>');
                        } else {
                            $('<option value="' + item.id + '" pid="' + item.parent_id + '">' + item.name + '</option>').insertAfter('#sdepart option[value="' + item.parent_id + '"]');
                        }
                    }
                    i = 0;
                    member.department_id = typeof member.department_id == 'string' ? member.department_id.split(':') : member.department_id;
                    for (; i < member.department_id.length; i++) {
                        if (!member.department_id[i]) continue;
                        $('#sdepart option[value="'+member.department_id[i]+'"]').prop('selected', true);
                    }
                    $('#sdepart').chosen({allow_single_deselect:true}).on('chosen:showing_dropdown', function () {
                        var departELE = $('#sdepart');
                        var chosenELE = departELE.next();
                        chosenELE.find('.chosen-drop li').each(function () {
                            var li = $(this);
                            var idx = li.data('optionArrayIndex');
                            var opt = departELE.find('option').eq(idx);
                            if (opt.attr('pid') != 0) {
                                li.html('<span class="tag-prefix" style="margin-left:15px;"></span> ' + li.html());
                            }
                        });
                        var i = 0;
                        for (; i < resp.length; i++) {
                            var item = resp[i];
                            if (item['parent_id'] == 0) {
                                var lastIDX = $('#sdepart option[pid="' + item.id + '"]:last').index();
                                chosenELE.find('.chosen-drop li:eq(' + lastIDX + ') .tag-prefix').addClass('last-tag');
                            }
                        }
                    });
                }, 'json');
                // 获取设备顶层分类
                $.get('/devicetype/getParent?_token=8b5491b17a70e24107c89f37b1036078', function (resp) {
                    var opts = '';
                    $.each(resp.data, function (i, row) {
                        opts += '<option value="'+row.id+'">'+row.name+'</option>';
                    });
                    $('select[name="skill_t"]').html(opts);
                    var i = 0;
                    var t = member.skill_type.split(':');
                    for (; i < t.length; i++) {
                        if (!t[i]) continue;
                        $('select[name="skill_t"]').find('option[value="'+t[i]+'"]').attr('selected', 'selected');
                    }
                }, 'json');
            },
            btn: ['改更', '取消'],
            btn1: function () {
                var post = {
                    id: member.id,
                    team_id: [],
                    team_name: [],
                    department_id: [],
                    department_name: [],
                    skill_t: [],
                    skill_t_name: []
                };
                // 成员隶属班组
                $('select[name="ascription_team"] option:selected').each(function () {
                    post.team_id.push($(this).val());
                    post.team_name.push($(this).text());
                });
                if (post.team_id === '') {
                    layer.alert('请选择成员隶属班组！');
                    return;
                }
                post.team_name = post.team_name.join(',');
                // 成员所在部门
                $('#sdepart option:selected').each(function () {
                    post.department_id.push($(this).val());
                    post.department_name.push($(this).text());
                });
                if (!post.department_id) {
                    layer.alert('请选择成员所在部门！');
                    return;
                }
                post.department_name = post.department_name.join(',');
                // 成员擅长类目
                $('select[name="skill_t"] option:selected').each(function () {
                    post.skill_t.push($(this).val());
                    post.skill_t_name.push($(this).text());
                });
                if (post.skill_t.length <= 0) {
                    layer.alert('请选择成员擅长类目！');
                    return;
                }
                post.skill_t_name = post.skill_t_name.join(',');
                AjaxClient.post({
                    url: URLS['deviceMember'].update + '?_token=8b5491b17a70e24107c89f37b1036078',
                    data: post,
                    dataType: 'json',
                    beforeSend: function(){
                        layerLoading = LayerConfig('load');
                    },
                    success: function(resp) {
                        getdevice();
                        layer.closeAll();
                        layer.alert('更改成功！');
                    },
                    fail: function(rsp){
                        layer.closeAll();
                        layer.alert('更改失败！');
                    }
                }, this);
            }
        });
    });
    $('body').on('click', '#member_notice', function () {
        var ids = [];
        var names = [];
        $('input[name="selectCheckbox"]:checked').each(function () {
            var data = $(this).closest('tr').data('trData');
            ids.push(data.dd_userid);
            names.push(data.name);
        });
        if (ids.length <= 0) {
            layer.alert('请选择接收消息的成员');
            return;
        }
        layerModal = layer.open({
            type: 1,
            title: '发送钉钉通知消息',
            fixed: true,
            offset: '100px',
            area: '640px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            content: `<div class="row no-margin">
                <div class="col-sm-12">
                    <form class="form-horizontal" role="form">
                        <div class="form-group" style="margin-top:10px;">
                            <label class="col-sm-2 control-label no-padding-right"> 通知人员 </label>
                            <div class="col-sm-10">
                                <div id="tagElement" class="tags" style="width:100%;border:1px solid #D5D5D5">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 通知内容 </label>
                            <div class="col-sm-10">
                                <textarea id="noticeMsg" class="autosize-transition form-control" style="overflow: hidden; overflow-wrap: break-word; resize: horizontal; height: 150px;"></textarea>
                                <p style="margin-top:5px;color:red">相同消息内容同一个用户一天只能接收一次，重复发送会发送成功但用户接收不到。</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>` ,
            success: function() {
                var i = 0, tags = '';
                for (; i < names.length; i++) {
                    tags += `<span class="tag" style="padding-right: 6px">${names[i]}</span>`;
                }
                $('#tagElement').html(tags);
            },
            btn: ['发送通知', '取消'],
            btn1: function () {
                var data = {userid: ids, noticeMsg: '', type: 'text'};
                data.noticeMsg = "【设备管理部通知】\n" + $('#noticeMsg').val();
                if (!data.noticeMsg) {
                    layer.alert('请输入通知消息！');
                    return;
                }
                layer.msg('发送中，请稍后', {icon: 16, shade: 0.01});
                $.post('/api/dd/sendNoticeMsg', data, function (resp) {
                    layer.closeAll();
                    layer.alert('发送成功！');
                });
            }
        });
    })
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

function viewDevice(id, flag) {
    AjaxClient.get({
        url: URLS['deviceMember'].show+"?"+_token+"&id="+id,
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
        url: URLS['deviceMember'].destroy+"?"+_token+"&id="+id,
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
        url: URLS['deviceMember'].store,
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
        url: URLS['deviceMember'].update,
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

// 将树型数据重新排列长树型结构
function formatTree(data) {
    data.forEach(function (item) {
        delete item.additionalParameters;
    });
    var map = {};
    data.forEach(function (item) {
        item.text = item.name;
        item.type = 'folder';
        delete item.name;
        map[item.id] = item;
    });
    var val = [];
    data.forEach(function (item) {
        var parent = map[item.parentid];
        if (parent) {
            item.type = 'folder';
            delete item.name;
            if (typeof(parent.additionalParameters) == 'undefined') {
                parent.additionalParameters = {children: []};
            }
            (parent.additionalParameters.children || ( parent.additionalParameters.children = [] )).push(item);
        } else {
            val.push(item);
        }
    });
    return val;
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
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加成员':(title='编辑成员',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal = layer.open({
        type: 1,
        title: title,
        fixed: true,
        offset: '100px',
        area: '980px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="row no-margin">
            <div class="col-sm-5">
                <ul id="tree1" style="height:520px;overflow-y:scroll;"></ul>
            </div>
            <div class="col-sm-6" style="padding-left:0px;height:520px;overflow-y:scroll;">
                <form class="form-horizontal" role="form">
                    <div class="form-group" style="margin-top:10px;">
                        <label class="col-sm-2 control-label no-padding-right"> 选择人员 </label>
                        <div class="col-sm-10">
                            <div id="tagElement" class="tags" style="width:100%;height:200px;border:1px solid #D5D5D5">请在右侧选取人员，支持多选</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 所在班组<br /><span style="font-size:1px">按住Ctrl可多选</span> </label>
                        <div class="col-sm-10">
                            <select class="form-control" name="ascription_team">
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 所在部门 </label>
                        <div class="col-sm-10">
                            <select class="form-control tag-input-style" id="sdepart" name="select_department" multiple="multiple"  data-placeholder="请选择所在部门...">
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label no-padding-right" style="margin-top: 4px;"> 擅长类目<br /><span style="font-size:1px">按住Ctrl可多选</span> </label>
                        <div class="col-sm-10">
                            <select class="form-control" name="skill_t" multiple="multiple">
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        </div>` ,
        success: function(layero, index) {
            var defaultTagMsg = $('#tagElement').text();
            // 获取所有的部门
            $.get('/api/dd/getDepartments', function (resp) {
                $('#tree1').ace_tree({
                    dataSource: function(options, callback) {
                        if(!("text" in options) && !("type" in options)){
                            $data = formatTree(resp.data.department);
                            callback({data: $data});
                            return;
                        }
                        if("type" in options && options.type == "folder") {
                            if("additionalParameters" in options && "children" in options.additionalParameters) {
                                $data = options.additionalParameters.children || {};
                            } else {
                                $data = {}
                            }
                            // 部门的最后一层节点
                            // 取出部门成员列表
                            if (typeof(options['additionalParameters']) == 'undefined') {
                                $.get('/api/dd/getDepartmentListUserinfo?deptId=' + options.id, function (resp) {
                                    var i = 0;
                                    for (; i < resp.data.userlist.length; i++) {
                                        resp.data.userlist[i]['text'] = resp.data.userlist[i]['name'];
                                        resp.data.userlist[i]['type'] = 'item';
                                    }
                                    setTimeout(function() {
                                        callback({data: resp.data.userlist});
                                    } , parseInt(Math.random() * 500) + 200);
                                }, 'json');
                                return;
                            }
                        }
                        if($data != null) {
                            setTimeout(function() {
                                callback({data: $data});
                            } , parseInt(Math.random() * 500) + 200);
                        }
                    },
                    multiSelect: true,
                    cacheItems: true,
                    'open-icon' : 'ace-icon tree-minus',
                    'close-icon' : 'ace-icon tree-plus',
                    'itemSelect' : true,
                    'folderSelect': false,
                    'selected-icon' : 'ace-icon fa fa-check',
                    'unselected-icon' : 'ace-icon fa fa-times',
                    loadingHTML : '<div class="tree-loading"><i class="ace-icon fa fa-refresh fa-spin blue"></i></div>'
                })
                // 选中部门时
                .on('selected.fu.tree', function (e, data) {
                    if ($('#tagElement').text() === defaultTagMsg) {
                        $('#tagElement').html('');
                    }
                    var i = 0, h = [], tagElement = $("#tagElement").find('.tag');
                    for (; i < data.selected.length; i++) {
                        var dat = data.selected[i];
                        var isAdd = true;
                        if (tagElement.length > 0) {
                            tagElement.each(function () {
                                if ($(this).attr('userid') == dat.userid) {
                                    isAdd = false;
                                    return isAdd;
                                }
                            });
                        }
                        if (isAdd) {
                            h.push(`<span class="tag" userid="${dat.userid}" style="padding-right: 6px">${dat.name}</span>`);  
                        }
                    }
                    h = h.join('');
                    $("#tagElement").append(h);
                })
                // 删除部门时
                .on('deselected.fu.tree', function (e, data) {
                    if (data.selected.length <= 0) {
                        $('#tagElement').text(defaultTagMsg);
                    }
                    $("#tagElement").find('.tag[userid="'+data.target.userid+'"]').remove();
                });
            }, 'json');
            // 获取所有的班组
            $.get('/deviceTeam/pageIndex?_token=8b5491b17a70e24107c89f37b1036078&category_id=&category_code=&page_no=1&page_size=100', function (resp) {
                var team = '';
                $.each(resp.results, function (i, row) {
                    team += '<option value="'+row.id+'">'+row.name+'</option>';
                });
                $('select[name="ascription_team"]').attr("multiple", "multiple").html(team);
            }, 'json');
            // 获取所有的部门
            $.get('/deviceDepartment/treeIndex?_token=8b5491b17a70e24107c89f37b1036078', function(resp) {
                resp = resp.results;
                var i = 0;
                for (; i < resp.length; i++) {
                    var item = resp[i];
                    if (item['parent_id'] == 0) {
                        $('#sdepart').append('<option value="' + item.id + '" pid="' + item.parent_id + '">' + item.name + '</option>');
                    } else {
                        $('<option value="' + item.id + '" pid="' + item.parent_id + '">' + item.name + '</option>').insertAfter('#sdepart option[value="' + item.parent_id + '"]');
                    }
                }
                $('#sdepart').chosen({allow_single_deselect:true}).on('chosen:showing_dropdown', function () {
                    var departELE = $('#sdepart');
                    var chosenELE = departELE.next();
                    chosenELE.find('.chosen-drop li').each(function () {
                        var li = $(this);
                        var idx = li.data('optionArrayIndex');
                        var opt = departELE.find('option').eq(idx);
                        if (opt.attr('pid') != 0) {
                            li.html('<span class="tag-prefix" style="margin-left:15px;"></span> ' + li.html());
                        }
                    });
                    var i = 0;
                    for (; i < resp.length; i++) {
                        var item = resp[i];
                        if (item['parent_id'] == 0) {
                            var lastIDX = $('#sdepart option[pid="' + item.id + '"]:last').index();
                            chosenELE.find('.chosen-drop li:eq(' + lastIDX + ') .tag-prefix').addClass('last-tag');
                        }
                    }
                });
            }, 'json');
            // 获取设备顶层分类
            $.get('/devicetype/getParent?_token=8b5491b17a70e24107c89f37b1036078', function (resp) {
                var opts = '';
                $.each(resp.data, function (i, row) {
                    opts += '<option value="'+row.id+'">'+row.name+'</option>';
                });
                $('select[name="skill_t"]').html(opts);
            }, 'json');
        },
        btn: ['添加', '取消'],
        btn1: function() {
            var post = {
                user: [],
                team_id: [],
                team_name: [],
                department_id: [],
                department_name: [],
                skill_t: [],
                skill_t_name: []
            };
            var users = $('#tagElement').find('.tag');
            if (users.length <= 0) {
                layer.alert('至少选择1位成员！');
                return;
            }
            users.each(function () {
                var tag = $(this);
                post.user.push(tag.attr('userid'));
            });
            // 成员隶属班组
            $('select[name="ascription_team"] option:selected').each(function () {
                post.team_id.push($(this).val());
                post.team_name.push($(this).text());
            });
            if (post.team_id === '') {
                layer.alert('请选择成员隶属班组！');
                return;
            }
            post.team_name = post.team_name.join(',');
            // 成员所在部门
            $('#sdepart option:selected').each(function () {
                post.department_id.push($(this).val());
                post.department_name.push($(this).text());
            });
            if (!post.department_id) {
                layer.alert('请选择成员所在部门！');
                return;
            }
            post.department_name = post.department_name.join(',');
            // 成员擅长类目
            $('select[name="skill_t"] option:selected').each(function () {
                post.skill_t.push($(this).val());
                post.skill_t_name.push($(this).text());
            });
            if (post.skill_t.length <= 0) {
                layer.alert('请选择成员擅长类目！');
                return;
            }
            post.skill_t_name = post.skill_t_name.join(',');
            AjaxClient.post({
                url: URLS['deviceMember'].store + '?_token=8b5491b17a70e24107c89f37b1036078',
                data: post,
                dataType: 'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success: function(resp){
                    layer.close(layerLoading);
                    var msg = '';
                    if (resp.results.bin_id.failure.length > 0) {
                        var i = 0;
                        for (; i < resp.results.bin_id.failure.length; i++) {
                            var fail = resp.results.bin_id.failure[i];
                            msg += '<p style="color:red;font-size:14px;">' + fail.msg + '</p>';
                        }
                    }
                    if (!msg) {
                        msg = '添加成功！';
                    }
                    layer.alert(msg);
                },
                fail: function(rsp){
                    layer.close(layerLoading);
                }
            }, this);
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
        url: URLS['deviceMember'].department+'?'+_token,
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
        url: URLS['deviceMember'].chargeShow+'?'+_token,
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
        url: URLS['deviceMember'].chargeShow+'?'+_token,
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
        url: URLS['deviceMember'].getpartners+'?'+_token+'&is_vendor=1',
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
        url: URLS['deviceMember'].getpartners+'?'+_token+'&is_vendor=1',
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
function selectHtml(fileData, flag, value) {
    var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
    if (fileData.length) {
        parent_id = fileData[0].parent_id;
        lis = treeHtml(fileData, parent_id, 'select', value);
    }
    itemSelect.length ? (selectVal = itemSelect[0].name, parent_id = itemSelect[0].id) :
        (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
    if (flag === 'view' || flag === 'edit') {
        innerhtml = `<div class="el-select">
        <input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
        <input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
    </div>`;
    } else {
        innerhtml = `<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" data-code="" id="parent_id" value="">
    </div>
    <div class="el-select-dropdown">
       
        <ul class="el-select-dropdown-list">
            <li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    }
    elSelect = `<div class="el-select-dropdown-wrap">
        ${innerhtml}
    </div>`;
    itemSelect = [];
    return elSelect;
}

function treeHtml(fileData, parent_id, flag, value) {

    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass = index === children.length - 1 ? 'last-tag' : '';
        var level = item.level;
        var distance, className, itemImageClass, tagI;
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
        flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`) : (distance = level * 20, tagI = '');
        var selectedClass = '';
        var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>` : `${tagI}<span>${item.name}</span>`;
        if (flag === 'table') {
            _html += `
        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
          <td>${span}</td>
          <td><div>${item.remark.length > 30 ? item.remark.substring(0, 30) + '...' : item.remark}</div></td>
          <td class="right">
            <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
            <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
            <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
          </td>
        </tr>
        ${treeHtml(fileData, item.id, flag)}
        `;
        } else {
            if (flag == 'template') {
                item.id == value ? (tempSelect.push(item), selectedClass = 'selected') : null;
            } else {
                item.id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
            }

            _html += `
        <li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
        ${treeHtml(fileData, item.id, flag, value)}
        `;
        }
    });
    return _html;
};

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
        url: URLS['deviceMember'].unique+"?"+_token+urlLeft,
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
