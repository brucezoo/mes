var banchs,workBenchId,workBenchName,allInfo;
$(function () {
    banchs = getQueryString('banchs');
    workbench_id = getQueryString('workbench_id');
    workBenchName = getQueryString('workBenchName');
    $('#basic_info_show').html(`<div>
                                    <div class="el-form-item">
                                        <div class="el-form-item">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">线边仓</label>
                                                <input type="text" id="workbench_code" readonly class="el-input"  value="${workBenchName}">
                                            </div>
                                            <p class="errorMessage" style="padding-left: 30px;"></p>
                                        </div>
                                    </div>
                                      
                                </div>
                                <div>
                                    
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                            <div class="el-select-dropdown-wrap">
                                                <input type="text" id="employee" autocomplete="off" class="el-input" placeholder="请输入责任人" value="">
                                            </div>
                                        </div>
                                        <p class="errorMessage" style="padding-left: 30px;"></p>
                                    </div>
                                </div>
                                <div>
                                
                                    
                                </div>`);
    $('#employee').autocomplete({
        url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });
    getAllInfo();
    bindEvent()
});
function bindEvent() {
    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        var $employee=$('#employee');
        var employee=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').id:'';
        if(employee==''){
            LayerConfig('fail',"请选择责任人！");
        }else {
            submitAllPicking(employee)
        }
    })
}
function submitAllPicking(employee) {
    AjaxClient.post({
        url: URLS['pickAll'].storeCreateData,
        data:{
            data:JSON.stringify(allInfo),
            employee_id:employee,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.confirm("创建成功！", {
                icon: 1,
                btn: ['确定'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                layer.close(index);
                window.location.href = '/PickingAll/PickingAllPageIndex';
            })
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function getAllInfo() {

    AjaxClient.get({
        url: URLS['pickAll'].showCreateData +"?"+ _token + "&material_requisition_ids=" + banchs,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var html = '';
            allInfo = rsp.results;
            rsp.results.forEach(function (item) {
                html+=creatHtml(item);
            })
            $("#body_items").html(html)
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)




}
function creatHtml(data) {
    var tr = '';
    if(data.materials.length>0){
        data.materials.forEach(function (item, index) {

            var piciHtml = createPiciHtml(item.mrs);
            tr += `<tr>           
                    <td class="center">${tansferNull(item.send_depot)}</td>
                    <td class="center">${tansferNull(item.material_code)}</td>                   	
                    <td class="center">${tansferNull(item.material_name)}</td>                   	
                    <td class="center">${tansferNull(item.inspur_material_code)}</td>                   	
                    <td>
                         ${piciHtml} 
                    </td>
                    <td class="center">
                    ${tansferNull(item.sum_demand_qty)}
                    </td>
                    <td class="center">${tansferNull(item.demand_unit)}</td>                   	
                   </tr>`;
        })
    }else {
        tr='<tr><td colspan="9" class="center">暂无数据</td></tr>';

    }
    var _html = `<div style="margin-top: 100px;">
                    <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
                    <div class="basic_info">
                        <div class="table-container">
                            <table class="storage_table item_table table-bordered">
                                <thead>
                                <tr>
                                    
                                    <th class="center" width="5%">采购仓储</th>
                                    <th class="center" width="10%">编码</th>
                                    <th class="center" width="10%">名称</th>
                                    <th class="center" width="10%">浪潮物料编码</th>
                                    <th class="center" width="35%">领料单信息</th>
                                    <th class="center" width="10%">总数量</th>
                                    <th class="center" width="10%">单位</th>
                                </tr>
                                </thead>
                                <tbody class="table-body">
                                    ${tr}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
    return _html

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
                    <tr style="background-color: #cccccc">
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
