
// document.getElementById('close').checked = false;
var option;
var start = '', end = '';

layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	//日期
	laydate.render({
		elem: '#date',
		type: 'datetime'
		, done: function (value, date, endDate) {
			start = value;
			option.changeTime();
		}
	});
	laydate.render({
		elem: '#date1',
		type: 'datetime'
		, done: function (value, date, endDate) {
			end = value;
			option.changeTime();
		}
	});

	layui.form.render();
	//监听指定开关
	form.on('switch(switchTest)', function (data) {
		
		 // start = $('#date').val();
		 // end = $('#date1').val();
		let span = $('#admin span');
		if(this.checked) {
			
			if (start == '') {
				layer.alert('请选择运维开始时间！');
				document.getElementById('close').checked = false;
				form.render();

			} else if (end == '') {
				layer.alert('请选择运维结束时间！');
				document.getElementById('close').checked = false;
				form.render();

			} else if (span.length == 0) {
				layer.alert('请选择至少一个白名单人员！');
				document.getElementById('close').checked = false;
				form.render();

			} else {		
				option.checks(1);	
			}
		}else {
			option.checks(0);	
		}
			
		
	});




	function Option() {
		this.pageSize = '50';
		this.pageNo = '1';
		this.order = 'desc';
		this.sort = 'id';
		this.opt = function (name) {
			this.name = name;
			AjaxClient.get({
				url: '/Admin/pageIndex' + "?" + _token + '&page_size=' + this.pageSize +
					'&page_no=' + this.pageNo + '&name=' + this.name + '&oder=' + this.order + '&sort=' + this.sort,
				dataType: 'json',
				beforeSend: function () {
					layerLoading = LayerConfig('load');
				},
				success: function (rsp) {
					layer.close(layerLoading);
					console.log(rsp);
					if (rsp.results.length != 0) {

						rsp.results.forEach(item => {
							let tr = this.getTr(item);
							$('#selects').append(tr);
						})

					}
				},
				fail: function (rsp) {
					layer.close(layerLoading);
					console.log(rsp);
				}
			}, this);
		};

		this.getTr = function (item) {
			let _opt = `<option value="${item.admin_id}">${item.name}</option>`;
			return _opt;
		};


		this.getConfigure = function () {
			AjaxClient.get({
				url: '/BaseConfig/getBaseConfig' + "?" + _token,
				dataType: 'json',
				beforeSend: function () {
					layerLoading = LayerConfig('load');
				},
				success: function (rsp) {
					layer.close(layerLoading);
					rsp.results.forEach(item => {

						if (item.code == 'UPGRADE_TYPE') {
							// 开启运维
							document.getElementById('close').checked = item.value == 0 ? false : true;
							form.render();
						} else if (item.code == 'UPGRADE_WHITE_LIST') {
							//  白名单
							if(item.value.length != 0) {
								let items = item.value;

								for(let idx in items) {
									$('#admin').append(`<span style="margin-top:5px; margin-left:5px; font-size:16px;" class="layui-badge layui-bg-blue"class="del_span" data-id="${items[idx].id}">${items[idx].name}<strong style="cursor: pointer; margin-left:6px;">X</strong></span>`);
								}
							}
							
						} else if (item.code == 'UPGRADE_TIME') {
							// 运维时间
							if(item.value.length != 0) {
								 start = this.timeTamp(item.value[0]);
								 end = this.timeTamp(item.value[1]);
								$('#date').val(start);
								$('#date1').val(end);
							}
							
						}
					})
				},
				fail: function (rsp) {
					layer.close(layerLoading);
					console.log(rsp);
				}
			}, this);
		}

		this.timeTamp = function(timestamp) {
			var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var Y = date.getFullYear() + '-';
            var M = ((date.getMonth() + 1) < 10) ? ('0' + (date.getMonth() + 1) + '-') : ((date.getMonth() + 1) + '-');
            var D = (date.getDate() < 10) ? ('0' + date.getDate() + ' ') : (date.getDate() + ' ');
            var h = (date.getHours() < 10) ? ('0' + date.getHours() + ':') : (date.getHours() + ':');
            var m = (date.getMinutes() < 10) ? ('0' + date.getMinutes() + ':') : (date.getMinutes() + ':');
            var s = (date.getSeconds() < 10) ? ('0' + date.getSeconds()) : (date.getSeconds());
			return Y + M + D + h + m + s;
		}

		this.checks = function(val) {
			layer.msg('运维模式：' + (val == 1 ? '开启' : '关闭'), {
				offset: '6px'
			});

			let data = { code: 'UPGRADE_TYPE', value: val }		
			this.ajax(data);
		}

		this.changeTime = function() {
            let start1 = Date.parse(new Date(start))/ 1000
            let end2 = Date.parse(new Date(end))/ 1000
			let data = { code: 'UPGRADE_TIME', value: JSON.stringify({ 0: start1, 1: end2 }) };

			this.ajax(data);
		}

		this.changeName = function () {
			let md = $('#admin span');
			let _md = {};
			for (let i = 0; i < md.length; i++) {
				_md[i] = $(md[i]).attr('data-id');
			}
			let data = { code: 'UPGRADE_WHITE_LIST', value:JSON.stringify(_md) }

			this.ajax(data);
		}

		this.ajax = function (data) {
			AjaxClient.post({
				url: '/BaseConfig/addBaseConfig' + "?" + _token ,
				data: data,
				dataType: 'json',
				beforeSend: function () {
					layerLoading = LayerConfig('load');
				},
				success: function (rsp) {
					layer.close(layerLoading);
					layer.msg('修改成功！');
				},
				fail: function (rsp) {
					layer.close(layerLoading);
					layer.msg('修改失败！');
				}
			}, this);
		}

	}

	option = new Option();
	option.getConfigure();





	$('body').on('change', '#HandoverCompany', function () {
		option.opt($(this).val());
	})

	$('body').on('change', '#selects', function () {

		let span = $('#admin span');
		let arr = [];
		if (span.length == 0) {
			$('#admin').append(`<span style="margin-top:5px; margin-left:5px; font-size:16px;" class="layui-badge layui-bg-blue"class="del_span" data-id="${$(this).val()}">${$(this).find('option:selected').text()}<strong style="cursor: pointer; margin-left:6px;">X</strong></span>`);
			option.changeName();
		} else {
			for (let i = 0; i < span.length; i++) {
				arr.push($(span[i]).attr('data-id'));
			}

			if (arr.indexOf(String($(this).val())) == -1) {
				$('#admin').append(`<span style="margin-top:5px; margin-left:5px; font-size:16px;" class="layui-badge layui-bg-blue"class="del_span" data-id="${$(this).val()}">${$(this).find('option:selected').text()}<strong style="cursor: pointer; margin-left:6px;">X</strong></span>`);
				option.changeName();
			}
		}
	})

	$('body').on('click', 'strong', function () {
		$(this).parent().remove();
		option.changeName();
	})

})