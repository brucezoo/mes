// var in_flag = 1, out_flag = 1, Lflag=false,id = 0, type = '', production_id = 0, sub_id = 0, scrollTop = 0, picking_id = 0, operation_order_code = '', routing_node_id, pageNoItem = 1, pageSizeItem = 50;
// $(function () {
//   id = getQueryString('id');
//   type = getQueryString('type');
  
//   if (type == 'add') {
//     getBusteOutsourceForm(id);
//     getOldBusteOutsourceForm(id);
//   }
//   $('#work_order_form').focus();
//   $('#start_time').val(getCurrentDateZore);
//   $('#end_time').val(getCurrentTime);
//   $('#start_time_input').text(getCurrentDateZore);
//   $('#end_time_input').text(getCurrentTime);
//   bindEvent();
// });

// function getOldBusteOutsourceForm(id) {
//   AjaxClient.get({
//     url: URLS['outsource'].getDeclareByPr + "?" + _token + "&id=" + id,
//     dataType: 'json',
//     beforeSend: function () {
//       // layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       // layer.close(layerLoading);
//       $('.dropdown-menu').html('');
//       rsp.results.forEach(function (item) {
//         var _li = `<li class="${item.status == 2 ? 'disabled' : ''} creatReturn" data-id="${item.id}" style="cursor: pointer;"><a>${item.code}</a></li>`
//         $('.dropdown-menu').append(_li);
//         $('.dropdown-menu').find('li:last-child').data("liData", item);
//       });
//     },
//     fail: function (rsp) {
//       // layer.close(layerLoading);
//       // LayerConfig('fail','获取历史报工单失败，请刷新重试')
//     }
//   }, this)
// }
// function getBusteOutsourceForm(id) {
//   AjaxClient.get({
//     url: URLS['outsource'].getFlowItems + "?" + _token + "&id=" + id,
//     dataType: 'json',
//     beforeSend: function () {
//       layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       layer.close(layerLoading);
//       $('#showText').text('');
//       $('#title_buste').text(rsp.results.TXZ01 + "报工");
//       if(rsp.results.obj_list_row.length>1){
//         $('#showText').text('当前报工包含多个工单！')
//       }
//       picking_id = rsp.results.picking_id;
//       if(rsp.results.obj_list_row.length>1){
//         Lflag=true;
//       }
//       getWorkcenter(rsp.results.obj_list_row[0].work_center_id);
//       showMaterials(rsp.results.obj_list_row);
//       // showInItem(rsp.results.in_list);
//       // showOutItem(rsp.results.out_list);
//     },
//     fail: function (rsp) {
//       layer.close(layerLoading);
//       LayerConfig('fail', '获取报工单详情失败，请刷新重试')
//     }
//   }, this)
// }

// function getWorkcenter(id) {
//   AjaxClient.get({
//     url: URLS['outsource'].workcenter + "?" + _token + "&workcenter_id=" + id,
//     dataType: 'json',
//     success: function (rsp) {
//       var workCenterHtml = ''
//       rsp.results.forEach(function (item) {
//         if (item.code == 'ZPP001' || item.code == 'ZPP002') {
//         } else {
//           workCenterHtml += `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
//         }
//       });
//       $('#show_workcenter').html(workCenterHtml);
//       $('#show_workcenter').show();
//     },
//     fail: function (rsp) {
//       console.log('获取工作中心作业量失败！');
//     }
//   });
// }

// //显示进出料
// function showMaterials(data) {
//   var _thtml = '';
//   // console.log(data)
//   data.forEach(function (ditem) {
//     var in_material = '', out_material = '';
//     ditem['in_list'].forEach(function (item, index) {
//       if (item.material_code.substring(0, 4) == '3002') {
//         in_material += `
//         <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
//         <td>${tansferNull(item.material_code)}</td>
//         <td>${tansferNull(item.material_name)}</td>
//         <td class="qty">${tansferNull(item.rated)}</td>
//         <td class="expend">${tansferNull(item.expend)}</td>
//         <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
        
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//         <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe deal"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe_difference deal"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
//         <td style="padding: 3px;">
//             <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
//             <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
//         </td>
//         <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//         </tr>`;
//         ele.append(tr);
//         ele.find('tr:last-child').data("trData", data);

//         $('#depot' + in_flag).autocomplete({
//           url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//           param: 'depot_name',
//           showCode: 'depot_name'
//         });
//         in_flag++;
//       } else {
//         in_material += `
//         <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
//         <td>${tansferNull(item.material_code)}</td>
//         <td>${tansferNull(item.material_name)}</td>
//         <td class="qty">${tansferNull(item.rated)}</td>
//         <td class="expend">${tansferNull(item.expend)}</td>
//         <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
        
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//         <!--<td  class="firm" style="padding: 3px;"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"></td>-->
//         <td style="padding: 3px;">
//             <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
//             <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
//         </td>
//         <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//         </tr>`;
//         // ele.append(tr);
//         // ele.find('tr:last-child').data("trData", data);

//         $('#depot' + in_flag).autocomplete({
//           url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//           param: 'depot_name',
//           showCode: 'depot_name'
//         });
//         in_flag++;
//       }
//     })
//     ditem['out_list'].forEach(function (item, index) {
//       if (item.material_code.substring(0, 4) == '3002') {
//         out_material += `
//         <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
//         <td>${tansferNull(item.material_code)}</td>
//         <td style="width:300px;">${tansferNull(item.material_name)}</td>
//         <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
//         <td class="qty">${tansferNull(item.rated)}</td>
//         <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//         <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
//         <td  class="firm" style="padding: 3px;">
//             <div class="el-select-dropdown-wrap">
//                 <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
//             </div>
//         </td>
//         <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//         </tr>`;
//         if (item.depot_name) {
//           $('#line_depot' + out_flag).val(item.depot_name + '（' + item.line_depot_code + '）').data('inputItem', { id: item.line_depot_id, depot_name: item.depot_name, code: item.line_depot_code }).blur();
//         }
//         $('#line_depot' + out_flag).autocomplete({
//           url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//           param: 'depot_name',
//           showCode: 'depot_name'
//         });
//         out_flag++;
//       } else {
//         out_material += `
//         <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
//         <td>${tansferNull(item.material_code)}</td>
//         <td style="width:300px;">${tansferNull(item.material_name)}</td>
//         <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
//         <td class="qty">${tansferNull(item.rated)}</td>
//         <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//         <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//         <!--<td  class="firm" style="padding: 3px;"></td>-->
//         <!--<td  class="firm" style="padding: 3px;"></td>-->
//         <td  class="firm" style="padding: 3px;">
//             <div class="el-select-dropdown-wrap">
//                 <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
//             </div>
//         </td>
//         <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//         </tr>`;
//         if (item.depot_name) {
//           $('#line_depot' + out_flag).val(item.depot_name + '（' + item.line_depot_code + '）').data('inputItem', { id: item.line_depot_id, depot_name: item.depot_name, code: item.line_depot_code }).blur();
//         }
//         $('#line_depot' + out_flag).autocomplete({
//           url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//           param: 'depot_name',
//           showCode: 'depot_name'
//         });
//         out_flag++;
//       }
//     })
//     _thtml += `<div class="show_material" style="border: solid 1px #d1dbe5;padding:5px;">
//                 <input type="hidden" class="production_id" value=${ditem.production_id} />
//                 <input type="hidden" class="routing_node_id" value=${ditem.routing_node_id} />
//                 <input type="hidden" class="operation_order_code" value=${ditem.operation_order_code} />
//                 <input type="hidden" class="sub_id" value=${ditem.sub_id} />
//               <div>
//                 <span class="el-checkbox_input el-checkbox_item is-checked" data-content='${JSON.stringify(ditem)}'>
//                   <span class="el-checkbox-outset"></span>
//                   <span class="el-checkbox__label">选择当前进出料</span>
//                 </span>
//               </div>
//               <div>
//                 <h3>消耗品</h3>
//                 <table class="show_in_material">
//                   <thead>
//                     <tr>
//                       <th>物料编码</th>
//                       <th>物料名称</th>
//                       <th>数量</th>
//                       <th>计算数量</th>
//                       <th>单位</th>
//                       <th>消耗数量</th>
//                       <th>组件差异数量</th>
//                       <th>差异原因</th>
//                       <th></th>
//                     </tr>
//                   </thead>
//                   <tbody class="table_tbody">
//                     ${in_material}
//                   </tbody>
//                 </table>
//               </div>
//               <div>
//                 <h3>产成品</h3>
//                 <table class="show_out_material">
//                   <thead>
//                     <tr>
//                       <th>物料编码</th>
//                       <th>物料名称</th>
//                       <th>数量</th>
//                       <th>单位</th>
//                       <th>实报数量</th>
//                       <th class="center">库存地</th>
//                       <th></th>
//                     </tr>
//                   </thead>
//                   <tbody class="table_tbody">
//                     ${out_material}
//                   </tbody>
//                 </table>
//               </div>
//             </div>`
//   });
//   $("#show_material").html(_thtml);
// }

// function bindEvent() {
//   $("body").on('blur', '.consume_num', function (e) {
//     e.stopPropagation();
//     $(this).parent().parent().find('.difference_num').val($(this).val() - $(this).parent().parent().find('.qty').text());

//   });
//   $('body').on('click', '.submit', function (e) {
//     e.stopPropagation();
//     if (type == 'add') {
//       var addFlag=false;
//       $('#show_material .show_material').each(function (key, value) {
//         if($(value).find('.el-checkbox_item').hasClass('is-checked')){
//           addFlag=true;
//         }
//       })
//       if(addFlag){
//         addBuste();
//       }else{
//         LayerConfig('fail', '请先选择保存到进出料！');
//       }
//     }
//   });
//   $(window).scroll(function () {
//     scrollTop = $(document).scrollTop();
//     $('.line_depot,.depot').each(function (k, v) {
//       var that = $(v);
//       var width = $(v).width();
//       var offset = $(v).offset();
//       $(v).siblings('.el-select-dropdown').width(width * 3).css({ top: offset.top + 33 - scrollTop, left: offset.left })
//     })
//   });

//   $('body').on('click', '.creatReturn:not(.disabled)', function (e) {
//     e.stopPropagation();
//     var id = $(this).attr('data-id');
//     layer.confirm("确认推送?", {
//       icon: 3, title: '提示', offset: '250px', end: function () {
//       }
//     }, function (index) {
//       layer.close(index);
//       submint(id);
//     });
//   });

//   $('body').on('click', '.line_depot,.depot', function (e) {
//     e.stopPropagation();
//     var that = $(this);
//     var width = $(this).width();
//     var offset = $(this).offset();
//     $(this).siblings('.el-select-dropdown').width(width * 3).css({ top: offset.top + 33 - scrollTop, left: offset.left })
//   });
//   $('body').on('click', '.table_tbody .delete', function () {
//     var that = $(this);
//     layer.confirm('您将执行删除操作！?', {
//       icon: 3, title: '提示', offset: '250px', end: function () {
//       }
//     }, function (index) {
//       layer.close(index);
//       that.parents().parents().eq(0).remove();
//     });
//   });
//   $('#start_time').on('click', function (e) {
//     e.stopPropagation();
//     var that = $(this);
//     var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
//     start_time = laydate.render({
//       elem: '#start_time_input',
//       max: max,
//       format: 'yyyy-MM-dd HH:mm:ss',
//       type: 'time',
//       show: true,
//       closeStop: '#start_time',
//       done: function (value, date, endDate) {
//         that.val(value);
//       }
//     });
//   });
//   $('#end_time').on('click', function (e) {
//     e.stopPropagation();
//     var that = $(this);
//     var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
//     end_time = laydate.render({
//       elem: '#end_time_input',
//       min: min,
//       format: 'yyyy-MM-dd HH:mm:ss',
//       max: getCurrentDate(),
//       type: 'time',
//       show: true,
//       closeStop: '#end_time',
//       done: function (value, date, endDate) {
//         that.val(value);
//       }
//     });
//   });
//   $('body').on('click', '.el-checkbox_input_check', function () {
//     $(this).toggleClass('is-checked');
//   });

//   $('body').on('click', '.el-checkbox_input.el-checkbox_item', function () {
//     $(this).toggleClass('is-checked');
//   });
//   $('body').on('click', '.select', function (e) {
//     e.stopPropagation();
//     showCause($(this).attr('data-id'))
//   });
//   $('body').on('click', '#viewCause .cause_submit', function (e) {
//     e.stopPropagation();
//     layer.close(layerModal);
//     var material_id = $("#itemId").val();
//     var _ele = $("#material" + material_id);
//     _ele.html('');
//     $('#practice_table .table_tbody tr').each(function (item) {
//       if ($(this).find('.el-checkbox_input_check').hasClass('is-checked')) {
//         let itemc = $(this).data('trData');
//         _ele.append(`<span>
//                                 <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
//                             </span>`);
//         _ele.find('span:last-child').data("spanData", itemc);
//       }
//     })
//   });

//   //产成品实报数量失去焦点事件
//   $('body').on('keyup', '.show_out_material .consume_num.deal', function (e) {
//     var len = $(this).parent().parent().parent().find("tr").length;
//     var realNumber = Number($(this).val()).toFixed(3);
//     var planNumber = Number($(this).parent().parent().find('.qty').text()).toFixed(3);
//     if (len == 1) {
//       $(this).parent().parent().parent().parent().parent().parent().find(".show_in_material .table_tbody tr").each(function () {
//         var this_qty = Number($(this).find('.qty').text());
//         var newQty = ((realNumber / planNumber) * this_qty).toFixed(3);
//         $(this).find('.beath_qty.deal').val(newQty);
//         $(this).find('.consume_num.deal').val(newQty);
//         $(this).find('.difference_num.deal').val(0);
//       })
//     }
//   });
//   //产成品实报数量失去焦点事件
//   // $('body').on('keyup', '.show_out_material .consume_num.deal', function (e) {
//   //   var len = $(".show_out_material .table_tbody tr").length;
//   //   var realNumber = Number($(this).val()).toFixed(3);
//   //   var planNumber = Number($('#show_out_material .qty').text()).toFixed(3);

//   //   if (len == 1) {
//   //     $(".show_in_material .table_tbody tr").each(function () {
//   //       var this_qty = Number($(this).find('.qty').text());
//   //       var newQty = ((realNumber / planNumber) * this_qty).toFixed(3);
//   //       $(this).find('.consume_num.deal').val(newQty);
//   //       $(this).find('.difference_num.deal').val(newQty - this_qty);
//   //     })
//   //   }


//   // });

// }

// function showCause(id) {
//   var _ele = $("#material" + id), arr_couse = [];

//   _ele.find('span').each(function (item) {
//     arr_couse.push($(this).data('spanData'))
//   });
//   layerModal = layer.open({
//     type: 1,
//     title: '选择原因',
//     offset: '100px',
//     area: ['500px', '500px'],
//     shade: 0.1,
//     shadeClose: false,
//     resize: true,
//     content: `<form class="viewAttr formModal" id="viewCause">
//                     <input type="hidden" id="itemId" value="${id}">
//                     <div class="table_page">
//                         <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
//                             <table id="practice_table" class="sticky uniquetable commontable">
//                                 <thead>
//                                 <tr>
//                                     <th class="left nowrap tight">名称</th>
//                                     <th class="left nowrap tight">备注</th>
//                                     <th class="right nowrap tight">操作</th>
//                                 </tr>
//                                 </thead>
//                                 <tbody class="table_tbody"></tbody>
//                             </table>
//                         </div>
//                         <div id="pagenationItem" class="pagenation bottom-page"></div>
//                     </div>
//                     <div class="el-form-item">
//                     <div class="el-form-item-div btn-group">
//                         <button type="button" class="el-button cancle">取消</button>
//                         <button type="button" class="el-button el-button--primary cause_submit">确定</button>
//                     </div>
//                 </div>
//                 </form>`,
//     success: function (layero, index) {
//       getSpecialCauseData(arr_couse)
//     }
//   })
// }
// function bindPagenationClickItem(totalData, pageSize) {
//   $('#pagenationItem').show();
//   $('#pagenationItem').pagination({
//     totalData: totalData,
//     showData: pageSize,
//     current: pageNoItem,
//     isHide: true,
//     coping: true,
//     homePage: '首页',
//     endPage: '末页',
//     prevContent: '上页',
//     nextContent: '下页',
//     jump: true,
//     callback: function (api) {
//       pageNoItem = api.getCurrent();
//       getSpecialCauseData();
//     }
//   });
// }
// function getSpecialCauseData(arr_couse) {
//   $('#practice_table .table_tbody').html('');
//   var urlLeft = '';
//   urlLeft += "&page_no=" + pageNoItem + "&page_size=" + pageSizeItem;
//   AjaxClient.get({
//     url: URLS['outsource'].preselection + '?' + _token + urlLeft,
//     dataType: 'json',
//     beforeSend: function () {
//       layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       layer.close(layerLoading);
//       var totalData = rsp.paging.total_records;
//       if (rsp.results && rsp.results.length) {
//         createHtmlItem($('#practice_table .table_tbody'), rsp.results, arr_couse)
//       } else {
//         noData('暂无数据', 9)
//       }
//       if (totalData > pageSizeItem) {
//         bindPagenationClickItem(totalData, pageSizeItem);
//       } else {
//         $('#pagenationItem').html('');
//       }
//     },
//     fail: function (rsp) {
//       layer.close(layerLoading);
//       noData('获取列表失败，请刷新重试', 4);
//     }
//   })
// }
// function createHtmlItem(ele, data, arr_couse) {
//   data.forEach(function (item, index) {
//     if (arr_couse.length > 0) {
//       var index_arr = 0;
//       arr_couse.forEach(function (itemc, index) {
//         if (item.preselection_id == itemc.preselection_id) {
//           var tr = ` <tr>
//                     <td>${item.name}</td>
//                     <td>${item.description}</td>
//                     <td class="right">
//                         <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
// 		                    <span class="el-checkbox-outset"></span>
//                         </span>
//                     </td>
//                 </tr>`;
//           index_arr = index + 1;
//           ele.append(tr);
//           ele.find('tr:last-child').data("trData", item);
//         }
//       });
//       // console.log(arr_couse.length-1);
//       if (index_arr == 0) {
//         var tr = ` <tr>
//                     <td>${item.name}</td>
//                     <td>${item.description}</td>
//                     <td class="right">
//                         <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
// 		                    <span class="el-checkbox-outset"></span>
//                         </span>
//                     </td>
//                 </tr>`;
//         ele.append(tr);
//         ele.find('tr:last-child').data("trData", item);
//       }

//     } else {
//       var tr = ` <tr>
//                     <td>${item.name}</td>
//                     <td>${item.description}</td>
//                     <td class="right">
//                         <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
// 		                    <span class="el-checkbox-outset"></span>
//                         </span>
//                     </td>
//                 </tr>`;
//       ele.append(tr);
//       ele.find('tr:last-child').data("trData", item);
//     }

//   })
// }
// function submint(thisid) {
//   AjaxClient.get({
//     url: URLS['outsource'].submitBuste + "?" + _token + "&id=" + thisid,
//     dataType: 'json',
//     beforeSend: function () {
//       layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       layer.close(layerLoading);
//       if (rsp.results.RETURNCODE == 0) {
//         LayerConfig('success', '推送成功！');
//         getOldBusteOutsourceForm(id);
//       }
//     },
//     fail: function (rsp) {
//       layer.close(layerLoading);
//       LayerConfig('fail', rsp.message)
//     }
//   }, this)
// }
// function getCurrentDate() {
//   var curDate = new Date();
//   var _year = curDate.getFullYear(),
//     _month = curDate.getMonth() + 1,
//     _day = curDate.getDate();
//   return _year + '-' + _month + '-' + _day + ' 23:59:59';
// }
// function getCurrentDateZore() {
//   var curDate = new Date();
//   var _year = curDate.getFullYear(),
//     _month = curDate.getMonth() + 1,
//     _day = curDate.getDate();
//   return _year + '-' + _month + '-' + _day + ' 00:00:00';
// }
// function getCurrentTime() {
//   var curDate = new Date();
//   var _year = curDate.getFullYear(),
//     _month = curDate.getMonth() + 1,
//     _day = curDate.getDate(),
//     _h = curDate.getHours(),
//     _m = curDate.getMinutes(),
//     _s = curDate.getSeconds();
//   return _year + '-' + _month + '-' + _day + ' ' + _h + ':' + _m + ':' + _s;
// }

// //提交报工
// function addBuste() {
//   $('#show_material .show_material').each(function (key, value) {
//     var in_materials = [], out_materials = [];

//     if($(value).find('.el-checkbox_item').hasClass('is-checked')){
//       $(value).find('.show_in_material .table_tbody tr').each(function (k, v) {
//         var _ele = $(v).find('.MKPF_BKTXT'), arr_couse = [];
//         _ele.find('span').each(function (item) {
//           arr_couse.push($(this).data('spanData').preselection_id)
//         });
//         var str = arr_couse.join();
//         in_materials.push({
//           id: '',
//           material_id: $(v).attr('data-id'),
//           LGFSB: $(v).attr('data-LGFSB'),
//           LGPRO: $(v).attr('data-LGPRO'),
//           GMNGA: $(v).find('.consume_num').val(),
//           unit_id: $(v).find('.unit').attr('data-unit'),
//           material_spec: '',
//           qty: $(v).find('.qty').text(),
//           expend: $(v).find('.expend').text(),
//           line_depot_id: '',
//           line_depot_code: '',
//           // length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
//           // unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
//           // diff_for_robe:$(v).find('.length_for_robe_difference').val()?$(v).find('.length_for_robe_difference').val():'',
//           MKPF_BKTXT: str,
//           MSEG_ERFMG: $(v).find('.difference_num').val(),
//           is_spec_stock: '',
//         })
//       });
//       $(value).find('.show_out_material .table_tbody tr').each(function (k, v) {
//         var $itemPo = $(v).find('.line_depot');
//         var line_depot_id = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
//           $itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').id : '';
//         var line_depot_code = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
//           $itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').code : '';
//         out_materials.push({
//           id: '',
//           material_id: $(v).attr('data-id'),
//           LGFSB: $(v).attr('data-LGFSB'),
//           LGPRO: $(v).attr('data-LGPRO'),
//           line_depot_id: line_depot_id,
//           line_depot_code: line_depot_code,
//           GMNGA: $(v).find('.consume_num').val(),
//           unit_id: $(v).find('.unit').attr('data-unit'),
//           // length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
//           // lot:$(v).find('.batch_out').val()?$(v).find('.batch_out').val():'',
//           // unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
//           material_spec: '',
//           qty: $(v).find('.qty').text(),
//           MKPF_BKTXT: '',
//           MSEG_ERFMG: '',
//           is_spec_stock: '',
//         })
//       });
//       var workCenter = $('#show_workcenter .work_center_item');
//       var workCenterArr = [];
//       workCenter.each(function (k, v) {
//         workCenterArr.push({
//           id: '',
//           standard_item_id: $(v).attr('data-id'),
//           standard_item_code: $(v).attr('data-code'),
//           value: $(v).find('.workValue').val() ? $(v).find('.workValue').val() : '',
//         })
//       });
  
//       var production_id=$(value).find('.production_id').val();
//       var routing_node_id=$(value).find('.routing_node_id').val();
//       var operation_order_code=$(value).find('.operation_order_code').val();
//       var sub_id=$(value).find('.sub_id').val();
//       var data = {
//         production_id: production_id,
//         operation_order_code: operation_order_code,
//         routing_node_id: routing_node_id,
//         sub_id: sub_id,
//         start_time: $('#start_time').val(),
//         end_time: $('#end_time').val(),
//         picking_id: picking_id,
//         picking_line_id: id,
//         in_materials: JSON.stringify(in_materials),
//         out_materials: JSON.stringify(out_materials),
//         stands: JSON.stringify(workCenterArr),
//         _token: TOKEN
//       };
//       setInterval(sendBusteAjax(data),1000);
//     }
//   })  
// }

// function sendBusteAjax(data){
//   AjaxClient.post({
//     url: URLS['outsource'].WorkDeclareOrder,
//     data: data,
//     dataType: 'json',
//     beforeSend: function () {
//       layerLoading = LayerConfig('load');
//     },
//     success: function (rsp) {
//       layer.close(layerLoading);
//       $('.submit').hide();
//       getOldBusteOutsourceForm(id);
//       LayerConfig('success', '保存成功！');
//     },
//     fail: function (rsp) {
//       layer.close(layerLoading);
//       LayerConfig('fail', '保存失败！错误日志为：' + rsp.message);
//     }
//   }, this)
// }

// //出料
// function showOutItem(data) {
//   var ele = $('#show_out_material .table_tbody');
//   ele.html("");
//   data.forEach(function (item, index) {
//     if (item.material_code.substring(0, 4) == '3002') {
//       var tr = `
//             <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
//             <td>${tansferNull(item.material_code)}</td>
//             <td style="width:300px;">${tansferNull(item.material_name)}</td>
//             <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
//             <td class="qty">${tansferNull(item.rated)}</td>
//             <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//             <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
//             <td  class="firm" style="padding: 3px;">
//                 <div class="el-select-dropdown-wrap">
//                     <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
//                 </div>
//             </td>
//             <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//             </tr>`;
//       ele.append(tr);
//       ele.find('tr:last-child').data("trData", data);
//       if (item.depot_name) {
//         $('#line_depot' + out_flag).val(item.depot_name + '（' + item.line_depot_code + '）').data('inputItem', { id: item.line_depot_id, depot_name: item.depot_name, code: item.line_depot_code }).blur();
//       }
//       $('#line_depot' + out_flag).autocomplete({
//         url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//         param: 'depot_name',
//         showCode: 'depot_name'
//       });
//       out_flag++;
//     } else {
//       var tr = `
//             <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
//             <td>${tansferNull(item.material_code)}</td>
//             <td style="width:300px;">${tansferNull(item.material_name)}</td>
//             <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
//             <td class="qty">${tansferNull(item.rated)}</td>
//             <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//             <!--<td  class="firm" style="padding: 3px;"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"></td>-->
//             <td  class="firm" style="padding: 3px;">
//                 <div class="el-select-dropdown-wrap">
//                     <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
//                 </div>
//             </td>
//             <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//             </tr>`;
//       ele.append(tr);
//       ele.find('tr:last-child').data("trData", data);
//       if (item.depot_name) {
//         $('#line_depot' + out_flag).val(item.depot_name + '（' + item.line_depot_code + '）').data('inputItem', { id: item.line_depot_id, depot_name: item.depot_name, code: item.line_depot_code }).blur();
//       }
//       $('#line_depot' + out_flag).autocomplete({
//         url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//         param: 'depot_name',
//         showCode: 'depot_name'
//       });
//       out_flag++;
//     }


//   })
// }

// //进料
// function showInItem(data) {
//   var ele = $('#show_in_material .table_tbody');
//   ele.html("");
//   data.forEach(function (item, index) {
//     if (item.material_code.substring(0, 4) == '3002') {
//       var tr = `
//             <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
//             <td>${tansferNull(item.material_code)}</td>
//             <td>${tansferNull(item.material_name)}</td>
//             <td class="qty">${tansferNull(item.rated)}</td>
//             <td class="expend">${tansferNull(item.expend)}</td>
//             <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//             <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe deal"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe_difference deal"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
//             <td style="padding: 3px;">
//                 <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
//                 <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
//             </td>
//             <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//             </tr>`;
//       ele.append(tr);
//       ele.find('tr:last-child').data("trData", data);

//       $('#depot' + in_flag).autocomplete({
//         url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//         param: 'depot_name',
//         showCode: 'depot_name'
//       });
//       in_flag++;
//     } else {
//       var tr = `
//             <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
//             <td>${tansferNull(item.material_code)}</td>
//             <td>${tansferNull(item.material_name)}</td>
//             <td class="qty">${tansferNull(item.rated)}</td>
//             <td class="expend">${tansferNull(item.expend)}</td>
//             <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            
//             <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
//             <!--<td  class="firm" style="padding: 3px;"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"></td>-->
//             <!--<td  class="firm" style="padding: 3px;"></td>-->
//             <td style="padding: 3px;">
//                 <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
//                 <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
//             </td>
//             <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
//             </tr>`;
//       ele.append(tr);
//       ele.find('tr:last-child').data("trData", data);

//       $('#depot' + in_flag).autocomplete({
//         url: URLS['outsource'].storageSelete + "?" + _token + "&is_line_depot=1",
//         param: 'depot_name',
//         showCode: 'depot_name'
//       });
//       in_flag++;
//     }
//   })
// }

var in_flag=1,out_flag=1,id=0,type='',production_id=0,sub_id=0,scrollTop=0,picking_id=0,operation_order_code='',work_center_id,routing_node_id,pageNoItem=1,pageSizeItem=50,supplier_storage='';
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    if(type=='add'){
        getBusteOutsourceForm(id);
        getOldBusteOutsourceForm(id);
    }
    $('#work_order_form').focus();
    $('#start_time').val(getCurrentDateZore);
    $('#end_time').val(getCurrentTime);
    $('#start_time_input').text(getCurrentDateZore);
    $('#end_time_input').text(getCurrentTime);
    bindEvent();
});

function getOldBusteOutsourceForm(id) {
    AjaxClient.get({
        url: URLS['outsource'].getDeclareByPr+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            // layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            // layer.close(layerLoading);
            $('.dropdown-menu').html('');
            rsp.results.forEach(function (item) {
                var _li = `<li class="${item.status==2?'disabled':''} creatReturn" data-id="${item.id}" style="cursor: pointer;"><a>${item.code}</a></li>`
                $('.dropdown-menu').append(_li);
                $('.dropdown-menu').find('li:last-child').data("liData", item);
            });
        },
        fail: function (rsp) {
            // layer.close(layerLoading);
            // LayerConfig('fail','获取历史报工单失败，请刷新重试')
        }
    }, this)
}

function getBusteOutsourceForm(id) {
    AjaxClient.get({
		url: '/OutWork/getOutWorkInfo'+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#title_buste').text(rsp.results.TXZ01+"报工");
            production_id = rsp.results.production_id;
            routing_node_id = rsp.results.routing_node_id;
            operation_order_code = rsp.results.operation_order_code;
            sub_id = rsp.results.sub_id;
            work_center_id=rsp.results.work_center_id;
            picking_id = rsp.results.picking_id;
            getWorkcenter(rsp.results.work_center_id);
            showInItem(rsp.results.in_list);
			showOutItem(rsp.results.out_list, rsp.results.declare_qty);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}

function getWorkcenter(id) {
    AjaxClient.get({
        url: URLS['outsource'].workcenter+"?"+_token+"&workcenter_id="+id,
        dataType: 'json',
        success:function (rsp) {
            var workCenterHtml=''
            rsp.results.forEach(function (item) {
                if(item.code =='ZPP001' || item.code=='ZPP002'){
                }else {
                    workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                }            });
            $('#show_workcenter').html(workCenterHtml);
            $('#show_workcenter').show();
        },
        fail: function(rsp){
            console.log('获取工作中心作业量失败！');
        }
    });
}
function bindEvent() {
    $("body").on('blur','.consume_num',function (e) {
        e.stopPropagation();
        $(this).parent().parent().find('.difference_num').val($(this).val()-$(this).parent().parent().find('.qty').text());

    });
    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        if(type=='add'){
            addBuste();
        }
    });
    $(window).scroll(function() {
        scrollTop = $(document).scrollTop();
        $('.line_depot,.depot').each(function (k,v) {
            var that = $(v);
            var width=$(v).width();
            var offset=$(v).offset();
            $(v).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
        })
    });

    $('body').on('click','.creatReturn:not(.disabled)',function (e) {
        e.stopPropagation();
        var id  = $(this).attr('data-id')
        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id);
        });

    });

    $('body').on('click','.line_depot,.depot',function (e) {
        e.stopPropagation();
        var that = $(this);
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
    });
    $('body').on('click','.table_tbody .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            format:'yyyy-MM-dd HH:mm:ss',
            type: 'time',
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
            format:'yyyy-MM-dd HH:mm:ss',
            max: getCurrentDate(),
            type: 'time',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
    });
    $('body').on('click','.select',function(e){
        e.stopPropagation();
        showCause($(this).attr('data-id'))
    });
    $('body').on('click','#viewCause .cause_submit',function(e){
        e.stopPropagation();
        layer.close(layerModal);
        var material_id = $("#itemId").val();
        var _ele = $("#material"+material_id);
        _ele.html('');
        $('#practice_table .table_tbody tr').each(function (item) {
            if($(this).find('.el-checkbox_input_check').hasClass('is-checked')){
                let itemc = $(this).data('trData');
                _ele.append(`<span>
                                <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
                            </span>`);
                _ele.find('span:last-child').data("spanData",itemc);
            }
        })
    });

    //产成品实报数量失去焦点事件
    $('body').on('keyup','#show_out_material .consume_num.deal',function (e) {
        var len = $("#show_out_material .table_tbody tr").length;
        var realNumber = Number($(this).val()).toFixed(3);
        var planNumber = Number($(this).parent().parent().find('.qty').text()).toFixed(3);
        if(len>=1){
            $("#show_in_material .table_tbody tr").each(function () {
                var this_qty = Number($(this).find('.qty').text());
                var newQty = ((realNumber/planNumber)*this_qty).toFixed(3);
                $(this).find('.consume_num.deal').val(newQty);
                $(this).find('.difference_num.deal').val(newQty-this_qty);
            })
        }
    });
}

function showCause(id) {
    var _ele = $("#material"+id),arr_couse = [];

    _ele.find('span').each(function (item) {
        arr_couse.push($(this).data('spanData'))
    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '500px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause">
                    <input type="hidden" id="itemId" value="${id}">
                    <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table id="practice_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">名称</th>
                                    <th class="left nowrap tight">备注</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody"></tbody>
                            </table>
                        </div>
                        <div id="pagenationItem" class="pagenation bottom-page"></div>
                    </div>
                    <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary cause_submit">确定</button>
                    </div>
                </div>
                </form>`,
        success: function (layero, index) {
            getSpecialCauseData(arr_couse)
        }
    })
}
function bindPagenationClickItem(totalData,pageSize){
    $('#pagenationItem').show();
    $('#pagenationItem').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNoItem,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNoItem=api.getCurrent();
            getSpecialCauseData();
        }
    });
}
function getSpecialCauseData(arr_couse){
    $('#practice_table .table_tbody').html('');
    var urlLeft='';

    urlLeft+="&page_no="+pageNoItem+"&page_size="+pageSizeItem;
    AjaxClient.get({
        url: URLS['outsource'].preselection+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtmlItem($('#practice_table .table_tbody'),rsp.results,arr_couse)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSizeItem){
                bindPagenationClickItem(totalData,pageSizeItem);
            }else{
                $('#pagenationItem').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    })
}
function createHtmlItem(ele,data,arr_couse) {
    data.forEach(function (item,index) {
        if(arr_couse.length>0){
            var index_arr = 0;
            arr_couse.forEach(function (itemc,index) {
                if(item.preselection_id==itemc.preselection_id){
                    var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                    index_arr = index+1;
                    ele.append(tr);
                    ele.find('tr:last-child').data("trData",item);
                }
            });
            // console.log(arr_couse.length-1);
            if(index_arr==0){
                var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        }else {
            var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        }

    })
}
function submint(thisid) {
    AjaxClient.get({
        url: URLS['outsource'].submitBuste +"?"+ _token + "&id=" + thisid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！');
                getOldBusteOutsourceForm(id);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
function getCurrentDateZore() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 00:00:00';
}
function getCurrentTime() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate(),
        _h = curDate.getHours(),
        _m = curDate.getMinutes(),
        _s = curDate.getSeconds();
    return _year + '-' + _month + '-' + _day +' ' + _h +':' + _m +':' + _s;
}


function addBuste() {
	var flag = true;
    var in_materials=[],out_materials=[];
    $('#show_in_material .table_tbody tr').each(function (k,v) {
        var _ele = $(v).find('.MKPF_BKTXT'),arr_couse = [];
        var inve_id=$(v).attr('data-inve-id'),depot_id=$(v).attr('data-depot-id');
        _ele.find('span').each(function (item) {
            arr_couse.push($(this).data('spanData').preselection_id)
        });
        var str = arr_couse.join();
        in_materials.push({
            id:'',
            inve_id:inve_id,
            depot_id:depot_id,
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:'',
            qty:$(v).find('.qty').text(),
            expend:$(v).find('.expend').text(),
            line_depot_id:'',
            line_depot_code:'',
            // length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
            // unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
            // diff_for_robe:$(v).find('.length_for_robe_difference').val()?$(v).find('.length_for_robe_difference').val():'',
            MKPF_BKTXT:str,
            MSEG_ERFMG:$(v).find('.difference_num').val(),
            is_spec_stock:'',
        })
	});
	
	var str = '';
    $('#show_out_material .table_tbody tr').each(function (k,v) {
	
		if (Number($(v).find('.consume_num').val()) + Number($(v).find('.qty').attr('data-id')) > Number($(v).find('.qty').text())) {	
			str += `${$(v).find('.m_code').text()} 报工超出：${(Number($(v).find('.consume_num').val()) + Number($(v).find('.qty').attr('data-id')) - Number($(v).find('.qty').text()))}</br>`;
		}
			var $itemPo = $(v).find('.line_depot');
			var line_depot_id = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
				$itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').id : '';
			var line_depot_code = $itemPo.data('inputItem') == undefined || $itemPo.data('inputItem') == '' ? '' :
				$itemPo.data('inputItem').depot_name == $itemPo.val().trim().replace(/\（.*?）/g, "") ? $itemPo.data('inputItem').code : '';
			out_materials.push({
				id: '',
				material_id: $(v).attr('data-id'),
				LGFSB: $(v).attr('data-LGFSB'),
				LGPRO: $(v).attr('data-LGPRO'),
				line_depot_id: line_depot_id,
				line_depot_code: line_depot_code,
				GMNGA: $(v).find('.consume_num').val(),
				unit_id: $(v).find('.unit').attr('data-unit'),
				// length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
				// lot:$(v).find('.batch_out').val()?$(v).find('.batch_out').val():'',
				// unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
				material_spec: '',
				qty: $(v).find('.qty').text(),
				MKPF_BKTXT: '',
				MSEG_ERFMG: '',
				is_spec_stock: '',
			})
    });
    var workCenter = $('#show_workcenter .work_center_item');
    var workCenterArr=[];
    workCenter.each(function (k,v) {
        workCenterArr.push({
            id:'',
            standard_item_id:$(v).attr('data-id'),
            standard_item_code:$(v).attr('data-code'),
            value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
        })
    });


    var data = {
        production_id:production_id,
        operation_order_code:operation_order_code,
        work_center_id:work_center_id,
        routing_node_id:routing_node_id,
        sub_id:sub_id,
        start_time: $('#start_time').val(),
        end_time: $('#end_time').val(),
        picking_id:picking_id,
        picking_line_id:id,
        in_materials:JSON.stringify(in_materials),
        out_materials:JSON.stringify(out_materials),
        stands:JSON.stringify(workCenterArr),
        _token:TOKEN
	};
	

	if(str != '') {
		layer.alert(str);
	} else {
		 AjaxClient.post({
			url: URLS['outsource'].WorkDeclareOrder,
			data:data,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				$('.submit').hide();
				getOldBusteOutsourceForm(id);
				LayerConfig('success','保存成功！');
			},
			fail: function (rsp) {
				layer.close(layerLoading);
				LayerConfig('fail','保存失败！错误日志为：'+rsp.message);

			}
		}, this)
	}
  
}

//出料
function showOutItem(data, qtys) {
    var ele = $('#show_out_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        if(item.material_code.substring(0,4)=='3002'){
            var tr = `
            <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
            <td class="m_code">${tansferNull(item.material_code)}</td>
            <td style="width:300px;">${tansferNull(item.material_name)}</td>
            <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
            <td class="qty" data-id="${item.declare_qty}">${tansferNull(item.rated)}</td>
            <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
            <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>-->
            <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
            <td  class="firm" style="padding: 3px;">
                <div class="el-select-dropdown-wrap">
                    <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
                </div>
            </td>
            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);
            if(item.depot_name){
                $('#line_depot'+out_flag).val(item.depot_name+'（'+item.line_depot_code+'）').data('inputItem',{id:item.line_depot_id,depot_name:item.depot_name,code:item.line_depot_code}).blur();
            }
            $('#line_depot'+out_flag).autocomplete({
                url: URLS['outsource'].storageSelete+"?"+_token,
                param:'depot_name',
                showCode:'depot_name'
            });
            out_flag++;
        }else {
            var tr = `
            <tr data-id="${item.material_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-line="${tansferNull(item.line_depot_id)}" data-line_code="${tansferNull(item.line_depot_code)}">
            <td class="m_code">${tansferNull(item.material_code)}</td>
            <td style="width:300px;">${tansferNull(item.material_name)}</td>
            <!--<td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>-->
            <td class="qty"  data-id="${item.declare_qty}">${tansferNull(item.rated)}</td>
            <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
            <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            <!--<td  class="firm" style="padding: 3px;"></td>-->
            <!--<td  class="firm" style="padding: 3px;"></td>-->
            <td  class="firm" style="padding: 3px;">
                <div class="el-select-dropdown-wrap">
                    <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${tansferNull(item.line_depot_id)}" value="${tansferNull(item.line_depot_code)}" style="line-height:20px;width: 100px;font-size: 10px;">
                </div>
            </td>
            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);
            if(item.depot_name){
                $('#line_depot'+out_flag).val(item.depot_name+'（'+item.line_depot_code+'）').data('inputItem',{id:item.line_depot_id,depot_name:item.depot_name,code:item.line_depot_code}).blur();
            }
            $('#line_depot'+out_flag).autocomplete({
                url: URLS['outsource'].storageSelete+"?"+_token,
                param:'depot_name',
                showCode:'depot_name'
            });
            out_flag++;
        }
    })
}



//进料
function showInItem(data) {
    var ele = $('#show_in_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        if(item.material_code.substring(0,4)=='3002'){
            var tr = `
            <tr data-id="${item.material_id}" data-inve-id="${item.inve_id}" data-depot-id="${item.depot_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
            <td>${tansferNull(item.material_code)}</td>
            <td>${tansferNull(item.material_name)}</td>
            <td class="qty">${tansferNull(item.rated)}</td>
            <td class="expend">${tansferNull(item.expend)}</td>
            <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
            <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            
            <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe deal"></td>-->
            <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\d.]/g,'')" class="length_for_robe_difference deal"></td>-->
            <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
            <td style="padding: 3px;">
                <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
            </td>
            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);

            $('#depot'+in_flag).autocomplete({
                url: URLS['outsource'].storageSelete+"?"+_token,
                param:'depot_name',
                showCode:'depot_name'
            });
            in_flag++;
        }else {
            var tr = `
            <tr data-id="${item.material_id}" data-inve-id="${item.inve_id}" data-depot-id="${item.depot_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
            <td>${tansferNull(item.material_code)}</td>
            <td>${tansferNull(item.material_name)}</td>
            <td class="qty">${tansferNull(item.rated)}</td>
            <td class="expend">${tansferNull(item.expend)}</td>
            <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
            <td  class="firm" style="padding: 3px;"><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${tansferNull(item.rated)}"  placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            
            <td  class="firm" style="padding: 3px;"><input type="number" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
            <!--<td  class="firm" style="padding: 3px;"></td>-->
            <!--<td  class="firm" style="padding: 3px;"></td>-->
            <!--<td  class="firm" style="padding: 3px;"></td>-->
            <td style="padding: 3px;">
                <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
            </td>
            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", data);

            $('#depot'+in_flag).autocomplete({
                url: URLS['outsource'].storageSelete+"?"+_token,
                param:'depot_name',
                showCode:'depot_name'
            });
            in_flag++;
        }
    })
}