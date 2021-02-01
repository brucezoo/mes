var layerModal,
  layerLoading,
  pageNo = 1,
  pageSize = 20,
  ids = [],
  work_order_ids = [],
  ajaxData = {},
  declare_ids = '';

$(function () {
  declare_ids = getQueryString('declare_ids');
  getRankPlan();
  setAjaxData();
  getBusteList();
  bindEvent();
});

function setAjaxData() {
  var ajaxDataStr = window.location.hash;
  if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
    try {
      ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
      delete ajaxData.pageNo;
      pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
    } catch (e) {
      resetParam();
    }
  }
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
      getBusteList();
    }
  });
}


function getWerks() {
  AjaxClient.get({
    url: URLS['picking'].getAllFactory + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      // layer.close(layerLoading);
      var _html = `<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.WERKS').find('.el-select-dropdown-list').html(_html)
      }
      getWorkShop();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}

function getWorkShop() {
  AjaxClient.get({
    url: URLS['picking'].workshop + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var _html = `<li data-id=""class="el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item, index) {
          _html += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`
        })
        $('.workshop').find('.el-select-dropdown-list').html(_html)
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
    }
  })
}
//重置搜索参数
function resetParam() {
  ajaxData = {
    start_time: '',
    end_time: '',
    production_number: '',
    rankplan: '',
    workOrder_number: '',
    production_sales_order_project_code: '',
    production_sales_order_code: '',
    factory_id:'',
    work_shop_id: '',
    item_no: '',
    status: '',
    code: '',
  };
}
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
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
      var lis = '',
        innerHtml = '';
      lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
      if (rsp.results && rsp.results.length) {
        rsp.results.forEach(function (item) {
          var workStartTimeVal = dateToDayTime(item.from);
          var workEndTimeVal = dateToDayTime(item.to);
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
      }
      getWerks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取班次列表失败！', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    }
  })
}

//获取粗排列表
function getBusteList() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  if (declare_ids) {
    urlLeft += "&declare_ids=[" + declare_ids + "]";
  }
  AjaxClient.get({
    url: URLS['work'].pageIndex + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
	//可能是祖传代码BUG
    //   if (layerModal != undefined) {
    //     layerLoading = LayerConfig('load');
	//   }
		layer.close(layerLoading);
      ajaxData.pageNo = pageNo;
      window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
      var totalData = rsp.paging.total_records;
      var _html = createHtml(rsp);
	  $('.table_page').html(_html);
	  
		if (rsp.paging.total_records < 20) {
			$('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
		} else {
			$('#total').css('display', 'none').text(' ');
		}

      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize);
      } else {
        $('#pagenation.unpro').html('');
      }
      if (totalData > 0) {
        uniteTdCells('work_order_table');
      }


    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取领料单列表失败，请刷新重试', 9);
    },
    complete: function () {
      $('#searchForm .submit').removeClass('is-disabled');
    }
  }, this)
}

//生成列表数据
function createHtml(data) {
  var viewurl = $('#workOrder_view').val();
  var trs = '';
  if (data && data.results && data.results.length) {
    data.results.forEach(function (item, index) {
      var changeFactoryHtml = '';
      if (item.change_factory == 1) {
        changeFactoryHtml = `<button type="button" class="el-button" style="color: #20a0ff;cursor: pointer;padding: 4px; font-weight: bold;">转厂</button>`;
      }
      trs += `
                <tr>
                  <td>
                      <span class="el-checkbox_input one_buste ${declare_ids != undefined ? 'is-checked' : ''}" data-work-order-id="${item.work_order_id}" id="${item.id}">
                          <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
                  <td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${changeFactoryHtml}</td>
                  <td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.production_order_code)}</td>
                  <td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
                  <td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${item.out.length?item.out[0].qty:''}</td>
                  <td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}" width="200px;">${item.out.length?item.out[0].name:''}</td>
                  <td>${tansferNull(item.production_sales_order_code)}</td>
                  <td>${tansferNull(item.production_sales_order_project_code)}</td>
                  <td>${tansferNull(item.item_no)}</td>
                  <td>${item.out.length?item.out[0].GMNGA:''}</td>
                  <td>${tansferNull(item.code)}</td>
                  <td>${tansferNull(formatTime(item.ctime))}</td>
                  <td style="color: ${item.ratio > 110 ? '#F00' : '#000'}">${tansferNull(item.ratio)}${item.ratio == 0 ? '' : '%'}</td>
                  <td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
                  <td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
                  <td>${tansferNull(item.employee_name)}</td>
                  <td>${tansferNull(item.qc_judge_status)==1?'已审核':tansferNull(item.qc_judge_status)==2?'已反审':tansferNull(item.qc_judge_status)==0?'':''}</td>
                  <td class="right">
                    ${item.status != 2 ? `<button data-qty="${item.yield_qty}" data-id="${item.id}" class="button pop-button item_submit">推送</button>` : ''}
                    ${item.status == 2 ? `<button data-id="${item.id}" data-judge-status="${item.qc_judge_status}" class="button pop-button item_submit_back">撤回</button>` : ''}
                      <a class="button pop-button view" href="${viewurl}?id=${item.id}&type=edit">查看</a>
                    ${item.status == 1 ? `<button data-id="${item.id}" data-judge-status="${item.qc_judge_status}" class="button pop-button delete">删除</button>` : ''}
                  </td>
                </tr>`;
    })
  } else {
    trs = '<tr><td colspan="16" class="center">暂无数据</td></tr>';
  }
  var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable   table-bordered">
                <thead>
                    <tr>
                        <th class="left nowrap tight">
                            <span class="el-checkbox_input all_buste">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th class="left nowrap tight"></th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">计划数量</th>
                        <th class="left nowrap tight">产出品</th>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售行项号</th>
                        <th class="left nowrap tight">产出品编码</th>
                        <th class="left nowrap tight">产出品数量</th>
                        <th class="left nowrap tight">报工单号</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">投料转换比</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">报工类型</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">QC审核</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
		</div>
		<div id="total" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation unpro"></div>`;
  return thtml;
}

function uniteTdCells(tableId) {
  var table = document.getElementById(tableId);
  for (let i = 0; i < table.rows.length; i++) {
    for (let c = 1; c < 2; c++) {
      for (let j = i + 1; j < table.rows.length; j++) {
        let cell1 = table.rows[i].cells[c].getAttribute('data-content');
        let cell2 = table.rows[j].cells[c].getAttribute('data-content');
        if (cell1 && cell2 && cell1 == cell2) {
          table.rows[j].cells[c].style.display = 'none';
          table.rows[j].cells[c].style.verticalAlign = 'middle';
          table.rows[i].cells[c].rowSpan++;

          // table.rows[i].style.backgroundColor='#ddeaf98a';
          // table.rows[j].style.backgroundColor='#ddeaf98a';
          table.rows[i].cells[c].style.backgroundColor = '#eef1f6';
          table.rows[j].cells[c].style.backgroundColor = '#eef1f6';
          // table.rows[i].style.borderTop="2px solid #ccc";
          // table.rows[i].style.borderLeft="2px solid #ccc";
          // table.rows[i].style.borderRight="2px solid #ccc";
          // table.rows[i].cells[c].style.borderBottom="2px solid #ccc";
          // table.rows[j].style.borderBottom="2px solid #ccc";
          // table.rows[j].style.borderRight="2px solid #ccc";
          // table.rows[j].cells[c].style.borderTop="2px solid #ccc";
        } else {
          table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
          break;
        };
      }
    }

  }
};

function deleteItem(id, judgeResult, employeeId) {
  AjaxClient.get({
    url: URLS['work'].destroy + "?" + _token + "&id=" + id + "&qc_judge_result=" + judgeResult + "&employee_id=" + employeeId,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);

      LayerConfig('success', '成功！');
      getBusteList();

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function submitAll() {
  if (ids.length > 0) {
    AjaxClient.post({
      url: URLS['work'].submitBusteAll,
      data: {
        ids: ids,
        _token: TOKEN
      },
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        var _tr = ''
        rsp.results.forEach(function (item) {
          var mess = '';
          if (item.message != '') {
            mess = item.message;
          } else if (item.sap.RETURNCODE == 0) {
            mess = '推送成功！'
          } else {
            mess = item.sap.RETURNINFO;
          }
          _tr += `<tr>
                                <td>${tansferNull(item.wd_number)}</td>
                                <td>${tansferNull(mess)}</td>
                            </tr>`;
        });
        var _table = `<table>
                                <thead>
                                    <tr>
                                        <th style="width: 190px;">报工单号</th>
                                        <th>信息</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${_tr}
                                </tbody>
                               </table>`;
        layer.confirm(`${_table}`, {
          icon: 3,
          area: ['500px', '400px'],
          btn: ['确定'],
          closeBtn: 0,
          title: false,
          offset: '250px'
        }, function (index) {
          layer.close(index);
          getBusteList();
          if (declare_ids) {
            layer.confirm("是否跳转至合并报工列表继续报工？", {
              icon: 3,
              btn: ['确定', '返回委外订单列表', '关闭'],
              closeBtn: 0,
              title: false,
              offset: '250px'
            }, function (index) {
              layer.close(index);
              window.location.href = "/Buste/mergeBuste";
            }, function (index) {
              layer.close(index);
              window.location.href = "/Outsource/outsourceIndex";
            }, function (index) {
              layer.close(index);
            });
          }
        });
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        LayerConfig('fail', rsp.message)
      }
    }, this)
  } else {
    LayerConfig('fail', '请选择报工单！');
  }
}

function printAll() {
  if (ids.length > 0) {
    AjaxClient.get({
      url: URLS['work'].TransferPrinting + '?' + _token + '&work_order_id=' + work_order_ids + '&number=6',
      dataType: 'json',
      success: function (rsp) {
        $('#print_list').html('')
        rsp.results.forEach(function (item) {
          showPrintList(item);
        });
        $("#print_list").show();
        $("#print_list").print();
        $("#print_list").hide();
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        layer.msg('获取报工单数据失败，请刷新重试', {
          icon: 5,
          offset: '250px',
          time: 1500
        });
      },
      complete: function () {
        $('#searchForm .submit').removeClass('is-disabled');
      }
    }, this)
  } else {
    LayerConfig('fail', '请选择报工单！');
  }
}


function showPrintList(formData) {
  var trs = '';
  var dataLength = formData.length > 6 ? formData.length : 6;
  console.log(formData)
  if (formData.length > 0) {
    formData.forEach(function (bitem, i) {
      trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.item_no)}</td> 
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.po_number)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.specifications)}</td>           
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;">${tansferNull(bitem.material_description)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;">${tansferNull(bitem.number)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px">${tansferNull(bitem.GMNGA)}</td>
          <td class="has-border" style="font-size: 1.5em;height:56px;">${tansferNull(bitem.remark)}</td>
        </tr>`;
    })
    if (dataLength > formData.length) {
      for (var i = 0; i < dataLength - formData.length; i++) {
        trs += `
          <tr style="text-align:center;">
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td> 
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;word-wrap:break-word;word-break:break-all;"></td>
          <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
        </tr>`;
      }
    }
    //trs += `<tr class="has-border"><td colspan=2 style="border-bottom:1px solid #000;">审核：</td><td colspan=3 style="border-bottom:1px solid #000;">检验状态：</td><td colspan=3 style="border-bottom:1px solid #000;">仓库：</td></tr>`
  } else {
    trs = '<tr><td colspan="7" style="text-align:center">暂无数据</td></tr>';
  }
  var thtml = `<div id="clearHeight" class="wrap_table_div has-border">
                <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
                    <thead>
                    <tr style="text-align:center;">
                        <th class="left nowrap tight">半成品编码</th>
                        <th class="left nowrap tight">订单号/行项号</th>
                        <th class="left nowrap tight">规格</th>
                        <th class="left nowrap tight">物料描述</th>
                        <th class="left nowrap tight">总数量</th>
                        <th class="left nowrap tight">报工数量</th>
                        <th class="left nowrap tight">备注</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">${trs}</tbody>
                </table>
            </div>`;
  var print_html = `<form class="viewAttr formModal">
            <div class="printPage" style="page-break-after: always;">
              <div style="text-align:center;font-size:36px;">
                <span>报工单</span>
              </div>
              <div style="display:flex;font-size:18px;">
                <div style="flex:8;text-align:left;"><span>工单号:${formData[0].wo_number}</span></div>
                <div style="flex:4;text-align:left;"><span>生产单位:${formData[0].work_shop_name}</span></div>
              </div>
              <div style="display:flex;font-size:18px;">
                <div style="flex:8;text-align:left;"><span>生产订单号:${formData[0].production_number}</span></div>
                <div style="flex:4;text-align:left;"><span>报工日期:${formData[0].declare_ctime}</span></div>
              </div>
              ${thtml}
            </div>
        </form>`;
  $('#print_list').append(print_html);
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function bindEvent() {
  // 导出
  $('body').on('click', '#searchForm .export', function (e) {
    e.stopPropagation();
    var urlLeft = '';
    var parentForm = $(this).parents('#searchForm');

    ajaxData = {
      production_number: encodeURIComponent(parentForm.find('#code').val().trim()),
      workOrder_number: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
      production_sales_order_code: encodeURIComponent(parentForm.find('#production_sales_order_code').val().trim()),
      production_sales_order_project_code: encodeURIComponent(parentForm.find('#production_sales_order_project_code').val().trim()),
      start_time: parentForm.find('#start_time').val(),
      factory_id:parentForm.find('#WERKS').val().trim(),
      work_shop_id: parentForm.find('#workshop_id').val().trim(),
      end_time: parentForm.find('#end_time').val(),
      rankplan_id: parentForm.find('#rankplan').val(),
      item_no: parentForm.find('#item_no').val(),
      status: parentForm.find('#status').val(),
      code: parentForm.find('#report_code').val(),
    };
    if (ajaxData.production_number || ajaxData.workOrder_number || ajaxData.production_sales_order_code || ajaxData.production_sales_order_project_code || ajaxData.start_time || ajaxData.end_time || ajaxData.item_no || ajaxData.rankplan_id || ajaxData.status || ajaxData.code) {
      for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
      }
      console.log(urlLeft)
      let url = URLS['work'].excelExport + _token + urlLeft;
      $('#exportExcel').attr('href', url)
    } else {
      LayerConfig('fail', '请按条件搜索，在导出！')
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
  $('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_time_input',
      max: max,
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
      max: getCurrentDate(),
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

  //批量推送
  $('body').on('click', '#buste_all', function (e) {
    e.stopPropagation();
    ids = [];
    $('table tr .one_buste').each(function () {
      var id = $(this).attr("id");
      if ($(this).hasClass('is-checked')) {
        if (ids.indexOf(id) == -1) {
          ids.push(id);
        }
      }
    })
    submitAll();
  })

  //打印
  $('body').on('click', '.print', function (e) {
    e.stopPropagation();
    work_order_ids = [];
    $('table tr .one_buste').each(function () {
      var work_order_id = $(this).attr("data-work-order-id");
      if ($(this).hasClass('is-checked')) {
        if (work_order_ids.indexOf(work_order_id) == -1) {
          work_order_ids.push(work_order_id);
        }
      }
    })
    printAll();
  })

  $('body').on('click', '.one_buste', function () {
    $(this).toggleClass('is-checked');
    var id = $(this).attr("id");
    if ($(this).hasClass('is-checked')) {
      if (ids.indexOf(id) == -1) {
        ids.push(id);
      }
    } else {
      var index = ids.indexOf(id);
      ids.splice(index, 1);
    }
  });
  $('body').on('click', '.all_buste', function () {
    $(this).toggleClass('is-checked');
    if ($(this).hasClass('is-checked')) {
      $('table tr .one_buste').each(function () {
        if (!$(this).hasClass('is-checked')) {
          var id = $(this).attr("id");
          $(this).addClass('is-checked');
          if (ids.indexOf(id) == -1) {
            ids.push(id);
          }
        }
      })
    } else {
      $('table tr .one_buste').each(function () {
        $(this).removeClass('is-checked');
        var id = $(this).attr("id");
        var index = ids.indexOf(id);
        if (index != -1) {
          ids.splice(index, 1);
        }
      })
    }
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
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
  });

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
      ajaxData = {
        production_number: encodeURIComponent(parentForm.find('#code').val().trim()),
        workOrder_number: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
        production_sales_order_code: encodeURIComponent(parentForm.find('#production_sales_order_code').val().trim()),
        production_sales_order_project_code: encodeURIComponent(parentForm.find('#production_sales_order_project_code').val().trim()),
        rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
        factory_id:parentForm.find('#WERKS').val().trim(),
        work_shop_id: parentForm.find('#workshop_id').val().trim(),
        start_time: parentForm.find('#start_time').val(),
        end_time: parentForm.find('#end_time').val(),
        item_no: parentForm.find('#item_no').val(),
        status: parentForm.find('#status').val(),
        code: parentForm.find('#report_code').val(),
      };
      pageNo = 1;
      getBusteList();
    }
  });
  //重置搜索框值
  $('body').on('click', '#searchForm .reset', function (e) {
    e.stopPropagation();
    var parentForm = $('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#production_sales_order_code').val('');
    parentForm.find('#production_sales_order_project_code').val('');
    parentForm.find('#work_order_code').val('');
    parentForm.find('#WERKS').val('');
    parentForm.find('#workshop_id').val('');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#start_time').val('');
    parentForm.find('#end_time').val('');
    parentForm.find('#item_no').val('');
    parentForm.find('#report_code').val('');
    resetParam();
    getBusteList();
  });
  $('body').on('click', '.item_submit:not(is-disabled)', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id');
	var that=$(this);
	var qty = $(this).attr('data-qty');
	that.addClass('is-disabled');
	
	if(qty == 0) {

		layer.confirm('当前报工推送sap数量为0，是否继续推送！?', {
			btn: ['是', '否'],
			btn1: function (index) {
				layer.close(index);
				layer.confirm('您将执行推送操作！?', {
					icon: 3,
					title: '提示',
					offset: '250px',
					end: function () {
						that.removeClass('is-disabled');
					}
				}, function (index) {
					layer.close(index);
					checkHasOverDeclare(id, that);
				});
			},
			btn2: function (index) {
				layer.close(index);
			}
		});

	}else {
		layer.confirm('您将执行推送操作！?', {
		icon: 3,
		title: '提示',
		offset: '250px',
		end: function () {
			that.removeClass('is-disabled');
		}
		}, function (index) {
		layer.close(index);
		checkHasOverDeclare(id,that);
		});
	}

    

  });

  $('body').on('click', '.confirm-back', function (e) {
    var $itemJP = $('#employeeId');
    var $judgeResult = $('#withdraw-result');
    var $id = $('#pushId').val();
    var flag = false,
      judgeCorrect = false;
    var employeeId = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
      $itemJP.data('inputItem').name == $itemJP.val().trim() ? $itemJP.data('inputItem').id : '';
    if ($judgeResult.val().trim()) {
      judgeCorrect = true;
      $(".form-judge").find(".errorMessage").html('')
    } else {
      judgeCorrect = false;
      $(".form-judge").find(".errorMessage").html('*请输入撤回原因')
    }
    if (employeeId) {
      flag = true;
      $(".employee-person").find(".errorMessage").html('')
    } else {
      flag = false;
      $(".employee-person").find(".errorMessage").html('*请输入通知人')
    }
    if (flag && judgeCorrect) {
      backDeclare($id, $judgeResult.val(), employeeId);
    }
  });

  $('body').on('click', '.item_submit_back', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id'),
      judgeStatus = $(this).attr('data-judge-status');

    var thisObj = $(this);
    var $html = judgeStatus == 1 ? `<form class="formModal formPush" data-flag="">
                  <input type="hidden" id="pushId" value="${id}"/>
                  <div class="el-form-item form-judge">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>撤回原因</label>
                      <input type="text" id="withdraw-result" class="el-input" placeholder="请输入撤回原因" value="">
                    </div>
                    <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                  </div>
                  <div class="el-form-item employee-person">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>通知人</label>
                      <div class="el-select-dropdown-wrap">
                        <input type="text" id="employeeId" class="el-input" placeholder="请输入通知人" autocomplete="off">
                      </div>
                    </div>
                    <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                  </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle">取消</button>
                      <button type="button" class="el-button el-button--primary submit confirm-back">确定</button>
                    </div>
                  </div>
    </form>` : backDeclare(id, '', '');
    if (judgeStatus == 1) {
      layerModal = layer.open({
        type: 1,
        title: '撤回报工单',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `${$html}`,
        success: function (layero, index) {
          getLayerSelectPosition($(layero));
          $('#employeeId').autocomplete({
            url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10"
          });
          $('#employeeId').each(function (item) {
            var width = $(this).parent().width();
            $(this).siblings('.el-select-dropdown').width(width);
          });
        },
        end: function () {
          $('.table_tbody tr.active').removeClass('active');
        }
      });
    }
  });

  $('body').on('click', '.item_not_submit_back', function (e) {
    LayerConfig('fail', '正在撤回，请稍等')
  })

  $('body').on('click', '.confirm-delete', function (e) {
    var $itemJP = $('#employeeId');
    var $judgeResult = $('#delete-result');
    var $id = $('#pushId').val();
    var flag = false,
      judgeCorrect = false;
    var employeeId = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
      $itemJP.data('inputItem').name == $itemJP.val().trim() ? $itemJP.data('inputItem').id : '';
    console.log($judgeResult.val().trim());
    if ($judgeResult.val().trim()) {
      judgeCorrect = true;
      $(".form-judge").find(".errorMessage").html('')
    } else {
      judgeCorrect = false;
      $(".form-judge").find(".errorMessage").html('*请输入删除原因')
    }
    if (employeeId) {
      flag = true;
      $(".employee-person").find(".errorMessage").html('')
    } else {
      flag = false;
      $(".employee-person").find(".errorMessage").html('*请输入负责人')
    }
    if (flag && judgeCorrect) {
      deleteItem($id, $judgeResult.val(), employeeId);
    }
  });

  //弹窗关闭
  $('body').on('click', '.btn-group .cancle', function (e) {
    e.stopPropagation();
    if ($('body').find('.layui-laydate')) {
      $('body').find('.layui-laydate').hide();
    }
    layer.close(layerModal);
  });

  $('body').on('click', '.delete', function (e) {
    e.stopPropagation();
    var id = $(this).attr('data-id'),
      judgeStatus = $(this).attr('data-judge-status');
    var $html = judgeStatus == 1 ? `<form class="formModal formPush" data-flag="">
                    <input type="hidden" id="pushId" value="${id}" />
                    <div class="el-form-item form-judge">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>删除原因</label>
                          <input type="text" id="delete-result" class="el-input" placeholder="请输入删除原因">
                      </div>
                      <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                    </div>
                    <div class="el-form-item employee-person">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>责任人</label>
                          <div class="el-select-dropdown-wrap">
                            <input type="text" id="employeeId" class="el-input" placeholder="请输入责任人" autocomplete="off">
                          </div>
                      </div>
                      <p class="errorMessage" style="margin-left:100px;display: block;"></p>
                  </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle">取消</button>
                      <button type="button" class="el-button el-button--primary submit confirm-delete">确定</button>
                    </div>
                  </div>
                  </form>` : deleteItem(id, '', '');
    if (judgeStatus == 1) {
      layerModal = layer.open({
        type: 1,
        title: '删除报工单',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `${$html}`,
        success: function (layero, index) {
          getLayerSelectPosition($(layero));
          $('#employeeId').autocomplete({
            url: URLS['work'].judge_person + "?" + _token + "&page_no=1&page_size=10"
          });
          $('#employeeId').each(function (item) {
            var width = $(this).parent().width();
            $(this).siblings('.el-select-dropdown').width(width);
          });
        },
        end: function () {
          $('.table_tbody tr.active').removeClass('active');
        }
      });
    }
  })
};

function checkHasOverDeclare(id,that) {
  AjaxClient.get({
    url: URLS['work'].checkHasOverDeclare + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      that.removeClass('is-disabled');
      if (rsp.results.isover == 0) {
        submint(id);
      }
      if (rsp.results.isover == 1) {
        layer.confirm('当前工单已超报，是否继续报工？', {
          icon: 3,
          title: '提示',
          offset: '250px',
          end: function () {}
        }, function (index) {
          layer.close(index);
          submint(id);
        });
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      that.removeClass('is-disabled');
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function backDeclare(id, judgeResult, employee_id) {
  AjaxClient.get({
    url: URLS['work'].recall + "?" + _token + "&id=" + id + "&qc_judge_result=" + judgeResult + "&employee_id=" + employee_id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success', '撤回成功！')
      getBusteList();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      // thisObj.addClass("item_submit_back");
      // thisObj.removeClass("item_not_submit_back");
      // thisObj.css({
      //   "color": "#00a0e9",
      //   "border": "solid 1px #00a0e9"
      // });
      LayerConfig('fail', rsp.message)
    }
  }, this)
}

function submint(id) {
  AjaxClient.get({
    url: URLS['work'].submitBuste + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results.RETURNCODE == 0) {
        LayerConfig('success', '成功！');
        getBusteList();
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message)
    }
  }, this)
}