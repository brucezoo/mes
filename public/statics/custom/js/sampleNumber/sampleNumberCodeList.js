var layerModal,
    layerLoading,
    layerEle='',
    itemSelect=[],
    codeCorrect=!1,
    validatorToolBox={
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                    !Validate.checkMaterialClass(value)?(showInvalidMessage(name,"编码由1-10位大写字母组成"),codeCorrect=!1,!1):
                        (codeCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckCode: function(name,flag,id){
            var datacode=$('#parent_id').attr('data-code'),
                value=datacode+$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage($('#'+name),val);
                }else{
                    codeCorrect=1;
                }
            });
        },
    },
    validatorConfig = {
        code: "checkCode"
    },remoteValidatorConfig={
        code: "remoteCheckCode"
    };

$(function(){
    getCodeList();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

//获取样册号编码列表
function getCodeList(){
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['sampleCode'].codeList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                $('.table_tbody').html(treeHtml(rsp.results,parent_id,'table'));
            }else{
                noData('暂无数据',3);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取样册号类别列表失败，请刷新重试',3);
        }
    },this);
};

function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        var distance,className,itemImageClass,tagI;
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.type_name}</span> </div>`: `${tagI}<span>${item.type_name}</span> `;
        if(flag==='table'){
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> </div>`: `${tagI}<span>${item.name}</span>`}</td>
	          <td>${item.docking_people}</td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
        }else{
            item.id==value?(itemSelect.push(item),selectedClass='selected'):null;
            _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.type_name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag,value)}
	        `;
        }
    });
    return _html;
};


function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','.formInspect:not(".disabled") .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //弹窗取消
    $('body').on('click','.formInspect:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewInspect($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewSampleNumberCode($(this).attr("data-id"),'edit');
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteSampleNumberCode(id);
        });
    });
    //弹窗下拉
    $('body').on('click','.formInspect:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formInspect:not(".disabled") .el-select-dropdown-item',function(e){
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
    $('body').on('click','.formInspect:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addInspect_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(codeCorrect){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var code=parentForm.find('#code').val().trim();
                var type=parentForm.find('#type').val().trim();
                $(this).hasClass('edit')?(
                  editSampleNumberCode({
                        id:id,
                        name:code,
                        type_id:type,
                        _token: TOKEN
                    })
                ):(
                    addSampleNumberCode({
                        name:code,
                        type_id:type,
                        _token: TOKEN
                    })
                )
            }
        }
    });
    //输入框的相关事件
    $('body').on('focus','.formInspect:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formInspect:not(".disabled") .el-input:not([readonly])',function(){
        // var flag=$('#addInspect_from').attr("data-flag"),
        //     name=$(this).attr("id"),
        //     id=$('#itemId').val();
        // validatorConfig[name]
        // && validatorToolBox[validatorConfig[name]]
        // && validatorToolBox[validatorConfig[name]](name)
        // && remoteValidatorConfig[name]
        // && remoteValidatorToolbox[remoteValidatorConfig[name]]
        // && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });
    //添加样册号编码
    $('.button_add').on('click',function(){
        codeCorrect=!1;
        // getCategories(0,'add');
        getSampleNumberListObjects(0,'add');
    });
    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){
        if($(this).parents('.treeNode').hasClass('collasped')){
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        }else{
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });
};

//获取类型select列表
function getSampleNumberListObjects(id,flag,data){
  var dtd=$.Deferred();
  AjaxClient.get({
      url: URLS['sampleType'].typeList+"?"+_token,
      dataType: 'json',
      beforeSend: function(){
          layerLoading = LayerConfig('load');
      },
      success: function(rsp){
          layer.close(layerLoading);
          console.log(rsp.results)
          Modal(flag,rsp.results,data);
          dtd.resolve(rsp);
      },
      fail: function(rsp){
          layer.close(layerLoading);
          console.log('获取类别失败');
          dtd.reject(rsp);
      }
  },this);
  return dtd;
};

//查看和添加和编辑模态框
function Modal(flag,fileData,data){
    var {id='',type='',name='',docking_people='',parent_id=''}={};
    if(data&&data.length){
        ({id='',type='',name='',docking_people='',parent_id=''}=data[0]);
    }
    var labelWidth=100,
        btnShow='btnShow',
        title='查看样册号编码',
        textareaplaceholder='',
        readonly='',
        noEdit='';
        if(flag=="add"){selecthtml=selectHtml(fileData,flag,parent_id);}
    flag==='add'?title='添加样册号编码':(title='编辑样册号编码',textareaplaceholder='',noEdit='');

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formInspect" id="addInspect_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
            <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">类型</label>
                ${flag=='add'?selecthtml:`<input type="text" id="type" data-name="类型" class="el-input" placeholder="请输入类型" value="${type}">`}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                <input type="text" id="code" data-name="编码" class="el-input" placeholder="请输入编码" value="${name}">
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
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

//生成上级分类数据
function selectHtml(fileData,flag,value){
    var elSelect,innerhtml,selectVal,lis='',parent_id='';
    if(fileData.length){
        parent_id=fileData[0].parent_id;
        lis=treeHtml(fileData,parent_id,'select',value);
    }
    itemSelect.length?(selectVal=itemSelect[0].name,parent_id=itemSelect[0].id):
        (flag=='view'||flag=='edit'?(selectVal='无',parent_id=0):(selectVal='--请选择--',parent_id=0));
    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
    }else{
        innerhtml=`<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="type" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }
    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    itemSelect=[];
    return elSelect;
}
//编辑样册号编码
function editSampleNumberCode(data){
    AjaxClient.post({
        url: URLS['sampleCode'].codeUpdate,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getCodeList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addInspect_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
//添加样册号编码
function addSampleNumberCode(data){
    AjaxClient.post({
        url: URLS['sampleCode'].codeAdd,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getCodeList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addInspect_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}
//查看样册号编码
function viewSampleNumberCode(id,flag){
    AjaxClient.get({
        url: URLS['sampleCode'].codeShow+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,id,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getCodeList();
            }
        }
    },this);
}
//删除样册号编码
function deleteSampleNumberCode(id){
    AjaxClient.post({
        url: URLS['sampleCode'].codeDelete+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getCodeList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getCodeList();
            }
        }
    },this);
}