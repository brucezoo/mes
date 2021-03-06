$(function(){
  var id = getQueryString('id');
  AjaxClient.get({
      url: URLS['deviation'].show+'?'+_token+'&id='+id,
      dataType: 'json',
      beforeSend: function(){
          layerLoading = LayerConfig('load');
      },
      success: function(rsp){
          layer.close(layerLoading);
          console.log(rsp);
          var applyMsg = rsp.results[0],
              detail = applyMsg.itemres,
              names_str = applyMsg.persons_arr,
              question_description = applyMsg.question_description,
              cause = applyMsg.cause,
              groups = applyMsg.groups;
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
                              <input type="text" class="el-input abnormalApply-input reject_ratio" readonly placeholder="" value="${val.reject_ratio}%">
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
          $('#cause').val(cause);
          for (var j=0; j<groups.length;j++){
              $('#groups').append($('<p></p>').html('审核人：'+groups[j].cn_name+' &nbsp;&nbsp;审核意见:&nbsp;'+groups[j].status_arr+'&nbsp;&nbsp;回复内容:'+groups[j].contentofreply));
          }
          var callInput = $('#showImg');
            applyMsg.picture.forEach(function (item) {
                callInput.find('.listBox').append('<li>' +
                    '<img  src="/storage/' + item.image_path + '"/>' +
                    '</li>');
            })
      },
      fail: function(rsp){
        LayerConfig('fail',rsp.message);
      }
  },this);
})

//返回异常单列表页面
$('body').on('click','.back',function(){
  window.location.href = '/QC/acceptOnDeviationApply';
});

$('body').on('click','.print',function (e) {
  e.stopPropagation();
  $('.back').hide();
  $("#distribute").print();
  $('.back').show();
})