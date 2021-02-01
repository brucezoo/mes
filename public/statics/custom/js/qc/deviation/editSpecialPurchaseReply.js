var ajaxSubmitData = {};

$(function () {
  var id = getQueryString('id');
  AjaxClient.get({
    url: URLS['deviationReply'].show + '?' + _token + '&id=' + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var replyMsg = rsp.results[0],
        detail = replyMsg.itemres,
        questionDescription = replyMsg.question_description;
      var cause = replyMsg.cause;
      var groups = replyMsg.groups;
      var names_str = replyMsg.persons_arr;
      //填充明细
      detail.forEach(function (val, i) {
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
                                <input type="text" class="el-input abnormalApply-input reject_ratio" readonly placeholder="" value="${val.reject_ratio}">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">责任单位</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input supplier" id="supplier"  value="${val.supplier==null?'':val.supplier}" readonly="readonly">
                        </span>
                        <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">供应商名称</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input NAME1" id="supplier"  value="${val.NAME1}" readonly="readonly">
                        </span>
                        </div>
                        <div class="el-form-item">
                            <span class="el-form-item-div abnormal-item">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">编号</span>
                                </label>
                                <input type="text" class="el-input abnormalApply-input LIFNR" readonly placeholder="" value="${val.LIFNR}" readonly="readonly">
                            </span>
                            <span class="el-form-item-div abnormal-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">工序</span>
                            </label>
                            <input type="text" class="el-input abnormalApply-input operation_name" id="supplier"  value="${val.operation_name}" readonly="readonly">
                        </div>
                    </div>
                `;
        $('.userInput').append(replyMsg);
      })
      $('#questionDescription').val(questionDescription);
      $('#cause').val(cause);
      $('#choose_admin').val(names_str);
      var callInput = $('#showImg');
      replyMsg.picture.forEach(function (item) {
        callInput.find('.listBox').append('<li>' +
          '<img  src="/storage/' + item.image_path + '"/>' +
          '</li>');
      })
      for (var j = 0; j < groups.length; j++) {
        $('#groups').append($('<p></p>').html('审核人：' + groups[j].cn_name + ' &nbsp;&nbsp;审核意见:&nbsp;' + groups[j].status_arr + '&nbsp;&nbsp;回复内容:' + groups[j].contentofreply));
      }
    },
    fail: function (rsp) {

    }
  }, this);
})

$('body').on('click', '.saveMsg', function () {
  var id = getQueryString('id'),
    contentofreply = $('#contentofreply').val();
  var status = $('input[name="antzone"]:checked').val();

  AjaxClient.get({
    url: URLS['deviationReply'].reply + '?' + _token + '&id=' + id + '&contentofreply=' + contentofreply + '&status=' + status,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.msg("保存成功", {
        icon: 1,
        offset: '250px',
        time: 1500
      });
      // window.location.href = '/QC/acceptOnDeviationAudit';
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  })

})