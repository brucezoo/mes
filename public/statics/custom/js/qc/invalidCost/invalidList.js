var layerLoading,
    layerModal,
    pageNo = 1,
    pageSize = 50,
    ids = [],
    ajaxData = {};
viewurl = '',
    editurl = '',
    $(function () {
      resetParam();
      getInvalidCostList();
      bindEvent();
      getDepartment();
    });

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
      getInvalidCostList();
    }
  });
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    sales_order_code: '',
    sales_order_project_code: '',
    begin_time: '',
    end_time: '',
    item_no: '',
    harmful_item: '',
    handle_mode: '',
    invalid_item: '',
    duty_ascription: '',
    statistics_department: '',
    begin_handle_cost: '',
    end_handle_cost: '',
    is_handle:'',
    // type:'',
    number: ''
  };
}

function getInvalidCostList() {
  $('.table_tbody').html('');
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  AjaxClient.get({
    url: URLS['invalidCost'].getInvalidList + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createHtml($('.table_tbody'), rsp.results)
      } else {
        noData('暂无数据', 20)
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation').html('');
	  }
	  
		if (rsp.paging.total_records < 50) {
			$('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
		} else {
			$('#total').css('display', 'none').text(' ');
		}

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取列表数据失败，请刷新重试', 20);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this);
}

//删除其他入库单
function deleteOtherOutstore(id) {
  AjaxClient.get({
    url: URLS['otherOutstore'].del + "id=" + id + "&" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.msg('删除成功', { icon: 1, offset: '250px', time: 1500 });
      // if(leftNum==1){
      //     pageNo--;
      //     pageNo?null:(pageNo=1);
      // }
      getInvalidCostList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 2, offset: '250px', time: 1500 });
      if (rsp.code == 404) {
        getInvalidCostList();
      }
    }
  }, this);
}

//生成所属者列表
function selectHtml(fileData, typeid, value) {
  var innerhtml, lis = '', selectName = '', selectId = '';
  fileData.forEach(function (item) {
    if (value != undefined && value == item.id) {
      selectName = item.name;
      selectId = item.id;
    }
    lis += `<li data-id="${item.id}" class="el-select-dropdown-item ${value != undefined && item.id == value ? 'selected' : ''}" class=" el-select-dropdown-item">${item.name}</li>`;
  });
  innerhtml = `<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName != '' ? selectName : '--请选择--'}" style="width:100%">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId != '' ? selectId : ''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
  return innerhtml;
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

//生成列表数据
function createHtml(ele, data) {
  ele.html('');
  data.forEach(function (item, index) {
    var materials = '';
    if (item.material) {
      item.material.forEach(function (mitem) {
        materials += `<p>${mitem.item_no}：${mitem.name}</p>`;
      })
    }
    var invalid_item_str = jsonToNameStr(item.invalid_item),
        handle_mode_str = jsonToNameStr(item.handle_mode),
        harmful_item_str = jsonToNameStr(item.harmful_item),
        duty_ascription_str = jsonToNameStr(item.duty_ascription),
        statistics_department_str = jsonToNameStr(item.statistics_department);
    var tr = `
		    <tr>
                <td>${tansferNull(item.number)}</td>
                <td>${tansferNull(item.sales_order_code)}</td>
                <td>${item.sales_order_project_code ? tansferNull(item.sales_order_project_code.join()) : ''}</td>
                <td>${item.item_no ? tansferNull(item.item_no.join()) : ''}</td>
                <td style="width:250px;word-wrap:break-word;word-break:break-all;width:200px;">${materials}</td>
                <td>${tansferNull(item.bad_num)}</td>
                <td>${tansferNull(item.unit)}</td>
                <td>${tansferNull(item.problem_describe)}</td>
                <td>${tansferNull(harmful_item_str)}</td>
                <td>${tansferNull(handle_mode_str)}</td>
                <td>${tansferNull(invalid_item_str)}</td>
                <td>${tansferNull(item.handle_cost)}</td>
                <td>${tansferNull(duty_ascription_str)}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${tansferNull(statistics_department_str)}</td>
                <td>${tansferNull(item.is_handle==0?'待处理':item.is_handle==1?'处理中':'已处理')}</td>
                <td>${tansferNull(item.type==0?'失效提报':'索赔单')}</td>
                <td>${tansferNull(dateFormat(item.ctime,'Y-m-d H:i:s'))}</td>
                <td>${tansferNull(item.dtime?dateFormat(item.dtime,'Y-m-d H:i:s'):'')}</td>
                <td class="right nowrap">
                  <button data-id="${item.id}" class="button pop-button view">查看</button>
                </td>
	        </tr>
		`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
}

// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分')
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

function deleteInvalidCostItem(id) {
  AjaxClient.post({
    url: URLS['invalidCost'].delInvalidOfferById + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getInvalidCostList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      if (rsp && rsp.code == 404) {
        getInvalidCostList();
      }
    }
  }, this);
}

function getOneInvalidCost(data){
  if(data){
    var { sales_order_code = '', sales_order_project_code = '', item_no = '', material='',bad_num = '', unit='',unit_id = '', problem_describe = '', harmful_item = '', handle_mode = '', invalid_item = '', handle_cost = '', duty_ascription = '', statistics_department = '',is_handle='',type='',ctime='',dtime='' } = data;
  }
  var labelWidth = 150,
      title = '查看提报';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '20px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formPush" id="view_pushform" data-flag="">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">销售订单号</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${sales_order_code}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">销售订单行项号</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${sales_order_project_code.join()}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">物料编码</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${item_no.join()}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">物料名称</label>
                    <div class="el-select-dropdown-wrap">
                        <textarea type="text" readonly rows="5" class="el-input" autocomplete="off" value="">${jsonToNameStr(material)}</textarea>
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">不良数量</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${bad_num}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">单位</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${unit}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">处理费用</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${handle_cost}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">问题描述</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${problem_describe}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">不良项目</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${jsonToNameStr(harmful_item)}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">处理方式</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${jsonToNameStr(handle_mode)}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">失效项目</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${jsonToNameStr(invalid_item)}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">责任归属</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${jsonToNameStr(duty_ascription)}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">统计部门</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${jsonToNameStr(statistics_department)}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">处理状态</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${tansferNull(is_handle==0?'待处理':is_handle==1?'处理中':'已处理')}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">来源</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${tansferNull(type==0?'失效提报':'索赔单')}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">创建时间</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${dateFormat(ctime,'Y-m-d H:i:s')}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">处理时间</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" readonly class="el-input" autocomplete="off" value="${dtime?dateFormat(dtime,'Y-m-d H:i:s'):''}">
                    </div>
                </div>
                <p class="errorMessage" style="margin-left:100px;display: block;"></p>
            </div>
        </form>` ,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));
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

function Modal(ids) {
  var labelWidth = 150,
      btnShow = 'btnShow',
      title = '提交推送',
      readonly = '';
  var ids=ids.join();
  console.log(ids)
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '100px',
    area: '500px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="formModal formPush" id="add_pushform" data-flag=""> 
    <input type="hidden" id="pushIds" value="${ids}">

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
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
        </form>` ,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));
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

function pushForm(){
  var flag=false;
  var $itemJP = $('#judge_person_id');
  var judge_person_id = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
      $itemJP.data('inputItem').name == $itemJP.val().trim() ? $itemJP.data('inputItem').id : '';
  if (judge_person_id) {
    flag = true;
    $(".judge-person").find(".errorMessage").html('')
  } else {
    $(".judge-person").find(".errorMessage").html('*请输入审核人')
  }
  var ids=$("#pushIds").val();
  var data = {
    id_batch: ids,
    employee_id:judge_person_id,
    _token: TOKEN
  };
  if(flag){
    AjaxClient.post({
      url: URLS['invalidCost'].sendMessageBatch,
      data: data,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        layer.close(layerModal)
        getInvalidCostList();
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        layer.msg(rsp.message, { icon: 2, offset: '250px', time: 1500 });
        if (rsp.code == 404) {
          getInvalidCostList();
        }
      }
    }, this);
  }

}

function bindEvent() {
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

  //点击删除
  $('.uniquetable').on('click', '.button.pop-button.delete', function () {
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
        $('.uniquetable tr .active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      deleteOtherOutstore(id);
    });
  });

  //点击删除
  $('.uniquetable').on('click', '.button.pop-button.view', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    AjaxClient.get({
      url: URLS['invalidCost'].getInvalidOfferOne + "?" + _token + '&id=' + id,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        if (rsp.results) {
          getOneInvalidCost(rsp.results);
        }
      },
      fail: function (rsp) {
        dtd.reject(rsp);
      }
    }, this);
  });

  $('body').on('click', '#searchForm .push', function (e) {
    var ids = [];
    $(".table_tbody td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('data-id'));
      }
    })
    if(ids&&ids.length){
      Modal(ids);
    }else{
      layer.msg('请先选择需要推送的提报单！', { icon: 5, offset: '250px', time: 1500 });
    }
  })

  $('body').on('click', '#add_pushform .submit', function (e) {
    e.stopPropagation();
    pushForm();
  })

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
    getInvalidCostList();
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

  //搜索数据
  $('body').on('click', '#searchForm .submit', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('backageground', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      var parentForm = $(this).parents('#searchForm');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        sales_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
        sales_order_project_code: encodeURIComponent(parentForm.find('#sale_order_project_code').val().trim()),
        begin_time: parentForm.find('#start_time_input').text().trim(),
        end_time: parentForm.find('#end_time_input').text().trim(),
        item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
        harmful_item: encodeURIComponent(parentForm.find('#harmful_item').val().trim()),
        handle_mode: encodeURIComponent(parentForm.find('#handle_method').val().trim()),
        invalid_item: encodeURIComponent(parentForm.find('#invalid_item').val().trim()),
        duty_ascription: encodeURIComponent(parentForm.find('#duty_ascription').val().trim()),
        statistics_department: encodeURIComponent(parentForm.find('#statistics_department').val().trim()),
        begin_handle_cost: encodeURIComponent(parentForm.find('#begin_handle_cost').val().trim()),
        end_handle_cost: encodeURIComponent(parentForm.find('#end_handle_cost').val().trim()),
        is_handle: encodeURIComponent(parentForm.find('#is_handle').val().trim()),
        // type: encodeURIComponent(parentForm.find('#type').val().trim()),
        number: encodeURIComponent(parentForm.find('#number').val().trim()),
      }
      getInvalidCostList();
    }
  });
  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#sale_order_code').val('');
    parentForm.find('#sale_order_project_code').val('');
    parentForm.find('#item_no').val('');
    parentForm.find('#harmful_item').val('');
    parentForm.find('#handle_item').val('');
    parentForm.find('#invalid_item').val('');
    parentForm.find('#duty_ascription').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#statistics_department').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#begin_handle_cost').val('');
    parentForm.find('#end_handle_cost').val('');
    parentForm.find('#is_handle').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#number').val('');
    pageNo = 1;
    resetParam();
    getInvalidCostList();
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

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    start_time = laydate.render({
      elem: '#start_time_input',
      // max: max,
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
      // max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });

  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      _token: '8b5491b17a70e24107c89f37b1036078',
      sales_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
      sales_order_project_code: encodeURIComponent(parentForm.find('#sale_order_project_code').val().trim()),
      begin_time: parentForm.find('#start_time_input').text().trim(),
      end_time: parentForm.find('#end_time_input').text().trim(),
      item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
      harmful_item: encodeURIComponent(parentForm.find('#harmful_item').val().trim()),
      handle_mode: encodeURIComponent(parentForm.find('#handle_method').val().trim()),
      invalid_item: encodeURIComponent(parentForm.find('#invalid_item').val().trim()),
      duty_ascription: encodeURIComponent(parentForm.find('#duty_ascription').val().trim()),
      statistics_department: encodeURIComponent(parentForm.find('#statistics_department').val().trim()),
      begin_handle_cost: encodeURIComponent(parentForm.find('#begin_handle_cost').val().trim()),
      end_handle_cost: encodeURIComponent(parentForm.find('#end_handle_cost').val().trim()),
      is_handle: encodeURIComponent(parentForm.find('#is_handle').val().trim()),
      // type: encodeURIComponent(parentForm.find('#type').val().trim()),
      number: encodeURIComponent(parentForm.find('#number').val().trim()),
    };
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }

    if (parentForm.find('#start_time_input').text() && parentForm.find('#end_time_input').text()) {
      let url = "/InvalidCost/exportInvalidOffer?" + urlLeft;
      $('#exportExcel').attr('href', url)
    } else {
      layer.msg('请先选择开始和结束时间后再导出', { icon: 5, offset: '250px', time: 1500 })
    }
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
      deleteInvalidCostItem(id);
    });
  });

  $('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
  });

  //列表页全选
  $('body').on('click', '#check_all_select', function () {
    $(this).toggleClass('is-checked');

    if ($(this).hasClass('is-checked')) {
      $('table tr .el-checkbox_input_check').each(function () {
        if (!$(this).hasClass('is-checked')) {
          $(this).addClass('is-checked');
        }
      })
    } else {
      $('table tr .el-checkbox_input_check').each(function () {
        if ($(this).hasClass('is-checked')) {
          $(this).removeClass('is-checked');
        }
      })
    }
  });
}

function getStatisticsDepartment() {
  AjaxClient.get({
    url: URLS['invalidCost'].getNextLevelList + "?" + _token + "&company_id=" + 15+"&type=1",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var $html = rsp.results.map(function (item) {
        return `<li data-id="${item.department_id}" data-code="" class=" el-select-dropdown-item">--${item.name}--</li>`
      });
      $('.statistics_department .el-select-dropdown-list').html($html);
    },
    fail: function (rsp) {
    }
  }, this);
}

function getDepartment() {
  AjaxClient.get({
    url: URLS['invalidCost'].getNextLevelList + "?" + _token + "&company_id=" + 15,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var $html = rsp.results.map(function (item) {
        return `<li data-id="${item.department_id}" data-code="" class=" el-select-dropdown-item">--${item.name}--</li>`
      });
      $('.duty_department .el-select-dropdown-list').html($html);
      getStatisticsDepartment();
    },
    fail: function (rsp) {
    }
  }, this);
}



//  导出  mao
$('body').on('click', '#load', function() {
	ajaxData = {
		sales_order_code: $('#sale_order_code').val().trim(),
		sales_order_project_code: $('#sale_order_project_code').val().trim(),
		begin_time: $('#start_time').val().trim(),
		end_time: $('#end_time').val().trim(),
		item_no: $('#item_no').val().trim(),
		harmful_item: $('#harmful_item').val().trim(),
		handle_mode: $('#handle_method').val().trim(),
		invalid_item: $('#invalid_item').val().trim(),
		duty_ascription: $('#duty_ascription').val().trim(),
		statistics_department: $('#statistics_department').val().trim(),
		begin_handle_cost: $('#begin_handle_cost').val().trim(),
		end_handle_cost: $('#end_handle_cost').val().trim(),
		is_handle: $('#is_handle').val().trim(),
		number: $('#number').val().trim(),
	}
	
	$(this).attr('href', '/InvalidCost/exportInvalidOfferList?_token=8b5491b17a70e24107c89f37b1036078' 
	+ '&is_handle=' + ajaxData.is_handle 
		+ '&sales_order_code=' + ajaxData.sales_order_code
		+ '&sales_order_project_code=' + ajaxData.sales_order_project_code
		+ '&begin_time=' + ajaxData.begin_time
		+ '&end_time=' + ajaxData.end_time
		+ '&item_no=' + ajaxData.item_no
		+ '&harmful_item=' + ajaxData.harmful_item
		+ '&handle_mode=' + ajaxData.handle_mode
		+ '&invalid_item=' + ajaxData.invalid_item
		+ '&duty_ascription=' + ajaxData.duty_ascription
		+ '&statistics_department=' + ajaxData.statistics_department
		+ '&begin_handle_cost=' + ajaxData.begin_handle_cost
		+ '&end_handle_cost=' + ajaxData.end_handle_cost
		+ '&number=' + ajaxData.number
	)
})