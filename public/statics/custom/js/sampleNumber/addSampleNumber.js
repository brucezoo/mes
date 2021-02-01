var layerModal,
  layerLoading,
  layerEle = '',
  itemSelect = [],
  ajaxData={},
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

$(function () {
  var type=getQueryString('type');
  var id=getQueryString('id');
  if(type=='edit'){
    $(".msaveBtn").find(".add").hide();
    $(".msaveBtn").find(".edit").show();
    if(id){
      getSampleNumberDetail(id);
    }else{
      layer.msg('缺少id参数', { icon: 5, offset: '250px', time: 1500 });
    }
  }else{
    getSearchTypeList();
    fileinit([], []);
  }
  bindEvent();
});

//显示错误信息
function showInvalidMessage(name, val) {
  $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addSampleNumber').find('.submit').removeClass('is-disabled');
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

function getPreCodeList(id){
  AjaxClient.get({
    url: URLS['sampleCode'].codeList + "?" + _token+"&type_id="+id,
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

// function searchCodeHtml(fileData) {
//   var _html = `<li data-id="0" data-name="" class="el-select-dropdown-item">--请选择--</li>`;
//   fileData.forEach(function (item, index) {      
//       _html += `
//       <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-select-dropdown-item">${item.name}</li>
//         `;
//   });
//   $('.select_code').find('.el-select-dropdown-list').html(_html);
// };

//编辑和查看
function getSampleNumberDetail(id){
  AjaxClient.get({
    url: URLS['sample'].currentversionshow + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if(rsp.results)(getSampleNumberDetailHtml(rsp.results));
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取该分类失败');
    }
  }, this);
}

//获取图纸详情
function getImgInfo(id) {
  AjaxClient.get({
      url: URLS['image'].show + "?" + _token + "&drawing_id=" + id,
      dataType: 'json',
      beforeSend: function () {
          layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
          layer.close(layerLoading);
          if (rsp && rsp.results) {
              Modal(rsp.results, 1);

              imgType(function () {
                  var text = $('.el-form-item.type .el-select-dropdown-item[data-id=' + rsp.results.type_id + ']').addClass('selected').text();
                  $('#type_id').val(rsp.results.type_id).siblings('.el-input').val(text);
                  imgGroup(rsp.results.type_id, rsp.results.group_id);
              });
          }
      },
      fail: function (rsp) {
          layer.close(layerLoading);
          console.log('获取图纸失败');
      }
  }, this);
}

function getSampleNumberDetailHtml(data){
  var thtml,labelWidth=100,readonly="readonly='readonly'";

  var { id = '', code_name='',bh = '', mc = '', status = '', code_id = '', stat = '', type_name = '', typ = '', color = '', filename = '', filepath = '' } = {};
  if (data) {
    ({ id='', code_name='',bh='', mc='', status='', code_id='', stat='', type_name='', typ='', color='', filename='', filepath='' } = data[0]);
  }
  if(data){
    thtml=`<div class="basic-wrap" style="width: 500px;">
    <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">类型</label>
                <input type="text" id="type" readonly="readonly" data-name="类型" class="el-input" placeholder="请输入类型" value="${tansferNull(type_name)}">
                <input type="hidden" class="val_id" id="parent_id" value="${typ}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                <input type="text" id="code" ${readonly} data-name="编码" class="el-input" placeholder="请输入编码" value="${code_name+bh}">
                <input type="hidden" id="parent_code_id" value="${code_id}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${mc}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">状态</label>
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" class="el-input" value="${status}">
                            <input type="hidden" class="val_id" id="status" value="${stat}">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="0"  class=" el-select-dropdown-item">停用</li>
                                <li data-id="1"  class=" el-select-dropdown-item">使用</li>
                            </ul>
                        </div>
                    </div>
                </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: ${labelWidth}px;">颜色</label>
                  <input type="text" id="color" data-name="颜色" class="el-input" placeholder="请输入颜色" value="${color}">
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">上传图片<span class="mustItem">*</span></label>
                <div class="kv-avatar">
                  <div class="file-loading">
                    <input id="avatar-2" name="file" type="file" required data-preview-file-type="image">
                  </div>
                </div>
              <div id="kv-avatar-errors-2" class="center-block" style="width:800px;display:none"></div>
            </div>
            </div>
  </div>`
  }else{
    thtml=`<div class="basic-wrap" style="width: 500px;">暂无数据
  </div>`
  }
  $("#addSampleNumber").html(thtml);
  if (data && data.length) {
    var img = new Image(),
      wwidth = $(window).width(),
      wheight = $(window).height() - 200;
    if (data[0].filepath != '') {
      img.src = data[0].image_path;
      var preurls = [], preOther = [];
      var urls = data[0].filepath + data[0].filename, preview = '';
	  // window.height
		preview = `<img src="${urls}" class="uploaded" style="max-width:100%;max-height:100%;"  data-img-name="${data[0].realfilename}"  data-image-name="${data[0].filepath}" data-image-origin-name="${data[0].filename}"  data-img-origin-name="${data[0].filename}" data-url="${data[0].filepath}" attachment_id="${data[0].id}">`;
      var pitem = {
        url: URLS['sample'].destroyPicture + '?image_path=' + data[0].filepath + data[0].filename + "&" + _token
      };

      preurls.push(preview);
      preOther.push(pitem);
      fileinit(preurls, preOther);
    }
  }
}

function bindEvent() {
  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
  });
  $('body').on('click', '.el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
  });

  //弹窗取消
  $('body').on('click', '.cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  //选项下拉
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  //下拉选择
  $('body').on('click', '.el-select-dropdown-item', function (e) {
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

  // $('body').on('click','.select_type .el-select-dropdown-item',function(e){
  //   e.stopPropagation();
  //   getPreCodeList($(this).attr('data-id'));
  // })

  // $('body').on('click','.select_code .el-select-dropdown-item',function(e){
  //   e.stopPropagation();
  //   //获取编码select列表
  //   var code_id=$(this).attr('data-id');
  //   getSampleNumberCodeNumber(code_id);
  // })

  //添加和编辑的提交
  $('body').on('click', '.msaveBtn:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    console.log('保存submit')
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $('#addSampleNumber');
      for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type); }
      if (nameCorrect && codeCorrect) {
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        var id=getQueryString('id');
        var name = parentForm.find('#name').val().trim(),
          code = parentForm.find('#code').val().trim(),
          color = parentForm.find('#color').val().trim(),
          status = parentForm.find('#status').val().trim(),
          image_name = parentForm.find(".uploaded").attr('data-image-name') ? parentForm.find(".uploaded").attr('data-image-name').trim() : '',
          image_origin_name = parentForm.find(".uploaded").attr('data-image-origin-name') ? parentForm.find(".uploaded").attr('data-image-origin-name').trim() : '',
          parent_id = parentForm.find('#parent_id').val() || 0,
		  parent_code_id = parentForm.find('#parent_code_id').val() || 0;
		  
		  img_origin_name = parentForm.find(".uploaded").attr('data-img-name') ? parentForm.find(".uploaded").attr('data-img-name').trim() :  image_origin_name,
		  img_name = parentForm.find(".uploaded").attr('data-img-origin-name') ? parentForm.find(".uploaded").attr('data-img-origin-name').trim() : image_name,
		  $(this).hasClass('edit') ? (
          editInspect({
            id: id,
            mc: name,
            bh: code,
            type: parent_id,
            code_id: parent_code_id,
            color: color,
            status: status,
            image_name: img_name,
            image_orgin_name: img_origin_name,
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
  $('body').on('focus', '.el-input:not([readonly])', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    $(this).parents('.basic-wrap').find('.codeMessage').removeClass('active').html("");
  }).on('blur', '.el-input', function () {
    var flag=$('#addInspect_from').attr("data-flag"),
        name=$(this).attr("id"),
        id=$('#itemId').val();
    validatorConfig[name]
    && validatorToolBox[validatorConfig[name]]
    && validatorToolBox[validatorConfig[name]](name)
    // && remoteValidatorConfig[name]
    // && remoteValidatorToolbox[remoteValidatorConfig[name]]
    // && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
  });
};

function getSampleNumberCodeNumber(id){
  AjaxClient.get({
    url: URLS['sample'].generateCode + "?" + _token+"&code_id="+id,
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


//图片上传初始化
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
    defaultPreviewContent: '<img src="/statics/custom/img/pic.png" alt="">',
    initialPreview: preUrls,
    initialPreviewConfig: preothers,
    showCaption: false,//隐藏标题
    showClose: false, //关闭按钮
    showBrowse: false,//浏览按钮
    browseOnZoneClick: true, //点击上传
    maxFileSize: 15000,
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
      layer.confirm("编辑成功", {
        icon: 1,
        btn: ['确定'],
        closeBtn: 0,
        title: false,
        offset: '250px'
    },function(index){
      layer.close(index);
      window.location.href = "/SampleNumber/SampleNumberList";
    });
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
      layer.confirm("添加成功", {
        icon: 1,
        btn: ['确定'],
        closeBtn: 0,
        title: false,
        offset: '250px'
    },function(index){
	  layer.close(index);
	  
	//   添加提示

			layerModal = layer.open({
				  type: 1,
				  skin: 'layui-layer-rim', //加上边框
				  area: ['420px', '160px'], //宽高
				  content: `
				 		<p style="font-size:20px;text-align:center;margin-top:20px; margin-bottom:20px;">是否继续添加？</p> 
						 <button style="float:right; margin-right:20px;" type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="no">否</button> 
				 		 <button style="float:right; margin-right:20px;" type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="ok">是</button>
					 `
			  });
			  
			  $('#ok').on('click', function() {
				  layer.close(layerModal);
				  window.location.reload();
			  })

			  $('#no').on('click', function() {
				  layer.close(layerModal);
				  window.location.href = "/SampleNumber/SampleNumberList";
			  })
    });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
    }
  }, this);
}
//查看样册号
function getImgInfo(id, flag) {
  AjaxClient.get({
    url: URLS['sample'].currentversionshow + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getSampleNumberListObjects(rsp.results.typ, flag, rsp.results);
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