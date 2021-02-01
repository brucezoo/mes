var ids,type,type_code,
    pickingList='';
var typenumber = {
    ZY03:5,
    ZB03:4,
    ZY06:3,
    ZY05:2,
    ZY04:1
};
$(function () {
    ids = getQueryString('ids');
    $('#show_title').text('车间合并领料')
    if (ids != undefined) {
        getOutsourceItem(ids);
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    bindEvent();
});
function getOutsourceItem(ids) {
    AjaxClient.get({
        url: URLS['outsource'].showMoreShop+"?"+_token+"&picking_ids="+ids,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var _html = '';
            rsp.results.forEach(function (item) {
                if(item.has_shop==0){
                    var line = createOutsourceHtml(item.diff);
                    _html += `<form class="formTemplate formStorage normal" style="margin-bottom: 60px;border: 1px solid #ccc;padding:10px;">
                                    <input type="hidden" class="showItemId" value="${item.id}">
                                    <input type="hidden" class="subId" value="${item.sub_id}">
                                    <input type="hidden" class="pickingId" value="${item.picking_id}">
                                    <input type="hidden" class="productionId" value="${item.production_id}">
                                    <input type="hidden" class="BANFN" value="${item.BANFN}">
                                    <input type="hidden" class="BNFPO" value="${item.BNFPO}">

        <div class="bom_blockquote">
            <h3>基本信息</h3>
            <div style="display: flex;">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative;width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">采购凭证</label>
                            <input type="text" id="sub" readonly="readonly" disabled class="el-input" value="${item.EBELN}">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">订单号</label>
                            <input type="text" readonly id="AUFNR" class="el-input" placeholder="订单号" value="${item.AUFNR}">
                        </div>
                        <p class="errorMessage" style="padding-left: 20px;"></p>
                    </div>
                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">采购申请编号</label>
                            <input type="text" id="BANFN" readonly="readonly" class="el-input" value="${item.BANFN}">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>

                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">采购申请的项目编号</label>
                            <input type="text" id="BNFPO" readonly="readonly" class="el-input" value="${item.BNFPO}">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="storage_blockquote">
            <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
            <div class="basic_info">
                <div class="table-container">
                    <table class="storage_table item_table table-bordered item_outsource_table">
                        <thead>
                        <tr>
                            <th  class="thead">物料编号</th>
                            <th  class="thead">物料名称</th>
                            <th  class="thead" id="show_rate">额定数量</th>
                            <th  class="thead">需求量</th>
                            <th  class="thead">计量单位</th>
                            <th  class="thead" id="cause" style="display: none;">补料原因</th>
                            <th class="thead"></th>
                        </tr>
                        </thead>
                        <tbody class="t-body">
                        <tr>
                            ${line?line:`<td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>`}
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </form>`;
                }

            })
            $("#showAllItems").html(_html);
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
    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
}

function submitPickingList() {
    var items = [];
    var flag = true,message='';
    $('.formStorage').each(function (ksf,vsf) {
        var material_arr = [];
        $(this).find('.table-bordered .t-body .tritem').each(function (k,v) {
            var num = 0;
            $(v).find('.wrap_table_div .table_tbody .bacth_show').each(function (kb,vb) {
                num += Number($(vb).find('.demand_num').val());
                if(Number($(vb).find('.demand_num').val()) <= Number($(vb).find('.storage_number').text())){
                    if($(vb).find('.demand_num').val()>0){
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
                    }
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
        if(flag){
            var itemi= {
                sub_id:$(this).find('.subId').val(),
                picking_line_id:$(this).find('.showItemId').val(),
                picking_id:$(this).find('.pickingId').val(),
                production_id: $(this).find('.productionId').val(),
                BANFN:$(this).find('.BANFN').val(),
                BNFPO:$(this).find('.BNFPO').val(),
                items:JSON.stringify(material_arr),
                type:1
            };
            items.push(itemi)
        }else {
            return false;
        }

    });
    if(flag){
        AjaxClient.post({
            url: URLS['outsource'].storeMoreShop,
            data:{
                moreItems:items,
                _token:TOKEN
            },
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','创建成功！');

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message);
            }
        }, this)
    }



}

function createOutsourceHtml(data){
    var tr = '';
    data.forEach(function (item) {
        var _html = createPiciHtml(item.storage,item.rated)
        tr+=`<tr class="tritem" data-material="${item.material_id}" data-unit="${item.bom_unit_id}" data-rated="${item.rated}">
                <td  class="DMATNR">${tansferNull(item.material_code)}</td>
                <td  class="material_name">${tansferNull(item.material_name)}</td>
                <td  class="BNFPO">${tansferNull(item.rated)}</td>
                <td>${_html}</td>
                <td  class="DMEINS">${tansferNull(item.bom_commercial)}</td>         
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
            </tr>`;
    })
    return tr

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
