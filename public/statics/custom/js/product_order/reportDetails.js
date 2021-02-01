let url = window.location.href;
let subStr = url.slice(url.indexOf('?')+1);
let sub_arr = subStr.split('&');
let id = sub_arr[0].slice(sub_arr[0].indexOf('=')+1);
let del = sub_arr[1].slice(sub_arr[1].indexOf('=')+1);


getDataList();
function getDataList() {
	AjaxClient.get({
		url: '/WorkDeclareOrder/getDeclareOrderDetail' + '?' + _token + '&id=' + id + '&is_delete=' + del,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			console.log(rsp,1);
			layer.close(layerLoading);
			let data = rsp.results[0];
			let li = getLi(data);
			$('#ul').append(li);

			data.in_materials.forEach(item => {
				let tr1 = getTr1(item);
				$('#tbody1').append(tr1);
			});	
			
			data.out_materials.forEach(item => {
				let tr2 = getTr2(item);
				$('#tbody2').append(tr2);
			})
			
		},
		fail: function (rsp) {
			console.log(rsp);
			layer.close(layerLoading);
		}
	}, this);
}

function getLi(item) {
	let li = `
	
	<tr><td>销售订单/行项</td><td>${item.sales_order_code}/${item.sales_order_project_code}</td></tr>
	<tr><td>生产订单</td><td>${item.production_number}</td></tr>
	<tr><td>工单</td><td>${item.workOrder_number}</td></tr>
	<tr><td>报工单执行开始时间</td><td>${item.start_time}</td></tr>
	<tr><td>报工单执行结束时间</td><td>${item.end_time}</td></tr>
	<tr><td>过账日期</td><td>${item.BUDAT}</td></tr>
	
	`;
	return li;
}


function getTr1(item) {

	let tr = `
		<tr>
			<td>${item.material_item_no}</td>
			<td>${item.material_name}</td>
			<td>${item.lot}</td>
			<td>${item.qty}</td>
			<td>${item.batch_qty}</td>
			<td>${item.GMNGA}</td>
			<td>${item.commercial}</td>
		</tr>
	`;

	return tr;
} 

function getTr2(item) {
	let tr = `
		<tr>
			<td>${item.material_item_no}</td>
			<td>${item.material_name}</td>
			<td>${item.lot}</td>
			<td>${item.qty}</td>
			<td>${item.GMNGA}</td>
			<td>${item.depot_name}</td>
		</tr>
	`;
	return tr;
}