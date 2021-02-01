var ajaxData = {},
  operation_id = 0,
  operations = [],
  layerModal, work_number = '';
$(function () {
  var so = getQueryString('sales_order_code');
  var spo = getQueryString('sales_order_project_code');
  operation_id = getQueryString('operation_id');
  work_number = getQueryString('wo_number');
  $("#sales_order_code").val(so);
  $("#sales_order_project_code").val(spo);
  getOperationList();
  setAjaxData(); //初始搜索条件
  getRouting()
  bindEvent();
});

function setAjaxData() {
  var so = getQueryString('sales_order_code');
  var spo = getQueryString('sales_order_project_code');

  ajaxData = {
    sales_order_code: so,
    sales_order_project_code: spo,
    work_number: work_number
  }
}

//获取所有工序列表
function getOperationList() {
  //var id = $('#workcenter_id').val();
  AjaxClient.get({
    url: '/operation/AllIndex' + '?' + _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var lis = '',
        innerHtml = '';
      $('.el-form-item.operation_name').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item">--请选择--</li>');
      if (rsp.results && rsp.results.list.length) {
        rsp.results.list.forEach(function (item) {
          lis += `<li data-id="${item.id}" class="el-select-dropdown-item">${item.name}</li>`;
        });
        innerHtml = `${lis}`;
        $('.el-form-item.operation_name').find('.el-select-dropdown-list').append(innerHtml);
      }
      $("#select-operation").find('.el-select-dropdown-item[data-id=' + operation_id + ']').click();
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工序列表失败', {
        icon: 5,
        offset: '250px',
        time: 1500
      });
    }
  }, this);
}

function getRouting() {
  var urlLeft = '';
  for (var param in ajaxData) {
    urlLeft += `&${param}=${ajaxData[param]}`;
  }
  AjaxClient.get({
    url: URLS['bomAdd'].routingSoShow + _token + urlLeft,
    dataType: 'json',
    timeout: 60000,
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results && rsp.results.length) {
        var ele = $("#routing_table .table_tbody");
        getRoutingInfo(rsp.results)
      } else {
        LayerConfig('fail', '该工单未查到工艺!');
      }

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg(rsp.message, {
        icon: 5,
        offset: '250px',
        time: 2500
      });
    }
  });
}

function getRoutingInfo(data) {
  var _html = '',
    wo_arr = '';
  data.forEach(function (item, index) {
    wo_arr = item.wo_arr;
    var material = createMaterial(wo_arr)

    _html += `<tr class="no-line-tr">
                  <td colspan='3' data-content="">
                    <div class="el-header" style="display:inline-block;">工序:${item.operation_name}<i class="fa fa-chevron-down el-icon ${item.wo_arr[0].is_show ? 'is-reverse' : ''}" aria-hidden="true"></i>
                    <button class="button pop-button view downloadFile" data-wo-number="${item.wo_arr[0].wo_number}" style="display: ${!item.wo_arr[0].has_tem_technology ? 'none': ''};color:red;border-color: red;">临时工艺下载</button></div>
                  </td>
              </tr>
              <tr class="no-line-tr el-content"  style="${item.wo_arr[0].is_show ? '' : 'display:none'}">
                <td colspan='3' data-content="">
                  ${material}
                </td>
              </tr>
              `;
  })

  $("#routing_table .table_tbody").html(_html);
  $('a.media').media({
    width: 370,
    height: 300
  })
  uniteTdCells("routing_table");
}

function createMaterial(wo_arr) {
  if (wo_arr && wo_arr.length) {
    var route_html = '';
    wo_arr.forEach(function (witem, index) {
      var lis = '';
      next_lifnr_str = '', next_lifnr_arr = witem.NEXT_LIFNR_ARR, attachments = '';
      next_lifnr_arr.forEach(function (litem) {
        lis += `<li data-id="${litem.LIFNR}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${litem.LIFNR}(${litem.operation_name})</li>`;
        next_lifnr_str += litem.LIFNR + ' ';
      });
      var groupRoutingHtml = createGroupRouting(JSON.parse(witem.group_routing_package));
      if (witem.material_step_drawings && witem.material_step_drawings.length) {
        var drawings = createDrawings(witem.material_step_drawings);
      }
      if (witem.material_drawings && witem.material_drawings.length) {
        attachments = createAttachMents(witem.material_drawings, index);
      }
      next_lifnr_arr_html = `${lis}`;
      route_html += `
                  <table class="el-table">
                    <tr class="no-line-tr">
                      <td class="has-border" colspan='3' data-content="${witem.wo_number}" data-id="${witem.work_order_id}">
                        <div style="display:inline-block;height:36px;line-height:36px;"><span style="margin-left:20px;">${witem.wo_number}</span>
                        &nbsp;&nbsp;生产订单：<span>${witem.po_number}</span>
                        &nbsp;&nbsp;产成品编码：<span>${witem.item_no}</span>
                        &nbsp;&nbsp;产成品描述：<span>${witem.attr}</span>
                        &nbsp;&nbsp;当前版本：<span>V${witem.old_version}.0</span>
                        &nbsp;&nbsp;<span class="new-version" data-bom-id="${witem.new_bom_id}" style="padding:5px;background-color:#337ab7;cursor:pointer;color:red;">最新版本：V${witem.new_version}.0</span>
                        &nbsp;&nbsp;最新版本发布时间：<span>${witem.currentversion_ctime}</span>
                        &nbsp;&nbsp;工单数量：<span>${witem.qty}&nbsp;${witem.bom_commercial}</span>
                        </div>
                        <div class="el-form-item" style="display:inline-block;float:right;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 150px;">&nbsp;&nbsp;下道委外加工商：</label>
                                <div class="el-select-dropdown-wrap" style="width:200px;">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                        <input type="hidden" class="val_id NEXT_LIFNR" value=""/>
                                    </div>
                                    <div class="el-select-dropdown" style="width:200px;">
                                        <ul class="el-select-dropdown-list">
                                          ${next_lifnr_arr_html}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </td>
                    </tr>
                    ${groupRoutingHtml}
                    <tr class="no-line-tr">
                      <td class="has-border" data-content="image" style="width:7.5vw;text-align:center;">图片</td>
                      ${drawings ? `<td class="has-border" colspan="2" style="text-align:center;"><div class="picList ulwrap" style="display:flex;width:100%;"><ul>${drawings}</ul></div></td>` : `<td class="has-border" colspan="2" style="color:#ccc;"><span style="margin-left:40px;">该工单暂无图片</span></td>`}
                    </tr>
                    <tr class="no-line-tr">
                      <td class="has-border" data-content="attachment" style="width:7.5vw;text-align:center;">附件</td>
                      ${attachments ? `<td class="has-border" colspan="2" style="text-align:center;"><div style="display:flex;width:100%;height:380px;display: flex;flex-wrap: wrap;overflow-y: auto;">${attachments}</div></td>` : `<td class="has-border" colspan="2" style="color:#ccc;"><span style="margin-left:40px;">该工单暂无附件</span></td>`}
                    </tr>
                  </table>`;
    })
    return route_html;
  }
}

function createGroupRouting(group_routing_package) {
  if (group_routing_package && group_routing_package.length) {
    var group_routing_html = '';
    group_routing_package.forEach(function (gitem, index) {
      var material_in = getFilterPreviewData(gitem.material, 1);
      var material_out = getFilterPreviewData(gitem.material, 2);
      var inmaterial = createInmaterial(material_in, gitem.name, '');
      var outmaterial = createOutmaterial(material_out, gitem.name, '');
      let commentStr = '';
      if (gitem.comment) {
        let commentArr = gitem.comment.split('***');
        if (commentArr && commentArr.length) {
          commentArr.forEach(function (citem, index) {
            if (index % 2 == 1) {
              commentStr += `<span class="bold-red">${citem}</span>`;
            } else {
              commentStr += citem;
            }
          })
        } else {
          commentStr = gitem.comment;
        }
      }
      group_routing_html += `
                    ${inmaterial}
                    ${outmaterial}
                    ${gitem.comment ? `<tr class="no-line-tr" style="color:red;">
                                      <td class="has-border" data-content="${gitem.name}" style="width:7.5vw;"></td>
                                      <td class="has-border" colspan='2'><span style="margin-left:40px;">特殊工艺：</span>${tansferNull(commentStr)}</td>
                                    </tr>`: ''}`
    })
    //   <tr class="no-line-tr">
    //   <td class="has-border" data-content="${gitem.name}" style="width:7.5px;"></td>
    //   ${drawings ? `<td class="has-border" colspan="2"><div style="display:flex;width:100%;">${drawings}</div></td>` : `<td class="has-border" colspan="2" style="color:#ccc;">该步骤暂无图片</td>`}
    // </tr>
    return group_routing_html;
  }
}

function createInmaterial(data, name, display) {
  var _thtml = '';
  data.forEach(function (item) {
    var _ahtml = '',eflag = false;
    item.attributes.forEach(function (aitem) {
      if (aitem.name == "样册号") {
        _ahtml += `<span style="color:#20a0ff;">${aitem.value}</span>/`
      } else if (aitem.name == "颜色") {
        _ahtml += `<span style="color:#20a0ff;">${aitem.value}</span>/`
      } else {
        _ahtml += `<span>${aitem.value}</span>/`
      }
    })
    if (item.material_drawings && item.material_drawings.length) {
      eflag = true
    };
    _thtml += `<tr class="in-material" style="height:36px;line-height:36px;">
              ${display == 'none' ? '' : `<td class="has-border"  data-content="${name}" style="width:7.5vw;"><span style="margin-left:40px;">${name}</span></td>`}
              <td class="has-border is-lzp" data-material-code="${item.material_code}" style="text-align:right;width:7.5vw;${item.is_lzp ? 'color:red;' : ''}cursor:pointer;">${item.material_code}&nbsp;<i class="fa fa-long-arrow-right" aria-hidden="true"></i></td>
              <td class="has-border in-material-name">
                ${item.attributes ? `<a class="in-material-over" data-material-attributes='${JSON.stringify(item.attributes)}' style="padding:5px;background-color:#555555;color:#ffffff;cursor:pointer;">${_ahtml}</a>` : ``}
                ${item.desc ? `<span style="background-color:#20a0ff;color:#fff;padding:2px;">描述：${item.desc}</span>` : ``}
                ${item.replace_status == 1 ? `<span style="background-color:#20a0ff;color:#fff;padding:2px;cursor:pointer;" data-material='${JSON.stringify(item.replace_material_info)}' class="replace_status">代</span>` : ''}
                ${item.is_replace == 1 ? `<span style="background-color:#20a0ff;color:#fff;padding:2px;cursor:pointer;">当前工单不存在该进料</span>` : ''}
                ${item.use_num ? `&nbsp;&nbsp;<span>系数：</span><span>${item.use_num}</span>` : ''}
                ${item.qty ? `&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-weight:bold;">工单用量：</span><span style="font-weight:bold;">${item.qty}${item.bom_commercial}</span>` : ''}
              </td>
            </tr>`
  })
  // ${eflag ? `&nbsp;&nbsp;<span class="view-attachment"  style="padding:5px;background-color:#555555;color:#ffffff;cursor:pointer;" data-content='${JSON.stringify(item.material_drawings)}'>查看附件</span>` : ``}
  return _thtml;
}

function createOutmaterial(data, name, display) {
  var _thtml = '',
    rspan = data.length;
  data.forEach(function (item) {
    var _ahtml = '',
      eflag = false;
    item.attributes.forEach(function (aitem) {
      if (aitem.name == "样册号") {
        _ahtml += `<span style="color:#20a0ff;">${aitem.value}</span>/`
      } else if (aitem.name == "颜色") {
        _ahtml += `<span style="color:#20a0ff;">${aitem.value}</span>/`
      } else {
        _ahtml += `<span>${aitem.value}</span>/`
      }
    })
    if (item.material_drawings && item.material_drawings.length) {
      eflag = true
    };
    _thtml += `<tr class="out-material" style="height:36px;line-height:36px;">
                ${display == 'none' ? '' : `<td class="has-border" data-content="${name}" style="width:7.5vw;"><span style="margin-left:40px;">${name}</span></td>`}
                <td class="has-border is-lzp" data-material-code="${item.material_code}" style="text-align:right;width:7.5vw;${item.is_lzp ? 'color:red;' : ''}cursor:pointer;">${item.material_code}&nbsp;<i class="fa fa-long-arrow-left" aria-hidden="true"></i></td>
                <td class="has-border out-material-name">
                ${item.attributes ? `<a class="in-material-over" data-material-attributes='${JSON.stringify(item.attributes)}' style="padding:5px;background-color:#555555;color:#ffffff;cursor:pointer;">${_ahtml}</a>` : ``}
                ${item.desc ? `<span style="background-color:#20a0ff;color:#fff;padding:2px;">描述：${item.desc}</span>` : ``}
                ${item.replace_status == 1 ? `<span style="background-color:#ffa500;color:#fff;padding:2px;cursor:pointer;"  data-material="${JSON.stringify(item.replace_material_info)}" class="replace_status">代</span>` : ''}
                ${item.is_replace == 1 ? `<span style="background-color:#20a0ff;color:#fff;padding:2px;cursor:pointer;">当前工单不存在该进料</span>` : ''}
                ${item.use_num ? `&nbsp;&nbsp;<span>系数：</span><span>${item.use_num}</span>` : ''}
                ${item.qty ? `&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-weight:bold;">工单用量：</span><span style="font-weight:bold;">${item.qty}${item.bom_commercial}</span>` : ''}
                </tr>`
  })
  // ${eflag ? `&nbsp;&nbsp;<span class="view-attachment"  style="padding:5px;background-color:#555555;color:#ffffff;cursor:pointer;" data-content='${JSON.stringify(item.material_drawings)}'>查看附件</span>` : ``}
  return _thtml;
}

function uniteTdCells(tableId) {
  var tableEle = $("#" + tableId);
  tableEle.find(".el-table").each(function (key, table) {
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = i + 1; j < table.rows.length; j++) {
        let cell1 = table.rows[i].cells[0].getAttribute('data-content');
        let cell2 = table.rows[j].cells[0].getAttribute('data-content');
        if (cell1 == cell2) {
          table.rows[j].cells[0].style.display = 'none';
          table.rows[j].cells[0].style.verticalAlign = 'middle';
          table.rows[i].cells[0].rowSpan++;
          table.rows[i].cells[0].style.backgroundColor = '#eef1f6';
          table.rows[j].cells[0].style.backgroundColor = '#eef1f6';
        } else {
          table.rows[j].cells[0].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
          break;
        };
      }
    }
  })
};

function createDrawings(data) {
  var step_draw = '';
  data.forEach(function (ditem, index) {
    var des = '';
    var imgurl = ditem.image_path.split('.');
    ditem.attributes.forEach(function (aitem) {
      if (aitem.value != '' && aitem.value != "0") {
        des += aitem.name + ':' + aitem.value + '/';
      }
    })
    if (ditem.comment != '') {
      des += '描述：' + ditem.comment.replace("\n", "");
    }

    step_draw += `<li class="pic-li" data-id="${ditem.drawing_id}" data-src="${window.storage}${ditem.image_path}"><div class="el-card">
                      <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" data-id="${ditem.compoing_drawing_id}" data-src="${window.storage}${ditem.image_path}" src="/storage/${ditem.image_path}" class="pic-img pic-list-img" alt="" width="370" height="260" style="cursor:pointer;">  
                      <div style="text-align:center;width: 370px;margin:0 auto;"><div>${ditem.code}</div><div style="margin-left:10px;word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</div></div>
                  </div>
                  </li>`
  });
  //<div data-url="${ditem.image_path}" style="width:370px;">
  //   <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" data-id="${ditem.compoing_drawing_id}" data-src="${window.storage}${ditem.image_path}" src="/storage/${ditem.image_path}" class="pic-img" "alt="" width="370" height="170" style="cursor:pointer;">  
  //   <div style="display:flex;text-align:center;width: 370px;margin:0 auto;"><div>${ditem.code}</div><div style="margin-left:10px;word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</div></div>
  //</div>
  return step_draw;
}

function createAttachMents(data, index) {
  var step_draw = '';
  data.forEach(function (ditem, index) {
    var des = '';
    // if (ditem.remark != '') {
    //   des += '描述：' + ditem.remark.replace("\n", "");
    // }
    // step_draw += `<div data-url="${ditem.image_path}" style="width:370px;height:340px;">
    //                 <div><a class="media" data-id="${ditem.drawing_id}" data-src="${ditem.image_path}" href="${ditem.image_path}" target="view_window" style="cursor:pointer;"></a></div>
    //                 <div style="display:flex;text-align:center;width: 370px;margin:0 auto;"><div>${ditem.material_code}</div><div>(版本：${ditem.version_code})</div></div>
    //               </div>`
    if (ditem.image_path) {
      if (ditem.image_path.split('.').pop() === 'pdf') {
        step_draw += `<div class="pdf-preview" style="width: 370px;height:375px;position: relative;"><embed src="/storage/${ditem.image_path}" type="application/pdf" width="360" height="340"><div>${ditem.material_code} (版本：${ditem.version_code})</div>${ditem.remark ? `<div>备注:${tansferNull(ditem.remark)}</div>` : ''}<a style="width: 370px;height:340px;display: block;position: absolute;z-index: 10;top:0;left:0;" href="/storage/${ditem.image_path}" target="_blank"><br></a></div>`
      } else {
        step_draw += `<div class="pdf-preview" style="width: 370px;height:375px;position: relative;"><img src="/storage/${ditem.image_path}" width="360" height="340" alt=""><div>${ditem.material_code} (版本：${ditem.version_code})</div>${ditem.remark ? `<div>备注:${tansferNull(ditem.remark)}</div>` : ''}<a style="width: 370px;height:340px;display: block;position: absolute;z-index: 10;top:0;left:0;" href="/storage/${ditem.image_path}" target="_blank"><br></a></div>`
      }
    }
  });
  return step_draw;
}

function createNewAttachMents(data, index) {
  var step_draw = '';
  data.forEach(function (ditem, index) {
    var des = '';
    // if (ditem.remark != '') {
    //   des += '描述：' + ditem.remark.replace("\n", "");
    // }
    step_draw += `<div data-url="${ditem.image_path}" style="width:370px;height:340px;">
                    <div><img src="${ditem.image}" img_path="/storage/${ditem.image_path}" class="show-pdf" width="250px" height="180" onclick="ShowXB(this)" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" style="cursor:pointer;"></div>
                    <div style="display:flex;text-align:center;width: 370px;margin:0 auto;"><div>${ditem.material_code}</div><div>(版本：${ditem.version_code})</div></div>
                  </div>`
  });
  return step_draw;
}

function getFilterPreviewData(dataArr, type) {
  return dataArr.filter(function (e) {
    return e.type == type;
  });
}

function showAttachmentModal(formData) {
  var title = '附件';
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: '1000px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
      <div class="table table_page">
          <div id="pagenation" class="pagenation"></div>
          <table id="table_pic_table" class="sticky uniquetable commontable">
              <thead>
                  <tr>
                      <th>物料编码</th>
                      <th class="center">缩略图</th>
                      <th class="center">版本号</th>
                      <th class="center">描述</th>
                      <th class="center">创建时间</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">
                  <tr>
                      <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </form>`,
    success: function (layero, index) {
      layerEle = layero;
      createAttachmentTable(formData);
      getLayerSelectPosition($(layero));
    },
    end: function () {

    }
  });
}

function createAttachmentTable(data) {
  $('#attachment_form .table_tbody').html('');
  var data = JSON.parse(data);
  if (data.length) {
    data.forEach(function (item, index) {
      if (item.image_path != null) {
        var mhtml = '';
        var str = item.image_path.substring(item.image_path.indexOf('.') + 1, item.image_path.length),
          _html = '';
        if (str == 'jpg' || str == 'png' || str == 'jpeg' || str == 'gif') {
          _html = `<img width="60px;" height="60px;" data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}" class="pic-img" width="80" height="40" src="${window.storage}${item.image_path}"/>`;
        } else {
          _html = `<a href="${window.storage}${item.image_path}" target="view_window"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
        }
        var tr = `
              <tr class="tritem" data-id="${item.drawing_id}" style="text-align: center;">
                  <td class="center">${tansferNull(item.material_code)}</td>
                  <td class="center">${_html}</td>
                  <td class="center">${tansferNull(item.version_code)}</td>
                  <td class="center">${tansferNull(item.remark)}</td>
                  <td class="center">${dateFormat(tansferNull(item.ctime), 'Y-m-d H:i:s')}</td>
              </tr>`;
        $('#attachment_form .table_tbody').append(tr);
        $('#attachment_form .table_tbody').find('tr:last-child').data('picItem', item);
      } else {
        var tr = `<tr>
              <td class="nowrap" colspan="5" style="text-align: center;">图片路径为空</td>
                </tr>`;
        $('#attachment_form .table_tbody').append(tr);
      }
    });
  } else {
    var tr = `<tr>
              <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
          </tr>`;
    $('#attachment_form .table_tbody').append(tr);
  }
}

function showReplaceMaterial(material) {
  var _rhtml='';
  if (material && material.length) {
    material.forEach(function (item, index) {
      let _ahtml = '';
      _ahtml += item.item_no;
      item.attr_name.forEach(function (aitem) {
          _ahtml += `<span>${aitem}</span>/`
      })
      _rhtml+=`<a class="in-material-over" data-material-attributes='${JSON.stringify(item.attr_name)}' style="padding:5px;background-color:#555555;color:#ffffff;cursor:pointer;">${_ahtml}</a>`
    })
  }
  return _rhtml;
}

//上道工艺文件
function showReplaceMaterialModal(material) {
  var title = '替换料日志';
  layer.close(layerModal);
  let replace_material=JSON.parse(material);
  let _html = '';
  if (material && material.length) {
    replace_material.forEach(function (item, index) {
      _html += `<tr class="no-line-tr el-content">
                <td class="has-border" style="text-align:left;width:7.5vw;">
                  ${item.type==1?'SAP':(item.type=2?'MES':'')}
                </td>
                <td class="has-border" style="text-align:left;width:7.5vw;">
                  ${tansferNull(item.RMATNR)}
                </td>
                <td class="has-border" style="text-align:left;width:7.5vw;">
                  ${tansferNull(item.RMATNR_name)}
                </td>
                <td class="has-border" style="text-align:left;width:7.5vw;">
                  ${tansferNull(item.MATNR)}
                </td>
                <td class="has-border in-material-name">
                  ${tansferNull(item.cn_name)}
                </td>
              </tr>
              `;
    })
  }
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: '75%',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment">
      <div class="table table_page">
        <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
          <thead>
            <tr style="background-color:lightgray;">
              <th class="text-cneter has-border" style="width:15%;">
                替换系统
              </th>
              <th class="text-cneter has-border" style="width:15%;">
                原物料编码
              </th>
              <th class="text-cneter has-border" style="width:30%;">
                原物料描述
              </th>
              <th class="text-cneter has-border" style="width:25%;">
                新物料编码
              </th>
              <th class="text-center has-border" style="width:15%;">
                操作人
              </th>
            </tr>
          </thead>
          <tbody class="table_tbody" style="border:1px solid #000 !important;">
            ${_html}
          </tbody>
      </table>
    </div>
  </form>`,
    success: function (layero, index) {
      layerEle = layero;
      getLayerSelectPosition($(layero));
    },
    end: function () {

    }
  });
}

//上道工艺文件
function showPreviousProcessModal(item_no) {
  var title = '上道工艺';
  layer.close(layerModal);
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: '86%',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" id="previous_process_form">
      <div class="table table_page">
        <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
          <thead>
            <tr style="background-color:lightgray;">
              <th class="text-cneter has-border" style="width:15%;">
                物料编码
              </th>
              <th class="text-center has-border" style="width:80%;">
                物料属性
              </th>
            </tr>
          </thead>
          <tbody class="table_tbody" style="border:1px solid #000 !important;">
          </tbody>
      </table>
    </div>
  </form>`,
    success: function (layero, index) {
      layerEle = layero;
      createPreviousProcessTable(item_no);
      getLayerSelectPosition($(layero));
    },
    end: function () {

    }
  });
}

//上道工艺数据
function createPreviousProcessTable(item_no) {
  var so = $('#sales_order_code').val().trim(),
    spo = $('#sales_order_project_code').val().trim();
  AjaxClient.get({
    url: URLS['bomAdd'].GetprocessDocuments + _token + '&sales_order_code=' + so + '&sales_order_project_code=' + spo + '&material_code=' + item_no,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp.results && rsp.results.length) {
        var _html = getProcessRoutingInfo(rsp.results);
        $("#previous_process_form").find(".table_tbody").html(_html);
      } else {
        layer.close(layerModal);
        LayerConfig('fail', '该物料未查到上道工艺!');
      }

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.close(layerModal);
      layer.msg(rsp.message, {
        icon: 5,
        offset: '250px',
        time: 2500
      });
    }
  })
}

//上道工艺工序详情
function getProcessRoutingInfo(data) {
  var _html = '',
    wo_arr = '';
  data.forEach(function (item, index) {
    wo_arr = item.wo_arr;
    var material = createProcessMaterial(wo_arr)

    _html += `<tr class="no-line-tr">
                  <td colspan='3' data-content="">
                    <div class="el-header" style="display:inline-block;">工序:${item.operation_name}<i class="fa fa-chevron-up el-icon" aria-hidden="true"></i></div>
                  </td>
              </tr>
              <tr class="no-line-tr el-content">
                <td colspan='3' data-content="">
                  ${material}
                </td>
              </tr>
              `;
  })
  return _html;
}

//上道工艺工单详情
function createProcessMaterial(wo_arr) {
  if (wo_arr && wo_arr.length) {
    var route_html = '';
    wo_arr.forEach(function (witem, index) {
      var groupRoutingHtml = createGroupRouting(JSON.parse(witem.group_routing_package));
      if (witem.material_step_drawings && witem.material_step_drawings.length) {
        var drawings = createDrawings(witem.material_step_drawings);
      }
      route_html += `
                  <table class="el-table">
                    <tr class="no-line-tr">
                      <td class="has-border" colspan='3' data-content="${witem.wo_number}" data-id="${witem.work_order_id}">
                        <div style="display:inline-block;height:36px;line-height:36px;"><span style="margin-left:20px;">${witem.wo_number}</span>
                        &nbsp;&nbsp;当前版本：<span style="color:red;">V${witem.new_version}.0</span>
                        &nbsp;&nbsp;最新版本发布时间：<span>${witem.currentversion_ctime}</span>
                        &nbsp;&nbsp;工单数量：<span>${witem.qty}&nbsp;${witem.bom_commercial}</span>
                        </div>
                      </td>
                    </tr>
                    ${groupRoutingHtml}
                    <tr class="no-line-tr">
                      <td class="has-border" data-content="image" style="width:7.5vw;text-align:center;">图片</td>
                      ${drawings ? `<td class="has-border" colspan="2" style="text-align:center;"><div class="picList ulwrap" style="display:flex;width:100%;"><ul>${drawings}</ul></div></td>` : `<td class="has-border" colspan="2" style="color:#ccc;"><span style="margin-left:40px;">该工单暂无图片</span></td>`}
                    </tr>
                  </table>`;
    })
    return route_html;
  }
}

//获取工艺路线中的工序
function showBomRouting(bomid, routeid) {
  operations = [];
  AjaxClient.get({
    url: URLS['bomAdd'].procedureShow + '?' + _token + '&id=' + routeid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      bomItemArr = [];
      if (rsp && rsp.results && rsp.results.operations && rsp.results.orderlist) {
        var ritem = '',
          rdata = {
            routing_graph: {
              nodes: [],
              edges: []
            }
          };
        rsp.results.operations.forEach(function (item, index) {
          var op = {},
            mode = '';
          if (index == 0) {
            op = {
              operation: '<none>',
              label: 'root',
              mode: "MODE_REQUIRED"
            };
          } else {
            op = {
              operation: item.name,
              operation_id: item.operation_id,
              operation_code: item.operation_code,
              routeid: item.routeid,
              oid: item.oid,
              label: item.order - 1,
              mode: mode
            };
          }
          operations.push(op);
        });
        $(document).data('isLoad', true); // 加载完成
        showNewRoutingModal(bomid, routeid);
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取工艺路线详情失败');
    }
  }, this);
}

//最新工艺列表
function chooseRoutingModal(data, bomid) {
  var title = '选择工艺路线',
    trs = '';
  data.forEach(function (item) {
    trs += `
      <tr>
        <td class="text-cneter has-border">
          ${item.group_name}
              </td>
              <td class="text-center has-border">
                ${item.name}
              </td>
              <td class="text-center has-border">
                ${item.item_no}
              </td>
              <td class="text-center has-border">
                ${item.factory_name}
              </td>
              <td class="text-center has-border">
                <span class="button pop-button view chooseRouing" data-bom-id="${bomid}" data-id="${item.routing_id}" style="cursor:pointer;">选择</span>
              </td>
            </tr>
    `
  })
  layerModal = layer.open({
    type: 1,
    title: title,
    offset: '70px',
    area: ['86%', '600px'],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    moveOut: true,
    content: `<form class="attachmentForm formModal formAttachment" id="new_routing_form">
      <div class="table table_page">
        <table class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
          <thead>
            <tr style="background-color:lightgray;">
              <th class="text-cneter has-border">
                工艺路线组
              </th>
              <th class="text-center has-border">
                工艺路线
              </th>
              <th class="text-center has-border">
                物料编码
              </th>
              <th class="text-center has-border">
                工厂
              </th>
              <th class="text-center has-border"></th>
            </tr>
          </thead>
          <tbody class="table_tbody" style="border:1px solid #000 !important;">
            ${trs}
          </tbody>
      </table>
    </div>
  </form>`,
    success: function (layero, index) {
      layerEle = layero;
      getLayerSelectPosition($(layero));
    },
    end: function () {

    }
  });
}

//获取工艺路线
function getBomRouteLine(bomid) {
  AjaxClient.get({
    url: URLS['bomAdd'].getBomRoute + '?' + _token + '&bom_id=' + bomid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      //工艺路线
      if (rsp && rsp.results && rsp.results.length) {
        if (rsp.results.length > 1) {
          chooseRoutingModal(rsp.results, bomid);
        } else {
          showBomRouting(bomid, rsp.results[0].routing_id);
        }
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取bom工艺路线集合失败');
    }
  }, this);
}

//获取最新工艺
function showNewRoutingModal(bomid, routeid) {
  if (layerModal) layer.close(layerModal);
  var taps = '';
  if (operations != null) {
    operations.forEach(function (nitem) {
      if (nitem.operation != '<none>' && nitem.operation != '开始') {
        taps += `<span data-opid="${nitem.operation_id}" data-item="${nitem.oid}" style="margin-left:10px;padding:5px 15px;cursor:pointer;" class="el-tap">${nitem.operation}</span>`;
      }
    });
  }

  layerModal = layer.open({
    type: 1,
    title: '最新工艺',
    offset: '40px',
    area: '86%',
    shade: 0.1,
    shadeClose: true,
    resize: false,
    move: false,
    content: `<div class="preview-wrap-container">
                  <input type="hidden" value="${bomid}" id="bomid"/>
                  <input type="hidden" value="${routeid}" id="routeid"/>
                    <div class="preview-wrap">
                        <div class="el-tap-wrap">
                            ${taps}
                        </div>
                        <div id="doc_list" class="el-panel-preview-wrap" style="padding: 10px;height: 500px;">
                            <div class="el-preview-panel active" style="overflow-y:auto;">
                              <table class="el-table">
                                <thead>
                                  <tr style="background-color:lightgray;">
                                    <th class="text-cneter has-border" style="width:15%;">
                                      物料编码
                                    </th>
                                    <th class="text-center has-border" style="width:80%;">
                                      物料属性
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="table_body"></tbody>
                              </table>
                            </div>
                        </div>
                    </div>
                </div>`,
    success: function () {
      if ($('.el-tap-wrap .el-tap').length) {
        $('.el-tap-wrap .el-tap').eq(0).click();
      }
    },
    end: function () {}
  })
}

function getRoutingInfoByRoutingId(rnid) {
  var bid = $('#bomid').val(),
    rid = $('#routeid').val();
  var group_routing_html = '';
  AjaxClient.get({
    url: URLS['bomAdd'].preview + "?" + _token + "&bom_id=" + bid + "&routing_id=" + rid + "&routing_node_id=" + rnid,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.results && rsp.results.length) {
        rsp.results.forEach(function (gitem, index) {
          var step_info = gitem.step_info;
          step_info.forEach(function (sitem, index) {
            var material_in = getFilterPreviewData(sitem.material, 1);
            var material_out = getFilterPreviewData(sitem.material, 2);
            var inmaterial = createInmaterial(material_in, sitem.name, 'none');
            var outmaterial = createOutmaterial(material_out, sitem.name, 'none');
            var drawings = createDrawings(sitem.step_drawings);
            let commentStr = '';
            if (sitem.comment) {
              let commentArr = sitem.comment.split('***');
              if (commentArr && commentArr.length) {
                commentArr.forEach(function (citem, index) {
                  if (index % 2 == 1) {
                    commentStr += `<span class="bold-red">${citem}</span>`;
                  } else {
                    commentStr += citem;
                  }
                })
              } else {
                commentStr = sitem.comment;
              }
            }
            group_routing_html += `
            ${inmaterial}
            ${outmaterial}
            ${sitem.comment ? `<tr class="no-line-tr" style="color:red;height:36px;line-height:36px;">
                                <td class="has-border" data-content="${sitem.name}" style="width:7.5vw;"></td>
                                <td class="has-border" colspan='2'><span style="margin-left:40px;">特殊工艺：</span>${tansferNull(commentStr)}</td>
                              </tr>`: ''}
                              ${drawings ? `<tr class="no-line-tr">
                              <td class="has-border" data-content="image" style="width:7.5vw;text-align:center;">图片</td>
                              <td class="has-border" colspan="2" style="text-align:center;"><div class="picList ulwrap" style="display:flex;width:100%;"><ul>${drawings}</ul></div></td>
                            </tr>`: ''}`
          })
        })

        $('.preview-wrap-container .el-preview-panel .el-table .table_body').html(group_routing_html);
      } else {
        //暂无数据
        var con = `<div class="no_data_center">暂无数据</div>`
        $('.preview-wrap-container .el-preview-panel .el-table .table_body').html(con);
      }
      // console.log(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      console.log('获取工序预览失败');
    }
  }, this);
}

// 时间戳转换成指定格式日期
// 'Y年m月d日 H时i分')
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


function bindEvent() {
  //直接打印
  $('body').on('click', '#print:not(.is-disabled)', function (e) {
    e.stopPropagation();
    $("#downlistdoc").show();
    $("#downlistdoc").print();
    $("#downlistdoc").hide();
  })

  //点击图片
  $('body').off('click', '.preview_draw_wrap img').on('click', '.preview_draw_wrap img', function (e) {
    $(this).parents('.preview_draw_wrap').toggleClass('active').siblings('.preview_draw_wrap').removeClass('active');
    if ($(this).parents('.preview_draw_wrap').hasClass('active')) {
      var path = $(this).parents('.preview_draw_wrap').attr('data-url');
      var img = `<img src="/storage/${path}" alt=""/>`;
      $(this).parents('.route_preview_container').find('.img_expand_pre').addClass('active').html(img);
    } else {
      $(this).parents('.route_preview_container').find('.img_expand_pre').removeClass('active').html('');
    }
  })

  // 下拉框点击事件
  $('body').on('click', '.el-select', function () {
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
  });

  // 点击工序
  $('body').on('click', '.el-header', function () {
    $(this).find('.el-icon').toggleClass('is-reverse');
    $(this).parents('.no-line-tr').next('.el-content').toggle();
    // $(this).parents('.no-line-tr').siblings('.el-select-dropdown').toggle();
  });

  // 下拉框item点击事件
  $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('selected')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val($(this).attr('data-id'));
      operation_id = $(this).attr('data-id');
    }
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
  });

  //进出料详情modal
  $('body').on('click', '.in-material-over', function () {
    var list = $(this).attr('data-material-attributes'),
      lhtml = '';
    list = JSON.parse(list);
    list.forEach(function (litem) {
      if (litem.name == "样册号") {
        lhtml += `<div class="el-form-item">
                      <div class="el-form-item-div">
                          <span style="width: 164px;padding:10px 0px 10px 30px;flex: none;">${litem.name}:</span>
                          <span style="width: 284px;flex: none;color:#20a0ff;"><a href="${litem.ReturnValue}" style="color:#20a0ff;" target="view_window">${litem.value}</a></span>
                      </div>
                  </div>`;
      } else if (litem.name == "颜色") {
        lhtml += `<div class="el-form-item">
                      <div class="el-form-item-div">
                          <span style="width: 164px;padding:10px 0px 10px 30px;flex: none;">${litem.name}:</span>
                          <span style="width: 284px;flex: none;">${litem.ReturnValue ? `<a href="${litem.ReturnValue}"} style="color:#20a0ff;" target="view_window">${litem.value}</a>` : `<span>${litem.value}</span>`}</span>
                      </div>
                  </div>`;
      } else if (litem.name == "面料") {
        lhtml += `<div class="el-form-item">
                      <div class="el-form-item-div">
                          <span style="width: 164px;padding:10px 0px 10px 30px;flex: none;">${litem.name}:</span>
                          <span style="width: 284px;flex: none;">${litem.ReturnValue ? `<a href="${litem.ReturnValue}"} style="color:#20a0ff;" target="view_window">${litem.value}</a>` : `<span>${litem.value}</span>`}</span>
                      </div>
                  </div>`;
      } else {
        lhtml += `<div class="el-form-item">
                    <div class="el-form-item-div">
                      <span style="width: 164px;padding:10px 0px 10px 30px;flex: none;">${litem.name}:</span>
                      <span style="width: 284px;flex: none;">${litem.value}</span>
                    </div>
                  </div>`
      }
    })
    layerModal = layer.open({
      type: 1,
      title: '物料详情',
      offset: '100px',
      area: '550px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: '.layui-layer-title',
      content: `<form class="splitwo formModal formMateriel" id="inMaterial_modal" >
        <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
            ${lhtml}
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
        </div>
    </form>`
    })
  })

  //关闭modal
  $('body').on('click', '.formMateriel .submit:not(is-disabled)', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
  })

  //图片放大
  $('body').on('click', '.pic-img', function () {
    var imgList, current;
    if ($(this).hasClass('pic-list-img')) {
      imgList = $(this).parents('ul').find('.pic-li');
      current = $(this).parents('.pic-li').attr('data-id');
    } else {
      imgList = $(this);
      current = $(this).attr('data-id');
    }
    showBigImg(imgList, current);
  });

  //点击搜索
  $('body').on('click', '.search', function () {
    var so = $('#sales_order_code').val().trim(),
      spo = $('#sales_order_project_code').val().trim();
    ajaxData = {
      sales_order_code: $('#sales_order_code').val().trim(),
      sales_order_project_code: $('#sales_order_project_code').val().trim(),
      work_number: work_number
    }
    if ($('#sales_order_code').val()) {
      $(".el-form-item.sales_order_code").find('.errorMessage').hide();
    } else {
      $(".el-form-item.sales_order_code").find('.errorMessage').show().html('请输入销售订单');
    }
    if ($('#sales_order_project_code').val()) {
      $(".el-form-item.sales_order_project_code").find('.errorMessage').hide();
    } else {
      $(".el-form-item.sales_order_project_code").find('.errorMessage').show().html('请输入销售订单行项');
    }
    if (so && spo) {
      getRouting();
    }
  })

  //显示附件modal
  $('body').on('click', '.view-attachment', function (e) {
    e.stopPropagation();
    var enclosure = $(this).attr('data-content');
    showAttachmentModal(enclosure);
  })

  //显示流转品上道工艺文件
  $('body').on('click', '.is-lzp', function (e) {
    e.stopPropagation();
    var item_no = $(this).attr('data-material-code');
    showPreviousProcessModal(item_no);
  })

  //显示替换物料
  $('body').on('click', '.replace_status', function (e) {
    e.stopPropagation();
    var item_no = $(this).attr('data-material');
    showReplaceMaterialModal(item_no);
  })

  //显示当前工单的最新工艺文件
  $('body').on('click', '#routing_table .new-version', function (e) {
    e.stopPropagation();
    var bom_id = $(this).attr('data-bom-id');
    getBomRouteLine(bom_id);
  })

  $('body').on('click', '.el-tap-wrap .el-tap', function () {
    opeartion_ids = [];
    if (!$(this).hasClass('active')) {
      $(this).addClass('active').siblings('.el-tap').removeClass('active');
      var rnid = $(this).attr('data-item');
      getRoutingInfoByRoutingId(rnid);
    }
  });

  $('body').on('click', '.chooseRouing', function (e) {
    e.stopPropagation();
    var bomid = $(this).attr('data-bom-id');
    var routeid = $(this).attr('data-id');
    showBomRouting(bomid, routeid)
  })
}