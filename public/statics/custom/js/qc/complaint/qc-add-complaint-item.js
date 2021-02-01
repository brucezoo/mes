var complaint_id,
    codeCorrect=!1,
    ajaxSubmitData={},
    material_select=[],
    validatorToolBox={
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1): (codeCorrect=1,!0);
        }

    },
    remoteValidatorToolbox={
        remoteCheckCode: function(name){
            var value=$('#'+name).val().trim();
            getUnique(name,value,function(rsp){
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
        complaint_code: "checkCode",
    },remoteValidatorConfig={
        complaint_code: "remoteCheckCode"
    };
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addDeviceList_form').find('.submit').removeClass('is-disabled');
}
//检测唯一性
function getUnique(field,value,fn){
    var urlLeft='';

        urlLeft=`&field=${field}&value=${value}`;

    var xhr=AjaxClient.get({
        url: URLS['complaint'].unique+"?"+_token+urlLeft,
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
$(function(){
    bindEvent();
    laydate.render({
        elem: '#NNC_received_date',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#samples_received_date',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#time_maintain_production',
        done: function (value, date, endDate) {

        }
    });
    laydate.render({
        elem: '#plan_date',
        done: function (value, date, endDate) {

        }
    });

    creator_token = getCookie("session_emi2c_mlily_demo");
    ajaxSubmitData.creator_token = '24ed0q9gukcdnnb3tjcna1unj7';
    fileinit('attachment', [], []);
    getCode('');

    getFactory();

    multiSelect();
});

//获取编码
function getCode(typecode){
    var data={
        _token: TOKEN,
        type_code: typecode,
        type: 14
    };
    AjaxClient.post({
        url: URLS['complaint'].getCode,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                setting_id=rsp.results.encoding_setting_id;
                automatic_number=rsp.results.automatic_number;
                if(rsp.results.automatic_number=='1'){//自动生成允许手工改动
                    $('#complaint_code').val(rsp.results.code).attr('data-val',rsp.results.code);
                }else if(rsp.results.automatic_number=='2'){//自动生成不允许手工改动

                    $('#complaint_code').val(rsp.results.code).attr({'readonly':'readonly','data-val':rsp.results.code});
                }else{
                    $('#complaint_code').removeAttr('readonly');
                }
            }else{
                console.log('获取客诉编码失败');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取客诉编码失败');
        }
    },this);
}

//附件初始化
function fileinit(ele, preUrls, preOther) {
    $('#' + ele).fileinput({
        'theme': 'explorer-fa',
        language: 'zh',
        uploadAsync: true,
        'uploadUrl': URLS['check'].uploadAttachment,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'complaint';
            obj._token = TOKEN;
            obj.creator_token = ajaxSubmitData.creator_token;
            return obj;
        },
        initialPreview: preUrls,
        initialPreviewConfig: preOther,
        dropZoneEnabled: false,
        showCaption: false,
        showClose: false,
        showUpload: false,
        showRemove: false,
        maxFileSize: 500 * 1024,
        maxFileCount: 1,
        overwriteInitial: false,
        showCancel: false
    }).on('fileselect', function (event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        // console.log(previewId)
        //   console.log(file.lastModified);
        // $('#'+previewId).attr('data-preview','preview-'+file.lastModified);
    }).on('filepreupload', function (event, data, previewId, index) {
        // console.log(previewId);
        // console.log(data);
        // console.log(data.files[0].lastModified);
        $('#' + previewId).attr('data-preview', 'preview-' + data.files[0].lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        var result = data.response,
            file = data.files[0];
        // console.log(result);
        if (result.code == '200') {
            $('.file-preview-frame[data-preview=preview-' + file.lastModified + ']').addClass('uploaded').attr({
                'data-url': result.results.path,
                'attachment_id': result.results.attachment_id
            }).find('td.creator').html(`<p class="creator_name">${result.results.creator}</p>
            <p class="creator_time">${result.results.time}</p>`).removeAttr('data-preview');
        } else {
            var ele = $('.file-preview-frame[data-preview=' + previewId + ']');
            ele.remove();
            var errorHtml = `<button type="button" class="close kv-error-close" aria-label="Close">
                           <span aria-hidden="true">×</span>
                        </button>
                        <ul>
                            <li>${result.message}</li>
                        </ul>`;
            $('.kv-fileinput-error.file-error-message').html(errorHtml).show();
            console.log('文件上传失败' + previewId);
        }
    }).on('filebeforedelete', function (event, key, data) {
        console.log('初始化附件删除');
    });
}
//存储附件数据
function getFujianData() {
    var ele = $('#addFujian_from .file-preview-frame.file-preview-success,#addFujian_from .file-preview-frame.init-success-file');
    var fujianData = [];
    ele.each(function () {
        var item = {
            attachment_id: $(this).attr('attachment_id'),
            comment: $(this).find('.fujiantext').val().trim()
        };
        fujianData.push(item);
    });
    ajaxSubmitData.attachments = JSON.stringify(fujianData);
}
function bindEvent() {

    $('body').on('click','.Fujian_save',function (e) {
        getFujianData();
        ajaxSubmitData.complaint_id = complaint_id;
        ajaxSubmitData._token = TOKEN;
        AjaxClient.post({
            url: URLS['complaint'].addAttachments,
            data:ajaxSubmitData,
            dataType: 'json',
            beforeSend: function(){
                layerLoading = LayerConfig('load');
            },
            success: function(rsp){
                layer.close(layerLoading);
                layer.confirm('保存成功！', {icon: 3, title:'提示',offset: '250px',end:function(){
                }}, function(index){
                    layer.close(index);
                });
            },
            fail: function(rsp){
                layer.close(layerLoading);
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }

            }
        },this);

    })
    //输入框的相关事件
    $('body').on('focus', '#complaint_code', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '#complaint_code', function () {
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
    //tap切换按钮
    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){
        if(!$(this).hasClass('active')){
            if($(this).hasClass('el-ma-tap')){//替代物料相互切换
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
            }else{
                var formerForm=$(this).siblings('.el-tap.active').attr('data-item');
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form=$(this).attr('data-item');
                $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
            }
        }
    });
    //上一步按钮
    $('body').on('click','.el-button.prev',function(){
        var prevPanel=$(this).attr('data-prev');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+prevPanel).addClass('active');
        $('.el-tap[data-item='+prevPanel+']').addClass('active').siblings().removeClass('active');
    });
    //下一步按钮
    $('body').on('click','.el-button.next:not(.is-disabled)',function(){
        var nextPanel=$(this).attr('data-next');
        $(this).parents('.el-panel').removeClass('active').siblings('.'+nextPanel).addClass('active');
        $('.el-tap[data-item='+nextPanel+']').addClass('active').siblings().removeClass('active');

    });

    //弹窗下拉
    $('body').on('click','.el-select',function(e){
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉选择
    $('body').on('click','.el-select-dropdown-item',function(e){
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

    $('body').on('click','#number_type',function () {
        $('#material_toggle').toggle();
    });

    //basic提交
    $('body').on('click','.basic_save',function (e) {
        e.stopPropagation();
        var customer_name = $('#customer_name').val().trim(),
            complaint_code = $('#complaint_code').val().trim(),
            type = $('#number_type').is(':checked')?1:0,
            NNC_received_date = $('#NNC_received_date').val().trim(),
            samples_received_date = $('#samples_received_date').val().trim(),
            defect_rate = $('#defect_rate').val().trim(),
            defect_material_batch = $('#defect_material_batch').val().trim(),
            defect_material_rejection_num = $('#defect_material_rejection_num').val().trim(),
            defect_description = $('#defect_description').val().trim(),
            factory_id = $('#factory_id').val().trim(),
            customer_type = $('#customer_type').val().trim(),
            material = $('#material_number').val().join(',');
            if(type==0){
                var po_number= $('#po_number').val().join(',');
            }
        if(po_number || material){
                submitBasic({
                    customer_name:customer_name,
                    complaint_code:complaint_code,
                    type:type,
                    po_id:po_number?po_number:'',
                    material_id:material?material:'',
                    received_date:NNC_received_date,
                    samples_received_date:samples_received_date,
                    defect_rate:defect_rate,
                    defect_material_batch:defect_material_batch,
                    defect_material_rejection_num:defect_material_rejection_num,
                    defect_description:defect_description,
                    factory_id: factory_id,
                    customer_type: customer_type,
                    _token:TOKEN
                });
            }else {
                layer.confirm('生产单或物料填写不正确！', {icon: 3, title:'提示',offset: '250px',end:function(){
                }}, function(index){
                    layer.close(index);
                });
            }
    })
    $('#stock').on('click',function (e) {
        e.stopPropagation();
        $('.stock').toggle();
    });
    $('#wip').on('click',function (e) {
        e.stopPropagation();
        $('.wip').toggle();
    });
    $('#customer_stock').on('click',function (e) {
        e.stopPropagation();
        $('.customer_stock').toggle();
    });
    $('#exist_require').on('click',function (e) {
        e.stopPropagation();
        $('.require_toggle').toggle();
    });
    //material提交
    $('body').on('click','.material_save',function (e) {
        e.stopPropagation();
    })
    //plan提交
    $('body').on('click','.plan_save',function (e) {
        e.stopPropagation();
        var stock = $('#stock').is(':checked')?1:0,
            stock_num = $('#stock_num').val().trim(),
            stock_quality = $('#stock_quality').val().trim(),
            stock_flag = $('#stock_flag').is(':checked')?1:0,
            wip = $('#wip').is(':checked')?1:0,
            wip_num = $('#wip_num').val().trim(),
            wip_quality = $('#wip_quality').val().trim(),
            wip_flag = $('#wip_flag').is(':checked')?1:0,
            customer_stock = $('#customer_stock').is(':checked')?1:0,
            exist_require = $('#exist_require').is(':checked')?1:0,
            require = $('#require').val().trim(),
            customer_stock_num = $('#customer_stock_num').val().trim(),
            customer_stock_quality = $('#customer_stock_quality').val().trim(),
            rejected_handle = $('#rejected_handle').val().trim(),
            customer_stock_time = $('#customer_stock_time').val().trim(),
            plan_date = $('#plan_date').val().trim(),
            next_shipment_schedule_num = $('#next_shipment_schedule_num').val().trim(),
            rejected_effect = $('#rejected_effect').val().trim(),
            pay_for_rejected = $('#pay_for_rejected').val().trim(),
            pay_for_travel = $('#pay_for_travel').val().trim(),
            pay_for_other = $('#pay_for_other').val().trim(),
            next_shipment_schedule_flag = $('#next_shipment_schedule_flag').is(':checked')?1:0;
        submitPlan({
            customer_complaint_id:complaint_id,
            stock:stock,
            stock_num:stock_num,
            stock_quality:stock_quality,
            stock_flag:stock_flag,
            wip:wip,
            wip_num:wip_num,
            wip_quality:wip_quality,
            wip_flag:wip_flag,
            customer_stock:customer_stock,
            customer_stock_num:customer_stock_num,
            customer_stock_quality:customer_stock_quality,
            rejected_handle:rejected_handle,
            customer_stock_time:customer_stock_time,
            next_shipment_schedule_time:plan_date,
            next_shipment_schedule_num:next_shipment_schedule_num,
            next_shipment_schedule_flag:next_shipment_schedule_flag,
            exist_require:exist_require,
            require:require,
            rejected_effect:rejected_effect,
            pay_for_rejected:pay_for_rejected,
            pay_for_travel:pay_for_travel,
            pay_for_other:pay_for_other,
            _token:TOKEN
        });
    });
    $('body').on('click','.button_add_material',function (e) {
        e.stopPropagation();
        getMaterials();
    });
    //树中节点点击
    $('body').on('click', '.item-name:not(.noedit)', function () {
        if ($(this).hasClass('bom-tree-item')) {//bom的树
            $(this).toggleClass('selected');
            var material = {
                item_id:'',
                id:$(this).attr('data-post-id'),
                code:tansferNull($(this).attr('data-post-code')),
                name:tansferNull($(this).attr('title'))
            };
            if($(this).hasClass('selected')){
                if(material_select.indexOf(material)==-1){
                    material_select.push(material);
                }
            }else{
                var index=material_select.indexOf(material);
                material_select.splice(index,1);
            }
        }

    });
    $('body').on('click','.submitMater',function (e) {
        e.stopPropagation();
        $('#table_attr_table .table_tbody').html('');
        var _html = '';
        material_select.forEach(function (item) {
            _html+=`<tr data-id="${item.id}">
                                <td>${tansferNull(item.code)}</td>
                                <td>${tansferNull(item.name)}</td>
                            </tr>`;
        });
        $('#table_attr_table .table_tbody').html(_html);
        layer.close(layerModal);
    });
    $('body').on('click','.material_save',function (e) {
        e.stopPropagation();
        storeMater()
    })
}
function storeMater() {
    var dataInfo = {
        complaint_id:complaint_id,
        materials:material_select,
        _token:TOKEN
    }
    AjaxClient.post({
        url: URLS['complaint'].storeMaterials,
        data:dataInfo,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('保存成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}
function getMaterials() {
    AjaxClient.get({
        url: URLS['complaint'].getMaterials+"?"+_token+"&complaint_id="+complaint_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showModal(rsp.results.bom_tree);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        }
    },this);
}
function showModal(data){

    layerModal = layer.open({
        type: 1,
        title: 'BOM列表',
        offset: '70px',
        area: ['600px','600px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: '.layui-layer-title',
        moveOut: true,
        content: `<form class="attachmentForm formModal formAttachment" id="addExtend_from">
                    <div class="bom-fake-tree" style="cursor: e-resize;height: 510px;">
                        <div class="bom_tree_container">
                            <div class="bom-tree"></div>
                        </div>
                    </div>
                    <div class="el-form-item btnShow">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submitMater">确定</button>
                        </div>
                     </div>
                </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getLayerSelectPosition($(layero));
            createRealBom(data, function (bomHtml) {
                $('#addExtend_from .bom-tree').html(bomHtml);
                setTimeout(function () {
                    material_select.forEach(function (item) {
                        $('#addExtend_from .bom-tree').find('.item-name.bom-tree-item[data-post-id='+item.id+']').addClass('selected');
                    })
                }, 200);
            }, 'realBOM');


        },
        end: function () {

        }
    });
}
function createRealBom(treeData, fn, flag) {
    var bomHtml = '';
    if (treeData.children && treeData.children.length) {
        var bomitemHtml = treeList(treeData, 0, flag, treeData.usage_number, treeData.commercial);
        bomHtml = `<div class="tree-folder" data-id="${treeData.material_id}">
                     <div class="tree-folder-header">
                       <div class="flex-item">
                         <i class="icon-minus expand-icon"></i>
                         <div class="tree-folder-name">
                           <p class="bom-tree-item top-item item-name ${flag}" data-bom-id="${treeData.children[0].bom_id}" data-pid="0" data-post-id="${treeData.material_id}" data-post-code="${treeData.item_no}" title="${treeData.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${treeData.usage_number}${treeData.commercial}: ${treeData.usage_number}${treeData.commercial})` : ''}">
                             ${treeData.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${treeData.usage_number} ${treeData.commercial} : ${treeData.usage_number} ${treeData.commercial})` : ''} 
                           </p>
                         </div>
                       </div>
                     </div>
                     <div class="tree-folder-content">
                       ${bomitemHtml}
                     </div>
                  </div> `;
    } else {
        bomHtml = `<div class="tree-item" data-id="${treeData.material_id}">
                      <div class="flex-item">
                          <i class="item-dot expand-icon"></i>
                          <div class="tree-item-name">
                              <p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}" title="${treeData.name}">
                                  ${treeData.name}
                              </p>
                          </div>
                      </div>  
                   </div>`;
    }
    fn && typeof fn == 'function' ? fn(bomHtml) : null;
}
function treeList(data, pid, flag, num, commercial) {

    var bomTree = '';
    if (flag == 'realBOM' || flag == 'noedit' || flag == 'allBOM') {
        data.children.forEach(function (item) {



            var replaceStr = '', replaceCss = '', assemblyStr = '';
            if (item.replaces != undefined && item.replaces.length) {
                replaceStr = '<span>替</span>';
                replaceCss = 'replace-item';
            }

            if (item.has_bom && item.is_assembly == 1) {
                var content;
                if (item.has_route > 0) {
                    content='*';
                }else{
                    content='';
                }

                bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="expand-icon icon-plus getSonBom" data-posnr="${item.POSNR}" data-bom-id="${item.self_bom_id}"  data-num="${num}" data-commercial="${commercial}"></i>
                   <div class="tree-folder-name">
                   <p class="item-name bom-tree-item ${flag} ${replaceCss} sonBom" data-bom-item-id="${item.bom_item_id}"
                   data-bom-id="${item.self_bom_id || 0}" data-p-bom-id="${item.bom_id}"
                   data-pid="${item.ppid || 0}"
                   data-post-code="${treeData.item_no}"
                   data-posnr="${item.POSNR}"
                   data-post-id="${item.material_id}" title="${replaceStr}${item.name} ${flag == 'allBOM' ?
                    `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">${replaceStr}${item.name}
                   &nbsp;&nbsp; ${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" } </p>
                  <span class="replace">${content}</span>
                   </div></div></div>
                   <div class="tree-folder-content">

                   </div>
                </div> `;
            }
            else {
                var assbomid = '';
                if (item.is_assembly != 1 && item.has_bom) {
                    assemblyStr = '<span class="bom-flag" style="margin-left:3px;">BOM</span>';
                    assbomid = item.self_bom_id;
                    bom_nos = JSON.stringify(item.bom_nos);
                    bomTree += `<div class="tree-item" data-id="${item.material_id}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p style="display:inline-block;" class="item-name bom-tree-item ${flag} ${replaceCss} noAssemblyBom" data-p-bom-id="${item.bom_id}" data-bom-item-id="${item.bom_item_id}" data-bom-id="${assbomid}" data-posnr="${item.POSNR}" data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" data-bom_nos='${bom_nos}' title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}
                                    </p>
                                </div>
                                </div>
                                </div>`;
                }else{
                    bomTree += `<div class="tree-item" data-id="${item.material_id}" data-posnr="${item.POSNR}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" data-p-bom-id="${item.bom_id}" data-posnr="${item.POSNR}"  data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}
                                    </p>
                                </div>
                                </div>
                                </div>`;
                }
            }
        });
    } else {
        var children = getChildById(data, pid);
        children.forEach(function (item, index) {
            var hasChild = hasChilds(data, item.id);
            if (hasChild) {
                bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name">
                   <p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p>
                   </div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id, flag)}
                   </div>
                </div> `;
            } else {
                bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p></div></div>
                </div>`;
            }
        });
    }
    return bomTree;
}


function submitBasic(data) {
    AjaxClient.post({
        url: URLS['complaint'].addbasic,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            complaint_id = rsp.results;
            layer.confirm('保存成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
                $('.submit_plan').each(function (k,v) {
                    $(v).css('visibility','visible');
                })
                $('#submit_plan').css('display','block');

                if(!$('#show_addPlan_form').hasClass('active')){
                    if($('#show_addPlan_form').hasClass('el-ma-tap')){
                        $('#show_addPlan_form').addClass('active').siblings('.el-tap').removeClass('active');

                    }else{
                        var formerForm=$('#show_addPlan_form').siblings('.el-tap.active').attr('data-item');
                        $('#show_addPlan_form').addClass('active').siblings('.el-tap').removeClass('active');
                        var form=$('#show_addPlan_form').attr('data-item');
                        $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');

                    }
                }
            });


        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                if(rsp.field == 'complaint_code'){
                    codeCorrect=!1;
                    showInvalidMessage(rsp.field,'已注册！');

                }
                // LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}
function submitPlan(data) {
    AjaxClient.post({
        url: URLS['complaint'].addPlan,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('保存成功！', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

        },
        complete: function(){

        }
    },this);
}

// $('body').on('click', '.el-select', function () {
//   if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
//     $(this).find('.el-input-icon').toggleClass('is-reverse');
//     $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
//     $(this).siblings('.el-select-dropdown').toggle();
//   } else {
//     $(this).find('.el-input-icon').toggleClass('is-reverse');
//     $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').addClass('is-reverse');
//     $(this).siblings('.el-select-dropdown').toggle();
//   }
//   if (!$(this).hasClass('check_status')) {
//     var scroll = $(document).scrollTop();
//     var width = $(this).width();
//     var offset = $(this).offset();
//     $(this).siblings('.el-select-dropdown').width(width);
//   }

// });

// $('body').on('click', '.el-select-dropdown-item', function (e) {
//     e.stopPropagation();
//     $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
//     $(this).addClass('selected');
//     if ($(this).hasClass('selected')) {
//         var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
//         ele.find('.el-input').val($(this).text());
//         ele.find('.val_id').val($(this).attr('data-id'));
//     }
//     $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

// });


function getFactory() {
    AjaxClient.get({
        url: URLS['complaint'].factory + "?" + _token,
        dataType: 'json',
        success: function (rsp) {
            let list = rsp.results.list;
            var ele = $('.factory_id');
            if (list && list.length) {
                var lis = `<li data-id="" class="el-select-dropdown-item">--请选择--</li>`;
                lis += list.map(item => `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`).join('');
                ele.parent().find('.el-select-dropdown-list').html(lis);
            } else {
                ele.parent().find('.el-select-dropdown-list').html(`<li data-id="" class="el-select-dropdown-item">--请选择--</li>`);
            }
        },
        fail: function (rsp) {
            layer.msg('获取工厂列表失败,请重试', { icon: 2, offset: '250px' });
        }
    }, this);
}

// 多选
function multiSelect() {
    $('#material_number').select2({
        ajax: {
            url: URLS['complaint'].dimMaterial+"?"+_token,
            data: function (params) {
                return {
                    name: params.term
                };
            },
            processResults: function (data) {
                var results = $.map(data.results, function (obj) {
                    obj.text = obj.name;
                    return obj;
                });
                return {
                    results: results
                };
            }
        }
    });

    $('#po_number').select2({
        ajax: {
            url: URLS['complaint'].dimPonumber+"?"+_token,
            data: function (params) {
                return {
                    name: params.term
                };
            },
            processResults: function (data) {
                var results = $.map(data.results, function (obj) {
                    obj.text = obj.name;
                    return obj;
                });
                return {
                    results: results
                };
            }
        }
    });
}
