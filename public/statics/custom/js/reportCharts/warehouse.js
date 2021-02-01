var dataAjax = {
	salesOrder: '',//销售订单
	salesOrderPo: '',//销售订单行项
	materialCode: '',//物料号
	productOrder: '',//生产订单
	declare_start_time: '',//报工开始日期
	declare_end_time: '',//报工结束日期
	storage_start_time: '',//收货开始日期
	storage_end_time: '',//收货结束日期
	workFactory: '',//生产工厂
	workShop: '',//加工车间
	partnerCode: '',//委外加工点
	flag: 0,
	page_no: 1,
	page_size: 20
};

var iAjax = {
	page_no: 1,
	page_size: 20,
	sales_order: '',       //销售订单
	sales_order_po: '',    //行项
	production_order: '',  //生产订单
	material_code: '',	   //物料号
	tdate_end: '',         //收货结束日期
	tdate_start: '',       //收货开始日期 
	materialVoucher: '',   //物料凭证
	status: 0,            //是否收获
}


var v = $('#tbody');
var ele = $('#t_body');
var i = $('#i');
var delArr = [];
var saveArr = [];

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
	laydate.render({
		elem: '#date_sh_start'
		, lang: 'cn'
		, type: 'datetime'
	});
	laydate.render({
		elem: '#date_sh_end'
		, lang: 'cn'
		, type: 'datetime'
	});

	$('#test').removeAttr('checked');

	//监听指定开关
	form.on('switch(switch)', function (data) {
		if(this.checked) {
			layer.tips('页面切换到：导入库存信息界面', data.othis);
			$('.ishow').css('display', 'block');
			$('.noshow').css('display', 'none');
			$('.ishow').css('display', 'flex');
			$('#btn .ishow').css('display', 'inline-block');
			$('#find').css('display','none');
			$('#operation').css('display','block');
			$('#demo2').css('display', 'block');
			$('#all').prop('checked', false);
			$('#inter').text('导入库存信息界面');
			fun.getImportList();
		}else {
			layer.tips('页面切换到：入库查询界面', data.othis);
			$('.ishow').css('display', 'none');
			$('.noshow').css('display', 'block');
			$('.noshow').css('display', 'flex');
			$('#btn .noshow').css('display', 'inline-block');
			$('#find').css('display', 'block');
			$('#operation').css('display', 'none');
			$('#demo2').css('display', 'none');
			$('#inter').text('入库查询界面');
			getCount();
		}
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

getCount();
function getCount() {
	AjaxClient.get({
		url: '/Statisticalreport/getStorageList' + '?' + _token,
		dataType: 'json',
		data: dataAjax,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			getPage(rsp.paging.total_records, rsp.results);
			layer.close(layerLoading);
		},
		fail: function (rsp) {
			$('#tbody').html('');
			$('#tbody').append(`<tr><td colspan="12" style="text-align:center; font-size:20px; line-height:200px;">${rsp.message}</td></tr>`);
			$('#demo2').css('display','none');
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
			url: '/Statisticalreport/getStorageList' + '?' + _token,
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
	let color = '#333';
	if (item.yellowFlag == 1) {
		color = '#FF7F00';
	} else if (item.redFlag == 1) {
		color = 'red';
	}
	let tr = `
		<tr style="color:${color};">
			<td>${tansferNull(item.planFactory)}</td>
			<td>${tansferNull(item.workFactory)}</td>
			<td>${tansferNull(item.workshopName)}${tansferNull(item.partnerName)}</td>
			<td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.production_order_code)}</td>
			<td>${tansferNull(item.item_no)}</td>
			<td>${tansferNull(item.description)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.GMNGA)}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.num)}</td>
			<td>${tansferNull(item.tdate)}</td>
		</tr>
	`;
	return tr;
}

$('body').on('click', '#search', function() {
	let v = $('#ser-content');
	dataAjax = {
		salesOrder: $(v).find('#xs_code').val(),//销售订单
		salesOrderPo: $(v).find('#hx_code').val(),//销售订单行项
		materialCode: $(v).find('#wl_code').val(),//物料号
		productOrder: $(v).find('#sc_code').val(),//生产订单
		declare_start_time: $(v).find('#date_bg_start').val(),//报工开始日期
		declare_end_time: $(v).find('#date_bg_end').val(),//报工结束日期
		storage_start_time: $(v).find('#date_sh_start').val(),//收货开始日期
		storage_end_time: $(v).find('#date_sh_end').val(),//收货结束日期
		workFactory: $(v).find('#gc').val(),//生产工厂
		workShop: $(v).find('#jg').val(),//加工车间
		partnerCode: $(v).find('#ww').val(),//委外加工点
		flag: $(v).find('#sh').val(),
		page_no: 1,
		page_size: 20
	};

	iAjax = {
		page_no: 1,
		page_size: 20,
		sales_order: $(v).find('#xs_code').val(),       //销售订单
		sales_order_po: $(v).find('#hx_code').val(),    //行项
		production_order: $(v).find('#sc_code').val(),  //生产订单
		material_code: $(v).find('#wl_code').val(),	   //物料号
		tdate_end: $(v).find('#date_sh_end').val(),         //收货结束日期
		tdate_start: $(v).find('#date_sh_start').val(),       //收货开始日期 
		materialVoucher: $(v).find('#wlpz').val(),   //物料凭证
		status: $(v).find('#qr').val(),            //是否收获
	}

	$('#demo2').css('display', 'block');

	if(document.getElementById('test').checked ) {
		fun.getImportList();
	}else {
		getCount();
	}

	window.setTimeout(function() {
		$('#ser-content').removeClass('act');
	}, 500)
	$('#none').slideUp();
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
})

$('body').on('click', '#reset', function() {
	let v = $('#ser-content');
	dataAjax = {
		salesOrder: '',//销售订单
		salesOrderPo: '',//销售订单行项
		materialCode: '',//物料号
		productOrder: '',//生产订单
		declare_start_time: '',//报工开始日期
		declare_end_time: '',//报工结束日期
		storage_start_time: '',//收货开始日期
		storage_end_time: '',//收货结束日期
		workFactory: '',//生产工厂
		workShop: '',//加工车间
		partnerCode: '',//委外加工点
		flag : 0,
		page_no: 1,
		page_size: 20
	};

	iAjax = {
		page_no: 1,
		page_size: 20,
		sales_order: '',       //销售订单
		sales_order_po: '',    //行项
		production_order: '',  //生产订单
		material_code: '',	   //物料号
		tdate_end: '',         //收货结束日期
		tdate_start: '',       //收货开始日期 
		materialVoucher: '',   //物料凭证
		status: 0,            //是否收获
	}


	$('#demo2').css('display', 'block');
	$(v).find('#xs_code').val(''),//销售订单
	$(v).find('#hx_code').val('');//销售订单行项
	$(v).find('#wl_code').val('');//物料号
	$(v).find('#sc_code').val('');//生产订单
	$(v).find('#date_bg_start').val('');//报工开始日期
	$(v).find('#date_bg_end').val('');//报工结束日期
	$(v).find('#date_sh_start').val('');//收货开始日期
	$(v).find('#date_sh_end').val('');//收货结束日期
	$(v).find('#gc').val('');//生产工厂
    $(v).find('#jg').val('');//加工车间
	$(v).find('#ww').val('');//委外加工点
	$(v).find('#sh').val('');

	$(v).find('#qr').val('');
	$(v).find('#wlpz').val('');

	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
		$("#sh").empty();
		$('#sh').append(`
			<option value='0'>否</option>
			<option value='1'>是</option>
		`)
		form.render("select");

		$("#qr").empty();
		$('#qr').append(`
			<option value='0'>否</option>
			<option value='1'>是</option>
		`)
		form.render("select");
	})
	window.setTimeout(function() {
		$('#ser-content').removeClass('act');
	}, 500)
	$('#none').slideUp();
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');

	if(document.getElementById('test').checked ) {
		fun.getImportList();
	}else {
			getCount();
	}
})

getScList();
function getScList() {

	AjaxClient.get({
		url: '/Statisticalreport/getAllFactory' + '?' + _token,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			rsp.results.forEach(function(item) {

				let opt = getOpt(item, 1);
				$('#gc').append(opt);
			})
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

getJgList();
function getJgList() {

	AjaxClient.get({
		url: '/Statisticalreport/getWorkshop' + '?' + _token,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			rsp.results.forEach(function (item) {

				let opt = getOpt(item, 1);
				$('#jg').append(opt);
			})
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
getWwList();
function getWwList() {

	AjaxClient.get({
		url: '/Statisticalreport/getPartner' + '?' + _token,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			rsp.results.forEach(function (item) {
				let opt = getOpt(item, 2);
				$('#ww').append(opt);
			})
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



function getOpt(item, index) {

	if(index == 1) {
		var id  = item.id;
		var name = item.name;
	}else {
		var id  = item.code;
		var name = item.name;
	}
	let opt = `
		<option value= "${id}">${name}</option>
	`;

	return opt;
} 

$('body').on('click', '#download', function() {
	let v = $('#ser-content');
	window.location.href = '/Statisticalreport/exportExcel?' + _token + '&salesOrder=' + $(v).find('#xs_code').val()//销售订单
		+'&salesOrderPo=' + $(v).find('#hx_code').val()//销售订单行项
		+'&materialCode=' + $(v).find('#wl_code').val()//物料号
		+'&productOrder=' + $(v).find('#sc_code').val()//生产订单
		+'&declare_start_time=' + $(v).find('#date_bg_start').val()//报工开始日期
		+'&declare_end_time=' + $(v).find('#date_bg_end').val()//报工结束日期
		+'&storage_start_time=' + $(v).find('#date_sh_start').val()//收货开始日期
		+'&storage_end_time=' + $(v).find('#date_sh_end').val()//收货结束日期
		+'&workFactory=' + $(v).find('#gc').val()//生产工厂
		+'&workShop=' + $(v).find('#jg').val()//加工车间
		+'&partnerCode=' + $(v).find('#ww').val()//委外加工点
		+'&flag=' + $(v).find('#sh').val()
})



layui.use('upload', function () {
	var $ = layui.jquery
		, upload = layui.upload;

	upload.render({
		elem: '#test8'
		, url: '/Statisticalreport/importExcel'
		, auto: false
		, data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
		, accept: 'file'
		, bindAction: '#test9'
		, before: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		}
		, done: function (rsp) {
			layer.close(layerLoading);
			if(rsp.code == 0) {
				layer.alert(rsp.message);
			}else {
				layer.msg('上传成功！', { time: 3000, icon: 1 });
				fun.getImportList();
			}
			
		}
		, error: function () {
			layer.close(layerLoading);
			layer.msg('上传失败！', { time: 3000, icon: 5 });
		}
	});

})


// 导入界面

class Fun {
	getImportList() {
		AjaxClient.get({
			url: '/Statisticalreport/getUnconfirmedList' + '?' + _token,
			dataType: 'json',
			data: iAjax,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
				this.getPage(rsp.paging.total_records, rsp.results);
				layer.close(layerLoading);
				// layui.use(['form', 'layedit', 'laydate'], function () {
				// 	var form = layui.form
				// 	form.render();
				// })

			},
			fail: function (rsp) {
				layer.close(layerLoading);
			}
		}, this);
	}
	getPage(count, item) {
		layui.use(['laypage', 'layer'], function () {
			var laypage = layui.laypage
				, layer = layui.layer;
			laypage.render({
				elem: 'demo2'
				, count: count
				, theme: '#1E9FFF'
				, limit: 20
				, jump: function (obj) {
					iAjax.page_no = obj.curr;
					fun.getList(item, obj.curr);
				}
			});

		});
	}
	getList(item, index) {
		$(ele).html('');
		if (index == 1) {
			let data = item;
			data.forEach(function (item) {
				let tr = fun.getTr(item);
				ele.append(tr);
			})
		} else {
			AjaxClient.get({
				url: '/Statisticalreport/getUnconfirmedList' + '?' + _token,
				dataType: 'json',
				data: iAjax,
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
				success: function (rsp) {
					layer.close(layerLoading);
					let data = rsp.results;
					data.forEach(function (item) {
						let tr = fun.getTr(item);
						ele.append(tr);
					});
				},
				fail: function (rsp) {
					layer.close(layerLoading);
				}
			}, this);
		}
	}
	getTr(item) {
		let tr = `
			<tr >
				<td>${item.status == 0 ? `<input type="checkbox" lay-skin="primary " data-id="${item.id}" class="check">` : `<label style="color: orange;">已确认</label>`} </td>
				<td>${tansferNull(item.sales_order)} /${tansferNull(item.sales_order_po)}</td>
				<td>${tansferNull(item.production_order)}</td>
				<td>${tansferNull(item.material_code)}</td>
				<td>${tansferNull(item.material_describe)}</td>
				<td><input type="text" lay-skin="primary " class="num"  ${item.status == 0 ? '' : 'readonly'}  value="${tansferNull(item.num)}"></td>
				<td>${tansferNull(item.tdate)}</td>
				<td>${tansferNull(item.materialVoucher)}</td>
				<td>${tansferNull(item.materialVoucherPo)}</td>
				<td>${tansferNull(item.materialVoucherYear )}</td>
			</tr>
		`;
		return tr;
	}
}


const fun = new Fun();

$('body').on('click', '#load', function () {
	location.href = '/Statisticalreport/downExcel?' + _token;
})

$('body').on('click', '#del', function () {
	delArr = [];
	checked = $('#t_body .check');
	for(let i =0; i<checked.length; i++) {
		if($(checked[i]).prop('checked') == true) {
			delArr.push($(checked[i]).attr('data-id'));
		}
	}
	
	let str = '';

	if(delArr.length == 0) {
		layer.alert('请先勾选，再进行删除！');
	}else {
		delArr.forEach(function (item, index) {
			if(index == 0) {
				str = item;
			}else {
				str = str + ',' + item; 
			}
		});

		layer.confirm('确定要删除吗！', {
			btn: ['确定', '取消']
		}, function (index) {
			layer.close(layer.index);
			AjaxClient.post({
			url: '/Statisticalreport/batchDelete' + '?' + _token + '&data=' + str,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
				layer.confirm('删除成功！', {
					btn: ['确定'],
					closeBtn: 0,
				}, function (index) {
					layer.close(layer.index);
					fun.getImportList();
				});
			},
			fail: function (rsp) {
				layer.alert('删除失败！');
				layer.close(layerLoading);
			}
		}, this);	
		},function (index) {
			layer.close(layer.index);
		});

	}
})

//  全选
$('body').on('click', '#all', function() {
	all_checked = $('#t_body .check');
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
$('body').on('change', '#t_body .check', function() {
	all_checked = $('#t_body .check');
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

$('body').on('click', '#save', function() {
	saveArr = [];
	checked = $('#t_body .check');
	for(let i =0; i<checked.length; i++) {
		if($(checked[i]).prop('checked') == true) {
			saveArr.push({
				id: $(checked[i]).attr('data-id'),
				num: $(checked[i]).parent().parent().find('.num').val()
			});
		}
	}
	let str = '';

	if(saveArr.length == 0) {
		layer.alert('请先勾选，再进行确认！');
	}else {
	
		AjaxClient.post({
			url: '/Statisticalreport/commitData' + '?' + _token + '&data= ' + JSON.stringify(saveArr),
			dataType: 'json',
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				layer.close(layerLoading);
				layer.confirm('确认成功！', {
					btn: ['确定']
				}, function (index) {
					layer.close(layer.index);
					fun.getImportList();
				});
			},
			fail: function (rsp) {
				layer.alert('确认失败！');
				layer.close(layerLoading);
			}
		}, this);	
	}
})


