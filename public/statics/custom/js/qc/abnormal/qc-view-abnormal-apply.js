$(function(){
    var id = getQueryString('id');
    AjaxClient.get({
        url: URLS['abnormal'].show+'?'+_token+'&id='+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            createPicDetail(rsp.results[0]);
            console.log(rsp);
            var applyMsg = rsp.results[0],
                detail = applyMsg.groups,
                names_str = applyMsg.names_str,
                question_description = applyMsg.question_description,
                temp_way = applyMsg.temp_way,
                cause = applyMsg.cause,
                final_method = applyMsg.final_method,
                result_final_method = applyMsg.result_final_method,
                end_remark = applyMsg.end_remark;
            //填充明细
            detail.forEach(function(val,i){
                var applyMsg = `
                    <div class="apply">
                        <div class="el-form-item" style="margin-top:18px;">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">检验单号</span>
                                </label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" class="el-input abnormalApply-input check-id" autocomplete="off" readonly placeholder="" value="${val.check_code}">
                                </div>
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">生产单号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input po_number" readonly placeholder="" value="${val.po_number}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">工单号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input wo_number" readonly placeholder="" value="${val.wo_number}">
                            </span>       
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">采购凭证项目编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input EBELP" readonly placeholder="" value="${val.EBELP}">
                            </span>             
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">采购凭证编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input EBELN" readonly placeholder="" value="${val.EBELN}">
                            </span>                            
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">销售凭证项目</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input VBELP" readonly placeholder="" value="${val.VBELP}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">物料</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input material_name" readonly placeholder="" value="${val.name}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">物料编码</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input item_no" readonly placeholder="" value="${val.item_no}">
                            </span>
                            
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">销售和分销凭证号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input VBELN" readonly placeholder="" value="${val.VBELN}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">数量</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input order_number" readonly placeholder="" value="${val.order_number}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">抽检数</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input amount_of_inspection" readonly placeholder="" value="${val.inspection_qty}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">不合格数</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input inferior_qty" readonly placeholder="" value="${val.inferior_qty}">
                            </span>
                            
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">不合格率</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input reject_ratio" readonly placeholder="" value="${Number(val.reject_ratio).toFixed(2)}%">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">供应商名称</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input NAME1" readonly placeholder="" value="${val.NAME1}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input LIFNR" readonly placeholder="" value="${val.LIFNR}">
                            </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">工序</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input operation_name" readonly placeholder="" value="${val.operation_name}">
                            </span>
                        </div>
                    </div>
                `;
                $('.userInput').append(applyMsg);
            })

            $('#choose_admin').val(names_str);
            $('#questionDescription').val(question_description);
            $('#tempWay').val(temp_way);
            $('#cause').val(cause);
            $('#finalMethod').val(final_method);
            $('#resultFinalMethod').val(result_final_method);
            $('#endRemark').val(end_remark);
            var callInput = $('#showImg');
            applyMsg.picture.forEach(function (item) {
                callInput.find('.listBox').append('<li>' +
                    `<img class="pic-img" data-src="/storage/${item.image_path}" onerror="this.onerror=null;this.src=\'/statics/custom/img/logo_default.png\'" src="/storage/${item.image_path}"/>` +
                    '</li>');
            })

        },
        fail: function(rsp){

        }
    },this);
})

//返回异常单列表页面
$('body').on('click','.back',function(){
    window.location.href = '/QC/abnormalApply';
});

$('body').on('click','.print',function (e) {
    e.stopPropagation();
    $('.back').hide();
    $("#distribute").print();
    $('.back').show();
})

//图片放大
$('body').on('click', '.pic-img', function () {
    var imgList, current;
    if ($(this).hasClass('pic-list-img')) {
        imgList = $(this).parents('ul').find('.pic-li');
        current = $(this).parents('.pic-li').attr('data-id');
    } else {
        imgList = $(this);
        current = $(this).attr('data-id');
    }
    showBigImg(imgList, current);
});

function createPicDetail(data){
    var attachments=data.attachments;
    console.log(attachments);
    var preurls = [], predata = [];
    if (data.attachments && data.attachments.length) {
        data.attachments.forEach(function (item) {
            var url = '/storage/' + item.path, preview = '';
            var path = item.path.split('/');
            var name = item.filename;
            var subfix = item.filename.split('.').pop().toLowerCase();

            if (['jpg', 'png', 'jpeg'].includes(subfix)) {
                preview = `<img data-src="${url}" onerror="this.onerror=null;this.src=\'/statics/custom/img/logo_default.png\'" width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch pic-img'>`;
            } else {
                preview = `<div class='file-preview-text existAttch' data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                        <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                        </div>`;
            }
            var pitem = {
                caption: name,
                size: item.size,
            };
            preurls.push(preview);
            predata.push(pitem);
        });
    }
    function fileinit(ele, preUrls, preOther) {
        $('#' + ele).fileinput({
            'theme': 'explorer-fa',
            language: 'zh',
            uploadAsync: true,
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
        })
        $('.btn.btn-primary.btn-file').hide();
        $('table.table.table-bordered.table-hover thead tr th:last').remove();
        $('table.table.table-bordered.table-hover tbody tr').each(function(i,item){
            // console.log(item);
            item.lastChild.remove();
        })
        $('table.table.table-bordered.table-hover').css('width','91%');
        $('table.table.table-bordered.table-hover textarea').attr('placeholder','').attr('disabled',true);
    }
    setTimeout(function () {
        if ($('.existAttch').length) {
            $('.existAttch').each(function () {
                var pele = $(this).parents('.file-preview-frame');
                pele.attr({
                    'data-url': $(this).attr('data-url'),
                    'attachment_id': $(this).attr('attachment_id')
                });
                var cname = $(this).attr('data-creator'),
                    ctime = $(this).attr('data-ctime');
                pele.find('.fujiantext').text($(this).attr('comment'));
                pele.find('.creator').html(`<p>${cname}</p><p>${ctime}</p>`);
                pele.addClass('init-success-file');
            });
            //下载
            if (data.attachments && data.attachments.length) {
                data.attachments.forEach(function (item) {
                    var attachment_dowload = $('#addMFujian_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                    // console.log(item.is_from_erp);
                    if (item.is_from_erp == 1) {
                        var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    } else if (item.is_from_erp == 0) {
                        var a = `<a href="${item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    }


                });
            }


        }

    }, 1000);
    fileinit('attachment', preurls, predata);


}
