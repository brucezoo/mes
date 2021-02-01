var img_page_no = 1,
    bom_page_no = 1,
    ajaxImgData = {},
    ajaxCopyData = {
        operation_id: '',
        code: '',
        name: '',
        order: 'asc',
        sort: 'code'
    },
    imgchecks = [],
    selectImgModal = '',
    planImgModal = '',
    opeartion_ids = [],
	selectImg = null;
var arrs = [];

$(function () {
    bindRouteEvent();
});

//获取id
function getImgIds(data) {
    
    var ids = [];
    if(data.length) {
        data.forEach(function (item) {
            ids.push(item.drawing_id);
        });
    }
    return ids;
}
//操作数组
function actImgArray(data, id) {
    var ids = getImgIds(data);
    var index = ids.indexOf(Number(id));
    data.splice(index, 1);
}

function getPracticeList(id, flag) {
    AjaxClient.get({
        url: URLS['bomAdd'].practiceList + '?' + _token + '&operation_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            if (rsp && rsp.results) {
                var data = rsp.results.practice_field;
                if (data.length) {
                    var lis = '';
                    if (flag == 'one') {
                        data.forEach(function (item) {
                            var workcenters = JSON.stringify(item.workcenters);
                            lis += `<li data-id="${item.practice_field_id}" data-code="${item.practice_field_code}" data-name="${item.practice_field_name}" data-fielddesc="${item.field_description}" title="${item.field_description}" data-workcenters='${workcenters}' class="el-select-dropdown-item show_desc_for_mack">${item.practice_field_name}</li>`;
                        });
                        $('#practice_field_item .el-form-item.practice_item .el-select-dropdown-list').append(lis);
                    } else {
                        var colorspan = '';
                        var _shtml = '';
                        // if(maIds.indexOf(bitem.material_id)>-1){
                        //   colorspan='color';
                        // }
                        let practicesList = [];
                        if(checkedPractice.length) {
                            checkedPractice.forEach(item => {
                                if(item.nodeId == $('.self-make-btn').attr('data-node-id')) {
                                    practicesList = item.practiceList
                                }
                            })
                        }
                        data.forEach(function (item) {
                            var state = false;
                            // 暂时注释
                            if(practicesList.length) {
                                practicesList.forEach(function(obj) {
                                    if(String(item.practice_field_id) == String(obj.field_id)) {
                                        state = true;
                                    }
                                });
                            }
                            
                            var workcenters = JSON.stringify(item.workcenters);
                            if(state) {
                                _shtml += `<li data-fielddesc="${item.field_description}" data-id="${item.practice_field_id}" data-code="${item.practice_field_code}" data-name="${item.practice_field_name}" data-workcenters='${workcenters}' class="ma-item-li show_desc_for_mack">
                                                    <span class="el-checkbox_input step_check is-checked">
                                                        <span class="el-checkbox-outset"></span>
                                                        <span class="el-checkbox__label ${colorspan}" title="${item.field_description}">${item.practice_field_name}</span>
                                                    </span>
                                              </li>`;
                            } else {
                               
                                _shtml += `<li data-fielddesc="${item.field_description}" data-id="${item.practice_field_id}" data-code="${item.practice_field_code}" data-name="${item.practice_field_name}" data-workcenters='${workcenters}' class="ma-item-li show_desc_for_mack">
                                                    <span class="el-checkbox_input step_check">
                                                        <span class="el-checkbox-outset"></span>
                                                        <span class="el-checkbox__label ${colorspan}" title="${item.field_description}">${item.practice_field_name}</span>
                                                    </span>
                                              </li>`;
                            }

                           //$('#step-route').find('.ma-item-ul .ma-item-li:last-child').data('sitem', item);
                            
                        });
                        $('#step-route').find('.ma-item-ul').html(_shtml);
                    }
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function getPracticeLine(id) {
    $('.make_list_line_all').html('');
    AjaxClient.get({
        url: URLS['bomAdd'].practiceLine + '?' + _token + '&practice_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.make_list_line_all').html('');
            showPracticeLineHtml($('.make_list_line_all'), rsp.results || []);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function showPracticeLineHtml(ele, data) {
    var lineList = [];
    rnodes.lineData = rnodes.lineData || [];
    if(rnodes.lineData.length) {
        rnodes.lineData.forEach(function(item, index) {
            if(item.id == rnodes.ipractice_id) {
                lineList = item.lineIdList || [];
            }
        });
    }
    data.forEach(function (item) {
        var _name = '', _line_id = '', _line = '';
        if (item.base) {
            for (var key in item.base) {
                _name = item.base[key];
                _line_id = key;
            }
        }
        if (item.operation.length) {
            item.operation.forEach(function (citem) {
                var practice = '';
                if (citem.practice) {
                    citem.practice.forEach(function (pitem) {
                        practice += ` <p>${pitem.practice_names}</p>`
                    })
                }
                _line += `<div class="content">
                    <div class="oper_name"><span>${citem.operation_name}</span></div>
                    <div class="oper_prac">${practice}</div>
                </div>`;
            })
        }
        
        
        var ul = '';
        if(lineList.includes(_line_id)) { 
            ul = `<ul class="line_container" data-line='${JSON.stringify(item)}'>
                <li class="line-info-wrap">
                <p class="line-name-wrap">
                  <span class="el-checkbox_input line-check is-checked" data-id="${_line_id}">
                     <span class="el-checkbox-outset"></span>
                  </span>
                  <span class="line-name">${_name}</span>
                </p>
                <ul class="line-info">
                    <li>${_line}</li>
                </ul>
                </li>
            </ul>`;
        } else {
            ul = `<ul class="line_container" data-line='${JSON.stringify(item)}'>
                <li class="line-info-wrap">
                <p class="line-name-wrap">
                  <span class="el-checkbox_input line-check" data-id="${_line_id}">
                     <span class="el-checkbox-outset"></span>
                  </span>
                  <span class="line-name">${_name}</span>
                </p>
                <ul class="line-info">
                    <li>${_line}</li>
                </ul>
                </li>
            </ul>`;
        }
        ele.append(ul)
    })
    if (data.length == 1) {
        // ele.find('.el-checkbox_input.line-check').click();
    }
}


//开始，结束验证操作
function testSE() {
    
    if(!$('.route-tbody').find('tr.step-tr').length) {
        $('.self-make-btn').removeClass('is-disabled');
        $('.self-make-btn').attr('disabled', false);
       
        var noneHtml = '<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>';
        $('.route-tbody').html(noneHtml);
    }
    $('.route-tbody').find('tr.step-tr').each(function (index) {
        var trstep = $(this).data('step');
        trstep.index = index + 1;
        trstep.unique_id = trstep.field_id + '_' + trstep.index;
        $(this).find('td.index-column').html(trstep.index);
        $(this).attr({ 'data-index': index + 1, 'data-step-id': trstep.unique_id });
        $(this).data('step', trstep);
        var checkele = $(this).find('.check-group .s-e-check.is-checked');
        if (checkele.length) {
            if (checkele.hasClass('start')) {
                $(this).addClass('_group').nextAll().addClass('_group');
                $(this).find('.route_item .bottom .create-out').remove();
            } else if (checkele.hasClass('end')) {
                if ($('tr.step-tr._group').length) {
                    var start = $('tr.step-tr._group').eq(0).attr('data-step-id'),
                        end = $(this).attr('data-step-id');
                    $(this).nextAll().removeClass('_group');
                    var groupEle = $('tr.step-tr._group').attr('data-group-id', start + '-' + end);
                    groupEle.not(':last').find('.mode-wrap').html('');
                    groupEle.removeClass('_group');
                    if (!$(this).find('.mode-wrap').html()) {
                        var modeHtml = `<span class="el-checkbox_input mode-check" data-index="1">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="2">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料多流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="3">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="4">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料多流转品</span>
                            </span>`;
                        $(this).find('.mode-wrap').html(modeHtml);
                    }
                    if (!$(this).find('.img-add').html()) {
                        $(this).find('.img-add').html('<span class="ma_item_img_add">编辑图纸</span>');
                    }
                    var routeItem = $(this).find('.route_item');
                    routeItem.find('.create-out').length ? null : routeItem.find('.bottom').append('<span class="create-out">生成出料</span>');
                } else {
                    console.log('没有选择开始，禁用按钮');
                }
            }
        } else {
            $(this).find('.route_item .bottom .create-out').remove();
        }
    });
}

//添加可重复的做法字段
function showSelectPracticeModal(trele) {
    layerModal = layer.open({
        type: 1,
        title: '插入做法字段',
        offset: '100px',
        area: '300px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="formModal" id="practice_field_item">
             <div class="el-form-item practice_item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 100px;">做法字段<span class="mustItem">*</span></label>
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                            <input type="hidden" class="val_id" id="practice_item_id" value="">
                        </div>
                        <div class="el-select-dropdown" style="width: 203px;">
                            <ul class="el-select-dropdown-list">
                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block"></p >
             </div>
              <div class="el-form-item btnShow">
                  <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button el-button--primary practice_item_add">确定</button>
                  </div>
              </div>
    </form>`,
        success: function (layero) {
            var pracele = $('.make_list_all .make-item.selected');
            var practice_id = '';
            if (!pracele.length) {
                pracele = $('.self-make-btn');
            }
            practice_id = pracele.attr('data-opid');
            getPracticeList(practice_id, 'one');
            $('.practice_item_add').off('click').on('click', function () {
                if ($('#practice_field_item .el-input').val() == '--请选择--') {
                    return false;
                }
                var stepEle = $('#practice_field_item .el-select-dropdown-item[data-id=' + $('#practice_field_item #practice_item_id').val() + ']'),
                    step = {
                        field_id: stepEle.attr('data-id'),
                        name: stepEle.attr('data-name'),
                        code: stepEle.attr('data-code'),
                        field_description: stepEle.attr('data-fielddesc'),
                        material_category_id: trele.attr('data-cate-id') || '-1',
                        // workcenters: JSON.parse(stepEle.attr('data-workcenters')) //工作中心不从这里取，而是由工厂下的，工序节点去取
                    },
                    abs = '';
               
                var workcenters='',workcenterswrap='无';
                if (workCenters[step.field_id]) {
                    workCenters[step.field_id].forEach(function (wcitem) {
                        workcenters += `<li data-id="${wcitem.workcenter_id}" data-name="${wcitem.name}" class="el-select-dropdown-item route-workcenter-item" style="height:auto;">
                       <span class="el-checkbox_input route-ab-check" data-checkid="${wcitem.workcenter_id}" data-checkname="${wcitem.name}" data-checkcode="${wcitem.code}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label show_description" data-desc="${wcitem.desc}">${wcitem.name}</span>  
                       </span>
                    </li>`;
                    });
                    workcenterswrap = `<div class="el-form-item ma-workcenters_wrap">
                            <p class="workcenters-name"></p>
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">                                
                                    </div>
                                    <div class="el-select-dropdown workcenters" style="display: none;width: auto;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-workcenter-item" data-name="--请选择--">--请选择--</li>
                                            ${workcenters}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }
                // console.log(trele);
                // console.log(trele.attr('data-cate-id')||'-1')
                // var workcenter_name = '';
                if (opabs.length) {
                    opabs.forEach(function (abitem) {
                        // if (abitem.workcenters != []) {
                        //     abitem.workcenters.forEach(function (witem) {
                        //         workcenter_name += `<li data-wcid="${witem.workcenter_id}" data-wcname="${witem.workcenter_name}">${witem.workcenter_name}</li>`
                        //     })
                        // }
                        abs += `<li data-id="${abitem.id}" data-name="${abitem.ability_name}" class="el-select-dropdown-item route-ability-item" style="height:auto;">
                        <span class="el-checkbox_input route-ab-check" data-checkid="${abitem.id}" data-checkname="${abitem.ability_name}">
                        <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label show_description" data-desc="${abitem.ability_description}">${abitem.ability_name}</span>
                       </span>
                    </li>`;
                    });
                    abwrap = `<div class="el-form-item ma-ability_wrap">
                            <p class="abs-name"></p>
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">
                                    </div>
                                    <div class="el-select-dropdown ability" style="display: none;width: auto;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-ability-item" data-name="--请选择--">--请选择--</li>
                                            ${abs}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }
                var steps = `<tr data-isTemplate="${step.is_template}" data-name="${step.name}" data-pfid="0" data-cate-id="${step.material_category_id}" data-code="${step.code}" data-step-id="${step.field_id}_0" class="step-tr" data-field-id="${step.field_id}" data-workhours="[]" data-standValues="[]" data-field-desc="${step.field_description}">
                      <td class="index-column"></td>
                      <td>
                        <p>${step.name}</p >
                        <p>(${step.code})</p >
                        <p>${step.field_description}</p>
                        <p class="check-group">
                            <span class="el-checkbox_input s-e-check start" data-step-id="${step.field_id}_0">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">开始</span>
                            </span>
                            <span class="el-checkbox_input s-e-check end" data-step-id="${step.field_id}_0">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">结束</span>
                            </span>
                        </p >
                        <p class="step-act">
                           <span class="new_step">新增</span>
                           <span class="delete_step">删除</span>
                        </p >
                      </td>
                      <td>${abwrap}</td>
                      <td>${workcenterswrap}</td>
                      <td class="step-device"></td>
                      <td>
                        <div class="mode-wrap">
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料多流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料多流转品</span>
                            </span>
                        </div>
                      </td>
                      <td>
                          <div class="route_item">
                              <div class="select_route">
                                  <table class="sticky uniquetable commontable">
                                      <thead>
                                      <tr>
                                          <th style="display: none;">物料</th>
                                          <th>sap行项目号</th>
                                          <th style="display: none;">属性</th>
                                          <th>数量</th>
                                          <th>类型</th>
                                          <th>描述</th>
                                          <th style="text-align: center; width: 120px;">操作</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="bottom">
                                  <span class="ma_item_add">添加进料</span>
                              </div>
                          </div>
                      </td>
                      <td><div class="img-wrap"></div><div class="img-add"><span class="ma_item_img_add">编辑图纸</span></div></td>
                      <td><div class="basic-text">${step.description || ''}</div></td>
                      <td><textarea class="el-textarea ma-textarea auto-textarea"></textarea></td>
                      <td><div class="attch-wrap"></div><div class="attch-add"><span class="ma_item_attch_add">上传附件</span></div></td>
                  </tr>`;
                trele.after(steps);
                trele.next().data('step', step);
                testSE();
                checkSE();
                layer.close(layerModal);
            });
        }
    })
}
//将指定节点下面的所有svg转换成canvas
function svg2canvas(targetElem) {
    var nodesToRecover = [];
    var nodesToRemove = [];
    var svgElem = targetElem.find('svg');
    svgElem.each(function (index, node) {
        var parentNode = node.parentNode;
        var svg = node.outerHTML;
        var canvas = document.createElement('canvas');
        canvg(canvas, svg);
        nodesToRecover.push({
            parent: parentNode,
            child: node
        });
        parentNode.removeChild(node);
        nodesToRemove.push({
            parent: parentNode,
            child: canvas
        });
        parentNode.appendChild(canvas);
    });

}

//模拟iframe,并且将需要的数据存入临时iframe
function openWithIframe(html) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", "myFrmame");

    var $iframe = $(iframe);
    $iframe.css({
        'visibility': 'hidden', 'position': 'static', 'z-index': '4'
    }).width(document.documentElement.clientWidth).height(document.documentElement.clientHeight);
    $('body').append(iframe);
    var ifDoc = iframe.contentWindow.document;

    var style = "<link type='text/css' rel='stylesheet' href='/statics/custom/css/common.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/custom/css/material/material-add.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/bom.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/common/orgChart/css/jquery.orgchart.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/common/fileinput/fileinput.min.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/common/fileinput/theme/theme.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/log.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/custom/css/bom/routingPdf.css'>";
    style += "<link type='text/css' rel='stylesheet' href='/statics/custom/css/practice/img_upload.css'>";

    html = "<!DOCTYPE html><html><head>" + style + "</head><body>" + html + "</body></html>"

    ifDoc.open();
    ifDoc.write(html);
    ifDoc.close();

    var fbody = $iframe.contents().find("body");

    fbody.find("#chart-center").removeAttr("width");

    fbody.find("#downlist,#downsPdf,#downsPdf .preview-wrap, #downsPdf .el-panel-preview-wrap").css("width", "100%");
    //fbody.find("#downsPdf").css("width", "100%");

    fbody.find("#severity-chart svg").attr("width", "370");
    fbody.find("#status-chart svg").attr("width", "300");
    return fbody;
}

function bindRouteEvent() {

    // 移动图片顺序 --- 图片上移
    $('body').on('click', '.sort-caret.ascending.upImg', function () {
        var trele = $(this).parents('.step-tr');
        var trid = trele.attr('data-step-id');
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
        } else {
            imgchecks = [];
        }

        let imgId = $(this).attr('data-img-id');
        let moveState = false;
        if (imgchecks.length>1) {
            imgchecks.forEach(function(item, index) {
                if (item.drawing_id == imgId) {
                    if (index > 0) {
                        let tempImg = '';
                        tempImg = imgchecks[index]; // 当前图片
                        imgchecks[index] = imgchecks[index-1];
                        imgchecks[index-1] = tempImg;
                        moveState = true;
                    }
                }
            })

            var imgs = '';
            if (moveState) {

                imgchecks.forEach(function (item) {
                        
                    let showImgCheckHtml = '';
                    let imgMoveHtml = '';
                    
                    imgMoveHtml = `<span class="caret-wrapper" style="height: 34px;">
                                        <i class="sort-caret ascending upImg " data-img-id="${item.drawing_id}"></i>
                                        <i class="sort-caret descending downImg" data-img-id="${item.drawing_id}"></i>
                                </span>`;
                    if (item.is_show == 1) {
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    } else if (item.is_show == 2) {
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    } else {
                        item.is_show = 1;
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    }
                    
                    
                    imgs += `<p><img style="cursor: pointer;" data-img-id="${item.drawing_id}" data-imgPlan-id="${item.compoing_drawing_id || 0}" src="/storage/${item.image_path}" width="80" height="40"><i style="cursor: pointer;" class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i>${imgMoveHtml}${showImgCheckHtml}</p>`;
                });
            
                $('.route-tbody .step-tr[data-step-id=' + trid + ']').attr('data-imgs', JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
            }
        }
    });

    // 移动图片顺序 --- 图片下移
    $('body').on('click', '.sort-caret.descending.downImg', function () {
        var trele = $(this).parents('.step-tr');
        var trid = trele.attr('data-step-id');
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
        } else {
            imgchecks = [];
        }

        let imgId = $(this).attr('data-img-id');

        if (imgchecks.length>1) {
            let moveState = false;
            let imgLength = imgchecks.length-1;

            imgchecks.forEach(function(item, index) {
             
                if (item.drawing_id == imgId && imgLength !== index) {
                    if (!moveState) {
                        let tempImg = '';
                        tempImg = imgchecks[index]; // 当前图片
                        imgchecks[index] = imgchecks[index+1];
                        imgchecks[index+1] = tempImg;
                        moveState = true;
                    }
                }
            })
          
            var imgs = '';
            if (moveState) {

                imgchecks.forEach(function (item) {
                        
                    let showImgCheckHtml = '';
                    let imgMoveHtml = '';
                    
                    imgMoveHtml = `<span class="caret-wrapper" style="height: 34px;">
                                        <i class="sort-caret ascending upImg " data-img-id="${item.drawing_id}"></i>
                                        <i class="sort-caret descending downImg" data-img-id="${item.drawing_id}"></i>
                                </span>`;
                    if (item.is_show == 1) {
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    } else if (item.is_show == 2) {
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    } else {
                        item.is_show = 1;
                        showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">是否显示</span>
                        </span>`;
                    }
                    
                    
                    imgs += `<p><img style="cursor: pointer;" data-img-id="${item.drawing_id}" data-imgPlan-id="${item.compoing_drawing_id || 0}" src="/storage/${item.image_path}" width="80" height="40"><i style="cursor: pointer;" class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i>${imgMoveHtml}${showImgCheckHtml}</p>`;
                });
            
                $('.route-tbody .step-tr[data-step-id=' + trid + ']').attr('data-imgs', JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
            }
        }


    });


    //二维码
    $('body').on('click', '#qr-code', function (e) {
        $(".container-code").toggle();
    });
    //工艺文件预览页面中点击 "下载doc" 按钮
    $('body').on('click', '#renderDOC', function (e) {

        var bom_name = $('#addBBasic_from #code').val();
        var tab_name = $(this).siblings().find(".el-tap.active").html();
        $("#downlistdoc").wordExport(bom_name + tab_name);
    });
    //直接打印
    $('body').on('click','#print:not(.is-disabled)',function (e) {
        e.stopPropagation();
        $("#downlistdoc").show();
        $("#downlistdoc").print();
        $("#downlistdoc").hide();

    })
    $('body').on('click','.checkbox_opeartion_step',function (e) {
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-opeartion_step");
        if($(this).hasClass('is-checked')){
            if(opeartion_ids.indexOf(id)==-1){
                opeartion_ids.push(id);
            }
        }else{
            var index=opeartion_ids.indexOf(id);
            opeartion_ids.splice(index,1);
        }

        var rnid = $('.el-tap-preview-wrap .el-tap.active').attr('data-item');
        getPreviewCopy(rnid);
    })

    //工艺文件预览页面中点击 "下载PDF" 按钮
    $('body').on('click', '#renderPDF', function (e) {
        // 防止频繁下载pdf判断
        var screansize = detectZoom();
        if(screansize!=100){
            layer.confirm('屏幕缩放比例是'+screansize+'%,请修改为100%。', {
                icon: 3,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        }else {
        var clicktag = 0;
        if (clicktag == 0) {
            clicktag = 1;
            $('#renderPDF').addClass('editDisabled');

            var chartCenter = document.getElementById("doc_list_copy").outerHTML;
            var fbody = openWithIframe(chartCenter);
            var pdf = new jsPDF('landscape', 'pt', 'a4');
            fbody.find('#doc_list_copy').show();
            svg2canvas(fbody);
            html2canvas(fbody, {
                scale: 2,
                width: fbody.width(),
                height: fbody.height(),
                onrendered: function (canvas) {
                    var contentWidth = canvas.width;
                    var contentHeight = canvas.height + 500;
                    var heightsArr = [];
                    fbody.find('.checkline').each(function () {
                        heightsArr.push($(this).offset().top);
                    });
                    //一页pdf显示html页面生成的canvas高度;
                    var pageHeight = (contentWidth / 595.28 * 841.89) - 500;
                    //未生成pdf的html页面高度
                    var leftHeight = contentHeight - 8;
                    //页面偏移
                    var position = 0;
                    //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                    var imgWidth = 841.89;
                    var imgHeight = 595.28 / contentWidth * contentHeight;

                    var pageData = canvas.toDataURL('image/jpeg', 1.0);

                    //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                    //当内容未超过pdf一页显示的范围，无需分页
                    if (leftHeight < pageHeight) {
                        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
                    } else {
                        var choose = 0;
                        while (leftHeight > 0) {
                            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                            leftHeight -= pageHeight;
                            position -= 595.28;
                            //避免添加空白页
                            if (leftHeight > 0) {
                                pdf.addPage();
                            }
                        }
                    }
                    var bom_name = $('#addBBasic_from #code').val();
                    var tab_name = $("#renderDOC").siblings().find(".el-tap.active").html();
                    pdf.save(bom_name + tab_name + '.pdf');
                    $('#myFrmame').remove();

                },
                background: "#fff",
                allowTaint: true
            });
            setTimeout(function () {
                clicktag = 0;
                $('#renderPDF').removeClass('editDisabled');

            }, 6000)

        }
        }

    });

    //更多搜索条件下拉
    $('body').on('click', '#searchForm .arrow:not(.noclick)', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {

            $(this).find('.el-icon').removeClass('is-reverse');
            $('#searchForm:not(.search_wrap) .el-item-show').css('background', '#e2eff7');
            $('#searchForm:not(.search_wrap) .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $(this).find('.el-icon').addClass('is-reverse');
            $('#searchForm:not(.search_wrap) .el-item-hide').slideUp(400, function () {
                $('#searchForm:not(.search_wrap) .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });
    $('body').on('click', '#searchForm .choose-search', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
            $('.arrow .el-input-icon').removeClass('is-reverse');
        });

        var parentForm = $(this).parents('#searchImgAttr_from');
        var ele = $('.template_attr_wrap .attr_item'), _temp = [];
        if (ele.length) {
            $(ele).each(function (key, value) {
                if ($(value).find('input').val() != '') {
                    var obj = {
                        attribute_definition_id: $(value).attr('data-id'),
                        value: $(value).find('input').val()
                    };
                    _temp.push(obj)
                }

            })
        }
        ajaxImgData = {
            code: parentForm.find('#searchCode').val(),
            name: parentForm.find('#searchName').val(),
            creator_name: parentForm.find('#searchCreator').val(),
            drawing_attributes: JSON.stringify(_temp),
            category_id: parentForm.find('#img_source').val(),
            group_id: parentForm.find('#group_id').val(),
            type_id: parentForm.find('#type_id').val(),
            order: 'desc',
            sort: 'ctime'
        };
        if ($('.img-s-check.is-checked').attr('data-name') == 'make') {
            var pracid = $('#pracid').val();
            getPracticeImg(pracid);
        } else {
            getImageSource();
        }
    });
    //编辑图纸
    $('body').on('click', '.ma_item_img_add', function () {

        var trele = $(this).parents('.step-tr'),
            trid = trele.attr('data-step-id');
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
        } else {
            imgchecks = [];
        }
        showImageModal(trid);
	});
	
	//编辑图纸 复制
	$('body').on('click', '.ma_item_img_adds', function () {
		window.sessionStorage.setItem('r_b_i_d', $(this).attr('data-id'));
		window.sessionStorage.setItem('rbid_all', $(this).attr('data-ids'));
		window.sessionStorage.setItem('i', $(this).attr('datas-id'));

		var trele = $(this).parents('.step-tr'),
			trid = trele.attr('data-step-id');
		if (trele.attr('data-imgs')) {
			imgchecks = JSON.parse(trele.attr('data-imgs'));
		} else {
			imgchecks = [];
		}
		showImageModal(trid);
	});




    // 模板 --- 编辑图纸
    $('body').on('click', '#set-template .temp_img_add', function () {
        showImageModal('', 'setTemp');
    });

    //图纸选择
    $('body').on('click', '.el-checkbox_input.img-check', function () {
        $(this).toggleClass('is-checked');
        var data = $(this).parents('.trimgitem').data('trData');
        var ids = getImgIds(imgchecks);
        var state = $('.select_img_btn').attr('data-state');
        
        if (state == 'setTemp') {
            imgchecks = [];
            if ($(this).hasClass('is-checked')) {
                data.compoing_drawing_id = 0;
                imgchecks.push(data);
                $('#img_select_form .trimgitem').each(function(){
                    $(this).find('td .el-checkbox_input.img-check').removeClass('is-checked');
                });
                $(this).addClass('is-checked');
            } 
        } else {
            if ($(this).hasClass('is-checked')) {
                if (ids.indexOf(data.drawing_id) == -1) {
                    data.compoing_drawing_id = 0;
                    imgchecks.push(data);
                }
            } else {
                actImgArray(imgchecks, data.drawing_id);
            }
        }
    });
    //图纸确认
    $('body').on('click', '.select_img_btn', function () {
        var trid = $('#img_select_form #itemId').val();
        var imgs = '';
		var state = $('.select_img_btn').attr('data-state');
		let ars = [];
		let check = $('.check .is-checked');
		let r_id = $(this).attr('data-id');
		// mao
		for(let i=0; i<check.length; i++) {
			ars.push($(check[i]).attr('data-id'));
		}
		
		getId(ars);
        
        if (state == 'setTemp') {
            imgchecks.forEach(function (item) {
                // 模板图纸 --start
                $("#img-temp").attr('data-drawing-id', item.drawing_id);
                $("#img-temp").attr('src', `/storage/${item.image_path}`);
                $("#img-temp").css( 'display', "block");
                // 模板图纸 --end
            });
        } else {
            imgchecks.forEach(function (item) {
                
                let showImgCheckHtml = '';
                let imgMoveHtml = '';
                imgMoveHtml = `<span class="caret-wrapper" style="height: 34px;">
                                    <i class="sort-caret ascending upImg " data-img-id="${item.drawing_id}"></i>
                                    <i class="sort-caret descending downImg" data-img-id="${item.drawing_id}"></i>
                            </span>`;
                if (item.is_show == 1) {
                    showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                        <span class="el-checkbox-outset"></span>
                        <span class="el-checkbox__label">是否显示</span>
                    </span>`;
                } else if (item.is_show == 2) {
                    showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check">
                        <span class="el-checkbox-outset"></span>
                        <span class="el-checkbox__label">是否显示</span>
                    </span>`;
                } else {
                    item.is_show = 1;
                    showImgCheckHtml += `<br/><span class="el-checkbox_input img-show-check is-checked">
                        <span class="el-checkbox-outset"></span>
                        <span class="el-checkbox__label">是否显示</span>
                    </span>`;
                }
                
                
                imgs += `<p><img style="cursor: pointer;" data-img-id="${item.drawing_id}" data-imgPlan-id="${item.compoing_drawing_id || 0}" src="/storage/${item.image_path}" width="80" height="40"><i style="cursor: pointer;" class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i>${imgMoveHtml}${showImgCheckHtml}</p>`;
    
                // 模板图纸 --start
                $("#img-temp").attr('data-drawing-id', item.drawing_id);
                $("#img-temp").attr('src', `/storage/${item.image_path}`);
                $("#img-temp").css( 'display', "block");
                // 模板图纸 --end
            });
           
            $('.route-tbody .step-tr[data-step-id=' + trid + ']').attr('data-imgs', JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
        }
        
        layer.close(selectImgModal);
	});
	

	// mao
	function getId(arr) {  

		let rbid = window.sessionStorage.getItem('r_b_i_d');
		let lgCode = window.localStorage.getItem('lgCodes');
		let datas = [];

		arr.forEach(function(item) {
			datas.push({
				rbrd_id: rbid,
				drawing_id: item,
				language_code: lgCode,
			});
		})

		AjaxClient.post({
			url: URLS['maintain'].img + "?" + _token + '&datas=' + JSON.stringify(datas),
			dataType: 'json',
			success: function (rsp) {
				let i = window.sessionStorage.getItem('i');
				wImg(i);
			},
			fail: function (rsp) {

			}
		}, this);
	}



    //图纸删除
    $('body').on('click', '.img-delete', function () {
        var trele = $(this).parents('.step-tr'),
            imgid = $(this).attr('data-img-id');
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
            actImgArray(imgchecks, imgid);
            trele.attr('data-imgs', JSON.stringify(imgchecks));
            $(this).parents('p').remove();
        }
    });
    //新增步骤
    $('body').on('click', '.new_step', function () {
        var trele = $(this).parents('.step-tr');
        showSelectPracticeModal(trele);
    });
    //删除步骤
    $('body').on('click', '.delete_step', function () {
        var that = $(this);
        layer.confirm('将执行删除步骤操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
           that.parents('.step-tr').remove();
            testSE();
            checkSE();
            layer.close(index);
        });
    });

    // 是否显示图纸 img-show-check
    $('body').on('click', '.el-checkbox_input.img-show-check', function () {
        $(this).toggleClass('is-checked');
        let drawingId = $(this).siblings('img').attr('data-img-id');
        let showState = 1;
        var trele = $(this).parents('.step-tr');
            
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
        } else {
            imgchecks = [];
        }
        if ($(this).hasClass('is-checked')) {
            showState = 1;
        } else {
            showState = 2;
        }
        if(drawingId) {
            if (imgchecks.length) {
                imgchecks.forEach(function (item) {
                    if(item.drawing_id == drawingId) {
                        item.is_show = showState || 1;
                    }
                })
            }
            trele.attr('data-imgs', JSON.stringify(imgchecks));
        }
    });

    $('body').on('click', '.el-checkbox_input.line-check', function () {
        $(this).toggleClass('is-checked');
        var _this = this;
       
        if(rnodes.makes.length) {
            if(rnodes.lineData.length == 0) {
                rnodes.lineData = rnodes.makes;
            } 
            
            rnodes.lineData.forEach(function(item, index) {

                if(item.id == rnodes.ipractice_id) {
                    if($(_this).hasClass('is-checked')) {
                        item.lineIdList = item.lineIdList || [];
                        item.lineIdList.push($(_this).attr('data-id'));
                    } else {
                        item.lineIdList = item.lineIdList || [];
                        item.lineIdList = item.lineIdList.filter(val => val !== $(_this).attr('data-id'));
                    }
                }
            });
        }
    });
    $('body').on('click', '.img-wrap img', function () {
        var trele = $(this).parents('.step-tr'),
            trid = trele.attr('data-step-id');
            
        if (trele.attr('data-imgs')) {
            imgchecks = JSON.parse(trele.attr('data-imgs'));
        } else {
            imgchecks = [];
        }
        
        getImgInfo($(this).attr('data-img-id'), $(this).attr('data-imgplan-id'), 'edit', trid);
    });
    $('body').on('click', '.el-tap-img-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('.pic-wrap #' + form).addClass('active').siblings('.el-img-panel').removeClass('active');
        }
    });
    $('body').on('click', '.el-tap-preview-wrap .el-tap', function () {
        opeartion_ids = [];
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var rnid = $(this).attr('data-item');
            getPreview(rnid);
        }
    });

    // 排版图 
    $('body').on('click', '.el-checkbox_input.img-plan-check', function () {
        
        if(!$(this).hasClass('is-checked')) {
            $('#img_plan .trimgitem').each(function(){
                $(this).find('td .el-checkbox_input.img-plan-check').removeClass('is-checked');
            });
            $(this).addClass('is-checked').siblings('.el-checkbox_input.img-plan-check').removeClass('is-checked');
            $('#img_plan .el-button.btn-img-plan').attr('data-id', $(this).attr('data-id'));
        } else {
            $(this).removeClass('is-checked');
            $('#img_plan .el-button.btn-img-plan').attr('data-id', '');
        }
    });

    // 排版图 确认 
    $('body').on('click', '.el-button.btn-img-plan', function () {
        let drawingId = $(this).attr('data-drawingid');
        let planImgId = $(this).attr('data-id');
        let stepId = $("#stepId").val();
        layer.close(planImgModal);
        if(drawingId) {
            // $(".el-checkbox_input.img-check[data-id="+drawingId+"]").attr('data-img-plan', planImgId);
            
            $("#addRoute_form .img-wrap img[data-img-id="+drawingId+"]").attr('data-imgplan-id', planImgId);
            imgchecks.forEach(function (item) {
                if(String(item.drawing_id) == drawingId) {
                    item.compoing_drawing_id = planImgId || 0;
                }
            })
            $('.route-tbody .step-tr[data-step-id=' + stepId + ']').attr('data-imgs', JSON.stringify(imgchecks));
        }
    });

    $('body').on('click', '.image-select .img-s-check', function () {
        $(".op-view").html('');
        $('.image-select .img-s-check').removeClass('is-checked');
        $(this).addClass('is-checked');
        var dataName = $(this).attr('data-name');
        img_page_no = 1;
        if (dataName == 'make') {
            var pracid = $('.make_list_all .make-item.selected').attr('data-id');
            getPracticeImg(pracid);
        } else {
            $(".op-view").html('操作');
            getImageSource();
        }
    });
    $('body').on('click', '.preview_draw_wrap img', function (e) {
        $(this).parents('.preview_draw_wrap').toggleClass('active').siblings('.preview_draw_wrap').removeClass('active');
        if ($(this).parents('.preview_draw_wrap').hasClass('active')) {
            var path = $(this).parents('.preview_draw_wrap').attr('data-url');
            var img = `<img src="/storage/${path}" alt=""/>`;
            $(this).parents('.route_preview_container').find('.img_expand_pre').addClass('active').html(img);
        } else {
            $(this).parents('.route_preview_container').find('.img_expand_pre').removeClass('active').html('');
        }
    })
    //图纸放大
    $('body').on('click', '.el-icon.fa-search-plus:not(.all)', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(1, obj);
    });
    $('body').on('click', '.pic-img', function () {
        var imgList, current;
        imgList = $(this);
        current = $(this).attr('data-id');
        showBigImg(imgList, current);
    });

    //图纸缩小
    $('body').on('click', '.el-icon.fa-search-minus', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(-1, obj);
    });

    //图纸旋转
    $('body').on('click', '.el-icon.fa-rotate-right', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        rotatePic(obj);
    });

    $('body').on('click', '.preview-route', function (e) {
        e.stopPropagation();
        e.preventDefault();
        previewModal();
        previewDModal();
        getBomRoutingDownloadData();
    });

    $('body').on('click', '.search-div .search-icon', function () {
        var ele = $(this).siblings('.el-input');
        var val = ele.val();
        var makearr = [];
        if (rnodes && rnodes.makes) {
            if (val.length) {
                makearr = findMakeval(val);
            } else {
                makearr = rnodes.makes;
            }
        }
        var nlistHtml = '';
        if (makearr.length) {
            makearr.forEach(function (item) {
                nlistHtml += '<div class="make-item" data-opcode="' + rnodes.operation_code + '" data-node-id="' + rnodes.oid + '" data-id="' + item.id + '" data-c-id="' + item.m_c_id + '" data-opid="' + item.operation_id + '">' + item.name + '</div>';
            });
        } else {
            nlistHtml = '<p style="padding-left: 10px;">暂无数据</p>';
        }
        $('.make_list .make_list_all').html(nlistHtml);
        if (rnodes && rnodes.ipractice_id && rnodes.ipractice_id != -1) {
            $('.make-item[data-id=' + rnodes.ipractice_id + ']').addClass('selected');
        }
    });

    $('body').on('click', '.search-div .search-code', function () {
        var ele = $(this).siblings('.el-input');
        var val = ele.val();
        var makearr = [];
        if (rnodes && rnodes.makes) {
            if (val.length) {
                makearr = findMakecode(val);
            } else {
                makearr = rnodes.makes;
            }
        }
        var nlistHtml = '';
        if (makearr.length) {
            makearr.forEach(function (item) {
                nlistHtml += '<div class="make-item" data-opcode="' + rnodes.operation_code + '" data-node-id="' + rnodes.oid + '" data-id="' + item.id + '" data-c-id="' + item.m_c_id + '" data-opid="' + item.operation_id + '">' + item.name + '</div>';
            });
        } else {
            nlistHtml = '<p style="padding-left: 10px;">暂无数据</p>';
        }
        $('.make_list .make_list_all').html(nlistHtml);
        if (rnodes && rnodes.ipractice_id && rnodes.ipractice_id != -1) {
            $('.make-item[data-id=' + rnodes.ipractice_id + ']').addClass('selected');
        }
    });

    $('body').on('click', '.ma_item_attch_add', function () {
        attchUploadModal($(this).parents('.step-tr'));
    });

    $('body').on('click', '.attch-delete', function () {
        var trele = $(this).parents('.step-tr'),
            attch_id = $(this).attr('data-attch-id');
        if (trele.attr('data-attch')) {
            var attches = JSON.parse(trele.attr('data-attch'));
            if (attches.length) {
                var aindex = -1;
                attches.forEach(function (aitem, index) {
                    if (aitem.attachment_id == attch_id) {
                        aindex = index;
                        return false;
                    }
                });
            }
            aindex != -1 && attches.splice(aindex, 1);
            trele.attr('data-attch', JSON.stringify(attches));
            $(this).parents('p').remove();
        }
    });

    $('body').on('focus', '.auto-textarea', function () {
        autoSizeTextarea($(this)[0]);
    });
    $('body').on('click', '#addAttch_form .kv-file-remove', function () {
        $(this).parents('tr.file-preview-frame').remove();
    });

    //上移
    $('body').on('click', '.sort-caret.ascending.up', function () {
        var pPle = $(this).parents('tr.mas').prev();
        var pele = $(this).parents('tr.mas');
        var bpele = pele.prev().prev().prev();
        if (pPle.length) {
            if (bpele.length) {
                pPle.insertBefore(bpele);
                pele.insertBefore(bpele);
            } else {
                let headHtml = $(this).parents('.route_item').find('.select_route thead .name-attr-show');
                $(this).parents('.route_item').find('.select_route thead').prepend(pPle);
                $(this).parents('.route_item').find('.select_route tbody').prepend(pele);
                headHtml.insertAfter(pele);
                if(pele.hasClass('outcome')) { 
                    $(this).parents('.route_item').find('.select_route thead').css('background-color', '#fffef2');
                } else {
                    $(this).parents('.route_item').find('.select_route thead').css('background-color', '#fff');
                }
            }
        }
    });
    //下移
    $('body').on('click', '.sort-caret.descending.down', function () {
        var pPele = $(this).parents('tr.mas').prev();
        var pele = $(this).parents('tr.mas');
        var npele = pele.next().next();
        if (npele.length) {
            if (pPele.length) {
                pPele.insertAfter(npele);
                pele.insertAfter(pPele);
            } else {
                let headHtml = $(this).parents('.route_item').find('.select_route thead .name-attr-show');
                let mele = pele.next();
                headHtml.insertAfter(npele);
                pele.insertAfter(headHtml);
                $(this).parents('.route_item').find('.select_route thead').prepend(mele);

                if(npele.hasClass('outcome')) { 
                    $(this).parents('.route_item').find('.select_route thead').css('background-color', '#fffef2');
                } else {
                    $(this).parents('.route_item').find('.select_route thead').css('background-color', '#fff');
                }
            }
        } 
    });

    $('body').on('click', '.btn.copy-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (rnodes != null) {
            ajaxCopyData.operation_id = rnodes.operation_id;
            copyModal();
        } 
    });

    $('body').on('click', '.bom-copy-submit', function (e) {
        e.stopPropagation();
        e.preventDefault();
        ajaxCopyData.name = $('#bom_name').val().trim();
        ajaxCopyData.code = $('#bom_code').val().trim();
        bom_page_no = 1;
        getBomList();
    });

    $('body').on('click', '.el-radio-input.copy-bom-check', function () {
        if (!$(this).hasClass('is-radio-checked')) {
            $('#copyoperation .btn-group .errorMessage').html('请选择工艺路线');
            $(this).addClass('is-radio-checked').parents('.tritem').siblings('.tritem').find('.copy-bom-check').removeClass('is-radio-checked');
            getNodeInfo($(this).attr('data-id'));
        }
    });
    $('body').on('click', '.el-radio-input.copy-route-check', function () {
        if (!$(this).hasClass('is-radio-checked')) {
            $('#copyoperation .btn-group .errorMessage').html('请选择工序');
            $(this).addClass('is-radio-checked').parents('.route-li').siblings('.route-li').find('.copy-route-check').removeClass('is-radio-checked');
            var lineData = $(this).parents('.route-li').data('lineItem'),
                opele = $('#copyoperation .copy-op-ul').html('');
            if (lineData.nodes && lineData.nodes.length) {
                lineData.nodes.forEach(function (litem) {
                    var lis = `
              <li class="op-li" data-route-node-id="${litem.routing_node_id}">
                  <span class="el-radio-input copy-op-check" data-route-node-id="${litem.routing_node_id}">
                      <span class="el-radio-inner"></span>
                      <span class="el-radio-label">${litem.name}${litem.order - 1}</span>
                  </span>
              </li>
          `;
                    opele.append(lis);
                    opele.find('li:last-child').data('opItem', litem);
                });
            }
        } 
    });
    $('body').on('click', '.el-radio-input.copy-op-check', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (!$(this).hasClass('is-radio-checked')) {
            $(this).addClass('is-radio-checked').parents('.op-li').siblings('.op-li').find('.copy-op-check').removeClass('is-radio-checked');
        }
    });

    $('body').on('click', '#copyoperation .copy-operation', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).siblings('.errorMessage').html('');
        var opele = $('#copyoperation .copy-op-check.is-radio-checked');
        if (opele.length) {
            var opdata = opele.parents('.op-li').data('opItem');
            if (rnodes != null) {
                if (opdata.routing_info.length) {
                    rnodes.iroutes = opdata.routing_info.concat();
                    rnodes.ipractice_id = rnodes.iroutes[0].practice_id;
                    var makeele = $('.make_list_all .make-item[data-id=' + rnodes.ipractice_id + ']');
                    if (rnodes.ipractice_id == '-1') {
                        makeele = $('.make_list .self-make-btn');
                        setStep();
                    } else {
                        makeele.length && makeele.click();
                    }
                   
                }
            }
            layer.close(layerModal);
        } else {
           
            var bomList = $('#copyoperation .copy-bom-check.is-radio-checked');
            var routeList = $('#copyoperation .copy-route-check.is-radio-checked');
            var opList = $('#copyoperation .copy-op-check.is-radio-checked');
            if(!bomList.length) {
                $(this).siblings('.errorMessage').html('请选择BOM');
            }else if(!routeList.length) {
                $(this).siblings('.errorMessage').html('请选择工艺路线');
            } else {
                if(!opList.length) {
                    $(this).siblings('.errorMessage').html('请选择工序');
                }
            }
        }
    });
}

function stepattchfileinit(ele, preUrls, preOther) {
    $('#' + ele).fileinput({
        'theme': 'explorer-fa',
        language: 'zh',
        uploadAsync: true,
        'uploadUrl': URLS['bomAdd'].uploadAttachment,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'bom_routing_step';
            obj._token = TOKEN;
            return obj;
        },
        initialPreview: preUrls,
        initialPreviewConfig: preOther,
        dropZoneEnabled: false,
        showCaption: false,
        showClose: false,
        showUpload: false,
        showRemove: false,
        maxFileSize: 10 * 1024,
        maxFileCount: 1,
        overwriteInitial: false,
        showCancel: false
    }).on('fileselect', function (event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        var result = data.response,
            file = data.files[0];
        if (result.code == '200') {
            $('#addAttch_form .file-preview-frame[data-preview=preview-' + file.lastModified + ']').addClass('uploaded').
                attr({
                    'data-url': result.results.path,
                    'attachment_id': result.results.attachment_id,
                    'data-creator': result.results.creator,
                    'data-name': file.name,
                    'data-size': file.size
                }).find('td.creator').html(`<p class="creator_name">${result.results.creator}</p>`).removeAttr('data-preview');
        } else {
            var ele = $('#addAttch_form .file-preview-frame[data-preview=' + previewId + ']');
            ele.remove();
            var errorHtml = `<button type="button" class="close kv-error-close" aria-label="Close">
                           <span aria-hidden="true">×</span>
                        </button>
                        <ul>
                            <li>${result.message}</li>
                        </ul>`;
            $('.kv-fileinput-error.file-error-message').html(errorHtml).show();
            console.log('文件上传失败' + previewId);
        }
    }).on('filebeforedelete', function (event, key, data) {
        console.log('初始化附件删除');
    });
}

function actattach(trele) {
    var ele = $('#addAttch_form .file-preview-frame.file-preview-success,#addAttch_form .file-preview-frame.init-success-file');
    var fujianData = [], attchs = '';
    ele.each(function () {
        var item = {
            attachment_id: $(this).attr('attachment_id'),
            filename: $(this).attr('data-name'),
            size: $(this).attr('data-size'),
            creator_name: $(this).attr('data-creator'),
            path: $(this).attr('data-url'),
            comment: $(this).find('.fujiantext').val().trim()
        };
        attchs += `<p><a href="/storage/${item.path}" download="${item.filename}">${item.filename}</a><i class="fa fa-times-circle attch-delete" data-attch-id="${item.attachment_id}"></i></p>`;
        fujianData.push(item);
    });
    trele.attr('data-attch', JSON.stringify(fujianData)).find('.attch-wrap').html(attchs);
}

function attchUploadModal(trele) {
    var wheight = document.documentElement.clientHeight - 200;
    layerModal = layer.open({
        type: 1,
        title: '附件上传',
        offset: '100px',
        area: '800px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="addExcelModal formModal formMateriel" id="addAttch_form" style="min-height: 200px;max-height: ${wheight}px;overflow-y: auto;">
                    <div class="file-loading">
                        <input id="attchfiles" name="attachment" type="file" class="file" data-preview-file-type="text">
                    </div>
                    <div class="el-form-item ">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary attch_btn">确定</button>
                        </div>
                    </div>
                </form>`,
        success: function () {
            $('#addAttch_form .attch_btn').off('click').on('click', function () {
                actattach(trele);
                layer.close(layerModal);
            });
            if (trele.attr('data-attch')) {
                var attchdata = JSON.parse(trele.attr('data-attch'));
                var preurls = [], predata = [];
                if (attchdata && attchdata.length) {
                    attchdata.forEach(function (item) {
                        var url = window.storage + item.path, preview = '';
                        var path = item.path.split('/');
                        var name = item.filename;
                        if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
                            preview = `<img width="60" height="60" src="${url}" data-name="${item.filename}" data-size="${item.size}" data-creator="${item.creator_name || ''}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
                        } else {
                            preview = `<div class='file-preview-text existAttch' data-name="${item.filename}" data-size="${item.size}" data-creator="${item.creator_name || ''}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                      <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                      </div>`;
                        }
                        var pitem = {
                            caption: name,
                            size: Number(item.size)
                        };
                        preurls.push(preview);
                        predata.push(pitem);
                    });
                }
                stepattchfileinit('attchfiles', preurls, predata);
                setTimeout(function () {
                    if ($('#addAttch_form .existAttch').length) {
                        $('#addAttch_form .existAttch').each(function () {
                            var pele = $(this).parents('.file-preview-frame');
                            pele.attr({
                                'data-url': $(this).attr('data-url'),
                                'attachment_id': $(this).attr('attachment_id'),
                                'data-creator': $(this).attr('data-creator'),
                                'data-name': $(this).attr('data-name'),
                                'data-size': $(this).attr('data-size')
                            });
                            var cname = $(this).attr('data-creator');
                            pele.find('.fujiantext').text($(this).attr('comment'));
                            pele.find('.creator').html(`<p>${cname}</p>`);
                            pele.addClass('init-success-file');
                        });
                    }
                }, 500);
            } else {
                stepattchfileinit('attchfiles', [], []);
            }
        },
        cancel: function () {
            actattach(trele);
        }
    })

}

function findMakeval(val) {
    return rnodes.makes.filter(function (e) {
        return e.name.indexOf(val) > -1;
    });
}

function findMakecode(val) {
    return rnodes.makes.filter(function (e) {
        return e.code.indexOf(val.toUpperCase()) > -1;
    });
}

function getPracticeImg(pracid) {
    $('#img_select_form .table_tbody').html('');
    var urlLeft = '';
    for (var param in ajaxImgData) {
        urlLeft += `&${param}=${ajaxImgData[param]}`;
    }
    urlLeft += "&page_no=" + img_page_no + "&page_size=8";
    AjaxClient.get({
        url: URLS['bomAdd'].practiceImg + '?' + _token + '&practice_id=' + pracid + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;
            if (pageTotal > 8) {
                bindImgPagenationClick(pageTotal, 8);
            } else {
                $('#pagenation').html('');
            }
            if (rsp.results && rsp.results.length) {
                createImgHtml($('#img_select_form .table_tbody'), rsp.results);
            } else {
                var tr = `<tr><td colspan="7" style="text-align: center;color: #999;">暂无数据</td></tr>`;

                $('#img_select_form .table_tbody').html(tr);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

//分页
function bindImgPagenationClick(total, size) {
    $('#pagenation.img').show();
    $('#pagenation.img').pagination({
        totalData: total,
        showData: size,
        current: img_page_no,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            img_page_no = api.getCurrent();
            if ($('.image-select .img-s-check.is-checked').attr('data-name') == 'make') {
                var pracid = $('.make_list_all .make-item.selected').attr('data-id');
                getPracticeImg(pracid);
            } else {
                getImageSource();
            }
        }
    });
}

function getImageSource() {
    $('#img_select_form .table_tbody').html('');
    var urlLeft = '';
    for (var param in ajaxImgData) {
        urlLeft += `&${param}=${ajaxImgData[param]}`;
    }
    urlLeft += "&page_no=" + img_page_no + "&page_size=8";
    AjaxClient.get({
        url: URLS['bomAdd'].imageIndex + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
			// mao
			// getChecked();

            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;
            if (pageTotal > 8) {
                bindImgPagenationClick(pageTotal, 8);
            } else {
                $('#pagenation').html('');
            }
            if (rsp.results && rsp.results.length) {
                createImgHtml($('#img_select_form .table_tbody'), rsp.results);
            } else {
                var tr = `<tr><td colspan="7" style="text-align: center;color: #999;">暂无数据</td></tr>`;

                $('#img_select_form .table_tbody').html(tr)
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

//  mao 
// function getChecked() {
// 	arrs = [];
// 	let rbid = window.sessionStorage.getItem('r_b_i_d');
// 	let lgCode = window.localStorage.getItem('lgCodes');
// 	let check = $('.trimgitem .check');

// 	AjaxClient.get({
// 		url: '/Language/getLanImage' + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rbid,
// 		dataType: 'json',
// 		fail: function (res) {
// 			// $('#add-imgs').html('');
// 			let data = res.results;
// 			for(let i=0; i<data.length; i++ ) {
// 				arrs.push(data[i].imageId);
// 			}

// 			window.sessionStorage.setItem('arrs',JSON.stringify(arrs));
// 		}
// 	}, this)

// } 



// 查看图纸详细信息
$('body').on('click', '.btn-img-view', function (e) {
    var drawingId = $(this).attr('data-id');
    getImgInfo(drawingId, 0, 'show');
});
function createImgHtml(ele, data) {
    var ids = getImgIds(imgchecks);
	// let arr = window.sessionStorage.getItem('arrs');
    data.forEach(function (item, index) {
        var imgViewHtml = '';
        if($('.img-s-check.is-checked').attr('data-name') == 'pic') {
            imgViewHtml = `<button type="button" data-id="${item.drawing_id}" class="el-button el-button--primary btn-img-view">查看</button>`;
        }
		var _checkbox = `<span class="el-checkbox_input img-check  ${ids.indexOf(item.drawing_id) > -1 ? 'is-checked' : ''}" data-path="${item.image_path}" data-id="${item.drawing_id}" data-name="${item.name}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
        var tr = ` <tr class="trimgitem">
                    <td class="check">${_checkbox}</td>
                    <td><img class="pic-img" data-src="/storage/${item.image_path}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="96" height="64" src="/storage/${item.image_path}" alt=""></td>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.category_name}</td>
                    <td><div class="overflow" title="${item.description}">${item.description}</div></td>
                    <td>${imgViewHtml}</td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
	})
	
	
}

//获取图纸分类数据
function imgCategory() {
    AjaxClient.get({
        url: URLS['bomAdd'].imageSource + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('#searchForm .el-form-item.imgSource .el-select-dropdown-list').append(lis);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸属性
function getImgSelectAttr(cid, tid) {
    AjaxClient.get({
        url: URLS['bomAdd'].imageAttr + '?' + _token + '&category_id=' + cid + '&group_type_id=' + tid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var ele = $('.el-form-item.template_attr .template_attr_wrap');
                ele.html(' ');
                rsp.results.forEach(function (item, index) {
                    var li = `<div class="attr_item" data-id="${item.attribute_definition_id}">
                            <span class="img_text" title="${item.definition_name}">${item.definition_name}</span>
                            <input type="text" value=""/>
                        </div>`;
                    ele.append(li);
                })
            } else {
                $('.el-form-item.template_attr .template_attr_wrap').html('');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    }, this);
}

//获取图纸分类
function getImgType() {
    AjaxClient.get({
        url: URLS['bomAdd'].imgGroupType + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.image_group_type_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('#searchForm .el-form-item.type .el-select-dropdown-list').append(lis);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸来源列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
//获取图纸分组
function getImgGroupType(id) {
    $('#searchForm .el-form-item.group .el-select').find('.el-input').val('--请选择--');
    $('#searchForm .el-form-item.group .el-select').find('#group_id').val('');
    if (id != '') {
        $('#searchForm .el-form-item.group .el-select-dropdown-list').html('');
        AjaxClient.get({
            url: URLS['bomAdd'].imgGroupSelect + "?" + _token + '&type_id=' + id,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if (rsp && rsp.results && rsp.results.length) {
                    var lis = '<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>';
                    rsp.results.forEach(function (item) {
                        lis += `<li data-id="${item.imageGroup_id}" class="el-select-dropdown-item">${item.name}</li>`;
                    });
                    $('#searchForm .el-form-item.group .el-select-dropdown-list').append(lis);
                } else {
                    var _html = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>`;
                    $('#searchForm .el-form-item.group .el-select-dropdown-list').html(_html);
                }
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                console.log('获取图纸来源列表失败');
            },
            complete: function () {
                $('#searchForm .submit').removeClass('is-disabled');
            }
        })
    } else {
        var _html = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>`;
        $('#searchForm .el-form-item.group .el-select-dropdown-list').html(_html);
    }
}

function showImageModal(tr_id, state) {
    var labelWidth = 100, btnShow = '';
    var pracele = $('.make_list_all .make-item.selected'), pracid = '-1';
    if (pracele.length) {
        pracid = pracele.attr('data-id');
    }
    selectImgModal = layer.open({
        type: 1,
        title: '选择图纸',
        offset: '10px',
        area: '62%',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="formModal" id="img_select_form" style="min-height:400px;overflow:hidden;">
                    <input type="hidden" id="itemId" value="${tr_id}">
                    <input type="hidden" id="pracid" value="${pracid}">
                    <div class="searchItem" id="searchForm">
                      <form class="searchMAttr searchModal formModal imgModal" id="searchImgAttr_from">
                          <div class="el-item">
                              <div class="el-item-show">
                                  <div class="el-item-align">
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">编码</label>
                                              <input type="text" id="searchCode" class="el-input" placeholder="请输入编码" value="">
                                          </div>
                                      </div>
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">名称</label>
                                              <input type="text" id="searchName" class="el-input" placeholder="请输入名称" value="">
                                          </div>
                                      </div>
                                  </div>
                                  <ul class="el-item-hide">
                                      <li>
                                          <div class="el-form-item category">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">创建人</label>
                                                  <input type="text" id="searchCreator" class="el-input" placeholder="请输入创建人" value="">
                                              </div>
                                          </div>
                                          <div class="el-form-item imgSource">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸来源</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="img_source" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </li>
                                      <li>
                                        <div class="el-form-item type">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸分类</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="type_id" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                        <div class="el-form-item group">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸分组</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="group_id" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                        </div>
                                      </li>
                                      <li>
                                        <div class="el-form-item template_attr" style="">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">图纸属性</label>
                                                <div class="template_attr_wrap clearfix"></div>
                                            </div>
                                        </div>
                                      </li>
                                  </ul>
                              </div>
                              <div class="el-form-item">
                                  <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                      <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                      <button type="button" class="el-button choose-search">搜索</button>
                                      <button type="button" class="el-button upload_select_img">上传图纸</button>
                                  </div>
                              </div>
                          </div>
                      </form>
                    </div>
                    <div class="image-select">
                        <span class="el-checkbox_input img-s-check is-checked" data-name="pic">
                            <span class="el-checkbox-outset"></span>
                            <span class="el-checkbox__label">图库图纸</span>
                        </span>
                        <span class="el-checkbox_input img-s-check" data-name="make">
                           <span class="el-checkbox-outset"></span>
                           <span class="el-checkbox__label">做法库图纸</span>
                        </span>
                    </div>
                    <div class="img_list table_page">
                        <div id="pagenation" class="pagenation img"></div>
                        <div style="height: 580px; padding-right: 20px;">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                    <tr>
                                        <th>选择</th>
                                        <th>缩略图</th>
                                        <th>图纸编码</th>
                                        <th>图纸名称</th>
                                        <th>图纸来源</th>
                                        <th>备注</th>
                                        <th class="op-view"></th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                
                                </tbody>
                            </table>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <!--<button type="button" class="el-button cancle">取消</button>-->
                            <button type="button" class="el-button el-button--primary select_img_btn" data-state="${state}">确定</button>
                        </div>
                    </div>
                    
        </div>`,
        success: function (layero, index) {
            // getPracticeImg(pracid);
            getImageSource();
            imgCategory();
            getImgType();
        },
        end: function () {
            ajaxImgData = { order: 'desc', sort: 'ctime' }
        }
    })
}
//获取图纸详情
function getImgInfo(id, imgPlanId, actionState, stepId) {
    AjaxClient.get({
        url: URLS['bomAdd'].imgshow + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                imgDeModal(rsp.results, 1, actionState, imgPlanId, stepId);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸详情失败');
        }
    }, this);
}
var transformStyle = {
    rotate: "rotate(0deg)",
    scale: "scale(1)",
};
function zoomPcIMG(flag) {
    $("body").css("overflow-y", "hidden");
    if (flag == 'all') {
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#imgWrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"), true);
            });
        } else {
            $("#imgWrap").on("mousewheel", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"));
            });
        }
    } else {
        var imgele = $("#image_form .pic-detail-wrap").find('img');
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#image_form .pic-detail-wrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, imgele, true);
            });
        } else {
            $("#image_form .pic-detail-wrap").on("mousewheel", function (e) {
                wheelZoom(e, imgele);
            });
        }
    }
}
function wheelZoom(e, obj, isFirefox) {
    var zoomDetail = e.originalEvent.wheelDelta;
    if (isFirefox) {
        zoomDetail = -e.originalEvent.detail;
    }
    zoomPic(zoomDetail, $(obj));
}
function zoomPic(zoomDetail, obj) {
    var scale = Number($(obj).attr("data-scale"));
    if (zoomDetail > 0) {
        scale = scale + 0.05;
    } else {
        scale = scale - 0.05;
    }
    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.1) {
        scale = 0.1;
    }
    obj.attr("data-scale", scale.toFixed(2));
    transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}
function rotatePic(obj) {
    var rotate = Number($(obj).attr("data-rotate")) || 0;
    rotate += 90;
    if (rotate >= 360) {
        rotate = 0;
    }
    obj.attr("data-rotate", rotate);
    transformStyle.rotate = 'rotate(' + rotate + 'deg)';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}

function imgDeModal(data, flag, actionState, imgPlanId, stepId) {
    let imgList = [];
    let imgListHtml = '';
    imgList = data.groupDrawing || [];
    if(imgList.length) {
        imgList.forEach(item => {
            let propertiesHtml = '';
            if(item.attributes.length) {
                let propData = item.attributes;
                propData.forEach(function(item) {
                    propertiesHtml+=`<div><span>${item.definition_name}</span>：<span>${item.value}</span></div>`;
                });
            }
            let linkHtml = '';
            if (item.links.length) {
                item.links.forEach(function(item) {
                    linkHtml+=`<div><span>${item.code}</span></div>`;
                })
            }
            imgListHtml+= `
                <tr class="trimgitem">
                    <td>
                        <span class="el-checkbox_input img-plan-check ${imgPlanId==item.id?'is-checked':''}" data-path="${item.image_path}" data-id="${item.id}" data-name="${item.name}">
                            <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                    <td><img class="pic-img" data-src="/storage/${item.image_path}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="96" height="64" src="/storage/${item.image_path}" alt=""></td>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${propertiesHtml}</td>
                    <td>${linkHtml}</td>
                </tr> 
            `;
        })
    } else {
        imgListHtml = '<tr class="trimgitem"><td colspan="5" style="text-align: center;color: #999;">暂无数据</td></tr>';
    }

    transformStyle = {
        rotate: "rotate(0deg)",
        scale: "scale(1)",
    };
    var { image_orgin_name = '', code = '', name = '', category_name = '', group_name = '', comment = '', attributes = [] } = {};
    if (data) {
        ({ image_orgin_name='', code='', name='', category_name='', group_name='', comment='', attributes=[] } = data)
    }
    var attr_html = showAttrs(attributes);

    var img = new Image(),
        imgsrc = '',
        attribute = {},
        wwidth = document.documentElement.clientWidth,
        wheight = document.documentElement.clientHeight - 100;
    if (flag) {
        img.src = imgsrc = window.storage + data.image_path;
        if (data.attribute) {
            attribute = data.attribute;
        }
    } else {
        img.src = imgsrc = data;
    }
    var nwidth = img.width > wwidth ? (wwidth * 0.8) : (img.width),
        nheight = img.height + 170 > wheight ? (Number(wheight - 80)) : (img.height + 90);
    nwidth < 500 ? nwidth = 620 : null;
    nheight < 400 ? nheight = 400 : null;
    var mwidth = nwidth + 'px',
        mheight = nheight + 'px';
    planImgModal = layer.open({
        type: 1,
        title: '图纸详细信息',
        offset: '100px',
        area: ['60%', mheight],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<div class="pic-wrap-container">
                    <div class="pic-wrap">
                        <div class="el-tap-img-wrap">
                            <span data-item="image_form" class="el-tap active">图纸</span>
                            <span data-item="basic_form" class="el-tap">属性信息</span> 
                            ${actionState=='edit'?`<span data-item="img_plan" class="el-tap">排版图</span>`:''}
                        </div>  
                        <div class="el-panel-img-wrap" style="padding-top: 10px;">
                            <div class="el-img-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight - 130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
                                </div>
                            </div>
                            <div class="el-img-panel" id="basic_form">
                                <div class="imginfo">
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">编码:</label>
                                            <span>${code}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">名称:</label>
                                            <span>${name}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸来源:</label>
                                            <span>${tansferNull(category_name)}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸分组名称:</label>
                                            <span>${tansferNull(group_name)}</span>
                                        </div> 
                                    </div>
                                     <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸注释:</label>
                                            <span>${comment}</span>
                                        </div> 
                                    </div>
                                    ${attr_html}
                                </div> 
                            </div>
                            <div id="img_plan" class="el-img-panel">
                                <input type="hidden" id="stepId" value="${stepId}">
                                <div style="height: 260px; overflow-y: scroll;">
                                    <table class="sticky uniquetable commontable">
                                        <thead>
                                            <tr>
                                                <th>选择</th>
                                                <th>缩略图</th>
                                                <th>图纸编码</th>
                                                <th>图纸名称</th>
                                                <th style="width: 160px;">图纸属性</th>
                                                <th>组合图</th>
                                            </tr>
                                        </thead>
                                        <tbody class="table_tbody"> 
                                            ${imgListHtml}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="el-form-item el-form-item-div btn-group" style="margin-top: 20px;">
                                    <button type="button" class="el-button el-button--primary btn-img-plan" data-id='${imgPlanId}' data-drawingId='${data.drawing_id}'>确定</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,
        success: function () {
            var imgObj = $('<img src="' + imgsrc + '" alt="" />');
            img.onload = function () {
                imgObj.css({
                    "left": (nwidth - img.width) / 2,
                    "top": (nheight - img.height - 130) / 2,
                    'height': img.height + 'px',
                });
                imgObj.attr({ "data-scale": 1, "data-rotate": 0 });
                if (img.width > nwidth || img.height > (nheight - 130)) {
                    var widthscale = nwidth / img.width,
                        heightscale = nheight / img.height,
                        scale = Math.max(Math.min(widthscale, heightscale), 0.1),
                        imgHeight = img.height * scale;
                    imgObj.attr("data-scale", scale.toFixed(2));
                    transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
                    imgObj.css({
                        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                        "transform": transformStyle.rotate + " " + transformStyle.scale,
                        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                    });
                }
            }
            imgObj.on({
                "mousedown": function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    isMove = false;
                    var mTop = e.clientY;
                    var mLeft = e.clientX;
                    var oTop = parseFloat($(this).css("top"));
                    var oLeft = parseFloat($(this).css("left"));
                    var disTop = mTop - oTop;
                    var disLeft = mLeft - oLeft;
                    var that = $(this);
                    that.css({
                        "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                    });
                    $(document).on("mousemove", function (event) {
                        isMove = true;
                        var x = event.clientX;
                        var y = event.clientY;
                        var posX = x - disLeft;
                        var posY = y - disTop;
                        that.css({
                            "top": posY + "px",
                            "left": posX + "px"
                        });
                    });
                }
            });
            $(document).on("mouseup", function (e) {
                $(document).off("mousemove");
                $(document).off("mousedown");
                $(imgObj).css({
                    "cursor": "url(images/cur/openhand.cur) 8 8, default"
                });
            });
            $('.pic-detail-wrap').append(imgObj);
            zoomPcIMG('pop');
        },
        end: function () {
            $("body").css("overflow-y", "auto");
        }
    })
}
function showBigImg(e, current) {
    var imgList = e;
    var modelBg = $("#pcToolBG");
    if (modelBg.length) {
        modelBg.remove();
    }
    modelBg = $('<div id="pcToolBG"></div>');
    var closeBtn = $('<span class="el-icon closeModel"></span>');
    // modelBg.append(closeBtn);
    closeBtn.on("click", closeBg);
    var target = $('<ul id="imgWrap"></ul>');
    modelBg.append(target);
    var actions = $('<div id="el-action" class="el-action"><i class="el-icon fa-search-plus all"></i><i class="el-icon fa-search-minus all"></i><i class="el-icon fa-rotate-right all"></i></div>');
    modelBg.append(actions);
    modelBg.on("click", closeBg);
    var left = $(`<div id="el-left-action" style="display: ${imgList.length == 1 ? 'none' : 'block'}" class="el-action"><i class="el-icon fa-chevron-circle-left"></i></div>`);
    var right = $(`<div id="el-right-action" style="display: ${imgList.length == 1 ? 'none' : 'block'}" class="el-action"><i class="el-icon fa-chevron-circle-right"></i></div>`);
    modelBg.append(left).append(right);
    $("body").append(modelBg);
    initImgList(imgList, target, current);
    zoomPcIMG('all');
    $('#el-action').on('click', '.fa-search-plus.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        zoomPic(1, $('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click', '.fa-search-minus.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        zoomPic(-1, $('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click', '.fa-rotate-right.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        rotatePic($('#imgWrap .current .zoomImg'));
    });
    $('#el-left-action:not(.is-disabled)').on('click', function () {
        $('#el-right-action').removeClass('is-disabled');
        var cur = $('#imgWrap .current').index();
        if (cur == 0) {
            $(this).addClass('is-disabled');
        } else {
            defaultStatus($('#imgWrap .current img'));
            $('#imgWrap li').eq(cur - 1).addClass('current').siblings('li').removeClass('current');
        }
    });
    $('#el-right-action:not(.is-disabled)').on('click', function () {
        $('#el-left-action').removeClass('is-disabled');
        var cur = $('#imgWrap .current').index();
        if (cur + 1 == $('#imgWrap li').length) {
            $(this).addClass('is-disabled');
        } else {
            defaultStatus($('#imgWrap .current img'));
            $('#imgWrap li').eq(cur + 1).addClass('current').siblings('li').removeClass('current');
        }
    });
}
function defaultStatus(currImg) {
    transformStyle.scale = "scale(1)";
    transformStyle.rotate = "rotate(0deg)";
    currImg.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale,
        "left": (document.documentElement.clientWidth - currImg.width()) / 2,
        "top": (document.documentElement.clientHeight - currImg.height()) / 2
    });
    var scale = 1;
    currImg.attr("data-scale", scale);
}
function initImgList(imgList, target, current) {
    var isMove = false;
    imgList.each(function () {
        var imgSrc = $(this).attr("data-src"),
            dataId = $(this).attr('data-id');
        var imgItem = $('<li data-id="' + dataId + '"><img class="zoomImg" data-scale="1" data-rotate="0" src="' + imgSrc + '" alt=""></li>');
        var imgObj = imgItem.find("img");
        //设置图纸初始大小
        var img = new Image();
        img.src = imgSrc;
        img.onload = function () {
            imgObj.css({
                "left": (document.documentElement.clientWidth - img.width) / 2,
                "top": (document.documentElement.clientHeight - img.height) / 2,
                'height': img.height
            });
            if (img.width > document.documentElement.clientWidth || img.height > document.body.clientHeight) {
                var widthscale = document.documentElement.clientWidth / img.width*0.8,
                    heightscale = document.documentElement.clientHeight / img.height*0.8,
                    scale = Math.max(Math.min(widthscale, heightscale), 0.1);
                imgObj.attr("data-scale", scale.toFixed(2));
                transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
                imgObj.css({
                    "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                    "transform": transformStyle.rotate + " " + transformStyle.scale,
                    "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                });
            }
        }
        imgObj.on({
            "mousedown": function (e) {
                e.preventDefault();
                e.stopPropagation();
                isMove = false;
                var mTop = e.clientY;
                var mLeft = e.clientX;
                var oTop = parseFloat($(this).css("top"));
                var oLeft = parseFloat($(this).css("left"));
                var disTop = mTop - oTop;
                var disLeft = mLeft - oLeft;
                var that = $(this);
                that.css({
                    "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                });
                $(document).on("mousemove", function (event) {
                    isMove = true;
                    var x = event.clientX;
                    var y = event.clientY;
                    var posX = x - disLeft;
                    var posY = y - disTop;
                    that.css({
                        "top": posY + "px",
                        "left": posX + "px"
                    });
                });
            }
        });
        $(document).on("mouseup", function (e) {
            $(document).off("mousemove");
            $(document).off("mousedown");
            $(imgObj).css({
                "cursor": "url(images/cur/openhand.cur) 8 8, default"
            });
        });
        target.append(imgItem);
    });
    target.find('li[data-id=' + current + ']').addClass('current');
}
function closeBg(e) {
    if (e.target.tagName.toLowerCase() != "img" && e.target.tagName.toLowerCase() != "i") {
        $("body").css("overflow-y", "auto");
        var currImg = $("#imgWrap .zoomImg");
        defaultStatus(currImg);
        $("#pcToolBG").remove();
    }
}
function showAttrs(data) {
    var _html = '';
    if (data.length) {
        data.forEach(function (item) {
            _html += `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>`
        })
    }
    return _html;
}

function getPreview(rnid) {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
        rid = $('#route_id').val();
    AjaxClient.get({
        url: URLS['bomAdd'].preview + "?" + _token + "&bom_id=" + bid + "&routing_id=" + rid + "&routing_node_id=" + rnid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                createPreview(rsp.results);
                createPreviewCopy(rsp.results);
                createPreviewDoc(rsp.results);
            } else {
                //暂无数据
                var con = `<div class="no_data_center">暂无数据</div>`
                $('.preview-wrap-container .el-preview-panel').html(con);
            }
            // console.log(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工序预览失败');
        }
    }, this);
}
function getPreviewCopy(rnid) {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
        rid = $('#route_id').val();
    AjaxClient.get({
        url: URLS['bomAdd'].preview + "?" + _token + "&bom_id=" + bid + "&routing_id=" + rid + "&routing_node_id=" + rnid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                createPreviewCopy(rsp.results);
                createPreviewDoc(rsp.results);
            } else {
                //暂无数据
                var con = `<div class="no_data_center">暂无数据</div>`
                $('.preview-wrap-container .el-preview-panel').html(con);
            }
            // console.log(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工序预览失败');
        }
    }, this);
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
              <div class="pre_unit"><span>${mitem.use_num}</span><p>${mitem.commercial}</p></div>
              <div class="pre_unit" style="width: 100px"><span>描述</span><p style="word-wrap: break-word;">${mitem.desc}</p></div>
          </div>`;
    });
    return str;
}

function createPreview(data) {
    var stepBlocks = '', in_flag = '';
    data.forEach(function (item,iindex) {
        var stepItems = '';
        var step_draw = '';
        if (item.step_info && item.step_info.length) {
            item.step_info.forEach(function (sitem, sindex) {

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
                stepItems += `<tr>
                   <td></td>
                   <td>${sitem.index}</td>
                   <td><p>${sitem.name}</p> <p>（${sitem.code}）</p> <p>${sitem.field_description}</p></td>
                   <td align="left">${name_desc}</td>
                   <td>${work_center}</td>
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
                   <td class="pre_bgcolor desc" style="word-break: break-all;min-width:80px;">${tansferNull(sitem.description)}</td>
                   <td class="pre_bgcolor desc" style="word-break: break-all;min-width:80px;">${tansferNull(commentStr)}</td>
                 </tr>`;
                if(sitem.step_drawings && sitem.step_drawings.length){
                    sitem.step_drawings.forEach(function (ditem,index) {
                        var des = '';
                        ditem.attributes.forEach(function (aitem) {
                            if(aitem.value!=''&&aitem.value!="0"){
                                des += aitem.name+':'+aitem.value+'/';
                            }
                        })
                        if(ditem.comment!=''){
                            des+='描述：'+ditem.comment.replace("\n","");
                        }
                        step_draw+=`<div class="preview_draw_wrap" data-url="${ditem.image_path}">
                                     <p>
                                      <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170">
                                     </p>
                                     <p>${ditem.code}</p>
                                     <p style="text-align: center;">
                                      <div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div>
                                     </p>

                                 </div>`
                    });
                }

                if(sitem.composing_drawings && sitem.composing_drawings.length){
                    sitem.composing_drawings.forEach(function (ditem,index) {
                        var des = '';
                        ditem.attributes.forEach(function (aitem) {
                            if(aitem.value!=''&&aitem.value!="0"){
                                des += aitem.name+':'+aitem.value+'/';
                            }
                        });
                        if(ditem.comment!=''){
                            des+='描述：'+ditem.comment.replace("\n","");
                        }
                        step_draw+=`<div class="preview_draw_wrap" data-url="${ditem.image_path}">
                                     <p>
                                      <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170">
                                     </p>
                                     <p>${ditem.code}</p>
                                     <p style="text-align: center;">
                                      <div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div>
                                     </p>

                                 </div>`
                    });
                }
            })
        }

        stepBlocks += `<div class="route_preview_container">
                    <table>
                        <thead>
                          <tr>
                              <th style="width:45px;">
                                <span class="el-checkbox_input checkbox_opeartion_step" data-opeartion_step="${iindex}">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                              </th>
                              <th style="width:45px;">序号</th>
                              <th style="width:60px;">步骤</th>
                              <th style="width:200px;">能力</th>
                              <th>工作中心</th>
                              <th>进料</th>
                              <th>出料</th>
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
    });
    if (stepBlocks) {
        $('.preview-wrap-container .el-preview-panel').html(stepBlocks);
    } else {
        $('.preview-wrap-container .el-preview-panel').html('');
    }
}

function cpreviewAttrCopy(data, flag) {
    var bgColor = '', str = '';
    if (flag == 'in') {
        bgColor = 'ma_in';
    } else {
        bgColor = 'ma_out';
    }
    data.forEach(function (mitem,index) {
        var ma_attr = '', ma_attr_container = '';
        if (mitem.attributes && mitem.attributes.length) {
            mitem.attributes.forEach(function (aitem) {
                if (aitem.from == 'erp') {
                    aitem.commercial = "null";
                }
                ma_attr += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial == 'null' ? '' : [aitem.commercial]}</td></tr>`;
            });
            if(mitem.use_num&&mitem.commercial){
                ma_attr += `<tr><td>用量</td><td style="word-break: break-all;">${mitem.use_num}${mitem.commercial == 'null' ? '' : [mitem.commercial]}</td></tr>`;

            }
            ma_attr_container = `<table>${ma_attr}</table>`;
        } else {
            ma_attr = `<span>暂无数据</span>`;
            ma_attr_container = `<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
        }
        str += `<div class="route_preview_material ${bgColor} ${(index+1)%3==1?'checkline':''}" style="width: 32%">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <!-- <div class="pre_code"><span>${mitem.use_num}</span><p>${mitem.commercial}</p></div>-->
              <div class="pre_code"><span>描述:</span><p>${mitem.desc}</p></div>
          </div>`;
    });
    return str;
}

function createPreviewCopy(data) {
    //上个版本，暂时保留。


    //当前版本
    var wwidth = document.documentElement.clientWidth,
    imwidth = (wwidth - 322)/2,
    imheight = imwidth*365/555;

    var _thml='';
    var table_arr = [];
    if(data.length==1){
        var material_in_html = [],material_out_html = [];

        data.forEach(function (ditem) {
            var stepItems = '';
            var drawing_str = '';
            if (ditem.step_info && ditem.step_info.length) {
                ditem.step_info.forEach(function (item) {
                    var material_in = getFilterPreviewDataCopy(item.material, 1),
                        material_out = getFilterPreviewDataCopy(item.material, 2);
                    if(material_in.length>0){
                        material_in.forEach(function (imitem) {
                            var mattr = '';
                            if(imitem.attributes.length>0){
                                imitem.attributes.forEach(function (maitem) {
                                    if(maitem.value!=''&&maitem.value!='0'){
                                        mattr += maitem.name+'：'+maitem.value+'  /  ';
                                    }
                                })
                            }
                            if(imitem.use_num){
                                mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_in_html.push( `<table style="table-layout:fixed;"><tr>
                                        <td style="width: 100px;word-wrap:break-word;word-break:break-all;">物料编码：</td>
                                        <td>${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                    </tr>
                                    <tr>
                                        <td>物料名称：</td>
                                        <td>${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td>物料备注：</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr></table>`);
                        })
                    };
                    if(material_out.length>0){
                        material_out.forEach(function (imitem) {
                            var mattr = '';
                            if(imitem.attributes.length>0){
                                imitem.attributes.forEach(function (maitem) {
                                    if(maitem.value!=''&&maitem.value!='0'){
                                        mattr += maitem.name+'：'+maitem.value+'  /  ';
                                    }
                                })
                            }
                            if(imitem.use_num){
                                mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_out_html.push( `<table style="table-layout:fixed;"><tr><td style="width: 140px;word-wrap:break-word;word-break:break-all;">序号</td><td>尺寸/数量</td></tr><tr>
                                        <td>${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr></table>`);
                        })
                    }
                    var step_drawings_html = '';
                    if(item.step_drawings && item.step_drawings.length){
                        item.step_drawings.forEach(function (ditem,index) {
                            drawing_str += ditem.code+'；/';
                            var des = '';
                            ditem.attributes.forEach(function (aitem) {
                                if(aitem.value!=''&&aitem.value!="0"){
                                    des += aitem.name+':'+aitem.value+'/';
                                }
                            })
                            if(ditem.comment!=''){
                                des+='描述：'+ditem.comment.replace("\n","");
                            }
                            step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
				 <p>
                     <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                 </p>
				 <p style="cursor: pointer;">${ditem.code}</p>
				 <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
				 </div>`
                        });
                    }

                    if(item.composing_drawings && item.composing_drawings.length){
                        item.composing_drawings.forEach(function (ditem,index) {
                            drawing_str += ditem.code+'；/';
                            var des = '';
                            ditem.attributes.forEach(function (aitem) {
                                if(aitem.value!=''&&aitem.value!="0"){
                                    des += aitem.name+':'+aitem.value+'/';
                                }
                            });
                            if(ditem.comment!=''){
                                des+='描述：'+ditem.comment.replace("\n","");
                            }
                            step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
				 <p>
				    <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                 </p>
				 <p style="cursor: pointer;">${ditem.code}</p>
				 <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
				 </div>`
                        });
                    }

                        _thml += `
                        <div style="border-bottom: 1px solid black;" class="route_preview_container cut_out">
						<h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
						${(item.description!=''&&item.description!=null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center;">标准工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.description)}</div>
								</div>
							</div>
						</div>`:''}
						${(item.comment!=''&&item.comment!==null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">特殊工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.comment)}</div>
								</div>
							</div>
						</div>`:''}
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">工艺图片</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${step_drawings_html}
								</div>
							</div>
						</div>
						
					</div>
					`;



                })
            }

        });
        var tr = '';
        for(var i = 0; i < material_in_html.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;" >${tansferNull(material_in_html[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;">${tansferNull(material_in_html[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;">${tansferNull(material_in_html[i+2])}</td></tr>` ;
            i=i+3;
        };
        tr +=`<tr><td colspan="3" style="height: 30px;"></td></tr>`
        for(var i = 0; i < material_out_html.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;" >${tansferNull(material_out_html[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;">${tansferNull(material_out_html[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;">${tansferNull(material_out_html[i+2])}</td></tr>` ;
            i=i+3;
        };
        var _mtable = `<table style="margin-bottom: 10px;">${tr}</table>`;
    }
    if(data.length>1){
        if(opeartion_ids.length==0){
            data.forEach(function (ditem) {
                var stepItems = '';
                var drawings_str = '';

                var material_in_html = '',material_out_html = `<tr><td>序号</td><td>尺寸/数量</td></tr>`;
                if (ditem.step_info && ditem.step_info.length) {
                    ditem.step_info.forEach(function (item) {
                        var material_in = getFilterPreviewDataCopy(item.material, 1),
                            material_out = getFilterPreviewDataCopy(item.material, 2);
                        if(material_in.length>0){
                            material_in.forEach(function (imitem) {
                                var mattr = '';
                                if(imitem.use_num){
                                    mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                                }
                                if(imitem.use_num){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_in_html += `<tr>
                                        <td>物料编码：</td>
                                        <td>${tansferNull(imitem.material_code)}</td>
                                    </tr>
                                    <tr>
                                        <td>物料名称：</td>
                                        <td>${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td>物料备注：</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr>`;
                            })
                        };
                        if(material_out.length>0){
                            material_out.forEach(function (imitem) {
                                var mattr = '';
                                if(imitem.attributes.length>0){
                                    imitem.attributes.forEach(function (maitem) {
                                        if(maitem.value!=''&&maitem.value!='0'){
                                            mattr += maitem.name+'：'+maitem.value+'  /  ';
                                        }
                                    })
                                }
                                if(imitem.use_num){
                                    mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                                }
                                if(imitem.desc){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_out_html += `<tr>
                                        <td>${tansferNull(imitem.material_code)}</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr>`;
                            })
                        }
                        var step_drawings_html = '';
                        if(item.step_drawings && item.step_drawings.length){
                            item.step_drawings.forEach(function (ditem,index) {
                                drawings_str += ditem.code+'；/';
                                var des = '';
                                ditem.attributes.forEach(function (aitem) {
                                    if(aitem.value!=''&&aitem.value!="0"){
                                        des += aitem.name+':'+aitem.value+'/';
                                    }
                                })
                                if(ditem.comment!=''){
                                    des+='描述：'+ditem.comment.replace("\n","");
                                }
                                step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`
                            });
                        }

                        if(item.composing_drawings && item.composing_drawings.length){
                            item.composing_drawings.forEach(function (ditem,index) {
                                drawings_str += ditem.code+'；/'
                                var des = '';
                                ditem.attributes.forEach(function (aitem) {
                                    if(aitem.value!=''&&aitem.value!="0"){
                                        des += aitem.name+':'+aitem.value+'/';
                                    }
                                });
                                if(ditem.comment!=''){
                                    des+='描述：'+ditem.comment.replace("\n","");
                                }
                                step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                     <p>
                                                        <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                                                     </p>
                                                     <p style="cursor: pointer;">${ditem.code}</p>
                                                     <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                     </div>`
                            });
                        }

                        _thml += `
                        <div style="border-bottom: 1px solid black;" class="route_preview_container cut_out">
						<h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
						${(item.description!=''&&item.description!=null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center;">标准工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.description)}</div>
								</div>
							</div>
						</div>`:''}
						${(item.comment!=''&&item.comment!==null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">特殊工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.comment)}</div>
								</div>
							</div>
						</div>`:''}
						${step_drawings_html!=''?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">工艺图片</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${step_drawings_html}
								</div>
							</div>
						</div>`:''}
						
						
					</div>
					`;



                    })
                }
                var _table = `<table>${material_in_html}${material_out_html} ${drawings_str!=''?`<tr><td>图片编号：</td><td>${tansferNull(drawings_str)}</td></tr>`:''} </table>`;
                table_arr.push(_table);
            });
        }
        if(opeartion_ids.length>0){
            data.forEach(function (ditem,dindex) {
                if(opeartion_ids.indexOf(dindex+'')>-1){
                    var stepItems = '';
                    var drawings_str = '';

                    var material_in_html = '',material_out_html = `<tr><td>序号</td><td>尺寸/数量</td></tr>`;
                    if (ditem.step_info && ditem.step_info.length) {
                        ditem.step_info.forEach(function (item) {
                            var material_in = getFilterPreviewDataCopy(item.material, 1),
                                material_out = getFilterPreviewDataCopy(item.material, 2);
                            if(material_in.length>0){
                                material_in.forEach(function (imitem) {
                                    var mattr = '';
                                    if(imitem.use_num){
                                        mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                                    }
                                    if(imitem.use_num){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_in_html += `<tr>
                                        <td>物料编码：</td>
                                        <td>${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                    </tr>
                                    <tr>
                                        <td>物料名称：</td>
                                        <td>${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td>物料备注：</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr>`;
                                })
                            };
                            if(material_out.length>0){
                                material_out.forEach(function (imitem) {
                                    var mattr = '';
                                    if(imitem.attributes.length>0){
                                        imitem.attributes.forEach(function (maitem) {
                                            if(maitem.value!=''&&maitem.value!='0'){
                                                mattr += maitem.name+'：'+maitem.value+'  /  ';
                                            }
                                        })
                                    }
                                    if(imitem.use_num){
                                        mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                                    }
                                    if(imitem.desc){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_out_html += `<tr>
                                        <td>${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                        <td>${tansferNull(mattr)}</td>
                                    </tr>`;
                                })
                            }
                            var step_drawings_html = '';
                            if(item.step_drawings && item.step_drawings.length){
                                item.step_drawings.forEach(function (ditem,index) {
                                    drawings_str += ditem.code+'；/';
                                    var des = '';
                                    ditem.attributes.forEach(function (aitem) {
                                        if(aitem.value!=''&&aitem.value!="0"){
                                            des += aitem.name+':'+aitem.value+'/';
                                        }
                                    })
                                    if(ditem.comment!=''){
                                        des+='描述：'+ditem.comment.replace("\n","");
                                    }
                                    step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`
                                });
                            }

                            if(item.composing_drawings && item.composing_drawings.length){
                                item.composing_drawings.forEach(function (ditem,index) {
                                    drawings_str += ditem.code+'；/'
                                    var des = '';
                                    ditem.attributes.forEach(function (aitem) {
                                        if(aitem.value!=''&&aitem.value!="0"){
                                            des += aitem.name+':'+aitem.value+'/';
                                        }
                                    });
                                    if(ditem.comment!=''){
                                        des+='描述：'+ditem.comment.replace("\n","");
                                    }
                                    step_drawings_html+=`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                     <p>
                                                        <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}">
                                                     </p>
                                                     <p style="cursor: pointer;">${ditem.code}</p>
                                                     <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                     </div>`
                                });
                            }

                            _thml += `
                        <div style="border-bottom: 1px solid black;" class="route_preview_container cut_out">
						<h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
						${(item.description!=''&&item.description!=null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center;">标准工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.description)}</div>
								</div>
							</div>
						</div>`:''}
						${(item.comment!=''&&item.comment!==null)?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">特殊工艺</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="width: 100%;min-height: 30px;padding: 5px;">${tansferNull(item.comment)}</div>
								</div>
							</div>
						</div>`:''}
						${step_drawings_html!=''?`<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;border-top: 1px solid black;">
							<div style="flex: 1;border-right: 1px solid black;text-align: center">工艺图片</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${step_drawings_html}
								</div>
							</div>
						</div>`:''}
						
						
					</div>
					`;



                        })
                    }
                    var _table = `<table>${material_in_html}${material_out_html} ${drawings_str!=''?`<tr><td>图片编号：</td><td>${tansferNull(drawings_str)}</td></tr>`:''} </table>`;
                    table_arr.push(_table);
                }
            });
        }

        var tr = ''
        for(var i = 0; i < table_arr.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;" >${tansferNull(table_arr[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;">${tansferNull(table_arr[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;">${tansferNull(table_arr[i+2])}</td></tr>` ;
            i=i+3;
        }
        var _mtable = `<table style="margin-bottom: 10px;width: 100%;">${tr}</table>`;
    }

    var tab_name = $("#renderDOC").siblings().find(".el-tap.active").html()+'工艺';
    var dlength = '';
    var tstring = '';
    if(opeartion_ids.length>0){
        dlength = data.length;
        opeartion_ids.forEach(function (item) {
            tstring+= dlength+"-"+(Number(item)+1)+"，"
        })
    }
    _thml = `<div>
                <div class="cut_out">
                    <div  style="height: 130px;border: 1px solid black; padding: 20px;margin-bottom: 10px;">
                        <div style="text-align: center;font-size: 30px;font-weight: bold;">梦百合家居科技股份有限公司</div>
                        <div style="text-align: center;font-size: 18px;font-weight: bold;margin-top: 10px;"><div style="display: inline-block">${tab_name}</div><div style="display: inline-block;float: right;">${tstring}</div></div>
                        <div style="display: flex;font-size: 18px;font-weight: bold;margin-top: 10px;"><div><span>产品编码：</span><span>${material_code}</span></div><div style="width: 100px;"></div><div><span>规格：</span><span>${bom_specification}</span></div><div style="width: 100px;"></div><div><span>基础数量：</span><span>${basic_qty}</span></div></div>
                    </div>
                    ${_mtable}
                </div>
                
                ${_thml}
               </div>`;



    if (_thml) {
        $('#doc_list_copy .el-preview-panel').html(_thml);
    } else {
        $('#doc_list_copy .el-preview-panel').html('');
    }
}
function createPreviewDoc(data) {
    //上个版本，暂时保留。
    $('#renderDOC').addClass('is-disabled');
    $('#print').addClass('is-disabled');

    //当前版本
    var wwidth = document.documentElement.clientWidth,
        // imwidth = (wwidth - 322)/2,
        imwidth = 370;
        imheight = imwidth*365/555;

    var _thml='';
    var table_arr = [];
    if(data.length==1){
        var material_in_html = [],material_out_html = [];

        data.forEach(function (ditem) {
            var stepItems = '';
            var drawing_str = '';
            if (ditem.step_info && ditem.step_info.length) {
                ditem.step_info.forEach(function (item) {
                    var material_in = getFilterPreviewDataCopy(item.material, 1),
                        material_out = getFilterPreviewDataCopy(item.material, 2);
                    if(material_in.length>0){
                        material_in.forEach(function (imitem) {
                            var mattr = '';
                            if(imitem.attributes.length>0){
                                imitem.attributes.forEach(function (maitem) {
                                    if(maitem.value!=''&&maitem.value!='0'){
                                        mattr += maitem.name+'：'+maitem.value+'  /  ';
                                    }
                                })
                            }
                            if(imitem.use_num){
                                mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_in_html.push( `<table style="table-layout:fixed;border-right: 1px solid black;border-bottom: 1px solid black;"><tr>
                                        <td style="width: 100px;word-wrap:break-word;word-break:break-all;border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料名称：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料备注：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr></table>`);
                        })
                    };
                    if(material_out.length>0){
                        material_out.forEach(function (imitem) {
                            var mattr = '';
                            if(imitem.attributes.length>0){
                                imitem.attributes.forEach(function (maitem) {
                                    if(maitem.value!=''&&maitem.value!='0'){
                                        mattr += maitem.name+'：'+maitem.value+'  /  ';
                                    }
                                })
                            }
                            if(imitem.use_num){
                                mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_out_html.push( `<table style="table-layout:fixed;border-right: 1px solid black;border-bottom: 1px solid black;"><tr><td style="width: 140px;word-wrap:break-word;word-break:break-all;border-left: 1px solid black;border-top: 1px solid black;">序号</td><td style="border-left: 1px solid black;border-top: 1px solid black;">尺寸/数量</td></tr><tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${imitem.old_code}）</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr></table>`);
                        })
                    }
                    var step_drawings_html = [];
                    var step_drawings_html_table = '';
                    if(item.step_drawings && item.step_drawings.length){
                        item.step_drawings.forEach(function (ditem,index) {
                            if(ditem.is_show==1){
                                drawing_str += ditem.code+'；/';
                                var des = '';
                                ditem.attributes.forEach(function (aitem) {
                                    if(aitem.value!=''&&aitem.value!="0"){
                                        des += aitem.name+':'+aitem.value+'/';
                                    }
                                })
                                if(ditem.comment!=''){
                                    des+='描述：'+ditem.comment.replace("\n","");
                                }
                                $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                    var realWidth = this.width;
                                    var realHeight = this.height;
                                    var showHeight = imwidth*realHeight/realWidth;
                                    console.log(realWidth)
                                    console.log(realHeight)
                                    step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`)
                                })
                            }


                        });
                    }

                    if(item.composing_drawings && item.composing_drawings.length){
                        item.composing_drawings.forEach(function (ditem,index) {
                            drawing_str += ditem.code+'；/';
                            var des = '';
                            ditem.attributes.forEach(function (aitem) {
                                if(aitem.value!=''&&aitem.value!="0"){
                                    des += aitem.name+':'+aitem.value+'/';
                                }
                            });
                            if(ditem.comment!=''){
                                des+='描述：'+ditem.comment.replace("\n","");
                            }
                            $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                var realWidth = this.width;
                                var realHeight = this.height;
                                var showHeight = imwidth*realHeight/realWidth;
                                step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                            <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`)
                            })

                        });
                    }
                    setTimeout(function () {
                        var step_drawings_html_table_tr = '';
                        for(var i = 0; i < step_drawings_html.length; ){
                            step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i])}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${tansferNull(step_drawings_html[i+1])}</td></tr>` ;
                            i=i+2;
                        };
                        step_drawings_html_table =  `<table>${step_drawings_html_table_tr}</table>`


                        _thml += `
                        <div style="border: 1px solid black;" class="route_preview_container cut_out">
						<h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
						<table style="width:100%;border-right: 1px solid black;border-bottom: 1px solid black;">
						    ${(item.description != '' && item.description != null) ?`<tr>
						        <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">标准工艺</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.description)}</td>
                            </tr>`:''}
						    ${(item.comment != '' && item.comment !== null) ?`<tr>
                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">特殊工艺</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.comment)}</td>
                            </tr>`:''}
						    ${step_drawings_html_table!=''?`<tr>
                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">工艺图片</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(step_drawings_html_table)}</td>
                            </tr>`:''}
                        </table>
						
					</div>
					`;

                    },2000)




                })
            }

        });
        var tr = '';
        for(var i = 0; i < material_in_html.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;" >${tansferNull(material_in_html[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(material_in_html[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(material_in_html[i+2])}</td></tr>` ;
            i=i+3;
        };
        tr +=`<tr><td colspan="3" style="height: 30px;border: 1px solid black;"></td></tr>`
        for(var i = 0; i < material_out_html.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;" >${tansferNull(material_out_html[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(material_out_html[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(material_out_html[i+2])}</td></tr>` ;
            i=i+3;
        };
        var _mtable = `<table style="margin-bottom: 10px;border: 1px solid black;">${tr}</table>`;
    }
    if(data.length>1){
        if(opeartion_ids.length==0){
            data.forEach(function (ditem) {
                var stepItems = '';
                var drawings_str = '';

                var material_in_html = '',material_out_html = `<tr><td style="border-left: 1px solid black;border-top: 1px solid black;">序号</td><td style="border-left: 1px solid black;border-top: 1px solid black;">尺寸/数量</td></tr>`;
                if (ditem.step_info && ditem.step_info.length) {
                    ditem.step_info.forEach(function (item) {
                        var material_in = getFilterPreviewDataCopy(item.material, 1),
                            material_out = getFilterPreviewDataCopy(item.material, 2);
                        if(material_in.length>0){
                            material_in.forEach(function (imitem) {
                                var mattr = '';
                                if(imitem.use_num){
                                    mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                                }
                                if(imitem.use_num){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_in_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料名称：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料备注：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
                            })
                        };
                        if(material_out.length>0){
                            material_out.forEach(function (imitem) {
                                var mattr = '';
                                if(imitem.attributes.length>0){
                                    imitem.attributes.forEach(function (maitem) {
                                        if(maitem.value!=''&&maitem.value!='0'){
                                            mattr += maitem.name+'：'+maitem.value+'  /  ';
                                        }
                                    })
                                }
                                if(imitem.use_num){
                                    mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                                }
                                if(imitem.desc){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_out_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
                            })
                        }
                        var step_drawings_html = [];
                        var step_drawings_html_table = '';
                        if(item.step_drawings && item.step_drawings.length){
                            item.step_drawings.forEach(function (ditem,index) {
                                if(ditem.is_show==1){
                                    drawings_str += ditem.code+'；/';
                                    var des = '';
                                    ditem.attributes.forEach(function (aitem) {
                                        if(aitem.value!=''&&aitem.value!="0"){
                                            des += aitem.name+':'+aitem.value+'/';
                                        }
                                    })
                                    if(ditem.comment!=''){
                                        des+='描述：'+ditem.comment.replace("\n","");
                                    }
                                    $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                        var realWidth = this.width;
                                        var realHeight = this.height;
                                        var showHeight = imwidth*realHeight/realWidth;
                                        step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`)
                                    })
                                }
                            });
                        }

                        if(item.composing_drawings && item.composing_drawings.length){
                            item.composing_drawings.forEach(function (ditem,index) {
                                drawings_str += ditem.code+'；/'
                                var des = '';
                                ditem.attributes.forEach(function (aitem) {
                                    if(aitem.value!=''&&aitem.value!="0"){
                                        des += aitem.name+':'+aitem.value+'/';
                                    }
                                });
                                if(ditem.comment!=''){
                                    des+='描述：'+ditem.comment.replace("\n","");
                                }
                                $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                    var realWidth = this.width;
                                    var realHeight = this.height;
                                    var showHeight = imwidth*realHeight/realWidth;
                                    step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                     <p>
                                                        <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                     </p>
                                                     <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                     <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                     </div>`)
                                })

                            });
                        }
                        setTimeout(function () {
                            var step_drawings_html_table_tr = '';
                            for(var i = 0; i < step_drawings_html.length; ){
                                step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i])}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${tansferNull(step_drawings_html[i+1])}</td></tr>` ;
                                i=i+2;
                            };
                            step_drawings_html_table =  `<table>${step_drawings_html_table_tr}</table>`;
                            _thml += `
                        <div style="border: 1px solid black;" class="route_preview_container cut_out">
						<h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
						<table style="width:100%;border-right: 1px solid black;border-bottom: 1px solid black;">
						    ${(item.description != '' && item.description != null) ?`<tr>
						        <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">标准工艺</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.description)}</td>
                            </tr>`:''}
						    ${(item.comment != '' && item.comment !== null) ?`<tr>
                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">特殊工艺</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.comment)}</td>
                            </tr>`:''}
						    ${step_drawings_html_table!=''?`<tr>
                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">工艺图片</td>
						        <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(step_drawings_html_table)}</td>
                            </tr>`:''}
                        </table>
						
						
					</div>
					`;
                        },2000)

                    })
                }
                var _table = `<table style="border-right: 1px solid black;border-bottom: 1px solid black;">${material_in_html}${material_out_html} ${drawings_str!=''?`<tr><td style="border-left: 1px solid black;border-top: 1px solid black;">图片编号：</td><td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(drawings_str)}</td></tr>`:''} </table>`;
                table_arr.push(_table);
            });
        }
        if(opeartion_ids.length>0){
            data.forEach(function (ditem,dindex) {
                if(opeartion_ids.indexOf(dindex+'')>-1){
                    var stepItems = '';
                    var drawings_str = '';

                    var material_in_html = '',material_out_html = `<tr><td style="border-left: 1px solid black;border-top: 1px solid black;">序号</td><td style="border-left: 1px solid black;border-top: 1px solid black;">尺寸/数量</td></tr>`;
                    if (ditem.step_info && ditem.step_info.length) {
                        ditem.step_info.forEach(function (item) {
                            var material_in = getFilterPreviewDataCopy(item.material, 1),
                                material_out = getFilterPreviewDataCopy(item.material, 2);
                            if(material_in.length>0){
                                material_in.forEach(function (imitem) {
                                    var mattr = '';
                                    if(imitem.use_num){
                                        mattr += '用量：'+imitem.use_num+imitem.commercial+'；';
                                    }
                                    if(imitem.use_num){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_in_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料名称：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_name)}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料备注：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
                                })
                            };
                            if(material_out.length>0){
                                material_out.forEach(function (imitem) {
                                    var mattr = '';
                                    if(imitem.attributes.length>0){
                                        imitem.attributes.forEach(function (maitem) {
                                            if(maitem.value!=''&&maitem.value!='0'){
                                                mattr += maitem.name+'：'+maitem.value+'  /  ';
                                            }
                                        })
                                    }
                                    if(imitem.use_num){
                                        mattr += '用量：'+imitem.use_num+imitem.commercial+' / ';
                                    }
                                    if(imitem.desc){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_out_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
                                })
                            }
                            var step_drawings_html = [];
                            var step_drawings_html_table = '';
                            if(item.step_drawings && item.step_drawings.length){
                                item.step_drawings.forEach(function (ditem,index) {
                                    if(ditem.is_show==1){
                                        drawings_str += ditem.code+'；/';
                                        var des = '';
                                        ditem.attributes.forEach(function (aitem) {
                                            if(aitem.value!=''&&aitem.value!="0"){
                                                des += aitem.name+':'+aitem.value+'/';
                                            }
                                        })
                                        if(ditem.comment!=''){
                                            des+='描述：'+ditem.comment.replace("\n","");
                                        }
                                        $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                            var realWidth = this.width;
                                            var realHeight = this.height;
                                            var showHeight = imwidth*realHeight/realWidth;
                                            console.log(realWidth)
                                            console.log(realHeight)
                                            step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`)
                                        })
                                    }

                                });
                            }

                            if(item.composing_drawings && item.composing_drawings.length){
                                item.composing_drawings.forEach(function (ditem,index) {
                                    drawings_str += ditem.code+'；/'
                                    var des = '';
                                    ditem.attributes.forEach(function (aitem) {
                                        if(aitem.value!=''&&aitem.value!="0"){
                                            des += aitem.name+':'+aitem.value+'/';
                                        }
                                    });
                                    if(ditem.comment!=''){
                                        des+='描述：'+ditem.comment.replace("\n","");
                                    }
                                    $("<img/>").attr("src", "/storage/"+ditem.image_path).load(function() {//imgSrc是图片地址
                                        var realWidth = this.width;
                                        var realHeight = this.height;
                                        var showHeight = imwidth*realHeight/realWidth;
                                        step_drawings_html.push(`<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                     <p>
                                                        <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                     </p>
                                                     <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                     <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                     </div>`)
                                    })

                                });
                            }
                            setTimeout(function () {
                                var step_drawings_html_table_tr = '';
                                for(var i = 0; i < step_drawings_html.length; ){
                                    step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i])}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${tansferNull(step_drawings_html[i+1])}</td></tr>` ;
                                    i=i+2;
                                };
                                step_drawings_html_table =  `<table>${step_drawings_html_table_tr}</table>`;
                                _thml += `
                                        <div style="border: 1px solid black;" class="route_preview_container cut_out">
                                        <h4 >步骤${item.index}：${item.name} -- ${item.field_description}</h4>
                                        <table style="width:100%;border-right: 1px solid black;border-bottom: 1px solid black;">
                                            ${(item.description != '' && item.description != null) ?`<tr>
                                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">标准工艺</td>
                                                <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.description)}</td>
                                            </tr>`:''}
                                            ${(item.comment != '' && item.comment !== null) ?`<tr>
                                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">特殊工艺</td>
                                                <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(item.comment)}</td>
                                            </tr>`:''}
                                            ${step_drawings_html_table!=''?`<tr>
                                                <td style="text-align: center;border-left: 1px solid black;border-top: 1px solid black;padding: 5px;">工艺图片</td>
                                                <td style="width: 90%;padding: 5px;border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(step_drawings_html_table)}</td>
                                            </tr>`:''}
                                        </table>		
                                    </div>
                                    `;
                            },2000)

                        })
                    }
                    var _table = `<table style="border-right: 1px solid black;border-bottom: 1px solid black;">${material_in_html}${material_out_html} ${drawings_str!=''?`<tr><td style="border-left: 1px solid black;border-top: 1px solid black;">图片编号：</td><td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(drawings_str)}</td></tr>`:''} </table>`;
                    table_arr.push(_table);
                }
            });
        }

        var tr = ''
        for(var i = 0; i < table_arr.length; ){
            tr += `<tr><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;" >${tansferNull(table_arr[i])}</td><td style="width: 34%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(table_arr[i+1])}</td><td style="width: 33%;padding: 3px;vertical-align: top;border: 1px solid black;">${tansferNull(table_arr[i+2])}</td></tr>` ;
            i=i+3;
        }
        var _mtable = `<table style="width: 100%;border: 1px solid black;">${tr}</table>`;
    }
setTimeout(function () {
    var tab_name = $("#renderDOC").siblings().find(".el-tap.active").html()+'工艺';
    var dlength = '';
    var tstring = '';
    if(opeartion_ids.length>0){
        dlength = data.length;
        opeartion_ids.forEach(function (item) {
            tstring+= dlength+"-"+(Number(item)+1)+"，"
        })
    }
    _thml = `<div>
                <div class="cut_out">
                    <table  style="height: 130px;border: 1px solid black;border-bottom: none; width: 100%;">
                        <tr><td colspan="3" style="text-align: center;font-size: 30px;font-weight: bold;">梦百合家居科技股份有限公司</td></tr>
                        <tr><td colspan="3" style="text-align: center;font-size: 18px;font-weight: bold;"><div style="display: inline-block">${tab_name}</div><div style="display: inline-block;float: right;">${tstring}</div></td></tr>
                        <tr style="font-size: 18px;"><td>产品编码：${material_code}</td><td>规格：${bom_specification}</td><td>基础数量：${basic_qty}</td></tr>
                    </table>
                    ${_mtable}
                    ${_thml}
                </div>
               </div>`;



    if (_thml) {
        $('#downlistdoc').html(_thml);
    } else {
        $('#downlistdoc').html('');
    }
    $('#renderDOC').removeClass('is-disabled');
    $('#print').removeClass('is-disabled');
},2000)

}

//获取当前页面的缩放值
function detectZoom() {
    var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
        ratio = Math.round(ratio * 100);
    }
    return ratio;
}

function getFilterPreviewDataCopy(dataArr, type) {
    if(Object.prototype.toString.call(dataArr)=="[object Array]"){
        return dataArr.filter(function (e) {
            return e.type == type;
        });
    }else {
        dataArr = objToArray(dataArr);
        return dataArr.filter(function (e) {
            return e.type == type;
        });
    }

}
function objToArray(array) {
    var arr = []
    for (var i in array) {
        arr.push(array[i]);
    }
    return arr;
}


function previewModal(data) {
    var wwidth = document.documentElement.clientWidth - 80,
        wheight = document.documentElement.clientHeight - 80,
        mwidth = wwidth + 'px',
        mheight = wheight + 'px';
    var taps = '';

    // console.log(newroutingGraph);
    if (newroutingGraph != null && $('#route_id').val() != '') {
        newroutingGraph.routingGraph.nodes.forEach(function (nitem) {
            if (nitem.operation != '<none>' && nitem.operation != '开始') {
                taps += `<span data-opid="${nitem.operation_id}" data-item="${nitem.oid}" class="el-tap">${nitem.operation}</span>`;
            }
        });
    }
    layerModal = layer.open({
        type: 1,
        title: '工艺文件预览',
        offset: '40px',
        area: [mwidth, mheight],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `
                <div class="container-code">
                    <div id="qrcode" style="width:100px; height:100px; margin-top:15px;">
                        <div id="qrCodeIco"></div>
                    </div>
                </div>
                <div class="preview-wrap-container">
                    <button id="qr-code">二维码</button>
                    <!--<button id="renderPDF">下载PDF</button>-->
                    <button id="print" class="is-disabled">打印</button>
                    <button id="renderDOC" class="is-disabled">下载DOC</button>
                    <div class="preview-wrap">
                        <div class="el-tap-preview-wrap">
                            ${taps}
                        </div>  
                        <div id="doc_list" class="el-panel-preview-wrap" style="padding: 10px;min-height: 500px;">
                            <div class="el-preview-panel active">     
                            </div>
                        </div>  
                        <div id="doc_list_copy" class="el-panel-preview-wrap" style="padding: 10px;min-height: 500px;display: none;">
                            <div class="el-preview-panel active">     
                            </div>
                        </div>
                    </div>
                    
                    <div id="doc_list_download" style="display: none;">
                        <div id="downlistdoc"></div>
                    </div>
                    
                    <div id="all_down_data" style="display: none;">
                        <div id="downlist"></div>
                    </div>
                </div>`,
        success: function () {
            if ($('.el-tap-preview-wrap .el-tap').length) {
                $('.el-tap-preview-wrap .el-tap').eq(0).click();
            }
            //二维码
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 100,
                height: 100,
            });
            var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
            $("#qrCodeIco").css("margin", margin);
            var bom_code = $('#addBBasic_from #code').val();
            var bom_name = $('#addBBasic_from #name').val();
            makeCode(bom_code, bom_name, qrcode);

        },
        end: function () {
        }
    })
}


//二维码
function makeCode(code, name, qrcode) {
    var elText = "物料编码：" + code + "\r\n 物料名称：" + name;
    qrcode.makeCode(elText);
}


function bindCopyBomPagenation(total, size) {
    $('#pagenation.copybom').show();
    $('#pagenation.copybom').pagination({
        totalData: total,
        showData: size,
        current: bom_page_no,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            bom_page_no = api.getCurrent();
            getBomList();
        }
    });
}

function getNodeInfo(bid) {
    $('#copyoperation .copy-route-ul').html('');
    $('#copyoperation .copy-op-ul').html('<li>暂无数据</li>');
    var current_bom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
    AjaxClient.get({
        url: URLS['bomAdd'].nodeInfo + "?" + _token + '&bom_id=' + bid + '&operation_id=' + rnodes.operation_id + '&current_bom_id=' + current_bom_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            $('#copyoperation .copy-route-ul').html('');
            if (rsp && rsp.results && rsp.results.length) {
                createBomRouteLine(rsp.results, $('#copyoperation .copy-route-ul'));
            } else {
                $('#copyoperation .copy-route-ul').html('<li>暂无数据</li>');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('#copyoperation .copy-route-ul').html('<li>暂无数据</li>');
        }
    }, this);
}

function createBomRouteLine(data, ele) {
    data.forEach(function (item, index) {
        var lis = `
            <li class="route-li" data-route-id="${item.routing_id}">
                <span class="el-radio-input copy-route-check" data-route-id="${item.routing_id}">
                    <span class="el-radio-inner"></span>
                    <span class="el-radio-label">${item.name}</span>
                </span>
            </li>
        `;
        ele.append(lis);
        ele.find('li:last-child').data('lineItem', item);
    });
}

function getBomList() {
    var urlLeft = '',bom_id=getQueryString('id');
   
    for (var param in ajaxCopyData) {
        urlLeft += `&${param}=${ajaxCopyData[param]}`;
    }
    urlLeft += "&page_no=" + bom_page_no + "&page_size=15";
    $('#copyoperation .copybom_table .table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomAdd'].nodeBom + "?" + _token + urlLeft + "&bom_id="+bom_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {

            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                var _bomhtml = createCopyBomHtml(rsp.results);
                $('#copyoperation .copybom_table .table_tbody').html(_bomhtml);
            } else {
                $('#copyoperation .copybom_table .table_tbody').html('<tr><td colspan="5" style="text-align: center;">暂无数据</td></tr>');
            }
            if (totalData > 15) {
                bindCopyBomPagenation(totalData, 15);
            } else {
                $('#pagenation.copybom').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('#copyoperation .copybom_table .table_tbody').html('<tr><td colspan="5" style="text-align: center;">获取数据失败，请重试</td></tr>');
        },
        complete: function () {
            $('#copyoperation .bom-copy-submit').removeClass('is-disabled');
        }
    }, this);
}

function createCopyBomHtml(data) {
    var _bomhtml = '';
    data.forEach(function (item, index) {
        _bomhtml += `
            <tr class="tritem" data-id="${item.id}">
                <td>
                    <span class="el-radio-input copy-bom-check" data-id="${item.id}">
                        <span class="el-radio-inner"></span>
                    </span>
                </td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.bom_no}</td>
                <td>${item.version}</td>
            </tr>
        `;
    });
    return _bomhtml;
}

function copyModal() {
    var mheight = document.documentElement.clientHeight - 150;
    layerModal = layer.open({
        type: 1,
        title: '复制工艺',
        offset: '50px',
        area: '1200px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="copyoperation formModal" id="copyoperation">
                    <div class="el-form-item copy_wrap" >
                       <div class="copy_bom">
                         <div class="title"><h5>选择BOM</h5></div>
                         <div class="searchItem" id="searchForm">
                            <div class="searchMAttr searchModal formModal" id="searchMAttr_from">
                                <div class="el-item">
                                    <div class="el-item-show" style="width: 535px;">
                                        <div class="el-item-align">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label" style="width: 80px;">BOM编码</label>
                                                    <input type="text" id="bom_code" class="el-input" placeholder="BOM编码" value="">
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label" style="width: 80px;">BOM名称</label>
                                                    <input type="text" id="bom_name" class="el-input" placeholder="BOM名称" value="">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                            <button type="button" class="el-button el-button--primary bom-copy-submit">搜索</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div class="copybom_table table_page" style="min-height: 400px;max-height: ${mheight - 90}px;overflow-y: auto;">
                            <div id="pagenation" class="pagenation copybom"></div>
                            <table class="sticky uniquetable commontable">
                                <thead>
                                  <tr>
                                    <th>选择</th>
                                    <th>BOM编码</th>
                                    <th>BOM名称</th>
                                    <th>BOM编号</th>
                                    <th>BOM版本号</th>
                                  </tr>
                                </thead>
                                <tbody class="table_tbody">
                                   <tr><td colspan="5" style="text-align: center;">暂无数据</td></tr>
                                </tbody>
                            </table>
                         </div>
                       </div>
                       <div class="copy_routeline">
                            <div class="title"><h5>选择工艺路线</h5></div>
                            <div class="copy-route-wrap" style="max-height: ${mheight - 23}px;overflow-y: auto;">
                              <ul class="copy-route-ul"><li>暂无数据</li></ul>
                            </div>
                       </div>
                       <div class="copy-operation" style="max-height: ${mheight - 23}px;overflow-y: auto;">
                           <div class="title"><h5>选择工序</h5></div>
                           <div class="copy-op-wrap">
                            <ul class="copy-op-ul"><li>暂无数据</li></ul>
                          </div>
                       </div>
                    </div>
                    
                    <div class="el-form-item btnShow">
                        <div class="el-form-item-div btn-group">
                            <span class="errorMessage" style="margin-right: 5px;display: inline-block;"></span>
                            <button type="button" class="el-button el-button--primary copy-operation">复制</button>
                        </div>
                    </div>                    
                </form>`,
        success: function (layero, index) {
            getBomList();
        },
        end: function () {
            ajaxCopyData = {
                operation_id: '',
                code: '',
                name: '',
                order: 'asc',
                sort: 'code'
            }
        }
    })
}

//勾选复制工序取消提示
$('body').on('click','.copy-operation .el-radio-inner',function(){
    // $('#copyoperation .btn-group .errorMessage').css('display','none');
    $('#copyoperation .btn-group .errorMessage').html('');
})

//导出pdf js
function previewDModal(data) {
    var bom_name = $('#addBBasic_from #code').val();
    var route_name = $('#addRoute_form .route-tag.selected').attr('data-name');
    var downlist = `<div id="downsPdf" class="preview-wrap-container">
                        <p>工艺路线:${route_name}</p>
                        <p>物料清单编码：${bom_name}</p>
                    <div class="preview-wrap">
                        <div class="el-panel-preview-wrap" style="padding: 10px;min-height: 500px;">
                            <div class="el-preview-all-panel active">     
                            </div>
                        </div>
                    </div>
                </div>`;
    $('#downlist').append(downlist);
}
function getBomRoutingDownloadData() {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
        rid = $('#route_id').val();
    AjaxClient.get({
        url: URLS['bomAdd'].DownloadData + "?" + _token + "&bom_id=" + bid + "&routing_id=" + rid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                createDPreview(rsp.results);
            } else {
                //暂无数据
                var con = `<div class="no_data_center">暂无数据</div>`
                $('.preview-wrap-container .el-preview-panel').html(con);
            }
            // console.log(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工序预览失败');
        }
    }, this);
}
function createDPreview(data) {
    var stepBlocks = '', in_flag = '', outBlocks = '', stepItems = '';
    var nnn = 1;
    data.forEach(function (item) {
        var stepItems = '',
            procedureName = '',
            step_draw = '', outBlocks = '';
        procedureName += `<h3 align="center" style="margin-top:10px;padding-bottom:10px;">${item.operation_name}</h3>`;
        if (item.group_arr && item.group_arr.length) {
            item.group_arr.forEach(function (sitem, sindex) {
                step_draw = '';
                if (sitem.drawings && sitem.drawings.length) {
                    sitem.drawings.forEach(function (ditem) {
                        step_draw += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
                 <p><img data-id="${ditem.id}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
                 <p>${ditem.step_name}-${ditem.image_name}</p>
                 </div>`;
                    })
                } else {
                    step_draw = '';
                }
                //循环内容
                stepItems = '';

                if (sitem.step_info && sitem.step_info.length) {
                    sitem.step_info.forEach(function (ditem, sindex) {
                        var s_draw = [], s_material_in = '', s_material_out = '';
                        if (ditem.step_drawings && ditem.step_drawings.length) {
                            ditem.step_drawings.forEach(function (sditem) {
                                s_draw.push(sditem.image_name)
                            })
                        }
                        if (ditem.material && ditem.material.length) {
                            var material_in = getFilterPreviewData(ditem.material, 1),
                                material_out = getFilterPreviewData(ditem.material, 2);
                            if (material_in.length) {
                                s_material_in = cpreviewDAttr(material_in, 'in');
                            } else {
                                s_material_in = `<span class="no_material">无</span>`;
                            }
                            if (material_out.length) {
                                s_material_out = cpreviewDAttr(material_out, 'out');
                            } else {
                                s_material_out = `<span class="no_material">无</span>`;
                            }
                        } else {
                            s_material_out = s_material_in = `<span class="no_material">无</span>`;
                        }
                        let commentStr = '';
                        if (ditem.comment) {
                          let commentArr = ditem.comment.split('***');
                          if (commentArr && commentArr.length) {
                            commentArr.forEach(function (citem, index) {
                              if (index % 2 == 1) {
                                commentStr += `<span class="bold-red">${citem}</span>`;
                              } else {
                                commentStr += citem;
                              }
                            })
                          } else {
                            commentStr = ditem.comment;
                          }
                        }
                        stepItems += `<tr data-id="${ditem.id}">
                           <td>${ditem.index}</td>
                           <td>${ditem.name}</td>
                           <td>${ditem.abilitys.join(',')}</td>
                           <td class="pre_material ma_in">${s_material_in}</td>
                           <td class="pre_material ma_out">${s_material_out}</td>
                           <td class="pre_bgcolor desc" style="word-break: break-all;min-width:80px;">${tansferNull(ditem.description)}</td>
                           <td class="pre_bgcolor desc" style="word-break: break-all;min-width:80px;">${tansferNull(commentStr)}</td>
                         </tr>
                         <tr><td colspan="9"><div class="draw_content clearfix">${step_draw}</div></td></tr>`
                    })
                } else {
                    stepItems = '';
                }
                outBlocks += `<div class="route_preview_container">
                    <table>
                        <thead>
                          <tr>
                              <th style="width:45px;">序号</th>
                              <th style="width:60px;">步骤</th>
                              <th style="width:200px;">加工能力</th>
                              <th>进料</th>
                              <th>出料</th>
                              <th>标准工艺</th>
                              <th>特殊工艺</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${stepItems}
                        </tbody>
                    </table>
                    <div class="img_expand_pre"></div>
                 </div>`;

            });

        }
        else {
            outBlocks = `<div class="no_data_center" style="margin: 20px 0;">暂无数据</div>`;
        }

        stepBlocks += `${procedureName}
                    ${outBlocks}`;
    });
    if (stepBlocks) {
        $('.preview-wrap-container .el-preview-all-panel').html(stepBlocks);
    } else {
        $('.preview-wrap-container .el-preview-all-panel').html('');
    }
}
function cpreviewDAttr(data, flag) {
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
              <div class="pre_unit"><span>${mitem.use_num}</span><p>${mitem.commercial}</p></div>
              <div class="pre_unit" style="width: 100px"><span>描述</span><p style="word-wrap: break-word;">${mitem.desc}</p></div>
          </div>`;
    });
    return str;
}