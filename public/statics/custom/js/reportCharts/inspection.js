var dataAjax = {
	sale_order_code: '',//销售订单
	sales_order_project_code: '',//销售订单行项
	po_number: '',//生产订单
	wo_number: '',//工单
	start_date: '',//开始日期
	end_date: '',//结束日期
	exceptzero: 0,
	page_no: 1,
	page_size: 20
};
var v = $('#tbody');
var i = $('#i');


layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	//date
	laydate.render({
		elem: '#date_bg_start'
		, lang: 'cn'
		, type: 'datetime'
	});
	laydate.render({
		elem: '#date_bg_end'
		, lang: 'cn'
		, type: 'datetime'
	});
})


$('body').on('click', '#i', () => {
	$('#none').slideToggle();
	if ($(i).hasClass('layui-icon-down')) {
		$(i).removeClass('layui-icon-down').addClass('layui-icon-up');
		$('#ser-content').addClass('act');
	} else {
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 400)
	}
})
getDataList();


function getDataList() {
		AjaxClient.get({
			url: '/StatementController/getInOutMaterialInveInfo' + '?' + _token,
			dataType: 'json',
			data: dataAjax,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				v.html('');
				layer.close(layerLoading);
				let data = rsp.results;
				data.forEach(function (item) {
					let tr = getTr(item);
					v.append(tr);
				});
			},
			fail: function (rsp) {
				$('#title').text(rsp.message);
				layer.close(layerLoading);
			}
		}, this);

}

function getTr(item) {
	let img = '';
	if (item.inve_status == 1) {
		img = '/statics/custom/img/11.png'
	} else if (item.inve_status == 2) {
		img = '/statics/custom/img/22.png'
	} else if (item.inve_status == 3) {
		img = '/statics/custom/img/33.png'
	}
	let tr = `
		<tr>
			<td><img src=${img}></td>
			<td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="50">${tansferNull(item.in_out) == 1 ? '<img src="/statics/custom/img/out.png">' : '' }</td>
			<td>${tansferNull(item.material_code)}</td>
			<td width="300">${tansferNull(item.material_name)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.quantity)}</td>
			<td>${tansferNull(item.sap_inve) == 0 ? '否' : '是'}</td>
			<td>${tansferNull(item.declare_status)}</td>
		</tr>
	`;
	return tr;
}

$('body').on('click', '#search', function () {
	let v = $('#ser-content');
	dataAjax = {

		sale_order_code: $(v).find('#xs_code').val(),//销售订单
		sales_order_project_code: $(v).find('#hx_code').val(),//销售订单行项
		po_number: $(v).find('#sc_code').val(),//生产订单
		wo_number: $(v).find('#wl_code').val(),//工单
		start_date: $(v).find('#date_bg_start').val(),//开始日期
		end_date: $(v).find('#date_bg_end').val(),//结束日期
		exceptzero: $(v).find('#jg').val(),
		page_no: 1,
		page_size: 20
	};

	getDataList();
	window.setTimeout(function () {
		$('#ser-content').removeClass('act');
	}, 500)
	$('#none').slideUp();
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
})

$('body').on('click', '#reset', function () {
	let v = $('#ser-content');
	dataAjax = {
		sale_order_code: '',//销售订单
		sales_order_project_code: '',//销售订单行项
		po_number: '',//生产订单
		wo_number: '',//工单
		start_date: '',//开始日期
		end_date: '',//结束日期
		exceptzero: 0,
		page_no: 1,
		page_size: 20
	};

	$(v).find('#xs_code').val('');//销售订单
	$(v).find('#hx_code').val('');//销售订单行项
	$(v).find('#sc_code').val('');//生产订单
	$(v).find('#wl_code').val('');//工单
	$(v).find('#date_bg_start').val('');//开始日期
	$(v).find('#date_bg_end').val('');//结束日期
	$(v).find('#jg').val(0);

	getDataList();
	$('#tbody').html('').append(`<tr>
					<td colspan="9" id="title">销售订单/生产订单/工单，必填其一</td>
				</tr>`);
})



