var i = $('#i');
var data = {
	sale_order_code: '',
	sales_order_project_code: '',
	po_number: '',
	material_code: '',
	page_size: 20,
	page_no: 1
}
var tbody = $('#tbody');
var all_checked = '';
var page_arr = [];

// 初始化
layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	// document.getElementById('all').checked = false;
});

$('body').on('click', '#i', function() {
	if ($(i).hasClass('layui-icon-down')) {
		$(i).removeClass('layui-icon-down').addClass('layui-icon-up');
		$('#display').addClass('act-display');
		$('#none').addClass('act-none');
	} else {
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		$('#display').removeClass('act-display');
		$('#none').removeClass('act-none');
	}
})

getCount();
//  获取界面数据
function  getCount() {
	AjaxClient.get({
		url: '/storageinve/oddmentsList' + '?' + _token,
		dataType: 'json',
		data: data,
		success: function (rsp) {

		},
		fail: function (rsp) {
			getPage(rsp.results.item, rsp.results.paging.total_records);
		}
	}, this);
}

function getPage(datas, count) {

	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count
			, theme: '#1E9FFF'
			,jump: function (obj) {
				data.page_no = obj.curr;
				getDataList(datas, obj.curr);
			}
		});

	});
}

function getDataList(_data, index) {
	tbody.html('');
	if(index == 1) {
		_data.forEach(function (item) {
			let tr = getTr(item);
			tbody.append(tr);
		});
	}else {

		AjaxClient.get({
			url: '/storageinve/oddmentsList' + '?' + _token,
			dataType: 'json',
			data: data,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
			},
			fail: function (rsp) {
				layer.close(layerLoading);
				let data = rsp.results.item;
				data.forEach(function (item) {
					let tr = getTr(item);
					tbody.append(tr);
				});
			}
		}, this);
	}
}

function getTr(item) {
	var check = '';
	if(page_arr.length > 0) {
		page_arr.forEach(function(items) {
			if (items == item.id) {
				check = 'checked';
			}
		})
	} 

	let tr = `
		<tr>
			<td>
				<input type="checkbox"  id='${item.id}' ${check} data-id="${item.id}"   lay-skin="primary" >
			</td>
			<td>${item.sale_order_code}</td>
			<td>${item.sales_order_project_code}</td>
			<td>${item.po_number}</td>
			<td>${item.wo_number}</td>
			<td>${item.item_no}</td>
			<td>${item.NAME}</td>
			<td>${item.quantity}</td>
			<td>${item.unit}</td>
			<td>${item.lot}</td>
			<td>${item.factory_name}</td>
			<td>${item.depot_name}</td>
			<td>${item.inve_age}</td>
		</tr>
	`;
	return tr;
}

// 搜索
$('body').on('click', '#search', function() {
	data = {
		sale_order_code: $('#xs_code').val(),
		sales_order_project_code: $('#hx').val(),
		po_number: $('#sc_code').val(),
		material_code: $('#wl_code').val(),
		page_size: 20,
		page_no: 1
	}
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
	getCount();
})

// 重置
$('body').on('click', '#reset', function() {
	$('#xs_code').val('');
	$('#hx').val('');
	$('#sc_code').val('');
	$('#wl_code').val('');
	data = {
		sale_order_code: '',
		sales_order_project_code: '',
		po_number: '',
		material_code: '',
		page_size: 20,
		page_no: 1
	}
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
	getCount();
})

//  全选
// $('body').on('click', '#all', function() {
// 	all_checked = $('#tbody input');
// 	if(document.getElementById('all').checked == true) {
// 		for(let i=0; i<all_checked.length; i++) {
// 			all_checked[i].checked = true;
// 		}
// 	}else {
// 		for (let i = 0; i < all_checked.length; i++) {
// 			all_checked[i].checked = false;
// 		}
// 	}
	
// })
// 反选
// $('body').on('change', '#tbody input', function() {
// 	all_checked = $('#tbody input');
// 	if(this.checked == false) {
// 		document.getElementById('all').checked = false;
// 	} else {
// 		document.getElementById('all').checked = true;
// 		for (let i = 0; i < all_checked.length; i++) {
// 			if(all_checked[i].checked == false) {
// 				return document.getElementById('all').checked = false;
// 			} 
// 		}
// 	}
// })

// 多选
$('body').on('change', '#tbody input', function() {
	all_checked = $('#tbody input');
	if(this.checked == true) {
		page_arr.push($(this).attr('data-id'));
	}else {
		page_arr.splice(page_arr.indexOf($(this).attr('data-id')),1);
	}
})



$('body').on('click', '#add', function() {
	window.sessionStorage.setItem('consume',JSON.stringify(page_arr));
	if(page_arr.length > 0) {
		window.location.href = '/Consume/consumeAdd';
	} else {
		layer.alert('请选择数据再进行添加!');
	}
	
})
