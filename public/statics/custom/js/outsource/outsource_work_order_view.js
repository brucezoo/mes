var outsourceId='',group_routing_package;
$(function(){
    outsourceId=getQueryString('id');
    getOutsourceItem(outsourceId);

    bindEvent();

});
function bindEvent() {
    $('body').on('click', '#attrview', function (e) {
        e.stopPropagation();
        viewWtModal();
    });
    // $('body').on('click', '#printWt', function (e) {
    //     $("#formPrintWt").print();
    // });
    $('body').off('click','.preview_draw_wrap img').on('click','.preview_draw_wrap img',function (e) {
        $(this).parents('.preview_draw_wrap').toggleClass('active').siblings('.preview_draw_wrap').removeClass('active');
        if($(this).parents('.preview_draw_wrap').hasClass('active')){
            var path=$(this).parents('.preview_draw_wrap').attr('data-url');
            var img =`<img src="/storage/${path}" alt=""/>`;
            $(this).parents('.route_preview_container').find('.img_expand_pre').addClass('active').html(img);
        }else{
            $(this).parents('.route_preview_container').find('.img_expand_pre').removeClass('active').html('');
        }
    })


    // 删除消耗品
    $('body').on('click', '.delete-ingroup', function (e) {
        e.stopPropagation();
        deleteIngroup($(this).parents('tr'));
    });

    // 添加消耗品
    $('body').on('click', '#show-add-ingroup',function (e) {
        e.stopPropagation();
        showAddIngroup();
    });

    // 添加消耗品 调接口
    $('body').on('click', '.add-group-btn',function (e) {
        e.stopPropagation();
        var $itemTr = $(this).parents('tr');

        addIngroup($itemTr);
    });

    $('body').on('click','#show-add-ingroup-table .el-checkbox-outset',function(){
        $(this).parent().toggleClass('is-checked');
    })
}

// 删除消耗品
function deleteIngroup($itemTr) {
    layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
        layer.close(index);

        AjaxClient.get({
            url: URLS['outsource'].deleteSubOrderInMaterial + '?' + _token + '&subcontract_order_item_id=' + $itemTr.data('id'),
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (rsp) {
                LayerConfig('success','删除成功！');
                $itemTr.remove();
            },
            fail: function (rsp) {
                LayerConfig('fail', rsp.message);
            }
        }, this)
    });
}

// 显示添加消耗品输入
function showAddIngroup() {
    var addItemTr = `<tr>
        <td><label>物料编码 <span style="color: red;">*</span></label><input type="text" class="el-input material_code" placeholder="请输入物料编码"></td>
        <td><label>数量 <span style="color: red;">*</span></label><input type="number" class="el-input qty" placeholder="请输入数量"></td>
        <td><label>单位 <span style="color: red;">*</span></label><input type="text" class="el-input commercial" placeholder="请输入单位"></td>
        <td><span class="el-checkbox_input el-checkbox_item special_stock"><label>特殊库存</label> <span class="el-checkbox-outset" style="top: 4px; left: 4px;"></span></span></td>
        <td><button type="button" class="el-button add-group-btn">插入</button></td>
    </tr>`;
    $('#show-add-ingroup-table').append($(addItemTr));
}

// 插入消耗品
function addIngroup($itemTr) {
    var material_code = $itemTr.find('.material_code').val().trim(),
        qty = $itemTr.find('.qty').val().trim(),
        commercial = $itemTr.find('.commercial').val().trim(),
        special_stock = $itemTr.find('.special_stock').hasClass('is-checked') ? 1 : 0;

    if (material_code == '' || qty == '' || commercial == '') {
        LayerConfig('fail', '请输入相关数据！');
        return;
    }

    // 不能是已存在的
    var currentCodes = $.map($('.ingroups_table .tritem'),function (item) {
        return $(item).attr('data-code');
    });

    if (currentCodes.includes(material_code)) {
        LayerConfig('fail', '该物料已存在！');
        return;
    }

    AjaxClient.get({
        url: URLS['outsource'].insertSubOrderInMaterial + `?${_token}&subcontract_order_id=${outsourceId}&material_code=${material_code}&qty=${qty}&commercial=${commercial}&special_stock=${special_stock}`,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (rsp) {
            LayerConfig('success','添加成功！');
            // 列表添加数据
            $itemTr.remove();

            var results = {};

            try {
                results = JSON.parse(rsp.results);
            } catch (e) {
                console.log(e);
            }

            var $ele = $('.ingroups_table .t-body');
            var tr=`
                <tr class="tritem" data-id="${results.id}" data-code="${material_code}">
                    <td>${tansferNull(results.material_name)}</td>
                    <td>${material_code}</td>
                    <td>${tansferNull(results.plan_qty)}</td>
                    <td>${tansferNull(results.bom_commercial)}</td>
                    <td><button type="button" class="button delete-ingroup">删除</button></td>
                </tr>
            `;
            $ele.append(tr);
            $ele.find('tr:last-child').data("trData", results);
        },
        fail: function (rsp) {
            LayerConfig('fail', rsp.message);
        }
    }, this)
}

function viewWtModal() {
    var wwidth = $(window).width() - 80,
        wheight = $(window).height() - 80,
        mwidth = wwidth + 'px',
        mheight = wheight + 'px';
    var lableWidth = 100;
    layerModal = layer.open({
        type: 1,
        title: '查看工艺',
        offset: '40px',
        area: [mwidth, mheight],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="viewAttr formModal" id="viewattr">
                    <div style="height: 40px;">
						<!--<button data-id="" type="button" class="button pop-button" id="printWt">打印工艺单</button>-->
					</div>
					<div id="formPrintWt"></div>
			</form>`,
        success: function (layero, index) {
            createPreview(group_routing_package);

        },
        end: function () {
            $('.out_material .item_out .table_tbody').html('');
        }

    })
}
function createPreview(data) {
    if(typeof data == 'string') {
        data = JSON.parse(data);
    }
    var stepBlocks = '', in_flag = '';
    var stepItems = '';
    var step_draw = '';
    data.forEach(function (sitem) {


        var s_draw = [], s_material_in = '', s_material_out = '';
        if (sitem.step_drawings && sitem.step_drawings.length) {
            sitem.step_drawings.forEach(function (sditem) {
                s_draw.push(sditem.image_name)
            })
        }
        if (sitem.material && sitem.material.length) {
            var material_in = getFilterPreviewData(sitem.material, 1),
                material_out = getFilterPreviewData(sitem.material, 2);
            if (material_in.length) {
                s_material_in = cpreviewAttr(material_in, 'in');
            } else {
                s_material_in = `<span class="no_material">无</span>`;
            }
            if (material_out.length) {
                s_material_out = cpreviewAttr(material_out, 'out');
            } else {
                s_material_out = `<span class="no_material">无</span>`;
            }
        } else {
            s_material_out = s_material_in = `<span class="no_material">无</span>`;
        }
        // 能力
        var name_desc = '', work_center = '';
        if (sitem.abilitys && sitem.abilitys.length) {
            sitem.abilitys.forEach(function (descitem, sindex) {
                name_desc += `<table width="400" style="background: #f0f0f0; text-align: left; margin: 5px 0;">
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${sindex + 1}.能力&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${descitem.ability_name}</td>
                          </tr>
                          ${descitem.description != null && descitem.description != '' ? `<tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;能力描述&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                              ${descitem.description}
                            </td>
                          </tr>`: ''}
                        </table>`;
            });
        } else {
            name_desc = '';
        }
        var work_arr = sitem.workcenters;
        // 工作中心
        if (work_arr) {
            work_arr.forEach(function (witem,windex) {
                work_center += `<table width="200" style="background: #f0f0f0; text-align: left; margin: 5px;">
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">${windex + 1}.编码&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">${witem.code}</td>
                          </tr>
                          <tr style="height: auto">
                            <td style="width: 60px;text-align: right;border-bottom: 1px #fff solid;color:#8b8b8b;">&nbsp;名称&nbsp;</td>
                            <td style="text-align: left;border-bottom: 1px #fff solid;border-left: 1px #fff solid;">
                              ${witem.name}
                            </td>
                          </tr>
                        </table>`;
            });

        } else {
            work_center = '';
        }
        stepItems += `<tr>
                   <td>${sitem.index}</td>
                   <td>${sitem.name}</td>
                   <td align="left">${name_desc}</td>
                   <td>${work_center}</td>
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
                   <td class="pre_bgcolor desc" style="word-break: break-all">${tansferNull(sitem.description)}</td>
                   <td class="pre_bgcolor desc">${tansferNull(sitem.comment)}</td>
                 </tr>`;
        if (sitem.step_drawings && sitem.step_drawings.length) {
            sitem.step_drawings.forEach(function (ditem) {
                step_draw += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				 <p>${ditem.code}</p>
				 </div>`;
            })
        }

    });

    stepBlocks = `<div class="route_preview_container">
                    <table>
                        <thead>
                          <tr>
                              <th style="width:45px;">序号</th>
                              <th style="width:60px;">步骤</th>
                              <th style="width:200px;">能力</th>
                              <th>工作中心</th>
                              <th>消耗品</th>
                              <th>产成品</th>
                              <!--<th>图纸</th>-->
                              <th>标准工艺</th>
                              <th>特殊工艺</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${stepItems}
                          <tr><td colspan="8"><div class="draw_content clearfix">${step_draw}</div></td></tr>

                        </tbody>
                    </table>
                    <div class="img_expand_pre"></div>
                 </div>`
    if (stepBlocks) {
        $('#formPrintWt').html(stepBlocks);
    } else {
        $('#formPrintWt').html('');
    }
}
function getFilterPreviewData(dataArr, type) {
    return dataArr.filter(function (e) {
        return e.type == type;
    });
}
function cpreviewAttr(data, flag) {
    var bgColor = '', str = '';
    if (flag == 'in') {
        bgColor = 'ma_in';
    } else {
        bgColor = 'ma_out';
    }
    data.forEach(function (mitem) {
        var ma_attr = '', ma_attr_container = '';
        if (mitem.attributes && mitem.attributes.length) {
            mitem.attributes.forEach(function (aitem) {
                if (aitem.from == 'erp') {
                    aitem.commercial = "null";
                }
                ma_attr += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial == 'null' ? '' : [aitem.commercial]}</td></tr>`;
            });
            ma_attr_container = `<table>${ma_attr}</table>`;
        } else {
            ma_attr = `<span>暂无数据</span>`;
            ma_attr_container = `<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
        }
        str += `<div class="route_preview_material ${bgColor}">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <div class="pre_unit"><span>${mitem.qty}</span><p>${mitem.bom_commercial}</p></div>
              <div class="pre_unit" style="width: 100px"><span>描述</span><p>${mitem.desc}</p></div>
          </div>`;
    });
    return str;
}


function getOutsourceItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].orderShow+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#number').val(rsp.results.number);
            $('#BANFN').val(rsp.results.BANFN);
            $('#BNFPO').val(rsp.results.BNFPO);
            $('#production_number').val(rsp.results.production_number);
            $('#operation_name').val(rsp.results.operation_name);
            $('#is_end_operation').val(rsp.results.is_end_operation==1?'是':'否');
            group_routing_package=JSON.parse(rsp.results.group_routing_package);
            createIngroupsHtml($('.ingroups_table .t-body'),rsp.results.ingroups);
            createOutgroupsHtml($('.outgroups_table .t-body'),rsp.results.outgroups);
            createPrgroupsHtml($('.prgroups_table .t-body'),rsp.results.prgroups);

        },
        fail: function(rsp){
        }
    },this);


}

function createIngroupsHtml(ele,data) {
    ele.html('');
    data.forEach(function (item) {

        var tr=`
            <tr class="tritem" data-id="${item.id}" data-code="${item.material_code}">
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td>${tansferNull(item.plan_qty)}</td>
                <td>${tansferNull(item.bom_commercial)}</td>
                <td><button type="button" class="button delete-ingroup">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })

}

function createOutgroupsHtml(ele,data) {
    ele.html('');
    data.forEach(function (item) {

        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td>${tansferNull(item.plan_qty)}</td>
                <td>${tansferNull(item.bom_commercial)}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })

}

function createPrgroupsHtml(ele,data) {
    ele.html('');
    data.forEach(function (item) {

        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td>${tansferNull(item.plan_qty)}</td>
                <td>${tansferNull(item.ERFME)}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })

}

