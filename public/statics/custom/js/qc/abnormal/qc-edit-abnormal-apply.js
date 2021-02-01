var layerModal,
    layerLoading,
    ajaxData={},
    pageAdminNo=1,
    adminData=[],
    pageSize=20,
    adminIds = [],
    adminNames = [],
    ajaxAdminData={
        order: 'desc',
        sort: 'id'
    };

$(function(){
    $("#zwb_upload").bindUpload({
        url:"/Image/uploadPicture",
        callbackPath:"#showImg",
        num:10,
        type:"jpg|png|gif|svg",
        size:3,
    });
    var id = getQueryString('id');

    AjaxClient.get({
        url: URLS['abnormal'].show+'?'+_token+'&id='+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // console.log(rsp);
            var applyMsg = rsp.results[0],
                detail = applyMsg.groups,
                names_str = applyMsg.names_str,
                question_description = applyMsg.question_description,
                temp_way = applyMsg.temp_way,
                cause = applyMsg.cause,
                key_persons = applyMsg.key_persons,
                final_method = applyMsg.final_method,
                result_final_method = applyMsg.result_final_method,
                abnormalId = applyMsg.id,
                end_remark = applyMsg.end_remark;
            // console.log(key_persons);
            // console.log(names_str);
            //填充明细
            detail.forEach(function(val,i){
                // console.log(val);
                var applyMsg = `
                    <div class="apply">
                        <div style="text-align: right;position: relative;top: 10px;right: 2%;">
                            <button type="button" class="deleteApply" style="color: #fff;background-color: #FF5722;border-color: #FF5722;">删除</button>
                        </div>
                        <div class="el-form-item" style="margin-top:18px;">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">检验单号</span>
                                </label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" class="el-input abnormalApply-input check-id" autocomplete="off" placeholder="请输入检验单号" value="${val.check_code}">
                                    <input type="hidden" class="el-input checkId" value="${val.check_id}">
                                    <input type="hidden" class="el-input itemId" value="${val.id}">
                                    <input type="hidden" class="el-input unitId" value="${val.unit_id}">
                                    <input type="hidden" class="el-input production_order_id" value="${val.production_order_id}">
                                    <input type="hidden" class="el-input sub_number" value="${val.sub_number}">
                                    <input type="hidden" class="el-input sub_order_id" value="${val.sub_order_id}">
                                    <input type="hidden" class="el-input check_resource" value="${val.check_resource}">
                                    <input type="hidden" class="el-input work_order_id" value="${val.work_order_id}">
                                </div>
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">生产单号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input po_number" placeholder="请输入生产单号" value="${val.po_number}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">工单号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input wo_number" placeholder="请输入工单号" value="${val.wo_number}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">采购凭证项目编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input EBELP" placeholder="请输入采购凭证项目编号" value="${val.EBELP}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">采购凭证编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input EBELN" placeholder="请输入采购凭证编号" value="${val.EBELN}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">销售凭证项目</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input VBELP" placeholder="请输入销售凭证项目" value="${val.VBELP}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">物料</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input material_name" placeholder="请输入物料" value="${val.name}">
                                <input type="hidden" class="el-input material_id" value='${val.material_id}' ></input>
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">物料编码</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input item_no" placeholder="请输入物料" value="${val.item_no}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">销售和分销凭证号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input VBELN" placeholder="请输入销售和分销凭证号" value="${val.VBELN}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">数量</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input order_number" placeholder="请输入数量" value="${val.order_number}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">抽检数</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input amount_of_inspection" placeholder="请输入抽检数" value="${val.inspection_qty}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">不合格数</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input inferior_qty" placeholder="请输入不合格数" value="${val.inferior_qty}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">不合格率</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input reject_ratio" placeholder="请输入不合格率" value="${Number(val.reject_ratio*100).toFixed(2)}%">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">供应商名称</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input NAME1" placeholder="请输入供应商名称" value="${val.NAME1}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input LIFNR" placeholder="请输入编号" value="${val.LIFNR}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">工序</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input operation_name" placeholder="请输入工序" value="${val.operation_name}">
                            </span>
                        </div>
                    </div>
                `;
                $('.userInput').append(applyMsg);
                $('.check-id').autocomplete({
                    url: URLS['check'].selectDim+"?"+_token,
                    param:'check_code',
                    showCode:'check_code'
                });
            })

            $('#choose_admin').val(names_str);
            $('#questionDescription').val(question_description);
            $('#tempWay').val(temp_way);
            $('#cause').val(cause);
            $('#choose_admin_id').val(key_persons);
            $('#abnormal_id').val(abnormalId);
            $('#finalMethod').val(final_method);
            $('#resultFinalMethod').val(result_final_method);
            $('#endRemark').val(end_remark);
            adminIds=key_persons.split(',');
            adminNames=names_str.split(' ');
            // console.log(adminIds,adminNames);
            var callInput = $('#showImg');
            applyMsg.picture.forEach(function (item) {
                callInput.find('.listBox').append('<li>' +
                    '<img data-id="'+item.picture_id+'" data-image_id="'+item.id+'"  src="/storage/' + item.image_path + '"/>' +
                    '<span data-id="'+item.picture_id+'" data-path="'+item.image_path+'" class="delete"></span>' +
                    '</li>');
            })
            callInput.find(".delete").bind("click", function () {
                var id = $(this).attr('data-id');
                var path = $(this).attr('data-path');
                var that = this
                AjaxClient.get({
                    url: URLS['check'].destroyPicture+"?"+_token+"&id="+id+"&image_path="+path,
                    dataType: 'json',
                    beforeSend: function(){
                        layerLoading = LayerConfig('load');
                    },
                    success: function(rsp){
                        layer.close(layerLoading);
                        $(that).parent().hide(100);
                    },
                    fail: function(rsp){
                        layer.close(layerLoading);
                    }
                },this);
            });

        },
        fail: function(rsp){
            layer.close(layerLoading);
        }
    },this);
})



//分页事件
function bindPagenationClick(totalData,pageSize,pageno,flag){
    $('#pagenation.'+flag).show();
    $('#pagenation.'+flag).pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageno,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageno=api.getCurrent();
            if(flag=='admin'){//责任单位弹框
                pageAdminNo=pageno;
                getAdminList();
            }
        }
    });
}

//生成责任单位弹框界面
function chooseAdminModal() {
    var tableHeight=$(window).height()-280;
    layerModal = layer.open({
        type: 1,
        title: '选择责任人',
        offset: '100px',
        area: '650px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="chooseAdmin formModal chooseModal" id="chooseAdmin">
           <ul class="query-item">
                <li style="margin-bottom: 10px;">
                    <div class="el-form-item" style="width: 400px;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="font-size: 14px;margin-bottom: 0px;text-align: left;width:150px;">责任单位</label>
                            <input type="text" id="name" class="el-input" placeholder="请输入责任单位名称" value="">
                            <button style="margin-left:50px;" type="button" class="el-button choose-search choose-admin">搜索</button>
                        </div>
                    </div>
                </li>
            </ul>
           <div class="table_page">
                <div id="pagenation" class="pagenation admin"></div>
                <div class="table-wrap" style="max-height: ${tableHeight}px;overflow-y: auto;">
                    <table class="sticky uniquetable commontable">
                      <thead>
                        <tr>
                          <th>责任人</th>
                          <th>卡号</th>
                          <th class="right">选择</th>
                        </tr>
                      </thead>
                      <tbody class="table_tbody">
                      </tbody>
                    </table>
                </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
            </div>
          </div>       
    </form>`,
        success: function(layero, index){
            //获取选中的责任单位
            getAdminList();
        },
        cancel: function(layero, index){//右上角关闭按钮
        },
        end: function(){
            pageAdminNo=1;
            ajaxAdminData={
                sort: 'id',
                order: 'desc'
            };
            adminData=[];
        }
    })
}

//选择责任单位触发弹框事件
$('body').on('click','.pop-button.choose-admin',function(){
    chooseAdminModal();
});

//获取责任单位列表
function getAdminList(){
    var urlLeft='';
    for(var param in ajaxAdminData){
        urlLeft+=`&${param}=${ajaxAdminData[param]}`;
    }
    urlLeft+="&page_no="+pageAdminNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['check'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createAdminHtml(rsp);
            }else{
                noData('暂无数据',3);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pageAdminNo,'admin');
            }else{
                $('#pagenation.admin').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取责任单位列表失败，请刷新重试',3);
        }
    },this);
}

//表格无数据展示
function noData(val,num){
    var noDataTr= `
            <tr>
                <td class="nowrap" colspan="${num}" style="text-align: center;">${val}</td>
            </tr>
        `;
    $('.table_tbody').html(noDataTr);
}

//生成责任单位列表
function createAdminHtml(rsp){
    var ele=$('#chooseAdmin .table_tbody');
    ele.html('');
    // console.log(rsp);
    if(rsp&&rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
            var admin_id = item.admin_id,adminExist = false;
            // console.log(adminIds);
            adminIds.forEach(function(val,i){
                if(val == admin_id){
                    // console.log(admin_id);
                    adminExist = true;
                }
            })
            var checkbox=`<span class="el-checkbox_input ${adminExist?'is-checked':''}" data-name="${item.cn_name}" data-id="${item.admin_id}">
                        <span class="el-checkbox-outset"></span>
                    </span>`;
            var tr=`
                <tr class="tritem" data-id="${item.admin_id}">
                    <td>${item.cn_name}</td>
                    <td>${item.card_id}</td>
                    <td class="right">${checkbox}</td>
                </tr>
            `;
            ele.append(tr);
            ele.find('tr:last-child').data("adminData",item);
        });
    }else{
        var tr=`<tr><td colspan="2" style="text-align: center;">暂无数据</td></tr>`;
        ele.append(tr);
    }
}

// checkbox 点击
$('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
    var admin_name = $(this).attr('data-name'),
        admin_id = $(this).attr('data-id');
    $(this).toggleClass('is-checked');
    if($(this).hasClass('is-checked')){
        adminNames.push(admin_name);
        adminIds.push(admin_id);
    }else{
        var index = adminNames.indexOf(admin_name);
        if(index > -1){
            adminNames.splice(index,1);
        }
        var idIndex = adminIds.indexOf(admin_id);
        if(idIndex > -1){
            adminIds.splice(idIndex,1);
        }
    }
});

//搜索责任单位
$('body').on('click','#chooseAdmin .choose-admin',function () {
    if(!$(this).hasClass('is-disabled')){
        var ele=$('#chooseAdmin');
        ajaxAdminData.cn_name=ele.find('#name').val().trim();
        pageAdminNo=1;
        getAdminList();
    }
});

//责任单位确定按钮
$('body').on('click','#chooseAdmin .submit',function(){
    layer.close(layerModal);
    $('#choose_admin').val(adminNames.join(','));
    $('#choose_admin_id').val(adminIds.join(','));
})

//添加申请单
$('body').on('click','.addApply',function(){
    var applyMsg = `
        <div class="apply">
            <div style="text-align: right;position: relative;top: 10px;right: 2%;">
                <button type="button" class="deleteApply" style="color: #fff;background-color: #FF5722;border-color: #FF5722;">删除</button>
            </div>
            <div class="el-form-item" style="margin-top:18px;">
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">检验单号</span>
                    </label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" class="el-input abnormalApply-input check-id" autocomplete="off" placeholder="请输入检验单号" value="">
                        <input type="hidden" class="el-input checkId" value="">
                        <input type="hidden" class="el-input itemId" value="">
                        <input type="hidden" class="el-input unitId" value="">
                        <input type="hidden" class="el-input production_order_id" value="">
                        <input type="hidden" class="el-input sub_number" value="">
                        <input type="hidden" class="el-input sub_order_id" value="">
                        <input type="hidden" class="el-input check_resource" value="">
                        <input type="hidden" class="el-input work_order_id" value="">
                    </div>
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">生产单号</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input po_number" placeholder="请输入生产单号" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">工单号</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input wo_number" placeholder="请输入工单号" value="">
                    <input type="hidden" class="el-input" value="">
                </span>       
            </div>
            <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">采购凭证项目编号</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input EBELP" placeholder="请输入采购凭证项目编号" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">采购凭证编号</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input EBELN" placeholder="请输入采购凭证编号" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">销售凭证项目</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input VBELP" placeholder="请输入销售凭证项目" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
            </div>
            <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">物料</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input material_name" placeholder="请输入物料" value="">
                    <input type="hidden" class="el-input material_id" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">物料编码</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input item_no" placeholder="请输入物料编码" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">销售和分销凭证号</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input VBELN" placeholder="请输入销售和分销凭证号" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
            </div>
            <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">数量</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input order_number" placeholder="请输入数量" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">抽检数</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input amount_of_inspection" placeholder="请输入抽检数" value="">
                    <input type="hidden" class="el-input" value="">
                </span>

                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">不合格数</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input inferior_qty" placeholder="请输入不合格数" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
            </div>
            <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">不合格率</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input reject_ratio" placeholder="请输入不合格率" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
            </div>
        </div>
    `;
    $('.userInput').append(applyMsg);
    $('.check-id').autocomplete({
        url: URLS['check'].selectDim+"?"+_token,
        param:'check_code',
        showCode:'check_code'
    });
})

//删除一个申请单
$('body').on('click','.deleteApply',function () {
    $(this).parents('.apply').remove();
});

//检验单号模糊查询事件
$(function(){
    $('.check-id').autocomplete({
        url: URLS['check'].selectDim+"?"+_token,
        param:'check_code',
        showCode:'check_code'
    })
})


//根据检验单号填充信息
$('body').on('click','.userInput .el-select-dropdown-list .el-auto',function(){
    var check_no = $(this).html();
    // console.log(check_no);
    var itemMsg = {};
    AjaxClient.get({
        url: URLS['check'].selectDim+'?'+_token+'&check_code='+check_no,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // console.log(rsp);
            rsp.results.forEach(function(val,i){
                if(val.check_code == check_no){
                    itemMsg = val;
                }
            })
            // console.log(itemMsg);
            // console.log(itemMsg.check_id);
            var inferior_qty = Number(itemMsg.deadly)+Number(itemMsg.seriousness)+Number(itemMsg.slight);
            var amount_of_inspection = Number(itemMsg.amount_of_inspection);
            if(itemMsg.amount_of_inspection == 0){
                reject_ratio = 0;
            }else{
                var reject_ratio = inferior_qty/amount_of_inspection;
            }
            // console.log(inferior_qty,Number(itemMsg.amount_of_inspection),reject_ratio);
            var user_input = $(this).parents('.apply');
            // console.log(user_input);
            user_input.find('.VBELP').val(itemMsg.VBELP);
            user_input.find('.itemId').val('');
            user_input.find('.checkId').val(itemMsg.id);
            user_input.find('.unitId').val(itemMsg.unit_id);
            user_input.find('.production_order_id').val(itemMsg.production_order_id);
            user_input.find('.sub_number').val(itemMsg.sub_number);
            user_input.find('.sub_order_id').val(itemMsg.sub_order_id);
            user_input.find('.check_resource').val(itemMsg.check_resource);
            user_input.find('.work_order_id').val(itemMsg.work_order_id);
            user_input.find('.EBELN').val(itemMsg.EBELN);
            user_input.find('.EBELP').val(itemMsg.EBELP);
            user_input.find('.po_number').val(itemMsg.po_number);
            user_input.find('.wo_number').val(itemMsg.wo_number);
            user_input.find('.material_id').val(itemMsg.material_id);
            user_input.find('.material_name').val(itemMsg.materialName);
            user_input.find('.item_no').val(itemMsg.item_no);
            user_input.find('.order_number').val(itemMsg.order_number);
            user_input.find('.VBELN').val(itemMsg.VBELN);
            user_input.find('.amount_of_inspection').val(itemMsg.amount_of_inspection);
            user_input.find('.inferior_qty').val(inferior_qty);
            user_input.find('.reject_ratio').val(reject_ratio);
        },
        fail: function(rsp){

        }
    },this);
})

//保存申请信息
$('body').on('click','.saveMsg',function(){
    var abnormalApplyMsg = [];
    $('.apply').each(function(i,val){
        var applyMsg = {};
        // console.log(val);
        applyMsg.check_id = $(val).find('.checkId').val();
        applyMsg.material_id = $(val).find('.material_id').val();
        // console.log(applyMsg.material_id);
        applyMsg.id = $(val).find('.itemId').val();
        applyMsg.VBELN = $(val).find('.VBELN').val();
        applyMsg.VBELP = $(val).find('.VBELP').val();
        applyMsg.EBELP = $(val).find('.EBELP').val();
        applyMsg.EBELN = $(val).find('.EBELN').val();
        applyMsg.work_order_id = $(val).find('.work_order_id').val();
        applyMsg.wo_number = $(val).find('.wo_number').val();
        applyMsg.po_number = $(val).find('.po_number').val();
        applyMsg.reject_ratio = $(val).find('.reject_ratio').val();
        applyMsg.unit_id = $(val).find('.unitId').val();
        applyMsg.inferior_qty = $(val).find('.inferior_qty').val();
        applyMsg.inspection_qty = $(val).find('.amount_of_inspection').val();
        applyMsg.order_number = $(val).find('.order_number').val();
        applyMsg.production_order_id = $(val).find('.production_order_id').val();
        applyMsg.sub_number = $(val).find('.sub_number').val();
        applyMsg.sub_order_id = $(val).find('.sub_order_id').val();
        applyMsg.check_resource = $(val).find('.check_resource').val();
        abnormalApplyMsg.push(applyMsg);

    })
    var drawings = []
    if($('#showImg .listBox li').length>0){
        $('#showImg .listBox li').each(function () {
            drawings.push({
                drawing_id:$(this).find('img').attr('data-id')?$(this).find('img').attr('data-id'):'',
                picture_id:$(this).find('img').attr('data-image_id')?$(this).find('img').attr('data-image_id'):''
            })
        })
    }
    // console.log(abnormalApplyMsg);
    var items = JSON.stringify(abnormalApplyMsg),
        key_persons = $('#choose_admin_id').val(),
        question_description = $('#questionDescription').val().trim(),
        temp_way = $('#tempWay').val().trim(),
        cause = $('#cause').val().trim(),
        result_final_method = $('#resultFinalMethod').val().trim(),
        final_method = $('#finalMethod').val().trim(),
        id = $('#abnormal_id').val(),
        end_remark = $('#endRemark').val().trim();
    // console.log(JSON.stringify(abnormalApplyMsg));

    if(abnormalApplyMsg.length == 0){
        LayerConfig('fail','至少要有一条检验单');
    }else{
        AjaxClient.post({
            url: URLS['abnormal'].update+'?'+_token+'&key_persons='+key_persons+'&question_description='+question_description+
            '&temp_way='+temp_way+'&cause='+cause+'&final_method='+final_method+'&result_final_method='+result_final_method+'&end_remark='+end_remark+'&items='+items+'&id='+id+'&drawings='+JSON.stringify(drawings),
            dataType: 'json',
            beforeSend: function(){
                layerLoading = LayerConfig('load');
            },
            success: function(rsp){
                layer.close(layerLoading);
                // console.log(rsp);
                layer.msg("编辑成功", {icon: 1,offset: '250px',time: 1500});
                window.location.href='/QC/abnormalApply';
            },
            fail: function(rsp){
                layer.close(layerLoading);
                if (rsp && rsp.message != undefined && rsp.message != null){
                    LayerConfig('fail', rsp.message);
                }
            }
        },this);
    }

})