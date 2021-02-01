var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 100,
  ajaxData = {},
  ids = [],
  showFlag = 0,
  itemIds = [],
  layerOffset,
  chooseId,
  unitData = [],
  disposeData = [
    {
      id: 1,
      name: '退货'
    },
    {
      id: 2,
      name: '让步接收'
    },
    {
      id: 3,
      name: '特采'
    }
  ],
  missItemData = [],
  missItemDetailData = [],
  missItemDetailData1 = [],
  missItemDetailData2 = [],
  departmentData = [],
  workShopData = [],
  messageItemData = [],
  sceneData = [
    {
      id: 1,
      name: '进料'
    }, {
      id: 2,
      name: '制程'
    }, {
      id: 3,
      name: '成品'
    }
  ],
  chooseArr = [];
$(function () {
  var check_code=getQueryString('check_code');
  var check_status=getQueryString('check_status');
  resetParam();
  getSearch();
  if(check_code){
    ajaxData.code=check_code;
    $('#order_id').val(check_code);
    if(check_status){
      $('.show-check-status .el-select-dropdown-item[data-id=' + check_status + ']').click();
      ajaxData.check_status=check_status;
    }
  }
  getChecks();
  bindEvent();
  $('#type_id').autocomplete({
    url: URLS['check'].templateList + "?" + _token,
    param: 'name'
  });

});
function getSearch() {
  $.when(getDepartment())
    .done(function (departmentrsp) {
      departmentData = departmentrsp.results;
    }).fail(function (departmentrsp) {
      console.log('获取失败');
    }).always(function () {
      layer.close(layerLoading);
    });
  $.when(getWorkShop())
    .done(function (workshoprsp) {
      workShopData = workshoprsp.results;
    }).fail(function (workshoprsp) {
      console.log('获取部门失败');
    }).always(function () {
      layer.close(layerLoading);
    });
  $.when(getMissItem())
    .done(function (missitemrsp) {
      missItemData = missitemrsp.results;
    }).fail(function (missitemrsp) {
      console.log('获取缺失项失败');
    }).always(function () {
      layer.close(layerLoading);
    });
};
function getDepartment() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['inspect'].getDepartment + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function getWorkShop() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['inspect'].getWorkShop + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
};

function getMissItem(val) {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
};

function getQualityResume(id) {
  AjaxClient.get({
    url: URLS['quality'].quality + '?' + _token + "&ids=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var data = rsp.results, _html = '';
      var ele = $(".quality_table").find(".table_tbody");
      if (data && data.length) {
        ele.html('');
        data.forEach(function (item, index) {
          _html += `<tr>
            <td>${item.material_code}(${item.check_code})</td>
            <td>
              <button data-id="${item.id}" class="button pop-button view"><a href=${item.type == 2 ? "/QC/viewComplaintById?id=" + item.id : "/QC/viewQualityResume?id=" + item.id} target="blank" style="color: #00a0e9;">查看</a></button>
            </td>          
          </tr> `;
        })
      }
      ele.append(_html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);

      LayerConfig('fail', '获取品质履历失败')
    }
  }, this);
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
      getChecks();
    }
  });
};

//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    material_name: '',
    material_code: '',
    check_type_code: '',
    factory_name: '',
    checker_code: '',
    start_time: '',
    end_time: '',
    start_check_time: '',
    end_check_time: '',
    LGFSB: '',
    LGPRO: '',
    VBELN: '',
    VBELP: '',
    result: '',
    NAME1: '',
    WMASN: '',
    EBELN: '',
    check_status: '',
    audit_status: ''
  };
}

//获取检验列表
function getChecks() {
  var urlLeft = '&check_resource=1';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  var url = URLS['check'].export + "?" + _token + urlLeft;
  $('#exportExcel').attr('href', url)
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['check'].select + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      ids = [];
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results);
      } else {
        noData('暂无数据', 19);
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
      }
      /**************************************  修改 start 7/23 ************************************** */
      /******** 添加 加急 ****** */
      // var flag = rsp.results;
      // for (let i = 0; i < flag.length; i++) {
      //   if (flag[i].flag == 0) {
      //     $('.em').text('急');
      //     $('.em').css('background', 'red');
      //   } else {
      //     $('.em').text(' ');
      //   }
      // }
      /**************************************  修改 end  ************************************** */
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      noData('获取物料列表失败，请刷新重试', 19);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}

//生成列表数据
function createHtml(ele, data) {
  var reg = new RegExp("([0]*)([1-9]+[0-9]+)", "g");
  var ics = 0;
  data.forEach(function (item, index) {
    var _html = `<span class="el-checkbox_input el-checkbox_input_check" id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span>`;
    ids.forEach(function (iitem) {
      if (iitem == item.id) {
        _html = `<span class="el-checkbox_input el-checkbox_input_check is-checked" id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span>`;
        ics++;
      }
    });
console.log(item);
    var tr = `
            <tr class="tritem" data-id="${item.id}" >
                <td class="left norwap">
		             ${_html}
                </td>
                <!-- 修改 添加是否加急 -->
                <td style="text-align:center;">
                  <span class="em" style="color:white;font-size:20px; color:  ${((item.istop == 1)) ? 'red' : ''}">${tansferNull(item.istop == 1 ? '急' : '')}</span>
                </td>
                <!-- end -->
                <td>${tansferNull(item.code)}</td>
                <td style="color: ${((item.sign == 'red') && (item.status == 0)) ? 'red' : ''}">${tansferNull(item.WMASN)}</td>              
                <td>${tansferNull(item.EBELN)}</td>
                <td>${tansferNull(item.EBELP)}</td>
                <td>${tansferNull(item.VBELN)}</td>
                <td>${tansferNull(item.VBELP)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td class="${item.haschange == 1 ? 'show-attr' : ''}" style="${item.haschange == 1 ? 'color:red;' : ''}" data-code="${item.material_code}" data-attr="${item.attr}">${tansferNull(item.materialName)}</td>
                <td>${tansferNull(item.LGFSB)}</td>
                <td>${tansferNull(item.NAME1)}</td>
                <td>${tansferNull(item.order_number)}</td>
                <td><input type="number" onkeyup="value=value.replace(/\\-/g,'')" data-id="${item.id}" class="number_val deal" value="${tansferNull(item.amount_of_inspection)}" style="border: none;color: #393939;font-size: 12px;"></td>
				<td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${item.ctime}</td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${item.check_time}</td>
                <td>${item.result == null ? '' : item.result == 0 ? '合格' : '不合格'}</td>
                <td>${tansferNull(item.card_id)}</td>
                <td>${tansferNull(item.check_type_code)}</td>
                <td class="right">
                    ${item.audit_status == 0 ? `<button data-id="${item.id}" class="button pop-button result_audit">审核</button>` : item.audit_status == 1 ? `<button data-id="${item.id}" class="button pop-button result_audit_back">反审</button>` : ''}
                    <a href="/Claim/addClaim?check_id=${item.id}"><button data-id="${item.id}" data-code="${tansferNull(item.material_code)}" class="button pop-button" data-ebeln="${item.EBELN}">索赔</button></a>
                    ${item.VBELN ? `<button class="button pop-button view attachment" data-id="${tansferNull(item.material_code)}" data-sale="${tansferNull(item.VBELN.replace(reg, "$2"))}" data-line="${tansferNull(item.VBELP)}">附件</button>` : ''}
                    ${item.status == 2 ? `<button data-id="${item.id}" class="button pop-button delete">已推送</button>` : `<button data-id="${item.id}" class="button pop-button sumbit">推送</button>`}
                    <button data-id="${item.id}" class="button pop-button check">检验</button>
                    ${item.status == 2 ?'':`<button data-id="${item.id}" class="button pop-button delete delete-code">删除</button>`}
                </td>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
  if (ics < data.length) {
    $('#check_all_select').removeClass('is-checked');
  } else {
    $('#check_all_select').addClass('is-checked');
  }
}

//生成下拉框数据
function selectHtml(fileData, parent_id) {
  var innerhtml, selectVal, parent_id;
  var lis = selecttreeHtml(fileData, parent_id);
  innerhtml = `<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="type_id" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            ${lis}
        </ul>
    </div>`;
  itemSelect = [];
  return innerhtml;
}
function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function createMissItem(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, missItemData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      $('.el-form-item.miss-items').find('.el-select-dropdown-list').html(lis);
      if ($('.el-form-item.miss-items').find('.el-select-dropdown').is(":hidden")) {
        $('.el-form-item.miss-items').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

function bindEvent() {
  //点击弹框内部关闭dropdown
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
  
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
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

  //弹窗取消
  // $('body').on('click', '.formIQCCheck:not(".disabled") .cancle', function (e) {
  //   e.stopPropagation();
  //   layer.close(layerModal);
  // });

  $('body').on('blur', '.number_val', function (e) {
    e.stopPropagation();
    updateAmountInspection($(this).attr('data-id'), $(this).val())
  });

  $('body').on('click', '.show-attr', function (e) {
    e.stopPropagation();
    var attr = $(this).attr('data-attr'),
      material_code = $(this).attr('data-code');
    var title = '物料属性';
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
      content: `<form class="attachmentForm formModal" id="attr_form">      
      <div class="table table_page">
          <div id="pagenation" class="pagenation"></div>
          <table id="table_pic_table" class="sticky uniquetable commontable">
              <thead>
                  <tr>
                      <th>物料编码</th>
                      <th style="width:400px;" class="center">规格型号</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">
                  <tr>
                      <td class="nowrap">${material_code}</td>
                      <td style="width:400px;text-align: center;word-wrap:break-word;word-break:break-all;">${attr}</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </form>`,
      success: function (layero, index) {

      },
      end: function () {

      }
    })
  });

  //排序
  $('.sort-caret').on('click', function (e) {
    e.stopPropagation();
    $('.el-sort').removeClass('ascending descending');
    if ($(this).hasClass('ascending')) {
      $(this).parents('.el-sort').addClass('ascending')
    } else {
      $(this).parents('.el-sort').addClass('descending')
    }
    $(this).attr('data-key');
    ajaxData.order = $(this).attr('data-sort');
    ajaxData.sort = $(this).attr('data-key');
    getChecks();
  });

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
    if (!$(this).hasClass('check_status')) {
      var scroll = $(document).scrollTop();
      var width = $(this).width();
      var offset = $(this).offset();
      $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33 - layerOffset.top, left: offset.left - layerOffset.left });
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
      $(this).siblings('.el-muli-select-dropdown').width(width).css({ top: offset.top + 33 - layerOffset.top, left: offset.left - layerOffset.left });
    }
  });

  //点击单选下拉框选项
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
    // $(this).parents('.el-muli-select-dropdown').hide().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //搜索物料属性
  $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    var $itemJP = $('#type_id');
    var type_code = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
      $itemJP.data('inputItem').name == $itemJP.val().trim().replace(/\（.*?）/g, "") ? $itemJP.data('inputItem').code : '';

    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });

    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        code: parentForm.find('#order_id').val().trim(),
        material_name: parentForm.find('#material_id').val().trim(),
        material_code: parentForm.find('#material_code').val().trim(),
        factory_name: parentForm.find('#factory_name').val().trim(),
        checker_code: parentForm.find('#checker_code').val().trim(),
        LGPRO: parentForm.find('#LGPRO').val().trim(),
        VBELN: parentForm.find('#VBELN').val().trim(),
        VBELP: parentForm.find('#VBELP').val().trim(),
        result: parentForm.find('#qualify_status').val().trim(),
        NAME1: parentForm.find('#NAME').val().trim(),
        start_time: parentForm.find('#start_time').val(),
        end_time: parentForm.find('#end_time').val(),
        start_check_time: parentForm.find('#start_check_time').val(),
        end_check_time: parentForm.find('#end_check_time').val(),
        LGFSB: parentForm.find('#LGFSB').val().trim(),
        WMASN: parentForm.find('#WMASN').val().trim(),
        check_status: parentForm.find('#check_status').val().trim(),
        audit_status: parentForm.find('#repairstatus').val().trim(),
        EBELN: parentForm.find('#EBELN').val().trim(),
        check_type_code: type_code,
      };
      getChecks();
    }
  });

  //树形表格展开收缩
  $('body').on('click', '.treeNode .itemIcon', function () {
    if ($(this).parents('.treeNode').hasClass('collasped')) {
      $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
      showChildren($(this).parents('.treeNode').attr("data-id"));
    } else {
      $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
      hideChildren($(this).parents('.treeNode').attr("data-id"));
    }
  });

  //重置搜索框值
  $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#order_id').val('');
    parentForm.find('#material_id').val('');
    parentForm.find('#material_code').val('');
    parentForm.find('#factory_name').val('');
    parentForm.find('#checker_code').val('');
    parentForm.find('#LGFSB').val('');
    parentForm.find('#LGPRO').val('');
    parentForm.find('#VBELN').val(''),
    parentForm.find('#VBELP').val(''),
    parentForm.find('#NAME').val('');
    parentForm.find('#start_check_time').val('');
    parentForm.find('#end_check_time').val('');
    parentForm.find('#start_time').val('');
    parentForm.find('#end_time').val('');
    parentForm.find('#WMASN').val('');
    parentForm.find('#EBELN').val('');
    parentForm.find('#qualify_status').val('').siblings('.el-input').val('--请选择--'),
    parentForm.find('#type_id').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#check_status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#repairstatus').val('').siblings('.el-input').val('--请选择--');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getChecks();
  });

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

  $('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
    var id = $(this).attr("id");
    if ($(this).hasClass('is-checked')) {
      if (ids.indexOf(id) == -1) {
        ids.push(id);
      }
    } else {
      var index = ids.indexOf(id);
      ids.splice(index, 1);
    }
  });

  //列表页全选
  $('body').on('click', '#check_all_select', function () {
    $(this).toggleClass('is-checked');
    if ($(this).hasClass('is-checked')) {
      $('table tr .el-checkbox_input_check').each(function () {
        if (!$(this).hasClass('is-checked')) {
          var id = $(this).attr("id");
          $(this).addClass('is-checked');
          if (ids.indexOf(id) == -1) {
            ids.push(id);
          }
        }
      })
    } else {
      $('table tr .el-checkbox_input_check').each(function () {
        if ($(this).hasClass('is-checked')) {
          $(this).removeClass('is-checked');
          var id = $(this).attr("id");
          var index = ids.indexOf(id);
          if (index != -1) {
            ids.splice(index, 1);
          }
        }
      })
    }
  });

  $('body').on('click', '.el-checkbox_input_items', function (e) {
    $(this).toggleClass('is-checked');
    if ($(this).parent().parent().hasClass('expand')) {
      itemIds = [];
      if ($(this).hasClass("is-checked")) {
        $(this).parent().parent().siblings("tr").each(function (k, v) {
          if (!$(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            $(v).find(".el-checkbox_input_items").addClass('is-checked');
          }
        })
        $('#check_item .table_tbody').find('tr').each(function (k, v) {
          var itemId = $(v).find(".el-checkbox_input_items").attr("id");
          if ($(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            if (itemIds.indexOf(itemId) == -1) {
              itemIds.push(itemId);
            }
          }
        })
      } else {
        $(this).parent().parent().siblings("tr").each(function (k, v) {
          if ($(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            $(v).find(".el-checkbox_input_items").removeClass('is-checked');
          }
        })
      }
    } else {
      var itemId = $(this).attr("id");
      if ($(this).hasClass('is-checked')) {
        if (itemIds.indexOf(itemId) == -1) {
          itemIds.push(itemId);
        }
      } else {
        var index = itemIds.indexOf(itemId);
        itemIds.splice(index, 1);
      }
    }

  });

  $('body').on('click', '.missing_item_relational .el-muli-select-dropdown-item', function (e) {
    e.stopPropagation();
    var missItemId = $("#dispose_val").attr('data-id');
    getMissingItem(missItemId);
  })

  //输入框的相关事件
  $('body').on('focus', '#dispose_val:not([readonly])', function () {
    if ($(this).attr('id') == '') {
      var that = $(this);
      createMissItem(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else {
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  }).on('blur', '#dispose_val:not([readonly])', function () {
    var name = $(this).attr('id'),
      id = $('itemId').val();

  }).on('input', '#dispose_val', function () {
    var that = $(this);
    createMissItem(that);
  });

  $('.button_check').on('click', function () {
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要检验的检验单！', { icon: 5, offset: '250px', time: 1500 });
    } else {
      layer.confirm('将执行批量检验操作?', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        checkResult('more', ids);
      })
    }
  });

  $('.table_tbody').on('click', '.check', function () {
    checkResult('single', $(this).attr('data-id'));
  });

  $('body').on('click', '#addIQCCheck_from:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addIQCCheck_from');
      var anomalies = $('#anomalies').hasClass('is-checked') ? 2 : 1;
      $(this).addClass('is-disabled');
      parentForm.addClass('disabled');
      var id = parentForm.find('#itemId').val();
      var missItemRelationalId1 = $('#missItemRelationalId1').attr('data-id'),
        missItemRelationalId2 = $('#missItemRelationalId2').attr('data-id'),
        missingItemRelationalId = $('#dispose_val').attr('data-id');
      var mIRString = getSumString(missItemRelationalId1, missItemRelationalId2, missingItemRelationalId);
      var missItem1 = $('#missItem1').attr('data-id'),
        missItem2 = $('#missItem2').attr('data-id'),
        missingItemsId = $('#missing_items_id').attr('data-id');
      var mIString = getSumString(missItem1, missItem2, missingItemsId);
      var mIRID = unique(mIRString.split(','));
      var mIID = unique(mIString.split(','));
      var check_result = parentForm.find("input[name='check_result']:checked").val(),
        dispose = $('#dispose').val() ? $('#dispose').val() : '',
        question_description = $('#question_description').val() ? $('#question_description').val() : '',
        deadly = $('#deadly').val() ? $('#deadly').val() : '',
        seriousness = $('#seriousness').val() ? $('#seriousness').val() : '',
        slight = $('#slight').val() ? $('#slight').val() : '',
        dispose_ideas = $('#dispose_ideas').val() ? $('#dispose_ideas').val() : '',
        missing_items = $('#missing_items').val() ? $('#missing_items').val() : '',
        scene = $('#scene').val() ? $('#scene').val() : '',
        department_id = $('#department').attr("data-id"),
        workshop_id = $('#workShop').attr("data-id"),
        missing_item_relational_id = $('#dispose_val').attr('data-id') ? $("#dispose_val").attr('data-id') : '',
        missing_items_id = $('#missing_items_id').attr("data-id"),
        grammage1 = $('#grammage1').val() ? $('#grammage1').val() : $('#grammage11').val(),
        grammage2 = $('#grammage2').val() ? $('#grammage2').val() : $('#grammage22').val(),
        grammage3 = $('#grammage3').val() ? $('#grammage3').val() : $('#grammage33').val(),
        gatewidth1 = $('#gatewidth1').val() ? $('#gatewidth1').val() : $('#gatewidth11').val(),
        gatewidth2 = $('#gatewidth2').val() ? $('#gatewidth2').val() : $('#gatewidth22').val(),
        gatewidth3 = $('#gatewidth3').val() ? $('#gatewidth3').val() : $('#gatewidth33').val(),
        dimensions1 = $('#dimensions1').val() ? $('#dimensions1').val() : $('#dimensions11').val(),
        dimensions2 = $('#dimensions2').val() ? $('#dimensions2').val() : $('#dimensions22').val(),
        dimensions3 = $('#dimensions3').val() ? $('#dimensions3').val() : $('#dimensions33').val();
      var $unit = $('#unit_now');
      var flag = $(this).attr('data-flag');
      var unit_id = $unit.data('inputItem') == undefined || $unit.data('inputItem') == '' ? '' :
        $unit.data('inputItem').commercial == $unit.val().replace(/\（.*?）/g, "").trim() ? $unit.data('inputItem').id : '';
      checkSubmit({
        check_result: check_result,
        dispose: dispose,
        unit_id: unit_id,
        question_description: question_description,
        deadly: deadly,
        seriousness: seriousness,
        slight: slight,
        dispose_ideas: dispose_ideas,
        missing_items: missing_items,
        scene: scene,
        department_id: department_id,
        workshop_id: workshop_id,
        missing_item_relational_id: mIRID.join(','),
        missing_items_id: mIID.join(','),
        grammage1: grammage1,
        grammage2: grammage2,
        grammage3: grammage3,
        gatewidth1: gatewidth1,
        gatewidth2: gatewidth2,
        gatewidth3: gatewidth3,
        dimensions1: dimensions1,
        dimensions2: dimensions2,
        dimensions3: dimensions3,
        anomalies: anomalies,
        _token: TOKEN
      }, flag, id);
    }
  });

  $('body').on('click', '#addBindTemplate_from:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addBindTemplate_from');
      $(this).addClass('is-disabled');
      parentForm.addClass('disabled');
      var id = parentForm.find("#id").val();
      var $itemJP = $('#template');
      var template = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
        $itemJP.data('inputItem').name == $itemJP.val().trim().replace(/\（.*?）/g, "") ? $itemJP.data('inputItem').id : '';
      bindTemplate({
        check_id: id,
        check_type: template,
        _token: TOKEN
      });
    }
  });

  //批量推送
  $('body').on('click', '.button_batch_send', function (e) {
    e.stopPropagation();
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要推送的检验单！', { icon: 5, offset: '250px', time: 1500 });
    } else {
      layer.confirm('将执行批量推送操作?', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        batchSend(ids);
      });
    }
  });

  //推送
  $('body').on('click', '.sumbit', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行推送操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitCheck(id);
    });
  });

  //审核操作
  $('body').on('click', '.result_audit', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行审核操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitAudit(id, 'one');
    });
  });

  //批量审核
  $('body').on('click', '.button_audit', function (e) {
    e.stopPropagation();
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要审核的检验单！', { icon: 5, offset: '250px', time: 1500 });
    } else {
      layer.confirm('将执行批量审核操作?', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        sumbitAudit(ids, 'more');
      })
    }
  });

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_time_input',
      max: max,
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
      max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#start_check_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_check_time_input').text() ? $('#end_check_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_check_time_input',
      max: max,
      type: 'datetime',
      show: true,
      closeStop: '#start_check_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('#end_check_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var min = $('#start_check_time_input').text() ? $('#start_check_time_input').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#end_check_time_input',
      min: min,
      max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_check_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  //反审操作
  $('body').on('click', '.result_audit_back', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行反审操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitAuditBack(id, "one");
    });
  });

  //批量反审操作
  $('body').on('click', '.button_audit_back', function (e) {
    e.stopPropagation();
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要反审的检验单！', { icon: 5, offset: '250px', time: 1500 });
    } else {
      layer.confirm('将执行批量反审操作?', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        sumbitAuditBack(ids, 'more');
      })
    }
  });

  $('body').on('click', '.attachment', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    var sale = $(this).attr("data-sale");
    var line = $(this).attr("data-line");
    if (line.length < 6) {
      line = (Number(line) / Math.pow(10, 6)).toFixed(6).substr(2)
    }
    getMaterial(id, sale, line);
  });

  //弹窗取消
  $('body').on('click', '.cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  //图片放大
  $('body').on('click', '.pic-img', function () {
    var imgList, current;
    if ($(this).hasClass('pic-list-img')) {
      imgList = $(this).parents('ul').find('.pic-li');
      current = $(this).parents('.pic-li').attr('data-id');
    } else {
      imgList = $(this);
      current = $(this).attr('data-id');
    }
    showBigImg(imgList, current);
  });
  
  //提交索赔单
  $('body').on('click', '#claim_form .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#claim_form');
      $(this).addClass('is-disabled');
      parentForm.addClass('disabled');
      var check_id = parentForm.find("#itemId").val(),
        MATNR = parentForm.find("#MATNR").val(),
        MATNR_qty = parentForm.find("#MATNR_qty").val(),
        DEFECT_SUM = parentForm.find("#DEFECT_SUM").val(),
        RELATIVE_ITEM_CODE = parentForm.find("#RELATIVE_ITEM_CODE").val(),
        RELATIVE_ITEM_SUM = parentForm.find("#RELATIVE_ITEM_SUM").val(),
        EBELN = parentForm.find("#EBELN").val(),
        DEFECT_DESC = parentForm.find("#DEFECT_DESC").val(),
        claimant = parentForm.find("#claimant").attr('data-id'),
        responsibleOrganization = parentForm.find("#responsibleOrganization").val();
      submitClaim({
        check_id: check_id,
        items: JSON.stringify([{
          id: '',
          MATNR: MATNR,
          EBELN: EBELN,
          MATNR_qty: MATNR_qty,
          DEFECT_SUM: DEFECT_SUM,
          DEFECT_DESC: DEFECT_DESC,
          RELATIVE_ITEM_CODE: RELATIVE_ITEM_CODE,
          RELATIVE_ITEM_SUM: RELATIVE_ITEM_SUM,
          responsibleOrganization: responsibleOrganization,
          key_persons: claimant
        }]),
        _token: TOKEN
      });
    }
  });

  //输入框的相关事件
  $('body').on('focus', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'missItemRelationalId1') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem1') {
      var that = $(this);
      createMissItemsHtml(that);
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    } else if ($(this).attr('id') == 'missItemRelationalId2') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem2') {
      var that = $(this);
      createMissItemsHtml(that, 'missItem2');
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
    if ($(this).attr('id') == 'missItemRelationalId1') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem1') {
      var that = $(this);
      createMissItemsHtml(that);
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    } else if ($(this).attr('id') == 'missItemRelationalId2') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem2') {
      var that = $(this);
      createMissItemsHtml(that, 'missItem2');
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  });

  //模糊搜索下拉列表项点击不良项目
  $('body').on('click', '.relational-miss-item .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
      getMissingItems(idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
      getMissingItems(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索下拉列表项点击不良项目1
  $('body').on('click', '.relational-miss-item1 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
      getMissingItemsOne(idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
      getMissingItemsOne(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索下拉列表项点击事件
  $('body').on('click', '.miss-item1 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索不良细分2点击事件
  $('body').on('click', '.miss-item2 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //删除单子
  $('body').on('click', '.delete-code', function (e) {
    var id = $(this).attr('data-id');
    e.stopPropagation;
    layer.confirm('确定删除检验单?', {
      icon: 3, title: '提示', offset: '250px', end: function () {

      }
    }, function (index) {
      layer.close(index);
      // var id =$(this).attr('data-id');
      AjaxClient.post({
        url: URLS['check'].delete + "?_token=" + TOKEN + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          LayerConfig('success', '删除成功');
          layer.close(layerLoading);
          getChecks();
        },
        fail: function (rsp) {
          LayerConfig('fail', rsp.message);
          layer.close(layerLoading);
        }
      })
    });
  })
};

function fn1(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

//创建不良项目下拉框
function createRelationalMissItems(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, missItemData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      that.parents('.el-form-item').find('.el-select-dropdown-list').html(lis);
      if (that.parents('.el-form-item').find('.el-select-dropdown').is(":hidden")) {
        that.parents('.el-form-item').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//模糊搜索不良细分下拉框
function createMissItemsHtml(that, value) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = [];
      if (value) {
        filterData = getFilterData(val, missItemDetailData2);
      } else {
        filterData = getFilterData(val, missItemDetailData1);
      }
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      that.parents('.el-form-item').find('.el-select-dropdown-list').html(lis);
      if (that.parents('.el-form-item').find('.el-select-dropdown').is(":hidden")) {
        that.parents('.el-form-item').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//点击不合格类型的不良项目调用不良细分方法
function getMissingItem(id) {
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = '';
      var ele = $(".miss-items").find(".el-muli-select-dropdown-list")
      ele.html('');
      rsp.results.forEach(function (item) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;
        _html += `
          <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
        `
      })
      ele.html(_html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

//获取模糊搜索不良细分数据
function getMissingItems(id) {
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      missItemDetailData1 = rsp.results;
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

//点击不良项目调用不良细分
function getMissingItemsOne(id) {
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      missItemDetailData2 = rsp.results;
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

function getMaterial(id, sale, line) {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['check'].CareLabel + "?" + _token + "&material_code=" + id + "&sale_order_code=" + sale + "&line_project_code=" + line,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.results) {
        showAttachmentModal(rsp.results, id);
      } else {
        LayerConfig('fail', '获取附件失败!');
      }
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取附件失败!');
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function showAttachmentModal(formData) {
  var title = '附件';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: '1000px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
      <div class="table table_page">
          <div id="pagenation" class="pagenation"></div>
          <table id="table_pic_table" class="sticky uniquetable commontable">
              <thead>
                  <tr>
                      <th>物料编码</th>
                      <th class="center">规格型号</th>
                      <th class="center">缩略图</th>
                      <th class="center">版本号</th>
                      <th class="center">描述</th>
                      <th class="center">创建时间</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">
                  <tr>
                      <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </form>`,
    success: function (layero, index) {
      layerEle = layero;
      createAttachmentTable(formData);
      getLayerSelectPosition($(layero));
    },
    end: function () {

    }
  });
}

function createAttachmentTable(data) {
  $('#attachment_form .table_tbody').html('');
  if (data.length) {
    data.forEach(function (item, index) {
      if (item.image_path != null) {
        var mhtml = '';
        var str = item.image_path.substring(item.image_path.indexOf('.') + 1, item.image_path.length), _html = '';
        if (str == 'jpg' || str == 'png' || str == 'jpeg' || str == 'gif') {
          _html = `<img width="60px;" height="60px;" data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}" class="pic-img" width="80" height="40" src="${window.storage}${item.image_path}"/>`;
        } else {
          _html = `<a href="${window.storage}${item.image_path}" target="view_window"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
        }
        if (item.material_attributes) {
          item.material_attributes.forEach(function (mitem, index) {
            mhtml += `<span>${mitem.name}:${mitem.value}/</span>`
          })
        }
        var tr = `
              <tr class="tritem" data-id="${item.drawing_id}">
                  <td><div style="width: 100px;word-break: break-all;white-space: normal;word-wrap: break-word;">${tansferNull(item.material_code)}</div></td>
                  <td style="width:240px;text-overflow: ellipsis;">${mhtml}</td>
                  <td class="center">${_html}</td>
                  <td class="center">${tansferNull(item.version_code)}</td>
                  <td class="center">${tansferNull(item.remark)}</td>
                  <td class="center">${dateFormat(tansferNull(item.ctime), 'Y-m-d H:i:s')}</td>
                  
              </tr>`;
        $('#attachment_form .table_tbody').append(tr);
        $('#attachment_form .table_tbody').find('tr:last-child').data('picItem', item);
      }
    });
  } else {
    var tr = `<tr>
              <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
          </tr>`;
    $('#attachment_form .table_tbody').append(tr);
  }
}

// 时间戳转换成指定格式日期
// 'Y年m月d日 H时i分')
function dateFormat(timestamp, formats) {
  // formats格式包括
  // 1. Y-m-d
  // 2. Y-m-d H:i:s
  // 3. Y年m月d日
  // 4. Y年m月d日 H时i分
  formats = formats || 'Y-m-d';
  var zero = function (value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };
  var myDate = timestamp ? new Date(timestamp * 1000) : new Date();
  var year = myDate.getFullYear();
  var month = zero(myDate.getMonth() + 1);
  var day = zero(myDate.getDate());
  var hour = zero(myDate.getHours());
  var minite = zero(myDate.getMinutes());
  var second = zero(myDate.getSeconds());
  return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
    return ({
      Y: year,
      m: month,
      d: day,
      H: hour,
      i: minite,
      s: second
    })[matches];
  });
};

function updateAmountInspection(id, value) {
  AjaxClient.post({
    url: URLS['check'].updateAmountInspection,
    dataType: 'json',
    data: { 'check_id': id, 'amount_of_inspection': value, _token: TOKEN },
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getChecks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      getChecks();
    }
  }, this);
}

//查询索赔单模态框
function addClaim(id, code, ebeln) {
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
                <input type="hidden" id="itemId" value="${id}"> 
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">物料号<span class="mustItem">*</span></label>
                    <input type="text" id="MATNR" data-name="物料号" class="el-input" readonly placeholder="请输入物料号" value="${code}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">采购凭证编号<span class="mustItem">*</span></label>
                    <input type="text" id="EBELN" data-name="采购凭证编号" class="el-input" placeholder="请输入采购凭证编号" value="${ebeln}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div claimant" style="min-width:180px !important;">
                  <label class="el-form-item-label" style="width: 150px;">审核人<span class="mustItem">*</span></label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-muli-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="claimant"></div>
                    </div>
                    <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                      </ul>
                    </div>
                  </div>
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">责任单位<span class="mustItem">*</span></label>
                    <input type="text" id="responsibleOrganization" data-name="责任单位" class="el-input" placeholder="请输入责任单位" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">数量<span class="mustItem">*</span></label>
                    <input type="number" id="MATNR_qty" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">缺陷数量<span class="mustItem">*</span></label>
                    <input type="number" id="DEFECT_SUM" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="缺陷数量" class="el-input" placeholder="请输入缺陷数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料号<span class="mustItem">*</span></label>
                    <input type="text" id="RELATIVE_ITEM_CODE" data-name="连带物料号" class="el-input" placeholder="请输入连带物料号" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料数量<span class="mustItem">*</span></label>
                    <input type="number" id="RELATIVE_ITEM_SUM" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入连带物料数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">问题描述<span class="mustItem">*</span></label>
                    <textarea type="textarea" maxlength="500" id="DEFECT_DESC" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字符"></textarea>                 </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle">取消</button>
                    <button type="button" class="el-button el-button--primary submit">确定</button>
                </div>
             </div>
        </form>`,
    success: function (layero, index) {
      layerEle = layero;
      AjaxClient.get({
        url: URLS['check'].list + "?" + _token + '&page_no=1&page_size=100',
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          var claimant = rsp.results, claimHtml = '';
          if (claimant.length) {
            claimant.forEach(function (item) {
              claimHtml += `<li data-id="${item.admin_id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.cn_name}</li>`;
            });
          }
          $(".claimant").find('.el-muli-select-dropdown-list').html(claimHtml);
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          if (rsp && rsp.message != undefined && rsp.message != null) {
            LayerConfig('fail', rsp.message);
          }
        }
      })
    },
    end: function () {

    }
  });
}

function sumbitCheck(id) {
  AjaxClientSap.get({
    url: URLS['check'].pushInspectOrder + "?" + _token + "&check_id=" + id,
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
        //   ids=[];
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (typeof (rsp.DATA) != "undefined") {
        layer.confirm("SAP推送失败！错误日志为：" + reconvert(JSON.stringify(rsp.DATA.RESPONSE.SUBRETURNINFO)), {
          icon: 5, title: '提示', offset: '250px', end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      } else {
        layer.confirm("推送失败！错误日志为：" + rsp.RETURNINFO, {
          icon: 5, title: '提示', offset: '250px', end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      }
    }
  }, this);
}

function batchSend(ids) {
  AjaxClientSap.get({
    url: URLS['check'].batchSend + "?" + _token + "&check_id=" + ids,
    dataType: 'json',
    timeout: 60000,
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
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (typeof (rsp.DATA) != "undefined") {
        layer.confirm("SAP推送失败！错误日志为：" + reconvert(JSON.stringify(rsp.DATA.RESPONSE.SUBRETURNINFO)), {
          icon: 5, title: '提示', offset: '250px', end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      } else {
        layer.confirm("推送失败！错误日志为：" + rsp.message, {
          icon: 5, title: '提示', offset: '250px', end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      }
    }
  }, this);
}
function reconvert(str) {
  str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
    return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
  });
  str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
  });
  str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
  });
  return str;
}
//审核
function sumbitAudit(id, flag) {
  var data = [];
  if (flag == 'one') {
    data = id;
  } else {
    data = id;
  }
  AjaxClient.post({
    url: URLS['check'].audit,
    data: {
      ids: data,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('审核成功！', {
        icon: 1, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        if (flag == 'one') {
          sumbitCheck(id);
        }
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.confirm(rsp.message, {
        icon: 5, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    }
  }, this);
}
//反审
function sumbitAuditBack(id, flag) {
  var data = [];
  if (flag == 'one') {
    data = id;
  } else {
    data = id;
  }
  AjaxClient.post({
    url: URLS['check'].auditBack,
    data: {
      ids: data,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('反审成功！', {
        icon: 1, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.confirm(rsp.message, {
        icon: 5, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    }
  }, this);
}

function bindTemplate(data) {
  AjaxClient.post({
    url: URLS['check'].selectTemplate,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getChecks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#addBindTemplate_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
    }
  }, this);
}
function submitClaim(data) {
  AjaxClient.post({
    url: URLS['check'].storeQcClaim,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      if (rsp.results.RESPONSE_STATUS == 'SUCCESSED') {
        layer.confirm('索赔成功', {
          icon: 1, title: '提示', offset: '250px', end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      } else {
        LayerConfig('fail', '索赔失败！');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#claim_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

    }
  }, this);
}
function bindTemplateModal(id, data) {
  var labelWidth = 100,
    btnShow = 'btnShow',
    title = '绑定模板',
    textareaplaceholder = '',
    readonly = '',
    noEdit = '';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    content: `<form class="formModal formBindTemplate" id="addBindTemplate_from" >
            <input type="hidden" id="id" value="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">模板</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" id="template" class="el-input" autocomplete="off" placeholder="模板" value="">
                    </div>
                </div>
            </div>

            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
        </form>` ,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));
      $('#template').autocomplete({
        url: URLS['check'].templateList + "?" + _token,
        param: 'name'
      });
      $('#template').each(function (item) {
        var width = $(this).parent().width();
        $(this).siblings('.el-select-dropdown').width(width);
      });
      if (data.name) {
        $('#template').val(data.name + '（' + data.code + '）').data('inputItem', data).blur();
      }

    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });
}

function checkResult(flag, id) {
  var data = []
  if (flag == 'single') {
    data = id
  } else {
    data = id
  }
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['template'].select + "?" + _token + "&ids=" + data.toString(),
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results.template && rsp.results.template.length) {

        Modal(flag, rsp.results, data);
        dtd.resolve(rsp);
      } else {
        LayerConfig('fail', '暂无模板！');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp.message) {
        LayerConfig('fail', rsp.message);
      }
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

//查看和添加和编辑模态框
function Modal(flag, checkItems, id) {
  var { result = '', dispose = '', workshop_id = '', department_id = '', missing_items = '', missing_items_id = '', dispose_ideas = '', unit = '', unit_text = '', commercial = '', question_description = '', scene = '', missing_item_relational_id = '', deadly = '', seriousness = '', slight = '', grammage1 = '', grammage2 = '', grammage3 = '', gatewidth1 = '', gatewidth2 = '', gatewidth3 = '', dimensions1 = '', dimensions2 = '', dimensions3 = '',is_sureabnormal='' } = {};
  if (flag == 'single') {
    if (checkItems.check_res) {
      ({ result='', anomalies='', dispose='', workshop_id = '', department_id='', missing_items='', missing_items_id='', dispose_ideas='', unit='', unit_text='', commercial='', question_description='', scene='', missing_item_relational_id='', deadly='', seriousness='', slight='', grammage1='', grammage2='', grammage3='', gatewidth1='', gatewidth2='', gatewidth3='', dimensions1='', dimensions2='', dimensions3='', result='', is_sureabnormal='' } = checkItems.check_res);
    }
  } else {
    if (checkItems.check_res) {
      ({ result='', anomalies='', dispose='', workshop_id = '', department_id='', missing_items='', missing_items_id='', dispose_ideas='', unit='', unit_text='', commercial='', question_description='', scene='', missing_item_relational_id='', deadly='', seriousness='', slight='', grammage1='', grammage2='', grammage3='', gatewidth1='', gatewidth2='', gatewidth3='', dimensions1='', dimensions2='', dimensions3='', result='', is_sureabnormal='' } = checkItems.check_res);
    }
  }
  var labelWidth = 100,
    btnShow = 'btnShow',
    title = 'IQC质检',
    disposeHtml = '',
    departmentHtml = '',
    workShopHtml = '',
    sceneHtml = '',
    result_true = '',
    result_flase = '',
    dispose_val = '--请选择--',
    workshop_val = '--请选择--',
    department_val = '--请选择--',
    scene_val = '--请选择--',
    noEdit = '',
    missItemHtml = '',
    missItemDetailHtml = '',
    missing_detail_item_val = '',
    missing_item_val = '';
  if (disposeData.length) {
    disposeData.forEach(function (item) {
      disposeHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (departmentData.length) {
    departmentHtml = muliDepartment(departmentData);
  }
  if (workShopData.length) {
    workShopHtml = muliWorkShop(workShopData);
  }
  if (sceneData.length) {
    sceneData.forEach(function (item) {
      sceneHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (missItemData.length) {
    missItemData.forEach(function (item) {
      missItemHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (result !== '') {
    if (result == 0) {
      result_true = 'checked="checked"'
    } else if (result == 1) {
      result_flase = 'checked="checked"'
    }
  }
  if (dispose) {
    disposeData.forEach(function (item) {
      if (item.id == dispose) {
        dispose_val = item.name;
      }
    })
  }
  if (department_id) {
    var departmentArr = [], department_val = '';
    if (String(department_id).indexOf(',') != -1) {
      departmentArr = department_id.split(',')
    } else {
      departmentArr.push(department_id)
    }
    departmentData.forEach(function (item) {
      departmentArr.forEach(function (ditem) {
        if (item.id == Number(ditem)) {
          department_val += item.name + ','
        }
      })
    })
  }
  if (workshop_id) {
    var workshopArr = workshop_id.split(','), workshop_val = '';
    workShopData.forEach(function (item) {
      workshopArr.forEach(function (witem) {
        if (item.id == Number(witem)) {
          workshop_val += item.name + ','
        }
      })
    })
  }
  if (missing_item_relational_id) {
    var missingItemArr = missing_item_relational_id.split(',');
    missItemData.forEach(function (item) {
      missingItemArr.forEach(function (mitem) {
        if (item.id == Number(mitem)) {
          missing_item_val += item.name + ',';
        }
      })
    })
  }
  if (scene) {
    sceneData.forEach(function (item) {
      if (item.id == scene) {
        scene_val = item.name;
      }
    })
  }
  var wwidth = $(window).width() < 1050 ? $(window).width() - 80 : 1000;
    wheight = $(window).width() < 1050 ? $(window).height() - 80 : 600;
    mwidth = wwidth + 'px',
    mheight = wheight + 'px';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '50px',
    area: [mwidth, mheight],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    moveOut: true,
    move: '.layui-layer-title',
    content: `<form class="formModal formIQCCheck" id="addIQCCheck_from" data-flag="${flag}">
                <input type="hidden" id = "itemId" value = "${id}">
                ${is_sureabnormal == 0 ? `<span class="el-checkbox_input el-checkbox_input_items ${anomalies == 2 ? 'is-checked' : ''}"  style="vertical-align:middle;margin-left:15px;"  id="anomalies">
                    <span class="el-checkbox-outset" ></span><span>是否重大异常</span>
                </span>`: ``}
                <table class="checkbox el-item-show">
                    <tr>
                        <td style="width: 100px;text-align: center;">检验结果</td>
                        <td style="width: 400px;">
                            <input type="radio" id="result_true" name="check_result" ${result_true} value="0">
                            <label for="result_true" style="margin-left: -10px;">合格</label>
                            <input type="radio" id="result_false" name="check_result" ${result_flase} value="1">
                            <label for="result_false" style="margin-left: -10px;">不合格</label>
                            <div class="el-form-item" style="display:inline-block;width:120px;min-width:120px;margin-left: 40px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${dispose_val}">
                                                <input type="hidden" class="val_id" id="dispose" value="${dispose}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${disposeHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td style="width: 100px;">责任单位</td>
                        <td style="width: 400px;display:flex;">
                            <div class="el-form-item" style="width:180px;">
                                  <div class="el-form-item-div" style="min-width:180px !important;">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-muli-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <div class="el-input" data-id='${workshop_id}' id="workShop">${workshop_val}</div>
                                            </div>
                                            <div class="el-muli-select-dropdown">
                                                <ul class="el-muli-select-dropdown-list">
                                                    ${workShopHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <div class="el-form-item" style="width:180px;">
                                <div class="el-form-item-div" style="min-width:180px !important;">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-muli-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <div class="el-input" data-id='${department_id}' id="department">${department_val}</div>
                                        </div>
                                        <div class="el-muli-select-dropdown">
                                            <ul class="el-muli-select-dropdown-list">
                                                ${departmentHtml}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>不合格类型</td>
                        <td>
                          <div>
                            <div class="el-form-item relational-miss-item" style="display:inline-block;width:180px;">
                              <div class="el-select-dropdown-wrap">
                                <input type="text" data-id="" id="missItemRelationalId1" class="el-input" autocomplete="off" placeholder="请输入不良项目" value="">
                                <div class="el-select-dropdown" style="position: absolute; display: none;">
                                  <ul class="el-select-dropdown-list"></ul>
                                </div>
                              </div>
                            </div>
                            <div class="el-form-item miss-item1" style="display:inline-block;width:180px;">
                              <div class="el-select-dropdown-wrap">
                                <input type="text" data-id="" id="missItem1" class="el-input" autocomplete="off" placeholder="请输入不良细分" value="">
                                <div class="el-select-dropdown" style="position: absolute; display: none;">
                                  <ul class="el-select-dropdown-list"></ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div class="el-form-item relational-miss-item1" style="display:inline-block;width:180px;">
                              <div class="el-select-dropdown-wrap">
                                <input type="text" data-id="" id="missItemRelationalId2" class="el-input" autocomplete="off" placeholder="请输入不良项目" value="">
                                <div class="el-select-dropdown" style="position: absolute; display: none;">
                                  <ul class="el-select-dropdown-list"></ul>
                                </div>
                              </div>
                            </div>
                            <div class="el-form-item miss-item2" style="display:inline-block;width:180px;">
                              <div class="el-select-dropdown-wrap">
                                <input type="text" data-id="" id="missItem2" class="el-input" autocomplete="off" placeholder="请输入不良细分" value="">
                                <div class="el-select-dropdown" style="position: absolute; display: none;">
                                  <ul class="el-select-dropdown-list"></ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style="display:flex;">
                            <div class="el-form-item" style="width:180px;">
                              <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                  <div class="el-muli-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <div id="dispose_val" data-id="${missing_item_relational_id}" class="el-input">${missing_item_val}</div>
                                      <input type="hidden" class="val_id" id="missing_item_relational_id" value="${missing_item_relational_id}">
                                    </div>
                                    <div class="el-muli-select-dropdown">
                                      <ul class="el-muli-select-dropdown-list missing_item_relational">
                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        ${missItemHtml}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            <div class="el-form-item" style="width:180px;">
                                <div class="el-form-item-div">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-muli-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <div class="el-input" data-id="${missing_items_id}" id="missing_items_id" value>${missing_items}</div>
                                        </div>
                                        <div class="el-muli-select-dropdown miss-items">
                                            <ul class="el-muli-select-dropdown-list">
                                            </ul>
                                        </div>
                                    </div>
                                </div>                            
                          </div>
                        </td>
                        <td>计量单位</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div">
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="unit_now" class="el-input" placeholder="请输入单位" value="${commercial}">
                                        </div>    
                                    </div>
                                </div>
                             </div>
                        </td>
                    </tr>
                    <tr>
                        <td>问题描述</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="question_description" rows="5" class="el-textarea" placeholder="">${question_description != null ? question_description : ''}</textarea>
                        </td>
                        <td>备注</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="dispose_ideas" rows="5" class="el-textarea" placeholder="">${dispose_ideas ? dispose_ideas : ''}</textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>发现现场</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${scene_val}">
                                                <input type="hidden" class="val_id" id="scene" value="${scene}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${sceneHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td>不良数量</td>
                        <td>
                            <p>
                            <label for="deadly">致命</label>
                            <input  id="deadly" type="number" value="${deadly}">
                            </p>
                            <p>
                            <label for="seriousness">严重</label>
                            <input  id="seriousness" type="number" value="${seriousness}">
                            </p>
                            <p>
                            <label for="slight">轻微</label>
                            <input  id="slight" type="number" value="${slight}">
                            </p>
                        
                        </td>
                    </tr>
                    <tr>
                        <td>其他信息</td>
                        <td>
                            <p>
                            <label for="grammage">克重</label>
                            <input  id="grammage1" type="text" style="width:80px;" value="${result == null ? '' : grammage1}">
                            <input  id="grammage11" type="hidden" style="width:80px;" value="${grammage1}">
                            <input  id="grammage2" type="text" style="width:80px;" value="${result == null ? '' : grammage2}">
                            <input  id="grammage22" type="hidden" style="width:80px;" value="${grammage2}">
                            <input  id="grammage3" type="text" style="width:80px;" value="${result == null ? '' : grammage3}">
                            <input  id="grammage33" type="hidden" style="width:80px;" value="${grammage3}">
                            </p>
                            <p>
                            <label for="gatewidth">门幅</label>
                            <input  id="gatewidth1" type="text" style="width:80px;" value="${result == null ? '' : gatewidth1}">
                            <input  id="gatewidth11" type="hidden" style="width:80px;" value="${gatewidth1}">
                            <input  id="gatewidth2" type="text" style="width:80px;" value="${result == null ? '' : gatewidth2}">
                            <input  id="gatewidth22" type="hidden" style="width:80px;" value="${gatewidth2}">
                            <input  id="gatewidth3" type="text" style="width:80px;" value="${result == null ? '' : gatewidth3}">
                            <input  id="gatewidth33" type="hidden" style="width:80px;" value="${gatewidth3}">
                            </p>
                            <p>
                            <label for="dimensions">尺寸</label>
                            <input  id="dimensions1" type="text" style="width:80px;" value="${result == null ? '' : dimensions1}">
                            <input  id="dimensions11" type="hidden" style="width:80px;" value="${dimensions1}">
                            <input  id="dimensions2" type="text" style="width:80px;" value="${result == null ? '' : dimensions2}">
                            <input  id="dimensions22" type="hidden" style="width:80px;" value="${dimensions2}">
                            <input  id="dimensions3" type="text" style="width:80px;" value="${result == null ? '' : dimensions3}">
                            <input  id="dimensions33" type="hidden" style="width:80px;" value="${dimensions3}">
                            </p>
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="4">
                        <table id="check_item" class="sticky uniquetable  check_table">
                            <thead>
                            <tr>
                                <th class="center nowrap tight" colspan="4">检验项</th>                       
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
        
                            </tbody>
                        </table>
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="4">
                        <table class="sticky uniquetable  quality_table">
                            <thead>
                            <tr>
                                <th class="center nowrap tight" colspan="2">查看品质履历</th>                       
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </table>
            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit" data-flag = "${flag}">确定</button>
            </div>
          </div>
        </form>` ,
    success: function (layero, index) {
      checkItems.template.forEach(function (item03) {
        item03.item_id = '';
        item03.value = '';
      })
      getQualityResume(id);
      if (flag == 'single') {
        if (checkItems.result_res && checkItems.result_res.length) {
          checkItems.result_res.forEach(function (item01) {
            checkItems.template.forEach(function (item02) {
              if (item01.qc_template == item02.template_id) {
                itemIds.push(item02.id);
                item02.item_id = item01.id;
                item02.value = item01.value;
              }
            })
          })
        }
      }

      if (checkItems.template.length) {
        $('#check_item .table_tbody').html(treeHtml(checkItems.template, checkItems.template[0].parent_id));

      }

      $('#unit_now').autocomplete({
        url: URLS['check'].unit + "?" + _token + "&page_no=1&page_size=10",
        param: 'commercial',
        showCode: 'commercial'
      });
      if (unit) {
        $('#unit_now').val(commercial).data('inputItem', { id: unit, commercial: commercial }).blur();
      }
      $('#unit_now').on('click', function (e) {
        e.stopPropagation();
        $(this).next().width(300);
      })
      getLayerSelectPosition($(layero));
      layerOffset = layero.offset();
    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });
};
function departTreeHtml(fileData, parent_id) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    distance = level * 20, tagI = '', itemcode = ''
    var distance, className, itemImageClass, tagI, itemcode = '';
    distance = level * 20, tagI = '', itemcode = ''

    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `<span>${item.name}</span> `;

    _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${departTreeHtml(fileData, item.id)}
	        `;
  });
  return _html;
};

//车间多选列表
function muliWorkShop(workShopData) {
  var _html = `<li data-id="" data-name="--请选择--" class="el-muli-select-dropdown-item">--请选择--</li>`;
  workShopData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;
    _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
    `
  })
  return _html;
}

function muliDepartment(departData) {
  var _html = `<li data-id="" data-name="--请选择--" class="el-muli-select-dropdown-item">--请选择--</li>`;
  departData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;

    _html += `
        <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
      `
  })
  return _html;
}

function treeHtml(fileData, parent_id) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    var distance, className, itemImageClass, tagI, itemcode = '';
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`, itemcode = `(${item.code})`;
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `${tagI}<span>${item.name}</span> ${itemcode}`;

    _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" >
	        <input type="hidden" id="item${item.id}" data-code="${item.template_code}" data-tem="${item.template_id}" value="${item.item_id}">
	          <td width="30%">${span}</td>
	          <td width="20%">${item.type == 0 ? `<div class="el-form-item-div" style="width: 200px;" id="unitDiv">
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="${item.value == 0 ? '合格' : item.value == 1 ? '不合格' : '--请选择--'}">
                            <input type="hidden" class="val_id check_please" id="value${item.id}" value="${item.value == "" ? 0 : item.value}">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="0" data-name="true" class=" el-select-dropdown-item">合格</li>
                                <li data-id="1" data-name="false" class=" el-select-dropdown-item">不合格</li>
                            </ul>
                        </div>
                    </div>
                </div>`: item.type == 1 ? `<div class="el-select"><input class="el-select" id="value${item.id}" style="width:189px;" placeholder="请输入" type="number" value="${item.value}"></div>` : `<div class="el-select"><input class="el-input" style="width:189px;" id="value${item.id}" placeholder="请输入"  type="text" value="${item.value}"></div>`}  
	            
              </td>
              <td width="40%">${item.remark}</td>
              <td>
                <span class="el-checkbox_input el-checkbox_input_items ${item.item_id != '' ? 'is-checked' : ''}"  style="vertical-align:middle"  id="${item.id}">
                    <span class="el-checkbox-outset" ></span>
                </span>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id)}
	        `;

  });
  return _html;
};
function checkSubmit(data, flag, id) {
  var check_choose = [],
    check_item = [];
  if (flag == 'single') {
    check_choose.push({ "check_id": id });
  } else {
    ids.forEach(function (item) {
      check_choose.push({ "check_id": item })
    });
  }

  itemIds.forEach(function (item) {
    check_item.push({ "item_id": $("#item" + item).val(), "template_code": $("#item" + item).attr('data-code'), "template_id": $("#item" + item).attr('data-tem'), "value": $("#value" + item).val() })
  });
  data.check_choose = JSON.stringify(check_choose);
  data.check_item = JSON.stringify(check_item);
  AjaxClient.post({
    url: URLS['check'].check,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      if (flag != 'single') {
        // ids=[];
      }
      itemIds = [];
      getChecks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
    }
  }, this);
}
// $('body').on('input','.el-item-show input',function(event){
//     event.target.value = event.target.value.replace( /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im,"");
// })

//不合格类型
function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    var name = e.name;
    return name.indexOf(type) > -1;
  });
}

//数组去重
function unique(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) {         //第一个等同于第二个，splice方法删除第二个
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
}

function getSumString(v1, v2, v3) {
  var sum = '';
  if (v1) {
    sum += v1;
  }
  if (v2) {
    sum += ',' + v2;
  }
  if (v3 && v3 != 'null') {
    sum += ',' + v3;
  }
  return sum;
}