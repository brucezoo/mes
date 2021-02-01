var layerModal,
  layerLoading,
  editFlag = '',
  layerEle = '',
  itemSelect = [],
  typeItemSelect = [],
  selectTypeData = [],
  personnelData = [],
  nameCorrect = !1,
  validatorToolBox = {
    checkName: function (name) {
      console.log(name)
      var value = $('#' + name).val().trim();
      return Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
        (nameCorrect = 1, !0);
    }
  },
  validatorConfig = {
    name: "checkName"
  };

$(function () {
  getChargeData();
  getPersonnelMessage();
  bindEvent();
});

//显示错误信息
function showInvalidMessage(name, val) {
  $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addMessage_from').find('.submit').removeClass('is-disabled');
}

function getPersonnelMessage() {
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['personnelMessage'].setpushmassagelist + "?" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results && rsp.results.length) {
        var parent_id = rsp.results[0].parent_id;
        $('.table_tbody').html(treeHtml(rsp.results, parent_id, 'table'));
      } else {
        noData('暂无数据', 3);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取质量类别列表失败，请刷新重试', 3);
    }
  }, this);
};

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
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>` : `${tagI}<span>${item.name}</span>`;
    if (flag === 'table') {
      _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${tansferNull(item.cn_name)}</div></td>
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
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag, value)}
	        `;
    }
  });
  return _html;
};

function bindEvent() {
  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
  });

  //弹窗取消
  $('body').on('click', '.formMessage:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });
  $('.uniquetable').on('click', '.view', function () {
    $(this).parents('tr').addClass('active');
    viewMessage($(this).attr("data-id"), 'view');
  });
  $('.uniquetable').on('click', '.edit', function () {
    nameCorrect = !1;
    $(this).parents('tr').addClass('active');
    viewMessage($(this).attr("data-id"), 'edit');
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
      deleteMessage(id);
    });
  });
  //弹窗下拉
  $('body').on('click', '.formMessage:not(".disabled") .el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();

  });
  //下拉选择
  $('body').on('click', '.formMessage:not(".disabled") .el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parents('.el-form-item').find('.errorMessage').html('');
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.el-input').attr('data-id', $(this).attr('data-id'));
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });


  //添加和编辑的提交
  $('body').on('click', '.formMessage:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    console.log('addMessage_form')
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addMessage_from'),
        id = parentForm.find('#itemId').val();
      for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type); }
      console.log(nameCorrect)
      if (nameCorrect) {
        console.log('nameCorrect')
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        var docking_people = parentForm.find('#name').attr('data-id').trim(),
          name = parentForm.find('#name').val(),
          grade = parentForm.find('#grade').val(),
          parent_id = parentForm.find('#parent_id').val() || 0;
        $(this).hasClass('edit') ? (
          editMessage({
            name: name,
            parent_id: parent_id,
            docking_people: docking_people,
            _token: TOKEN
          })
        ) : (
            addMessage({
              name: name,
              parent_id: parent_id,
              docking_people: docking_people,
              _token: TOKEN
            })
          )
      }
    }
  });

  //添加物料分类
  $('.button_add').on('click', function () {
    nameCorrect = !1;
    codeCorrect = !1;
    getPersonnelMes(0, 'add');
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

  //输入框的相关事件
  $('body').on('focus', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'name') {
      var that = $(this);
      createStorage(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else {
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  }).on('blur', '.parent .el-input:not([readonly])', function () {
    var name = $(this).attr('id'),
      id = $('itemId').val();
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name);
  }).on('input', '#name', function () {
    var that = $(this);
    createStorage(that);
  });
};

//获取select列表
function getPersonnelMes(id, flag, data) {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['personnelMessage'].setpushmassagelist + "?" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      Modal(flag, rsp.results, data);
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
};

//获得负责人
function getChargeData() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['personnelMessage'].employeeShow + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      personnelData = rsp.results;
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function createStorage(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, personnelData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      $('.el-form-item.parent').find('.el-select-dropdown-list').html(lis);
      if ($('.el-form-item.parent').find('.el-select-dropdown').is(":hidden")) {
        $('.el-form-item.parent').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//负责人
function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    var name = e.name;
    return name.indexOf(type) > -1;
  });
}

//查看和添加和编辑模态框
function Modal(flag, questions, data) {
  var { id = '', name = '', parent_id = '', docking_people = '' } = {};
  if (data) {
    ({ id='', name = '', parent_id = '', docking_people = '' } = data[0]);
  }
  var labelWidth = 100,
    btnShow = 'btnShow',
    title = '查看人员消息',
    readonly = '',
    selecthtml = selectHtml(questions, flag, parent_id);
  flag === 'view' ? (btnShow = 'btnHide', readonly = 'readonly="readonly"') : (flag === 'add' ? title = '添加人员消息' : (title = '编辑人员消息', textareaplaceholder = '', noEdit = 'readonly="readonly"'));
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formMessage" id="addMessage_from" data-flag="${flag}">
              <input type="hidden" id="itemId" value="${id}">
            <div class="el-form-item type">
              <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: ${labelWidth}px;">上级分类</label>
                  ${selecthtml}
              </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
            </div>
            <div class="el-form-item parent">
                  <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">名称</label>
                    <div class="el-select" style="width:100%;">
                      <input type="text" id="name" class="el-input" data-id=${id} ${readonly} autocomplete="off" placeholder="请输入名称" value="${name}">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                      </ul>
                    </div>
                  </div>
              <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
            </div>
            <div class="el-form-item ${btnShow}">
              <div class="el-form-item-div btn-group">
                  <button type="button" class="el-button cancle">取消</button>
                  <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
              </div>
            </div>
          </form>` ,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));
      var layerOffset = layero.offset();
      layero.find('.el-select').each(function (item) {
        var width = $(this).width();
        var height = $(this).height();
        var offset = $(this).offset();
        $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33 - layerOffset.top, left: offset.left - layerOffset.left });
      });
      if (parent_id) {
        console.log(parent_id)
        $('.el-select-dropdown-wrap.type').find('.el-select-dropdown-item[data-id=' + parent_id + ']').click();
      }
    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });
}

//生成上级分类数据
function selectHtml(fileData, flag, value) {
  var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
  console.log(fileData)
  if (fileData.length) {
    parent_id = fileData[0].parent_id;
    lis = treeHtml(fileData, parent_id, 'select', value);
  }
  itemSelect.length ? (selectVal = itemSelect[0].question_name, parent_id = itemSelect[0].id) :
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
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
  }
  elSelect = `<div class="el-select-dropdown-wrap type">
			${innerhtml}
		</div>`;
  itemSelect = [];
  return elSelect;
}
//编辑人员消息
function editMessage(data) {
  AjaxClient.post({
    url: URLS['personnelMessage'].updatesetPushmessage,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getPersonnelMessage();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
      if (rsp && rsp.field !== undefined) {
        showInvalidMessage(rsp.field, rsp.message);
      }
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this);
}
//添加人员消息
function addMessage(data) {
  AjaxClient.post({
    url: URLS['personnelMessage'].addsetPushmessage,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getPersonnelMessage();
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
//查看人员消息
function viewMessage(id, flag) {
  AjaxClient.get({
    url: URLS['personnelMessage'].setPushmessageshow + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getPersonnelMes(rsp.results[0].parent_id, flag, rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp.code == 404) {
        getPersonnelMessage();
      }
    }
  }, this);
}
//删除人员消息类别
function deleteMessage(id) {
  var data = {
    _token: TOKEN,
    id: id
  }
  AjaxClient.post({
    url: URLS['personnelMessage'].deletesetPushmessage,
    dataType: 'json',
    data: data,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getPersonnelMessage();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getPersonnelMessage();
      }
    }
  }, this);
}

function typeSelectHtml(fileData, flag, value) {
  var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
  if (fileData.length) {
    parent_id = fileData[0].parent_id;
    lis = typeTreeHtml(fileData, parent_id, 'select', value);
  }
  typeItemSelect.length ? (selectVal = typeItemSelect[0].name, parent_id = typeItemSelect[0].id) :
    (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
  if (flag === 'view' || flag === 'edit') {
    innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="type" value="${parent_id}">
		</div>`;
  } else {
    innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="type" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
  }
  elSelect = `<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
  typeItemSelect = [];
  return elSelect;
}

function typeTreeHtml(fileData, parent_id, flag, value) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    var distance, className, itemImageClass, tagI, itemcode = '';
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`, itemcode = `(${item.code})`) : (distance = level * 20, tagI = '', itemcode = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `${tagI}<span>${item.name}</span> ${itemcode}`;
    if (flag === 'table') {
      _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}</div></td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
    } else {
      item.id == value ? (typeItemSelect.push(item), selectedClass = 'selected') : null;
      _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${typeTreeHtml(fileData, item.id, flag, value)}
	        `;
    }
  });
  return _html;
};
