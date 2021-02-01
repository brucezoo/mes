var layerModal,layerLoading,
    parentId=0,
    nameCorrect=!1,
    codeCorrect=!1,
    itemSelect=[],
    ajaxData={};
validatorToolBox={
    checkName: function(name){
        var value=$('#addType_form').find('#'+name).val().trim();
        return Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),nameCorrect=!1,!1):
            !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"),nameCorrect=!1,!1):
                (nameCorrect=1,!0);
    },
},
    validatorConfig = {
        name:'checkName'
    };

$(function () {
    getTypeData();
    bindEvent()
});

//重置搜索参数
function resetParam(){
    ajaxData={
        name: '',
        order: 'desc',
        sort: 'id',
    };
}

//显示错误信息
function showInvalidMessage(name,val) {
    $('.addType').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('.addType').find('.submit').removeClass('is-disabled');
}

//获取层数分类列表
function getTypeData(){
    $('.table_tbody').html(' ');
    AjaxClient.get({
        url: URLS['plienumber'].list+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            if(rsp.results && rsp.results.length){
                $('.table_tbody').html(treeHtml(rsp.results));
            }else{
                noData('暂无数据',9)
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取面料分类失败，请刷新重试',4);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

// 添加面料分类
function addType(data) {
    $('.add').addClass("is-disabled");

    AjaxClient.post({
        url: URLS['plienumber'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('updateSuccess','添加成功');
            layer.close(layerModal);
            getTypeData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        },
        complete: function(){
            $('.add').removeClass('is-disabled');
        }
    },this)
}

// 删除层数
function typeDelete(id) {
    AjaxClient.post({
        url: URLS['plienumber'].delete,
        data: {
            plie_number_id: id,
            _token: TOKEN
        },
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getTypeData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}

// 编辑层数
function editType(data) {
    $('.edit').addClass("is-disabled");

    AjaxClient.post({
        url: URLS['plienumber'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getTypeData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('.edit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this)
}

function bindEvent(){
//输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var name=$(this).attr("id");
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name);
    });

//添加页面
    $('body').on('click','#type_add.button',function(e){
        e.stopPropagation();
        showTypeModal('add', {});
    });

//关闭弹窗
    $('body').on('click','.addType .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click','.addType .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addType_form');
            var id= parentForm.find('#itemId').val(),
                name = parentForm.find('#name').val().trim();
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(nameCorrect) {
                $(this).hasClass('edit') ? (
                    editType({
                        plie_number_id: id,
                        name: name,
                        _token: TOKEN
                    })
                ) : (addType({
                    name: name,
                    _token: TOKEN
                }))
            }
        }
    });

//点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
            layer.close(index);
            typeDelete(id);
        });
    });

//点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        var $tr = $(this).parents('tr');
        $tr.addClass('active');
        showTypeModal('edit', {plie_number_id: $tr.attr("data-id"), name: $tr.attr("data-name")});
    });
}



function showTypeModal(flag,data) {
    var {plie_number_id='',name=''}={};
    if(data){
        ({plie_number_id='',name=''}=data)
    }

    var labelWidth=100,
        title='查看层数分类',
        btnShow='btnShow',
        readonly='',
        noEdit='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑层数分类',noEdit='readonly="readonly"'):title='添加层数分类');
    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addType formModal formMateriel" id="addType_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${plie_number_id}">
         
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" ${readonly} value="${name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                </div>
                <div class="el-form-item ${btnShow}" style="margin-top: 20px;">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                    </div>
                </div>
</form>`,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

function treeHtml(fileData) {
    return fileData.map(function (item, index) {
        return `<tr data-id="${item.plie_number_id}" data-name="${item.name}">
	          <td style="width: 50%;">${item.name}</td>
	          <td class="right">
                <button data-id="${item.plie_number_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.plie_number_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>`;
    });
};
