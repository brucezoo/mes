var ajaxSubmitData = {};

$(function () {
  var id = getQueryString('id');
  AjaxClient.get({
    url: URLS['abnormal'].viewAbnormalReply + '?' + _token + '&id=' + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      createPicDetail(rsp.results[0]);
      // console.log(rsp);
      var replyMsg = rsp.results[0],
        detail = replyMsg.groups,
        questionDescription = replyMsg.question_description,
        tempWay = replyMsg.temp_way,
        cause = replyMsg.cause,
        final_method = replyMsg.final_method,
        result_final_method = replyMsg.result_final_method,
        supplier = replyMsg.supplier;
      //填充明细
      detail.forEach(function (val, i) {
        // console.log(val);
        var replyMsg = `
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
                                <input type="text" class="el-input abnormalApply-input reject_ratio" readonly placeholder="" value="${Number(val.reject_ratio*100).toFixed(2)}%">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">责任单位</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input supplier" id="supplier"  value="${val.supplier==null?'':val.supplier}">
                        </span>
                        <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">供应商名称</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input NAME1" id="supplier"  value="${val.NAME1}">
                        </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input LIFNR" readonly placeholder="" value="${val.LIFNR}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">工序</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input operation_name" id="supplier"  value="${val.operation_name}">
                        </div>
                    </div>
                `;
        $('.userInput').append(replyMsg);
      })
      $('#questionDescription').val(questionDescription);
      $('#tempWay').val(tempWay);
      $('#cause').val(cause);
      $('#finalMethod').val(final_method);
      $('#resultFinalMethod').val(result_final_method);
      $('#supplier').val(supplier);
      var callInput = $('#showImg');
      replyMsg.picture.forEach(function (item) {
        callInput.find('.listBox').append('<li>' +
          '<img  src="/storage/' + item.image_path + '"/>' +
          '</li>');
      })
    },
    fail: function (rsp) {

    }
  }, this);
})

$('body').on('click', '.saveMsg', function () {
  var id = getQueryString('id'),
    cause = $('#cause').val().toString(),
    final_method = $('#finalMethod').val(),
    questionDescription = $('#questionDescription').val(),
    tempWay = $('#tempWay').val(),
    attachments = [],
    supplier = $('#supplier').val(),
    result_final_method = $('#resultFinalMethod').val();
  $('table tr.file-preview-frame').each(function (i, val) {
    console.log(val);
    var fujianobj = {};
    fujianobj.attachment_id = val.getAttribute('attachment_id');
    fujianobj.comment = $(this).find('textarea').val();
    attachments.push(fujianobj)
  })

  if (!questionDescription) {
    LayerConfig('fail', '问题描述必填')
  }
  if (!tempWay) {
    LayerConfig('fail', '临时应急措施必填')
  }
  if (!cause) {
    // layer.msg('根本原因必填!', {icon: 2, offset: '250px', time: 3000});
    LayerConfig('fail', '根本原因必填');
  }

  if (!final_method) {
    LayerConfig('fail', '最终解决办法必填');
  }
  if (!result_final_method) {
    LayerConfig('fail', '改善措施跟踪结果必填');
  }
  if (cause && final_method && result_final_method && questionDescription && tempWay) {
    AjaxClient.post({
      url: URLS['abnormal'].replyUpdate + '?' + _token + '&id=' + id + '&question_description=' + questionDescription + '&temp_way=' + tempWay + '&cause=' + cause + '&final_method=' + final_method + '&result_final_method=' + result_final_method + '&attachments=' + JSON.stringify(attachments)+'&supplier='+supplier,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        console.log(rsp);
        layer.msg("保存成功", { icon: 1, offset: '250px', time: 1500 });
        window.location.href = '/QC/abnormalReply';
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        if (rsp && rsp.message != undefined && rsp.message != null) {
          LayerConfig('fail', rsp.message);
        }
      }
    })
  }

})

// $(function(){
//     function fileinit(ele, preUrls, preOther) {
//         $('#' + ele).fileinput({
//             'theme': 'explorer-fa',
//             language: 'zh',
//             uploadAsync: true,
//             'uploadUrl': URLS['abnormal'].uploadAttachment,
//             uploadExtraData: function (previewId, index) {
//                 var obj = {};
//                 obj.flag = 'material';
//                 obj._token = TOKEN;
//                 obj.creator_token = ajaxSubmitData.creator_token;
//                 return obj;
//             },
//             initialPreview: preUrls,
//             initialPreviewConfig: preOther,
//             dropZoneEnabled: false,
//             showCaption: false,
//             showClose: false,
//             showUpload: false,
//             showRemove: false,
//             maxFileSize: 500 * 1024,
//             maxFileCount: 1,
//             overwriteInitial: false,
//             showCancel: false
//         }).on('fileselect', function (event, numFiles, label) {
//             $(this).fileinput("upload");
//         }).on('fileloaded', function (event, file, previewId, index, reader) {
//
//         }).on('filepreupload', function (event, data, previewId, index) {
//
//             $('#' + previewId).attr('data-preview', 'preview-' + data.files[0].lastModified);
//         }).on('fileuploaded', function (event, data, previewId, index) {
//             var result = data.response,
//                 file = data.files[0];
//             // console.log(result);
//             if (result.code == '200') {
//                 $('.file-preview-frame[data-preview=preview-' + file.lastModified + ']').addClass('uploaded').attr({
//                     'data-url': result.results.path,
//                     'attachment_id': result.results.attachment_id
//                 }).find('td.creator').html(`<p class="creator_name">${result.results.creator}</p>
//             <p class="creator_time">${result.results.time}</p>`).removeAttr('data-preview');
//             } else {
//                 var ele = $('.file-preview-frame[data-preview=' + previewId + ']');
//                 ele.remove();
//                 var errorHtml = `<button type="button" class="close kv-error-close" aria-label="Close">
//                            <span aria-hidden="true">×</span>
//                         </button>
//                         <ul>
//                             <li>${result.message}</li>
//                         </ul>`;
//                 $('.kv-fileinput-error.file-error-message').html(errorHtml).show();
//                 console.log('文件上传失败' + previewId);
//             }
//         }).on('filebeforedelete', function (event, key, data) {
//             console.log('初始化附件删除');
//         });
//     }
//     fileinit('attachment',[],[]);
// })

//生成附件
function createPicDetail(data) {
  var attachments = data.attachments;
  console.log(attachments);
  var preurls = [], predata = [];
  if (data.attachments && data.attachments.length) {
    data.attachments.forEach(function (item) {
      var url = '/storage/' + item.path, preview = '';
      var path = item.path.split('/');
      var name = item.filename;
      if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
        preview = `<img width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
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
      'uploadUrl': URLS['abnormal'].uploadAttachment,
      uploadExtraData: function (previewId, index) {
        var obj = {};
        obj.flag = 'material';
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

    }).on('filepreupload', function (event, data, previewId, index) {

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
$('body').on('click', '.kv-file-remove.btn.btn-kv.btn-default.btn-outline-secondary', function (e) {
  e.stopPropagation();
  e.preventDefault();
  console.log(12112);
  $(this).parents('tr').remove();
})