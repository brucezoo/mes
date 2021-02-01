var i = $('#i');
var tbody = $('#tbody');
var all_checked = '';
var dataAjax ={
	material_item_no: '',
	depot_name: '',
	depot_code: '',
	plant_name: '',
	sale_order_code: '',
	sales_order_project_code: '',
	po_number: '',
	wo_number: '',
	quantity: '',
	exceptzero: '',
	page_no: '1',
	page_size: '20'
}
var arr = [];

// 初始化
layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	document.getElementById('all').checked = false;
});

// 搜索点击事件
$('body').on('click', '#i', function () {
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


// 获取列表
getCount();
function getCount() {
	AjaxClient.get({
		url: '/storageinve/getStorageInveListNew' + '?' + _token,
		dataType: 'json',
		data: dataAjax,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			getPage(rsp.paging.total_records ,rsp.results);
		},
		fail: function (rsp) {	
			layer.close(layerLoading);
		}
	}, this);
}

function getPage(count, item) {
	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count
			, theme: '#1E9FFF'
			, limit: 20
			, jump: function (obj) {
				dataAjax.page_no = obj.curr;
				getDataList( item , obj.curr);
			}
		});

	});
}

function getDataList(item, index) {
	tbody.html('');

	if(index == 1) {
		let data = item;
			data.forEach(function (item) {
				let tr = getTr(item);
				tbody.append(tr);
			})
	} else {
		AjaxClient.get({
			url: '/storageinve/getStorageInveListNew' + '?' + _token,
			dataType: 'json',
			data: dataAjax,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
				let data = rsp.results;
				data.forEach(function (item) {
					let tr = getTr(item);
					tbody.append(tr);
				});
			},
			fail: function (rsp) {
				layer.close(layerLoading);
			}
		}, this);
	}
	
}

function getTr(item) {
	let tr = `
		<tr>
			<td>
				<input type="checkbox"  id='' data-id="${item.id}"   lay-skin="primary" >
			</td>
			<td>${item.id}</td>
			<td>${item.sale_order_code}/${item.sales_order_project_code}</td>
			<td>${item.po_number}</td>
			<td>${item.wo_number}</td>
			<td>${item.material_item_no}</td>
			<td>${item.material_name}</td>
			<td>${item.plant_name}</td>
			<td>${item.depot_name}</td>
			<td>${item.depot_code}</td>
			<td>${item.quantity}</td>
			<td>${item.unit_text}</td>
			<td>
				<button type="button" data-id="${item.id}" class="layui-btn layui-btn-primary layui-btn-sm look">查看</button>
			</td>
		</tr>
	`;
	return tr;
}


// 搜索
$('body').on('click', '#search', function () {
	dataAjax = {
		material_item_no: $('#wl_code').val(),
		depot_name: $('#ck_name').val(),
		depot_code: $('#ck_code').val(),
		plant_name: $('#gc_name').val(),
		sale_order_code: $('#xs_code').val(),
		sales_order_project_code: $('#hx').val(),
		po_number: $('#sc_code').val(),
		wo_number: $('#gd_code').val(),
		quantity: $('#unit_code').val(),
		exceptzero: $('#kc_type').val(),
		page_no: '1',
		page_size: '20'
	}
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
	getCount();
})

// 重置
$('body').on('click', '#reset', function () {
	
	
	dataAjax = {
		material_item_no: '',
		depot_name: '',
		depot_code: '',
		plant_name: '',
		sale_order_code: '',
		sales_order_project_code: '',
		po_number: '',
		wo_number: '',
		quantity: '',
		exceptzero: '',
		page_no: '1',
		page_size: '20'
	}

	$('#wl_code').val('')
	$('#ck_name').val('');
	$('#ck_code').val('');
	$('#gc_name').val('');
	$('#xs_code').val('');
	$('#hx').val('');
	$('#sc_code').val('');
	$('#gd_code').val('');
	$('#unit_code').val('');
	$('#mr').attr('selected','selected');

	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
	getCount();
})

//  全选
$('body').on('click', '#all', function() {
	all_checked = $('#tbody input');
	if(document.getElementById('all').checked == true) {
		for(let i=0; i<all_checked.length; i++) {
			all_checked[i].checked = true;
		}
	}else {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = false;
		}
	}

})


// 反选
$('body').on('change', '#tbody input', function() {
	all_checked = $('#tbody input');
	if(this.checked == false) {
		document.getElementById('all').checked = false;
	} else {
		document.getElementById('all').checked = true;
		for (let i = 0; i < all_checked.length; i++) {
			if(all_checked[i].checked == false) {
				return document.getElementById('all').checked = false;
			} 
		}
	}
})


// 单个查看
$('body').on('click', '.look', function() {

	let id = $(this).attr('data-id');
	//window.location.href = '/Stock/stockSee?id=' + id;
    window.open('/Stock/stockSee?id=' + id,"_blank")
})

// 批量查看
$('body').on('click', '#batch', function() {
	let id = '';
	let checked = $('#tbody input');
	for(let i=0; i<checked.length; i++) {
		if ($(checked[i]).prop('checked') == true) {
			arr.push($(checked[i]).attr('data-id'));
		} 
	}

	for(let j=0; j<arr.length; j++) {
		if(j == 0) {
			id = arr[j];
		} else {
			id = id + ',' + arr[j];
		}
	}

	//window.location.href = '/Stock/stockSee?id=' + id;
    window.open('/Stock/stockSee?id=' + id,"_blank")
})