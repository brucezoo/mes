var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ajaxData = {};
$(function () {
  getDeviation();
  getLaydate('start_time');
  bindEvent();
  resetParam();
});
//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    cn_name: '',
    persons_name: '',
    start_time:'',
    end_time:'',
    order: 'desc',
    sort: 'id'
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
      getDeviation();
    }
  });
};
//获取异常单列表
function getDeviation() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['deviation'].list + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // console.log(rsp);
      layer.close(layerLoading);
      if (layerModal != undefined) {
        layer.close(layerModal);
      }
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results);
      } else {
        noData('暂无数据', 15);
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
      noData('获取异常单列表失败，请刷新重试', 15);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}
//生成列表数据
function createHtml(ele, data) {
  data.forEach(function (item, index) {
    var condition = '', inerHtml = '';
    if (item.status == 1) {
      condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已完结</span>`;
    } else {
      condition = `<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未完结</span>`;
    }
    var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td>${item.code}</td>
                <td>${item.persons_arr}</td>
                <td>${tansferNull(item.question_description)}</td>
                <td>${tansferNull(item.cause)}</td>
                <td>${tansferNull(item.status)==0?'未完结':item.status==1?'已完结':'被迫中止'}</td>
                <td>${item.replyperson}</td>
                <td>${item.cn_name}</td>
                <td>${item.ctime}</td>
                <td class="right">
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                    <button data-id="${item.id}" class="button pop-button repulse ${item.status ==1  ? 'is-disabled' : ''}">确定完结</button>
                    <button data-id="${item.id}" class="button pop-button edit ${item.status != 0 ? 'is-disabled' : ''}">编辑</button>
                    <button data-id="${item.id}" class="button pop-button delete ${item.status != 0 ? 'is-disabled' : ''}">删除</button>
                </td>>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
  $(function () {
    $('td .is-disabled').css('pointer-events', 'none');
    $('td .is-disabled').css({
      'color': '#bfcbd9',
      'cursor': 'not-allowed',
      'background-color': '#eef1f6',
      'border-color': '#d1dbe5'
    })
  })
};
function bindEvent() {
  //点击导出按钮
  $('body').on('click', '.el-form-item-div #exportBtn', function (e) {
    e.stopPropagation;
    var parentForm = $(this).parents('#searchForm');
    var urlLeft = '';
    var ajaxData = {
      token: '8b5491b17a70e24107c89f37b1036078',
      code: parentForm.find('#abnormalCode').val().trim(),
      persons_name: parentForm.find('#responsible').val().trim(),
      cn_name: parentForm.find('#create_name').val().trim(),
      start_time: parentForm.find('#start_time').val().trim(),
      end_time: parentForm.find('#end_time').val().trim(),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`
    }
    let url = "/AbnormalController/exportExcel?" + urlLeft;
    $('#exportExcel').attr('href', url)
  })

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
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
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
    getDeviation();
  });

  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //搜索
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
      pageNo = 1;
      ajaxData = {
        code: parentForm.find('#abnormalCode').val().trim(),
        persons_name: parentForm.find('#responsible').val().trim(),
        cn_name: parentForm.find('#create_name').val().trim(),
        start_time: parentForm.find('#start_time').val().trim(),
        end_time: parentForm.find('#end_time').val().trim(),
        order: 'desc',
        sort: 'id'
      }
      getDeviation();
    }
  });

  // 更多搜索条件下拉
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

  //结案
  $('body').on('click', '.audit', function () {
    var id = $(this).attr('data-id');
    Model(id);
  })

  //结案确定，取消
  $('body').on('click', '.formAudit:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#audit_from');
    var end_remark = parentForm.find('#audit').val().trim();
    console.log(end_remark);
    var id = $(this).attr('data-id');
    if (!end_remark) {
      layer.msg('结案内容必填!', { icon: 2, offset: '250px', time: 2000 });
    } else {
      pushAudit(id, end_remark);
    }
  })

  $('body').on('click', '.formAudit:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  })

  //查看异常单
  $('.table_tbody').on('click', '.view', function () {
    $(this).parents('tr').addClass('active');
    $(this).parents('tr').addClass('active');
    // viewAbnormal($(this).attr("data-id"),'view');
    window.location.href = '/QC/viewSpecialPurchaseApply?id=' + $(this).attr('data-id');
  });

  //编辑异常单
  $('.table_tbody').on('click', '.edit', function () {
    $(this).parents('tr').addClass('active');
    window.location.href = '/QC/editSpecialPurchaseApply?id=' + $(this).attr('data-id');
  });

  //删除异常单
  $('.table_tbody').on('click', '.delete', function () {
    $(this).parents('tr').addClass('active');
    var id = $(this).attr("data-id");
    layer.confirm('是否删除该特采单?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      deleteAbnormal(id);
      layer.close(index);
    });

  });

    //完结特采单
    $('.table_tbody').on('click', '.repulse', function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr("data-id");
        layer.confirm('是否完结改特采单?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            repulse(id);
            layer.close(index);
        });
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
    parentForm.find('#abnormalCode').val('');
    parentForm.find('#responsible').val('');
    parentForm.find('#create_name').val('');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getDeviation();
  });

  //下拉选择
  $('body').on('click', '.formAbnormal:not(".disabled") .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parents('.el-form-item').find('.errorMessage').html('');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      ele.find('.val_id').attr('data-code', $(this).attr('data-code'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });
};

//结案
function pushAudit(id, val) {
  AjaxClient.post({
    url: URLS['abnormal'].audit + "?" + _token + "&id=" + id + "&end_remark=" + val,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // console.log(rsp);
      layer.close(layerModal);
      getDeviation();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
      // console.log(rsp);
    }
  }, this);
}

//时间组件
function getLaydate(flag){
  if (flag == 'start_time') {
    laydate.render({
      elem: '#' + flag,
      type: 'date',
      format: 'yyyy-MM-dd HH:mm:ss',
      position: 'fixed',
      done:function(e){
        getLaydate('end_time');
      }
    })
  }else if(flag=='end_time'){
    laydate.render({
      elem: '#' + flag,
      type: 'date',
      min: $("#start_time").val(),
      format: 'yyyy-MM-dd HH:mm:ss',
      position: 'fixed',
    })
  }
}

//结案弹框
function Model(id) {
  var labelWidth = 80,
    title = '编写结案内容';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formAudit" id="audit_from">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">结案<span class="mustItem">*</span></label>
                <textarea type="textarea" maxlength="500" id="audit" rows="5" class="el-textarea" placeholder="">
                
                </textarea>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit" id="confirm" data-id="${id}">确定</button>
            </div>
          </div>
                
    </form>`,
    success: function (layero, index) {

    },
    end: function () {
      $('.table_tbody tr.active').removeClass('active');
    }
  });
};

function deleteAbnormal(id) {
  AjaxClient.get({
    url: URLS['deviation'].destroy + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // console.log(rsp);
      layer.close(layerLoading);
      getDeviation();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    }
  }, this);
}
// 退回异常单
function repulse(id) {
  AjaxClient.get({
      url: URLS['deviation'].audit + "?" + _token + "&id=" + id,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
        },
      success: function (rsp) {
        // console.log(rsp);
          layer.close(layerLoading);
          getDeviation();
          },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message);
      }
      }, this);
}

$('body').on('click', '.button_check', function () {
  window.location.href = '/QC/addSpecialPurchaseApply';
})