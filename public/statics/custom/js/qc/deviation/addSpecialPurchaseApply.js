var layerModal,
  layerLoading,
  ajaxData = {},
  pageAdminNo = 1,
  adminData = [],
  pageSize = 20,
  adminName = [],
  adminId = [],
  ajaxAdminData = {
    order: 'desc',
    sort: 'id'
  };

$(function () {
  $("#zwb_upload").bindUpload({
    url: "/Image/uploadPicture",
    callbackPath: "#showImg",
    num: 10,
    type: "jpg|png|gif|svg",
    size: 3,
    owner:"deviation"
  });
})

//分页事件
function bindPagenationClick(totalData, pageSize, pageno, flag) {
  $('#pagenation.' + flag).show();
  $('#pagenation.' + flag).pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageno,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageno = api.getCurrent();
      if (flag == 'admin') {//审核单位弹框
        pageAdminNo = pageno;
        getAdminList();
      }
    }
  });
}

//生成审核单位弹框界面
function chooseAdminModal() {
  var tableHeight = $(window).height() - 280;
  layerModal = layer.open({
    type: 1,
    title: '选择审核人',
    offset: '100px',
    area: '650px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="chooseAdmin formModal chooseModal" id="chooseAdmin">
           <ul class="query-item">
                <li style="margin-bottom: 10px;">
                    <div class="el-form-item" style="width: 400px;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="font-size: 14px;margin-bottom: 0px;text-align: left;width:150px;">审核单位</label>
                            <input type="text" id="name" class="el-input" placeholder="请输入审核单位名称" value="">
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
                          <th>审核人</th>
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
    success: function (layero, index) {
      //获取选中的审核单位
      getAdminList();
    },
    cancel: function (layero, index) {//右上角关闭按钮
    },
    end: function () {
      pageAdminNo = 1;
      ajaxAdminData = {
        sort: 'id',
        order: 'desc'
      };
      adminData = [];
    }
  })
}

//选择审核单位触发弹框事件
$('body').on('click', '.pop-button.choose-admin', function () {
  chooseAdminModal();
});

//获取审核单位列表
function getAdminList() {
  var urlLeft = '';
  for (var param in ajaxAdminData) {
    urlLeft += `&${param}=${ajaxAdminData[param]}`;
  }
  urlLeft += "&page_no=" + pageAdminNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['check'].list + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createAdminHtml(rsp);
      } else {
        noData('暂无数据', 3);
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize, pageAdminNo, 'admin');
      } else {
        $('#pagenation.admin').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取审核单位列表失败，请刷新重试', 3);
    }
  }, this);
}

//表格无数据展示
function noData(val, num) {
  var noDataTr = `
            <tr>
                <td class="nowrap" colspan="${num}" style="text-align: center;">${val}</td>
            </tr>
        `;
  $('.table_tbody').html(noDataTr);
}

//生成审核单位列表
function createAdminHtml(rsp) {
  var ele = $('#chooseAdmin .table_tbody');
  ele.html('');
  // console.log(rsp);
  // console.log(adminId);
  if (rsp && rsp.results && rsp.results.length) {
    rsp.results.forEach(function (item, index) {
      var admin_id = item.admin_id, adminExist = false;
      adminId.forEach(function (val, i) {
        if (val == admin_id) {
          adminExist = true;
        }
      })
      // console.log(item);
      var checkbox = `<span class="el-checkbox_input ${adminExist ? 'is-checked' : ''}" data-name="${item.cn_name}" data-id="${item.admin_id}">
                        <span class="el-checkbox-outset"></span>
                    </span>`;
      var tr = `
                <tr class="tritem" data-id="${item.admin_id}">
                    <td>${item.cn_name}</td>
                    <td>${item.card_id}</td>
                    <td class="right">${checkbox}</td>
                </tr>
            `;
      ele.append(tr);
      ele.find('tr:last-child').data("adminData", item);
    });
  } else {
    var tr = `<tr><td colspan="2" style="text-align: center;">暂无数据</td></tr>`;
    ele.append(tr);
  }
}

// checkbox 点击
$('body').on('click', '.el-checkbox_input:not(.noedit)', function (e) {
  var admin_name = $(this).attr('data-name'),
    admin_id = $(this).attr('data-id');
  $(this).toggleClass('is-checked');
  if ($(this).hasClass('is-checked')) {
    adminName.push(admin_name);
    adminId.push(admin_id);
  } else {
    var index = adminName.indexOf(admin_name);
    if (index > -1) {
      adminName.splice(index, 1);
    }
    var idIndex = adminId.indexOf(admin_id);
    if (idIndex > -1) {
      adminId.splice(idIndex, 1);
    }
  }
  // console.log(adminName,adminId);
});

//搜索审核单位
$('body').on('click', '#chooseAdmin .choose-admin', function () {
  if (!$(this).hasClass('is-disabled')) {
    var ele = $('#chooseAdmin');
    ajaxAdminData.cn_name = ele.find('#name').val().trim();
    pageAdminNo = 1;
    getAdminList();
  }
});

//审核单位确定按钮
$('body').on('click', '#chooseAdmin .submit', function () {
  layer.close(layerModal);
  $('#choose_admin').val(adminName.join(','));
  $('#choose_admin_id').val(adminId.join(','));
})

//添加申请单
$('body').on('click', '.addApply', function () {
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
                        <input type="hidden" class="el-input ID" value="">
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
                        <span class="">数量</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input order_number" placeholder="请输入数量" value="">
                    <input type="hidden" class="el-input" value="">
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
                <span class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">不合格率</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input reject_ratio" placeholder="请输入不合格率" value="">
                    <input type="hidden" class="el-input" value="">
                </span>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div abnormal-item">
                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                        <span class="">物料编码</span>
                    </label>
                    <input type="text" class="el-input abnormalApply-input material_code" placeholder="请输入物料编码" value="">
                    <input type="hidden" class="el-input" value="">
                </div>
            </div>
        </div>
    `;
  $('.userInput').append(applyMsg);
  $('.check-id').autocomplete({
    url: URLS['check'].selectDim + "?" + _token,
    param: 'check_code',
    showCode: 'check_code'
  });
})

//删除申请单
$('body').on('click', '.deleteApply', function () {
  $(this).parents('.apply').remove();
});

//检验单号模糊查询事件
$(function () {
  $('.check-id').autocomplete({
    url: URLS['check'].selectDim + "?" + _token,
    param: 'check_code',
    showCode: 'check_code'
  })
})

$('body').on('click','.back',function(){
  window.location.href = '/QC/acceptOnDeviationApply';
});

//根据检验单号填充信息
$('body').on('click', '.userInput .el-select-dropdown-list .el-auto', function () {
  var check_no = $(this).html();
  // console.log(check_no);
  var itemMsg = {};
  AjaxClient.get({
    url: URLS['check'].selectDim + '?' + _token + '&check_code=' + check_no,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // console.log(rsp);
      rsp.results.forEach(function (val, i) {
        if (val.check_code == check_no) {
          itemMsg = val;
        }
      })
      // console.log(itemMsg);
      // console.log(itemMsg.check_id);
      var inferior_qty = Number(itemMsg.deadly) + Number(itemMsg.seriousness) + Number(itemMsg.slight);
      var amount_of_inspection = Number(itemMsg.amount_of_inspection);
      if (itemMsg.amount_of_inspection == 0) {
        reject_ratio = 0;
      } else {
        var reject_ratio = inferior_qty / amount_of_inspection;
      }
      // console.log(inferior_qty,Number(itemMsg.amount_of_inspection),reject_ratio);
      var user_input = $(this).parents('.apply');
      // console.log(user_input);
      user_input.find('.VBELP').val(itemMsg.VBELP);
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
      user_input.find('.order_number').val(itemMsg.order_number);
      user_input.find('.VBELN').val(itemMsg.VBELN);
      user_input.find('.amount_of_inspection').val(itemMsg.amount_of_inspection);
      user_input.find('.inferior_qty').val(inferior_qty);
      user_input.find('.reject_ratio').val(reject_ratio);
      user_input.find('.material_code').val(itemMsg.material_code);
      user_input.find('.NAME1').val(itemMsg.NAME1);
      user_input.find('.LIFNR').val(itemMsg.LIFNR);
      user_input.find('.operation_name').val(itemMsg.operation_name);
    },
    fail: function (rsp) {

    }
  }, this);
})

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
    applyMsg.reject_ratio = $(val).find('.reject_ratio').val();
    applyMsg.unit_id = $(val).find('.unitId').val();
    applyMsg.inferior_qty = $(val).find('.inferior_qty').val();
    applyMsg.inspection_qty = $(val).find('.amount_of_inspection').val();
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
  var items = JSON.stringify(abnormalApplyMsg),
    key_persons = $('#choose_admin_id').val(),
    question_description = $('#questionDescription').val().trim(),
    cause = $('#cause').val().trim();
  if (abnormalApplyMsg.length == 0) {
    LayerConfig('fail', '至少要有一条检验单');
  } else {
    AjaxClient.get({
      url: URLS['deviation'].add + '?' + _token + '&key_persons=' + key_persons + '&question_description=' + question_description +
        '&cause=' + cause + '&items=' + items + '&drawings=' + JSON.stringify(drawings),
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        // console.log(rsp);
        layer.msg("申请成功", { icon: 1, offset: '250px', time: 1500 });
        // window.location.href='/QC/acceptOnDeviationApply';
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        if (rsp && rsp.message != undefined && rsp.message != null) {
          LayerConfig('fail', rsp.message);
        }
      }
    }, this);
  }

})


