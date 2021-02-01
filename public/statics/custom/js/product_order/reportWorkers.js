var i = $('#i');
var tbody = $('#tbody');
var dataAjax = {
	sales_order_code: '',
	sales_order_project_code: '',
	po_number: '',
	wo_number: '',
	code: '',
	start_time: '',
	end_time: '',
	status: '',
	item_no:''
}
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

layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	//日期
	laydate.render({
		elem: '#date'
	});
	laydate.render({
		elem: '#date1'
	});
});


// 搜索
$('body').on('click', '#search', function () {
	dataAjax = {
		sales_order_code: $('#xs_code').val(),
		sales_order_project_code: $('#hx').val(),
		po_number: $('#sc_code').val(),
		wo_number: $('#gd_code').val(),
		code: $('#bg_code').val(),
		start_time: $('#date').val(),
		end_time: $('#date1').val(),
		status: $('#bg_type').val(),
		item_no: $('#wl_code').val(),
	}
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
	getCount();
})

// 重置
$('body').on('click', '#reset', function () {
	dataAjax = {
		sales_order_code: '',
		sales_order_project_code: '',
		po_number: '',
		wo_number: '',
		code: '',
		start_time: '',
		end_time: '',
		status: '',
		item_no: ''
	}
	$('#xs_code').val('')
	$('#hx').val('')
	$('#sc_code').val('')
	$('#gd_code').val('')
	$('#bg_code').val('')
	$('#data').val('')
	$('#data1').val('')
	$('#wl_code').val()
	$('#bg_type').attr('selected', 'selected');

	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');
})


// 获取列表
function getCount() {
	$(tbody).html('');
	AjaxClient.get({
		url: '/WorkDeclareOrder/getDeclareOrderList' + '?' + _token,
		dataType: 'json',
		data: dataAjax,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			console.log(rsp);
			layer.close(layerLoading);
			let data = rsp.results;
			data.forEach(item => {
				let tr = getTr(item);
				$(tbody).append(tr);
			});
		},
		fail: function (rsp) {
			console.log(rsp);
			layer.close(layerLoading);
			layer.alert(rsp.message);
		}
	}, this);
}

function getTr(item) {
	var td = '';
	let out = item.out;
	out.forEach((items,index) => {
		td += `<tr>
			<td width="30%"  min-height='60'  style="${index == 0 ? 'border-top:0px;' : ''} margin:0px 0px !important; border-left:0px; border-bottom:0px;">${items.item_no}</td>
			<td width="50%" min-height='60'  style="${index == 0 ? 'border-top:0px;' : ''} margin:0px 0px !important; border-left:0px; border-bottom:0px;">${items.name}</td>
			<td width="20%"  min-height='60' style="${index == 0 ? 'border-top:0px;' : ''} margin:0px 0px !important; border-left:0px;border-right:0px; border-bottom:0px;">${items.GMNGA}</td>
		</tr>`
	})
	let tr = `
		<tr style="background:${item.is_delete == 0 ? '#ffffff;' : '#FF6347;color:#333'}">
			<td>${item.change_factory == 0 ? '' : `<span class="layui-badge layui-bg-green">转厂</span>`}</td>
			<td>${item.production_sales_order_code}/${item.production_sales_order_project_code}</td>
			<td>${item.production_number}</td>
			<td>${item.workOrder_number == null ? item.sub_number : item.workOrder_number}</td>
			<td>${item.code}</td>
			<td style="padding:0px 0px !important;">
				<table padding:0px 0px !important;>
					<tbody id="td-tbody" >
						${td}
					</tbody>
				</table>
			</td>
			<td>${item.ctime}</td>
			<td>${item.status == 1 ? '未推送' : '报工完成'}</td>
			<td>${item.employee_name}</td>
			<td>
				<button type="button" data-id="${item.id}" data-ids="${item.is_delete}" class="layui-btn layui-btn-primary layui-btn-sm look">查看</button>
			</td>
		</tr>
	`;
	return tr;
}

$('body').on('click', '.look', function() {
	let id = $(this).attr('data-id');
	let del = $(this).attr('data-ids');
	location.href = '/Buste/reportDetails?id=' + id + '&del=' + del;
})

