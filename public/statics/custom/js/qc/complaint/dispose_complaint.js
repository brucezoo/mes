var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {},
  laydate,
  ids = [],
  missingItems_list = [],
  missingItemsLists = [],
  missItemData = '',
  is_search = 0,
  finishTypeMap = {
    1: '责任件',
    2: '预防件',
    3: '记录件'
  };

$(function () {
  resetParam();
  getSearch();
  getComplaint();
  bindEvent();
});

function getSearch() {
  $.when(getMissItem())
    .done(function (missitemrsp) {
      missItemData = missitemrsp.results;
    }).fail(function (missitemrsp) {
      console.log('获取失败');
    }).always(function () {
      layer.close(layerLoading);
    });
};

//获取缺失项类别
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

//重置搜索参数
function resetParam() {
  ajaxData = {
    complaint_code: '',
    customer_name: '',
    status: '',
    finish_status: '',
    finish_type: '',
    item_no: ''
  };
}

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
      getComplaint();
    }
  });
};
//获取质检类别列表
function getComplaint() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${encodeURIComponent(ajaxData[param])}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['complaint'].select + "?" + _token + urlLeft,
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
        noData('暂无数据', 10);
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
      noData('获取物料列表失败，请刷新重试', 10);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);

};
//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var materialNo = [];
    var materialName = [];
    if (Array.isArray(item.material)) {
      item.material.forEach(function (material) {
        materialNo.push(material.item_no);
        materialName.push(material.material_name);
      })
    }

    var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td>${item.complaint_code}</td>
                <td>${item.customer_name}</td>
                <td>${item.factory_name || ''}</td>
                <td>${materialNo.join('<br>')}</td>
                <td>${materialName.join('<br>')}</td>
                <td>${item.finish_status == 1 ? '归档' : item.finish_status == 2 ? '终止' : item.status == 1 ? '未审核' : item.status == 2 ? '审核中' : item.status == 3 ? "审核不通过" : item.status == 4 ? "审核通过" : ''}</td>
                <td>${finishTypeMap[item.finish_type] || '--'}</td>
                <td>${item.create_time}</td> 
                ${is_search==1?`<td class="right">
                <a href="/QC/viewComplaintById?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                ${item.finish_status == 1?`<button data-id="${item.id}" class="button pop-button add-quality-resume">添加品质履历</button>`:''}
            ${item.finish_status != 0 ? '' : `${item.status == 4 ? `<button data-id="${item.id}" class="button pop-button pigeonhole">客诉归档</button><button data-id="${item.id}" class="button pop-button add-quality-resume">添加品质履历</button>` : item.status != 2 ? `<a href="disposeComplaintSend?id=${item.id}"><button data-id="${item.id}" class="button pop-button send">发送相关部门</button></a>
                <button data-id="${item.id}" data-code="${item.complaint_code}" class="button pop-button missingItem">关联缺失项</button>
                <button data-id="${item.id}" class="button pop-button add-quality-resume">添加品质履历</button>
                <button data-id="${item.id}" class="button pop-button audit">提交审核</button>` : ``}
                <button data-id="${item.id}" class="button pop-button terminate">客诉终止</button> `}
             </td>`:`<td class="right">
                <a href="/QC/viewComplaintById?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                  ${item.finish_status != 0 ? '' : `${item.status == 4 ? `<button data-id="${item.id}" class="button pop-button pigeonhole">客诉归档</button>` : item.status != 2 ? `<a href="disposeComplaintSend?id=${item.id}"><button data-id="${item.id}" class="button pop-button send">发送相关部门</button></a>
                <button data-id="${item.id}" data-code="${item.complaint_code}" class="button pop-button missingItem">关联缺失项</button>
                <button data-id="${item.id}" class="button pop-button add-quality-resume">添加品质履历</button>
                <button data-id="${item.id}" class="button pop-button audit">提交审核</button>` : ``}
                <button data-id="${item.id}" class="button pop-button terminate">客诉终止</button> `}
              </td>`}
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
};

function bindEvent() {
  $('body').on('click', '.audit', function (e) {
    e.stopPropagation();
    Modal($(this).attr('data-id'));
  });

  //关联缺失项
  $('body').on('click', '.missingItem', function (e) {
    e.stopPropagation();
    let code = $(this).attr('data-code');
    showMissingItemModal(code);
  });

  //缺失项
  $('body').on('click', '.missing_item_relational .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    var missItemId = $(this).attr('data-id');
    getMissingItem(missItemId);
  })

  //归档
  $('body').on('click', '.pigeonhole', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');
    // 归档类型
    var $html = `<div class="el-form-item form-finish">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 88px;">归档类型</label>
                          <div class="el-select-dropdown-wrap">
                              <div class="el-select">
                                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                  <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                  <input type="hidden" class="val_id" id="form-finish-type" value="0">
                              </div>
                              <div class="el-select-dropdown">
                                  <ul class="el-select-dropdown-list">
                                      <li data-id="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                      <li data-id="1" data-code="" data-name="--责任件--" class=" el-select-dropdown-item">--责任件--</li>
                                      <li data-id="2" data-code="" data-name="--预防件--" class=" el-select-dropdown-item">--预防件--</li>
                                      <li data-id="3" data-code="" data-name="--记录件--" class=" el-select-dropdown-item">--记录件--</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>`;
    layer.confirm('将执行归档操作?</br>' + $html, {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      pigeonholeComplaint(id);
    });
  });

  //执行终止
  $('body').on('click', '.terminate', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');
    layer.confirm('将执行终止操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      terminateComplaint(id);
    });
  });

  $('body').on('click', '#addMissingItems_from .submit:not(".is-disabled")', function (e) {
    e.stopPropagation();
    var code = $("#item_code").val();
    var missingItems = $("#missingItem_id").val();
    var relatedItem = [],
      missing_item_ids = [];
    $('.procedure_ability_value .table_tbody .tritem').each(function (k, v) {
      relatedItem.push({
        'id': $(v).attr('data-parent-id'),
        'missing_ids': $(v).attr('data-id')
      });
    })
    var parent_id = [];
    for (i = 0; i < relatedItem.length; i++) {
      for (j = 0; j < parent_id.length; j++) {
        if (parent_id[j] == relatedItem[i].id) {
          break;
        }
      }
      if (j == parent_id.length) {
        parent_id[parent_id.length] = relatedItem[i].id;
      }
    }
    for (var j = 0; j < parent_id.length; j++) {
      var missing_item_id = [];
      for (var i = 0; i < relatedItem.length; i++) {
        if (relatedItem[i].id == parent_id[j]) {
          missing_item_id.push(relatedItem[i].missing_ids)
        } else {
          continue;
        }
      }
      missing_item_ids.push(missing_item_id);
    }
    var relatedItemJson = [];
    parent_id.forEach(function(item,index){
      relatedItemJson.push({
        'id': item,
        'missing_ids': missing_item_ids[index].join(',')
      });
    })
    
    var data = {
      'number_code': code,
      'item': JSON.stringify(relatedItemJson),
      '_token': TOKEN
    }
    AjaxClient.post({
      url: URLS['complaint'].relateMissingItem,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.close(layerModal);
        LayerConfig('success','关联成功');
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        layer.close(layerModal);  
        if (rsp && rsp.message != undefined && rsp.message != null) {
          LayerConfig('fail', rsp.message);
        }
      }
    }, this);
  })

  $('body').on('click', '.formReport:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var flag = false;
      var parentForm = $(this).parents('#addReport_from'),
        itemId = parentForm.find('#itemId').val(),
        targetResponseDate = parentForm.find('#targetResponseDate').val(),
        actualResponseDate = parentForm.find('#actualResponseDate').val();
      var $itemJP = $('#judge_person_id');
      var judge_person_id = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
        $itemJP.data('inputItem').name == $itemJP.val().trim() ? $itemJP.data('inputItem').id : '';
      if (judge_person_id) {
        flag = true;
        $(".judge-person").find(".errorMessage").html('')
      } else {
        $(".judge-person").find(".errorMessage").html('*请输入审核人')
      }
      if (flag) {
        submit({
          customer_complaint_id: itemId,
          judge_person_id: judge_person_id,
          target_respond_date: targetResponseDate,
          actual_respond_date: actualResponseDate,
          _token: TOKEN
        });
      }
    };
  });
  //弹窗取消
  $('body').on('click', '.cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });
  $('body').on('click', '#searchForm .el-select', function () {
    if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
    } else {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
      $(this).find('.el-input-icon').addClass('is-reverse');
      $(this).siblings('.el-select-dropdown').show();
    }
  });

  // 客诉归档
  $('body').on('click', '.form-finish .el-select', function () {
    if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
    } else {
      $('.el-item-show').find('.el-select-dropdown').hide();
      $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
      $(this).find('.el-input-icon').addClass('is-reverse');
      $(this).siblings('.el-select-dropdown').show();
    }
  });


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
  //重置搜索框值
  $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#customer_name').val('');
    parentForm.find('#complaint_code').val('');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#over_status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#finish_type').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#item_no').val('');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    is_search = 0;
    pageNo = 1;
    resetParam();
    getComplaint();
  });
  // 搜索
  $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
    e.stopPropagation();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      if (Number(parentForm.find('#over_status').val().trim()) == 1) {
        is_search = 1;
      } else {
        is_search == 0;
      }
      pageNo = 1;
      ajaxData = {
        customer_name: parentForm.find('#customer_name').val().trim(),
        complaint_code: parentForm.find('#complaint_code').val().trim(),
        status: parentForm.find('#status').val().trim(),
        finish_status: parentForm.find('#over_status').val().trim(),
        finish_type: parentForm.find('#finish_type').val().trim(),
        item_no: parentForm.find('#item_no').val().trim()
      }
      getComplaint();
    }
  });

  //选择缺失项
  $('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
    var id = $(this).attr("id");
    if ($(this).hasClass('is-checked')) {
      if (ids.indexOf(id) == -1) {
        ids.push(id);
        missingItems_list.forEach(function (item) {
          if (item.id == id) {
            missingItemsLists.push(item);
          }
        })
      }
    } else {
      var index = ids.indexOf(id);
      ids.splice(index, 1);
      missingItemsLists.forEach(function (item, index) {
        if (item.id == id) {
          missingItemsLists.splice(index, 1);
        }
      })
    };
    showMissingItemList($('.inputOperationValue_table .info_table .table_tbody'))
  });

  //删除缺失项

  $('body').on('click', '.inputOperationValue_table .delete', function () {
    var id = $(this).attr('data-id');
    var index = ids.indexOf(id);
    ids.splice(index, 1);
    missingItemsLists.forEach(function (item, index) {
      if (item.id == id) {
        missingItemsLists.splice(index, 1);
      }
    });
    $('body').find('.el-checkbox_input_check.is-checked').each(function () {
      if ($(this).attr('id') == id) {
        $(this).removeClass('is-checked')
      }
    })
    $(this).parents().parents().eq(0).remove();
  });

  // 添加品质履历
  $('body').on('click', '.add-quality-resume', function (e) {
    var id = $(this).attr('data-id');
    e.stopPropagation();
    layer.confirm('将执行添加品质履历操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      addQualityResume(id);
    });
  });
}

// 添加品质履历
function addQualityResume(id) {
  AjaxClient.post({
    url: URLS['complaint'].addQualityResume,
    data: {
      id: id,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '添加成功')
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function showMissingItemList(ele) {
  ele.html('');
  missingItemsLists.forEach(function (item) {
    var tr = `<tr class="tritem" data-parent-id="${item.parent_id}" data-id="${item.id}">
                <td>${item.name}</td>
                <td><i class="fa fa-minus-square oper_icon delete" title="删除" data-id="${item.id}" style="color: #20a0ff;margin-left: 15px;"></i></td>
              </tr>`;
    ele.append(tr);
    ele.find("tr:last-child").data('tritem', item);
  })
}

function terminateComplaint(id) {
  AjaxClient.get({
    url: URLS['complaint'].terminate + "?" + _token + "&customer_complaint_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);

      getComplaint();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);

      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getComplaint();
      }

    }
  }, this);
}

function pigeonholeComplaint(id) {
  var finishType = $('#form-finish-type').val();

  if (!finishType || finishType == '0') {
    LayerConfig('fail', '请选择归档类型');
    return;
  }

  AjaxClient.get({
    url: URLS['complaint'].pigeonhole + "?" + _token + "&customer_complaint_id=" + id + "&finish_type=" + finishType,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);

      getComplaint();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getComplaint();
      }
    }
  }, this);
}

//获取缺失项
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
      var ele = $("#missingItem").find(".table_tbody")
      ele.html('');
      missingItems_list = rsp.results;
      rsp.results.forEach(function (item) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;
        _html += `<tr class="tritem" data-parent-id="${item.parent_id}" data-id="${item.id}">
        <td class="tdleft"><span class="el-checkbox_input el-checkbox_input_check material-check" id="${item.id}"  data-name="${item.name}">
        <span class="el-checkbox-outset"></span>
    </span></td>
        <td>${item.name}</td>
    </tr>`
      })
      ele.html(_html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

function showMissingItemModal(code) {
  var labelWidth = 150,
    btnShow = 'btnShow',
    title = '关联缺失项',
    department_id = '',
    missItemHtml = '';
  if (missItemData.length) {
    missItemData.forEach(function (item) {
      missItemHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item">${item.name}</li>`;
    });
  }
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '1000px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formReport" id="addMissingItems_from" data-flag="">
          <input id="item_code" type="hidden" value="${code}"/>
          <div class="el-form-item procedure_wrap" >
                     <div class="procedure_select material">
                       <div class="title"><h5>选择类别</h5></div>
                       <div class="searchItem" id="searchForm">
                          <div class="searchMAttr searchModal formModal" id="searchMAttr_from">
                              <div class="el-item">
                                  <div class="el-item-show" style="width: 400px;">
                                      <div class="el-item-align">
                                          <div class="el-form-item department" style="width: 100%;">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label" style="width: 80px;">类别</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="missingItem_id" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list missing_item_relational">
                                                              <li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                              ${missItemHtml}
                                                          </ul>
                                                      </div>
                                                  </div>                                                    
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                       <div class="selectOperationAbility_table table_page">
                          <div id="pagenation" class="pagenation"></div>
                          <table class="info_table uniquetable commontable" id="missingItem">
                              <thead>
                                <tr>
                                  <th class="thead">选择</th>
                                  <th class="thead">名称</th>
                                </tr>
                              </thead>
                              <tbody class="table_tbody">
                                 
                              </tbody>
                          </table>
                       </div>
                     </div>
                     <div class="procedure_btn">
                         <span>&gt;</span>
                      </div>
                     <div class="procedure_ability_value">
                         <div class="title"><h5>选中缺失项</h5><span class="errorMessage"></span></div>
                         <div class="inputOperationValue_table">
                          <table class="info_table">
                              <thead>
                                <tr class="th_table_tbody">
                                  <th class="thead">缺失项</th>
                                  <th class="thead">操作</th>
                                </tr>
                              </thead>
                              <tbody class="table_tbody">
                                
                              </tbody>
                          </table>
                        </div>
                     </div>
                  </div>
          <div class="el-form-item ${btnShow}">
          <div class="el-form-item-div btn-group">
              <button type="button" class="el-button cancle">取消</button>
              <button type="button" class="el-button el-button--primary submit report">确定</button>
          </div>
        </div>
      </form>`,
    success: function (layero, index) {
      // getMissingItems(department_id);
    },
    end: function () {
      $('.table_tbody tr.active').removeClass('active');
    }
  });
}

function Modal(id) {
  var labelWidth = 150,
    btnShow = 'btnShow',
    title = '提交审核',
    readonly = '';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formReport" id="addReport_from" data-flag="">
<input type="hidden" id="itemId" value="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">应回复时间</label>
                    <input type="text" id="targetResponseDate" ${readonly}  data-name="应回复时间" class="el-input" placeholder="应回复时间" value="">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">实回复时间</label>
                    <input type="text" id="actualResponseDate" ${readonly}  data-name="实回复时间" class="el-input" placeholder="实回复时间" value="">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
           
            <div class="el-form-item judge-person">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">审核人</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" id="judge_person_id" class="el-input" autocomplete="off" placeholder="审核人" value="">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            
          
            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit report">确定</button>
            </div>
          </div>
        </form>`,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));
      laydate.render({
        elem: '#targetResponseDate',
        done: function (value, date, endDate) {

        }
      });
      laydate.render({
        elem: '#actualResponseDate',
        done: function (value, date, endDate) {

        }
      });
      $('#judge_person_id').autocomplete({
        url: URLS['complaint'].judge_person + "?" + _token + "&page_no=1&page_size=10"
      });
      $('#judge_person_id').each(function (item) {
        var width = $(this).parent().width();
        $(this).siblings('.el-select-dropdown').width(width);

      });


    },
    end: function () {
      $('.table_tbody tr.active').removeClass('active');
    }
  });
}

$('body').on('input', '.el-item-show input', function (event) {
  event.target.value = event.target.value.replace(/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im, "");
})

function submit(data) {
  AjaxClient.post({
    url: URLS['complaint'].submit,
    dataType: 'json',
    data: data,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getComplaint();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      getComplaint();
    }
  }, this);
}