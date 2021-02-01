var id,type,type_code,DWERKS,
pickingList='';
var typeStr = {
    ZY03:'委外定额领料',
    ZB03:'委外补料',
    ZY06:'委外定额退料',
    ZY05:'委外超耗补料',
    ZY04:'委外超发退料'
};
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');

    $('#show_title').text(typeStr[type])
    $('#change_lable').text(typeStr[type]);

    if (id != undefined) {
        getOutsourceItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    bindEvent();
});
function getOutsourceItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].OutMachineZyShow+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showPrintList(rsp.results[0]);
            DWERKS  = rsp.results[0].DWERKS;
            $('#out_picking_id').val(rsp.results[0].out_picking_id)
            $('#storage').val(rsp.results[0].DWERKS);
            $('#code').val(rsp.results[0].code);
            $('#EBELN').val(rsp.results[0].EBELN);
            $('#warehouse').val(rsp.results[0].wms_depot_name);
            $('#time').val(rsp.results[0].time);
            $('#salesOrderCode').val(rsp.results[0].sales_order_code);
            $('#sales_order_project_code').val(rsp.results[0].sales_order_project_code);
            createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results[0].groups,rsp.results[0].type_code);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','获取领料单失败！')
        }
    },this);


}

function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        submitPickingList()
    });
    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        var id = $(this).attr('data-id');
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
            deleteItemSpeacil(id);
        });
    });
    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        $("#print_list").show();
        $("#print_list").print();
        $("#print_list").hide();

    })
}
function deleteItemSpeacil(id) {
    AjaxClient.get({
        url: URLS['outsource'].deleteLine+'?'+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', '删除成功！', function () {
                window.location.reload();
            });

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', '删除失败！', function () {
                window.location.reload();
            })
        }
    }, this)
}

function submitPickingList() {

    var material_arr = [];

    $('.table-bordered .t-body tr').each(function (k,v) {
        material_arr.push({
            id:$(v).attr('data-id'),
            picking_line_item_id:$(v).attr('data-line_id'),
            EBELN:$('#EBELN').val(),
            DWERKS:DWERKS,
            EBELP:$(v).find('.EBELP').text(),
            BANFN:$(v).find('.BANFN').text(),
            BNFPO:$(v).find('.BNFPO').text(),
            LGFSB:$(v).find('.LGFSB').text(),
            line_project_code:$(v).find('.line_project_code').text(),
            XQSLDW:$(v).find('.XQSLDW').text(),
            DMEINS:$(v).find('.DMEINS').text(),
            MATNR:$(v).find('.DMATNR').text(),
            XQSL:$(v).find('.demand_num').text(),

        })
    })


        var data= {
            id:id,
            out_picking_id: $('#out_picking_id').val(),
            type_code: type,
            items:JSON.stringify(material_arr),
            _token:TOKEN
        };
        AjaxClient.post({
            url: URLS['outsource'].store,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','保存成功！');
                getOutsourceItem(id);


            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail','保存失败！错误日志为：'+rsp.message)
            }
        }, this)


}

function createOutsourceHtml(ele,data,type_code){
    ele.html('');
    if(type_code == 'ZB03' || type_code == 'ZY05') {
        $("#cause").show();
        data.forEach(function (item) {
            var _tr = '';
            if(item.reasonText.length>0){
                item.reasonText.forEach(function (itemc) {
                    _tr += `<div class="cause_item" style="height: 20px;">
                                <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                            </div>`;
                });
            }

            var tr=`
            <tr class="tritem" data-id="${item.id}" data-line_id="${item.picking_line_item_id}">
                <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                <td  class="line_project_code">${tansferNull(item.line_project_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_name)}</td>
                <td  class="LGFSB">${tansferNull(item.LGFSB)}</td>
                <td  class="BANFN">${tansferNull(item.BANFN)}</td>
                <td  class="BNFPO">${tansferNull(item.BNFPO)}</td>
                <td  class="demand_num">${tansferNull(item.XQSL)}</td>         
                <td  class="DMEINS">${tansferNull(item.actual_send_qty)}</td>         
                <!--<td><input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="el-input DMEINS" value="${item.actual_send_qty}" ></td>-->
                <td  class="XQSLDW">${tansferNull(item.XQSLDW)}</td>
                 <td style="padding: 3px;"><div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" class="MKPF_BKTXT" >${_tr}</div></td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="${item.id}" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }else {
        data.forEach(function (item) {

            var tr=`
            <tr class="tritem" data-id="${item.id}" data-line_id="${item.picking_line_item_id}">
                <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                <td  class="line_project_code">${tansferNull(item.line_project_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="DMATNR">${tansferNull(item.material_name)}</td>
                <td  class="LGFSB">${tansferNull(item.LGFSB)}</td>
                <td  class="BANFN">${tansferNull(item.BANFN)}</td>
                <td  class="BNFPO">${tansferNull(item.BNFPO)}</td>
                <td  class="demand_num">${tansferNull(item.XQSL)}</td>         
                <td  class="DMEINS">${tansferNull(item.actual_send_qty)}</td>         
                <!--<td><input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="el-input DMEINS" value="${item.actual_send_qty}" ></td>-->
                <td  class="XQSLDW">${tansferNull(item.XQSLDW)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="${item.id}" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }


}
function showPrintList(formDate) {
    var materialsArr = [];
    var type_string = typeStr[formDate.type_code];
    if (formDate.groups.length > 0) {
        materialsArr = formDate.groups;
        var newObj = {
            one:[],
            two:[],
            three:[]
        };
        materialsArr.forEach(function (item) {
            if(item.material_code.substr(0,4)=="6105" || item.material_code.substr(0,2)=="99"){
                newObj.one.push(item);
            }else if(item.material_code.substr(0,4)=="6113"){
                newObj.two.push(item)
            }else {
                newObj.three.push(item)
            }
        });

        var plan_start_time = formDate.time,
            employee_name = tansferNull(formDate.employee_name),
            send_depot = formDate.DWERKS,
            partner_name = formDate.partner_name,
            EBELN = formDate.EBELN,
            workbench_name = '',
            sales_order_code = formDate.sales_order_code,
            sales_order_project_code = formDate.sales_order_project_code,
            dispatch_time = '',
            code = formDate.code;
        var tootle = Math.ceil(newObj.one.length / 3)+Math.ceil(newObj.two.length / 3)+Math.ceil(newObj.three.length / 3);
        var index = 1;
        for(var j in newObj){
            for (var i = 0; i < newObj[j].length;i = i + 3) {
                var _table = `<table style="table-layout：fixed" class="show_border">
                        <thead>
                            <tr>
                                <th style="height: 30px;width:100px;">物料编码</th>
                                <th style="width:100px;">浪潮编码</th>
                                <th  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">物料名称</th>
                                <th >SAP需求数量</th>
                                <th >需求数量</th>
                                <th >BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_no}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_number}${newObj[j][i].sap_unit_commercial}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_number}${tansferNull(newObj[j][i].lc_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].XQSL}${tansferNull(newObj[j][i].XQSLDW)}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_number + newObj[j][i + 1].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_number + tansferNull(newObj[j][i + 1].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].XQSL + tansferNull(newObj[j][i + 1].XQSLDW) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_number + newObj[j][i + 2].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_number + tansferNull(newObj[j][i + 2].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].XQSL + tansferNull(newObj[j][i + 2].XQSLDW) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
                        </tbody>
                      </table>`
                var print_html = `<div style="page-break-after: always;">
                                <div style="display: flex;">
                                    <div style="flex: 1"></div>
                                    <div style="flex: 9"><h3 style="text-align: center;">梦百合家居科技股份有限公司${type_string}单</h3></div>
                                    <div style="flex: 1">
                                        <p style="margin: 0;font-size: 5px;">白联：仓</p>
                                        <p style="margin: 0;font-size: 5px;">红联：财</p>
                                        <p style="margin: 0;font-size: 5px;">黄联：车</p>
                                        <p style="margin: 0;font-size: 5px;">${index}/${tootle}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}日期:</div>
                                            <div style="flex: 2;">${plan_start_time}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">仓库:</div>
                                            <div style="flex: 2;">${send_depot}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">单据编码:</div>
                                            <div style="flex: 2;">${code}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">供应商:</div>
                                            <div style="flex: 2;">${partner_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}人:</div>
                                            <div style="flex: 2;">${employee_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">工位:</div>
                                            <div style="flex: 2;">${tansferNull(workbench_name)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">销售订单号${sales_order_project_code?'/行项号':''}:</div>
                                            <div style="flex: 2;">${sales_order_code}${sales_order_project_code?'/'+sales_order_project_code:''}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">采购凭证号:</div>
                                            <div style="flex: 2;">${EBELN}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">配送时间:</div>
                                            <div style="flex: 2;">${dispatch_time}</div>
                                        </div>
                                    </div>
                                </div>
                                ${_table}
                                <div>
                                <div style="display: flex;height:40px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">发货人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">${type_string}人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">审批人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>`;
                index++;
                $('#print_list').append(print_html);
            }
        }

    }

}