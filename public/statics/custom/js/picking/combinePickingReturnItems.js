var work_order_ids;
var zrr = $('#zrr').text();
var zrr_id = $('#zrr_id').text();
$(function () {
	work_order_ids = getQueryString('work_order_ids');
    type = getQueryString('type');
    // workbench_no = tansferNull(getQueryString('workbench_no')),
    // sales_order_code = tansferNull(getQueryString('sales_order_code')),
    // sales_order_project_code = tansferNull(getQueryString('sales_order_project_code')),
    // type = tansferNull(getQueryString('type'));

        $('#picking_title').text('合并退料单');
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
                        
                    </div>
                    <div>
                        
                        
                    </div>
                    <div>
                          
                    </div>`);
        getworkOrderView(work_order_ids,type);

        $('#employee').autocomplete({
            url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
            param:'name'
        });
        laydate.render({
            elem: '#chooseTime',
            type: 'datetime',
            value: new Date()
        });

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
	// var date = $('#chooseTime').val();
	
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
    }else {
		let arr = JSON.parse(work_order_ids);
		let tbody = $('.t-body tr');
		let arr_tr = [];
		let work_ids = [];

		for(let i=0; i<tbody.length; i++) {
			arr_tr.push({
				material_id :$(tbody[i]).find('#code').attr('data-id'),
				reason: $(tbody[i]).find('#text').val()
			});
		}
		

		arr_tr.forEach(function (items) {
			arr.forEach(function(item) {
				if (item.material_id == items.material_id) {
					work_ids.push({
						inve_id: item.inve_id,
						material_id: item.material_id,
						wo_number: item.wo_number,
						work_order_id: item.work_order_id,
						reason: items.reason
					})
				}
			});
		})

        if(type){
            var data = {
                work_order_material_ids:JSON.stringify(work_ids),
                employee_id:employee,
                return_common_material:type,
                _token:TOKEN
            }
        }else {
            var data = {
				work_order_material_ids: JSON.stringify(work_ids),
                employee_id:employee,
                _token:TOKEN
            }
        }

        AjaxClient.post({
            url: URLS['work'].MergerReturn,
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
function getworkOrderView(ids,type) {
    var url = '';
    if(type){
        url = URLS['order'].getReturnStoreData + _token + "&work_order_material_ids=" + ids + "&return_common_material=" + type;
    }else {
        url = URLS['order'].getReturnStoreData + _token + "&work_order_material_ids=" + ids;
    }
    AjaxClient.get({
        url: url,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pickingList = rsp.results;
            createAllHtml(pickingList)
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
            _html += showItems(item.materials,item.send_depot);
        })
        ele.html(_html)
    }
}
//进料
function showItems(data,send_depot) {
    var tr = '',_table = '';
    data.forEach(function (item, index) {

        if(item.item_no!="99999999"){
             tr+= `
            <tr class="material_item" data-deport="${tansferNull(item.send_depot)}" data-sp="${tansferNull(item.special_stock)}">
            <td>
                ${tansferNull(item.special_stock)}
            </td>
            <td class="item_material" id="code" data-id="${item.material_id}">${tansferNull(item.material_code)}</td>
            <td class="item_material" data-id="${item.material_id}">${tansferNull(item.material_name)}</td>
            <td class="item_material">${tansferNull(item.batch)}</td>
            <td class="material_qty">${tansferNull(item.storage_number)}</td>
            <td ><input type="number" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" readonly  placeholder="" class="qty_num deal" value="${tansferNull(item.storage_number)}" style="line-height:40px;width: 100px;"></td>
            <td class="item_unit" data-id="${item.unit_id}">${tansferNull(item.bom_commercial)}</td>
			<td>${item.m_display==1?tansferNull(item.m_value)+tansferNull(item.m_unit):''}</td>
			<td><textarea style="margin-top:10px;" id="text" rows="2" cols="20"></textarea></td>
            </tr>`;
        }

    })
    _table = `<div class="storage_blockquote">
                    <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 （${send_depot}）</h4>
                    <div class="basic_info">
                        <div class="table-container">
                            <table class="storage_table item_table table-bordered">
                                <thead>
                                <tr>
                                    <th class="thead"></th>
                                    <th class="thead">物料编码</th>
                                    <th class="thead">物料名称</th>
                                    <th class="thead">批次</th>
                                    <th class="thead">库存数量</th>
                                    <th class="thead">数量</th>
                                    <th class="thead">单位</th>
									<th class="thead">米数</th>
                                    <th class="thead">退料原因</th>
                                </tr>
                                </thead>
                                <tbody class="t-body">
                                ${tr}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
    return _table;
}

