var layerModal,
  layerLoading,
  layerEle = '',
  itemSelect = [],
  ajaxData = {},
  pageNo = 1,
  pageSize = 20,
  codeCorrect = !1,
  nameCorrect = !1,
  creator_token = '88t8r9m70r2ea5oqomfkutc753',
  sampleNumberCode = {},
  validatorToolBox = {

    checkName: function (name) {
      var value = $('#' + name).val().trim();
      return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) :
        Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
          (nameCorrect = 1, !0);
    },
    checkCode: function (name) {
      var value = $('#' + name).val().trim();
      return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (codeCorrect = !1, !1) :
        Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), codeCorrect = !1, !1) :
          (codeCorrect = 1, !0);
    }
  },
  remoteValidatorToolbox = {
    remoteCheckName: function (name, flag, id) {
      var value = $('#' + name).val().trim();
      getUnique(flag, name, value, id, function (rsp) {
        if (rsp.results && rsp.results.exist) {
          nameCorrect = !1;
          var val = '已注册';
          showInvalidMessage(name, val);
        } else {
          nameCorrect = 1;
        }
      });
    },
    remoteCheckCode: function (name, flag, id) {
      var datacode = $('#parent_id').attr('data-code'),
        value = datacode + $('#' + name).val().trim();
      getUnique(flag, name, value, id, function (rsp) {
        if (rsp.results && rsp.results.exist) {
          codeCorrect = !1;
          var val = '已注册';
          showInvalidMessage($('#' + name), val);
        } else {
          codeCorrect = 1;
        }
      });
    },
  },
  validatorConfig = {
    name: "checkName",
    code: "checkCode"
  }, remoteValidatorConfig = {
    name: "remoteCheckName",
    code: "remoteCheckCode"
  };
var all_checked = '';
var arr = [];
document.getElementById('al').checked = false;
model();

function evn() {

  getSampleNumberList();
  getSearchTypeList();
  resetParam();
  bindEvent();
}


//获取类型select列表
function getSearchTypeList() {
  AjaxClient.get({
    url: URLS['sampleType'].typeList + "?" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      searchTypeHtml(rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取类别失败');
    }
  }, this);
};


// 增加声明                                    //

function model() {
    layerModal = layer.open({
    type: 1,
    skin: 'layui-layer-rim', //加上边框
    closeBtn: 0,
    area: ['1500px', '500px'], //宽高
    content: `
              <h2 style="text-align:center; margin-top:20px;">产品研发部样册使用声明</h2>
              <p style="margin-top:20px; line-height:30px; font-size:17px; padding-left:20px; padding-right:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;本样册中的所有内容，例如文本、图形或图表、标识、照片、图标、图像，均属产品研发部与品管部、生产部沟通确认后上传。功能中所有内容由产品研发部标准组进行日常维护（新增、修改、删除），样册功能中的内容，仅供相关部门查询使用，因照片或图片的拍摄设备型号不同，及照片或图片用于展示或显示的设备型号（设备像素）不同，会产生颜色、花纹上的视觉差异。不建议以任何方式截图分发、上传、发布或传输该样册中的内容（以实物样册为准）。出于任何其他目的截图分发、再版、上传、发布或传输该样册中的内容供生产使用，误导生产，导致生产错误的本部门不负责。</p>
              <p style="line-height:30px; font-size:17px; padding-left:20px; padding-right:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;作为产品研发部，将会积极配合相关样册需求部门对样册平台内容提出的建议或意见；但产品研发部有权拒绝无法用电子样册替代实物样册，而要求维护的行为。本部门对样册维护的准确性负责。</p>
              <p style="line-height:30px; font-size:17px; padding-left:20px; padding-right:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;另：MES系统中通过链接的形式将样册中的内容关联到相关查询功能进行直接展示的，同样适用本声明。</p>
              
              <div style="float:right; font-size:17px; margin-right:200px; margin-top:30px;">
                  <p > 产品研发部</p>
                  <p > 2019年10月8日</p>
              </div>
                
              <div style="float:right; font-size:17px; margin-right:-150px; margin-top:100px;">
                <button type="button" class="layui-btn layui-btn-normal" id="yes">同意</button>
                 <button type="button" class="layui-btn layui-btn-primary" id="no">不同意</button>
              </div>
              `,
    });

    $('#yes').on('click', function() {
        layer.close(layerModal);
        evn();
    })

    $('#no').on('click', function() {
        window.history.go(-1);
    })
}



function getPreCodeList(id) {
  AjaxClient.get({
    url: URLS['sampleCode'].codeList + "?" + _token + "&type_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      searchCodeHtml(rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取编码前缀失败');
    }
  }, this);
}

function searchTypeHtml(fileData) {
  var _html = `<li data-id="0" data-name="" class="el-select-dropdown-item">--请选择--</li>`;
  fileData.forEach(function (item, index) {

    _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.type_name)}" class="el-select-dropdown-item">${item.type_name}</li>
        `;
  });
  $('.select_type').find('.el-select-dropdown-list').html(_html);
};

function searchCodeHtml(fileData) {
  var _html = `<li data-id="0" data-name="" class="el-select-dropdown-item">--请选择--</li>`;
  fileData.forEach(function (item, index) {

    _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${item.name}</li>
        `;
  });
  $('.select_code').find('.el-select-dropdown-list').html(_html);
};

//重置搜索参数
function resetParam() {
  ajaxData = {
    bh: '',
    mc: '',
    color: '',
    status: '',
    type: '',
    pre_code: '',
    order: 'desc',
    sort: 'id'
  };
  $("#select_type").val("--请选择--");
  $("#select_code").val("--请选择--");
  $("#select_bh").val("");
}

//显示错误信息
function showInvalidMessage(name, val) {
  $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

//获取样册号列表
function getSampleNumberList() {
  $('.table_tbody').html('');
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['sample'].CurrentversionList + "?" + _token + urlLeft + "&page_no=" + pageNo + "&page_size=" + pageSize,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var pageTotal = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        // var parent_id=rsp.results[0].parent_id;
        $('.table_tbody').html(sampleNumberHtml(rsp.results));
      } else {
        noData('暂无数据', 6);
      }
      if (pageTotal > pageSize) {
        bindPagenationClick(pageTotal, pageSize);
      } else {
        $('#pagenation').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取质量类别列表失败，请刷新重试', 6);
    }
  }, this);
};

function sampleNumberHtml(data) {
  var tr = '';
  data.forEach(function (item) {
	tr += `<tr class="no-line-tr">
			<td>
				<input data-id="${item.id}" type="checkbox" lay-skin="primary" id="all">
			</td>
            <td>${tansferNull(item.bh)}</td>
            <td>${tansferNull(item.mc)}</td>
            <td>${tansferNull(item.status)}</td>
            <td>${tansferNull(item.type_name)}</td>
            <td>${tansferNull(item.color)}</td>
            <td>${tansferNull(item.realfilename)}</td>
            <td class="right">
            <button class="button pop-button view" data-id="${item.id}">查看</button>
            <a href="/SampleNumber/addSampleNumber?id=${item.id}&type=edit" style="padding-right:5px;color:#00a0e9;"><button class="button pop-button" data-id="${item.id}">编辑</botton></a>
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
      getSampleNumberList(status);
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

  $('.uniquetable').on('click', '.view', function () {
    $(this).parents('tr').addClass('active');
    getImgInfo($(this).attr("data-id"));
  });
  $('.uniquetable').on('click', '.edit', function () {
    nameCorrect = !1;
    codeCorrect = !1;
    $(this).parents('tr').addClass('active');
    viewSampleNumber($(this).attr("data-id"), 'edit');
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
      deleteSampleNumber(id);
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
  $('body').on('click', '#searchForm:not(".disabled") .select_type .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    getPreCodeList($(this).attr('data-id'));
  })

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
      bh: encodeURIComponent(parentForm.find('#search_bh').val().trim()),
      type: type,
      color: encodeURIComponent(parentForm.find('#search_color').val().trim()),
      mc: encodeURIComponent(parentForm.find('#search_name').val().trim()),
      status: encodeURIComponent(parentForm.find('#search_status').val().trim()),
      pre_code: pre_code,
      order: 'desc',
      sort: 'id'
    };
    getSampleNumberList();
  });

  $('body').on('click', '#typeList .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    //获取编码select列表
    var code_id = $(this).attr('data-id');
    var flag = $("#flag").val();
    getSampleNumberCode(code_id, flag);
  })

  $('body').on('click', '#codeListItem .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    //获取编码select列表
    var code_id = $(this).attr('data-id');
    getSampleNumberCodeNumber(code_id);
  })

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetParam();
    getSampleNumberList();
  });

  //添加和编辑的提交
  $('body').on('click', '.formInspect:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addInspect_from'),
        id = parentForm.find('#itemId').val(),
        flag = parentForm.attr("data-flag");
      for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type); }
      if (nameCorrect && codeCorrect) {
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        var name = parentForm.find('#name').val().trim(),
          datacode = parentForm.find('#parent_code_id').attr('data-code'),
          code = parentForm.find('#code').val().trim(),
          color = parentForm.find('#color').val().trim(),
          status = parentForm.find('#status').val().trim(),
          image_name = parentForm.find(".uploaded").attr('data-image-name') ? parentForm.find(".uploaded").attr('data-image-name').trim() : '',
          image_origin_name = parentForm.find(".uploaded").attr('data-image-origin-name') ? parentForm.find(".uploaded").attr('data-image-origin-name').trim() : '',
          parent_id = parentForm.find('#parent_id').val() || 0,
          parent_code_id = parentForm.find('#parent_code_id').val() || 0;

        $(this).hasClass('edit') ? (
          editInspect({
            id: id,
            mc: name,
            bh: code,
            type: parent_id,
            code_id: parent_code_id,
            color: color,
            status: status,
            image_name: image_name,
            image_orgin_name: image_origin_name,
            _token: TOKEN
          })
        ) : (
            addInspect({
              mc: name,
              bh: code,
              type: parent_id,
              code_id: parent_code_id,
              color: color,
              status: status,
              image_name: image_name,
              image_orgin_name: image_origin_name,
              _token: TOKEN
            })
          )
      }
    }
  });
  //输入框的相关事件
  $('body').on('focus', '.formInspect:not(".disabled") .el-input:not([readonly])', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '.formInspect:not(".disabled") .el-input:not([readonly])', function () {
    // var flag=$('#addInspect_from').attr("data-flag"),
    //     name=$(this).attr("id"),
    //     id=$('#itemId').val();
    // validatorConfig[name]
    // && validatorToolBox[validatorConfig[name]]
    // && validatorToolBox[validatorConfig[name]](name)
    // && remoteValidatorConfig[name]
    // && remoteValidatorToolbox[remoteValidatorConfig[name]]
    // && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
  });
  //添加样册号
  $('.button_add').on('click', function () {
    nameCorrect = !1;
    codeCorrect = !1;
    // getCategories(0,'add');
    getSampleNumberListObjects(0, 'add');
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

  $('body').on('click', '.el-tap-wrap .el-tap', function () {
    var form = $(this).attr('data-item');
    if (!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      $('.pic-wrap #' + form).addClass('active').siblings('.el-panel').removeClass('active');
    }
  });

  //图纸放大
  $('body').on('click', '.el-icon.fa-search-plus', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
    zoomPic(1, obj);
  });

  //图纸缩小
  $('body').on('click', '.el-icon.fa-search-minus', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
    console.log(obj)
    zoomPic(-1, obj);
  });

  //图纸旋转
  $('body').on('click', '.el-icon.fa-rotate-right', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
    rotatePic(obj);
  });
};

//获取类型select列表
// function getSampleNumberListObjects(id, flag, data) {
//   var dtd = $.Deferred();
//   AjaxClient.get({
//     url: URLS['sampleType'].typeList + "?" + _token,
//     dataType: 'json',
//     beforeSend: function () {
//       layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       layer.close(layerLoading);
//       Modal(flag, rsp.results, data);
//       dtd.resolve(rsp);
//     },
//     fail: function (rsp) {
//       layer.close(layerLoading);
//       console.log('获取类别失败');
//       dtd.reject(rsp);
//     }
//   }, this);
//   return dtd;
// };

function getSampleNumberCodeNumber(id) {
  AjaxClient.get({
    url: URLS['sample'].generateCode + "?" + _token + "&code_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('#code').val(rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取编码前缀失败');
    }
  }, this);
}

//获取编码select列表
function getSampleNumberCode(id, flag) {
  AjaxClient.get({
    url: URLS['sampleCode'].codeList + "?" + _token + "&type_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      sampleNumberCode = rsp.results;
      $('#codeListItem .el-select-dropdown-wrap').remove();
      $('#codeListItem #code').remove();
      $('#codeListItem').append(selectCodeHtml(sampleNumberCode, flag, id));
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取编码前缀失败');
    }
  }, this);
};


function Modal(data, flag) {
  transformStyle = {
    rotate: "rotate(0deg)",
    scale: "scale(1)",
  };
  var { id = '', code_name = '', bh = '', mc = '', status = '', code_id = '', stat = '', type_name = '', typ = '', color = '', filename = '', filepath = '' } = {};
  if (data) {
    ({ id='', code_name='', bh='', mc='', status='', code_id='', stat='', type_name='', typ='', color='', filename='', filepath='' } = data[0]);
  }
  
  var img = new Image(),
    wwidth = $(window).width(),
    wheight = $(window).height() - 200;
  if (flag) {
    img.src = data[0].image_path;
    if (data.attribute) {
      attribute = data.attribute;
    }
  }
  var nwidth = wwidth ? (wwidth * 0.5) : (img.width),
    nheight = wheight ? (Number(wheight - 80)) : (img.height + 90);
  nwidth < 500 ? nwidth = 500 : null;
  nheight < 400 ? nheight = 400 : null;
  var mwidth = nwidth + 'px',
    mheight = nheight + 'px';
  // conso
  layerModal = layer.open({
    type: 1,
    title: '样册号信息',
    offset: '100px',
    area: [mwidth, mheight],
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content: `<div class="pic-wrap-container">
                  <div class="pic-wrap">
                      <div class="el-tap-wrap edit">
                          <span data-item="image_form" class="el-tap active">样册号图片</span>
                          <span data-item="basic_form" class="el-tap">属性信息</span> 
                      </div>  
                      <div class="el-panel-wrap" style="padding-top: 10px;">
                          <div class="el-panel image_form active" id="image_form">
                              <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight - 130}px"></div>
                              <div class="action">
                                  <i class="el-icon fa-search-plus"></i>
                                  <i class="el-icon fa-search-minus"></i>
                                  <i class="el-icon fa-rotate-right"></i>
                              </div>
                          </div>
                          <div class="el-panel" id="basic_form">
                              <div class="imginfo">
                                  <div class="el-form-item" style="width:100%;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label">类型:</label>
                                          <span>${tansferNull(type_name)}</span>
                                      </div> 
                                  </div>
                                  <div class="el-form-item" style="width:100%;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label">编码:</label>
                                          <span>${bh}</span>
                                      </div> 
                                  </div>
                                  <div class="el-form-item" style="width:100%;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label">名称:</label>
                                          <span>${mc}</span>
                                      </div> 
                                  </div>
                                  <div class="el-form-item" style="width:100%;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label">状态:</label>
                                          <span>${tansferNull(status)}</span>
                                      </div> 
                                  </div>
                                  <div class="el-form-item" style="width:100%;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label">颜色:</label>
                                          <span>${tansferNull(color)}</span>
                                      </div> 
                                  </div>
                              </div> 
                          </div>
                      </div>
                  </div>
              </div>`,
    success: function () {
      var imgObj = $('<img src="' + filepath + filename + '" alt="" />');
      img.onload = function () {
        imgObj.css({
          "left": (nwidth - img.width) / 2,
          "top": (nheight - img.height) / 2,
          'height': img.height + 'px',
        });
        imgObj.attr({ "data-scale": 1, "data-rotate": 0 });
        // if (img.width > nwidth || img.height > (nheight - 130)) {
          var widthscale = nwidth / img.width,
            heightscale = nheight / img.height,
            scale = Math.max(Math.min(widthscale, heightscale), 0.1),
            imgHeight = img.height * scale;
          imgObj.attr("data-scale", scale.toFixed(2));
          transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
          imgObj.css({
            "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
            "transform": transformStyle.rotate + " " + transformStyle.scale,
            "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
          });
        // }
      }
      imgObj.on({
        "mousedown": function (e) {
          e.preventDefault();
          e.stopPropagation();
          isMove = false;
          var mTop = e.clientY;
          var mLeft = e.clientX;
          var oTop = parseFloat($(this).css("top"));
          var oLeft = parseFloat($(this).css("left"));
          var disTop = mTop - oTop;
          var disLeft = mLeft - oLeft;
          var that = $(this);
          that.css({
            "cursor": "url(images/cur/closedhand.cur) 8 8, default"
          });
          $(document).on("mousemove", function (event) {
            isMove = true;
            var x = event.clientX;
            var y = event.clientY;
            var posX = x - disLeft;
            var posY = y - disTop;
            that.css({
              "top": posY + "px",
              "left": posX + "px"
            });
          });
        }
      });
      $(document).on("mouseup", function (e) {
        $(document).off("mousemove");
        $(document).off("mousedown");
        $(imgObj).css({
          "cursor": "url(images/cur/openhand.cur) 8 8, default"
        });
      });
      $('.pic-detail-wrap').append(imgObj);
      zoomPcIMG();
    },
    end: function () {
      $("body").css("overflow-y", "auto");
    }
  })
}

function zoomPcIMG() {
  $("body").css("overflow-y", "hidden");
  var imgele = $("#image_form .pic-detail-wrap").find('img');
  if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
    $("#image_form .pic-detail-wrap").on("DOMMouseScroll", function (e) {
      wheelZoom(e, imgele, true);
    });
  } else {
    $("#image_form .pic-detail-wrap").on("mousewheel", function (e) {
      wheelZoom(e, imgele);
    });
  }
}

function wheelZoom(e, obj, isFirefox) {
  var zoomDetail = e.originalEvent.wheelDelta;
  if (isFirefox) {
    zoomDetail = -e.originalEvent.detail;
  }
  zoomPic(zoomDetail, $(obj));
}

function zoomPic(zoomDetail, obj) {
  var scale = Number($(obj).attr("data-scale"));
  if (zoomDetail > 0) {
    scale = scale + 0.05;
  } else {
    scale = scale - 0.05;
  }
  if (scale > 2) {
    scale = 2;
  } else if (scale < 0.1) {
    scale = 0.1;
  }
  obj.attr("data-scale", scale.toFixed(2));
  transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
  obj.css({
    "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
    "transform": transformStyle.rotate + " " + transformStyle.scale,
    "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
  });
}

function rotatePic(obj) {
  var rotate = Number($(obj).attr("data-rotate")) || 0;
  rotate += 90;
  if (rotate >= 360) {
    rotate = 0;
  }
  obj.attr("data-rotate", rotate);
  transformStyle.rotate = 'rotate(' + rotate + 'deg)';
  obj.css({
    "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
    "transform": transformStyle.rotate + " " + transformStyle.scale,
    "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
  });
}

//附件初始化
function fileinit(preUrls, preothers) {

  $("#avatar-2").fileinput({
    uploadAsync: true,
    language: 'zh',
    'uploadUrl': URLS['sample'].uploadPicture,
    uploadExtraData: function (previewId, index) {
      var obj = {};
      obj.flag = 'personal';
      obj._token = TOKEN;
      obj.creator_token = creator_token;
      return obj;
    },
    overwriteInitial: true,
    defaultPreviewContent: '<img src="/statics/custom/img/avatar.png" alt="">',
    initialPreview: preUrls,
    initialPreviewConfig: preothers,
    showCaption: false,//隐藏标题
    showClose: false, //关闭按钮
    showBrowse: false,//浏览按钮
    browseOnZoneClick: true, //点击上传
    maxFileSize: 1500,
    layoutTemplates: { main2: '{preview}' },
    msgErrorClass: 'alert alert-block alert-danger',
    allowedFileExtensions: ["jpg", "png", "gif"],
  }).on('fileselect', function (event, numFiles, label) {

    $(this).fileinput("upload");
  }).on('fileloaded', function (event, file, previewId, index, reader) {
    $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
  }).on('fileuploaded', function (event, data, previewId, index) {
    var result = data.response,
      file = data.files[0];

    if (result.code == '200') {
      $('.file-preview-frame[data-preview=preview-' + file.lastModified + ']').addClass('uploaded').
        attr({
          'data-image-name': result.results.image_name,
          'data-image-origin-name': result.results.image_orgin_name,
        });
    }

  }).on('filebeforedelete', function (event, key, data) {

    console.log('附件删除');
  })
}

//生成上级分类数据
function selectHtml(fileData, flag, value) {
  var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
  if (fileData.length) {
    parent_id = fileData[0].parent_id;
    lis = treeHtml(fileData, parent_id, 'select', value);
  }
  itemSelect.length ? (selectVal = itemSelect[0].name, parent_id = itemSelect[0].id) :
    (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
  if (flag === 'view' || flag === 'edit') {
    innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
  } else {
    innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="">
		</div>
		<div class="el-select-dropdown" id="typeList">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
  }
  elSelect = `<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
  itemSelect = [];
  return elSelect;
}

function treeHtml(fileData, parent_id, flag, value) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    var distance, className, itemImageClass, tagI;
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`) : (distance = level * 20, tagI = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.type_name}</span> </div>` : `${tagI}<span>${item.type_name}</span> `;
    if (flag === 'table') {
      _html += `
        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
          <td>${span}</td>
          <td>${item.docking_people}</td>
          <td class="right">
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
            </td>
          </tr>
        ${treeHtml(fileData, item.id, flag)}
        `;
    } else {
      item.id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
      _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.type_name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
        ${treeHtml(fileData, item.id, flag, value)}
        `;
    }
  });
  return _html;
};

function selectCodeHtml(sampleNumberCode, flag, value) {
  var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
  if (sampleNumberCode.length) {
    parent_id = sampleNumberCode[0].parent_id;
    lis = treeCodeHtml(sampleNumberCode, parent_id, 'select', value);
  }
  itemSelect.length ? (selectVal = itemSelect[0].name, parent_id = itemSelect[0].id) :
    (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
  if (flag === 'view' || flag === 'edit') {
    innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectCodeVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
  } else {
    innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectCodeVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="parent_code_id" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
  }
  elSelect = `<div class="el-select-dropdown-wrap">${innerhtml}</div>`;
  itemSelect = [];
  return elSelect;
}

function treeCodeHtml(fileData, parent_id, flag, value) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    var distance, className, itemImageClass, tagI;
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`) : (distance = level * 20, tagI = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> </div>` : `${tagI}<span>${item.name}</span> `;
    if (flag === 'table') {
      _html += `
        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
          <td>${span}</td>
          <td>${item.docking_people}</td>
          <td class="right">
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
              <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
            </td>
          </tr>
        ${treeCodeHtml(fileData, item.id, flag)}
        `;
    } else {
      item.id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
      _html += `
      <li data-id="${item.id}" data-pid="${parent_id}" data-type="${item.type}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
        ${treeCodeHtml(fileData, item.id, flag, value)}
        `;
    }
  });
  return _html;
};

//编辑样册号
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
      getSampleNumberList();
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
//添加样册号
function addInspect(data) {
  AjaxClient.post({
    url: URLS['sample'].CurrentversionAdd,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getSampleNumberList();
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
//查看样册号
function getImgInfo(id) {
  AjaxClient.get({
    url: URLS['sample'].currentversionshow + "?" + _token + "&id=" + id,
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
        getSampleNumberList();
      }
    }
  }, this);
}
//删除样册号
function deleteSampleNumber(id) {
  AjaxClient.post({
    url: URLS['sample'].currentversionDelete + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      // LayerConfig('success','删除成功');
      getSampleNumberList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getSampleNumberList();
      }
    }
  }, this);
}



//  全选
$('body').on('click', '#al', function () {
	all_checked = $('#tbody input');
	if (document.getElementById('al').checked == true) {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = true;
		}
	} else {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = false;
		}
	}

})


// 反选
$('body').on('change', '#tbody input', function () {
	all_checked = $('#tbody  input');
	if (this.checked == false) {
		document.getElementById('al').checked = false;
	} else {
		document.getElementById('al').checked = true;
		for (let i = 0; i < all_checked.length; i++) {
			if (all_checked[i].checked == false) {
				return document.getElementById('al').checked = false;
			}
		}
	}
})

// 批量下载
$('body').on('click', '#btn-load', function() {
	arr = [];
	let id = '';
	let checked = $('#tbody input');
	for (let i = 0; i < checked.length; i++) {
		if ($(checked[i]).prop('checked') == true) {
			arr.push($(checked[i]).attr('data-id'));
		}
	}

	for (let j = 0; j < arr.length; j++) {
		if (j == 0) {
			id = arr[j];
		} else {
			id = id + ',' + arr[j];
		}
	}

	$('#btn-load').attr('href', '/CurrentversionPicture/downCurrentversion?_token=8b5491b17a70e24107c89f37b1036078&data='+id);
})