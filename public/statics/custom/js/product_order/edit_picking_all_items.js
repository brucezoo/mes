var id;
$(function () {
    id = getQueryString('id');
    $('#basic_info_show').html(`<div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">线边仓</label>
                                                <input type="text" id="workbench_code" readonly class="el-input"  value="">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">合并时间</label>
                                                <input type="text" id="time" readonly class="el-input"  value="">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                     
                                </div>
                                <div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">责任人</label>
                                                <input type="text" id="employee" readonly class="el-input"  value="">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">采购仓储</label>
                                                <input type="text" id="send_depot" readonly class="el-input"  value="">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">合并单号</label>
                                                <input type="text" id="code" readonly class="el-input"  value="">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                    
                                </div>`);

    getAllInfo();
    bindEvent();
});
function bindEvent() {
    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        $("#addSBasic_form").print();
    })
}

function getAllInfo() {
    AjaxClient.get({
        url: URLS['pickAll'].showInfo+"?" + _token + "&material_combine_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#code').val(rsp.results.code);
            $('#employee').val(rsp.results.employee_name);
            $('#time').val(rsp.results.ctime);
            $('#workbench_code').val(rsp.results.line_depot_name+"（"+rsp.results.line_depot_code+"）");
            $('#send_depot').val(rsp.results.send_depot);
            creatHtml(rsp.results.lists)

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 5,offset: '250px',time: 1500});
        }
    }, this)


}
function creatHtml(data) {

    var ele = $('.storage_table .table-body');
    ele.html("");
    data.forEach(function (item, index) {

        var piciHtml = createPiciHtml(item.items);

        var tr = `<tr>           
                    <td class="center">${tansferNull(item.material_code)}</td>
                    <td class="center" width="200px;">${tansferNull(item.material_name)}</td>                   	
                    <td class="center">${tansferNull(item.old_material_code)}</td>                   	
                    <td>
                         ${piciHtml} 
                    </td>
                    <td class="center">${tansferNull(item.sum_demand_qty)}</td>
                    <td class="center">${tansferNull(item.demand_unit)}</td>                   	
                    <td class="center"></td>                   	
                   </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);

    })
}
function createPiciHtml(data){

    var trs='';
    if(data&&data.length){
        data.forEach(function(item){

            trs+= `
			<tr data-id="" class="work_order_table_item">
			<td class="center">${tansferNull(item.inspur_sales_order_code)}</td>
			<td class="center">${tansferNull(item.sale_order_code)}</td>
			<td class="center">${tansferNull(item.sale_order_project_code)}</td>
			<td class="center">${tansferNull(item.material_requisition_code)}</td>
			<td class="center">${tansferNull(item.demand_qty)}</td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="2" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="center">浪潮销售订单号</th>
                        <th class="center">销售订单号</th>
                        <th class="center">销售行项号</th>
                        <th class="center">领料单号</th>
                        <th class="center">领料数量</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}
