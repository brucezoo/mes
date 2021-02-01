var layerModal,
  layerLoading,
  layerEle = '',
  ajaxData = {},
  pageNo = 1,
  type=2,
  pageSize = 20,
  nameCorrect = !1,
  sampleNumberCode = {},
  validatorToolBox = {
    checkName: function (name) {
      var value = $('#' + name).val().trim();
      return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) :
        Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
          (nameCorrect = 1, !0);
    }
  },
  validatorConfig = {
    name: "checkName"
  };


$(function () {
  getDefectiveItemList();
  resetParam();
  bindEvent();
})

//重置搜索参数
function resetParam() {
  ajaxData = {
    type: 1,
    order: 'desc',
    sort: 'id'
  };
}

//显示错误信息
function showInvalidMessage(name, val) {
  $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

//获取失效项目列表
function getDefectiveItemList() {
  $('.table_tbody').html('');
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumList + "?" + _token + '&type=' + type + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var pageTotal = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        // var parent_id=rsp.results[0].parent_id;
        $('.table_tbody').html(defectiveItemHtml(rsp.results));
      } else {
        noData('暂无数据', 3);
      }
      if (pageTotal > pageSize) {
        bindPagenationClick(pageTotal, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取失效项目列表失败，请刷新重试', 3);
    }
  }, this);
};

function defectiveItemHtml(data) {
  var tr = '';
  data.forEach(function (item) {
    tr += `<tr class="no-line-tr">
            <td>${tansferNull(item.name)}</td>
            <td class="right">
            <button class="button pop-button edit" data-id="${item.id}">编辑</botton>
            <button class="button pop-button danger delete" data-id="${item.id}" style="margin-left:3px;">删除</button>
            </td>
        </tr>`;

  })
  return tr;
}

// 分页
function bindPagenationClick(total, size) {
  $('#pagenation').show();
  $('#pagenation').pagination({
    totalData: total,
    showData: size,
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
      getDefectiveItemList(status);
    }
  });
}

function bindEvent() {
  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
  });
  $('body').on('click', '.formInspect:not(".disabled") .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
  });

  //弹窗取消
  $('body').on('click', '.formInspect:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  $('.uniquetable').on('click', '.edit', function () {
    $(this).parents('tr').addClass('active');
    getExpiredItemInfo($(this).attr("data-id"));
  });
  
  $('.uniquetable').on('click', '.delete', function () {
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      deleteDefectiveItem(id);
    });
  });
  //弹窗下拉
  $('body').on('click', '.formInspect:not(".disabled") .el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //弹窗下拉
  $('body').on('click', '#searchForm:not(".disabled") .el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //搜索框下拉选择
  $('body').on('click', '#searchForm:not(".disabled") .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parents('.el-form-item').find('.errorMessage').html('');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.el-input').attr('data-name', $(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      ele.find('.val_id').attr('data-code', $(this).attr('data-name'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //下拉选择
  $('body').on('click', '.formInspect:not(".disabled") .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parents('.el-form-item').find('.errorMessage').html('');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      ele.find('.val_id').attr('data-code', $(this).attr('data-name'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
    if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
    }
  });

  //搜索
  $('#searchForm').on('click', '.submit:not(".is-disabled")', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('backageground', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $('#searchForm'), pre_code = '', type = '';
    if (encodeURIComponent(parentForm.find('#select_type').attr('data-name').trim()).search(/--/) == 0) {
      type = '';
    } else {
      type = encodeURIComponent(parentForm.find('#select_type').attr('data-name').trim());
    }
    if (encodeURIComponent(parentForm.find('#select_code').attr('data-name').trim()).search(/--/) == 0) {
      pre_code = '';
    } else {
      pre_code = encodeURIComponent(parentForm.find('#select_code').attr('data-name').trim());
    }
    ajaxData = {
      type: type,
      order: 'desc',
      sort: 'id'
    };
    getDefectiveItemList();
  });

  $('body').on('click', '#typeList .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    //获取编码select列表
    var code_id = $(this).attr('data-id');
    var flag = $("#flag").val();
    getDefectiveItemCode(code_id, flag);
  })

  $('body').on('click', '#codeListItem .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    //获取编码select列表
    var code_id = $(this).attr('data-id');
    getDefectiveItemCodeNumber(code_id);
  })

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetParam();
    getDefectiveItemList();
  });

  //添加和编辑的提交
  $('body').on('click', '.formExpiredItem:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addExpiredItem_form');
      for (var name in validatorConfig) { validatorToolBox[validatorConfig[name]](name); }
      if (nameCorrect) {
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        var name = parentForm.find('#name').val().trim();
        var id=parentForm.find('#itemId').val().trim();
        $(this).hasClass('addExpiredItem') ? (
          addDefectiveItem({
              name: name,
              type: type,
              _token: TOKEN
            })
          ):(
            editDefectiveItem({
              id: id,
              name: name,
              _token: TOKEN
            })
          )
      }
    }
  });
  //输入框的相关事件
  $('body').on('focus', '.formExpiredItem:not(".disabled") .el-input:not([readonly])', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '.formExpiredItem:not(".disabled") .el-input:not([readonly])', function () {
    var name=$(this).attr("id");
    validatorConfig[name]
    && validatorToolBox[validatorConfig[name]]
    && validatorToolBox[validatorConfig[name]](name)
  });

  //添加失效项目
  $('body').on('click', '.add', function (e) {
    e.stopPropagation();
    Modal();
  });
};

function Modal(data,flag) {
  var { id = '', name = ''} = {};
  if (data) {
    ({ id='', name=''} = data);
  }
  layerModal = layer.open({
    type: 1,
    title: '失效项目信息',
    offset: '100px',
    area: ['400px', '150px'],
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content: `<form class="formModal formExpiredItem" id="addExpiredItem_form">
                  <input type="hidden" id="itemId" value="${id}" >
                  <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
                      <div class="el-form-item">
                          <div class="el-form-item-div" style="text-align:right;">
                              <span style="width: 60px;flex: none;margin-right:10px;">名称<span class="mustItem">*</span></span>
                              <input type="text" class="el-input splitNum" id="name" value="${name}" >
                          </div>
                          <p class="errorMessage" style="margin-left:70px;display: block;"></p>
                      </div>
                  </div>
                  <div class="el-form-item">
                      <div class="el-form-item-div btn-group" style="margin-top: 5px;">
                          <button type="button" class="el-button el-button--primary submit ${flag!=1?'addExpiredItem':''}">确定</button>
                      </div>
                  </div>   
              </form>`,
    success: function () {

    },
    end: function () {
      $("body").css("overflow-y", "auto");
    }
  })
}

//编辑失效项目
function editInspect(data) {
  AjaxClient.post({
    url: URLS['sample'].currentversionUpdate,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getDefectiveItemList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      $('body').find('#addInspect_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this);
}
//添加失效项目
function addDefectiveItem(data) {
  AjaxClient.post({
    url: URLS['invalidCost'].addInvalidEnum,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getDefectiveItemList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#addInspect_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
    }
  }, this);
}

//编辑失效项目
function editDefectiveItem(data){
  AjaxClient.post({
    url: URLS['invalidCost'].editInvalidEnum,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getDefectiveItemList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#addInspect_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
    }
  }, this);
}

//查看失效项目
function getExpiredItemInfo(id) {
  AjaxClient.get({
    url: URLS['invalidCost'].invalidEnumOne + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      Modal(rsp.results, 1);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取该分类失败');
      if (rsp.code == 404) {
        getDefectiveItemList();
      }
    }
  }, this);
}
//删除失效项目
function deleteDefectiveItem(id) {
  AjaxClient.post({
    url: URLS['invalidCost'].delInvalidEnum + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getDefectiveItemList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getDefectiveItemList();
      }
    }
  }, this);
}