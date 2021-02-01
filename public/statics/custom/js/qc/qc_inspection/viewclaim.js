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
          // console.log(statistics_department);
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
          $('#review_desc').html(reviewDesc(itemres))
          $('#harmful_item').text(jsonToNameStr(harmful_item));
          $('#handle_method').text(jsonToNameStr(handle_mode));
          $('#expired_item').text(jsonToNameStr(invalid_item));
          $('#choose_person').val(persons);
          $('#department').val(jsonToNameStr(duty_ascription));
          $('#statisticsDepartment').val(jsonToNameStr(statistics_department));
          $('#dealCost').val(handle_cost);
          $('#questionDescription').val(questionDescription);
           // 转化成时间戳
           var time = rsp.results[0].createdate;
           var date = new Date(time);
           var tim = date.getTime();

           // 时间戳转成年，月，日
           var times = new Date(tim);
           var year = times.getFullYear();
           var month = times.getMonth() + 1;
           var date = times.getDate();

           // 判断name是否为null
           if (rsp.results[0].employee_name == null) {
             rsp.results[0].employee_name = '  ';
           }
          var arr = {
            matnr: rsp.results[0].groups[0].MATNR,
            year: year,
            month: month,
            date: date,
            name: rsp.results[0].employee_name,
            data:rsp.results
          };
          // 存arr 
          window.localStorage.setItem('rsp', JSON.stringify(arr));
      },
      fail: function(rsp){

      }
  },this);
})

function reviewDesc(data){
  var _html='';
  data.forEach(function(item,val){
    _html+=`审核人: ${item.cn_name}   审核意见: ${item.status_arr}   回复内容: ${item.contentofreply}\n`;
  })
  return _html;
}

function reviewDescPrint(data){
  var _html='';
  data.forEach(function(item,val){
    _html+=`<p>审核人: ${item.cn_name}   审核意见: ${item.status_arr}   回复内容: ${item.contentofreply}<p>`;
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

$('body').on('click', '.print:not(.is-disabled)', function (e) {
  e.stopPropagation();
  doPrint();
  $("#printList").show();
  $("#printList").print();
  $("#printList").hide();
})


// $(document).click(function (e) {
//   var obj = $(e.target);
//   if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
//     $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
//     $('.el-muli-select-dropdown').slideUp().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
//   }
//   if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
//     $('#searchForm .el-item-hide').slideUp(400, function () {
//       $('#searchForm .el-item-show').css('background', 'transparent');
//     });
//     $('.arrow .el-input-icon').removeClass('is-reverse');
//   }
// });

$('body').on('click', '.back', function () {
  window.location.href = '/Claim/claimIndex';
});

// $('body').on('click', '.el-select', function () {
//   $(this).find('.el-input-icon').toggleClass('is-reverse');
//   $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
//   $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
//   $(this).siblings('.el-select-dropdown').toggle();
//   var width = $(this).width();
//   var offset = $(this).offset();
//   $(this).siblings('.el-select-dropdown').width(width);
// });

// 下拉框item点击事件
// $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
//   e.stopPropagation();
//   $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
//   $(this).addClass('selected');
//   if ($(this).hasClass('selected')) {
//     var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
//     var idval = $(this).attr('data-id');
//     ele.find('.el-input').val($(this).text());
//     ele.find('.val_id').val($(this).attr('data-id'));
//     ele.find('.plan_type_id').val($(this).attr('data-plan-type-id'));
//   }
//   $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
// });

//根据检验单号填充信息

function preservationCheck(check_code) {
  // var check_no = $(this).html();
  // console.log(check_no);
  var itemMsg = {};
  AjaxClient.get({
    url: URLS['check'].selectDim + '?' + _token + '&check_code=' + check_code,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // console.log(rsp);
      rsp.results.forEach(function (val, i) {
        // if (val.id == check_id) {
        itemMsg = val;
        // }
      });
      var inferior_qty = Number(itemMsg.deadly) + Number(itemMsg.seriousness) + Number(itemMsg.slight);
      var amount_of_inspection = Number(itemMsg.amount_of_inspection);
      if (itemMsg.amount_of_inspection == 0) {
        reject_ratio = 0;
      } else {
        var reject_ratio = inferior_qty / amount_of_inspection;
      }
      $('#itemId').val(itemMsg.id);
      $('.check-code').val(itemMsg.check_code);
      $('.VBELP').val(itemMsg.VBELP);
      $('.checkId').val(itemMsg.id);
      $('.unitId').val(itemMsg.unit_id);
      $('.production_order_id').val(itemMsg.production_order_id);
      $('.sub_number').val(itemMsg.sub_number);
      $('.sub_order_id').val(itemMsg.sub_order_id);
      $('.check_resource').val(itemMsg.check_resource);
      $('.work_order_id').val(itemMsg.work_order_id);
      $('.EBELN').val(itemMsg.EBELN);
      $('.EBELP').val(itemMsg.EBELP);
      $('.po_number').val(itemMsg.po_number);
      $('.wo_number').val(itemMsg.wo_number);
      $('.material_id').val(itemMsg.material_id);
      $('.material_name').val(itemMsg.materialName);
      $('.order_number').val(itemMsg.order_number);
      $('.VBELN').val(itemMsg.VBELN);
      $('.NAME1').val(itemMsg.NAME1);
      $('.LIFNR').val(itemMsg.LIFNR);
      $('.material_code').val(itemMsg.material_code);
      $('.operation_name').val(itemMsg.operation_name);
      getDepartment();
    },
    fail: function (rsp) {

    }
  }, this);
};

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


//保存申请信息
$('body').on('click', '.saveMsg', function () {

  var abnormalApplyMsg = [];
  $('.apply').each(function (i, val) {
    var applyMsg = {};
    // console.log(val);
    applyMsg.check_id = $(val).find('.checkId').val();
    applyMsg.id = '';
    applyMsg.material_id = $(val).find('.material_id').val();
    applyMsg.VBELN = $(val).find('.VBELN').val();
    applyMsg.VBELP = $(val).find('.VBELP').val();
    applyMsg.EBELP = $(val).find('.EBELP').val();
    applyMsg.EBELN = $(val).find('.EBELN').val();
    applyMsg.work_order_id = $(val).find('.work_order_id').val();
    applyMsg.wo_number = $(val).find('.wo_number').val();
    applyMsg.po_number = $(val).find('.po_number').val();
    applyMsg.unit_id = $(val).find('.unitId').val();
    applyMsg.order_number = $(val).find('.order_number').val();
    applyMsg.production_order_id = $(val).find('.production_order_id').val();
    applyMsg.sub_number = $(val).find('.sub_number').val();
    applyMsg.sub_order_id = $(val).find('.sub_order_id').val();
    applyMsg.check_resource = $(val).find('.check_resource').val();
    applyMsg.material_code = $(val).find('.material_code').val();
    applyMsg.NAME1 = $(val).find('.NAME1').val();
    applyMsg.LIFNR = $(val).find('.LIFNR').val();
    applyMsg.operation_name = $(val).find('.operation_name').val();
    abnormalApplyMsg.push(applyMsg);
  });
  var drawings = []
  if ($('#showImg .listBox li').length > 0) {
    $('#showImg .listBox li').each(function () {
      drawings.push({
        drawing_id: $(this).find('img').attr('data-id')
      })
    })
  }

  // console.log(abnormalApplyMsg);
  var data = {
    question_description: $('#questionDescription').val().trim(),
    key_persons: $('#choose_admin_id').val(),
    harmful_item: $("#harmful_item").attr('data-id'),
    handle_method: $("#handle_method").attr('data-id'),
    expired_item: $("#expired_item").attr('data-id'),
    department: $("#department").val(),
    statisticsDepartment: $("#statisticsDepartment").val(),
    check_id: $("#itemId").val(),
    items: JSON.stringify(abnormalApplyMsg),
    _token:TOKEN
  }
  // var items = JSON.stringify(abnormalApplyMsg),
  //     question_description = $('#questionDescription').val().trim(),
  //     key_persons = $('#choose_admin_id').val(),
  //     harmful_item=$("#harmful_item").attr('data-id'),
  //     handle_method=$("#handle_method").attr('data-id'),
  //     expired_item=$("#expired_item").attr('data-id'),
  //     department=$("#department").val(),
  //     statisticsDepartment=$("#statisticsDepartment").val(),
  //     id=$("#itemId").val();

  AjaxClient.post({
    url: URLS['check'].storeQcClaim,
    dataType: 'json',
    data:data,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // console.log(rsp);
      layer.msg("索赔单添加成功", { icon: 1, offset: '250px', time: 1500 });
      // window.location.href='/QC/acceptOnDeviationApply';
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this);

})


// 打印调用
function doPrint() {
  var prnhtml = '';
  // 取arr
  var rs = JSON.parse(window.localStorage.getItem('rsp'));
  prnhtml = `<table border="1" cellpadding="0" cellspacing="0" width="550" >
                <thead>
                    <tr>
                        <td colspan="7" height="100" style="border-bottom: 0; border-left:0;">                            
                            <h2 style=" margin-top:20px;" class="center">索赔单</h2>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6" width="80%" style="border-top:0; border-right: 0;">                            
                        </td>
                        <td style="border-top:0; border-left: 0;" width="20%" >
                            <label for="" id="lab">`+ rs.data[0].code + `</label>
                        </td>	
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr >
                        <td width="150" height="40" >日期</td>
                        <td width="100">`+ rs.year + `</td>
                        <td width="30">年</td>
                        <td width="80">`+ rs.month + `</td>
                        <td width="30">月</td>
                        <td width="80">`+ rs.date + `</td>
                        <td width="30">日</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">供货公司名称</td>
                        <td colspan="6">${rs.data[0].groups[0].NAME1}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">物料编码</td>
                        <td colspan="6">${rs.data[0].groups[0].item_no}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">原标签信息(全面)</td>
                        <td colspan="6">${rs.data[0].groups[0].name}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">不良项目</td>
                        <td colspan="6">${jsonToNameStr(rs.data[0].harmful_item)}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">问题描述</td>
                        <td colspan="6">${rs.data[0].question_description}</td>
                    </tr>                    
                    <tr>
                        <td width="150" height="60">产生相关费用</td>
                        <td colspan="6">${rs.data[0].handle_cost}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">接受部门备注</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">创建人(工号)</td>
                        <td  colspan="6">${tansferNull(rs.data[0].card_id)}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">审批内容</td>
                        <td colspan="6">${reviewDescPrint(rs.data[0].itemres)}</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">接受部门接受签字</td>
                        <td width="80"></td>
                        <td width="100">接受部门审核</td>
                        <td width="80"></td>
                        <td width="100">责任单位确认签字或盖章</td>
                        <td colspan="2" width="80"></td>
                    </tr>
                </tbody>
            </table>`;
  $("#printList").html(prnhtml)
}
