var id, pickingList='';
var checked_item = [];
var strs = '';
$(function () {
    id = getQueryString('id');
	document.getElementById('checkAll').checked = false;
    if (id != undefined) {
        getPickView();
    } else {
        layer.msg('url缺少链接参数，请给到参数', {
            icon: 5,
            offset: '250px'
        });
    }
    bindEvent();
});

function getPickView() {

    AjaxClient.get({
        url: URLS['order'].workPickSend +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            pickingList=rsp.results;
            $('#picking_title').text('领料单发料');
            $('#basic_form_show').html(`<div>
              
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">发料仓储</label>
                        <input type="text" id="send_depot" readonly class="el-input" placeholder="请输入发料仓储" value="${tansferNull(rsp.results.send_depot_name)}">
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">计划时间</label>
                        <input type="text" id="plan_start_time" readonly class="el-input"  value="${tansferNull(rsp.results.dispatch_time)}">
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
            </div>
            <div>
                
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">需求库存地点</label>
                        <input type="text" id="storage_wo" readonly class="el-input" placeholder="请输入需求库存地点" value="${tansferNull(rsp.results.get_depot_name)}">
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
                
            </div>
            <div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">责任人</label>
                        <div class="el-select-dropdown-wrap">
                            <input type="text" id="employee" readonly class="el-input" placeholder="请输入责任人" value="${tansferNull(rsp.results.employee_name)}">
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
            </div>`);

            if(rsp.results.materials.length>0){
                showInItem(rsp.results.materials);
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取领料详情失败，请刷新重试' ,{icon: 5,offset: '250px'});
        }
    }, this)
}


function bindEvent() {

     $('body').on('click','.table-bordered .send_item',function () {
         var item_id = $(this).attr('data-item_id');
         getStorage(item_id);
     });
    $('body').on('click','.formStorage .cancle',function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.formStorage .submit',function (e) {
        e.stopPropagation();

        subStorageItems()

    });
}
function subStorageItems() {
    var items = [];
    var item_id = $('#itemId').val()
    $("#storageItems").find('tr').each(function (k,v) {
        if($(v).find('.stoNum').val()>0){
            items.push({
                inve_id:$(v).attr('data-id'),
                send_qty:$(v).find('.stoNum').val()
            })
        }
    });
    if(items.length>0){
        var data = {
            item_id:item_id,
            inve_info:JSON.stringify(items),
            _token:TOKEN
        }
        AjaxClient.post({
            url: URLS['order'].subSend,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                layer.close(layerModal);
                $('#sendItem'+item_id).hide();
                layer.confirm('发料成功！', {
                  icon: 1, title: '提示', offset: '250px', end: function () {
                  }
                },function (index) {
                  getPickView();
                  layer.close(index);
                });
            },
            fail:function (rsp) {
                layer.close(layerLoading);
                layer.msg(rsp.message ,{icon: 5,offset: '250px'});
            }
        });
    }else {
        layer.msg('请选择发料数据！' ,{icon: 3,offset: '250px'});
    }


}
function getStorage(material_requisition_item_id) {
    AjaxClient.get({
        url: URLS['order'].getItemMaterialStorage +"?"+ _token + "&material_requisition_item_id=" + material_requisition_item_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            showModal(rsp.results,material_requisition_item_id)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message ,{icon: 5,offset: '250px'});
        }
    });
}

function showModal(data,id) {
    var tr = '';
    data.forEach(function (item) {
        tr += `<tr data-id="${item.inve_id}">
                   <td>${item.sale_order_code}</td>
                   <td>${item.sales_order_project_code}</td>
                   <td>${item.product_order_code}</td>
				   <td>${item.work_order_code}</td>
				   <td>${item.material_code}</td>
                   <td>${item.batch}</td>
                   <td>${item.storage_number}</td>
                   <td><input type="number" class="stoNum" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.default_qty}"></td>
                   <td>${item.unit_name}</td>
               </tr>`
    });
    layerModal = layer.open({
        type: 1,
        title: '库存信息',
        offset: '50px',
        area: '900px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="formModal formStorage">
                    <input type="hidden" id="itemId" value="${id}">
                    <table class="storage_table item_table" >
                        <thead>
                            <tr>
                                <th>销售订单号</th>
                                <th>销售订单行项</th>
                                <th>生产订单号</th>
								<th>工单号</th>
								<th>物料号</th>
                                <th>批次</th>
                                <th>库存数量</th>
                                <th>发料数量</th>
                                <th>计量单位</th>
                            </tr>
                        </thead>
                        <tbody id="storageItems">
                            ${tr}
                        </tbody>
                    </table>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit">确定</button>
                        </div>
                    </div>
                </form>`,
        success:function () {

        },
        end:function () {

        }
    })
}
//进料
function showInItem(data) {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    data.forEach(function (item, index) {
        var piciHtml = createPiciHtml(item.wo_po_so)
        var tr = `
			<tr data-id="${item.item_id}" class="show_item">
			<td>${item.is_send == 1 ? `<input type="checkbox" class="check" data-id = "${item.item_id}">` : ''}</td>
            <td >
            ${item.is_special_stock == 'E' ?`<div>
                    <p>销售订单号：${item.sales_order_code}</p>
                    <p>行项目号：${item.sales_order_project_code}</p>
                </div>`:''}
            </td>
            <td >${tansferNull(item.material_code)}</td>
            <td >${tansferNull(item.material_name)}</td>
            <td >${tansferNull(item.rated_qty)}</td>		
            <td >${tansferNull(item.demand_qty)}</td>		
            <td >${tansferNull(item.commercial)}</td>
            <td>
                 ${piciHtml} 
            </td>
            <td>${item.is_send==1?`<button type="button" data-item_id="${item.item_id}" class="el-button el-button--primary send_item" id="sendItem${item.item_id}" style="color: #fff;background-color: #20a0ff;border-color: #20a0ff;">发料</button>`:''}</td>
            </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
    })
}

function createPiciHtml(data){

    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){
            trs+= `
			<tr>
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.qty)}</td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">已发数量</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}

$('body').on('change', '.check', function() {
	if($(this).prop('checked') == true) {
		checked_item.push($(this).attr('data-id'));
	}else {
		checked_item.splice(checked_item.indexOf($(this).attr('data-id')), 1);
	}
})

$('body').on('click', '#sendAll', function() {
	if(document.getElementById('checkAll').checked == true) {	
		checked_item = [];
		let check = $('#show_item .check');
		for(let i=0; i<check.length; i++) {
			if(check[i].checked == true) {
				checked_item.push($(check[i]).attr('data-id'));
			}
		};
	}
	if(checked_item.length != 0) {
		var str = '';
		checked_item.forEach(function(item,index) {
			if(index == 0) {
				str = item;
			}else {
				str = str + ',' + item;
			}
		})
		strs = str;
		AjaxClient.get({
			url: '/Picking/batchDeliverystorage' + "?" + _token + '&item_id=' + str,
			dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			showModals(rsp.results);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	});

	
	}else {
		layer.alert('请勾选再操作！');
	}

})


function showModals(data) {
	var tr = '';
	for(j=0; j<data.length; j++){		
			tr += `<tr data-id="${data[j].inve_id}">
                   <td>${data[j].sale_order_code}</td>
                   <td>${data[j].sales_order_project_code}</td>
                   <td>${data[j].product_order_code}</td>
				   <td>${data[j].work_order_code}</td>
				   <td>${data[j].material_code}</td>
                   <td>${data[j].batch}</td>
                   <td>${data[j].storage_number}</td>
                   <td><input type="number" class="stoNum" data-id="${data[j].item_id}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  value="${data[j].default_qty}" data-inve_id="${data[j].inve_id}"></td>
                   <td>${data[j].unit_name}</td>
               </tr>`
	};
	layerModal = layer.open({
		type: 1,
		title: '库存信息',
		offset: '50px',
		area: ['900px','800px'],
		shade: 0.1,
		shadeClose: true,
		resize: false,
		move: false,
		content: `<form class="formModal formStorage">
                    <input type="hidden" id="itemId" value="">
                    <table class="storage_table item_table" >
                        <thead>
                            <tr>
                                <th>销售订单号</th>
                                <th>销售订单行项</th>
                                <th>生产订单号</th>
								<th>工单号</th>
								<th>物料号</th>
                                <th>批次</th>
                                <th>库存数量</th>
                                <th>发料数量</th>
                                <th>计量单位</th>
                            </tr>
                        </thead>
						<tbody id="storageItem">
                            ${tr}
                        </tbody>
                    </table>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button  ok">确定</button>
                        </div>
                    </div>
                </form>`,
		success: function () {

		},
		end: function () {

		}
	})
}



	$('body').on('click', '.ok', function() {
		if ($('#storageItem tr').length > 0){
			let qty = $('#storageItem input');
			let data = [];
			if (qty.length != 0) {
				for (let i = 0; i < qty.length; i++) {
					data.push({
						item_id: $(qty[i]).attr('data-id'),
						inve_id: $(qty[i]).attr('data-inve_id'),
						qty: $(qty[i]).val()
					});
				};
			}
			AjaxClient.get({
				url: '/Picking/batchDelivery' + "?" + _token + "&material_requisition_id=" + id + '&inve_info=' + JSON.stringify(data),
				dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				layer.close(layerModal);
				layer.msg('一键发料成功！', { icon: 1, offset: '250px' });
				location.reload();
			},
			fail: function (rsp) {
				layer.close(layerLoading);
				layer.close(layerModal);
				layer.msg(rsp.message, { icon: 5, offset: '250px' });
			}
		});
		}else {
			layer.msg('请选择发料数据！', { icon: 3, offset: '250px' });
		}
	})

	// 全选
$('body').on('click', '#checkAll', function () {
	let check = $('#show_item .check');
	// 不选
	if (document.getElementById('checkAll').checked != true) {
		checked_item = [];
		for (let i = 0; i < check.length; i++) {
			check[i].checked = false;
		}
	} else {
		// 全选 
		for (let i = 0; i < check.length; i++) {
			check[i].checked = true;
		}
	}
})
