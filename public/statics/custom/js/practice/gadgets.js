

	var ajaxData = {
		material_code: '', //物料编码
		factory: '',	//工厂
		begintime: '',	//开始时间
		endtime: '',	//结束时间
		creator: '',  //导入人
		status: 0,	// 状态
		pushStatus: 0,
		page_size: 20,
		page_no : 1,
	}, v = $('#tbody');


	(function() {


		layui.use(['form', 'layedit', 'laydate'], function () {
			var form = layui.form
			$("#qr").empty();
			$('#qr').append(`
				<option value='0'>否</option>
				<option value='1'>是</option>
			`)

			$("#ts").empty();
			$('#ts').append(`
				<option value='0'>否</option>
				<option value='1'>是</option>
			`)
			form.render("select");
		})

		document.getElementById('all').checked = false;
		getFac();
		getPerson();
		getCount();
	})();





	//  layerdate init
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

		// //date
		laydate.render({
			elem: '#date_bg_end'
			, lang: 'cn'
			, type: 'datetime'
		});
	})

	// 导入
	layui.use('upload', function () {
		var $ = layui.jquery
			, upload = layui.upload;

		upload.render({
			elem: '#test8'
			, url: '/Bom/importBatchCenter'
			, auto: false
			, data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
			, accept: 'file'
			, bindAction: '#test9'
			, before: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			}
			, done: function (rsp) {
				layer.close(layerLoading);
				if (rsp.code == 0) {
					layer.alert(rsp.message);
				} else {
					layer.confirm('上传成功！', {
						btn: ['确定']
					}, function (index) {
						layer.close(layer.index);
						getCount();
					});
				}

			}
			, error: function () {
				layer.close(layerLoading);
				layer.alert('上传失败！');
			}
		});

	})

	//  i
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

	// 搜索
	$('body').on('click', '#search', function () {
		ajaxData = {
			material_code: $('#wl_code').val(), //物料编码
			factory: $('#fac').val(),	//工厂
			begintime: $('#date_bg_start').val(),	//开始时间
			endtime: $('#date_bg_end').val(),	//结束时间
			creator: $('#drr').val(),  //导入人
			status: $('#qr').val(),	// 状态
			pushStatus: $('#ts').val(),
			page_size: 20,
			page_no: 1,
		}

		if (ajaxData.status == 0 && ajaxData.pushStatus == 1 ) {
			layer.alert('当前为未替换状态，无法进行推送状态的筛选！');
		}else {
			$(v).html('');
			getCount();
		}
		
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 400)
		$('#none').slideUp();
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 400)
	})

	// 获取  fac
	
	function getFac() {
		AjaxClient.get({
			url: '/Bom/getFactory' + '?' + _token,
			dataType: 'json',
			data: ajaxData,
			success: function (rsp) {
				let _opt = `<option value="">--请选择--</option>`;
				rsp.results.forEach( item => {
					_opt += `<option value="${item.code}">${item.name}</option>`
				});
				
				$('#fac').html(_opt);
				layui.use(['form', 'layedit', 'laydate'], function () {
					var form = layui.form
					form.render();
				})
				
			},
			fail: function (rsp) {
				console.log(rsp);
			}
		}, this);
	}


	// 获取员工
	function getPerson() {
		AjaxClient.get({
			url: '/Bom/getEmployee' + '?' + _token,
			dataType: 'json',
			data: ajaxData,
			success: function (rsp) {

				$('#inp_drr').html(`<form class="layui-form" action=""><select name="modules" lay-verify="required" lay-search="" id="drr"></select></form>`);

				let _opt = `<option value="">直接选择或搜索选择</option>`;
				rsp.results.forEach( item => {
					_opt += `<option value="${item.admin_id}">${item.name}</option>`
				});
				
				$('#drr').html(_opt);
				layui.use(['form', 'layedit', 'laydate'], function () {
					var form = layui.form
					form.render();
				})
				
			},
			fail: function (rsp) {
				console.log(rsp);
			}
		}, this);
	}


	// 重置
	$('body').on('click', '#reset', function () {
		ajaxData = {
			material_code: '', //物料编码
			factory: '',	//工厂
			begintime: '',	//开始时间
			endtime: '',	//结束时间
			creator: '',  //导入人
			status: 0,	// 状态
			pushStatus: 0,
			page_size: 20,
			page_no: 1,
		}

		$('#wl_code').val('') //物料编码
		$('#fac').val('')	//工厂
		$('#date_bg_start').val('')	//开始时间
		$('#date_bg_end').val('')	//结束时间
		$('#drr').val('')  //导入人

		layui.use(['form', 'layedit', 'laydate'], function () {
			var form = layui.form
			$("#qr").empty();
			$('#qr').append(`
				<option value='0'>否</option>
				<option value='1'>是</option>
			`)

			$("#ts").empty();
			$('#ts').append(`
				<option value='0'>否</option>
				<option value='1'>是</option>
			`)
			form.render("select");
		})
		
		getCount();
		$('#none').slideUp();
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		window.setTimeout(function () {
			$('#ser-content').removeClass('act');
		}, 400)
	})

	// 下载模板
	$('body').on('click', '#download', function () {
		location.href = '/Bom/downTemplate';
	})	

	// 批量处理
	$('body').on('click', '#replace', function () {

		let _status = $('#qr').val();
		if(_status == 1) {
			layer.alert('当前处于已替换状态，无法进行替换操作！');
		}else{
			let _arr = [];
			let _all = $('#tbody .check');
			for (let i = 0; i < _all.length; i++) {
				if ($(_all[i]).prop('checked') == true) {
					_arr.push($(_all[i]).attr('data-id'));
				}
			}


			if (_arr.length == 0) {
				layer.alert('请先勾选再批量处理！');
			} else {

				let str = '';
				_arr.forEach((item, index) => {
					if (index == 0) {
						str = item;
					} else {
						str = str + ',' + item;
					}
				})

				AjaxClient.post({
					url: '/Bom/batchUpdateWorkcenter' + '?' + _token + '&ids=' + str,
					dataType: 'json',
					beforeSend: function () {
						layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
					},
					success: function (rsp) {
						layer.close(layerLoading);
						layer.confirm('批量替换成功！', {
							btn: ['确定']
						}, function (index) {
							layer.close(layer.index);
							getCount();
						});
					},
					fail: function (rsp) {
						layer.alert('批量替换失败！');
						getCount();
						layer.close(layerLoading);
					}
				}, this);
			}
		}
		
	})

	//  全选
	$('body').on('click', '#all', function () {
		all_checked = $('#tbody .check');
		if (document.getElementById('all').checked == true) {
			for (let i = 0; i < all_checked.length; i++) {
				all_checked[i].checked = true;
			}
		} else {
			for (let i = 0; i < all_checked.length; i++) {
				all_checked[i].checked = false;
			}
		}
	})


	// 反选
	$('body').on('change', '#tbody .check', function () {
		all_checked = $('#tbody .check');
		if (this.checked == false) {
			document.getElementById('all').checked = false;
		} else {
			document.getElementById('all').checked = true;
			for (let i = 0; i < all_checked.length; i++) {
				if (all_checked[i].checked == false) {
					return document.getElementById('all').checked = false;
				}
			}
		}
	})
	

	// 获取列表
function getCount() {
	document.getElementById('all').checked = false;
	AjaxClient.get({
		url: '/Bom/getAllUpdateWorkcenter' + '?' + _token,
		dataType: 'json',
		data: ajaxData,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			getPage(rsp.paging.total_records, rsp.results);
			layer.close(layerLoading);

			if(rsp.results.length == 0) {
				$('#tbody').html(`<tr><td style="text-align:center;" colspan="13">暂无数据！</td></tr>`);
			}
		},
		fail: function (rsp) {
			// $('#tbody').html('');
			// $('#tbody').append(`<tr><td colspan="12" style="text-align:center; font-size:20px; line-height:200px;">${rsp.message}</td></tr>`);
			// $('#demo2').css('display', 'none');
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
			url: '/Bom/getAllUpdateWorkcenter' + '?' + _token,
			dataType: 'json',
			data: ajaxData,
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (rsp) {
				console.log(rsp);
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

	let tr = `
		<tr>
			<td>${item.pushStatus == 0 ? `<input type="checkbox" class="check" lay-skin="primary" data-id="${item.id}">` : item.pushStatus == 1 ? '<img style="width:20px; height:20px;" src="/statics/custom/img/11.png">' : `<input type="checkbox" class="check" lay-skin="primary" data-id="${item.id}">`}</td>
			<td>${tansferNull(item.material_code)}</td>
			<td>${tansferNull(item.factoryName)}</td>
			<td>${tansferNull(item.TL)}</td>
			<td>${tansferNull(item.group)}</td>
			<td>${tansferNull(item.no_id)}</td>
			<td>${tansferNull(item.operation)}</td>
			<td>${tansferNull(item.old_workcenter)}</td>
			<td>${tansferNull(item.describle)}</td>
			<td>${tansferNull(item.new_workcemter)}</td>
			<td>${tansferNull(item.creatorName)}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.RETURNINFO)}</td>
		</tr>
	`;
	return tr;
}


$('body').on('click', '#sap', function() {

	let _status = $('#qr').val();
	if (_status != 1) {
		layer.alert('当前不是替换状态，无法进行批量推送操作！');
	} else {
		let _arr = [];
		let _all = $('#tbody .check');
		for (let i = 0; i < _all.length; i++) {
			if ($(_all[i]).prop('checked') == true) {
				_arr.push($(_all[i]).attr('data-id'));
			}
		}


		if (_arr.length == 0) {
			layer.alert('请先勾选再批量推送！');
		} else {

			let str = '';
			_arr.forEach((item, index) => {
				if (index == 0) {
					str = item;
				} else {
					str = str + ',' + item;
				}
			})

			AjaxClient.get({
				url: '/Bom/batchSyncToSap' + '?' + _token + '&ids=' + str,
				dataType: 'json',
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
				success: function (rsp) {
					layer.close(layerLoading);
					layer.confirm('批量替换推送！', {
						btn: ['确定']
					}, function (index) {
						layer.close(layer.index);
						getCount();
					});
				},
				fail: function (rsp) {
					layer.alert('批量推送失败！');
					getCount();
					layer.close(layerLoading);
				}
			}, this);
		}
	}
})





var facData = '';

//工艺进出料
// 导入表
layui.use('upload', function () {
	var $ = layui.jquery
		, upload = layui.upload;

	upload.render({
		elem: '#test6'
		, url: '/Bom/getTechnologymaterial'
		, auto: false
		, data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
		//,multiple: true
		, accept: 'file'
		, bindAction: '#test7'
		, before: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		}
		, done: function (rsp) {
			layer.close(layerLoading);
			if(rsp.code == 200) {
				layer.alert('上传成功！');
				facData = rsp.results.ext;
			}
		}
		, error: function () {
			layer.close(layerLoading);
			layer.msg('上传失败！', { time: 3000, icon: 5 });
		}
	});

});

getFacs();
function getFacs() {

	AjaxClient.get({
		url: '/Factory/getAllFactory' + '?' + _token,
		dataType: 'json',
		data: ajaxData,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let opt = '';
			rsp.results.forEach(item => {
				 opt += `<option value="${item.id}">${item.name}</option>`;
			})

			$('#facs').append(opt);

			layui.use(['form', 'layedit', 'laydate'], function () {
				var form = layui.form
				form.render();
			});
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
}


$('body').on('click', '#down', function() {

	let id = $('#facs').val();

	// if(id == '') {
	// 	layer.alert('请先选择工厂再进行导出！');
	// }else {
		if(facData != '') {
			location.href = '/Bom/technologyImport?_token=8b5491b17a70e24107c89f37b1036078&ext=' + facData;
		}
	// }
})