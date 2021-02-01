var id,type,type_code,sub_id,picking_id,production_id,employee_id,status,
pickingList='';
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    // type_code = getQueryString('type_code');

    if (id != undefined) {
        getOutsourceOrderItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }

    bindEvent();
});
function getOutsourceOrderItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].OutWorkShop+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            sub_id = rsp.results[0].sub_id;
            picking_id = rsp.results[0].picking_id;
            production_id = rsp.results[0].production_id;
            type = rsp.results[0].type;
            showPrintList(rsp.results[0]);
            if(type==3){
                $("#reat_qty").hide();
                $("#opeartion").hide();
                $(".save").text('实退')
            }
            $('#BNFPO').val(rsp.results[0].BNFPO);
            $('#partner_name').val(rsp.results[0].partner_name);
            $('#BANFN').val(rsp.results[0].BANFN);
            $('#AUFNR').val(rsp.results[0].code);
            $('#sub').val(rsp.results[0].EBELN);
            $('#employee').val(rsp.results[0].employee_name);
            status = rsp.results[0].status;
            if(rsp.results[0].status==0){
                $('.storage').show()
            }
            if(rsp.results[0].status==1){
                $('.return').show()
            }
            createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results[0].groups,rsp.results[0].type);

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
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('body').on('click','.storage',function () {
        layer.confirm('您将执行审核入库操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            storageOut();


        });
    });
    $('body').on('click','.return',function () {
        layer.confirm('您将执行反审操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            returnOut()
        });
    });
    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        $("#print_list").show();
        $("#print_list").print();
        $("#print_list").hide();

    })
}
function storageOut() {
    AjaxClient.get({
        url: URLS['outsource'].audit+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','审核入库成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}
function returnOut() {
    AjaxClient.get({
        url: URLS['outsource'].noaudit+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','反审成功！');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}

function submitPickingList() {



    var material_arr = [];

    $('.table-bordered .t-body tr').each(function (k,v) {
        material_arr.push({
            id:$(v).attr('data-id'),
            depot_id:$(v).attr('data-depot'),
            inve_id:$(v).attr('data-inve'),
            material_id:$(v).attr('data-material'),
            qty:$(v).find('.demand_num').val(),
            lot:$(v).find('.lot').text(),
            unit_id:$(v).attr('data-unit'),
            rated:$(v).attr('data-rated'),
        })
    })


        var data= {
            id:id,
            sub_id:sub_id,
            picking_id:picking_id,
            production_id: production_id,
            employee_id: employee_id,
            BANFN:$('#BANFN').val(),
            BNFPO:$('#BNFPO').val(),
            items:JSON.stringify(material_arr),
            type:type,
            _token:TOKEN
        };
        AjaxClient.post({
            url: URLS['outsource'].storeFlowItems,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','成功！')


            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message)
            }
        }, this)


}

function createOutsourceHtml(ele,data,type){
    ele.html('');
    if(type == 2){
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
            <tr class="tritem" data-id="${item.id}" data-material="${item.material_id}" data-unit="${item.unit_id}" data-rated="${item.rated}" data-depot="${item.depot_id}" data-inve="${item.inve_id}">
                <td  class="sale_order_code">${tansferNull(item.sale_order_code)}</td>
                <td  class="po_number">${tansferNull(item.po_number)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.attribute)}</td>
                <td  class="lot">${tansferNull(item.lot)}</td>
                <td  class="depot_name">${tansferNull(item.depot_name)}</td>
                <td  class="storage_validate_quantity">${tansferNull(item.storage_validate_quantity)}</td>
                ${type!=3?`<td  class="BNFPO">${tansferNull(item.rated)}</td>`:''}
                <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  class="el-input demand_num" ></td>
                <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.actual_send_qty}"  class="el-input actual_send_qty" ></td>
                <td  class="DMEINS">${tansferNull(item.unit_commercial)}</td>  
                <td style="padding: 3px;"><div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" class="MKPF_BKTXT" >${_tr}</div></td>                
                ${type!=3?`<td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>  `:''}       
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }
    if(type==1 || type ==3){
        data.forEach(function (item) {
            var tr=`
            <tr class="tritem" data-id="${item.id}" data-material="${item.material_id}" data-unit="${item.unit_id}" data-rated="${item.rated}" data-depot="${item.depot_id}" data-inve="${item.inve_id}">
                <td  class="sale_order_code">${tansferNull(item.sale_order_code)}</td>
                <td  class="po_number">${tansferNull(item.po_number)}</td>
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.attribute)}</td>
                <td  class="lot">${tansferNull(item.lot)}</td>
                <td  class="depot_name">${tansferNull(item.depot_name)}</td>
                <td  class="storage_validate_quantity">${tansferNull(item.storage_validate_quantity)}</td>
                ${type!=3?`<td  class="BNFPO">${tansferNull(item.rated)}</td>`:''}
                <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  class="el-input demand_num" ></td>
                <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.actual_send_qty}"  class="el-input actual_send_qty" ></td>
                <td  class="DMEINS">${tansferNull(item.unit_commercial)}</td>         
                ${type!=3?`<td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>  `:''}       
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }


}
function showPrintList(formDate) {
    var materialsArr = [];
    var typeStr = ['领料','补料','退料']
    var type_string = typeStr[formDate.type-1];
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
        })
        var plan_start_time = formDate.time,
            employee_name = tansferNull(formDate.employee_name),
            send_depot = formDate.DWERKS,
            partner_name = formDate.partner_name,
            product_order_code = formDate.EBELN,
            workbench_name = '',
            sales_order_code = formDate.sales_order_code,
            sales_order_project_code = formDate.sales_order_project_code,
            dispatch_time = '',
            code = formDate.code;
        var tootle = Math.ceil(newObj.one.length / 3)+Math.ceil(newObj.two.length / 3)+Math.ceil(newObj.three.length / 3);
        var index = 1;
        for(var j in newObj) {
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
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].qty}${tansferNull(newObj[j][i].unit_commercial)}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_number+newObj[j][i + 1].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_number+tansferNull(newObj[j][i + 1].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].qty+tansferNull(newObj[j][i + 1].unit_commercial) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].lc_no : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_number+newObj[j][i + 2].sap_unit_commercial : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_number+tansferNull(newObj[j][i + 2].lc_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].qty+tansferNull(newObj[j][i + 2].unit_commercial) : ''}</td>
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
                                            <div style="flex: 1;">销售订单号/行项号:</div>
                                            <div style="flex: 2;">${sales_order_code}/${sales_order_project_code}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">生产订单号:</div>
                                            <div style="flex: 2;">${product_order_code}</div>
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