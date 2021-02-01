var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {};
$(function () {
  resetParam();
  getClaims();
  bindEvent();
});

//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    MATNR:'',
    begintime:'',
    endtime:'',
    EBELN:'', // 采购凭证编号
    VBELN:'', // 销售和分销凭证号
    VBELP:'', // 销售凭证项目
    EBELP:'', // 采购凭证的项目编号
    wo_number:'', // 工单号
    po_number:'', // 生产单号
    NAME1:'', // 供应商名称
    LIFNR:'', // 供应商编号and加工商编号
    operation_name:'', // 工序
    card_id:'', // 创建人卡号
    order: 'desc',
    sort: 'id'
  };
};

function bindPagenationClick(totalData, pageSize) {
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageNo,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageNo = api.getCurrent();
      getClaims();
    }
  });
};

//获取索赔单列表
function getClaims() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['check'].claimIndex + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results);
      } else {
        noData('暂无数据', 21);
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      noData('获取物料列表失败，请刷新重试', 21);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}

//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var tr = `
            <tr class="tritem" data-id="${item.id}">            
                <td>${tansferNull(item.code)}</td>
                <td class="showtime" style="display: none;">${tansferNull(item.operation_name)}</td>
                <td class="showtime" style="display: none;">${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>
                <td>${tansferNull(item.MATNR)}</td>
                <td>${tansferNull(item.EBELN)}</td>
                <td>${tansferNull(item.EBELP)}</td>
                <td>${tansferNull(item.VBELN)}</td>
                <td>${tansferNull(item.VBELP)}</td>
                <td>${tansferNull(item.NAME1)}</td>
                <td>${tansferNull(item.LIFNR)}</td>
                <td>${tansferNull(item.DEFECT_DESC)}</td>
                <td class="showtime" style="display: none;">${tansferNull(jsonToNameStr(item.harmful_item))}</td>
                <td class="showtime" style="display: none;">${tansferNull(jsonToNameStr(item.handle_mode))}</td>
                <td class="showtime" style="display: none;">${tansferNull(jsonToNameStr(item.invalid_item))}</td>
                <td class="showtime" style="display: none;">${tansferNull(item.handle_cost)}</td>
                <td>${tansferNull(jsonToNameStr(item.duty_ascription))}</td>
                <td>${tansferNull(jsonToNameStr(item.statistics_department))}</td>
                <td>${tansferNull(item.card_id)}</td>
                <td>${tansferNull(item.createdate)}</td>
                <td class="right">
                    ${item.status == 1 ? `<button data-id="${item.id}" class="button pop-button send">推送</button>` : ''}
                    <a href='/Claim/viewClaim?id=${item.id}'><button data-id="${item.id}" class="button pop-button">查看</button></a>
                    <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
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

function bindEvent() {
  $('body').on('click', '.view', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');
    getClaim(id);
    // 获取id
    localStorage.setItem('keyId', id);
    /****************************  xiugai  strat   *************************/
    // 得到id
    var keyId = localStorage.getItem('keyId');
    AjaxClient.get({
      url: URLS['check'].showQcClaim + "?" + _token + "&id=" + keyId,
      dataType: 'json',
      success: function (rsp) {

        // 转化成时间戳
        var time = rsp.results[0].createdate;
        var date = new Date(time);
        var tim = date.getTime();

        // 时间戳转成年，月，日
        var times = new Date(tim);
        var year = times.getFullYear();
        var month = times.getMonth() + 1;
        var data = times.getDate();

        // 判断name是否为null
        if (rsp.results[0].employee_name == null) {
          rsp.results[0].employee_name = '  ';
        }

        var arr = {
          matnr: rsp.results[0].groups[0].MATNR,
          year: year,
          month: month,
          data: data,
          name: rsp.results[0].employee_name
        };
        // 存arr 
        window.localStorage.setItem('rsp', JSON.stringify(arr));
      }
    });
    /***************************************   xiugai  end   *************************************************/
  });

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
      type: 'datetime',
      show: true,
      closeStop: '#start_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#end_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#end_time_input',
      min: min,
      // max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  //显示与隐藏
  $('body').on('click', '#show_all_time', function (e) {
    e.stopPropagation();
    $('.showtime').toggle();
    if ($(this).text() == '显示') {
      $(this).text('隐藏');
      showFlag = 1;
    } else {
      $(this).text('显示');
      showFlag = 0;
    }
  });

  $('body').on('click','.delete',function(e){  //  2019/12/3    辅助李浩   增加删除按钮
	e.stopPropagation();
	
	console.log(1111);
    var id=$(this).attr('data-id');
    AjaxClient.get({
	  url: '/QcClaim/deleteClaim' + "?" + _token + "&id=" + id,
	   dataType: 'json',
	   beforeSend: function () {
		   layerLoading = LayerConfig('load');
	   },
      success:function(rsp){
		layer.close(layerLoading);
		layer.msg('删除成功!', { icon: 1, offset: '250px', time: 3000 });
		  getClaims();
      },
      fail:function(rsp){
		  getClaims();
		  layer.close(layerLoading);
		  layer.msg('删除失败!', { icon: 5, offset: '250px', time: 3000 });
      }
    })
  })

  //更多搜索条件下拉
  $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
    e.stopPropagation();
    $(this).find('.el-icon').toggleClass('is-reverse');
    var that = $(this);
    that.addClass('noclick');
    if ($(this).find('.el-icon').hasClass('is-reverse')) {
      $('#searchForm .el-item-show').css('background', '#e2eff7');
      $('#searchForm .el-item-hide').slideDown(400, function () {
        that.removeClass('noclick');
      });
    } else {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
        that.removeClass('noclick');
      });
    }
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

  $('body').on('click', '.send', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');
    layer.confirm('将执行推送操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitCheck(id);
    });
  })
  $('body').on('click', '#searchMAttr_from .submit:not(.is-disabled)', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      code: parentForm.find('#order_id').val().trim(),
      MATNR: parentForm.find('#MATNR').val().trim(),
      begintime: parentForm.find('#start_time_input').text().trim(),
      endtime: parentForm.find('#end_time_input').text().trim(),
      EBELN: parentForm.find('#EBELN').val().trim(),
      VBELN: parentForm.find('#VBELN').val().trim(),
      VBELP: parentForm.find('#VBELP').val().trim(),
      EBELP: parentForm.find('#EBELP').val().trim(),
      wo_number: parentForm.find('#wo_number').val().trim(),
      po_number: parentForm.find('#po_number').val().trim(),
      NAME1: parentForm.find('#NAME1').val().trim(),
      LIFNR: parentForm.find('#LIFNR').val().trim(),
      operation_name: parentForm.find('#operation_name').val().trim(),
      card_id: parentForm.find('#card_id').val().trim(),
    }
    getClaims();
  })

  $('body').on('click', '#searchMAttr_from .export:not(.is-disabled)', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm'),urlLeft='';
    ajaxData = {
      code: parentForm.find('#order_id').val().trim(),
      MATNR: parentForm.find('#MATNR').val().trim(),
      begintime: parentForm.find('#start_time_input').text().trim(),
      endtime: parentForm.find('#end_time_input').text().trim(),
      EBELN: parentForm.find('#EBELN').val().trim(),
      VBELN: parentForm.find('#VBELN').val().trim(),
      VBELP: parentForm.find('#VBELP').val().trim(),
      EBELP: parentForm.find('#EBELP').val().trim(),
      wo_number: parentForm.find('#wo_number').val().trim(),
      po_number: parentForm.find('#po_number').val().trim(),
      NAME1: parentForm.find('#NAME1').val().trim(),
      LIFNR: parentForm.find('#LIFNR').val().trim(),
      operation_name: parentForm.find('#operation_name').val().trim(),
      card_id: parentForm.find('#card_id').val().trim(),
    }
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = "/QcClaim/claimexport?" + urlLeft;
    $('#exportBtn').attr('href', url)
  })

  $('body').on('click', '#searchMAttr_from .reset:not(.is-disabled)', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#order_id').val('');
    parentForm.find('#MATNR').val('');
    parentForm.find('#EBELN').val('');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#VBELN').val('');
    parentForm.find('#VBELP').val('');
    parentForm.find('#EBELP').val('');
    parentForm.find('#wo_number').val('');
    parentForm.find('#po_number').val('');
    parentForm.find('#NAME1').val('');
    parentForm.find('#LIFNR').val('');
    parentForm.find('#operation_name').val('');
    parentForm.find('#card_id').val('');
    pageNo = 1;
    resetParam();
    getClaims();
  })

  $('body').on('click', '#claim_form .print:not(.is-disabled)', function (e) {
    e.stopPropagation();
    doPrint();
    $("#printList").show();
    $("#printList").print();
    $("#printList").hide();
  })
}
function sumbitCheck(id) {
  AjaxClient.get({
    url: URLS['check'].pushClaim + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('推送成功！', {
        icon: 1, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getClaims();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.confirm(rsp.message ? rsp.message : '推送失败！', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getClaims();
      });
    }
  }, this);
}
function getClaim(id) {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['check'].showQcClaim + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.results) {
        console.log(rsp)
        getClaimModal(rsp.results[0], rsp.results[0].groups);
      } else {
        layer.msg('获取索赔单失败', { icon: 5, offset: '250px', time: 1500 });
      }
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取索赔单失败', { icon: 5, offset: '250px', time: 1500 });
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function getClaimModal(Info, data) {

  var { DEFECT_DESC = '', DEFECT_SUM = '', MATNR = '', MATNR_qty = '', RELATIVE_ITEM_CODE = '', RELATIVE_ITEM_SUM = '' } = {};
  var { po_number = '', wo_number = '', sub_number = '', employee_name = '', responsible_organization = '' } = {};

  if (data.length > 0) {
    ({ DEFECT_DESC='', DEFECT_SUM='', MATNR='', MATNR_qty='', RELATIVE_ITEM_CODE='', RELATIVE_ITEM_SUM='' } = data[0]);
    ({ po_number='', wo_number='', sub_number='', employee_name='', responsible_organization='' } = Info);

  }
  var title = '索赔单';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" id="claim_form"> 
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">物料号<span class="mustItem">*</span></label>
                    <input type="text" id="MATNR" data-name="物料号" class="el-input" readonly placeholder="请输入物料号" value="${MATNR}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">生产订单号<span class="mustItem">*</span></label>
                    <input type="text" id="po_number" data-name="生产订单号" class="el-input" readonly placeholder="请输入生产订单号" value="${po_number}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">工单号<span class="mustItem">*</span></label>
                    <input type="text" id="wo_number" data-name="工单号" class="el-input" readonly placeholder="请输入工单号" value="${sub_number ? sub_number : wo_number}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">责任人<span class="mustItem">*</span></label>
                    <input type="text" id="employee" data-name="责任人" class="el-input" readonly placeholder="请输入责任人" value="${employee_name}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">责任单位<span class="mustItem">*</span></label>
                    <input type="text" id="responsibleOrganization" data-name="责任单位" class="el-input" readonly placeholder="请输入责任单位" value="${responsible_organization}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">数量<span class="mustItem">*</span></label>
                    <input type="number" id="MATNR_qty" readonly min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入数量" value="${MATNR_qty}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">缺陷数量<span class="mustItem">*</span></label>
                    <input type="number" id="DEFECT_SUM" readonly min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="缺陷数量" class="el-input" placeholder="请输入缺陷数量" value="${DEFECT_SUM}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料号<span class="mustItem">*</span></label>
                    <input type="text" id="RELATIVE_ITEM_CODE" readonly data-name="连带物料号" class="el-input" placeholder="请输入连带物料号" value="${RELATIVE_ITEM_CODE}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料数量<span class="mustItem">*</span></label>
                    <input type="number" id="RELATIVE_ITEM_SUM" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入连带物料数量" value="${RELATIVE_ITEM_SUM}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                   <label class="el-form-item-label" style="width: 150px;">问题描述<span class="mustItem">*</span></label>
                    <textarea type="textarea" maxlength="500" readonly id="DEFECT_DESC" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字符">${DEFECT_DESC}</textarea>                 
                </div>
              </div>
              <div class="el-form-item">
                  <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                      <button type="button" class="el-button el-button--primary print">打印</button>
                  </div>
              </div>            
        </form>`,
    success: function (layero, index) {
      layerEle = layero;

    },
    end: function () {

    }
  });
}
// 打印调用
function doPrint() {
  var prnhtml = '';
  // 取arr
  console.log('print')
  var rs = JSON.parse(window.localStorage.getItem('rsp'));
  prnhtml = `<table border="1" cellpadding="0" cellspacing="0" width="550" >
                <thead>
                    <tr>
                        <td style="border-bottom:0;border-right:0;">
                        
                        </td>
                        <td colspan="6" height="100" style="border-bottom: 0; border-left:0;">
                            
                            <h2 style=" margin-top:20px;  margin-left:100px; ">责任单位不良索赔单</h2>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6" width="80%" style="border-top:0; border-right: 0;">
                            
                        </td>
                        <td style="border-top:0; border-left: 0;" width="20%" >
                            <label for="" id="lab">`+ rs.matnr + `</label>
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
                        <td width="80">`+ rs.data + `</td>
                        <td width="30">日</td>
                    </tr>
                    <tr>
                        <td width="150" height="60">供货公司名称</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">物料编码</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">供货公司名称</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">原标签信息(全面)</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">不良问题描述(其中短码需附上明细台账)</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">产生相关费用</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">接受部门备注</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">原标签信息(全面)</td>
                        <td  width="80"></td>
                        <td width="100">反馈人(工号)</td>
                        <td  width="80">`+ rs.name + `</td>
                        <td width="100">品管部确认(工号)</td>
                        <td colspan="2"  width="80"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">品管部审核</td>
                        <td colspan="6"></td>
                    </tr>
                    <tr>
                        <td width="150" height="60">计划部审核</td>
                        <td colspan="6"></td>
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
  $("#printList").append(prnhtml)
}