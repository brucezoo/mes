var layerModal,
  layerLoading,
  pageNo = 1,
  itemPageNo = 1,
  pageNo1 = 1,
  pageNo2 = 1,
  status = 2;
  pageSize = 20,
  work_order_code = '',
  work_order_id = '',
  e = {},
  ajaxData = {},
  checkMaterial = [],
  ajaxItemData = {};

function setAjaxData() {
  var ajaxDataStr = sessionStorage.getItem('work_order_page_index');
  try {
    ajaxData = JSON.parse(ajaxDataStr);
    delete ajaxData.pageNo;
    delete ajaxData.status;
    delete ajaxData.work_order_code;
    pageNo = JSON.parse(ajaxDataStr).pageNo;
    // status = JSON.parse(ajaxDataStr).status;
    work_order_code = JSON.parse(ajaxDataStr).work_order_code;
    work_order_id = JSON.parse(ajaxDataStr).work_order_id;
  } catch (e) {
    resetParam();
  }
}

//获取当前时间，格式YYYY-MM-DD
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

$(function () {
  getRankPlan();
  laydateRender();
  setAjaxData();
  // $('.el-tap[data-status='+status+']').addClass('active').siblings('.el-tap').removeClass('active');
  getWorkOrder(status);
  bindEvent();
});

//31:30:00 to DAY +1 07:30:00
function dateToDayTime(val) {
  var dayTime = val.split(":");
  var dayTimeVal;
  if (dayTime[0] / 24 >= 1) {
    dayTimeVal = "DAY +" + Math.floor(dayTime[0] / 24) + ((dayTime[0] % 24) < 10 ? " 0" + dayTime[0] % 24 : " " + dayTime[0] % 24) + ":" + dayTime[1] + ":" + dayTime[2];
  } else {
    dayTimeVal = val;
  }
  return dayTimeVal;
}
//获取班次
function getRankPlan() {
  AjaxClient.get({
    url: URLS['thinPro'].rankPlanList + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
    },
    success: function (rsp) {
      $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
      var lis = '', innerHtml = '';
      if (rsp.results && rsp.results.length) {
        lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
        rsp.results.forEach(function (item) {
          var workStartTimeVal = dateToDayTime(item.from);
          var workEndTimeVal = dateToDayTime(item.to);
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
      }

    },
    fail: function (rsp) {
      layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
    }
  })
}

function laydateRender() {
  //日期时间选择器
  laydate.render({
    elem: '#work_station_time',
    type: 'date'
  });
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
      getWorkOrder(status);
    }
  });
}

//重置搜索参数
function resetParam() {
  ajaxData = {
    work_order_number: '',
    work_task_number: '',
    production_order_number: '',
    sales_order_code: '',
    sales_order_project_code: '',
    inspur_sales_order_code: '',
    inspur_material_code: '',
    plan_start_date: '',
    plan_end_date: '',
    schedule: '',
    rankplan: '',
    picking_status: '',
    send_status: '',
    status: 2,
    order: 'desc',
    sort: 'id'
  };
}

//获取细排列表
function getWorkOrder(status) {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
  AjaxClient.get({
    url: URLS['order'].workOrderList + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      ajaxData.pageNo = pageNo;
      ajaxData.status = status;
      ajaxData.work_order_code = work_order_code;
      sessionStorage.setItem('work_order_page_index', JSON.stringify(ajaxData))
      // window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      if (status == 0) {
        $(".declare").hide();
        var totalData = rsp.paging.total_records;
        var _html = createHtml(rsp);
        $('.table_page').html(_html);
        if (totalData > pageSize) {
          bindPagenationClick(totalData, pageSize);
        } else {
          $('#pagenation.unpro').html('');
        }
      } else if (status == 1) {
        $(".declare").hide();
        var totalData = rsp.paging.total_records;
        var _shtml = createProducedHtml(rsp);
        $('.table_page').html(_shtml);
        if (totalData > pageSize) {
          bindPagenationClick(totalData, pageSize);
        } else {
          $('#pagenation.produce').html('');
        }
        checkMaterial = [];
        rsp.results.forEach(function (item) {
          var material_arr = [];
          if (item.in_material != null && item.in_material.length > 0) {
            if (JSON.parse(item.in_material).length > 0) {
              for (var i in JSON.parse(item.in_material)) {
                if (JSON.parse(item.in_material)[i].LGFSB != '') {
                  material_arr.push({
                    material_id: JSON.parse(item.in_material)[i].material_id,
                    line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
                    product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
                    qty: tansferNull(JSON.parse(item.in_material)[i].qty),
                  })
                }

              }

            }
          }

          if (material_arr.length > 0) {
            checkMaterial.push({
              work_order_id: item.work_order_id,
              sale_order_code: item.sales_order_code ? item.sales_order_code : '',
              materials: material_arr,
            });
          }
        });
      } else if (status == 2) {
        $(".declare").show();
        var totalData = rsp.paging.total_records;
        var _schtml = createFineProducedHtml(rsp);
        $('.table_page').html(_schtml);

		  if (rsp.paging.total_records < 20) {
			  $('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
		  } else {
			  $('#total').css('display', 'none').text(' ');
		  }

        if (totalData > pageSize) {
          bindPagenationClick(totalData, pageSize);
        } else {
          $('#pagenation.fineProduce').html('');
        }
        checkMaterial = [];
        rsp.results.forEach(function (item) {
          var material_arr = [];
          if (item.in_material != null && item.in_material.length > 0) {
            if (JSON.parse(item.in_material).length > 0) {
              for (var i in JSON.parse(item.in_material)) {
                if (JSON.parse(item.in_material)[i].LGFSB == '') {
                  break;
                } else {
                  material_arr.push({
                    material_id: JSON.parse(item.in_material)[i].material_id,
                    line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
                    product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
                    qty: tansferNull(JSON.parse(item.in_material)[i].qty),
                  })
                }
              }

            }
          }

          if (material_arr.length > 0) {
            checkMaterial.push({
              work_order_id: item.work_order_id,
              materials: material_arr,
            });
          }
        });

      }
      // if (work_order_code) {
      //   $("#check_input_" + work_order_code).click();
      // }
    },
    fail: function (rsp) {
      // layer.close(layerLoading);
      noData('获取调拨单列表失败，请刷新重试', 9);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成细排列表数据
function createFineProducedHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      var temp = [];
      if (item.out_material != null && item.out_material.length > 0) {
        temp = JSON.parse(item.out_material);
      }


      switch (item.status) {
        case 2:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">等待处理</span>`;
          break;
        case 3:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已被发布</span>`;
          break;
        case 4:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">挂起</span>`;
          break;
        case 5:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">操作异常</span>`;
          break;
        case 6:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">设备异常</span>`;
          break;
        case 7:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">物料异常</span>`;
          break;
        case 8:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单变更</span>`;
          break;
        case 9:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单取消</span>`;
          break;
        case 10:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">完成工单</span>`;
          break;
        case 11:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">暂停</span>`;
          break;
        case 12:
          condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">即将开始</span>`;
          break;
      }
      var changeFactoryHtml = '', routChangeHtml = '';

      if (item.version_change == 1) {
        routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
      }
      if (item.change_factory == 1) {
        changeFactoryHtml = `<button type="button" class="el-button" style="color: #20a0ff;cursor: pointer;padding: 4px; font-weight: bold;">转厂</button>`;
      }

      trs += `
			<tr>
          <td>
            <span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}" data-work-id="${item.work_order_id}">
            <span class="el-checkbox-outset"></span>
            </span>
          </td>
      <td>${routChangeHtml}</td>
      <td>${changeFactoryHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="200px;">${tansferNull(item.item_no)}:${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>            
			<td>${tansferNull(item.work_center)}</td>            
            <td>${tansferNull(item.workbench_name)}</td>            
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.plan_start_time)}</td>
			<td>${tansferNull(item.inspur_sales_order_code)}</td>
			<td>${tansferNull(item.inspur_material_code)}</td>
			<td>${tansferNull(item.on_off == 0 ? '订单关闭' : '订单开启')}</td>
			<td>${tansferNull((Number(item.schedule) * 100).toFixed(2))}%</td>
			<td>${tansferNull(item.picking_status == 0 ? '未领' : item.picking_status == 1 ? '领料中' : item.picking_status == 2 ? '已领' : '')}</td>
			<td style="color: ${item.send_status == 1 ? 'red' : ''}">${tansferNull(item.is_sap_picking == 0 ? '' : item.send_status == 0 ? '未发' : item.send_status == 1 ? '少发' : item.send_status == 2 ? '正常' : item.send_status == 3 ? '超发' : '')}</td>
			<!--<td>${tansferNull(condition)}</td>-->
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			<td class="right">
	         <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	        </td>
			</tr>
			`;
    })
  } else {
    trs = '<tr><td colspan="20" style="text-align:center">暂无数据</td></tr>';
  }
  var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">
                      <span class="el-checkbox_input all-inmate-check">
                        <span class="el-checkbox-outset"></span>
                      </span>
                    </th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight" width="200px;">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工位号</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">排入时间</th>
                    <th class="left nowrap tight">浪潮销售订单号</th>
                    <th class="left nowrap tight">浪潮物料号</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="left nowrap tight">报工状态</th>
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th>
                    <!--<th class="left nowrap tight">状态</th>-->
                    <th class="center nowrap tight showStatus" style="display: none;">MES齐料</th>
                    <th class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted">${trs}</tbody>
            </table>
		</div>
		<div id="total" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation fineProduce" style="margin-top: 5px;"></div>`;
  $('#showPickingList').show();
  return thtml;
}

function resetAll() {
  var parentForm = $('#searchForm');
  parentForm.find('#sales_order_code').val('');
  parentForm.find('#sales_order_project_code').val('');
  parentForm.find('#work_order_number').val('');
  parentForm.find('#work_task_number').val('');
  parentForm.find('#production_order_number').val('');
  parentForm.find('#work_shift_name').val('');
  parentForm.find('#work_station_time').val('');
  parentForm.find('#inspur_sales_order_code').val('');
  parentForm.find('#inspur_material_code').val('');
  // parentForm.find('#plan_start_time').val();
  parentForm.find('#start_time_input').text('');
  parentForm.find('#end_time_input').text('');
  parentForm.find('#start_time').val('');
  parentForm.find('#end_time').val('');
  parentForm.find('#schedule').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#picking_status').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#send_status').val('').siblings('.el-input').val('--请选择--');
  parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
  pageNo = 1;
  resetParam();
}

function checkPickings() {
  AjaxClient.post({
    url: URLS['order'].checkApplyMes,
    data: { items: checkMaterial, _token: TOKEN },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },

    success: function (rsp) {
      layer.close(layerLoading);
      $('.showStatus').show();
      rsp.results.forEach(function (item) {
        if (item.is_full == true) {
          $('#showStatus' + item.work_order_id).html('');
          $('#showStatus' + item.work_order_id).html(`<a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1"><span style="display:inline-block;border: 1px solid green;width: 60px;color: green;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">定额领料</span></a>`)
        }
      });
      $('.declare').removeClass('is-disabled');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      $('.declare').removeClass('is-disabled');
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });

    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this);
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function mergeBuste(data) {
  AjaxClient.get({
    url: URLS['work'].mergeBuste + "?work_order_id=" + data + "&" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('报工成功！', {
        icon: 1, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getWorkOrder(status);
      });
      // LayerConfig('success', '报工成功');

      $('.merge-buste').removeClass('is-disabled');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      $('.merge-buste').removeClass('is-disabled');
      layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
    }
  }, this)
}

function bindEvent() {
  // 点击工艺变更红标识
  $('body').on('click', '.version-change', function () {
    let desc = $(this).attr('data-desc');
    let oldVersion = $(this).attr('data-oldVersion') + '.0';
    let newVersion = $(this).attr('data-newVersion') + '.0';
    layerModal = layer.open({
      type: 1,
      title: '信息',
      offset: '100px',
      area: ['400px', '300px'],
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form class="viewAttr formModal" style="width: 340px;margin: 0 auto;">
                        <div style="height: 40px;text-align: left;">
                            <span>当前工单版本：</span>
                            ${oldVersion}
                        </div>
                        <div style="height: 40px;text-align: left;">
                            <span>工艺新版本：</span>
                            ${newVersion}
                        </div>
                        <div style="height: 120px;text-align: left;">
                            <span>新版本描述：</span>
                            ${desc}
                        </div>
                    </form>`,
      success: function (layero, index) {

      },
      end: function () {

      }

    })
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

  //下拉选择
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

  //多选框全选/全不选
  $('body').on('click', '.el-checkbox_input.all-inmate-check', function (e){
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      $('.table_tbody_fineProducted').find('.el-checkbox_input').removeClass('is-checked');
      ele.removeClass('is-checked');
    } else {
      $('.table_tbody_fineProducted').find('.el-checkbox_input').addClass('is-checked');
      ele.addClass("is-checked");
    }
  })

  //合并报工
  $('body').on('click', '#searchForm .merge-buste', function (e) {
    e.stopPropagation();
    var listArr = [],woArr=[];
    if ($('body').find('.table_tbody_fineProducted')) {
      var _this = $('.table_tbody_fineProducted').find('tr');
      _this.each(function (index, item) {
        console.log(item)
        if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
          var list = $(item).find(".is-checked").attr("data-work-id");
          var wo = $(item).find(".is-checked").attr("data-id");
          listArr.push(list);
          woArr.push(wo);
        }
      })
      if (listArr.length > 0) {
        var listArrStr = listArr.join();
		var woArrStr = woArr.join();
		
		AjaxClient.get({
			url: '/WorkDeclareOrder/checkDeclareOrder' + "?" + _token + "&work_order_id=" + listArrStr,
		dataType: 'json',
		success: function (rsp) {
			window.location.href="/Buste/mergeBusteIndex?ids="+listArrStr;
		},
		fail: function (rsp) {
			layer.confirm(rsp.message, {
				btn: ['确定',]
			}, function () {
				layer.close(layer.index);
			}, function () {

			});
		}
	}, this)



        
        // mergeBuste(listArrStr);
      } else {
        layer.msg('当前未选择工单，请选择需要报工的工单！', { icon: 5, offset: '250px', time: 1500 });
      }
    }
  })

  //搜索
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
      if (status == 2) {
        var workStationDate = '';
        var workStationTime = '';
        if (parentForm.find('#work_station_time').val()) {
          workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
          workStationTime = Math.round(workStationDate.getTime() / 1000);
        }

        ajaxData = {
          sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
          sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
          work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
          work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
          production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
          schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
          picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
          send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
          inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
          inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
          // plan_start_date: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
          plan_start_date: parentForm.find('#start_time').val(),
          plan_end_date: parentForm.find('#end_time').val(),
          rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
          order: 'desc',
          sort: 'id',
          workbench_name: encodeURIComponent(parentForm.find('#work_shift_name').val().trim()),
          daytime: encodeURIComponent(workStationTime)
        };
      } else {
        ajaxData = {
          sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
          sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
          work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
          work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
          production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
          schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
          picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
          send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
          inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
          inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
          // plan_start_date: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
          plan_start_date: parentForm.find('#start_time').val(),
          plan_end_date: parentForm.find('#end_time').val(),
          rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
          order: 'desc',
          sort: 'id'
        };
      }

      pageNo = 1;
      getWorkOrder(status);
    }
  });

  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    resetAll();
    getWorkOrder(status);
  });

  //点击选择
  $('body').on('click', '.table_tbody_fineProducted .el-checkbox_input', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var ele = $(this);
    if (ele.hasClass('is-checked')) {
      ele.removeClass('is-checked');
    } else {
      ele.addClass("is-checked");
    }
  });

  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
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

}

function bindItemPagenationClick(totalData, pageSize) {
  $('#item_pagenation').show();
  $('#item_pagenation').pagination({
    totalData: totalData,
    showData: pageSize,
    current: itemPageNo,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      itemPageNo = api.getCurrent();
      getPickingList();
    }
  });
}

//重置搜索参数
function resetParamItem() {
  ajaxItemData = {
    type: '',
    work_order_code: ''
  };
}