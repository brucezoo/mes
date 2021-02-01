var i = $('#i'), ser = $('#ser-content'), v = $('#tbody');
var ajaxData = {
	sell_order_no: '', //销售订单
	sell_order_row_no: '', //行项号
	operation_id: '', //工序
	rankplan: '', //班次
	plan_status: '', //排产状态
	po_no: '',
	wo_no: '',
	page_no: 1, 
	page_size: 20
}

	worker();
	getRankPlan();
	getCount();
	

	// i click
	$('body').on('click', '#i', () => {
		$('#none').slideToggle();
		if ($(i).hasClass('layui-icon-down')) {
			$(i).removeClass('layui-icon-down').addClass('layui-icon-up');
			$(ser).addClass('act');
		} else {
			$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
			window.setTimeout(function () {
				$(ser).removeClass('act');
			}, 500)
		}
	})
	
	// 搜索
	$('body').on('click', '#search', function() {
		ajaxData = {
			sell_order_no: $('#salesOrder').val(), //销售订单
			sell_order_row_no: $('#salesOrderItem').val(), //行项号
			po_no: $('#productionOrder').val(),
			wo_no: $('#workOrder').val(),
			operation_id: $('#process').val(), //工序
			rankplan: $('#shift').val(), //班次
			plan_status: $('#psState').val(), //排产状态
			page_no: 1,
			page_size: 20
		}

		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 500)
		$('#none').slideUp();
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		getCount();

	})

	// 重置
	$('body').on('click', '#reset', function() {

		ajaxData = {
			sell_order_no: '', //销售订单
			sell_order_row_no: '', //行项号
			operation_id: '', //工序
			rankplan: '', //班次
			plan_status: '', //排产状态
			po_no: '',
			wo_no: '',
			page_no: 1,
			page_size: 20
		}
			$('#salesOrder').val(''), //销售订单
			$('#salesOrderItem').val(''), //行项号
			$('#productionOrder').val(''),
			$('#workOrder').val(''),
			$('#process').val(''), //工序
			$('#shift').val(''), //班次
			$('#psState').val(''), //排产状态

				layui.use(['form', 'layedit', 'laydate'], function () {
						var form = layui.form
						form.render("select");
					})

		getCount();
		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 500)
		$('#none').slideUp();
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	})

//31:30:00 to DAY +1 07:30:00
function dateToDayTime(val) {
	var dayTime = val.split(":");
	var dayTimeVal;
	if (dayTime[0] / 24 >= 1) {
		dayTimeVal = "DAY +" + Math.floor(dayTime[0] / 24) + ((dayTime[0] % 24) < 10 ? " 0" + dayTime[0] % 24 : " " + dayTime[0] % 24) + ":" + dayTime[1] + ":" + dayTime[2];
	} else {
		dayTimeVal = val;
	}
	return dayTimeVal;
}
//获取班次
function getRankPlan() {
	AjaxClient.get({
		url: '/RankPlan/select' + '?' + _token + '&page_no=1&page_size=20',
		dataType: 'json',
		success: function (rsp) {

			$('#shift').html('');
			var lis = '', innerHtml = ''; lis = `<option value="">Please Select</option>`;
			if (rsp.results && rsp.results.length) {
				rsp.results.forEach(function (item) {
					var workStartTimeVal = dateToDayTime(item.from);
					var workEndTimeVal = dateToDayTime(item.to);
					lis += `<option value="${item.id}">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</option>`;
				});
				innerHtml = `${lis}`;
				$('#shift').append(innerHtml);
			}


			layui.use(['form', 'layedit', 'laydate'], function () {
				var form = layui.form
				form.render();
			})

		},
		fail: function (rsp) {
			layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
		}
	})
}

// 获取工序

function worker() {
	AjaxClient.get({
		url: '/Operation/getAlllanguage' + '?' + _token,
		dataType: 'json',
		success: function (rsp) {
			let _opt = `<option value="">Please Select</option>`;
			rsp.results.forEach(item => {
				_opt += `<option value="${item.operation_id}">${item.language_name}</option>`
			})
			$('#process').html(_opt);

			layui.use(['form', 'layedit', 'laydate'], function () {
				var form = layui.form
				form.render();
			})
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
}




// 获取列表
function getCount() {

	AjaxClient.get({
		url: '/Language/pageIndexlist' + '?' + _token,
		dataType: 'json',
		data: ajaxData,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			getPage(rsp.paging.total_records, rsp.results);
			layer.close(layerLoading);

			if (rsp.results.length == 0) {
				$('#tbody').html(`<tr><td style="text-align:center;" colspan="16">暂无数据！</td></tr>`);
			}
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
			, prev: 'previous page'
			, next: 'next page'
			, jump: function (obj) {
				ajaxData.page_no = obj.curr;
				getDataList(item, obj.curr);
			}
		});

	});
}

function getDataList(item, index) {
	$(v).html('');
	if (index == 1) {
		let data = item;
		data.forEach(function (item) {
			let tr = getTr(item);
			v.append(tr);
		})
	} else {
		AjaxClient.get({
			url: '/Language/pageIndexlist' + '?' + _token,
			dataType: 'json',
			data: ajaxData,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
				let data = rsp.results;
				data.forEach(function (item) {
					let tr = getTr(item);
					v.append(tr);
				});
			},
			fail: function (rsp) {
				layer.close(layerLoading);
			}
		}, this);
	}

}

function getTr(item) {

	let _sop = {
		so_code: item.sales_order_code ,
		sop_code: item.sales_order_project_code ,
		w_order:  item.material_code ,
		process: item.operation_id
	}

	_sop = JSON.stringify(_sop);

	let tr = `
		<tr>
			<td>${item.version_change == 1 ? `<span style="color:red;">Process Change</span>` : ''}</td>
			<td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.po_no)}</td>
		<!--	<td>${tansferNull(item.wo_no)}</td> -->
			<td>${tansferNull(item.material_code)}</td>
			<td>${tansferNull(item.material_name)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.work_shop_name)}</td>
		<!--	<td>${tansferNull(item.work_center_name)}</td>-->
			<td>${tansferNull(item.work_bench_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
		<!--	<td>${tansferNull(item.plan_start_time)}</td>-->
		<!--	<td>${tansferNull(item.new_version + '.0')}</td>-->
		<!--	<td>${tansferNull(item.on_off == 1 ? 'opened' : 'closed')}</td> -->
		<!--	<td>${tansferNull(item.plan_status == 0 ? 'Not Line' : item.plan_status == 1 ? 'Main Line' : 'Fine Line')}</td>-->
			<td><button type="button" data-id='${_sop}'  class="layui-btn layui-btn-sm layui-btn-normal  sop">Sales Order Process</button></td>
		</tr>
	`;
	return tr;
}

$('body').on('click', '.sop', function(){

	let _sop = $(this).attr('data-id') ;
	_sop = JSON.parse(_sop);
	window.open('/Translate/workProcess?so_code=' + _sop.so_code + '&sop_code=' + _sop.sop_code + '&w_order=' + _sop.w_order 
	+ '&lan=en'+ '&p_id=' + _sop.process);
})

