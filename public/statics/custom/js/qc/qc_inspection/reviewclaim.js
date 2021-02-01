var pageNo=1,pageSize=50;

$(function(){
  var id = getQueryString('id');
  AjaxClient.get({
      url: URLS['check'].showQcClaim + "?" + _token + "&id=" + id,
      dataType: 'json',
      beforeSend: function(){
          layerLoading = LayerConfig('load');
      },
      success: function(rsp){
          layer.close(layerLoading);
          console.log(rsp.results[0].groups);
          var applyMsg = rsp.results[0];
          var harmful_item = applyMsg.harmful_item,
              handle_mode = applyMsg.handle_mode,
              handle_cost=applyMsg.handle_cost,
              invalid_item = applyMsg.invalid_item,
              duty_ascription = applyMsg.duty_ascription,
              statistics_department = applyMsg.statistics_department,
              persons=applyMsg.persons_arr,
              itemres=applyMsg.itemres,
              questionDescription = applyMsg.question_description;
          //填充明细
          rsp.results[0].groups.forEach(function(val,i){
              var applyMsg = `
                  <div class="apply">
                      <div class="el-form-item" style="margin-top:18px;">
                          <span class="el-form-item-div abnormal-item">
                              <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                  <span class="">检验单号</span>
                              </label>
                              <div class="el-select-dropdown-wrap">
                                  <input type="text" class="el-input abnormalApply-input check-id" autocomplete="off" readonly placeholder="" value="${val.code}">
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
                                  <span class="">供应商名称</span>
                              </label>
                              <input type="text" class="el-input abnormalApply-input NAME1" readonly placeholder="" value="${val.NAME1}">
                          </span>
                          <span class="el-form-item-div abnormal-item">
                              <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                  <span class="">供应商编码</span>
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
          $('#review_desc1').html(reviewDesc(itemres))
          $('#harmful_item').text(jsonToNameStr(harmful_item)).attr('data-id',jsonToIdStr(harmful_item));
          $('#handle_method').text(jsonToNameStr(handle_mode)).attr('data-id',jsonToIdStr(handle_mode));
          $('#expired_item').text(jsonToNameStr(invalid_item)).attr('data-id',jsonToIdStr(invalid_item));
          $('#choose_person').val(persons);
          $('#department').val(jsonToNameStr(duty_ascription));
          $('#department_id').val(jsonToIdStr(duty_ascription));
          $('#statistics_department').val(statistics_department);
          $('#dealCost').val(handle_cost);
          $('#questionDescription').val(questionDescription);
      },
      fail: function(rsp){

      }
  },this);
  getDepartment();
})

function jsonToIdStr(data) {
  var _html = '';
  if (data && data.length) {
    data.forEach(function (item) {
      _html += item.id + ','
    })
    return _html;
  } else {
    return _html;
  }
}

function reviewDesc(data){
  var _html='';
  data.forEach(function(item,val){
    _html+=`审核人: ${item.cn_name}   审核意见: ${item.status_arr}   回复内容: ${item.contentofreply}\n`;
  })
  return _html;
}

function jsonToNameStr(data) {
  var _html = '';
  if (data && data.length) {
    data.forEach(function (item) {
      _html += item.name + ' '
    })
    return _html;
  } else {
    return _html;
  }
}

function getDepartment() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].getNextLevelList + "?" + _token + "&company_id=" + 15,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      dtd.resolve(rsp);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;
        _html += `
            <li data-id="${item.department_id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${span}</li>
          `
      })
      $(".duty_department").find(".el-select-dropdown-list").html(_html);
      getStatisticsDepartment();
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function getStatisticsDepartment() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].getNextLevelList + "?" + _token + "&company_id=" + 15+'&type=1',
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      dtd.resolve(rsp);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;
        _html += `
            <li data-id="${item.department_id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${span}</li>
          `
      })
      $(".department").find(".el-select-dropdown-list").html(_html);
      getHarmfulItem();
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function getHarmfulItem() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + 0 + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        _html += `
            <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${item.name}</li>
          `
      })
      $(".harmful_item").find(".el-muli-select-dropdown-list").html(_html);
      getHandleMethod();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取不良项目失败');
    }
  }, this);
}


function getHandleMethod() {
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + 1 + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        _html += `
            <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${item.name}</li>
          `
      })
      $(".handle_method").find(".el-muli-select-dropdown-list").html(_html);
      getExpiredItem();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取不良项目失败');
    }
  }, this);
}

function review(){
  var data={
    id:getQueryString('id'),
    status:$("#specialPurchase").find('.is-radio-checked input').val(),
    contentofreply:$("#review_desc").val(),
    question_description: $('#questionDescription').val().trim(),
    harmful_item: $("#harmful_item").attr('data-id'),
    handle_method: $("#handle_method").attr('data-id'),
    expired_item: $("#expired_item").attr('data-id'),
    department: $("#department_id").val(),
    handle_cost: $("#dealCost").val(),
  }
  var urlLeft='';
  for (var param in data) {
    urlLeft += `&${param}=${data[param]}`;
  }
  
  AjaxClient.get({
    url: URLS['check'].review+"?"+_token+urlLeft,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    dataType: 'json',
    success:function(rsp){
      layer.close(layerLoading);
      LayerConfig('success', '审核成功');
	//   window.history.back(-1);
		window.location.href = '/Claim/replyClaimIndex';
    },
    fail:function(rsp){
      layer.close(layerLoading);
      if(rsp.message&&rsp){
        layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 })
      }
    }
  })
}

function getExpiredItem() {
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + 2 + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        _html += `
            <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${item.name}</li>
          `
      })
      $(".expired_item").find(".el-muli-select-dropdown-list").html(_html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取失效项目失败');
    }
  }, this);
}

//选择审核单位触发弹框事件
$('body').on('click', '.pop-button.choose-admin', function () {
  chooseAdminModal();
});

$('body').on('click', '.el-radio .el-radio-input', function () {
  if (!$(this).hasClass('is-radio-checked')) {
    $(this).addClass('is-radio-checked').parents('.el-radio').siblings('.el-radio').find('.el-radio-input').removeClass('is-radio-checked');
  }
})

//多选下拉框
$('body').on('click', '.el-muli-select', function () {
  if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
    $('.el-item-show').find('.el-muli-select-dropdown').hide();
    $('.el-item-show').find('.el-muli-select .el-input-icon').removeClass('is-reverse');
  } else {
    $('.el-item-show').find('.el-muli-select-dropdown').hide();
    $('.el-item-show').find('.el-muli-select .el-input-icon').removeClass('is-reverse');
    $(this).find('.el-input-icon').addClass('is-reverse');
    $(this).siblings('.el-muli-select-dropdown').show();
  }
  if (!$(this).hasClass('check_status')) {
    var scroll = $(document).scrollTop();
    var width = $(this).width();
    var offset = $(this).offset();
    $(this).siblings('.el-muli-select-dropdown').width(width).css({ top: offset.top - $(window).scrollTop() + 36, left: offset.left });
  }
});

//点击多选下拉框选项
$('body').on('click', '.el-muli-select-dropdown-item', function (e) {
  e.stopPropagation();
  $(this).toggleClass('selected');
  var _html = '', val_id = '';
  $(this).parent().find(".selected").each(function (index, v) {
    _html += $(v).text() + ',';
    val_id += $(v).attr("data-id") + ',';
  })
  var ele = $(this).parents('.el-muli-select-dropdown').siblings('.el-muli-select');
  ele.find('.el-input').text(_html);
  ele.find('.el-input').attr('data-id', val_id);

  $(this).parents('.el-muli-select-dropdown').hide().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
});

$(document).click(function (e) {
  var obj = $(e.target);
  if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
    $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    $('.el-muli-select-dropdown').slideUp().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
  }
  if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
  }
});

$('body').on('click', '.back', function () {
  window.location.href = '/Claim/claimIndex';
});

$('body').on('click','.review',function(e){
  e.stopPropagation();
  review();
})

$('body').on('click', '.el-select', function () {
  $(this).find('.el-input-icon').toggleClass('is-reverse');
  $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
  $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
  $(this).siblings('.el-select-dropdown').toggle();
  var width = $(this).width();
  var offset = $(this).offset();
  
  $(this).siblings('.el-select-dropdown').width(width);
});

// 下拉框item点击事件
$('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
  e.stopPropagation();
  $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
  $(this).addClass('selected');
  if ($(this).hasClass('selected')) {
    var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
    var idval = $(this).attr('data-id');
    ele.find('.el-input').val($(this).text());
    ele.find('.val_id').val($(this).attr('data-id'));
    ele.find('.plan_type_id').val($(this).attr('data-plan-type-id'));
  }
  $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
});