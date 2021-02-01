var id, chargeData;
$(function () {
  id = getQueryString('ids');

  if (id != undefined) {
    getInventoryList();
  } else {
    layer.msg('url缺少链接参数，请给到参数', {
      icon: 5,
      offset: '250px'
    });
  }
  getChargeData();
  bindEvent();
});

//清單列表
function getInventoryList() {
  console.log("getInventoryList")
  AjaxClient.get({
    url: URLS['Inventory'].getWorkOrderInventory + "?" + _token + "&work_order_id_batch=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getWorkOrderList(rsp.results);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 })
    }
  }, this)
}

function getWorkOrderList(data) {
  var thtml = '';
  // console.log(data)
  if (data && data.length) {
    data.forEach(function (item, index) {
      thtml += `<tr data-item='${JSON.stringify(item)}'>
                  <td class="nowrap sales_order_code">${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
                  <td class="nowrap po_number">${tansferNull(item.po_number)}</td>
                  <td class="nowrap item_no">${tansferNull(item.item_no)}</td>
                  <td style="width:280px;word-break: break-all;">${tansferNull(item.name)}</td>
                  <td class="nowrap work_center">${tansferNull(item.work_center)}</td>
                  <td class="nowrap">
                    <input type="text" max=${item.inventory_qty} class="el-input inventory_qty" value="${tansferNull(item.inventory_qty)}">
                  </td>
                  <td class="nowrap">
                    <input type="text" class="el-input date_time" id="date_time${index}" placeholder="请选择日期" value="${dateFormat((new Date()) / 1000, 'Y-m-d H:i:s')}">
                  </td>
                  <td class="nowrap">
                    <Textarea type="text" class="el-input remark" value="${tansferNull(item.inventory_qty)}" placeholder="请填入备注"></Textarea>
                  </td>
                </tr>`
    })
    $("#basic_form_show").find(".show_wo_item").html(thtml);
    // setTimeout(showDate(),3000);
  } else {
    $("#basic_form_show").find(".show_wo_item").html(`<td class="nowrap" colspan="8">暂无数据</td>`);
  }
}

//获得负责人
function getChargeData() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: '/basedata/employeeShow?' + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      chargeData = rsp.results;
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

function createInventorySelect(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, chargeData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].surname}${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      $('.el-form-item.employee').find('.el-select-dropdown-list').html(lis);
      if ($('.el-form-item.employee').find('.el-select-dropdown').is(":hidden")) {
        $('.el-form-item.employee').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//筛选数据
function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    var name = e.surname + e.name;
    return name.indexOf(type) > -1;
  });
}

function bindEvent() {
  //清单保存
  $('body').on('click', '.save', function (e) {
    e.stopPropagation();
    submitInventoryData();
  });

  $('body').on('click', '.table-bordered .delete_speacil', function () {
    $(this).parents().parents().eq(0).remove();
    var id = $(this).attr('data-id');
    layer.confirm('将执行删除操作?', {
      icon: 3, title: '提示', offset: '250px', end: function () {
      }
    }, function (index) {
      layer.close(index);
    });
  });

  //输入框的相关事件
  $('body').on('focus', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'employee') {
      var that = $(this);
      createInventorySelect(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else {
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  }).on('input', '#employee', function () {
    var that = $(this);
    createInventorySelect(that);
  });

  $('body').on('click', '.el-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      ele.val($(this).text());
      // ele.val($(this).attr('data-id'));
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
}

// function showDate() {
//   // $(".show_wo_item tr").each(function (k, v) {
//   //   console.log($(v).find('#date_time'+k))
//     laydate.render({
//       elem: $('#date_time0'),
//       type: 'date',
//       format: 'Y-m-d',
//       position: 'fixed',
//       done: function (value) {
//       }
//     })
//   // })
// }

//显示信息
function submitInventoryData() {
  var data_batch = [];
  $(".show_wo_item tr").each(function (k, v) {
    var woData = JSON.parse($(v).attr('data-item'));
    var sales_order_code = woData.sales_order_code,
      sales_order_project_code = woData.sales_order_project_code,
      specification = woData.name,
      work_order_id = woData.work_order_id,
      item_no = woData.item_no,
      po_number = woData.po_number,
      wo_number = woData.wo_number,
      wt_number = woData.wt_number,
      qty = $(v).find(".inventory_qty").val(),
      group = $("#group").val(),
      employee = $("#employee").val(),
      date_time = $(v).find(".date_time").val(),
      remark = $(v).find(".remark").val();
    data_batch.push({
      work_order_id: work_order_id,
      sales_order_code: sales_order_code,
      sales_order_project_code: sales_order_project_code,
      specification: specification,
      item_no: item_no,
      po_number: po_number,
      wo_number: wo_number,
      wt_number: wt_number,
      qty: qty,
      group: group,
      employee_name: employee,
      date_time: date_time,
      remark: remark
    })
  })
  AjaxClient.post({
    url: URLS['Inventory'].insertInventory,
    data: {
      data_batch: data_batch,
      _token: '8b5491b17a70e24107c89f37b1036078'
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm("清单保存成功", {
        icon: 1,
        btn: ['确定'],
        closeBtn: 0,
        title: false,
        offset: '250px'
      }, function (index) {
        layer.close(index);
        window.location.href = "/WorkOrder/InventoryManagement?status=1";
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 2500 });
      // layer.msg('获取工单详情失败，请刷新重试', 9);
    }
  }, this)
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