var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    categoryList={},
    codeCorrect=!1,
    unitCorrect=!1,
    nameCorrect=!1,
    classType={"wx": "维修", "by": "保养", "xj": "巡检", "bx": "报修"},
    validatorToolBox = {
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"选型不能为空"),nameCorrect=!1,!1):
                    Validate.checkNot0(value)? (showInvalidMessage(name,"选型不能为0"),nameCorrect=!1,!1):(nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value = $('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编号不能为空"),codeCorrect=!1,!1):
                (codeCorrect=1,!0);
        },
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name,flag,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    nameCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    nameCorrect=1;
                }
            });
        },
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
        code: "checkCode"
    },

    remoteValidatorConfig = {
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };

$(function(){
    resetParam();
    getOtherOption();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addOtherOption_from').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
    ajaxData = {category_id: '', category_code: ''};
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
        url: URLS['otherOption'].unique+"?"+_token+urlLeft,
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
            getOtherOption();
        }
    });
};

//获取异常单列表
function getOtherOption(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['deviceTeam'].pageIndex+"?"+_token+urlLeft,
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
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',10);
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
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

//生成列表数据
function createHtml(ele,data) {
    var team_ids = [];
    data.forEach(function(item,index) {
        team_ids.push(item.id);
        item.duties = item.duties.split(",");
        var i = 0;
        for (; i < item.duties.length; i++) {
            item.duties[i] = classType[item.duties[i]];
        }
        item.duties = item.duties.join('，');
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.name}</td>
                <td>${item.code}</td>
                <td>${item.duties}</td>
                <td><i class="ace-icon fa fa-spinner fa-spin"></i></td>
                <td><i class="ace-icon fa fa-spinner fa-spin"></i></td>
                <td class="right">
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                    <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                    <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
    $.post('/deviceTeam/getTeamCount?_token=8b5491b17a70e24107c89f37b1036078', {"id": team_ids}, function (resp) {
        for (xid in resp.data.device) {
            var html =  `<a href="javascript:layer.alert('暂不支持此操作');">${resp.data.device[xid]}台</a>`;
            $('[data-id="' + (xid.split('_')[1]) + '"] td:eq(3)').html(html);
        }
        for (xid in resp.data.team) {
            var html =  `<a href="javascript:layer.alert('暂不支持此操作');">${resp.data.team[xid]}人</a>`;
            $('[data-id="' + (xid.split('_')[1]) + '"] td:eq(4)').html(html);
        }
    }, 'json');
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
    //输入框的相关事件
    $('body').on('focus', '.formOtherOption:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formOtherOption:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addOtherOption_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });

    //添加
    $('.button_check').on('click',function(){
        Modal('add');

    });
    $('.table_tbody').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewOtherOption($(this).attr("data-id"),'view');
    });
    $('.table_tbody').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewOtherOption($(this).attr("data-id"),'edit');
    });
    $('.table_tbody').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteOtherOption(id);
        });
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);

    });

    //弹窗下拉
    $('body').on('click','.formOtherOption:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formOtherOption:not(".disabled") .el-select-dropdown-item',function(e){
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

// //检验单下拉筛选
//     $('body').on('click','.search-span',function () {
//         var code = $('#searchVal').val();
//         var ele=$(this).siblings('.el-input');
//         getSearchCode(ele,code);
//     });
    //添加和编辑的提交
    $('body').on('click','.formOtherOption:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addOtherOption_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            var name=parentForm.find('#name').val().trim(),
                code=parentForm.find('#code').val().trim(),
                duties=[];
            if (parentForm.find('#duties_wx').is(":checked") === true) {
                duties.push('wx');
            }
            if (parentForm.find('#duties_by').is(":checked") === true) {
                duties.push('by');
            }
            if (parentForm.find('#duties_xj').is(":checked") === true) {
                duties.push('xj');
            }
            if (parentForm.find('#duties_bx').is(":checked") === true) {
                duties.push('bx');
            }
            if (duties.length <= 0) {
                showInvalidMessage('duties', "至少勾选一个职责");
                return;
            }
            for (var type in validatorConfig) {
                validatorToolBox[validatorConfig[type]](type);
            }
            if (nameCorrect && codeCorrect) {
                if ($(this).hasClass('edit') === true) {
                    editOtherOption({id:id, name:name, code:code, duties:duties, _token:TOKEN});
                } else {
                    addOtherOption({name:name, code:code, duties:duties, _token:TOKEN});
                }
            }
        }
    });
};

function deleteOtherOption(id) {

    AjaxClient.get({
        url: URLS['deviceTeam'].destroy+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getOtherOption();
            }
        }
    },this);
}

//查看其他选型
function viewOtherOption(id,flag){
    AjaxClient.get({
        url: URLS['deviceTeam'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该选型失败');
            if(rsp.code==404){
                getOtherOption();
            }
        }
    },this);
}

function editOtherOption(data) {
    AjaxClient.post({
        url: URLS['deviceTeam'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

function addOtherOption(data) {
    AjaxClient.post({
        url: URLS['deviceTeam'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getOtherOption();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addOtherOption_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

function Modal(flag,data){
    var {id='',name='',code=''} = {};
    if (data) {
        ({id='',name='',code=''} = data);
    }
    var labelWidth = 50,
        btnShow = 'btnShow',
        title = '查看班组',
        textareaplaceholder = '',
        readonly = '',
        noEdit = '';
    flag==='view' ? (btnShow = 'btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加班组':(title='编辑班组',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form style="padding: 30px;" class="formModal formOtherOption" id="addOtherOption_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${id}">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入选型" value="${name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编号<span class="mustItem">*</span></label>
                <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编号" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">职责<span class="mustItem">*</span></label>
                <div class="checkbox" id="duties">
                    <label>
                        <input id="duties_wx" type="checkbox" class="ace" ${readonly} />
                        <span class="lbl"> 维修</span>
                    </label>
                    <label>
                        <input id="duties_by" type="checkbox" class="ace" ${readonly} />
                        <span class="lbl"> 保养</span>
                    </label>
                    <label>
                        <input id="duties_xj" type="checkbox" class="ace" ${readonly} />
                        <span class="lbl"> 巡检</span>
                    </label>
                    <label>
                        <input id="duties_bx" type="checkbox" class="ace" ${readonly} />
                        <span class="lbl"> 报修</span>
                    </label>
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            if (data && typeof(data.duties) != 'undefined') {
                data.duties = data.duties.split(',');
                var i = 0;
                for (; i < data.duties.length; i++) {
                    $('#duties_' + data.duties[i]).prop('checked', true);
                }
            }
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

