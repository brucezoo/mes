var id = 0,
    layerModal,
    tempMaterialCategoryId='',
    tempMaterialCategoryName='',
    tempCurrentPage = 1,
    bom_specification = '',
    initRouteState=true,
    basic_qty=0,
    selectBomChild = '',
    creator_token = '',
    ajaxTopData = {
        order: 'desc',
        sort: 'id'
    },
    ajaxData = {
        order: 'desc',
        sort: 'id'
    },
    pageNo = 1,
    pageNo1 = 1,
    selectedRouteList = [],
    materialData = [],
    bomShowData = {},
    itemAddFlag = 1,
    replaceId = '',
    topMaterial = {},
    ajaxSubmitData = {},
    codeCorrect = !1,
    nameCorrect = !1,
    materialCorrect = !1,
    bomChildrenCorrect = !1,
    versionCorrect = !1,
    operationCorrect = !1,
    mActionFlag = 'add',
    noEditFlag = '',
    bomOperation = [],
    bom_id = '',
    bomDesign = '',
    bomProduct = '',
    productId,
    productPageNo = 1,
    productPageSize = 10,
    productDifference = [],
    operationSource = [],
    abilitySource = [],
    bomItemArr = [],
    editData = {},
    routeid = 0,
    routenodes = [],
    opabs = [],
    workCenters = {},
    checkedPractice = [],
    selectedMaterialType = [],
    go = true,
    alltreego = true, routeLine = [],
    newroutingGraph = null,
    isVersionOn = '',
    Status = '',
    wasRelease = '',
    Version='',
    bom_no='',
    scrollTop=0,
    material_code='',
    choose_code=[],
    inserttreego= true,
    bomMaterialIdList={},
    checkedMaterial = [],
    currentRouting = 0,
    $replaceTr;

$(function () {
    id = getQueryString('ids');

    bindEvent();

    getCheckedBom(id);
});

function bindEvent() {
    $('body').on('click', '.bom-replace-delete', function(e) {
        e.stopPropagation();
        var $tr = $(this).parents('tr');
        $tr.hide(function (item) {
              $tr.remove();
        });
    });

    $('body').on('click', '.bom-replace-container .arrow', function(e) {
        e.stopPropagation();

        if ($(this).hasClass('fa-angle-up')) {
            $(this).removeClass('fa-angle-up').addClass('fa-angle-down');
            $(this).parent().nextAll().hide();
        } else {
            $(this).removeClass('fa-angle-down').addClass('fa-angle-up');
            $(this).parent().nextAll().show();
        }
    });
    
    $('body').on('click', '.choose-bom-pop', function (e) {
        e.stopPropagation();

        if (!checkedMaterial.length) {
            layer.msg('请选择物料！', { icon: 5, offset: '250px', time: 1500 });
            return false;
        }

        // 重复校验
        var currentAllMaterial = [];

        $(`#material-table-${currentRouting}`).find('tr').each(function (index, $tr) {
            currentAllMaterial.push($($tr).attr('data-new-code') || $($tr).attr('data-code'))
        });

        if (currentAllMaterial.includes(checkedMaterial[0]['item_no'])) {
            layer.msg('物料已存在，请重新选择', {icon: 5});
            return false;
        }

        layer.close(layerModal);

        if ($replaceTr) {
            // 新增的替换
            if (!$replaceTr.attr('data-code')) {
                var $btns = `<button type="button" class="el-button bom-replace-replace" data-routing-id="${currentRouting}">替换</button><button type="button" class="el-button bom-replace-delete" style="margin-left: 4px;">删除</button>`;

                // 这里的data-code 给的是当前的
                var $tr = $(`<tr class="bom-l4" data-new-code="${checkedMaterial[0]['item_no']}" data-json='${JSON.stringify(checkedMaterial[0])}'>
                        <td>${checkedMaterial[0]['item_no']}</td>
                        <td>${checkedMaterial[0]['name']}</td>
                        <td><input type="number" step="1" min="0" value="1" class="el-input bom-ladder-input"></td>
                        <td><textarea class="el-textarea bom-textarea desc" name="" id="" cols="30" rows="3"></textarea></td>
                        <td>${$btns}</td>
                    </tr>`);

                $($replaceTr).replaceWith($tr);

                return;
            }
            // 替换，当前bom所有的同样物料
            $('.bom-l4[data-code="'+ $replaceTr.attr('data-code') +'"]').each(function (index, $replaceItem) {
                // 各个table重复校验
                var currentAllMaterial = [];

                $($replaceItem).parents('tbody').find('tr').each(function (index, $itemTr) {
                    currentAllMaterial.push($($itemTr).attr('data-new-code') || $($itemTr).attr('data-code'))
                });

                if (!currentAllMaterial.includes(checkedMaterial[0]['item_no'])) {
                    var itemRouting = $($replaceItem).parentsUntil('.bom-replace-container').find('.bom-replace-add').attr('data-routing-id');

                    var $btns = `<button type="button" class="el-button bom-replace-replace" data-routing-id="${itemRouting}">替换</button><button type="button" class="el-button bom-replace-delete" style="margin-left: 4px;">删除</button>`;

                    // 这里的data-code 给的是当前的
                    var $tr = $(`<tr class="bom-l4" data-code="${$replaceTr.attr('data-code')}" data-new-code="${checkedMaterial[0]['item_no']}" data-json='${JSON.stringify(checkedMaterial[0])}'>
                        <td>${checkedMaterial[0]['item_no']}</td>
                        <td>${checkedMaterial[0]['name']}</td>
                        <td><input type="number" step="1" value="1" min="0" class="el-input bom-ladder-input"></td>
                        <td><textarea class="el-textarea bom-textarea desc" name="" id="" cols="30" rows="3"></textarea></td>
                        <td>${$btns}</td>
                    </tr>`);

                    $($replaceItem).replaceWith($tr);
                }
            });
        } else {
            // 添加
            var $btns = `<button type="button" class="el-button bom-replace-replace" data-routing-id="${currentRouting}">替换</button><button type="button" class="el-button bom-replace-delete" style="margin-left: 4px;">删除</button>`;

            // 这里的data-code 给的是当前的
            var $tr = $(`<tr class="bom-l4" data-new-code="${checkedMaterial[0]['item_no']}" data-json='${JSON.stringify(checkedMaterial[0])}'>
                        <td>${checkedMaterial[0]['item_no']}</td>
                        <td>${checkedMaterial[0]['name']}</td>
                        <td><input type="number" step="1" value="1" min="0" class="el-input bom-ladder-input"></td>
                        <td><textarea class="el-textarea bom-textarea desc" name="" id="" cols="30" rows="3"></textarea></td>
                        <td>${$btns}</td>
                    </tr>`);

            $(`#material-table-${currentRouting}`).append($tr);
        }
    })

    //添加项
    $('body').on('click', '.bom-replace-add', function () {
        checkedMaterial = [];
        currentRouting = $(this).attr('data-routing-id');
        var bomId = $(this).parents('.bom-l1').attr('data-bom');
        $replaceTr = null;

        chooseMaterial(currentRouting, bomId);
    });

    // 替换项
    $('body').on('click', '.bom-replace-replace', function () {
        checkedMaterial = [];
        currentRouting = $(this).attr('data-routing-id');
        var bomId = $(this).parents('.bom-l1').attr('data-bom');
        $replaceTr = $(this).parents('tr');

        chooseMaterial(currentRouting, bomId);
    });

    //checkbox 点击
    $('body').on('click', '.el-checkbox_input', function (e) {
        e.preventDefault();

        $('.el-checkbox_input').removeClass('is-checked');

        $(this).toggleClass('is-checked');
        var data = $(this).parents('.tritem').data('materItem');
        if ($(this).hasClass('is-checked')) {
            checkedMaterial = [data];
        } else {
            var index = checkedMaterial.indexOf(data);
            index > -1 ? materialData.splice(index, 1) : null;
        }
    });

    $('body').on('click', '.submit-save', function (e) {
        e.stopPropagation();

        var ajaxDataBom = {
            _token: TOKEN,
            data: []
        };

        $('.bom-l1').each(function (index, $bomL1) {
            var bomL1Data = JSON.parse($($bomL1).attr('data-json'));

            var bomTree = bomL1Data.bom_tree;
            bomTree.children.forEach(function (item){
                item.son_material_id = item.children.map(function (item) {
                    return item.material_id
                });
                item.bom_item_qty_levels = [];
                item.replaces = [];
            })

            var currentData = {
                code: bomL1Data.code,
                name: bomL1Data.name,
                material_id: bomL1Data.material_id,
                operation_id: bomL1Data.operation_id,
                bom_no: bomL1Data.bom_no,
                BMEIN: bomL1Data.BMEIN,
                'from': bomL1Data['from'],
                STLAN: bomL1Data.STLAN,
                bom_sap_desc: bomL1Data.bom_sap_desc,
                operation_capacity: bomL1Data.operation_ability || '',
                loss_rate: bomL1Data.loss_rate,
                bom_group_id: bomL1Data.bom_group_id,
                qty: bomL1Data.qty,
                label: bomL1Data.label,
                description: bomL1Data.description,
                bom_unit_id: bomL1Data.bom_unit_id,
                bom_id: bomL1Data.bom_id,
                attachments: JSON.stringify([]),
                bom_tree: JSON.stringify(bomTree),
                version_description: bomL1Data.version_description,
                is_upgrade: 1,
                current_routing_info: []
            }

            $($bomL1).find('.bom-l2').each(function (index, $bomL2) {
                var ppp = JSON.parse($($bomL2).attr('data-json'));

                var routing = {
                    routing_id: ppp.routing_id,
                    is_default: ppp.is_default,
                    control_info: JSON.stringify([ppp.control_info]),
                    factory_id: ppp.factory_id
                }, routing_info_list = [];

                $($bomL2).find('.bom-l3').each(function (index, $bomL3) {
                    var currentRouting = JSON.parse($($bomL3).attr('data-json'));

                    var routing_info = {
                        routing_node_id: currentRouting.routing_node_id,
                        practice_id: currentRouting.practice_id,
                        operation_id: currentRouting.operation_id,
                        material_category_id: currentRouting.operation_id,
                        step_id: currentRouting.step_id,
                        field_description: currentRouting.field_description,
                        practice_step_order_id: currentRouting.practice_step_order_id,
                        index: currentRouting.index,
                        field_id: currentRouting.field_id,
                        name: currentRouting.name,
                        workCenters: currentRouting.workCenters,
                        code: currentRouting.code,
                        stand_values: currentRouting.stand_values,
                        workHours: currentRouting.workHours,
                        select_type: currentRouting.select_type,
                        group_index: currentRouting.group_index,
                        is_start_or_end: currentRouting.is_start_or_end,
                        is_template: currentRouting.is_template,
                        comment_font_type: currentRouting.comment_font_type,
                        practice_work_hour: currentRouting.practice_work_hour,
                        workcenters: currentRouting.workcenters,
                        device_id: currentRouting.device_id,
                        operation_ability_ids: currentRouting.operation_ability_ids,
                        comment: currentRouting.comment,
                        material_info: JSON.stringify([]),
                        drawings: currentRouting.drawings.map(item => Object.assign(item, {compoing_drawing_id: 0})),
                        attachments: currentRouting.attachments,
                        composing_drawings: currentRouting.composing_drawings
                    };
                    var materialInfo = [];

                    $($bomL3).find('.bom-l4').each(function (index, $bomL4) {
                        var currentMaterialInfo = JSON.parse($($bomL4).attr('data-json'));

                        // 编辑
                        if ($($bomL4).eq(0).find('input').length) {
                            currentMaterialInfo = {
                                name: currentMaterialInfo.name,
                                item_no: currentMaterialInfo.code,
                                commercial: currentMaterialInfo.commercial,
                                material_id: bomL1Data.material_id,
                                use_num: $($bomL4).eq(0).find('.bom-ladder-input').val(),
                                type: 1,
                                is_lzp: currentMaterialInfo.is_lzp,
                                step_path: '',
                                index: index + 1,
                                desc: $($bomL4).eq(0).find('.bom-textarea').val(),
                                bom_unit_id: bomL1Data.bom_unit_id,
                                POSNR: currentMaterialInfo.POSNR,
                                device_id: '',
                                comment_font_type: 0,
                                abilitys: JSON.stringify([]),
                                operation_alility_ids: '',
                                comment: '',
                                user_hand_num: currentMaterialInfo.user_hand_num
                            }
                        }

                        materialInfo.push(currentMaterialInfo);
                    })

                    routing_info.material_info = materialInfo;

                    routing_info_list.push(routing_info)
                })

                routing.routing_info = JSON.stringify(routing_info_list);

                currentData.current_routing_info.push(routing);
            })

            ajaxDataBom.data.push(currentData);
        })

        AjaxClient.post({
            url: URLS['bomAdd'].updateBomMaterial,
            dataType: 'json',
            data: ajaxDataBom,
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                layer.confirm('保存成功！', {icon: 3, title:'提示',offset: '250px',end:function(){
                    }}, function(index){
                    window.location.href = '/BomManagement/bomIndex';
                });
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                layer.msg(rsp.message, {icon: 5});
            }
        }, this);
    })
}

// 获取bom信息
function getCheckedBom(ids) {
    AjaxClient.get({
        url: URLS['bomList'].getAllBomInmaterial + "?" + _token + "&bom_code_batch=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            createBomHtml(rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 5});
        }
    }, this);
}


function createBomHtml(bomList) {
    var $html = bomList.map(function (bomItem) {
        return `<div class="bom-replace-container bom-l1" data-bom='${bomItem.id}' data-json='${JSON.stringify(bomItem)}'><p>${bomItem.bom_no} ${bomItem.name}<b class="arrow fa fa-angle-up"></b></p><div class="replace-view-bom">${createBomRoutingHtml(bomItem.bom_routing)}</div></div>`;
    }).join('');

    $('#bom-replace-container').html($html);
}

function createBomRoutingHtml(bomRoutingList) {
    return bomRoutingList.map(function (bomRoutingItem) {
        return `<div class="bom-replace-container bom-l2" data-json='${JSON.stringify(bomRoutingItem)}'><p>工艺路线组： ${bomRoutingItem.name} <b class="arrow fa fa-angle-up"></b></p>
            <div class="replace-view-routinginfo">${creatRoutingInfo(bomRoutingItem.routing_info)}</div></div>
        `;
    }).join('');
}

function creatRoutingInfo(routingInfoList) {
    return routingInfoList.map(function (routingInfo) {
        return `
            <div class="bom-replace-container bom-l3" data-json='${JSON.stringify(routingInfo)}'>
                <div class="bom-replace-containr"><p>工艺路线： ${routingInfo.name}<b class="arrow fa fa-angle-up"></b></p>
                <button type="button" class="el-button bom-replace-add" data-routing-id="${routingInfo.id}">添加进料</button>
                <div class="replace-view-routing">${createMaterialHtml(routingInfo.material_info, routingInfo.id)}</div></div>
            </div>
        `;
    }).join('');
}

function createMaterialHtml(materialInfoList, routingId) {
    var $thead = `<thead><tr><th>物料编码</th><th>物料名称</th><th>使用数量</th><th>简要描述</th><th></th></tr></thead>`;
    var $btns = `<button type="button" class="el-button bom-replace-replace" data-routing-id="${routingId}">替换</button><button type="button" class="el-button bom-replace-delete" style="margin-left: 4px;">删除</button>`;
    var $tableItems = materialInfoList.filter(function (materialInfo) {
        return materialInfo.type === 1;
    }).map(function (materialInfo) {
        return `
            <tr class="bom-l4" data-id="${materialInfo.id}" data-code="${materialInfo.item_no}" data-json='${JSON.stringify(materialInfo)}'>
                <td>${materialInfo.item_no}</td>
                <td>${materialInfo.name}</td>
                <td>${materialInfo.use_num}</td>
                <td>${materialInfo.desc}</td>
                <td>${$btns}</td></tr>
        `;
    }).join('');

    return `<div><table class="bom_table">${$thead}<tbody id="material-table-${routingId}">${$tableItems}</tbody></table></div>`;
}


//工艺路线的添加进料
function chooseMaterial(routingId, bomId) {
    var height = ($(window).height() - 280) + 'px';
    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="material-route" id="material-route" style="padding: 14px;">
             <div class="table-page">
                <div  style="max-height: ${height};padding: 10px 0;overflow-y: auto;margin-bottom: 20px; padding-right: 20px;">
                    <table class="uniquetable">
                        <thead><tr><th></th><th style='width: 380px;'>物料名称</th><th>物料编码</th><th>sap行项目号</th><th>单耗</th></tr></thead>
                        <tbody class="income-tbody"></tbody>
                    </table>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div btn-group" style="margin-right: 0px">
                      <button class="el-button el-button--primary choose-bom-pop">确定</button>
                  </div>            
                </div>
             </div>          
        </div>`,
        success: function (layero, index) {
            getIncome(routingId, bomId);
        }
    })
}

//获取进料(√)
function getIncome(routingId, bomId) {
    AjaxClient.get({
        url: URLS['bomAdd'].income + '?' + _token + '&bom_id=' + bomId + '&routing_id=' + routingId,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            if (rsp.results) {
                for (var r in rsp.results) {
                    var bitem = rsp.results[r];

                    var $tr = $(`
                        <tr class="tritem">
                            <td>
                                <span class="el-checkbox_input material-check ${checkedMaterial.indexOf(bitem.material_id) > -1 ? 'is-checked' : ''}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </td>
                            <td style="width: 90px;"><span style="word-break: break-all;" class="income-name">${bitem.name}</span></td>
                            <td>${bitem.item_no}</td>
                            <td>${bitem.POSNR}</td>
                            <td>${bitem.use_num}</td>
                        </tr>
                    `)
                    $tr.data('materItem', bitem);
                    $('.income-tbody').append($tr);
                }
            }


        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.open({
                title:'',
                content:'获取进料失败'
            });
            console.log('获取进料失败');
        }
    }, this);
}
