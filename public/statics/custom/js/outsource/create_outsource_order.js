var id,type,type_code,sub_id,picking_id,production_id,pageNoItem = 1,pageSizeItem = 50, pickingList='',has_shop=0;
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
    var url = '';
    if(type==3){
        url = URLS['outsource'].showSendBack+"?"+_token+"&picking_line_id="+id
    }else {
        url = URLS['outsource'].getFlowItems+"?"+_token+"&id="+id
    }
    AjaxClient.get({
        url: url,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            sub_id = rsp.results.sub_id
            picking_id = rsp.results.picking_id
            production_id = rsp.results.production_id
            BANFN = rsp.results.BANFN
            BNFPO = rsp.results.BNFPO
            has_shop = rsp.results.has_shop
            $('#BNFPO').val(rsp.results.BNFPO);
            $('#BANFN').val(rsp.results.BANFN);
            $('#AUFNR').val(rsp.results.AUFNR);
            $('#sub').val(rsp.results.EBELN);
            if(type==3){
                if(rsp.results){
                    createReturnOutsourceHtml($('.item_outsource_table .t-body'),rsp.results.materials);
                }
            }else {
                if(rsp.results.diff.length>0){
                    createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results.diff);
                }

                if (rsp.results.has_shop == 1) {
					$('#test').css('display', 'block');
                    // $('#pageMain .submit.save').hide();
                }
            }



        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    },this);


}

function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        var str = type==1?'领料':type==2?'补料':type==3?'退料':''
        if(has_shop==0){
            submitPickingList()
        }
        if(has_shop==1){
            layer.confirm('您已'+str+'，是否继续'+str+'?', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
                submitPickingList()
            });
        }

    });
    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
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
                _ele.append(`<div class="cause_item" style="height: 20px;">
                                <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                            </div>`);
                _ele.find('.cause_item:last-child').data("spanData",itemc);
            }
        })
    });
    $('body').on('click','#viewCause .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
}

function showCause(id) {
    var _ele = $("#material"+id),arr_couse = [];

    _ele.find('.cause_item').each(function (item) {
        arr_couse.push($(this).data('spanData').preselection_id)
    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '500px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause" >
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

function bindPagenationClickItem(totalData,pageSize,arr_couse){
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
            getSpecialCauseData(arr_couse);
        }
    });
}
function getSpecialCauseData(arr_couse){
    $('#practice_table .table_tbody').html('');
    var urlLeft='';

    urlLeft+="&page_no="+pageNoItem+"&page_size="+pageSizeItem;
    AjaxClient.get({
        url: URLS['specialCause'].pageIndex+'?'+_token+urlLeft,
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
                if(item.preselection_id==itemc){
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

function submitPickingList() {

if(type==3){
    var material_arr = [];
    var flag = true,message='';
    $('.table-bordered .t-body .tritem').each(function (k,v) {
        var num = 0;
        $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
            num += Number($(vb).find('.demand_num').val());
            if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.total_qty').text())){
                material_arr.push({
                    id:'',
                    material_id:$(v).attr('data-material'),
                    depot_id:$(vb).attr('data-depot'),
                    inve_id:$(vb).attr('data-inve'),
                    lot:$(vb).attr('data-lot'),
                    qty:$(vb).find('.demand_num').val(),
                    unit_id:$(v).attr('data-unit'),
                    rated:0,
                })
            }else {
                message=$(v).find('.DMATNR').text()+"的物料的"+$(vb).find('.item_lot').text()+"批次的退料超过累计领补量！";
                flag=false;
                return;
            }
        })

    });
    if(flag) {
        if(material_arr.length>0){
            var data= {
                sub_id:sub_id,
                picking_line_id:id,
                picking_id:picking_id,
                production_id: production_id,
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
                    LayerConfig('success','保存成功！');
                    $(".save").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail','保存失败！错误日志为：'+rsp.message);
                }
            }, this)
        }
    }else {
        LayerConfig('fail',message);
    }
}
if (type==1){
    var material_arr = [];
    var flag = true,message='';
    $('.table-bordered .t-body .tritem').each(function (k,v) {
        var num = 0;
        $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
            num += Number($(vb).find('.demand_num').val());
            if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.storage_number').text())){
                material_arr.push({
                    id:'',
                    material_id:$(v).attr('data-material'),
                    depot_id:$(vb).attr('data-depot'),
                    inve_id:$(vb).attr('data-inve'),
                    lot:$(vb).attr('data-lot'),
                    qty:$(vb).find('.demand_num').val(),
                    unit_id:$(v).attr('data-unit'),
                    reason:'',
                    rated:$(v).attr('data-rated')?$(v).attr('data-rated'):'',
                })
            }else {
                message=$(v).find('.DMATNR').text()+"的物料的"+$(vb).find('.item_lot').text()+"批次的库存不足！";
                flag=false;
                return false;
            }
        })
        if(flag){
            if(num>Number($(v).attr('data-rated'))){
                message=$(v).find('.DMATNR').text()+"的物料超领！";
                flag=false;
                return false;
            }
        }else {
            return false;
        }

    });
    if(flag) {
        if(material_arr.length>0){
            var data= {
                sub_id:sub_id,
                picking_line_id:id,
                picking_id:picking_id,
                production_id: production_id,
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
                    LayerConfig('success','保存成功！');
                    $(".save").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail','保存失败！错误日志为：'+rsp.message);
                }
            }, this)
        }
    }else {
        LayerConfig('fail',message);
    }
}
if (type==2){
    var material_arr = [];
    var flag = true,message='';
    $('.table-bordered .t-body .tritem').each(function (k,v) {
        var num = 0;
        $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
            num += Number($(vb).find('.demand_num').val());
            if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.storage_number').text())){
                var _ele = $("#material"+$(v).attr('data-material')),arr_cause = [];
                _ele.find('.cause_item').each(function (item) {
                    arr_cause.push($(this).data('spanData').preselection_id);
                });
                material_arr.push({
                    id:'',
                    material_id:$(v).attr('data-material'),
                    depot_id:$(vb).attr('data-depot'),
                    inve_id:$(vb).attr('data-inve'),
                    lot:$(vb).attr('data-lot'),
                    qty:$(vb).find('.demand_num').val(),
                    unit_id:$(v).attr('data-unit'),
                    reason:arr_cause.join(),
                    rated:$(v).attr('data-rated')?$(v).attr('data-rated'):'',
                })
            }else {
                message=$(v).find('.DMATNR').text()+"的物料的"+$(vb).find('.item_lot').text()+"批次的库存不足！";
                flag=false;
                return false;
            }
        })
        if(flag){
            if(num>Number($(v).attr('data-rated'))){
                message=$(v).find('.DMATNR').text()+"的物料超领！";
                flag=false;
                return false;
            }
        }else {
            return false;
        }

    });
    if(flag) {
        if(material_arr.length>0){
            var data= {
                sub_id:sub_id,
                picking_line_id:id,
                picking_id:picking_id,
                production_id: production_id,
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
                    LayerConfig('success','保存成功！');
                    $(".save").hide();
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail','保存失败！错误日志为：'+rsp.message);
                }
            }, this)
        }
    }else {
        LayerConfig('fail',message);
    }
}


}
function createReturnOutsourceHtml(ele,data){
    ele.html('');
    $("#show_rate").hide();
    for(var i in data){
        var arr = Object.values(data[i]);
        var _html = createReturnPiciHtml(arr)
        var tr=`
            <tr class="tritem" data-material="${arr[0].material_id}" data-unit="${arr[0].bom_unit_id}">
                <td  class="DMATNR">${tansferNull(arr[0].material_item_no)}</td>
                <td  class="material_name">${tansferNull(arr[0].material_name)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(arr[0].bom_commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",arr[0]);
    }
}

function createOutsourceHtml(ele,data){
    ele.html('');
    if(type==1){
        data.forEach(function (item) {
            var _html = createPiciHtml(item.storage,item.rated)
            var tr=`
            <tr class="tritem" data-material="${item.material_id}" data-unit="${item.bom_unit_id}" data-rated="${item.rated}">
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td  class="BNFPO">${tansferNull(item.rated)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(item.bom_commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }
    if(type==2){
        $("#cause").show();
        data.forEach(function (item) {
            var _html = createPiciHtml(item.storage,item.rated)
            var tr=`
            <tr class="tritem" data-material="${item.material_id}" data-unit="${item.bom_unit_id}" data-rated="${item.rated}">
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td  class="BNFPO">${tansferNull(item.rated)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(item.bom_commercial)}</td> 
                <td style="padding: 3px;">
                    <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                    <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                </td>        
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        })
    }


}
function createReturnPiciHtml(data){
    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){
            trs+= `
			<tr class="bacth_show" data-inve="${tansferNull(item.inve_id)}" data-lot="${tansferNull(item.lot)}" data-depot="${item.depot_id}">
			<td class="item_so">${tansferNull(item.sale_order_code)}</td>
			<td class="item_po">${tansferNull(item.po_number)}</td>
			<td class="item_wo">${tansferNull(item.wo_number)}</td>
			<td class="item_lot">${tansferNull(item.lot)}</td>
			<td class="total_qty">${tansferNull(item.total_qty)}</td>
			<td>
			    <input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value=""  class="el-input demand_num" >
            </td>
			
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="6" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">累计领补量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`;
    return thtml;
}

function createPiciHtml(data,qty){
        var trs='';
        if(data&&data.length){
            data.forEach(function(item,index){
                trs+= `
			<tr class="bacth_show" data-inve="${tansferNull(item.inve_id)}" data-lot="${tansferNull(item.lot)}" data-depot="${item.depot_id}">
			<td class="item_so">${tansferNull(item.sale_order_code)}</td>
			<td class="item_po">${tansferNull(item.po_number)}</td>
			<td class="item_wo">${tansferNull(item.wo_number)}</td>
			<td class="item_lot">${tansferNull(item.lot)}</td>
			<td class="storage_number">${tansferNull(item.storage_validate_quantity)}</td>
			<td>
			    <input type="number" min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${data.length==1?qty:''}"  class="el-input demand_num" >
            </td>
			
			</tr>
			`;
            })
        }else{
            trs='<tr><td colspan="6" class="center">暂无数据</td></tr>';
        }
        var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`;
        return thtml;
}
