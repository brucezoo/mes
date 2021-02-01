var layerModal,
  layerLoading,
  ajaxData = {},
  pageAdminNo = 1,
  adminData = [],
  pageSize = 20,
  adminName = [],
  adminId = [],
  pageNo = 1,
  pageSize = 50,
  ajaxAdminData = {
    order: 'desc',
    sort: 'id'
  };
var str = '';
var str_arr = [];

layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;
});


add();
function add() {


		AjaxClient.get({
				url: '/getUnits' + "?" + _token,
				dataType: 'json',
				success: function (rsp) {

					let data = rsp.results;
					data.forEach(function (item) {
						str_arr.push({
							id: item.id,
							name: item.name,
						});
					})	
					
					window.sessionStorage.setItem('opt',JSON.stringify(str_arr));
										
				},
				fail: function (rsp) {

				}
			}, this);


			let opts = JSON.parse(window.sessionStorage.getItem('opt')) ;
			opts.forEach(function(item) {
				str += `<option value="${item.id}" >${item.name}</option>`;
			})
									
			let select = `
							<form class="layui-form" action="">
								<div class="layui-inline">
									<label class="layui-form-label"  style="color:gray; margin-bottom: 0px;width: 120px;margin-left: 77px;">单位</label>
									<div class="layui-input-inline">
										<select name="modules" id="sels" lay-verify="required" lay-search="">
											<option value="" >请输入单位</option>
											${str}
										</select>
									</div>
								</div>
							</form>
						`;
			$('#select').append(select);
		
}


$(function () {
  $("#zwb_upload").bindUpload({
    url: "/Image/uploadPicture",
    callbackPath: "#showImg",
    num: 10,
    type: "jpg|png|gif|svg",
    size: 3,
    owner: "deviation"
  });
  var check_id = getUrlParam('check_id')
  if (check_id != null) {
    preservationCheck(check_id)
  }
});

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null) return unescape(r[2]); return null; //返回参数值
}

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
                            <label class="el-form-item-label" style="font-size: 14px;margin-bottom: 0px;text-align: left;width:150px;">审核人</label>
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
});

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

$('body').on('click', '.back', function () {
  // window.location.href = '/QC/acceptOnDeviationApply';
  window.history.back(-1);
});

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

//根据检验单号填充信息

function preservationCheck(check_code) {
  // var check_no = $(this).html();
  // console.log(check_no);
  var itemMsg = {};
  AjaxClient.get({
    url: URLS['check'].selectDim + '?' + _token + '&check_id=' + check_code,
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
      layer.close(layerLoading);
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
      getStatisticsDepartment();
    },
    fail: function (rsp) {
      dtd.reject(rsp);
      layer.close(layerLoading);
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
      layer.close(layerLoading);
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
    handle_cost: $("#dealCost").val(),
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
      window.history.back(-1);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this);

})




$('body').on('change', '#or', function() {

	let data = {
		sales_order_code: $('.VBELN').val(),
		sales_order_project_code: $('.VBELP').val(), 
		item_no: $('.material_code').val(),
		bad_num: $('#bad-num').val(),
		unit_id: $('#sels').val(),
		problem_describe: $('#questionDescription').val(), 
		harmful_item: $("#harmful_item").attr('data-id'),
		handle_mode: $("#handle_method").attr('data-id'),
		invalid_item: $('#expired_item').attr('data-id') == undefined ? '' : $('#expired_item').attr('data-id'),
		handle_cost:'',
		duty_ascription: $('#department').val(),
		statistics_department: $('#statisticsDepartment').val(),
		_token: TOKEN
	}
	console.log(data);
	if(document.getElementById('or').checked == true) {
		if (data.harmful_item == '' || data.harmful_item == undefined) {
			layer.alert('请填写不良项目！');
			document.getElementById('or').checked = false;
		} else if (data.handle_mode == '' || data.handle_mode == undefined) {
			layer.alert('请填写处理方式！');
			document.getElementById('or').checked = false;
		} else if (data.statistics_department == '' || data.statistics_department == undefined) {
			layer.alert('请填写统计部门！');
			document.getElementById('or').checked = false;
		} else if (data.problem_describe == '' || data.problem_describe == undefined) {
			layer.alert('请填写物料描述！');
			document.getElementById('or').checked = false;
		} else {
			AjaxClient.post({
				url: '/qc/createInvalidOffer',
				dataType: 'json',
				data: data,
				beforeSend: function () {
					layerLoading = LayerConfig('load');
				},
				success: function (rsp) {
					layer.close(layerLoading);
					layer.msg("生成失效成功", { icon: 1, offset: '250px', time: 1500 });
					// window.history.back(-1);
				},
				fail: function (rsp) {
					layer.close(layerLoading);
					layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
				}
			}, this);
		}

	}
})

