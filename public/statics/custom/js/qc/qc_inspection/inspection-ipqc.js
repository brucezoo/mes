var layerModal,
  layerLoading,
  layerOffset,
  pageNo = 1,
  showFlag = 0,
  pageSize = 20,
  ajaxData = {},
  ids = [],
  itemIds = [],
  chooseId,
  unitData = [],
  disposeData = [{
      id: 1,
      name: '退货'
    },
    {
      id: 2,
      name: '让步接收'
    },
    {
      id: 3,
      name: '特采'
    }
  ],
  missItemData = [],
  missItemDetailData1 = [],
  missItemDetailData2 = [],
  departmentData = [],
  workShopData = [],
  sceneData = [{
    id: 1,
    name: '进料'
  }, {
    id: 2,
    name: '制程'
  }, {
    id: 3,
    name: '成品'
  }],
  chooseArr = [];
$(function () {
  var check_code = getQueryString('check_code');
  var check_status = getQueryString('check_status');

  resetParam();
  getSearch();
  if (check_code) {
    ajaxData.code = check_code;
    $('#order_id').val(check_code);
    if (check_status) {
      console.log(check_status)
      $('.show-check-status .el-select-dropdown-item[data-id=' + check_status + ']').click();
      ajaxData.man_check = check_status;
    }
  }
//   getChecks();
  bindEvent();
  $('#type_id').autocomplete({
    url: URLS['check'].templateList + "?" + _token,
    param: 'name'
  });

});

function getSearch() {
  $.when(getDepartment())
    .done(function (departmentrsp) {
      departmentData = departmentrsp.results;
    }).fail(function (departmentrsp) {
      console.log('获取车间失败');
    }).always(function () {
      layer.close(layerLoading);
    });
  $.when(getWorkShop())
    .done(function (workshoprsp) {
      workShopData = workshoprsp.results;
    }).fail(function (workshoprsp) {
      console.log('获取部门失败');
    }).always(function () {
      layer.close(layerLoading);
    });
  $.when(getMissItem())
    .done(function (missitemrsp) {
      missItemData = missitemrsp.results;
    }).fail(function (missitemrsp) {
      console.log('获取缺失项失败');
    }).always(function () {
      layer.close(layerLoading);
    });
};

function getDepartment() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['inspect'].getDepartment + _token,
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
}

function getWorkShop() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['inspect'].getWorkShop + _token,
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

function getQualityResume(id) {
  AjaxClient.get({
    url: URLS['quality'].quality + '?' + _token + "&ids=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var data = rsp.results,
        _html = '';
      var ele = $(".quality_table").find(".table_tbody");
      ele.html('');
      if (data && data.length) {
        data.forEach(function (item, index) {
          _html += `<tr>
            <td>${item.material_code}(${item.check_code})</td>
            <td>
              <button data-id="${item.id}" class="button pop-button view"><a href=${item.type==2?"/QC/viewComplaintById?id="+item.id:"/QC/viewQualityResume?id="+item.id} target="blank" style="color: #00a0e9;">查看</a></button>
            </td>          
          </tr> `;
        })
        ele.html(_html);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);

      LayerConfig('fail', '获取品质履历失败')
    }
  }, this);
};

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
      getChecks();
    }
  });
};

//重置搜索参数
function resetParam() {
  ajaxData = {
    code: '',
    material_name: '',
    material_code: '',
    check_type_code: '',
    checker_code: '',
    sub_number: '',
    wo_number: '',
    sales_order_code: '',
    sales_order_project_code: '',
    po_number: '',
    factory_name: '',
    amount_of_inspection: '',
    LGFSB: '',
    LGPRO: '',
    start_check_time: '',
    end_check_time: '',
    start_time: '',
    end_time: '',
    operation_name: '',
    man_check: '',
    MC: '',
    audit_status: ''
  };
}

//获取检验列表
function getChecks() {
  var urlLeft = '&check_resource=2';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  var url = URLS['check'].export+"?" + _token + urlLeft;
  $('#exportExcel').attr('href', url)
  urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['check'].select + "?" + _token + urlLeft,
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
        noData('暂无数据', 16);
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
      noData('获取物料列表失败，请刷新重试', 16);
    },
    complete: function () {
      $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
    }
  }, this);
}



//生成列表数
function createHtml(ele, data) {
  ele.html('');
  var ics = 0;
  data.forEach(function (item, index) {
    var copyFlag = false;
    if (item.is_copy == 1) {
      copyFlag = true;
    }
    var _html = `<span class="el-checkbox_input el-checkbox_input_check" id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span>`;
    ids.forEach(function (iitem) {
      if (iitem == item.id) {
        _html = `<span class="el-checkbox_input el-checkbox_input_check is-checked" id="${item.id}">
		                <span class="el-checkbox-outset"></span>
                    </span>`;
        ics++;
      }
    });
    var tr = `
            <tr class="tritem" data-id="${item.id}" style="background-color: ${copyFlag ? '#d0d000' : ''}">
                <td class="left norwap">
		             <span class="el-checkbox_input el-checkbox_input_check" id="${item.id}" >
		                ${_html}
		        </td>
                <td ${tansferNull(item.is_delete)==1?`style='min-width:40px;'`:``}>${tansferNull(item.is_delete)==1?`<span style="color: #FF0000;font-weight: bold;">已删</span>`:``}</td>
                <td>${tansferNull(item.code)}</td>
                <td>${tansferNull(item.sales_order_code)}</td>
                <td>${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.po_number)}</td>
                <td>${tansferNull(item.wo_number)}</td>
                <td>${tansferNull(item.operation_name)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td width="100px;">${tansferNull(item.attr)}</td>
                <td>${tansferNull(item.half_material_code)}</td>
                <td>${tansferNull(item.pro_factory_name)}</td>
                <td>${tansferNull(item.workbench_name)}</td>
                <td>${tansferNull(item.personliable)}</td>
                <td><input onkeyup="value=value.replace(/\\-/g,'')" data-id="${item.id}" class="mc-change" value="${tansferNull(item.LIFNR)}" style="border: none;color: #393939;font-size: 12px;height:28.6px;"></input></td>
                <td><input type="number" onkeyup="value=value.replace(/\\-/g,'')" data-id="${item.id}" id="order_number_val${item.id}" class="order_number_val deal" value="${tansferNull(item.order_number)}" style="border: none;color: #393939;font-size: 12px;"></td>
                <td> <input type="number" onkeyup="value=value.replace(/\\-/g,'')" data-id="${item.id}" class="number_val deal" value="${tansferNull(item.amount_of_inspection)}" style="border: none;color: #393939;font-size: 12px;"></td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${item.ctime}</td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${item.check_time}</td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${item.result == null ? '' : item.result == 0 ? '合格' : '不合格'}</td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${tansferNull(item.card_id)}</td>
                <td class="showtime" ${showFlag == 0 ? 'style="display: none;"' : ''}>${tansferNull(item.check_type_code)}</td>
                <td class="right">
                    ${item.audit_status == 0 ? `<button data-id="${item.id}" class="button pop-button result_audit">审核</button>` : item.audit_status == 1 ? `<button data-id="${item.id}" class="button pop-button result_audit_back">反审</button>` : ''}
                    <button class="button pop-button view viewProcess" data-operation-id="${item.operation_id}" data-sales-order-code="${item.sales_order_code}" data-sales-order-project-code="${item.sales_order_project_code}" data-id="${item.work_order_id ? item.work_order_id : item.sub_order_id}" data-wo-number="${item.wo_number}">工艺文件</button>
                    <button class="button pop-button view viewAttachment" data-id="${item.id}" data-type="3">附件</button>
                    <a href="/Claim/addClaim?check_id=${item.id}"><button data-id="${item.id}" data-code="${tansferNull(item.material_code)}" class="button pop-button" data-ebeln="${item.EBELN}">索赔</button></a>
                    <!--<button data-id="${item.id}" data-code="${item.material_code}" data-po="${item.po_number}" data-wo="${item.wo_number}" class="button pop-button claim" data-ebeln="${item.EBELN}">索赔</button>-->
                    <button data-id="${item.id}" class="button pop-button check">检验</button>
                    <button data-id="${item.id}" class="button pop-button copy">复制</button>
                    ${item.status == 2 ? '':`<button data-id="${item.id}" class="button pop-button delete delete-code">删除</button>`}
                </td>
            </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  });
  if (ics < data.length) {
    $('#check_all_select').removeClass('is-checked');
  } else {
    $('#check_all_select').addClass('is-checked');
  }
}

function getworkOrderView(id) {
  AjaxClient.get({
    url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var group_routing_package = JSON.parse(rsp.results.group_routing_package);
      viewWtModal(group_routing_package)


    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工单详情失败，请刷新重试', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    }

  }, this)
}
// function viewWtModal(group_routing_package) {
//     var wwidth = $(window).width() - 80,
//         wheight = $(window).height() - 80,
//         mwidth = wwidth + 'px',
//         mheight = wheight + 'px';
//     var lableWidth = 100;
//     layerModal = layer.open({
//         type: 1,
//         title: '查看工艺',
//         offset: '40px',
//         area: [mwidth, mheight],
//         shade: 0.1,
//         shadeClose: false,
//         resize: false,
//         move: false,
//         content: `<form class="viewAttr formModal" id="viewattr">
// 					<div id="formPrintWt"></div>
//     </form>`,
//         success: function (layero, index) {
//             createPreview(group_routing_package);
//         },
//         end: function () {
//             $('.out_material .item_out .table_tbody').html('');
//         }
//
//     })
// }
// function createPreview(data) {
//     if(typeof data == 'string') {
//         data = JSON.parse(data);
//     }
//     var stepBlocks = '', in_flag = '';
//     var stepItems = '';
//     var step_draw = '';
//     var composing_drawings = '';
//     data.forEach(function (sitem) {
//
//
//         var s_draw = [], s_material_in = '', s_material_out = '';
//         if (sitem.step_drawings && sitem.step_drawings.length) {
//             sitem.step_drawings.forEach(function (sditem) {
//                 s_draw.push(sditem.image_name)
//             })
//         }
//         if (sitem.material && sitem.material.length) {
//             var material_in = getFilterPreviewData(sitem.material, 1),
//                 material_out = getFilterPreviewData(sitem.material, 2);
//             if (material_in.length) {
//                 s_material_in = cpreviewAttr(material_in, 'in');
//             } else {
//                 s_material_in = `<span class="no_material">无</span>`;
//             }
//             if (material_out.length) {
//                 s_material_out = cpreviewAttr(material_out, 'out');
//             } else {
//                 s_material_out = `<span class="no_material">无</span>`;
//             }
//         } else {
//             s_material_out = s_material_in = `<span class="no_material">无</span>`;
//         }
//         // 能力
//         var name_desc = '', work_center = '';
//         if (sitem.abilitys && sitem.abilitys.length) {
//             sitem.abilitys.forEach(function (descitem, sindex) {
//                 name_desc += `<table width="400" style="background: #f0f0f0; text-align: left; margin: 5px 0;">
//                           <tr style="height: auto">
//                             <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${sindex + 1}.能力&nbsp;</td>
//                             <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${descitem.ability_name}</td>
//                           </tr>
//                           ${descitem.description != null && descitem.description != '' ? `<tr style="height: auto">
//                             <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;能力描述&nbsp;</td>
//                             <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
//                               ${descitem.description}
//                             </td>
//                           </tr>`: ''}
//                         </table>`;
//             });
//         } else {
//             name_desc = '';
//         }
//         var work_arr = sitem.workcenters;
//         // 工作中心
//         if (work_arr) {
//             work_arr.forEach(function (witem,windex) {
//                 work_center += `<table width="200" style="background: #f0f0f0; text-align: left; margin: 5px;">
//                           <tr style="height: auto">
//                             <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${windex + 1}.编码&nbsp;</td>
//                             <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${witem.code}</td>
//                           </tr>
//                           <tr style="height: auto">
//                             <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;名称&nbsp;</td>
//                             <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
//                               ${witem.name}
//                             </td>
//                           </tr>
//                         </table>`;
//             });
//
//         } else {
//             work_center = '';
//         }
//         stepItems += `<tr>
//                    <td>${sitem.index}</td>
//                    <td>${sitem.name}</td>
//                    <td align="left">${name_desc}</td>
//                    <td>${work_center}</td>
//                    <td class="pre_material ma_in">${s_material_in}</td>
//                    <td class="pre_material ma_out">${s_material_out}</td>
//                    <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
//                    <td class="pre_bgcolor desc" style="word-break: break-all">${tansferNull(sitem.description)}</td>
//                    <td class="pre_bgcolor desc">${tansferNull(sitem.comment)}</td>
//                  </tr>`;
//
//         if (sitem.step_drawings && sitem.step_drawings.length) {
//             sitem.step_drawings.forEach(function (ditem) {
//                 step_draw += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
// 				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" class="pic-img" data-id="${ditem.drawing_id}" data-src="/storage/${ditem.image_path}" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
// 				 <p>${ditem.code}</p>
// 				 </div>`;
//             })
//         }
//         if (sitem.composing_drawings && sitem.composing_drawings.length) {
//             sitem.composing_drawings.forEach(function (ditem) {
//                 step_draw += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
// 				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" class="pic-img" data-id="${ditem.compoing_drawing_id}" data-src="/storage/${ditem.image_path}" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
// 				 <p>${ditem.code}</p>
// 				 </div>`;
//             })
//         }
//
//     });
//
//     stepBlocks = `<div class="route_preview_container">
//                     <table>
//                         <thead>
//                           <tr>
//                               <th style="width:45px;">序号</th>
//                               <th style="width:60px;">步骤</th>
//                               <th style="width:200px;">能力</th>
//                               <th>工作中心</th>
//                               <th>消耗品</th>
//                               <th>产成品</th>
//                               <!--<th>图纸</th>-->
//                               <th>标准工艺</th>
//                               <th>特殊工艺</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           ${stepItems}
//                           <tr><td colspan="8"><div class="draw_content clearfix">${step_draw}</div></td></tr>
//                           <tr><td colspan="8"><div class="draw_content clearfix">${composing_drawings}</div></td></tr>
//
//                         </tbody>
//                     </table>
//                     <div class="img_expand_pre"></div>
//                  </div>`
//     if (stepBlocks) {
//         $('#formPrintWt').html(stepBlocks);
//     } else {
//         $('#formPrintWt').html('');
//     }
// }
//
// function getFilterPreviewData(dataArr, type) {
//     return dataArr.filter(function (e) {
//         return e.type == type;
//     });
// }
// function cpreviewAttr(data, flag) {
//     var bgColor = '', str = '';
//     if (flag == 'in') {
//         bgColor = 'ma_in';
//     } else {
//         bgColor = 'ma_out';
//     }
//     data.forEach(function (mitem) {
//         var ma_attr = '', ma_attr_container = '';
//         if (mitem.attributes && mitem.attributes.length) {
//             mitem.attributes.forEach(function (aitem) {
//                 if (aitem.from == 'erp') {
//                     aitem.commercial = "null";
//                 }
//                 ma_attr += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial == 'null' ? '' : [aitem.commercial]}</td></tr>`;
//             });
//             ma_attr_container = `<table>${ma_attr}</table>`;
//         } else {
//             ma_attr = `<span>暂无数据</span>`;
//             ma_attr_container = `<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
//         }
//         str += `<div class="route_preview_material ${bgColor}">
//               <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
//               <div class="pre_attr">${ma_attr_container}</div>
//               <div class="pre_unit"><span>${mitem.qty}</span><p>${mitem.bom_commercial}</p></div>
//               <div class="pre_unit" style="width: 100px"><span>描述</span><p>${mitem.desc}</p></div>
//           </div>`;
//     });
//     return str;
// }

//获取类别列表
function getQCType() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['type'].select + "?" + _token,
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
}



//生成下拉框数据
function selectHtml(fileData, parent_id) {
  var innerhtml, selectVal, parent_id;
  var lis = selecttreeHtml(fileData, parent_id);
  innerhtml = `<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="type_id" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            ${lis}
        </ul>
    </div>`;
  itemSelect = [];
  return innerhtml;
}

function getCurrentDate() {
  var curDate = new Date();
  var _year = curDate.getFullYear(),
    _month = curDate.getMonth() + 1,
    _day = curDate.getDate();
  return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

//查询索赔单模态框
function addClaim(id, code, ebeln, po_number, wo_number) {
  var title = '索赔单';

  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: ['500px', '700px'],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" autocomplete="off" id="claim_form"> 
                <input type="hidden" id="itemId" value="${id}"> 
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">物料号<span class="mustItem">*</span></label>
                    <input type="text" id="MATNR" data-name="物料号" class="el-input" readonly placeholder="请输入物料号" value="${code}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">采购凭证编号<span class="mustItem">*</span></label>
                    <input type="text" id="EBELN" data-name="采购凭证编号" class="el-input" placeholder="请输入采购凭证编号" value="${ebeln}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div claimant" style="min-width:180px !important;">
                  <label class="el-form-item-label" style="width: 150px;">审核人<span class="mustItem">*</span></label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-muli-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <div class="el-input" id="claimant"></div>
                    </div>
                    <div class="el-muli-select-dropdown">
                      <ul class="el-muli-select-dropdown-list">
                      </ul>
                    </div>
                  </div>
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">生产订单号<span class="mustItem">*</span></label>
                    <input type="text" id="po_number" data-name="生产订单号" class="el-input" placeholder="请输入生产订单号" value="${po_number}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">工单号<span class="mustItem">*</span></label>
                    <input type="text" id="wo_number" data-name="工单号" class="el-input" placeholder="请输入工单号" value="${wo_number}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                   <label class="el-form-item-label" style="width: 150px;">责任人<span class="mustItem">*</span></label>
                   <div class="el-select-dropdown-wrap">
                        <input type="text" id="employee" class="el-input" placeholder="请输入责任人" value="">
                    </div>
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                   <label class="el-form-item-label" style="width: 150px;">责任单位<span class="mustItem">*</span></label>
                   <div class="el-select-dropdown-wrap">
                        <input type="text" id="responsibleOrganization" class="el-input" placeholder="请输入责任单位" value="">
                    </div>
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">数量<span class="mustItem">*</span></label>
                    <input type="number" id="MATNR_qty" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">缺陷数量<span class="mustItem">*</span></label>
                    <input type="number" id="DEFECT_SUM" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="缺陷数量" class="el-input" placeholder="请输入缺陷数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料号<span class="mustItem">*</span></label>
                    <input type="text" id="RELATIVE_ITEM_CODE" data-name="连带物料号" class="el-input" placeholder="请输入连带物料号" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料数量<span class="mustItem">*</span></label>
                    <input type="number" id="RELATIVE_ITEM_SUM" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入连带物料数量" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">问题描述<span class="mustItem">*</span></label>
                    <textarea type="textarea" maxlength="500" id="DEFECT_DESC" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字符"></textarea>                 </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle">取消</button>
                    <button type="button" class="el-button el-button--primary submit">确定</button>
                </div>
             </div>
        </form>`,
    success: function (layero, index) {
      layerEle = layero;
      AjaxClient.get({
        url: URLS['check'].list + "?" + _token + '&page_no=1&page_size=100',
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          layer.close(layerLoading);
          var claimant = rsp.results,
            claimHtml = '';
          if (claimant.length) {
            claimant.forEach(function (item) {
              claimHtml += `<li data-id="${item.admin_id}" data-name="${item.cn_name}" class="el-muli-select-dropdown-item">${item.cn_name}</li>`;
            });
          }
          $(".claimant").find('.el-muli-select-dropdown-list').html(claimHtml);
        },
        fail: function (rsp) {
          layer.close(layerLoading);
          if (rsp && rsp.message != undefined && rsp.message != null) {
            LayerConfig('fail', rsp.message);
          }
        }
      })
      $('#employee').autocomplete({
        url: URLS['check'].list + "?" + _token + "&page_no=1&page_size=10",
        param: 'cn_name',
        showCode: 'cn_name'
      });
      getLayerSelectPosition($(layero));
      var width = $('#employee').width();
      $('#employee').siblings('.el-select-dropdown').width(width + 20);
    },
    end: function () {

    }
  });
}

function submitClaim(data) {
  AjaxClient.post({
    url: URLS['check'].storeQcClaim,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      if (rsp.results.RESPONSE_STATUS == 'SUCCESSED') {
        layer.confirm('索赔成功', {
          icon: 1,
          title: '提示',
          offset: '250px',
          end: function () {
            $('.uniquetable tr.active').removeClass('active');
          }
        }, function (index) {
          layer.close(index);
          getChecks();
        });
      } else {
        LayerConfig('fail', '索赔失败！');
      }


    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#claim_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

    }
  }, this);
}

function copyCheck(id) {
  AjaxClient.get({
    url: URLS['check'].checkCopy + "?id=" + id + "&" + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.msg('复制成功', {
        icon: 1,
        offset: '250px',
        time: 1500
      }, function () {
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, {
        icon: 2,
        offset: '250px',
        time: 1500
      }, function () {
        getChecks();
      });
    }
  }, this);
}

function sumbitAudit(id, flag) {
  var data = [];
  if (flag == 'one') {
    data = id;
  } else {
    data = id;
  }
  AjaxClient.post({
    url: URLS['check'].audit,
    data: {
      ids: data,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('审核成功！', {
        icon: 1,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.confirm(rsp.message, {
        icon: 5,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    }
  }, this);
}

function sumbitAuditBack(id, flag) {
  var data = [];
  if (flag == 'one') {
    data = id;
  } else {
    data = id;
  }
  AjaxClient.post({
    url: URLS['check'].auditBack,
    data: {
      ids: data,
      _token: TOKEN
    },
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('反审成功！', {
        icon: 1,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.confirm(rsp.message, {
        icon: 5,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        getChecks();
      });
    }
  }, this);
}

function bindEvent() {
  $('body').on('click', '.result_audit_back', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行反审操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitAuditBack(id, "one");
    });
  });
  $('body').on('click', '.button_audit_back', function (e) {
    e.stopPropagation();
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要反审的检验单！', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    } else {
      layer.confirm('将执行批量反审操作?', {
        icon: 3,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        sumbitAuditBack(ids, 'more');
      })
    }
  });
  $('body').on('click', '.result_audit', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行审核操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitAudit(id, 'one');
    });
  });
  $('body').on('click', '.button_audit', function (e) {
    e.stopPropagation();
    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要审核的检验单！', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    } else {
      layer.confirm('将执行批量审核操作?', {
        icon: 3,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        sumbitAudit(ids, 'more');
      })
    }
  });
  $('body').on('click', '.copy', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行复制操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      copyCheck(id);
    });
  })
  //提交索赔单
  $('body').on('click', '#claim_form .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var $employee = $('#employee');
      var employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
        $employee.data('inputItem').cn_name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').admin_id : '';
      if (employee) {
        var parentForm = $(this).parents('#claim_form');
        $(this).addClass('is-disabled');
        parentForm.addClass('disabled');
        var check_id = parentForm.find("#itemId").val(),
          MATNR = parentForm.find("#MATNR").val(),
          MATNR_qty = parentForm.find("#MATNR_qty").val(),
          DEFECT_SUM = parentForm.find("#DEFECT_SUM").val(),
          RELATIVE_ITEM_CODE = parentForm.find("#RELATIVE_ITEM_CODE").val(),
          RELATIVE_ITEM_SUM = parentForm.find("#RELATIVE_ITEM_SUM").val(),
          EBELN = parentForm.find("#EBELN").val(),
          DEFECT_DESC = parentForm.find("#DEFECT_DESC").val(),
          claimant = parentForm.find("#claimant").attr('data-id'),
          responsibleOrganization = parentForm.find("#responsibleOrganization").val();
        submitClaim({
          check_id: check_id,
          employee_id: employee,
          items: JSON.stringify([{
            id: '',
            MATNR: MATNR,
            EBELN: EBELN,
            MATNR_qty: MATNR_qty,
            DEFECT_SUM: DEFECT_SUM,
            DEFECT_DESC: DEFECT_DESC,
            RELATIVE_ITEM_CODE: RELATIVE_ITEM_CODE,
            RELATIVE_ITEM_SUM: RELATIVE_ITEM_SUM,
            key_persons: claimant,
            responsibleOrganization: responsibleOrganization,
          }]),
          _token: TOKEN
        });
      } else {
        LayerConfig('fail', '请补全责任人！');
      }
    }

  });

  // 索赔
  $('body').on('click', '.claim', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    var code = $(this).attr("data-code");
    var EBELN = $(this).attr("data-ebeln");
    var po_number = $(this).attr("data-po");
    var wo_number = $(this).attr("data-wo");
    addClaim(id, code, EBELN, po_number, wo_number);

  });
  //点击弹框内部关闭dropdown
  $(document).click(function (e) {
    var obj = $(e.target);
    if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
      $('.el-muli-select-dropdown').slideUp().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
      $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    }
    if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
      $('#searchForm .el-item-hide').slideUp(400, function () {
        $('#searchForm .el-item-show').css('background', 'transparent');
      });
      $('.arrow .el-input-icon').removeClass('is-reverse');
    }
  });
  //显示与隐藏
  $('body').on('click', '#show_all_time', function (e) {
    e.stopPropagation();
    $('.showtime').toggle();
    if ($(this).text() == '显示') {
      $(this).text('隐藏');
      showFlag = 1;
    } else {
      $(this).text('显示');
      showFlag = 0;
    }
  });
  $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
    e.stopPropagation();
  });
  //弹窗取消
  $('body').on('click', '.formIQCCheck:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  // $('body').on('blur', '.order_number_val', function (e) {
  //   e.stopPropagation();
  //   updateOrderAmount($(this).attr('data-id'), $(this).val())
  // });

  $('body').on('blur', '.number_val', function (e) {
    e.stopPropagation();
    var order_number_val = $("#order_number_val" + $(this).attr('data-id')).val();
    updateAmountInspection($(this).attr('data-id'), $(this).val(), order_number_val)
  });

  $('body').on('blur', '.mc-change', function (e) {
    e.stopPropagation();
    var LIFNR = $(this).val();
    updateLIFNR($(this).attr('data-id'), LIFNR)
  });

  // //排序
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
    getChecks();
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
    if (!$(this).hasClass('check_status')) {
      var width = $(this).width();
      var offset = $(this).offset();
      $(this).siblings('.el-select-dropdown').width(width).css({
        top: offset.top + 33 - layerOffset.top,
        left: offset.left - layerOffset.left
      });
    }
  });

  //多选下拉框
  $('body').on('click', '.el-muli-select', function () {
    if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
      $('.el-item-show').find('.el-muli-select-dropdown').hide();
      $('.el-item-show').find('.el-muli-select .el-input-icon').removeClass('is-reverse');
    } else {
      $('.el-item-show').find('.el-muli-select-dropdown').hide();
      $('.el-item-show').find('.el-muli-select .el-input-icon').removeClass('is-reverse');
      $(this).find('.el-input-icon').addClass('is-reverse');
      $(this).siblings('.el-muli-select-dropdown').show();
    }
    if (!$(this).hasClass('check_status')) {
      var scroll = $(document).scrollTop();
      var width = $(this).width();
      var offset = $(this).offset();
      $(this).siblings('.el-muli-select-dropdown').width(width).css({
        top: offset.top + 33 - layerOffset.top,
        left: offset.left - layerOffset.left
      });
    }
  });

  $('body').on('click', '.el-muli-select-dropdown-item', function (e) {
    e.stopPropagation();
    $(this).toggleClass('selected');
    var _html = '',
      val_id = '';
    $(this).parent().find(".selected").each(function (index, v) {
      _html += $(v).text() + ',';
      val_id += $(v).attr("data-id") + ',';
    })
    var ele = $(this).parents('.el-muli-select-dropdown').siblings('.el-muli-select');
    ele.find('.el-input').text(_html);
    ele.find('.el-input').attr('data-id', val_id);
    //$(this).parents('.el-muli-select-dropdown').hide().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
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
  //搜索物料属性
  $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    var $itemJP = $('#type_id');
    var type_code = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
      $itemJP.data('inputItem').name == $itemJP.val().trim().replace(/\（.*?）/g, "") ? $itemJP.data('inputItem').code : '';

    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    if (!$(this).hasClass('is-disabled')) {
      $(this).addClass('is-disabled');
      $('.el-sort').removeClass('ascending descending');
      pageNo = 1;
      ajaxData = {
        code: parentForm.find('#order_id').val().trim(),
        material_name: parentForm.find('#material_id').val().trim(),
        material_code: parentForm.find('#material_code').val().trim(),
        factory_name: parentForm.find('#factory_name').val().trim(),
        amount_of_inspection: parentForm.find('#amount_of_inspection').val().trim(),
        LGPRO: parentForm.find('#LGPRO').val().trim(),
        LGFSB: parentForm.find('#LGFSB').val().trim(),
        start_time: parentForm.find('#start_time').val(),
        end_time: parentForm.find('#end_time').val(),
        start_check_time: parentForm.find('#start_check_time').val(),
        end_check_time: parentForm.find('#end_check_time').val(),
        po_number: parentForm.find('#po_number').val().trim(),
        wo_number: parentForm.find('#wo_number').val().trim(),
        sub_number: parentForm.find('#sub_number').val().trim(),
        sales_order_code: parentForm.find('#sales_order_code').val().trim(),
        sales_order_project_code: parentForm.find('#sales_order_project_code').val().trim(),
        operation_name: parentForm.find('#operation').val().trim(),
        man_check: parentForm.find('#man_check').val().trim(),
        audit_status: parentForm.find('#repairstatus').val().trim(),
        MC: parentForm.find('#MC').val().trim(),
        checker_code: parentForm.find('#checker_code').val().trim(),
        check_type_code: type_code,
      };
      getChecks();
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
  $('#start_check_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_check_time_input').text() ? $('#end_check_time_input').text() : getCurrentDate();
    start_time = laydate.render({
      elem: '#start_check_time_input',
      max: max,
      type: 'datetime',
      show: true,
      closeStop: '#start_check_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
  });
  $('#end_check_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var min = $('#start_check_time_input').text() ? $('#start_check_time_input').text() : '2018-1-20 00:00:00';
    end_time = laydate.render({
      elem: '#end_check_time_input',
      min: min,
      max: getCurrentDate(),
      type: 'datetime',
      show: true,
      closeStop: '#end_check_time',
      done: function (value, date, endDate) {
        that.val(value);
      }
    });
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

  //重置搜索框值
  $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
    e.stopPropagation();
    $(this).addClass('is-disabled');
    $('#searchForm .el-item-hide').slideUp(400, function () {
      $('#searchForm .el-item-show').css('background', 'transparent');
    });
    $('.arrow .el-input-icon').removeClass('is-reverse');
    var parentForm = $(this).parents('#searchForm');
    parentForm.find('#order_id').val('');
    parentForm.find('#material_id').val('');
    parentForm.find('#material_code').val('');
    parentForm.find('#checker_code').val('');
    parentForm.find('#amount_of_inspection').val('');
    parentForm.find('#factory_name').val('');
    parentForm.find('#start_time_input').text('');
    parentForm.find('#end_time_input').text('');
    parentForm.find('#start_time').val('');
    parentForm.find('#end_time').val('');
    parentForm.find('#start_check_time_input').text('');
    parentForm.find('#end_check_time_input').text('');
    parentForm.find('#start_check_time').val('');
    parentForm.find('#end_check_time').val('');
    parentForm.find('#wo_number').val('');
    parentForm.find('#sub_number').val('');
    parentForm.find('#sales_order_project_code').val('');
    parentForm.find('#sales_order_code').val('');
    parentForm.find('#po_number').val('');
    parentForm.find('#operation').val('');
    parentForm.find('#LGFSB').val('');
    parentForm.find('#LGPRO').val('');
    parentForm.find('#type_id').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#man_check').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#MC').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#audit_status').val('').siblings('.el-input').val('--请选择--');
    $('.el-select-dropdown-item').removeClass('selected');
    $('.el-select-dropdown').hide();
    pageNo = 1;
    resetParam();
    getChecks();
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

  //列表页全选
  $('body').on('click', '#check_all_select', function () {
    $(this).toggleClass('is-checked');
    if ($(this).hasClass('is-checked')) {
      $('table tr .el-checkbox_input_check').each(function () {
        if (!$(this).hasClass('is-checked')) {
          var id = $(this).attr("id");
          $(this).addClass('is-checked');
          if (ids.indexOf(id) == -1) {
            ids.push(id);
          }
        }
      })
    } else {
      $('table tr .el-checkbox_input_check').each(function () {
        if ($(this).hasClass('is-checked')) {
          $(this).removeClass('is-checked');
          var id = $(this).attr("id");
          var index = ids.indexOf(id);
          if (index != -1) {
            ids.splice(index, 1);
          }
        }
      })
    }
  });

  $('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
    var id = $(this).attr("id")
    if ($(this).hasClass('is-checked')) {
      if (ids.indexOf(id) == -1) {
        ids.push(id);
      }
    } else {
      var index = ids.indexOf(id);
      ids.splice(index, 1);
    }
  });

  //检验项选择
  $('body').on('click', '.el-checkbox_input_items', function (e) {
    $(this).toggleClass('is-checked');
    if ($(this).parent().parent().hasClass('expand')) {
      itemIds = [];
      if ($(this).hasClass("is-checked")) {
        $(this).parent().parent().siblings("tr").each(function (k, v) {
          if (!$(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            $(v).find(".el-checkbox_input_items").addClass('is-checked');
          }
        })
        $('#check_item .table_tbody').find('tr').each(function (k, v) {
          var itemId = $(v).find(".el-checkbox_input_items").attr("id");
          if ($(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            if (itemIds.indexOf(itemId) == -1) {
              itemIds.push(itemId);
            }
          }
        })
      } else {
        $(this).parent().parent().siblings("tr").each(function (k, v) {
          if ($(v).find(".el-checkbox_input_items").hasClass('is-checked')) {
            $(v).find(".el-checkbox_input_items").removeClass('is-checked');
          }
        })
      }
    } else {
      var itemId = $(this).attr("id");
      if ($(this).hasClass('is-checked')) {
        if (itemIds.indexOf(itemId) == -1) {
          itemIds.push(itemId);
        }
      } else {
        var index = itemIds.indexOf(itemId);
        itemIds.splice(index, 1);
      }
    }

  });

  $('body').on('click', '.missing_item_relational .el-muli-select-dropdown-item', function (e) {
    e.stopPropagation();
    var missItemId = $('#dispose_val').attr('data-id');
    getMissingItem(missItemId);
  })

  $('.button_check').on('click', function (e) {
    e.stopPropagation();

    var ids = [];
    $(".table_tbody .tritem td .el-checkbox_input").each(function () {
      if ($(this).hasClass('is-checked')) {
        ids.push($(this).attr('id'));
      }
    })
    if (ids == [] || ids.length == 0) {
      layer.msg('当前未选择检验单，请选择需要检验的检验单！', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    } else {
      layer.confirm('将执行批量检验操作?', {
        icon: 3,
        title: '提示',
        offset: '250px',
        end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        checkResult('more', ids);
      })
    }
  });

  $('.table_tbody').on('click', '.check', function () {
    var id = $(this).attr('data-id');
    ids = [];
    $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (v, i) {
      $(i).removeClass('is-checked');
    })
    $(this).parent().parent().find('.el-checkbox_input_check').addClass('is-checked');
    ids.push($(this).attr('data-id'));
    checkResult('single', id);
  });
  $('body').on('click', '#addIQCCheck_from:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addIQCCheck_from');
      $(this).addClass('is-disabled');
      parentForm.addClass('disabled');
      var anomalies = $('#anomalies').hasClass('is-checked') ? 2 : 1;
      var missItemRelationalId1 = $('#missItemRelationalId1').attr('data-id'),
        missItemRelationalId2 = $('#missItemRelationalId2').attr('data-id'),
        missingItemRelationalId = $('#dispose_val').attr('data-id');
      var missItem1 = $('#missItem1').attr('data-id'),
        missItem2 = $('#missItem2').attr('data-id'),
        missingItemsId = $('#missing_items_id').attr('data-id');
      var mIRID = unique((missItemRelationalId1 + ',' + missItemRelationalId2 + ',' + missingItemRelationalId).split(','));
      var mIID = unique((missItem1 + ',' + missItem2 + ',' + missingItemsId).split(','));
      var check_result = parentForm.find("input[name='check_result']:checked").val(),
        dispose = $('#dispose').val() ? $('#dispose').val() : '',
        // unit_id = $('#unit_id').val() ? $('#unit_id').val() : '',
        question_description = $('#question_description').val() ? $('#question_description').val() : '',
        deadly = $('#deadly').val() ? $('#deadly').val() : '',
        seriousness = $('#seriousness').val() ? $('#seriousness').val() : '',
        slight = $('#slight').val() ? $('#slight').val() : '',
        dispose_ideas = $('#dispose_ideas').val() ? $('#dispose_ideas').val() : '',
        missing_items = $('#missing_items').val() ? $('#missing_items').val() : '',
        scene = $('#scene').val() ? $('#scene').val() : '',
        department_id = $('#department').attr("data-id"),
        workshop_id = $('#workShop').attr("data-id"),
        grammage1 = $('#grammage1').val() ? $('#grammage1').val() : $('#grammage11').val(),
        grammage2 = $('#grammage2').val() ? $('#grammage2').val() : $('#grammage22').val(),
        grammage3 = $('#grammage3').val() ? $('#grammage3').val() : $('#grammage33').val(),
        gatewidth1 = $('#gatewidth1').val() ? $('#gatewidth1').val() : $('#gatewidth11').val(),
        gatewidth2 = $('#gatewidth2').val() ? $('#gatewidth2').val() : $('#gatewidth22').val(),
        gatewidth3 = $('#gatewidth3').val() ? $('#gatewidth3').val() : $('#gatewidth33').val(),
        dimensions1 = $('#dimensions1').val() ? $('#dimensions1').val() : $('#dimensions11').val(),
        dimensions2 = $('#dimensions2').val() ? $('#dimensions2').val() : $('#dimensions22').val(),
        dimensions3 = $('#dimensions3').val() ? $('#dimensions3').val() : $('#dimensions33').val();
      var $unit = $('#unit_now');
      var unit_id = $unit.data('inputItem') == undefined || $unit.data('inputItem') == '' ? '' :
        $unit.data('inputItem').commercial == $unit.val().replace(/\（.*?）/g, "").trim() ? $unit.data('inputItem').id : '';
      checkSubmit({
        check_result: check_result,
        dispose: dispose,
        unit_id: unit_id,
        question_description: question_description,
        deadly: deadly,
        seriousness: seriousness,
        slight: slight,
        dispose_ideas: dispose_ideas,
        missing_items: missing_items,
        scene: scene,
        department_id: department_id,
        workshop_id: workshop_id,
        missing_item_relational_id: mIRID.join(','),
        missing_items_id: mIID.join(','),
        grammage1: grammage1,
        grammage2: grammage2,
        grammage3: grammage3,
        gatewidth1: gatewidth1,
        gatewidth2: gatewidth2,
        gatewidth3: gatewidth3,
        dimensions1: dimensions1,
        dimensions2: dimensions2,
        dimensions3: dimensions3,
        anomalies: anomalies,
        _token: TOKEN
      });
    }

  });
  $('body').on('click', '#addBindTemplate_from:not(".disabled") .submit', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass('is-disabled')) {
      var parentForm = $(this).parents('#addBindTemplate_from');
      $(this).addClass('is-disabled');
      parentForm.addClass('disabled');
      var id = parentForm.find("#id").val();
      var $itemJP = $('#template');
      var template = $itemJP.data('inputItem') == undefined || $itemJP.data('inputItem') == '' ? '' :
        $itemJP.data('inputItem').name == $itemJP.val().trim().replace(/\（.*?）/g, "") ? $itemJP.data('inputItem').id : '';
      bindTemplate({
        check_id: id,
        check_type: template,
        _token: TOKEN
      });
    }

  });
  //
  // $('body').on('click','.bind_template',function (e) {
  //     e.stopPropagation();
  //     viewTemplate($(this).attr('data-id'));
  // });
  $('body').on('click', '.sumbit', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    $(this).parents('tr').addClass('active');
    layer.confirm('将执行推送操作?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {
        $('.uniquetable tr.active').removeClass('active');
      }
    }, function (index) {
      layer.close(index);
      sumbitCheck(id);
    });
  });

  $('body').on('click', '.process', function (e) {
    e.stopPropagation();
    var id = $(this).attr("data-id");
    getworkOrderView(id);

  });
  //弹窗取消
  $('body').on('click', '.cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  });

  //输入框的相关事件
  $('body').on('focus', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'missItemRelationalId1') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem1') {
      var that = $(this);
      createMissItemsHtml(that);
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    } else if ($(this).attr('id') == 'missItemRelationalId2') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem2') {
      var that = $(this);
      createMissItemsHtml(that, 'missItem2');
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  }).on('blur', '.basic_info .el-input:not([readonly])', function () {
    var name = $(this).attr('id'),
      id = $('itemId').val();
    validatorConfig[name] &&
      validatorToolBox[validatorConfig[name]] &&
      validatorToolBox[validatorConfig[name]](name) &&
      remoteValidatorConfig[name] &&
      remoteValidatorToolbox[remoteValidatorConfig[name]] &&
      remoteValidatorToolbox[remoteValidatorConfig[name]](name, id);
  }).on('input', '.el-input:not([readonly])', function () {
    if ($(this).attr('id') == 'missItemRelationalId1') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem1') {
      var that = $(this);
      createMissItemsHtml(that);
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    } else if ($(this).attr('id') == 'missItemRelationalId2') {
      var that = $(this);
      createRelationalMissItems(that);
      $(this).parent().siblings('.el-select-dropdown').show();
    } else if ($(this).attr('id') == 'missItem2') {
      var that = $(this);
      createMissItemsHtml(that, 'missItem2');
      $(this).parents('.el-form-item').find('.errorMessage').html("");
    }
  });

  //模糊搜索下拉列表项点击不良项目
  $('body').on('click', '.relational-miss-item .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
      getMissingItems(idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
      getMissingItems(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索下拉列表项点击不良项目1
  $('body').on('click', '.relational-miss-item1 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
      getMissingItemsOne(idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
      getMissingItemsOne(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索下拉列表项点击事件
  $('body').on('click', '.miss-item1 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });

  //模糊搜索不良细分2点击事件
  $('body').on('click', '.miss-item2 .el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      ele.val($(this).text()).attr('data-id', idval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
  });


  //删除检验单
  $('body').on('click', '.delete-code', function (e) {
    var id = $(this).attr('data-id');
    e.stopPropagation;
    layer.confirm('确定删除检验单?', {
      icon: 3,
      title: '提示',
      offset: '250px',
      end: function () {

      }
    }, function (index) {
      layer.close(index);
      // var id =$(this).attr('data-id');
      AjaxClient.post({
        url: URLS['check'].delete + "?_token=" + TOKEN + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
          layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
          LayerConfig('success', '删除成功');
          layer.close(layerLoading);
          getChecks();
        },
        fail: function (rsp) {
          LayerConfig('fail', rsp.message);
          layer.close(layerLoading);
        }
      })
    });
  })
};


//创建不良项目下拉框
function createRelationalMissItems(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, missItemData);
      var lis = '';
      if (filterData.length > 0) {
        console.log(filterData)
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      that.parents('.el-form-item').find('.el-select-dropdown-list').html(lis);
      if (that.parents('.el-form-item').find('.el-select-dropdown').is(":hidden")) {
        that.parents('.el-form-item').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}

//模糊搜索不良细分下拉框
function createMissItemsHtml(that, value) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = [];
      if (value) {
        filterData = getFilterData(val, missItemDetailData2);
      } else {
        filterData = getFilterData(val, missItemDetailData1);
      }
      var lis = '';
      if (filterData.length > 0) {
        console.log(filterData)
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}" class="el-select-dropdown-item el-auto"><span>${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      that.parents('.el-form-item').find('.el-select-dropdown-list').html(lis);
      if (that.parents('.el-form-item').find('.el-select-dropdown').is(":hidden")) {
        that.parents('.el-form-item').find('.el-select-dropdown').slideDown("200");
      }
    }
  }, 1000);
}


//获取模糊搜索不良细分数据
function getMissingItems(id) {
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      missItemDetailData1 = rsp.results;
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

//点击不良项目调用不良细分
function getMissingItemsOne(id) {
  AjaxClient.get({
    url: URLS['check'].missingIitems + '?' + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      missItemDetailData2 = rsp.results;
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

//修改订单数量
function updateOrderAmount(id, value) {
  AjaxClient.post({
    url: URLS['check'].updateCheckQty,
    dataType: 'json',
    data: {
      'id': id,
      'order_number': value,
      _token: TOKEN
    },
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getChecks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      getChecks();
    }
  }, this);
}

function updateLIFNR(id, LIFNR) {
  AjaxClient.post({
    url: URLS['check'].updateMCdata,
    dataType: 'json',
    data: {
      'id': id,
      'sub_number': LIFNR,
      _token: TOKEN
    },
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.confirm('MC更新成功', {
        icon: 1,
        title: '提示',
        offset: '250px',
        end: function () {}
      }, function (index) {
        layer.close(index);
        getChecks();
      })
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      getChecks();
    }
  }, this);
}

//修改抽检数
function updateAmountInspection(id, value, order_number_val) {
  AjaxClient.post({
    url: URLS['check'].updateAmountInspection,
    dataType: 'json',
    data: {
      'check_id': id,
      'amount_of_inspection': value,
      _token: TOKEN
    },
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      updateOrderAmount(id, order_number_val);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }

      getChecks();

    }
  }, this);
}

// function getMaterial(id,sale,line) {
//     var dtd = $.Deferred();
//     AjaxClient.get({
//         url: URLS['check'].CareLabel + "?" + _token + "&material_code=" + id+"&sale_order_code="+sale+"&line_project_code="+line,
//         dataType: 'json',
//         beforeSend: function () {
//             layerLoading = LayerConfig('load');
//         },
//         success: function (rsp) {
//             layer.close(layerLoading);
//             if (rsp && rsp.results) {
//                 showAttachment(rsp.results,id);
//             } else {
//                 console.log('获取附件失败');
//             }
//             dtd.resolve(rsp);
//         },
//         fail: function (rsp) {
//             layer.close(layerLoading);
//             console.log('获取附件失败');
//             dtd.reject(rsp);
//         }
//     }, this);
//     return dtd;
// }
// //查询图纸模态框
// function showAttachment(formData,id) {
//     var title = '附件',
//
//         layerModal = layer.open({
//             type: 1,
//             title: title,
//             offset: '70px',
//             area: '300px',
//             shade: 0.1,
//             shadeClose: false,
//             resize: false,
//             move: '.layui-layer-title',
//             moveOut: true,
//             content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
//
//
//             <div class="table table_page">
//                 <div id="pagenation" class="pagenation"></div>
//                 <table id="table_pic_table" class="sticky uniquetable commontable">
//                     <thead>
//                         <tr>
//                             <th>名称</th>
//                             <th class="center">缩略图</th>
//                             <th class="center">备注</th>
//                         </tr>
//                     </thead>
//                     <tbody class="table_tbody">
//                         <tr>
//                             <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </form>`,
//             success: function (layero, index) {
//                 layerEle = layero;
//                 createAttachmentTable(formData,id);
//                 getLayerSelectPosition($(layero));
//             },
//             end: function () {
//
//             }
//         });
// }
// function createAttachmentTable(data,code) {
//     $('#attachment_form .table_tbody').html('');
//     if (data) {
//
//             var str = data.image.substring(data.image.indexOf('.')+1,data.image.length),_html='';
//             if(str=='jpg'||str=='png'||str=='jpeg'||str=='gif'){
//                 _html=`<img width="60px;" heigth="60px;" data-id="${data.drawing_id}" data-src="${window.storage}${data.image}" class="pic-img" width="80" height="40" src="${window.storage}${data.image}"/>`;
//             }else {
//                 _html=`<a href="${window.storage}${data.image}"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
//             }
//             var tr = `
//                 <tr class="tritem" data-id="${data.drawing_id}">
//                     <td><div style="width: 120px;word-break: break-all;white-space: normal;word-wrap: break-word;">${tansferNull(code)}（${data.version_code}）</div></td>
//                     <td class="center">${_html}</td>
//                     <td class="center">${data.remark}</td>
//                 </tr>`;
//
//
//     } else {
//         var tr = `<tr>
//                 <td class="nowrap" colspan="3" style="text-align: center;">暂无数据</td>
//             </tr>`;
//         $('#attachment_form .table_tbody').append(tr);
//     }
// }
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
      var ele = $(".miss-items").find(".el-muli-select-dropdown-list")
      ele.html('');
      rsp.results.forEach(function (item) {
        var span = `<span class="el-checkbox__label">${item.name}</span>`;
        _html += `
          <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
        `
      })
      ele.html(_html);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取缺失项失败!');
    }
  }, this);
}

function sumbitCheck(id) {
  AjaxClientSap.get({
    url: URLS['check'].pushInspectOrder + "?" + _token + "&check_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      getChecks();
      LayerConfig('success', '推送成功！');
      updateStatus(id);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '推送失败！');
      getChecks();
    }
  }, this);
}

function updateStatus(id) {
  AjaxClient.get({
    url: URLS['check'].pushInspectOrder + "?" + _token + "&check_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
    }
  }, this);
}

function bindTemplate(data) {
  AjaxClient.post({
    url: URLS['check'].selectTemplate,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      getChecks();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
      $('body').find('#addBindTemplate_from').removeClass('disabled').find('.submit').removeClass('is-disabled');

    }
  }, this);
}

function bindTemplateModal(id, data) {
  var labelWidth = 100,
    btnShow = 'btnShow',
    title = '绑定模板',

    textareaplaceholder = '',
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
    content: `<form class="formModal formBindTemplate" id="addBindTemplate_from" >
            <input type="hidden" id="id" value="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">模板</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" id="template" class="el-input" autocomplete="off" placeholder="模板" value="">
                    </div>
                </div>
            </div>

            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
        </form>`,
    success: function (layero, index) {
      getLayerSelectPosition($(layero));

      $('#template').autocomplete({
        url: URLS['check'].templateList + "?" + _token,
        param: 'name'
      });
      $('#template').each(function (item) {
        var width = $(this).parent().width();
        $(this).siblings('.el-select-dropdown').width(width);

      });
      if (data.name) {
        $('#template').val(data.name + '（' + data.code + '）').data('inputItem', data).blur();

      }

    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });

}

function checkResult(flag, id) {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['template'].select + "?" + _token + "&ids=" + id.toString(),
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results.template && rsp.results.template.length) {
        Modal(flag, rsp.results, id);
        dtd.resolve(rsp);
      } else {
        LayerConfig('fail', '暂无模板！');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', rsp.message);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;

}

//查看和添加和编辑模态框
function Modal(flag, checkItems, id) {
  var {
    result = '', dispose = '', workshop_id = '', department_id = '', missing_items = '', missing_items_id = '', dispose_ideas = '', unit = '', unit_text = '', commercial = '', question_description = '', scene = '', missing_item_relational_id = '', deadly = '', seriousness = '', slight = '', grammage1 = '', grammage2 = '', grammage3 = '', gatewidth1 = '', gatewidth2 = '', gatewidth3 = '', dimensions1 = '', dimensions2 = '', dimensions3 = '', is_suremodify = '', is_sureabnormal = ''
  } = {};
  if (flag == 'single') {
    if (checkItems.check_res) {
      ({
        result = '',
        anomalies = '',
        dispose = '',
        workshop_id = '',
        department_id = '',
        missing_items = '',
        missing_items_id = '',
        dispose_ideas = '',
        unit = '',
        unit_text = '',
        commercial = '',
        question_description = '',
        scene = '',
        missing_item_relational_id = '',
        deadly = '',
        seriousness = '',
        slight = '',
        grammage1 = '',
        grammage2 = '',
        grammage3 = '',
        gatewidth1 = '',
        gatewidth2 = '',
        gatewidth3 = '',
        dimensions1 = '',
        dimensions2 = '',
        dimensions3 = '',
        result = '',
        man_check = '',
        is_suremodify = '',
        is_sureabnormal = ''
      } = checkItems.check_res);
    }
  } else {
    if (checkItems.check_res) {
      ({
        result = '',
        anomalies = '',
        dispose = '',
        workshop_id = '',
        department_id = '',
        missing_items = '',
        missing_items_id = '',
        dispose_ideas = '',
        unit = '',
        unit_text = '',
        commercial = '',
        question_description = '',
        scene = '',
        missing_item_relational_id = '',
        deadly = '',
        seriousness = '',
        slight = '',
        grammage1 = '',
        grammage2 = '',
        grammage3 = '',
        gatewidth1 = '',
        gatewidth2 = '',
        gatewidth3 = '',
        dimensions1 = '',
        dimensions2 = '',
        dimensions3 = '',
        result = '',
        man_check = '',
        is_suremodify = '',
        is_sureabnormal = ''
      } = checkItems.check_res);
    }
  }

  var labelWidth = 100,
    btnShow = 'btnShow',
    title = 'IPQC质检',
    disposeHtml = '',
    departmentHtml = '',
    sceneHtml = '',
    result_true = '',
    result_flase = '',
    workshop_val = '--请选择--',
    dispose_val = '--请选择--',
    department_val = '--请选择--',
    scene_val = '--请选择--',
    noEdit = '',
    missItemHtml = '',
    missing_item_val = '';

  if (disposeData.length) {
    disposeData.forEach(function (item) {
      disposeHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (departmentData.length) {
    departmentHtml = muliDepartment(departmentData);
  }
  if (workShopData.length) {
    workShopHtml = muliWorkShop(workShopData);
  }
  if (sceneData.length) {
    sceneData.forEach(function (item) {
      sceneHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (missItemData.length) {
    missItemData.forEach(function (item) {
      missItemHtml += `<li data-id="${item.id}" data-name="${item.name}" class="el-muli-select-dropdown-item">${item.name}</li>`;
    });
  }
  if (result !== '') {
    if (result == 0) {
      result_true = 'checked="checked"'
    } else if (result == 1) {
      result_flase = 'checked="checked"'
    }
  }

  if (dispose) {
    disposeData.forEach(function (item) {
      if (item.id == dispose) {
        dispose_val = item.name;
      }
    })
  }
  if (department_id) {
    var departmentArr = department_id.split(','),
      department_val = '';
    departmentData.forEach(function (item) {
      departmentArr.forEach(function (ditem) {
        if (item.id == Number(ditem)) {
          department_val += item.name + ','
        }
      })
    })
  }
  if (workshop_id) {
    var workshopArr = workshop_id.split(','),
      workshop_val = '';
    workShopData.forEach(function (item) {
      workshopArr.forEach(function (witem) {
        if (item.id == Number(witem)) {
          workshop_val += item.name + ','
        }
      })
    })
  }
  if (missing_item_relational_id) {
    var missingItemArr = missing_item_relational_id.split(',');
    missItemData.forEach(function (item) {
      missingItemArr.forEach(function (mitem) {
        if (item.id == Number(mitem)) {
          missing_item_val += item.name + ',';
        }
      })
    })
  }
  if (scene) {
    sceneData.forEach(function (item) {
      if (item.id == scene) {
        scene_val = item.name;
      }
    })
  }
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '50px',
    area: ['1000px', '600px;'],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    moveOut: true,
    move: '.layui-layer-title',
    content: `<form class="formModal formIQCCheck" id="addIQCCheck_from" data-flag="${flag}">
                ${is_sureabnormal==0?`<span class="el-checkbox_input el-checkbox_input_items ${anomalies == 2 ? 'is-checked' : ''}"  style="vertical-align:middle;margin-left:15px;"  id="anomalies">
                    <span class="el-checkbox-outset" ></span><span>是否重大异常</span>
                </span>`:``}
                <table class="checkbox el-item-show">
                  ${checkItems.detail!=undefined?(checkItems.detail.length?`<tr> 
                      <td colspan="4">
                      <table class="sticky uniquetable material_table" style='margin-bottom:20px;'>
                          <thead>
                          <tr>
                              <th class="center nowrap tight">物料编码</th>
                              <th class="center nowrap tight">物料名称</th>
                              <th class="center nowrap tight">检验状态</th>
                              <th class="center nowrap tight">检验类型</th>
                              <th class="center nowrap tight">状态原因</th>
                              <th class="center nowrap tight">描述</th>
                              <th class="center nowrap tight">操作</th>
                          </tr>
                          </thead>
                          <tbody class="table_tbody">
                          </tbody>
                      </table>
                      </td>
                  </tr>`:''):''}
                    <tr>
                        <td style="width: 100px;text-align: center;">检验结果</td>
                        <td style="width: 400px;">
                            <input type="radio" id="result_true" name="check_result" ${result_true} value="0">
                            <label for="result_true" style="margin-left: -10px;">合格</label>
                            <input type="radio" id="result_false" name="check_result" ${result_flase} value="1">
                            <label for="result_false" style="margin-left: -10px;">不合格</label>
                            <div class="el-form-item" style="display:inline-block;width:120px;margin-left: 20px;">
                                    <div class="el-form-item-div" style="width:120px;min-width:120px;" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${dispose_val}">
                                                <input type="hidden" class="val_id" id="dispose" value="${dispose}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${disposeHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td style="width: 100px;">责任单位</td>
                        <td style="width: 400px;display:flex;">
                              <div class="el-form-item" style="width:180px;">
                                  <div class="el-form-item-div" style="min-width:180px !important;">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-muli-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <div class="el-input" data-id='${workshop_id}' id="workShop">${workshop_val}</div>
                                            </div>
                                            <div class="el-muli-select-dropdown">
                                                <ul class="el-muli-select-dropdown-list">
                                                    ${workShopHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item" style="width:180px;">
                                    <div class="el-form-item-div" style="min-width:180px !important;">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-muli-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <div class="el-input" data-id='${department_id}' id="department">${department_val}</div>
                                            </div>
                                            <div class="el-muli-select-dropdown">
                                                <ul class="el-muli-select-dropdown-list">
                                                    ${departmentHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                    </tr>
                    <tr>
                        <td>不合格类型</td>
                        <td>
                        <div>
                        <div class="el-form-item relational-miss-item" style="display:inline-block;width:180px;">
                          <div class="el-select-dropdown-wrap">
                            <input type="text" data-id="" id="missItemRelationalId1" class="el-input" autocomplete="off" placeholder="请输入不良项目" value="">
                            <div class="el-select-dropdown" style="position: absolute; display: none;">
                              <ul class="el-select-dropdown-list"></ul>
                            </div>
                          </div>
                        </div>
                        <div class="el-form-item miss-item1" style="display:inline-block;width:180px;">
                          <div class="el-select-dropdown-wrap">
                            <input type="text" data-id="" id="missItem1" class="el-input" autocomplete="off" placeholder="请输入不良细分" value="">
                            <div class="el-select-dropdown" style="position: absolute; display: none;">
                              <ul class="el-select-dropdown-list"></ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="el-form-item relational-miss-item1" style="display:inline-block;width:180px;">
                          <div class="el-select-dropdown-wrap">
                            <input type="text" data-id="" id="missItemRelationalId2" class="el-input" autocomplete="off" placeholder="请输入不良项目" value="">
                            <div class="el-select-dropdown" style="position: absolute; display: none;">
                              <ul class="el-select-dropdown-list"></ul>
                            </div>
                          </div>
                        </div>
                        <div class="el-form-item miss-item2" style="display:inline-block;width:180px;">
                          <div class="el-select-dropdown-wrap">
                            <input type="text" data-id="" id="missItem2" class="el-input" autocomplete="off" placeholder="请输入不良细分" value="">
                            <div class="el-select-dropdown" style="position: absolute; display: none;">
                              <ul class="el-select-dropdown-list"></ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style="display:flex;">
                        <div class="el-form-item" style="width:180px;">
                          <div class="el-form-item-div" style="min-width:180px !important;">
                            <div class="el-select-dropdown-wrap">
                              <div class="el-muli-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <div id="dispose_val" data-id="${missing_item_relational_id}" class="el-input">${missing_item_val}</div>
                                  <input type="hidden" class="val_id" id="missing_item_relational_id" value="${missing_item_relational_id}">
                                </div>
                                <div class="el-muli-select-dropdown">
                                  <ul class="el-muli-select-dropdown-list missing_item_relational">
                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                    ${missItemHtml}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        <div class="el-form-item" style="width:180px;">
                            <div class="el-form-item-div" style="min-width:180px !important;">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-muli-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <div class="el-input" data-id="${missing_items_id}" id="missing_items_id" value>${missing_items}</div>
                                    </div>
                                    <div class="el-muli-select-dropdown miss-items">
                                        <ul class="el-muli-select-dropdown-list">
                                        </ul>
                                    </div>
                                </div>
                            </div>                            
                      </div>
                        </td>
                        <td>计量单位</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div">
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="unit_now" class="el-input" placeholder="请输入单位" value="">
                                        </div>    
                                    </div>
                                </div>
                             </div>
                        </td>
                    </tr>
                    <tr>
                        <td>问题描述</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="question_description" rows="5" class="el-textarea" placeholder="">${question_description != null ? question_description : ''}</textarea>
                        </td>
                        <td>备注</td>
                        <td>
                            <textarea type="textarea" style="width: 100%"  maxlength="500" id="dispose_ideas" rows="5" class="el-textarea" placeholder="">${dispose_ideas ? dispose_ideas : ''}</textarea>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>发现现场</td>
                        <td>
                            <div class="el-form-item" style="display:inline-block;width:300px;">
                                    <div class="el-form-item-div" id="unitDiv">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="${scene_val}">
                                                <input type="hidden" class="val_id" id="scene" value="${scene}">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    ${sceneHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </td>
                        <td>不良数量</td>
                        <td>
                            <p>
                            <label for="deadly">致命</label>
                            <input  id="deadly" type="number" value="${deadly}">
                            </p>
                            <p>
                            <label for="seriousness">严重</label>
                            <input  id="seriousness" type="number" value="${seriousness}">
                            </p>
                            <p>
                            <label for="slight">轻微</label>
                            <input  id="slight" type="number" value="${slight}">
                            </p>
                        
                        </td>
                    </tr>
                    <tr>
                        <td>其他信息</td>
                        <td>
                        <p>
                            <label for="grammage">克重</label>
                            <input  id="grammage1" type="text" style="width:80px;" value="${man_check != 1 ? '' : grammage1}">
                            <input  id="grammage11" type="hidden" style="width:80px;" value="${grammage1}">
                            <input  id="grammage2" type="text" style="width:80px;" value="${man_check != 1 ? '' : grammage2}">
                            <input  id="grammage22" type="hidden" style="width:80px;" value="${grammage2}">
                            <input  id="grammage3" type="text" style="width:80px;" value="${man_check != 1 ? '' : grammage3}">
                            <input  id="grammage33" type="hidden" style="width:80px;" value="${grammage3}">
                            </p>
                            <p>
                            <label for="gatewidth">门幅</label>
                            <input  id="gatewidth1" type="text" style="width:80px;" value="${man_check != 1 ? '' : gatewidth1}">
                            <input  id="gatewidth11" type="hidden" style="width:80px;" value="${gatewidth1}">
                            <input  id="gatewidth2" type="text" style="width:80px;" value="${man_check != 1 ? '' : gatewidth2}">
                            <input  id="gatewidth22" type="hidden" style="width:80px;" value="${gatewidth2}">
                            <input  id="gatewidth3" type="text" style="width:80px;" value="${man_check != 1 ? '' : gatewidth3}">
                            <input  id="gatewidth33" type="hidden" style="width:80px;" value="${gatewidth3}">
                            </p>
                            <p>
                            <label for="dimensions">尺寸</label>
                            <input  id="dimensions1" type="text" style="width:80px;" value="${man_check != 1 ? '' : dimensions1}">
                            <input  id="dimensions11" type="hidden" style="width:80px;" value="${dimensions1}">
                            <input  id="dimensions2" type="text" style="width:80px;" value="${man_check != 1 ? '' : dimensions2}">
                            <input  id="dimensions22" type="hidden" style="width:80px;" value="${dimensions2}">
                            <input  id="dimensions3" type="text" style="width:80px;" value="${man_check != 1 ? '' : dimensions3}">
                            <input  id="dimensions33" type="hidden" style="width:80px;" value="${dimensions3}">
                            </p>
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="4">
                        <table id="check_item" class="sticky uniquetable  check_table">
                            <thead>
                            <tr>
                                <th class="center nowrap tight" colspan="4">检验项</th>                       
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
        
                            </tbody>
                        </table>
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="4">
                        <table class="sticky uniquetable quality_table">
                            <thead>
                            <tr>
                                <th class="center nowrap tight" colspan="2">查看品质履历</th>                       
                            </tr>
                            </thead>
                            <tbody class="table_tbody">
                            </tbody>
                        </table>
                        </td>
                    </tr>                    
                </table>
            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${is_suremodify==0?'is-disabled':''}">确定</button>
            </div>
          </div>
        </form>`,
    success: function (layero, index) {
      checkItems.template.forEach(function (item03) {
        item03.item_id = '';
        item03.value = '';
      })
      getQualityResume(id);
      let _html = '';
      if (checkItems.detail) {
        checkItems.detail.forEach(function (item, index) {
          _html += `<tr>
            <td>${tansferNull(item.item_no)}</td>
            <td style="width:150px;">${tansferNull(item.item_name)}</td>
            <td>${item.result==0?'合格':(item.result==1?'不合格':'')}</td>
            <td>${item.check_resource==2?"ipqc":(item.check_resource==1?"iqc":(item.check_resource==3?"oqc":''))}</td>
            <td>${item.dispose==1?'退货':(item.dispose==2?'让步接收':(item.dispose==3?'特采':''))}</td>
            <td>${tansferNull(item.question_description)}</td>
            <td>
              <a href=${item.check_resource==2?"/QC/inspectionIPQCIndex?check_status=1&&check_code="+item.code:(item.check_resource==1?"/QC/inspectionIQCIndex?check_code="+item.code+(item.status==2?'&check_status=2':''):(item.check_resource==3?"/QC/inspectionOQCIndex?check_code="+item.code:''))} target="blank" style="color: #00a0e9;">查看</a></button>
            </td>          
          </tr> `;
        })
      }
      $('.material_table').find('.table_tbody').html(_html);
      if (flag == 'single') {
        if (checkItems.result_res && checkItems.result_res.length) {
          checkItems.result_res.forEach(function (item01) {
            checkItems.template.forEach(function (item02) {
              if (item01.qc_template == item02.template_id) {
                itemIds.push(item02.id);
                item02.item_id = item01.id;
                item02.value = item01.value;
              }
            })
          })
        }
      }

      if (checkItems.template.length) {
        $('#check_item .table_tbody').html(treeHtml(checkItems.template, checkItems.template[0].parent_id));

      }

      $('#unit_now').autocomplete({
        url: URLS['check'].unit + "?" + _token + "&page_no=1&page_size=10",
        param: 'commercial',
        showCode: 'commercial'
      });
      if (unit) {
        $('#unit_now').val(commercial).data('inputItem', {
          id: unit,
          commercial: commercial
        }).blur();
      }
      $('#unit_now').on('click', function (e) {
        e.stopPropagation();
        $(this).next().width(300);
      })
      getLayerSelectPosition($(layero));



      layerOffset = layero.offset();

    },
    end: function () {
      $('.uniquetable tr.active').removeClass('active');
    }
  });
};

function departTreeHtml(fileData, parent_id) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    distance = level * 20, tagI = '', itemcode = ''
    var distance, className, itemImageClass, tagI, itemcode = '';
    distance = level * 20, tagI = '', itemcode = ''

    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `<span>${item.name}</span> `;

    _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${departTreeHtml(fileData, item.id)}
	        `;

  });
  return _html;
};

//车间多选列表
function muliWorkShop(workShopData) {
  var _html = `<li data-id="" data-name="--请选择--" class="el-muli-select-dropdown-item">--请选择--</li>`;
  workShopData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;
    _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
    `
  })
  return _html;
}

//部门多选列表
function muliDepartment(departData) {
  var _html = `<li data-id="" data-name="--请选择--" class="el-muli-select-dropdown-item">--请选择--</li>`;
  departData.forEach(function (item, index) {
    var span = `<span class="el-checkbox__label">${item.name}</span>`;
    _html += `
      <li data-id="${item.id}" data-name="${encodeURI(item.name)}" class="el-muli-select-dropdown-item">${span}</li>
    `
  })
  return _html;
}

function treeHtml(fileData, parent_id) {
  var _html = '';
  var children = getChildById(fileData, parent_id);
  var hideChild = parent_id > 0 ? 'none' : '';
  children.forEach(function (item, index) {
    var lastClass = index === children.length - 1 ? 'last-tag' : '';
    var level = item.level;
    var distance, className, itemImageClass, tagI, itemcode = '';
    var hasChild = hasChilds(fileData, item.id);
    hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
    distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`, itemcode = `(${item.code})`;
    var selectedClass = '';
    var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `${tagI}<span>${item.name}</span> ${itemcode}`;

    _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}" >
	        <input type="hidden" id="item${item.id}" data-code="${item.template_code}" data-tem="${item.template_id}" value="${item.item_id}">
	          <td width="30%">${span}</td>
	          <td width="20%">${item.type == 0 ? `<div class="el-form-item-div" style="width: 200px;min-width: 200px" id="unitDiv">
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="${item.value == 0 ? '合格' : item.value == 1 ? '不合格' : '--请选择--'}">
                            <input type="hidden" class="val_id check_please" id="value${item.id}" value="${item.value == "" ? 0 : item.value}">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="0" data-name="true" class=" el-select-dropdown-item">合格</li>
                                <li data-id="1" data-name="false" class=" el-select-dropdown-item">不合格</li>
                            </ul>
                        </div>
                    </div>
                </div>`: item.type == 1 ? `<div class="el-select"><input class="el-select" id="value${item.id}" style="width:189px;" placeholder="请输入" type="number" value="${item.value}"></div>` : `<div class="el-select"><input class="el-input" style="width:189px;" id="value${item.id}" placeholder="请输入"  type="text" value="${item.value}"></div>`}  
	            
              </td>
              <td width="40%">${item.remark}</td>
              <td>
                <span class="el-checkbox_input el-checkbox_input_items ${item.item_id != '' ? 'is-checked' : ''}"  style="vertical-align:middle"  id="${item.id}">
                    <span class="el-checkbox-outset" ></span>
                </span>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id)}
	        `;

  });
  return _html;
};

function checkSubmit(data) {
  var check_choose = [],
    check_item = [];
  ids.forEach(function (item) {
    check_choose.push({
      "check_id": item
    })
  });
  itemIds.forEach(function (item) {
    check_item.push({
      "item_id": $("#item" + item).val(),
      "template_code": $("#item" + item).attr('data-code'),
      "template_id": $("#item" + item).attr('data-tem'),
      "value": $("#value" + item).val()
    })
  });


  data.check_choose = JSON.stringify(check_choose);
  data.check_item = JSON.stringify(check_item);
  AjaxClient.post({
    url: URLS['check'].check,
    data: data,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      ids = [];
      itemIds = [];
      getChecks();
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
// $('body').on('input','.el-item-show input',function(event){
//     event.target.value = event.target.value.replace( /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im,"");
// })

//筛选数组
function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    console.log(e.name)
    var name = e.name;
    return name.indexOf(type) > -1;
  });
}

//数组去重
function unique(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) { //第一个等同于第二个，splice方法删除第二个
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
}