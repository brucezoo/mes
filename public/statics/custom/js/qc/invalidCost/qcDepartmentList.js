var layerModal,
  layerLoading,
  editFlag = '',
  layerEle = '',
  nameCorrect = !1,
  codeCorrect = !1,
  phoneCorrect = !1,
  faxCorrect = !1,
  emailCorrect = !1,
  itemSelect=[],
  validatorToolBox = {
    checkName: function (name) {
      var value = $('#' + name).val().trim();
      return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) :
        Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
          (nameCorrect = 1, !0);
    },
    checkPhone: function (name) {
      var value = $('#' + name).val().trim();

      if (value == "") {

        return phoneCorrect = 1;
      } else {
        return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (phoneCorrect = !1, !1) :
          !Validate.checkMobile(value) ? (showInvalidMessage(name, "手机号不正确"), phoneCorrect = !1, !1) : (phoneCorrect = 1, !0);
      }

    },
    checkFax: function (name) {
      var value = $('#' + name).val().trim();

      if (value == "") {

        return faxCorrect = 1;
      } else {
        return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (faxCorrect = !1, !1) :
          !Validate.checkFax(value) ? (showInvalidMessage(name, "传真格式不正确"), faxCorrect = !1, !1) : (faxCorrect = 1, !0);
      }
    },
    checkEmail: function (name) {
      var value = $('#' + name).val().trim();
      if (value == "") {
        return emailCorrect = 1;
      } else {
        return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (emailCorrect = !1, !1) :
          !Validate.checkEmail(value) ? (showInvalidMessage(name, "邮箱格式不正确"), emailCorrect = !1, !1) : (emailCorrect = 1, !0);
      }
    }
  },
  remoteValidatorToolbox = {
    remoteCheckName: function (name, flag, id) {
      var value = $('#' + name).val().trim();
      getUnique(flag, name, value, id, function (rsp) {
        // if (rsp.results && rsp.results.exist) {
		if (rsp.results.length > 0) {
          nameCorrect = !1;
          var val = '已注册';
          showInvalidMessage(name, val);
        } else {
          nameCorrect = 1;
        }
      });
    }
  },
  validatorConfig = {
    name: 'checkName',
    phone: 'checkPhone',
    fax: 'checkFax',
    email: 'checkEmail'
  },
  remoteValidatorConfig = {
    name: 'remoteCheckName'
  };

$(function () {
  getDepartment();
  bindEvent();
});

//显示错误信息
function showInvalidMessage(name, val) {
  $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
  $('#addQCType_from').find('.submit').removeClass('is-disabled');
}

function getDepartment() {
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['invalidCost'].getNextLevelList + "?" + _token + "&company_id=" + 15,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results && rsp.results.length) {
        var parent_id = rsp.results[0].parent_id,
          factory = rsp.results;
        $('.table_tbody').html(treeHtml(factory, parent_id, 'table',0,1));
      } else {
        noData('暂无数据', 7);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取列表失败，请刷新重试', 7);
    }
  }, this);
};

function treeHtml(fileData, parent_id, flag,value,level) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  console.log()
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    // var level = item.level;
    var distance, className, itemImageClass, tagI;
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`) : (distance = level * 20, tagI = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>` : `${tagI}<span>${item.name}</span>`;
    if (flag === 'table') {
      _html += `
	        <tr data-id="${item.department_id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${tansferNull(item.abbreviation)}</div></td>
	          <td><div>${tansferNull(item.phone)}</div></td>
	          <td><div>${tansferNull(item.fax)}</div></td>
	          <td><div>${tansferNull(item.email)}</div></td>
	          <td><div>${tansferNull(item.description)}</div></td>
	          <td class="right">
                <button data-id="${item.department_id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.department_id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.department_id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.department_id, flag,value,level+1)}
	        `;
    } else {
      item.department_id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
      _html += `
    		<li data-id="${item.department_id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.department_id, flag, value,level+1)}
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
  $('body').on('click', '.formDepartment:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });
  $('.uniquetable').on('click', '.view', function () {
    $(this).parents('tr').addClass('active');
    viewDepartment($(this).attr("data-id"), 'view');
  });
  $('.uniquetable').on('click', '.edit', function () {
    nameCorrect = !1;
    $(this).parents('tr').addClass('active');
    viewDepartment($(this).attr("data-id"), 'edit');
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
      deleteDepartment(id);
    });
  });
  //弹窗下拉
  $('body').on('click', '.formDepartment:not(".disabled") .el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });
  //下拉选择
  $('body').on('click', '.formDepartment:not(".disabled") .el-select-dropdown-item', function (e) {
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

  //添加和编辑的提交
  $('body').on('click', '.formDepartment:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#departmentModal_form'),
        id = parentForm.find('#itemId').val();
      var c_pid = parentForm.find('#parentId').attr('data-com-pid');
      for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type); }
      if (nameCorrect && phoneCorrect && faxCorrect && emailCorrect) {
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        console.log(parentForm.find('#abbr').val())
        var name = parentForm.find('#name').val().trim(),
          abbr = parentForm.find('#abbr').val().trim(),
          description = parentForm.find('#description').val().trim(),
          fax = parentForm.find('#fax').val().trim(),
          parent_id = parentForm.find('#parent_id').val().trim(),
          company_id=c_pid,
          phone = parentForm.find('#phone').val().trim(),
          email = parentForm.find('#email').val().trim();

        $(this).hasClass('edit') ? (
          editDepartment({
            name: name,
            abbreviation: abbr,
            description: description,
            department_id: id,
            // company_id: company_id,
            parent_id: parent_id,
            fax: fax,
            phone: phone,
            email: email,
            _token: TOKEN
          })
        ) : (
            addDepartment({
              name: name,
              abbreviation: abbr,
              description: description,
              fax: fax,
              company_id: company_id,
              parent_id: parent_id,
              phone: phone,
              email: email,
              _token: TOKEN
            })
          )
      }
    }
  });
  //输入框的相关事件
  $('body').on('focus', '.formDepartment:not(".disabled") .el-input:not([readonly])', function () {
    $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
  }).on('blur', '.formMateriel:not(".disabled") .el-input:not([readonly])', function () {
    var flag = $('#addMCategory_from').attr("data-flag"),
      name = $(this).attr("id"),
      id = $('#itemId').val();
    validatorConfig[name]
      && validatorToolBox[validatorConfig[name]]
      && validatorToolBox[validatorConfig[name]](name)
      && remoteValidatorConfig[name]
      && remoteValidatorToolbox[remoteValidatorConfig[name]]
      && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
  });

  //添加物料分类
  $('.button_add').on('click', function () {
    var id = $(this).attr('data-id'),
            flag = $(this).attr('data-flag'),
            c_id=$(this).attr('data-company-id');
    nameCorrect = !1;
    codeCorrect = !1;
    getDepartments(0, 'add',c_id);
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

  $('body').on('click','.cancle',function(e){
    e.stopPropagation();
      layer.close(layerModal);
  });
};

//查看和添加和编辑模态框
function getDepartments(ids, flag, pid, data) {
  var title = '查看部门', labelWidth = 100, readonly = '', btnShow = 'btnShow', placeholder = "请输入描述，最多能输入500个字符", noEdit = '';

  console.log(flag);
  flag == 'view' ? (readonly = 'readonly="readonly"', btnShow = 'btnHide', placeholder = '') : (flag == 'add' ? title = '添加部门' : (title = '编辑部门', noEdit = 'readonly="readonly"'));

  var { department_id = '', abbreviation = '', name = '', parent_id = '', description = '', fax = '', phone = '', email = '' } = {};

  if (data) {
    ({ department_id='', abbreviation='', name='', parent_id='', description='', fax='', phone='', email='' } = data);
  }
  var labelWidth = 100,
    title = title,
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
    move: false,
    content: `<form class="formDepartment formModal formMateriel" id="departmentModal_form" data-flag="${flag}">
      <input type="hidden" id="itemId" value="${ids}">
      <input type="hidden" id="parentId" data-com-pid="${pid}">
      <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
              <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${name}">
          </div>
          <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div>
      <div class="el-form-item select">
        <div class="el-form-item-div">
          <label class="el-form-item-label" style="width: ${labelWidth}px;">上级部门</label>
          <div class="el-select-dropdown-wrap">
            <div class="el-select">
              <i class="el-input-icon el-icon el-icon-caret-top"></i>
              <input type="text" readonly="readonly" class="el-input" value="--请选择--">
              <input type="hidden" class="val_id" id="parent_id" value="0">
            </div>
            <div class="el-select-dropdown">
              <ul class="el-select-dropdown-list">
                <li data-id="0" data-pid="0" class=" el-select-dropdown-item">--请选择--</li>
              </ul>
            </div>
          </div>
        </div>
        <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div>
      <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">缩写</label>
              <input type="text" id="abbr" value="${abbreviation}" ${readonly} data-name="缩写" class="el-input" placeholder="请输入缩写">
          </div>
          <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div> 
       <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">电话</label>
              <input type="text" id="phone" value="${phone}" ${readonly} data-name="电话" class="el-input" placeholder="请输入电话">
          </div>
          <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div>
       <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">传真</label>
              <input type="text" id="fax" value="${fax}" ${readonly} data-name="传真" class="el-input" placeholder="请输入传真">
          </div>
          <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div>
       <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">邮箱</label>
              <input type="text" id="email" value="${email}" ${readonly} data-name="邮箱" class="el-input" placeholder="请输入邮箱">
          </div>
          <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
      </div>
      <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
              <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
          </div>
          <p class="errorMessage" style="display: block;"></p>
      </div>
      <div class="el-form-item ${btnShow}">
          <div class="el-form-item-div btn-group">
              <button type="button" class="el-button cancle">取消</button>
              <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
          </div>
      </div>
</form>` ,
    success: function (layero, index) {
      //selectTypeHtml(type_id, flag, layero);
      getLayerSelectPosition($(layero));
      getDepartmentSelect(flag,data);
      var layerOffset = layero.offset();
      layero.find('.el-select').each(function (item) {
        var width = $(this).width();
        var height = $(this).height();
        var offset = $(this).offset();
        $(this).siblings('.el-select-dropdown').width(width).css({ top: offset.top + 33 - layerOffset.top, left: offset.left - layerOffset.left });
      });
    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });
}

//获取select列表
function getDepartmentSelect(flag,data){
	AjaxClient.get({
        url: URLS['invalidCost'].getNextLevelList+"?"+_token+"&company_id="+15,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var ul='',lis='',value='';
            if(data){
                value=data.parent_id;
            }
            if(rsp&&rsp.results&&rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                lis=treeHtml(rsp.results,parent_id,'select',value,1);
            }
            if(flag=='view'||flag=='edit'){
                var input=`<input type="text" readonly="readonly" class="el-input" placeholder="请输入字体标签" value="${itemSelect.length?itemSelect[0].name:'--无--'}">
                <input type="hidden" readonly="readonly" id="parent_id" class="el-input" placeholder="请输入字体标签" value="${data.parent_id}">`;
                $('#departmentModal_form .el-form-item.select .el-select-dropdown-wrap').remove();
                $('#departmentModal_form .el-form-item.select .el-form-item-label').after(input);

            }else{
                ul=`<ul class="el-select-dropdown-list">
                    <li data-id="0" data-pid="0" class=" el-select-dropdown-item">--请选择--</li>
                    ${lis}
                </ul>`;
                $('#departmentModal_form .el-form-item.select .el-select-dropdown').html(ul);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取上级菜单失败');
        }
    },this);
}

//编辑缺失项
function editDepartment(data) {
  AjaxClient.post({
    url: URLS['invalidCost'].update,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getDepartment();
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
//添加缺失项
function addDepartment(data) {
  AjaxClient.post({
    url: URLS['invalidCost'].store,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getDepartment();
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
//查看缺失项
function viewDepartment(id, flag) {
  AjaxClient.get({
    url: URLS['invalidCost'].show + "?" + _token + "&department_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getDepartments(id, flag, rsp.results.parent_id, rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp.code == 404) {
        getDepartment();
      }
    }
  }, this);
}
//删除缺失项类别
function deleteDepartment(id) {
  AjaxClient.post({
    url: URLS['invalidCost'].destroy + "?" + _token + "&department_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getDepartment();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getDepartment();
      }
    }
  }, this);
}

// function getUnique(flag,field,value,id,fn){
//   var urlLeft='';
//   if(flag==='edit'){
//       urlLeft=`&field=${field}&value=${value}&id=${id}`;
//   }else{
//       urlLeft=`&field=${field}&value=${value}`;
//   }
//   var xhr=AjaxClient.get({
//       url: URLS['invalidCost'].unique+"?"+_token+urlLeft,
//       dataType: 'json',
//       success: function(rsp){
//           if(rsp.results && rsp.results.exist){
//               editUnique = true;
//           }
//           fn && typeof fn==='function'? fn(rsp):null;
//       },
//       fail: function(rsp){
//           console.log('唯一性检测失败');
//       }
//   },this);
// }

//  检测唯一性重构
function getUnique(flag, field, value, id, fn) {
	AjaxClient.get({
		url: '/InvalidCost/checkTypeName' + '?' + _token + '&name=' + value + '&type=' + 0,
		dataType: 'json',
		success: function (rsp) {
			if (rsp.results.length > 0) {
				editUnique = true;
				fn && typeof fn === 'function' ? fn(rsp) : null;
			}
		},
		fail: function (rsp) {
			console.log('唯一性检测失败');
		}
	}, this);
}