var complaint_id;
$(function(){
    complaint_id=getQueryString('id');
    bindEvent();
    showAllComplaint(complaint_id);
});
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

function showAllComplaint(id) {
    AjaxClient.get({
        url: URLS['complaint'].viewAllComplaint+"?"+_token+"&id="+complaint_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#customer_name').val(rsp.results.base[0].customer_name);
            $('#complaint_code').val(rsp.results.base[0].complaint_code);
            if(rsp.results.base[0].type==1){
                $('#number_type').attr("checked",'true');
                $('#material_toggle').toggle();
            }
            $('#received_date').val(rsp.results.base[0].received_date);
            $('#samples_received_date').val(rsp.results.base[0].samples_received_date);
            $('#defect_description').val(rsp.results.base[0].defect_description);
            $('#defect_material_batch').val(rsp.results.base[0].defect_material_batch);
            $('#defect_material_rejection_num').val(rsp.results.base[0].defect_material_rejection_num);
            $('#defect_rate').val(rsp.results.base[0].defect_rate);

            // 显示生产单号、物料名称多选数据
            multiSelect(rsp.results.base[0].material, rsp.results.base[0].production);

            // 获取工厂
            $('#factory_id').val(rsp.results.base[0].factory_id);
            getFactory(rsp.results.base[0].factory_id);

            $('#customer_type').val(rsp.results.base[0].customer_type);
            $('.customer_type').find('.el-select-dropdown-item[data-id="'+rsp.results.base[0].customer_type+'"]').click();

            if(rsp.results.D2.length){
                $('#table_attrmaterial_select_table .table_tbody').html('');
                var _html = '';
                rsp.results.D2.forEach(function (item) {
                    _html+=`<tr data-id="${item.material_id}">
                                <td>${tansferNull(item.material_code)}</td>
                                <td>${tansferNull(item.material_name)}</td>
                            </tr>`;
                });
                $('#table_attr_table .table_tbody').html(_html);
            }
            if(rsp.results.D3.length){
                $('#customer_stock_num').val(rsp.results.D3[0].customer_stock_num);
                $('#customer_stock_quality').val(rsp.results.D3[0].customer_stock_quality);
                $('#customer_stock_time').val(rsp.results.D3[0].customer_stock_time);
                $('#next_shipment_schedule_num').val(rsp.results.D3[0].next_shipment_schedule_num);
                $('#next_shipment_schedule_time').val(rsp.results.D3[0].next_shipment_schedule_time);
                $('#pay_for_other').val(rsp.results.D3[0].pay_for_other);
                $('#pay_for_rejected').val(rsp.results.D3[0].pay_for_rejected);
                $('#pay_for_travel').val(rsp.results.D3[0].pay_for_travel);
                $('#stock_num').val(rsp.results.D3[0].stock_num);
                $('#stock_quality').val(rsp.results.D3[0].stock_quality);
                $('#wip_num').val(rsp.results.D3[0].wip_num);
                $('#wip_quality').val(rsp.results.D3[0].wip_quality);
                if(rsp.results.D3[0].customer_stock==1){
                    $('#customer_stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].next_shipment_schedule_flag==1){
                    $('#next_shipment_schedule_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock==1){
                    $('#stock').attr("checked",'true');
                }
                if(rsp.results.D3[0].stock_flag==1){
                    $('#stock_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip==1){
                    $('#wip').attr("checked",'true');
                }
                if(rsp.results.D3[0].wip_flag==1){
                    $('#wip_flag').attr("checked",'true');
                }
                if(rsp.results.D3[0].rejected_handle==1){
                    $('#rejected_handle').parent().find('.el-input').val('退回公司返工');
                }
                if(rsp.results.D3[0].rejected_handle==2){
                    $('#rejected_handle').parent().find('.el-input').val('客户本地报废');
                }
                if(rsp.results.D3[0].rejected_handle==3){
                    $('#rejected_handle').parent().find('.el-input').val('委托客户处理');
                }
                if(rsp.results.D3[0].rejected_handle==4){
                    $('#rejected_handle').parent().find('.el-input').val('由公司报废');
                }
                if(rsp.results.D3[0].rejected_handle==5){
                    $('#rejected_handle').parent().find('.el-input').val('少件，给客户补发产品');
                }
                if(rsp.results.D3[0].rejected_effect==1){
                    $('#rejected_effect').parent().find('.el-input').val('客户丢失');
                }
                if(rsp.results.D3[0].rejected_effect==2){
                    $('#rejected_effect').parent().find('.el-input').val('客户订单比例转移');
                }
                if(rsp.results.D3[0].rejected_effect==3){
                    $('#rejected_effect').parent().find('.el-input').val('客户抱怨');
                }
                if(rsp.results.D3[0].rejected_effect==4){
                    $('#rejected_effect').parent().find('.el-input').val('客户满意度下降');
                }
            }
            var preurls = [], predata = [];
            if (rsp.results.attachments && rsp.results.attachments.length) {
                rsp.results.attachments.forEach(function (item) {
                    var url = '/storage/' + item.path, preview = '';
                    var path = item.path.split('/');
                    var name = item.filename;
                    if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
                        preview = `<img width="60" height="60" src="${url}" data-id="${item.attachment_id}" data-src="${window.storage}${item.path}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch pic-img'>`;
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
            fileinit('attachment', preurls, predata);
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
                    if (rsp.results.attachments && rsp.results.attachments.length) {
                        rsp.results.attachments.forEach(function (item) {
                            var attachment_dowload = $('#addFujian_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                            var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                            if (!attachment_dowload.find('.attch-download').length) {
                                attachment_dowload.find('.file-footer-buttons').append(a);
                            }
                        });
                    }
                }
                $(".btn.btn-primary.btn-file").hide();

            }, 1000);



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

function bindEvent() {
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
}

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

function getFactory(id) {
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

                // 编辑时自动选择
                ele.find('.el-select-dropdown-item[data-id="'+id+'"]').click();
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
function multiSelect(materialSelected, poSelected) {
    var $materialNumber = $('#material_number');
    var $poNumber = $('#po_number');

    $materialNumber.select2();
    $poNumber.select2();

    // 设置默认
    if (Array.isArray(materialSelected)) {
        materialSelected.forEach(item => {
            $materialNumber.append(new Option(item.material_name, item.material_id, true, true));
        });

        $materialNumber.trigger({
            type: 'select2:select'
        });
    }

    if (Array.isArray(poSelected)) {
        poSelected.forEach(item => {
            $poNumber.append(new Option(item.production_number, item.po_id, true, true));
        });
        $poNumber.trigger({
            type: 'select2:select'
        });
    }
}
