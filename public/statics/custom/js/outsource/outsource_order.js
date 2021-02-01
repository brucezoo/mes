var layerModal,
    layerLoading,
    itemPageNo = 1,
    pageNo = 1,
    pageSize = 20,
    picking_id,
    code = 'ZY03',
    check_id,
    choose_arr = [],
    ajaxItemData = {},
    ajaxData = {},
    tableDataList = [];
$(function () {
    setAjaxData();
    resetParamItem();
    getOutsource();
    bindEvent();
});

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try {
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            delete ajaxData.picking_id;
            pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
            picking_id = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).picking_id;
        } catch (e) {
            resetParam();
        }
    } else {
        resetParam();
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
            getOutsource();
        }
    });
}

function bindItemPagenationClick(totalData, pageSize) {
    $('#item_pagenation').show();
    $('#item_pagenation').pagination({
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
            getOutsource();
        }
    });
}

//重置搜索参数
function resetParam() {
    $("#search_EBELN").val('');
    $("#search_EKGRP").val('');
    $("#search_BUKRS").val('');
    $("#search_LIFNR").val('');
	$("#search_VBELN").val('');
	$("#hx_code").val('');
    ajaxData = {
        EBELN: '',
        EKGRP: '',
        BUKRS: '',
        LIFNR: '',
        VBELN: '',
        is_delete: 0,
        declare_push_type:'',
        order: 'desc',
        sort: 'id',
        begintime: '',
        endtime: '',
		actual_send_qty: '',
		VBELP: ''
    };
}

//获取物料列表
function getOutsource() {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['outsource'].OutMachine + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            ajaxData.pageNo = pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                createHtml($('#outsource_table .table_tbody'), rsp.results);
                tableDataList = rsp.results;
            } else {
                noData('暂无数据', 17);
			}
			

			if (rsp.paging.total_records < 20) {
				$('#total_wp').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
			} else {
				$('#total_wp').css('display', 'none').text(' ');
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
            noData('获取物料列表失败，请刷新重试', 18);
        },
        complete: function () {
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    }, this);

}


//生成列表数据
function createHtml(ele, data) {
    ele.html('');

    data.forEach(function (item, index) {
        var opstr = '';
        if (item.lines.length > 0) {
            item.lines.forEach(function (oitem) {
                opstr += oitem.TXZ01 + ','
            })
        }

        let halfFinishedProduct = '';
        let halfFinishedProductCode = '';

        if (item.material_list.length) {
            item.material_list.forEach(function (materItem) {
                halfFinishedProduct += `<div><span>${materItem.name}</span></div>`;
                halfFinishedProductCode += `<div><span>${materItem.item_no}</span></div>`;
            })
        }

        var isChecked = choose_arr.includes(item.id.toString()) ? 'is-checked': '';

        var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td><span class="el-checkbox_input el-checkbox_checkEach ${isChecked}"  data-declare-type="${item.declareType}" data-id="${item.id}">
                    <span class="el-checkbox-outset"></span>
                </span></td>
                <td class="tritemClick" id="check_input${item.id}">${tansferNull(item.VBELN)}/${tansferNull(item.VBELP)}</td>
                <td class="tritemClick">${tansferNull(item.EBELN)}</td>
                <td class="tritemClick">${tansferNull(item.BSTYP)}</td>
                <td class="tritemClick">${tansferNull(item.BSART)}</td>
                <td class="tritemClick">${tansferNull(item.LIFNR)}</td>
                <td class="tritemClick">${tansferNull(item.LIFNR_name)}</td>
                <td class="tritemClick">${tansferNull(item.EKGRP)}</td>
                <td class="tritemClick" style="width: 100px;">${tansferNull(opstr)}</td>
                <td class="tritemClick">${tansferNull(item.reply_ZY03 == 0 ? '未发料' : '已发料')}</td>
                <td class="tritemClick">${tansferNull(item.replyz_ZY03_status == 0 ? '正常' : '缺料')}</td>
                <td class="tritemClick">${tansferNull(item.lzp_status == 1 ? '已领料' : '未领料')}</td>
                <td class="tritemClick">${tansferNull(item.declarePushType)}</td>
                <td class="tritemClick">${tansferNull(item.declareType)}</td>
                <td class="tritemClick">${tansferNull(item.declare_qty)}</td>
                <td class="tritemClick">${tansferNull(item.MENGE)}</td>
                <td class="tritemClick">${halfFinishedProductCode}</td>
                <td style="max-width: 220px; word-break: break-all;" class="tritemClick">${halfFinishedProduct}</td>
                <td class="tritemClick">${tansferNull(item.operation_end_time)}</td>
                <td class="right">
                    <div class="btn-group">
                        <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                        <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=5&type_code=ZY03">生成委外定额领料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=4&type_code=ZB03">生成委外补料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=3&type_code=ZY06">生成委外定额退料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=2&type_code=ZY05">生成委外超耗补料</a></li>
                            <li><a href="/Outsource/createOutsource?id=${item.id}&type=1&type_code=ZY04">生成委外超发退料</a></li>
                        </ul>
                    </div>
                    <a class="link_button" style="border: none;padding: 0;" href="/Outsource/viewOutsource?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                    ${item.is_delete==0?`<button data-id="${item.id}" data-delete = "1" class="button pop-button delete">关闭</button>`:''}
                    ${item.is_delete==1?`<button data-id="${item.id}" data-delete = "0" class="button pop-button delete">开启</button>`:''}
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });
    if (picking_id) {
        $("#check_input" + picking_id).click();
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
    $('body').on('click','.el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });

    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
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

  
//分拆工单modal
$('body').on('click', '.export', function () {
  layerModal = layer.open({
    type: 1,
    title: '导出条数范围',
    offset: '100px',
    area: '350px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: '.layui-layer-title',
    content: `<form class="splitwo formModal formMateriel" id="splitWO" >
        <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <span style="width: 134px;flex: none;">开始：<span class="mustItem">*</span></span>
                    <input type="number" min="1" step="1" id="startNum" class="el-input splitNum" value="" >
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <span style="width: 134px;flex: none;">结束：<span class="mustItem">*</span></span>
                    <input type="number" min="1" step="1" id="endNum" class="el-input splitNum" value="" >
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div" style="margin-top: 10px;">
                <span style="flex: none;">*注：请输入500范围内的数据</span>
                <div style="flex:1;"></div>
                <button type="button" class="el-button el-button--primary select-range"><a id="exportExcel">确定</a></button>
            </div>
        </div>   
    </form>`})
})

    //导出委外订单
  $('body').on('click', '.el-form-item-div .select-range', function (e) {
    e.stopPropagation();
    var urlLeft = '',
        parentForm = $('#searchForm'),
        startCorrect=true,endCorrect=true;
    if(!$('#startNum').val()){
      startCorrect=false;
      $('#startNum').parent().parent().find(".errorMessage").html("*请输入开始数量")
    }else{
      startCorrect=true;
      $('#startNum').parent().parent().find(".errorMessage").html("")
    }
    if(!$('#endNum').val()){
      endCorrect=false;
      $('#endNum').parent().parent().find(".errorMessage").html("*请输入结束数量")
    }else{
      endCorrect=true;
      $('#endNum').parent().parent().find(".errorMessage").html("")
    }
    if(startCorrect&&endCorrect){
      ajaxData = {
        EBELN: encodeURIComponent(parentForm.find('#search_EBELN').val().trim()),
        EKGRP: encodeURIComponent(parentForm.find('#search_EKGRP').val().trim()),
        BUKRS: encodeURIComponent(parentForm.find('#search_BUKRS').val().trim()),
        LIFNR: encodeURIComponent(parentForm.find('#search_LIFNR').val().trim()),
		VBELN: encodeURIComponent(parentForm.find('#search_VBELN').val().trim()),
		VBELP: encodeURIComponent(parentForm.find('#hx_code').val().trim()),
        is_delete: encodeURIComponent(parentForm.find('#closeStatus').val().trim()),
        declare_push_type: encodeURIComponent(parentForm.find('#auditStatus').val().trim()),
        order: 'desc',
        sort: 'id',
        start:encodeURIComponent($('#startNum').val().trim()),
        end:encodeURIComponent($('#endNum').val().trim()),
        begintime: encodeURIComponent(parentForm.find('#start_time').val()),
        endtime: encodeURIComponent(parentForm.find('#end_time').val()),
        actual_send_qty: encodeURIComponent(parentForm.find('#actual_send_qty').val())
      };

      for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
      }
      let url = URLS['outsource'].outsourceOrderExportExcel+'?' +_token+ urlLeft;
      $('#exportExcel').attr('href', url)
      layer.close(layerModal);
    }
  });

    $('body').on('click', '.el-tap-wrap .el-item-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-item-tap').removeClass('active');
            code = $(this).attr('data-code');
            ajaxItemData = {
                type_code: code,
                picking_id: picking_id
            };
            if (picking_id == undefined) {
                layer.confirm('请选择一个委外单！?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                    }
                }, function (index) {
                    layer.close(index);
                });
            } else {
                getPickingList();

            }

        }
    });
    $('body').on('click', '.tritemClick', function () {
        $(this).parent().parent().find('.tritem').each(function (k, v) {
            $(v).removeClass('tritemCheck');
        });
        $(this).parent().addClass('tritemCheck');
        picking_id = $(this).parent().attr('data-id');
        $("#add_check_checkbox").val(picking_id);
        ajaxItemData = {
            type_code: code,
            picking_id: picking_id
        };
        if (picking_id == undefined) {
            layer.confirm('请选择一个委外单！?', {
                icon: 3, title: '提示', offset: '250px', end: function () {
                }
            }, function (index) {
                layer.close(index);
            });
        } else {
            getPickingList();

        }

    });
    $('body').on('click', '.el-checkbox_checkEach', function () {
        $(this).toggleClass('is-checked');
        var id = $(this).attr('data-id');
        if ($(this).hasClass('is-checked')) {
            if (choose_arr.indexOf(id) == -1) {
                choose_arr.push(id);
            }
        } else {
            var index = choose_arr.indexOf(id);
            choose_arr.splice(index, 1);
        }
    });
    $('body').on('click', '.el-checkbox_checkAll', function () {
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            $('.el-checkbox_checkEach').each(function (k, v) {
                if (!$(this).hasClass('is-checked')) {
                    var id = $(this).attr("data-id");
                    $(this).addClass('is-checked');
                    if (choose_arr.indexOf(id) == -1) {
                        choose_arr.push(id);
                    }
                }
            })
        } else {
            $('.el-checkbox_checkEach').each(function (k, v) {
                $(this).removeClass('is-checked');
                var id = $(this).attr("data-id");
                var index = choose_arr.indexOf(id);
                if (index != -1) {
                    choose_arr.splice(index, 1);
                }
            })
        }
    });
    $('body').on('click', '#audit', function (e) {
      e.stopPropagation();
      var flag=judgeDeclare();      
      if(flag){
        if (choose_arr.length > 0) {
          if (canRedirectLink()) {
              AjaxClient.get({
                  url: '/OutWork/checkOutwork' + "?" + _token + "&ids=" + choose_arr + "&type=2" ,
                  dataType: 'json',
                  async: false,
                  success: function (rsp) {
                      // $(this).attr('href', '/Outsource/outsourceAllItems?ids=' + choose_arr + "&type_code=" + type);
                      window.location.href=('href', '/Outsource/outsourceMergeBusteIndex?ids='+choose_arr);
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
              // window.location.href=('href', '/Outsource/outsourceMergeBusteIndex?ids='+choose_arr);
          }
        } else {
            LayerConfig('fail', '请至少选择一个采购订单！');
        }
      }else{
        layer.msg('请选择未全部报存的订单合并报工',{ icon: 5, offset: '250px', time: 1500 });
      }
  })
    $('body').on('click', '#combine', function (e) {
        e.stopPropagation();
        if (choose_arr.length > 0) {
            if (canRedirectLink()) {
                checkAlreadyPicking(choose_arr);
            }
        } else {
            LayerConfig('fail', '请至少选着一个采购订单！');
        }
    })
    $('body').on('click', '#combineShop', function (e) {
        e.stopPropagation();
        if (choose_arr.length > 0) {
            if (canRedirectLink()) {
                window.location.href = '/Outsource/outsourceShopAllItems?ids=' + choose_arr;
            }
        } else {
            LayerConfig('fail', '请至少选着一个采购订单！');
        }
    });

    $('body').on('click', '.item_submit', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行推送操作！', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            submint(id);
        });

    });

    $('body').on('click', '.delete', function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var is_delete = $(this).attr('data-delete');
        var msg = is_delete==0?'开启':'关闭'
        layer.confirm(`您将执行${msg}操作！`, {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            layer.close(index);
            deleteClose(id,is_delete);
        });

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
                EBELN: encodeURIComponent(parentForm.find('#search_EBELN').val().trim()),
                EKGRP: encodeURIComponent(parentForm.find('#search_EKGRP').val().trim()),
                BUKRS: encodeURIComponent(parentForm.find('#search_BUKRS').val().trim()),
                LIFNR: encodeURIComponent(parentForm.find('#search_LIFNR').val().trim()),
				VBELN: encodeURIComponent(parentForm.find('#search_VBELN').val().trim()),
				VBELP: encodeURIComponent(parentForm.find('#hx_code').val().trim()),
                is_delete: encodeURIComponent(parentForm.find('#closeStatus').val().trim()),
                declare_push_type: encodeURIComponent(parentForm.find('#auditStatus').val().trim()),
                begintime: encodeURIComponent(parentForm.find('#start_time').val()),
                endtime: encodeURIComponent(parentForm.find('#end_time').val()),
                actual_send_qty: encodeURIComponent(parentForm.find('#actual_send_qty').val())
              };

            // 默认传0
            if ([null, undefined, ''].includes(ajaxData['is_delete'])) ajaxData['is_delete'] = 0;

            pageNo = 1;
            getOutsource();
        }
    });
    //重置搜索框值
    $('body').on('click', '#searchForm .reset', function (e) {
        e.stopPropagation();
        var parentForm = $('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#closeStatus').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#auditStatus').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        parentForm.find('#actual_send_qty').val('');
        resetParam();
        getOutsource();
    });

    // 委外合并补料
    $('body').on('click', '.out-combine', function (e) {
        e.stopPropagation();

        if (choose_arr.length > 0) {
            if (canRedirectLink()) {
                redirectAllItems(choose_arr, $(this).data('code'));
            }
        } else {
            LayerConfig('fail', '请至少选着一个采购订单！');
        }
    })

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
}

function judgeDeclare(){
  var flag=true;
  $('.el-checkbox_checkEach').each(function (k, v) {
    if($(v).hasClass('is-checked')){
      if($(v).attr('data-declare-type')=='已全部报存'){
        console.log($(v).attr('data-declare-type'));
        flag=false;
        return flag;
      }
    }
  })
  return flag;
}
function checkAlreadyPicking(choose_arr) {
    AjaxClient.get({
        url: URLS['outsource'].checkAlreadyPicking + "?" + _token + "&ids=" + choose_arr,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.length>0){
                var msg = "已领料的采购凭证编号："+rsp.results.join(",");
                layer.confirm(msg, {
                        icon: 3,
                        btn: ['是','否'],
                        closeBtn: 0,
                        title: "是否重复领料",
                        offset: '250px'
                    },function(index){
                        layer.close(index);
                        window.location.href = '/Outsource/outsourceAllItems?ids=' + choose_arr + "&type_code=ZY03";
                    },function(index){
                        layer.close(index);
                    })
            }else {
                window.location.href = '/Outsource/outsourceAllItems?ids=' + choose_arr + "&type_code=ZY03";

            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this)
}

//获取粗排列表
function getPickingList() {
    var urlLeft = '';
    for (var param in ajaxItemData) {
        urlLeft += `&${param}=${ajaxItemData[param]}`;
    }
    urlLeft += "&page_no=" + itemPageNo + "&page_size=" + pageSize;
    AjaxClient.get({
        url: URLS['outsource'].OutMachineZy + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo = pageNo;
            ajaxData.picking_id = picking_id;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData = rsp.paging.total_records;
            var _html = createItemHtml(rsp);
            $('.show_item_table_page').html(_html);
            if (totalData > pageSize) {
                bindItemPagenationClick(totalData, pageSize);
            } else {
                $('#item_pagenation.unpro').html('');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试', 9);
        }

    }, this)
}


//生成未排列表数据
function createItemHtml(data) {
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {

            trs += `
			<tr>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.type_code)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${item.groups.length?tansferNull(item.groups[0].LGFSB):''}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.time)}</td>
			<td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '执行中' : item.status == 3 ? '入库中' : '')}</td>
			<td class="right">
	         ${item.status == 1 ? `<button data-id="${item.id}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="/Outsource/editOutsource?id=${item.id}&type=${item.type_code}">查看</a>
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml = `<div class="wrap_table_div" style="height: 300px; overflow-y: auto; overflow-x: hidden;" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">发料地点</th>
                        <th class="left nowrap tight">员工</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>                   
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="item_pagenation" class="pagenation unpro"></div>`;
    return thtml;
}

//重置搜索参数
function resetParamItem() {
    ajaxItemData = {
        type_code: '',
        picking_id: '',
        begintime: '',
        endtime: '',
    };
}

function submint(id) {
    AjaxClient.get({
        url: URLS['outsource'].pushOutMachineZy + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.RETURNCODE == 0) {
                LayerConfig('success', '推送成功！');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', '推送失败！错误日志为：' + rsp.message);
        }
    }, this)
}
function deleteClose(id,is_delete) {
    var msg = is_delete==0?'开启':'关闭';
    AjaxClient.get({
        url: URLS['outsource'].destory + "?" + _token + "&id=" + id + '&is_delete=' + is_delete,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', `${msg}成功！`,function () {
                window.location.reload()
            });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', `${msg}失败！错误日志为：${rsp.message}`);
        }
    }, this)
}


// 跳转委外合并补料页面
function redirectAllItems(choose_arr, type) {
    window.location.href = '/Outsource/outsourceAllItems?ids=' + choose_arr + "&type_code=" + type;
}

// 如果is_delete有1的，不允许跳转
function canRedirectLink() {
    var choose_delete_arr = tableDataList.filter(function (item) {
        return choose_arr.includes(item.id.toString()) && item.is_delete;
    }).map(function (item) {
        return item.EBELN;
    });

    if (choose_delete_arr.length) {
        LayerConfig('fail', '采购凭证编号为：' + choose_delete_arr.join(',') + ' 的订单已关闭，请重新选择！');
    }

    return !choose_delete_arr.length;
}
