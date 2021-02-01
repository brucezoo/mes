var work_order_ids,workbench_id='',workbench_name='',workbench_no='';
var zrr = $('#zrr').text();
var zrr_id = $('#zrr_id').text();
$(function () {
    work_order_ids = getQueryString('work_order_ids');
    // workbench_no = tansferNull(getQueryString('workbench_no')),
    // sales_order_code = tansferNull(getQueryString('sales_order_code')),
    // sales_order_project_code = tansferNull(getQueryString('sales_order_project_code')),
    // type = tansferNull(getQueryString('type'));

        $('#picking_title').text('合并领料单');
        $('#basic_info_show').html(`
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" autocomplete="off" placeholder="请输入责任人" data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售订单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input" autocomplete="off" placeholder="请输入销售订单号" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单号</label>
                                <input type="text" id="work_order_code" readonly class="el-input" autocomplete="off" placeholder="请输入工单号" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <input type="text" id="workbench_no" class="el-input" autocomplete="off" placeholder="请输入工位" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项号</label>
                                <input type="text" id="sales_order_project_code" readonly class="el-input" autocomplete="off" placeholder="请输入销售行项号" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                    </div>
                    <div>
                          <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">配送时间</label>
                              <input type="text" style="background-color: #fff !important;" id="chooseTime" readonly class="el-input" placeholder="请选择时间" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
                          </div>
                          <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">生产订单号</label>
                                <input type="text" id="product_order_code" readonly class="el-input" autocomplete="off" placeholder="请输入生产订单号" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>`);
        getworkOrderView(work_order_ids);

        $('#employee').autocomplete({
            url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
            param:'name'
        });
        // laydate.render({
        //     elem: '#chooseTime',
        //     type: 'datetime',
        //     value: new Date()
        // });

    bindEvent();
});

function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        submitPickingList()
    });


    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
}
function submitPickingList() {
    var $employee=$('#employee');
    var employee= '';
	var date = $('#chooseTime').val();
	

	// mao  测试
	var ul = $('.el-select-dropdown-list li').length;
	if (ul == 0) {
		employee = $employee.attr('data-id');
	} else {
		employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
			$employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
	}
    if(!employee){
        layer.confirm('请补全责任人！', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
        });
    }else if(!date){
        layer.confirm('请补全配送时间！', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
        });
    }else {
        var data = {
            work_order_ids:work_order_ids,
            employee_id:employee,
            bench_no:$('#workbench_no').val()?$('#workbench_no').val().trim():'',
            date:(new Date(date).getTime())/1000,
            _token:TOKEN
        }
        AjaxClient.post({
            url: URLS['work'].addShopMergerPicking,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                layer.confirm('合并领料单创建成功！', {icon: 1, title:'提示',offset: '250px',btn: ['确定']}, function(index){
                    layer.close(index);
                    window.history.back();
                });

            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message)
            }
        }, this)

    }

}
function getworkOrderView(ids) {
    AjaxClient.get({
        url: URLS['order'].getShopStoreData + _token + "&work_order_ids=" + ids,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pickingList = rsp.results;
            $('#workbench_no').val(pickingList.title_info.bench_no)
            $('#work_order_code').val(pickingList.title_info.work_order_code)
            $('#sales_order_project_code').val(pickingList.title_info.sales_order_project_code)
            $('#sales_order_code').val(pickingList.title_info.sales_order_code)
            $('#product_order_code').val(pickingList.title_info.product_order_code)
            $('#chooseTime').val(pickingList.title_info.dispatch_time)

            createAllHtml(pickingList.picking_res)
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 5,offset: '250px',time: 3000});
        }
    }, this)
}
function createAllHtml(data) {
    var ele = $('#materials_items');
    var _html = '';
    if(data.length>0){
        ele.html('');
        data.forEach(function (item) {
            _html += showItems(item.materials);
        })
        ele.html(_html)
    }
}
//进料
function showItems(data) {
    var tr = '',_table = '';
    data.forEach(function (item, index) {

        if(item.item_no!="99999999"&&item.SCHGT!="X"){
             tr+= `
            <tr class="material_item" data-deport="${tansferNull(item.depot)}" data-sp="${tansferNull(item.special_stock)}">
            <td>
                ${tansferNull(item.special_stock)}
            </td>
            <td class="item_material" data-id="${item.material_id}">${tansferNull(item.material_name)}</td>
            <td class="material_qty">${tansferNull(item.count)}</td>
            <td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" readonly  placeholder="" class="qty_num deal" value="${tansferNull(item.count)}" style="line-height:40px;width: 100px;"></td>
            <td class="item_unit" data-id="${item.unit_id}">${tansferNull(item.unit)}</td>
            <td style="color: ${item.no_plan_picking==2?'red':''};">${tansferNull(item.no_plan_picking==1?"否":item.no_plan_picking==2?"是":"")}</td>
            </tr>`;
        }
        _table = `<div class="storage_blockquote">
                    <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 </h4>
                    <div class="basic_info">
                        <div class="table-container">
                            <table class="storage_table item_table table-bordered">
                                <thead>
                                <tr>
                                    <th class="thead"></th>
                                    <th class="thead">名称</th>
                                    <th class="thead">数量</th>
                                    <th class="thead">需求数量</th>
                                    <th class="thead">单位</th>
                                    <th class="thead">非计划</th>
                                </tr>
                                </thead>
                                <tbody class="t-body">
                                ${tr}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
    })
    return _table;
}

