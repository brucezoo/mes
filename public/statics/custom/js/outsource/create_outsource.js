var id,type,type_code,pageNoItem = 1,pageSizeItem = 50, pickingList='',HAS_ZY03 = 0 ,typeStr;
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    type_code = getQueryString('type_code');
    typeStr = {
        ZY03:'委外定额领料',
        ZB03:'委外补料',
        ZY06:'委外定额退料',
        ZY05:'委外超耗补料',
        ZY04:'委外超发退料'
    };
    $('#show_title').text(typeStr[type_code])
    if (id != undefined) {
        getOutsourceItem(id);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    $('#storage').autocomplete({
        url: URLS['outsource'].Factory+"?"+_token+"&sort=id&order=asc&page_no=1&page_size=10",
        param:'factory_name',
        showCode:'factory_name'
    });
    $('#employee').autocomplete({
        url: URLS['outsource'].judge_person+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });

    bindEvent();
});
function getOutsourceItem(id) {
    AjaxClient.get({
        url: URLS['outsource'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#EBELN').val(rsp.results[0].EBELN);
            $('#BUKRS').val(rsp.results[0].BUKRS);
            $('#BSTYP').val(rsp.results[0].BSTYP);
            $('#BSART').val(rsp.results[0].BSART);
            $('#LIFNR').val(rsp.results[0].LIFNR);
            $('#EKORG').val(rsp.results[0].EKORG);
            $('#EKGRP').val(rsp.results[0].EKGRP);
            HAS_ZY03 = rsp.results[0].HAS_ZY03;
            createOutsourceHtml($('.item_outsource_table .t-body'),rsp.results[0].lines);

        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','获取领料单失败！')
        }
    },this);


}

function bindEvent() {
    $('body').on('click','.save:not(".is-disabled")',function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        if(HAS_ZY03==0){
            submitPickingList()
        }
        if(HAS_ZY03==1){
            layer.confirm(`您已${typeStr[type_code]}，是否继续${typeStr[type_code]}?`, {icon: 3, title:'提示',offset: '250px',end:function(){
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

    var material_arr = [],flag = true;
    if(type_code == 'ZB03' || type_code == 'ZY05'){
        $('.table-bordered .t-body tr').each(function (k,v) {
            var _ele = $("#material"+$(v).attr('data-material')),arr_cause = [];
            _ele.find('.cause_item').each(function (item) {
                arr_cause.push($(this).data('spanData').preselection_id);
            });
            if($(v).find('.demand_num').val()!=''){
                if($(v).find('.LGFSB').val() != ''){
                    material_arr.push({
                        id:'',
                        EBELN:$('#EBELN').val(),
                        EBELP:$(v).find('.EBELP').text(),
                        BANFN:$(v).find('.BANFN').text(),
                        BNFPO:$(v).find('.BNFPO').text(),
                        XQSLDW:$(v).find('.DMEINS').text(),
                        LGFSB:$(v).find('.LGFSB').val(),
                        DWERKS:$(v).find('.DWERKS').text(),
                        MATNR:$(v).find('.DMATNR').text(),
                        XQSL:$(v).find('.demand_num').val(),
                        reason:arr_cause.join(),
                        picking_line_item_id:$(v).attr('data-id'),
                    })
                }else {
                    flag = false;
                    return false;
                }

            }
        })
    }else {
        $('.table-bordered .t-body tr').each(function (k,v) {
            if($(v).find('.demand_num').val()!=''){
                if($(v).find('.LGFSB').val() != ''){
                    material_arr.push({
                        id:'',
                        EBELN:$('#EBELN').val(),
                        EBELP:$(v).find('.EBELP').text(),
                        BANFN:$(v).find('.BANFN').text(),
                        BNFPO:$(v).find('.BNFPO').text(),
                        XQSLDW:$(v).find('.DMEINS').text(),
                        LGFSB:$(v).find('.LGFSB').val(),
                        DWERKS:$(v).find('.DWERKS').text(),
                        MATNR:$(v).find('.DMATNR').text(),
                        XQSL:$(v).find('.demand_num').val(),
                        reason:'',
                        picking_line_item_id:$(v).attr('data-id'),
                    })
                }else {
                    flag = false;
                    return false;
                }

            }
        })
    }
    if(flag){
        var data= {
            out_picking_id:id,
            items:JSON.stringify(material_arr),
            type:type,
            type_code:type_code,
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
                LayerConfig('success','成功！')
                $('.save').removeClass('is-disabled');

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message);
                $('.save').removeClass('is-disabled');
            }
        }, this)
    }else {
        LayerConfig('fail',"请补全仓储点！");
    }
}

function createOutsourceHtml(ele,data){
    ele.html('');
    if(type_code == 'ZB03' || type_code == 'ZY05'){
        $("#cause").show();
    }
    data.forEach(function (item) {
        item.items.forEach(function (val) {
            if(val.zuofei!=1){
                var tr=`
                        <tr class="tritem" data-id="${val.id}" data-material="${val.material_item_no}" data="${val.needNumber}">
                            <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                            <td  class="AUFNR">${tansferNull(item.AUFNR)}</td>
                            <td  class="DMATNR">${tansferNull(val.DMATNR)}</td>
                            <td  class="material_name">${tansferNull(val.material_name)}</td>
                            <td  class="DWERKS">${tansferNull(val.DWERKS)}</td>
                            <td><input class="LGFSB" style="width: 60px;height: 40px;" type="text" value="${tansferNull(val.LGFSB)}"></td>
                            <td  class="BANFN">${tansferNull(val.BANFN)}</td>
                            <td  class="BNFPO">${tansferNull(val.BNFPO)}</td>
                            <td>${tansferNull(val.DBDMNG)}</td>
                            <td>${tansferNull(val.actual_send_qty)}</td>
                            <td><input type="number" min="0" style="line-height: 40px;" value="${type_code=='ZY03'?val.needNumber:''}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="" class="el-input demand_num" ></td>
                            <td  class="DMEINS">${tansferNull(val.DMEINS)}</td>
                            ${type_code == 'ZB03' || type_code == 'ZY05' ?`<td style="padding: 3px;">
                                <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${val.material_item_no}" class="MKPF_BKTXT" ></div>
                                <button type="button" data-id="${val.material_item_no}" class="button pop-button select">选择</button>
                            </td>`:''}         
                            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
                            </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        })
    })

}
function Subtr(arg1,arg2){
    var r1,r2,m,n;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
}