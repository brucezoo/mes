var pageNo = 1,
  pageSize = 50,
  line_depot_id,
  out_flag = 1,
  id = 0,
  edit = '',
  pageNo = 1,
  pageSize = 50,
  pageNoItem = 1,
  pageSizeItem = 50,
  unitData = [],
  salesOrderCodeData = [],
  departmentData = [],
  statisticsDepartmentData = [],
  is2;

var str = '';

$(function () {
  id = getQueryString('id');
  edit = getQueryString('type');
  is2 = getQueryString('menu'); // 失效成本处理2

  getDepartment();
  // if (id == null) {
  //   getInvalidCostIndex();
  // } else {
  //   getInvalidCostIndex(id);
  // }
  bindEvent();
});

function bindEvent() {
  $('body').on('focus', '#work_order_form', function (e) {
    $('#work_order_form').val('');
  });

  //推送操作
  $('body').on('click', '#invalidCost_form .submit', function (e) {
    e.stopPropagation();

    layer.confirm('您将执行提报操作！?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      submitInvalidCost();
    });
  });

  //推送操作
  $('body').on('click', '#invalidCost_form .edit', function (e) {
    e.stopPropagation();

    layer.confirm('您将提交编辑！', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
      editInvalidCost();
    });
  });

  //产成品实报数量失去焦点事件
  $('body').on('keyup', '#show_out_material .consume_num.deal', function (e) {
    var len = $("#show_out_material .table_tbody tr").length;
    var realNumber = Number($(this).val()).toFixed(3);
    var planNumber = Number($('#show_out_material .qty').text()).toFixed(3);

    if (len == 1) {
      $("#show_in_material .table_tbody tr").each(function () {
        var this_qty = Number($(this).find('.qty').text());
        var newQty = ((realNumber / planNumber) * this_qty).toFixed(3);
        $(this).find('.beath_qty.deal').val(newQty);
        $(this).find('.consume_num.deal').val(newQty);
        $(this).find('.difference_num.deal').val(0);
      })
    }
  });

  //额定领料数量
  // $("body").on('blur', '#sales_order_code', function (e) {
  //   e.stopPropagation();
  //   getSalesOrderProjectCode();
  // });

  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
    var width = $(this).width();
    var offset = $(this).offset();
    $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top - $(window).scrollTop() + 33, left: offset.left });
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

  //点击其他区域下拉框消失
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
    if (!obj.hasClass('searchModal') && obj.parents(".searchModal").length === 0) {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
    }
  });

  $('body').on('click', '.btn-group:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
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
      // $(this).siblings('.el-muli-select-dropdown').width(width);
      $(this).siblings('.el-muli-select-dropdown').width(width).css({ top: offset.top - $(window).scrollTop() + 36, left: offset.left });

    }
  });

  //点击多选下拉框选项
  $('body').on('click', '.el-muli-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).toggleClass('selected');
    var _html = '', val_id = '',val_item_no='';
    $(this).parent().find(".selected").each(function (index, v) {
      _html += $(v).text() + ',';
      val_id += $(v).attr("data-id") + ',';
      if($(v).attr("data-item-no")){
        val_item_no+=$(v).attr("data-item-no")+',';
      }
    })
    var ele = $(this).parents('.el-muli-select-dropdown').siblings('.el-muli-select');
    ele.find('.el-input').text(_html);
    ele.find('.el-input').attr('data-id', val_id);
    if($(this).attr('data-item-no')){
      ele.find('.el-input').attr('data-item-no', val_item_no);
    }
    if ($(this).parents('.el-muli-select-dropdown').siblings('.el-muli-select').hasClass('project-code')) {
      multiSelect();
    }
    $(this).parents('.el-muli-select-dropdown').hide().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //输入框的相关事件
  $('body').on('focus', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'unit_id') {
      var that = $(this);
      createUnit(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'sales_order_code') {
      var that = $(this).val();
      getSalesOrderCode(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else {
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  }).on('blur', '.basic_info .el-input:not([readonly])', function () {
    var name = $(this).attr('id'),
      id = $('itemId').val();
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name)
      && remoteValidatorConfig[name]
      && remoteValidatorToolbox[remoteValidatorConfig[name]]
      && remoteValidatorToolbox[remoteValidatorConfig[name]](name, id);
  }).on('input', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'unit_id') {
      var that = $(this);
      createUnit(that);
    } else if ($(this).attr('id') == 'sales_order_code') {
      var that = $(this).val();
      getSalesOrderCode(that);
    }
  });

  //下拉列表项点击事件
  $('body').on('click', '.unit .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    console.log(899);
    // $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select').find('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  })

  //下拉列表项点击事件
  $('body').on('click', '.sales-order-code .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    // console.log($(this).text())
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      getSalesOrderProjectCode();
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
    }
    $(this).parents('.el-select-dropdown').hide();
  })

  $('body').on('click', '.department .el-select-dropdown-item:not(.el-auto)', function (e) {
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
}

function createUnit(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, unitData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].commercial}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      $('.el-form-item.unit').find('.el-select-dropdown-list').html(lis);
      if ($('.el-form-item.unit').find('.el-select-dropdown').is(":hidden")) {
        $('.el-form-item.unit').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//获得负责人
function getUnitData() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].unitList + "?" + _token + "&page_no=1&page_size=10",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      unitData = rsp.results;
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function getSalesOrderProjectCode() {
  var sales_order_code = $("#sales_order_code").val();
  AjaxClient.get({
    url: URLS['invalidCost'].getSalesOrderProjectCode + "?" + _token + "&sales_order_code=" + sales_order_code,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading)
      var _html = '';
      rsp.results.forEach(function (item, index) {
        var span = `<span class="el-checkbox__label">${item}</span>`;

        _html += `
            <li data-name="${encodeURI(item)}" class="el-muli-select-dropdown-item">${span}</li>
          `
      })
      $("#sales_order_project_code").parents(".el-select-dropdown-wrap").find(".el-muli-select-dropdown-list").html(_html);
    },
    fail: function () {
      layer.close(layerLoading);
      console.log('获取行项号失败');
    }
  }, this);
}

// 多选
function multiSelect() {
  var sales_order_code = $("#sales_order_code").val(),
    sales_order_project_code = $("#sales_order_project_code").text();
    AjaxClient.get({
      url: URLS['invalidCost'].getMaterialByProductionOrder + "?" + _token + '&sales_order_code=' + sales_order_code + '&sales_order_project_code=' + sales_order_project_code,
      dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = '';
      rsp.results.forEach(function (item, index) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;

        _html += `
            <li data-name="${encodeURI(item.name)}" data-item-no=${encodeURI(item.item_no)} class="el-muli-select-dropdown-item">${span}</li>
          `
      })
      $("#item_no").parents(".el-select-dropdown-wrap").find(".el-muli-select-dropdown-list").html(_html);
    }
  });
  // AjaxClient.get({
  //   url: URLS['invalidCost'].getMaterialByProductionOrder + "?" + _token + '&sales_order_code=' + sales_order_code + '&sales_order_project_code=' + sales_order_project_code,
  //   dataType: 'json',
  //   beforeSend: function () {
  //     layerLoading = LayerConfig('load');
  //   },
  //   success: function (rsp) {
  //     layer.close(layerLoading);
  //     rsp.results.forEach(function(item){
  //       itemNoStr+=`<span>[${item.item_no}]:${item.name}</span>`;
  //       item_no+=item.item_no+','
  //     })
  //     $("#productName").html(itemNoStr);
  //     $("#productName").attr('data-item-no',item_no)
  //   },
  //   fail: function (rsp) {
  //     dtd.reject(rsp);
  //   }
  // }, this);
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
      departmentData = rsp.results;
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
      statisticsDepartmentData = rsp.results;
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
      dtd.resolve(rsp);
      harmfulItemData = rsp.results;
      getHandleMethod();
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function getHandleMethod() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + 1 + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      dtd.resolve(rsp);
      handleMethodData = rsp.results;
      getExpiredItem();
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function getExpiredItem() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + 2 + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      dtd.resolve(rsp);
      expiredItemData = rsp.results;
      var id = getQueryString('id');
      if (id) {
        getInvalidOfferOne(id)
      } else {
        getInvalidCostIndex();
      }
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function getInvalidOfferOne(id) {
  AjaxClient.get({
    url: URLS['invalidCost'].getInvalidOfferOne + "?" + _token + '&id=' + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results) {
        getInvalidCostIndex(rsp.results);
      }
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
}

function createDepartmentHtml(departData) {
  var _html = '';
  departData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;
    _html += `
        <li data-id="${item.department_id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${span}</li>
      `
  })
  return _html;
}

function createStatisticsDepartmentHtml(departData) {
  var _html = '';
  departData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;
    _html += `
        <li data-id="${item.department_id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${span}</li>
      `
  })
  return _html;
}

function getInvalidCostIndex(data) {
  var flag=false,sales_order_code = '', sales_order_project_code = '', item_no = '', material='',bad_num = '', unit='',unit_id = '', problem_describe = '', harmful_item = '', handle_mode = '', invalid_item = '', handle_cost = '', duty_ascription = '', statistics_department = '';
  if(data){
    var { sales_order_code = '', sales_order_project_code = '', item_no = '', material='',bad_num = '', unit='',unit_id = '', problem_describe = '', harmful_item = '', handle_mode = '', invalid_item = '', handle_cost = '', duty_ascription = '', statistics_department = '' } = data;
  }
  var _html = '';
  var departmentHtml,statisticsDepartmentHtml, harmfulItemHtml = '', handleMethodHtml = '', expiredItemHtml = '';
  if (departmentData.length) {
    departmentHtml = createDepartmentHtml(departmentData);
  }
  if (statisticsDepartmentData.length) {
    statisticsDepartmentHtml=createStatisticsDepartmentHtml(statisticsDepartmentData);
  }
  if (harmfulItemData.length) {
    harmfulItemData.forEach(function (item) {
      harmfulItemHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (handleMethodData.length) {
    handleMethodData.forEach(function (item) {
      handleMethodHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (expiredItemData.length) {
    expiredItemData.forEach(function (item) {
      expiredItemHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.name}</li>`;
    });
  }
  if(data){
    flag=true;
  }

	if (handle_cost > 0.00) {
		str = `<input type="text" id="dealCost" class="el-input" placeholder='请输入处理费用'  value="${handle_cost}">`;
	} else {
		str = `<input type="text" id="dealCost" class="el-input" placeholder='请输入处理费用'  value="">`
	}


  _html = `<div class="work_order_text" style="height:50px;">
      <div class="el-form-item sales-order-code" style="width:100%;">
          <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
          <div class="el-select" style="width:100%;">
              <input type="text" id="sales_order_code" class="el-input" autocomplete="off" placeholder="请输入销售订单号" value="${sales_order_code}">
            </div>
            <div class="el-select-dropdown">
              <ul class="el-select-dropdown-list" style="max-width:940px;">
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
          <div class="el-form-item-div" style="min-width:180px !important;">
          <label class="el-form-item-label" style="width: 100px;">行项目号</label>
          <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select project-code">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="sales_order_project_code">${sales_order_project_code}</div>
                  </div>
                  <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                      </ul>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="work_order_text" style="height:120px;">
      <div class="el-form-item product-name" style="width:100%;">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: 100px;">物料名称</label>
              <div class="el-select-dropdown-wrap" style="width:80%;">
                  <div class="el-muli-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="item_no" style="min-height:100px;" data-item-no="${item_no}">${jsonToNameStr(material)}</div>
                  </div>
                  <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                          
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
        <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: 100px;">不良数量<span class="mustItem">*</span></label>
          <input type="number" id="poorNum" class="el-input" placeholder="请输入不良数量" value="${bad_num}">
        </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item unit" style="width:100%;">
          
          <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: 100px;">单位</label>
            <div class="el-select" style="width:100%;">
              <input type="text" id="unit_id" class="el-input" autocomplete="off" data-id="${unit_id}" placeholder="请输入单位" value="${unit}">
            </div>
            <div class="el-select-dropdown">
              <ul class="el-select-dropdown-list" style="max-width:940px;">
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
        <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: 100px;">问题描述<span class="mustItem">*</span></label>
          <input type="text" id="problemDesc" class="el-input" placeholder="请输入问题描述" value="${problem_describe}">
        </div>
      </div>
      </div>
      <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
          <div class="el-form-item-div" style="min-width:180px !important;">
          <label class="el-form-item-label" style="width: 100px;">不良项目<span class="mustItem">*</span></label>
          <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="harmful_item" data-id="${jsonToIdStr(harmful_item)}">${jsonToNameStr(harmful_item)}</div>
                  </div>
                  <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                          ${harmfulItemHtml}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
          <div class="el-form-item-div" style="min-width:180px !important;">
          <label class="el-form-item-label" style="width: 100px;">处理方式<span class="mustItem">*</span></label>
          <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="handle_method" data-id="${jsonToIdStr(handle_mode)}">${jsonToNameStr(handle_mode)}</div>
                  </div>
                  <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                          ${handleMethodHtml}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
      </div>
      <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">      
          <div class="el-form-item-div" style="min-width:180px !important;">
          <label class="el-form-item-label" style="width: 100px;">失效项目<span class="mustItem">*</span></label>
          <div class="el-select-dropdown-wrap">
                <div class="el-muli-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <div class="el-input" id="expired_item" data-id="${jsonToIdStr(invalid_item)}">${jsonToNameStr(invalid_item)}</div>
                </div>
                <div class="el-muli-select-dropdown">
                    <ul class="el-muli-select-dropdown-list">
                    ${expiredItemHtml}
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item" style="width:100%;">
        <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: 100px;">处理费用</label>
          ${str}
        </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item department" style="width:100%;">
          <div class="el-form-item-div" style="min-width:180px !important;">
          <label class="el-form-item-label" style="width: 100px;">责任归属<span class="mustItem">*</span></label>
          <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--" value="${jsonToNameStr(duty_ascription)}">
                      <input type="hidden" class="val_id" id="department" value="${jsonToIdStr(duty_ascription)}">
                  </div>
                  <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                          ${departmentHtml}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <div class="work_order_text" style="height:50px;">
      <div class="el-form-item department" style="width:100%;">
          <div class="el-form-item-div" style="min-width:180px !important;">
              <label class="el-form-item-label" style="width: 100px;">统计部门<span class="mustItem">*</span></label>
              <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" id="newWorkBench" class="el-input" placeholder="--请选择--" value="${jsonToNameStr(statistics_department)}">
                      <input type="hidden" class="val_id" id="statisticsDepartment" value="${jsonToIdStr(statistics_department)}">
                  </div>
                  <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list" style="height:100px;">
                        ${statisticsDepartmentHtml}                                   
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div class="el-form-item" style="padding-right: 10px ">
      <div class="el-form-item-div btn-group" style="justify-content:center;">
        <button type="button" class="el-button el-button--primary ${flag ? 'edit' : 'submit'}" style="margin-top: 30px !important; margin-bottom: 30px; width:280px;height:50px;font-size:1.8rem;">提交</button>
      </div>
    </div>`;
  $("#invalidCost_form").html(_html);
  $("#invalidCost_form").find('.el-select').each(function (item) {
    var width = $(this).width();
    var height = $(this).height();
    var offset = $(this).offset();
    $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33, left: offset.left });
  });
  $('#productName').select2();
  getUnitData();
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

function getSalesOrderCode(val) {
  AjaxClient.get({
    url: URLS['invalidCost'].getSalesOrderCode + "?" + _token + "&sales_order_code=" + val,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      salesOrderCodeData = rsp.results;
      createSalesOrderCode(val);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 })
    }
  }, this);
}


function createSalesOrderCode() {
  setTimeout(function () {
    var filterData = salesOrderCodeData;
    var lis = '';
    if (filterData.length > 0) {
      for (var i = 0; i < filterData.length; i++) {
        lis += `<li class="el-select-dropdown-item el-auto"><span>${filterData[i]}</span></li>`;
      }
    } else {
      lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
    }
    $('.el-form-item.sales-order-code').find('.el-select-dropdown-list').html(lis);
    if ($('.el-form-item.sales-order-code').find('.el-select-dropdown').is(":hidden")) {
      $('.el-form-item.sales-order-code').find('.el-select-dropdown').slideDown("200");
    }
  }, 1000);
}

function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    var name = e.commercial;
    return name.indexOf(type) > -1;
  });
}

function submitInvalidCost(id) {
  var data = {
    sales_order_code: $('#sales_order_code').val(),
    sales_order_project_code: $("#sales_order_project_code").text(),
    item_no: $('#item_no').attr('data-item-no'),
    bad_num: $('#poorNum').val(),
    unit_id: $('#unit_id').attr('data-id'),
    problem_describe: $('#problemDesc').val(),
    harmful_item: $('#harmful_item').attr('data-id'),
    handle_mode: $('#handle_method').attr('data-id'),
    invalid_item: $("#expired_item").attr('data-id'),
    handle_cost: $("#dealCost").val(),
    duty_ascription: $('#department').val(),
    statistics_department: $("#statisticsDepartment").val(),
    _token: TOKEN
  }

  if (is2) {
    data['push_type'] = 9;
  }

  AjaxClient.post({
    url: URLS['invalidCost'].addInvalidOffer,
    dataType: 'json',
    data: data,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results) {
        layer.msg('提报成功！',{ icon: 1, offset: '250px', time: 1500 })
        window.location.href='/QC/invalidCostList';
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function editInvalidCost() {
  var id = getQueryString('id');
  var data = {
    id:id,
    sales_order_code: $('#sales_order_code').val(),
    sales_order_project_code: $("#sales_order_project_code").text(),
    item_no: $('#item_no').attr('data-item-no'),
    bad_num: $('#poorNum').val(),
    unit_id: $('#unit_id').attr('data-id'),
    problem_describe: $('#problemDesc').val(),
    harmful_item: $('#harmful_item').attr('data-id'),
    handle_mode: $('#handle_method').attr('data-id'),
    invalid_item: $("#expired_item").attr('data-id'),
    handle_cost: $("#dealCost").val(),
    duty_ascription: $('#department').val(),
    statistics_department: $("#statisticsDepartment").val(),
    _token: TOKEN
  }

  if (is2) {
    data['push_type'] = 9;
  }
  AjaxClient.post({
    url: URLS['invalidCost'].editInvalidOffer,
    dataType: 'json',
    data: data,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results) {
        layer.msg('编辑成功！',{ icon: 1, offset: '250px', time: 1500 })

        window.location.href='/QC/invalidCostList';
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}
