var opeartion_ids = [],bom_id,material_id,wo_num,sales_order_code,sales_order_project_code,next_lifnr_str='';
$(function () {

    $('body').on('click','.viewProcess',function (e) {
        e.stopPropagation();
        var so = $(this).attr('data-sales-order-code');
        var spo = $(this).attr('data-sales-order-project-code');
        getRouting(so,spo)

    });
    
    //直接打印
    $('body').on('click','#print:not(.is-disabled)',function (e) {
        e.stopPropagation();
        $("#downlistdoc").show();
        $("#downlistdoc").print();
        $("#downlistdoc").hide();
    })

    //工艺文件预览页面中点击 "下载doc" 按钮
    $('body').on('click', '#renderDOC:not(.is-disabled)', function (e) {

        var bom_name = $('#mat_wo_number').val();
        var tab_name = $('#mat_item_no').val();
        $("#downlistdoc").wordExport(bom_name +"-"+ tab_name,this.className == 'landscape');
    });
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
                        var bom_name = $('#mat_wo_number').val();
                        var tab_name = $('#mat_item_no').val();
                        pdf.save(bom_name +'-'+ tab_name + '.pdf');
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
    $('body').on('click', '.el-tap-routing', function () {
        if (!$(this).hasClass('active')) {
            var type = $(this).attr('data-type');
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            if(type == 'routing'){
                $("#show_bom_design_list").hide()
                $("#show_work_order_routing").show()
            }
            if(type == 'design'){
                $("#show_work_order_routing").hide()
                $("#show_bom_design_list").show()
            }
        }
    })

    
});
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
//模拟iframe,并且将需要的数据存入临时iframe
function openWithIframe(html) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", "myFrmame");

    var $iframe = $(iframe);
    $iframe.css({
        'visibility': 'hidden', 'position': 'static', 'z-index': '4'
    }).width($(window).width()).height($(window).height());
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

function getRouting(so,spo) {
    AjaxClient.get({
        url: URLS['thinPro'].routingSoShow + _token + "&sales_order_code=" + so+"&sales_order_project_code="+spo,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.group_routing_package!=null){
                bom_id = rsp.results.old_bom_id;
                material_id = rsp.results.material_id;
                wo_num = rsp.results.wo_number;
                sales_order_code=rsp.results.sales_order_code;
                sales_order_project_code=rsp.results.sales_order_project_code;
                if(rsp.results.version_change==1){
                    var msg = `工艺变更，最新版本为：${rsp.results.new_version}.0，请在BOM版本页选择最新工艺查看。是否直接跳转到最新版本的工艺页面查看最新工艺？`;
                    
                    console.log(sales_order_code);
                    console.log(sales_order_project_code);
                    layer.confirm(msg, {
                        icon: 3,
                        btn: ['是','否'],
                        closeBtn: 0,
                        title: false,
                        offset: '250px'
                    },function(index){
                        layer.close(index);
                        window.open(`/BomManagement/bomgyView?id=${rsp.results.new_bom_id}&sales_order_code=${rsp.results.sales_order_code}&sales_order_project_code=${rsp.results.sales_order_project_code}`);
                    },function (index) {
                        layer.close(index);
                        previewModal(JSON.parse(rsp.results.group_routing_package),rsp.results.ability_name,rsp.results.attr,rsp.results.item_no,rsp.results.wo_number,rsp.results.inspur_material_code,rsp.results.NEXT_LIFNR,rsp.results.NEXT_LIFNR_ARR,rsp.results.sales_order_code,rsp.results.sales_order_project_code)
                        getBomShow(bom_id,material_id);

                    });
                }else {
                    previewModal(JSON.parse(rsp.results.group_routing_package),rsp.results.ability_name,rsp.results.attr,rsp.results.item_no,rsp.results.wo_number,rsp.results.inspur_material_code,rsp.results.NEXT_LIFNR,rsp.results.NEXT_LIFNR_ARR,rsp.results.sales_order_code,rsp.results.sales_order_project_code)
                    getBomShow(bom_id,material_id);
                }

            }else {
                LayerConfig('fail','该工单未查到工艺!');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    });

}
function getBomShow(bom_id,material_id){
    AjaxClient.get({
        url: COMMONURLS['commonTechnology'].bomShow + "?" + _token + '&bom_id=' + bom_id ,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#show_new_bom').text(`当前BOM版本：${rsp.results.version}.0`)
            getDesignBomList(material_id,rsp.results.bom_no)

        },
        fail: function (rsp) {
            layer.close(layerLoading);

            LayerConfig('fail',rsp.message)
        }
    }, this);
}
function getDesignBomList(id,bom_no) {
    AjaxClient.get({
        url: COMMONURLS['commonTechnology'].getDesignBomList + "?" + _token + '&material_id=' + id + '&bom_no=' + bom_no,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results) {
                createMainDesignTable(rsp.results)
            }
        },
        fail: function (rsp) {
            LayerConfig('fail',rsp.message)
        }
    }, this);
}

//生成设计bom列表
function createMainDesignTable(data) {
    var tr = '';
    if (data.length) {
        $("#show_bom_design_list .design_main_table .t-body").html('')
        data.forEach(function (item, index) {
            var condition;
            if(item.status==0){
                condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未激活</span>`;
            }else{
                if(item.is_version_on==1){
                    condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
                }else{
                    condition=`<span style="padding: 2px;border: 1px solid #d2dc15;color: #d2dc15;border-radius: 4px;">已激活</span>`;
                }
            }

            tr += `
            <tr class="tr-bom-item ${item.bom_id == bom_id ? 'active' : ''}" data-bom-id="${item.bom_id}" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.ctime}</td>
                <td>${item.mtime}</td>
                <td>${item.user_name == null?'':item.user_name}</td>
                <td>${item.version}.0</td>
                <td><span title="item.version_description">${item.version_description.length > 25 ? item.version_description.substring(0, 24) + '...' : item.version_description}</span></td>
                <td class="bomstatus">${condition}</td>
                <td>
                  <a target="view_window" href="/BomManagement/bomgyView?id=${item.bom_id}&sales_order_code=${sales_order_code}&sales_order_project_code=${sales_order_project_code}" class="button pop-button view">查看</a>
                </td>            
            </tr>
        `;
        });
    } else {
        tr = `<tr>
                <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
            </tr>`;
    }
    $("#show_bom_design_list .design_main_table .t-body").html(tr)
}
function previewModal(data,ability_name,attr,item_no,wo_number,inspur_material_code,next_lifnr,next_lifnr_arr,sales_order_code,sales_order_project_code) {
    var dataInfo = [
        {
            step_info:data
        }
    ];
    var wwidth = $(window).width() - 80,
        wheight = $(window).height() - 80,
        mwidth = wwidth + 'px',
        mheight = wheight + 'px';
    var next_lifnr_arr_html='';
    if (next_lifnr_arr && next_lifnr_arr.length) {
      var lis='';next_lifnr_str='';
        next_lifnr_arr.forEach(function (item) {
            lis += `<li data-id="${item.LIFNR}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.LIFNR}(${item.operation_name})</li>`;
            next_lifnr_str+=item.LIFNR+' ';
        });
        next_lifnr_arr_html = `${lis}`;
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
                    <input type="hidden" id="mat_item_no" value="${item_no}">
                    <input type="hidden" id="mat_wo_number" value="${wo_number}">
                    <div id="qrcode" style="width:100px; height:100px; margin-top:15px;">
                        <div id="qrCodeIco"></div>
                    </div>
                </div>
                <div class="preview-wrap-container">
                    <div class="preview-wrap">
                            <div class="el-tap-preview-wrap">
                                <span data-type="routing"  class="el-tap el-tap-routing active">工艺路线</span>
                                <span data-type="design" class="el-tap el-tap-routing">BOM版本</span>
                            </div>
                    </div>
                    <div id="show_work_order_routing">
                        <button id="print" class="is-disabled">打印</button>
                        <button id="renderDOC" class="is-disabled">下载DOC</button>
                        <div class="preview-wrap">
                            <div class="el-item" style="height:30px;margin:5px;">
                                <div style="float: left;" id="show_new_bom"></div>
                                <div class="el-form-item select_rank_plan"  style="float: right;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 150px;">&nbsp;&nbsp;下道委外加工商：</label>
                                        <div class="el-select-dropdown-wrap" style="width:200px;">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                                <input type="hidden" class="val_id" id="NEXT_LIFNR" value=""/>
                                            </div>
                                            <div class="el-select-dropdown" style="width:200px;">
                                                <ul class="el-select-dropdown-list">
                                                  ${next_lifnr_arr_html}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px;"></p>
                                </div>
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
                            <div id="downlistdoc">
                            </div>
                        </div>
                        
                        <div id="all_down_data" style="display: none;">
                            <div id="downlist"></div>
                        </div>
                    </div>
                    <div id="show_bom_design_list" style="display: none;">
                        <div class="design_basic_info">
                            <div class="table-container">
                                <table class="bom_table design_main_table">
                                    <thead>
                                    <tr>
                                        <th class="thead">物料清单编码</th>
                                        <th class="thead">物料清单名称</th>
                                        <th class="thead">创建时间</th>
                                        <th class="thead">修改时间</th>
                                        <th class="thead">创建人</th>
                                        <th class="thead">版本</th>
                                        <th class="thead">版本描述</th>
                                        <th class="thead">状态</th>
                                        <th class="thead">操作</th>
                                    </tr>
                                    </thead>
                                    <tbody class="t-body">
                                    <tr>
                                        <td class="nowrap" colspan="9" style="text-align: center;">暂无数据</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                </div>`,
        success: function () {
            createPreview(dataInfo);
            createPreviewCopy(dataInfo,ability_name,attr,item_no);
            createPreviewDoc(dataInfo,ability_name,attr,item_no,inspur_material_code,next_lifnr,sales_order_code,sales_order_project_code);
        },
        end: function () {
        }
    })
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
                stepItems += `<tr>
                   <td></td>
                   <td>${sitem.index}</td>
                   <td><p>${sitem.name}</p> <p>（${sitem.code}）</p> <p>${sitem.field_description}</p></td>
                   <td align="left">${name_desc}</td>
                   <td>${work_center}</td>
                   <td class="pre_material ma_in">${s_material_in}</td>
                   <td class="pre_material ma_out">${s_material_out}</td>
                   <!--<td class="pre_bgcolor imgs">${s_draw.join(',')}</td>-->
                   <td class="pre_bgcolor desc" style="word-break: break-all">${tansferNull(sitem.description)}</td>
                   <td class="pre_bgcolor desc ${sitem.comment_font_type==1?"bold-red":""}">${tansferNull(sitem.comment)}</td>
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
                          <tr><td colspan="9"><div class="draw_content clearfix">${step_draw}</div></td></tr>
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
function createPreviewCopy(data,ability_name,attr,item_no) {
    //上个版本，暂时保留。


    //当前版本
    var wwidth = $(window).width(),
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
                        <div style="text-align: center;font-size: 18px;font-weight: bold;margin-top: 10px;"><div style="display: inline-block">${ability_name}</div></div>
                        <div style="display: flex;font-size: 18px;font-weight: bold;margin-top: 10px;"><div><span>产品编码：</span><span>${item_no}</span></div><div style="width: 100px;"></div><div><span>产品名称：</span><span>${attr}</span></div></div>
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
function createPreviewDoc(data,ability_name,attr,item_no,inspur_material_code,next_lifnr,sales_order_code,sales_order_project_code) {
    //上个版本，暂时保留。
    $('#renderDOC').addClass('is-disabled');
    $('#print').addClass('is-disabled');

    //当前版本
    var wwidth = $(window).width(),
        // imwidth = (wwidth - 322)/2,
        imwidth = 370;
    var imheight = imwidth*365/555;

    var _thml='';
    var table_arr = [];

    var NEXT_LIFNR='';
    if($("#NEXT_LIFNR").val()){
      NEXT_LIFNR=$("#NEXT_LIFNR").val();
    }else{
      NEXT_LIFNR=next_lifnr_str;
    }
    //导出只有进出步骤只有一次的
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
                                mattr += '用量：'+imitem.use_num+imitem.bom_commercial+'；';
                            }
                            if(imitem.qty){
                                mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_in_html.push( `<table style="table-layout:fixed;border-right: 1px solid black;border-bottom: 1px solid black;"><tr>
                                        <td style="width: 100px;word-wrap:break-word;word-break:break-all;border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${tansferNull(imitem.old_code)}）</td>
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
                                mattr += '用量：'+imitem.use_num+imitem.bom_commercial+' / ';
                            }
                            if(imitem.qty){
                                mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                            }
                            if(imitem.desc){
                                mattr += '描述：'+imitem.desc+'；';
                            }
                            material_out_html.push( `<table style="table-layout:fixed;border-right: 1px solid black;border-bottom: 1px solid black;"><tr><td style="width: 140px;word-wrap:break-word;word-break:break-all;border-left: 1px solid black;border-top: 1px solid black;">序号</td><td style="border-left: 1px solid black;border-top: 1px solid black;">尺寸/数量</td></tr><tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${tansferNull(imitem.old_code)}）</td>
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
                                    if (realWidth<800){
                                        var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                        step_drawings_html.push({
                                            flag:false,
                                            html:_table_html
                                        })
                                    }else {
                                        var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                        step_drawings_html.push({
                                            flag:true,
                                            html:_table_html
                                        })
                                    }
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
                                if (realWidth<800){
                                    var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                    step_drawings_html.push({
                                        flag:false,
                                        html:_table_html
                                    })
                                }else {
                                    var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                    step_drawings_html.push({
                                        flag:true,
                                        html:_table_html
                                    })
                                }
                            })

                        });
                    }
                    setTimeout(function () {
                        var step_drawings_html_table_tr = '';
                        for(var i = 0; i < step_drawings_html.length; ){
                            if(!step_drawings_html[i].flag){
                                step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${step_drawings_html[i+1]?tansferNull(step_drawings_html[i+1].html):''}</td></tr>` ;
                                i=i+2;
                            }else {
                                step_drawings_html_table_tr += `<tr><td colspan="2" style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td></tr>` ;
                                i=i+1;
                            }
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
    //多个进出步骤，裁剪、缝制
    if(data.length>1){
        //未选择打印
        
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
                                    mattr += '用量：'+imitem.use_num+imitem.bom_commercial+'；';
                                }
                                if(imitem.qty){
                                    mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                                }
                                if(imitem.use_num){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_in_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)} （${tansferNull(imitem.old_code)}）</td>
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
                                    mattr += '用量：'+imitem.use_num+imitem.bom_commercial+' / ';
                                }
                                if(imitem.qty){
                                    mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                                }
                                if(imitem.desc){
                                    mattr += '描述：'+imitem.desc+'；';
                                }
                                material_out_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${tansferNull(imitem.old_code)}）</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
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
                                        if (realWidth<800){
                                            var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                            step_drawings_html.push({
                                                flag:false,
                                                html:_table_html
                                            })
                                        }else {
                                            var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                            step_drawings_html.push({
                                                flag:true,
                                                html:_table_html
                                            })
                                        }
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
                                    if (realWidth<800){
                                        var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                        step_drawings_html.push({
                                            flag:false,
                                            html:_table_html
                                        })
                                    }else {
                                        var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                        step_drawings_html.push({
                                            flag:true,
                                            html:_table_html
                                        })
                                    }
                                })


                            });
                        }
                        setTimeout(function () {
                            var step_drawings_html_table_tr = '';
                            for(var i = 0; i < step_drawings_html.length; ){
                                if(!step_drawings_html[i].flag){
                                    step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${step_drawings_html[i+1]?tansferNull(step_drawings_html[i+1].html):''}</td></tr>` ;
                                    i=i+2;
                                }else {
                                    step_drawings_html_table_tr += `<tr><td colspan="2" style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td></tr>` ;
                                    i=i+1;
                                }
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
        //选择指定步骤打印
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
                                        mattr += '用量：'+imitem.use_num+imitem.bom_commercial+'；';
                                    }
                                    if(imitem.qty){
                                        mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                                    }
                                    if(imitem.use_num){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_in_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">物料编码：</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${tansferNull(imitem.old_code)}）</td>
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
                                        mattr += '用量：'+imitem.use_num+imitem.bom_commercial+' / ';
                                    }
                                    if(imitem.qty){
                                        mattr += '计划量：'+imitem.qty+imitem.bom_commercial+' / ';
                                    }
                                    if(imitem.desc){
                                        mattr += '描述：'+imitem.desc+'；';
                                    }
                                    material_out_html += `<tr>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(imitem.material_code)}（${tansferNull(imitem.old_code)}）</td>
                                        <td style="border-left: 1px solid black;border-top: 1px solid black;">${tansferNull(mattr)}</td>
                                    </tr>`;
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
                                            if (realWidth<800){
                                                var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                                step_drawings_html.push({
                                                    flag:false,
                                                    html:_table_html
                                                })
                                            }else {
                                                var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                                step_drawings_html.push({
                                                    flag:true,
                                                    html:_table_html
                                                })
                                            }
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
                                        if (realWidth<800){
                                            var _table_html = `<div style="text-align: center;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth}" height="${showHeight}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                            step_drawings_html.push({
                                                flag:false,
                                                html:_table_html
                                            })
                                        }else {
                                            var _table_html = `<div style="text-align: left;margin: 10px;" class="${(index+1)%2==1?'checkline':''}" data-url="${ditem.image_path}">
                                                         <p>
                                                             <img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="${imwidth*3}" height="${showHeight*3}">
                                                         </p>
                                                         <p style="cursor: pointer;">${ditem.code}（${ditem.image_name}）</p>
                                                         <p style="cursor: pointer;text-align: center;"><div style="width: 390px;display: inline-block;"><span style="word-break:normal; width:auto; display:block; white-space:pre-wrap;word-wrap : break-word ;overflow: hidden ;">${des}</span></div></p>
                                                         </div>`;
                                            step_drawings_html.push({
                                                flag:true,
                                                html:_table_html
                                            })
                                        }
                                    })


                                });
                            }
                            setTimeout(function () {
                                var step_drawings_html_table_tr = '';
                                for(var i = 0; i < step_drawings_html.length; ){
                                    if(!step_drawings_html[i].flag){
                                        step_drawings_html_table_tr += `<tr><td style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td><td style="width: 50%;padding: 3px;vertical-align: top;">${step_drawings_html[i+1]?tansferNull(step_drawings_html[i+1].html):''}</td></tr>` ;
                                        i=i+2;
                                    }else {
                                        step_drawings_html_table_tr += `<tr><td colspan="2" style="width: 50%;padding: 3px;vertical-align: top;" >${tansferNull(step_drawings_html[i].html)}</td></tr>` ;
                                        i=i+1;
                                    }
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
                        <tr><td style="padding-top: 10px;padding-left: 20px;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"><div id="qrcodewt"></div></td><td colspan="2" style="text-align: center;font-size: 30px;font-weight: bold;">梦百合家居科技股份有限公司</td><td></td></tr>
                        <tr><td colspan="4" style="text-align: center;font-size: 18px;font-weight: bold;"><div style="display: inline-block">${ability_name}</div></td></tr>
                        <tr style="font-size: 18px;"><td>销售订单：${sales_order_code}/${sales_order_project_code}</td><td>产品编码：${item_no}（${inspur_material_code}）</td><td>产品名称：${attr}</td><td>下道委外加工商：${NEXT_LIFNR}</td></tr>
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
        var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
            width: 100,
            height: 100,
            correctLevel : QRCode.CorrectLevel.L
        });
        makeCodeForOwner(wo_num, qrcodewt);
        $('#renderDOC').removeClass('is-disabled');
        $('#print').removeClass('is-disabled');
    },2000)

}
//二维码
function makeCodeForOwner(str, qrcode) {
    qrcode.makeCode(str);
}
function getFilterPreviewData(dataArr, type) {
    return dataArr.filter(function (e) {
        return e.type == type;
    });
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