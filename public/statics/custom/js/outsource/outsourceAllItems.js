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
    type_code = getQueryString('type_code');

    var typeStr = {
        ZY03:'委外定额领料',
        ZB03:'委外补料',
        ZY06:'委外定额退料',
        ZY05:'委外超耗补料',
        ZY04:'委外超发退料'
    };
    $('#show_title').text(typeStr[type_code])
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
        url: URLS['outsource'].showMore+"?"+_token+"&ids="+ids,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var _html = '';
            rsp.results.forEach(function (item) {
                var line = createOutsourceHtml(item[0].lines);

                _html += `<form id="addSBasic_form" class="formTemplate formStorage normal" style="margin-bottom: 60px;border: 1px solid #ccc;padding:10px;">
                            <input type="hidden" class="showItemId" value="${item[0].id}">
                            <h3 id="show_title"></h3>
                            <div id="show_all">
                                <div>
                                    <div class="bom_blockquote">
                                        <h4>基本信息</h4>
                                        <div style="display: flex;">
                                            <div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="position: relative;width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">采购凭证编号</label>
                                                        <input type="text" id="EBELN" class="EBELN" readonly="readonly" disabled class="el-input" value="${item[0].EBELN}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                                </div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">采购凭证类型</label>
                                                        <input type="text" readonly id="BSART" class="el-input" placeholder="采购凭证类型" value="${item[0].BSART}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 20px;"></p>
                                                </div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">采购组 </label>
                                                        <input type="text" readonly="readonly" id="EKGRP" class="el-input" value="${item[0].EKGRP}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 20px;"></p>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">公司代码</label>
                                                        <input type="text" id="BUKRS" readonly="readonly" class="el-input" value="${item[0].BUKRS}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                                </div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">供应商或债权人的帐号</label>
                                                        <input type="text" id="LIFNR" readonly="readonly" class="el-input" value="${item[0].LIFNR}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">采购凭证类别</label>
                                                        <input type="text" id="BSTYP" readonly="readonly" class="el-input" value="${item[0].BSTYP}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 30px;"></p>
                                                </div>
                                                <div class="el-form-item">
                                                    <div class="el-form-item-div" style="width: 100%;">
                                                        <label class="el-form-item-label" style="width: 150px;">采购组织</label>
                                                        <input type="text" id="EKORG" readonly="readonly" class="el-input" value="${item[0].EKORG}">
                                                    </div>
                                                    <p class="errorMessage" style="padding-left: 20px;"></p>
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
                                                        <th  class="thead">采购凭证的项目编号</th>
                                                        <th  class="thead">生产订单号</th>
                                                        <th  class="thead">物料编号</th>
                                                        <th  class="thead">物料名称</th>
                                                        <th  class="thead">工厂</th>
                                                        <th  class="thead">采购仓储</th>
                                                        <th  class="thead">采购申请编号</th>
                                                        <th  class="thead">采购申请的项目编号</th>
                                                        <th  class="thead">额定量</th>
                                                        <th  class="thead">实发数量</th>
                                                        <th  class="thead">需求量</th>
                                                        <th  class="thead">计量单位</th>
                                                        <th class="thead"></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody class="t-body">
                                                        ${line?line:`<td class="nowrap" colspan="13" style="text-align: center;">暂无数据</td>`}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>`
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
}

function submitPickingList() {
    var items = [];
    $('.formStorage').each(function (ks,vs) {
        var material_arr = [];
        $(this).find('.table-bordered .t-body .tritem').each(function (k,v) {
            if($(v).find('.demand_num').val()!=''){
                material_arr.push({
                    id:'',
                    EBELN:$(vs).find('.EBELN').val(),
                    EBELP:$(v).find('.EBELP').text(),
                    BANFN:$(v).find('.BANFN').text(),
                    BNFPO:$(v).find('.BNFPO').text(),
                    XQSLDW:$(v).find('.DMEINS').text(),
                    LGFSB:$(v).find('.LGFSB').text(),
                    DWERKS:$(v).find('.DWERKS').text(),
                    MATNR:$(v).find('.DMATNR').text(),
                    XQSL:$(v).find('.demand_num').val(),
                    picking_line_item_id:$(v).attr('data-id'),
                })
            }

        })
        var itemi= {
            out_picking_id:$(this).find('.showItemId').val(),
            items:JSON.stringify(material_arr),
            type:typenumber[type_code],
            type_code:type_code,
        };
        items.push(itemi)
    });

    AjaxClient.post({
        url: URLS['outsource'].storeMoreZy,
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
            var  tr = ''
            rsp.results.forEach(function (item) {
                tr +=  `<tr>
                            <td>${item.EBELN}</td>
                            <td>${item.message}</td>
                        </tr>`
            })
            var table = `<table>
                            <thead>
                                <tr>
                                    <td>采购凭证号</td>
                                    <td>信息</td> 
                                </tr>
                            </thead>
                            <tbody>
                                ${tr}
                            </tbody>
                         </table>`
            layer.confirm(`${table}`, {
                icon: 6,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
            });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)


}

function createOutsourceHtml(data){
    var tr = '';
    data.forEach(function (item) {
        item.items.forEach(function (val) {
            if(val.zuofei!=1){
                tr+=`
                        <tr class="tritem" data-id="${val.id}">
                            <td  class="EBELP">${tansferNull(item.EBELP)}</td>
                            <td  class="AUFNR">${tansferNull(item.AUFNR)}</td>
                            <td  class="DMATNR">${tansferNull(val.DMATNR)}</td>
                            <td  class="material_name">${tansferNull(val.material_name)}</td>
                            <td  class="DWERKS">${tansferNull(val.DWERKS)}</td>
                            <td  class="LGFSB">${tansferNull(val.LGFSB)}</td>
                            <td  class="BANFN">${tansferNull(val.BANFN)}</td>
                            <td  class="BNFPO">${tansferNull(val.BNFPO)}</td>
                            <td>${tansferNull(val.DBDMNG)}</td>
                            <td>${tansferNull(val.actual_send_qty)}</td>
                            ${type_code=='ZY03'?``:''}
                            <td><input type="number" min="0" style="line-height: 40px;" value="${type_code=='ZY03'?(Subtr(val.DBDMNG,val.actual_send_qty)>0?Subtr(val.DBDMNG,val.actual_send_qty):0):''}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="" class="el-input demand_num" ></td>
                            <td  class="DMEINS">${tansferNull(val.DMEINS)}</td>         
                            <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>         
                        </tr>
                    `;

            }

        })
    })
    return tr

}
function Subtr(arg1,arg2){
    var r1,r2,m,n;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
}