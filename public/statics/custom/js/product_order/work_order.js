var layerModal,
	layerLoading,
	pageNo = 1,
	itemPageNo = 1,
	pageNo1 = 1,
	pageNo2 = 1,
	status = 2;
pageSize = 20,
	work_order_code = '',
	work_order_id = '',
	e = {},
	ajaxData = {},
	checkMaterial = [],
	ajaxItemData = {};
var flag = 0;

function setAjaxData() {
	var ajaxDataStr = sessionStorage.getItem('work_order_page_index');
	try {
		ajaxData = JSON.parse(ajaxDataStr);
		delete ajaxData.pageNo;
		delete ajaxData.status;
		delete ajaxData.work_order_code;
		pageNo = JSON.parse(ajaxDataStr).pageNo;
		status = JSON.parse(ajaxDataStr).status;
		work_order_code = JSON.parse(ajaxDataStr).work_order_code;
		work_order_id = JSON.parse(ajaxDataStr).work_order_id;
		console.log(work_order_code);
	} catch (e) {
		resetParam();
	}
}

layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
	//监听指定开关
	form.on('switch(switchTest)', function (data) {
		layer.msg((this.checked ? '显示进料' : '隐藏进料'), {
			offset: '6px'
		});
		if (this.checked == true) {
			flag = 1;
			getWorkOrder(status);
		} else {
			console.log(false);
			flag = 0;
			getWorkOrder(status);
		}
	});
})
//获取当前时间，格式YYYY-MM-DD
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}

$(function () {
	getRankPlan();
	laydateRender();
	setAjaxData();
	resetParamItem();
	$('.el-tap[data-status=' + status + ']').addClass('active').siblings('.el-tap').removeClass('active');
	getWorkOrder(status);
	if (work_order_code) {
		getPickingList();
	}

	bindEvent();
});

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
		url: URLS['thinPro'].rankPlanList + '?' + _token,
		dataType: 'json',
		beforeSend: function () {
		},
		success: function (rsp) {
			$('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
			var lis = '', innerHtml = '';
			if (rsp.results && rsp.results.length) {
				lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
				rsp.results.forEach(function (item) {
					var workStartTimeVal = dateToDayTime(item.from);
					var workEndTimeVal = dateToDayTime(item.to);
					lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
				});
				innerHtml = `${lis}`;
				$('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
			}

		},
		fail: function (rsp) {
			layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
		}
	})
}

function laydateRender() {
	//日期时间选择器

	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
			, layer = layui.layer
			, layedit = layui.layedit
			, laydate = layui.laydate;

		//日期
		laydate.render({
			elem: '#work_station_time',
			type: 'date'
		});
	});
}

function bindPagenationClick(totalData, pageSize) {
	$('#pagenation').show();
	$('#pagenation').pagination({
		totalData: totalData,
		showData: pageSize,
		current: pageNo,
		isHide: true,
		coping: true,
		homePage: '首页',
		endPage: '末页',
		prevContent: '上页',
		nextContent: '下页',
		jump: true,
		callback: function (api) {
			pageNo = api.getCurrent();
			var status = $('.el-tap.active').attr('data-status');
			getWorkOrder(status);
		}
	});
}

//重置搜索参数
function resetParam() {
	ajaxData = {
		work_order_number: '',
		work_task_number: '',
		production_order_number: '',
		sales_order_code: '',
		sales_order_project_code: '',
		// inspur_sales_order_code: '',
		// inspur_material_code: '',
		plan_start_date: '',
		plan_end_date: '',
		schedule: '',
		rankplan: '',
		picking_status: '',
		send_status: '',
		order: 'desc',
		sort: 'id',
		workcenter_name: ''
	};
}

//获取粗排列表
function getWorkOrder(status) {
	var urlLeft = '';
	for (var param in ajaxData) {
		urlLeft += `&${param}=${ajaxData[param]}`;
	}
	urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
	AjaxClient.get({
		url: URLS['order'].workOrderList + _token + urlLeft,
		dataType: 'json',
		cache: false,
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			ajaxData.pageNo = pageNo;
			ajaxData.status = status;
			ajaxData.work_order_code = work_order_code;
			sessionStorage.setItem('work_order_page_index', JSON.stringify(ajaxData))
			// window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
			if (status == 0) {
				$(".declare").hide();
				var totalData = rsp.paging.total_records;
				var _html = createHtml(rsp);
				$('.table_page').html(_html);

				if (rsp.paging.total_records < 20) {
					$('#total_wp').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
				} else {
					$('#total_wp').css('display', 'none').text(' ');
				}

				if (totalData > pageSize) {
					bindPagenationClick(totalData, pageSize);
				} else {
					$('#pagenation.unpro').html('');
				}
			} else if (status == 1) {
				$(".declare").hide();
				var totalData = rsp.paging.total_records;
				var _shtml = createProducedHtml(rsp);
				$('.table_page').html(_shtml);

				if (rsp.paging.total_records < 20) {
					$('#total_cp').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
				} else {
					$('#total_cp').css('display', 'none').text(' ');
				}

				if (totalData > pageSize) {
					bindPagenationClick(totalData, pageSize);
				} else {
					$('#pagenation.produce').html('');
				}
				checkMaterial = [];
				rsp.results.forEach(function (item) {
					var material_arr = [];
					if (item.in_material != null && item.in_material.length > 0) {
						if (JSON.parse(item.in_material).length > 0) {
							for (var i in JSON.parse(item.in_material)) {
								if (JSON.parse(item.in_material)[i].LGFSB != '') {
									material_arr.push({
										material_id: JSON.parse(item.in_material)[i].material_id,
										line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
										product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
										qty: tansferNull(JSON.parse(item.in_material)[i].qty),
									})
								}

							}

						}
					}

					if (material_arr.length > 0) {
						checkMaterial.push({
							work_order_id: item.work_order_id,
							sale_order_code: item.sales_order_code ? item.sales_order_code : '',
							materials: material_arr,
						});
					}
				});
			} else if (status == 2) {
				$(".declare").show();
				var totalData = rsp.paging.total_records;
				var _schtml = createFineProducedHtml(rsp);
				$('.table_page').html(_schtml);

				if (rsp.paging.total_records < 20) {
					$('#total_xp').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
				} else {
					$('#total_xp').css('display', 'none').text(' ');
				}

				if (totalData > pageSize) {
					bindPagenationClick(totalData, pageSize);
				} else {
					$('#pagenation.fineProduce').html('');
				}
				checkMaterial = [];
				rsp.results.forEach(function (item) {
					var material_arr = [];
					if (item.in_material != null && item.in_material.length > 0) {
						if (JSON.parse(item.in_material).length > 0) {
							for (var i in JSON.parse(item.in_material)) {
								if (JSON.parse(item.in_material)[i].LGFSB == '') {
									break;
								} else {
									material_arr.push({
										material_id: JSON.parse(item.in_material)[i].material_id,
										line_depot: tansferNull(JSON.parse(item.in_material)[i].LGFSB),
										product_depot: tansferNull(JSON.parse(item.in_material)[i].LGPRO),
										qty: tansferNull(JSON.parse(item.in_material)[i].qty),
									})
								}
							}

						}
					}

					if (material_arr.length > 0) {
						checkMaterial.push({
							work_order_id: item.work_order_id,
							materials: material_arr,
						});
					}
				});

			}
			if (work_order_code) {
				$("#check_input_" + work_order_code).click();
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			noData('获取调拨单列表失败，请刷新重试', 9);
		},
		complete: function () {
			$('#searchForm .submit').removeClass('is-disabled');
		}
	}, this)
}

//生成未排列表数据
function createHtml(data) {
	var viewurl = $('#workOrder_view').val();
	var replaceurl = $('#replace_material').val();
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			var temp = [];
			if (item.out_material != null && item.out_material.length > 0) {
				temp = JSON.parse(item.out_material);
			}

			trs += `
			<tr>
			
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.sales_order_project_code)}</td>
            <td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td>${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.on_off == 0 ? '订单关闭' : '订单开启')}</td>
			<td style="color: ${item.send_status == 1 ? 'red' : ''}">${tansferNull(item.is_sap_picking == 0 ? '' : item.picking_status == 0 ? '未领' : item.picking_status == 1 ? '领料中' : item.picking_status == 2 ? '已领' : '')}</td>
			<td>${tansferNull(item.send_status == 0 ? '未发' : item.send_status == 1 ? '少发' : item.send_status == 2 ? '正常' : item.send_status == 3 ? '超发' : '')}</td>
			<td class="right">
			 <a class="button pop-button view" href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1">领料</a>
	         <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	         <a class="button pop-button view" href="${replaceurl}?id=${item.work_order_id}">替换料</a>
           </td>
			</tr>
			`;
		})
	} else {
		trs = '<tr><td colspan="11" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable" >
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售订单行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight" style="width: 300px;">产成品</th>
                        <th class="left nowrap tight">数量</th>
                        <th class="left nowrap tight">工时</th>
                        <th class="left nowrap tight">订单状态</th>
                        <th class="left nowrap tight">领料状态</th>
                        <th class="left nowrap tight">SAP发料状态</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
		</div>
		<div id="total_wp" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation unpro" style="margin-top: 5px;"></div>`;
	$('#showPickingList').hide();
	return thtml;
}

//生成粗排列表数据
function createProducedHtml(data) {
	var viewurl = $('#workOrder_view').val();
	var replaceurl = $('#replace_material').val();
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			var temp = [];
			if (item.out_material != null && item.out_material.length > 0) {
				temp = JSON.parse(item.out_material);
			}
			var checkedHtml = '';
			if (work_order_code == item.wo_number) {
				checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input_${item.wo_number}" data-id="${item.wo_number}" data-work_id="${item.work_order_id}">
                    <span class="el-checkbox-outset"></span>
                </span>`
			} else {
				checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}" data-work_id="${item.work_order_id}">
                    <span class="el-checkbox-outset"></span>
                </span>`
			}

			var routChangeHtml = '';
			if (item.version_change == 1) {
				routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
			}

			trs += `
			<tr class = "tr_click">
            <td>${checkedHtml}</td>
            <td>${routChangeHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="200px;">${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>
			<td>${tansferNull(item.work_center)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.inspur_sales_order_code)}</td>
			<td>${tansferNull(item.inspur_material_code)}</td>
			<td>${tansferNull(item.on_off == 0 ? '订单关闭' : '订单开启')}</td>
			<td>${tansferNull(item.picking_status == 0 ? '未领' : item.picking_status == 1 ? '领料中' : item.picking_status == 2 ? '已领' : '')}</td>
			<td style="color: ${item.send_status == 1 ? 'red' : ''}">${tansferNull(item.is_sap_picking == 0 ? '' : item.send_status == 0 ? '未发' : item.send_status == 1 ? '少发' : item.send_status == 2 ? '正常' : item.send_status == 3 ? '超发' : '')}</td>
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			<td class="right" style="width: 200px;">
			${item.on_off == 1 ? `<div class="btn-group">
                <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1">生成领料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=7">生成补料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturn" data-id="${item.work_order_id}">生成退料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturnWorkshop" data-id="${item.work_order_id}">生成车间退料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createWorkshopPickingList?id=${item.work_order_id}&type=7">生成车间补料单</a></li>
                </ul>
            </div>`: ''}
	          <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	          <a class="button pop-button view" href="${replaceurl}?id=${item.work_order_id}">替换料</a>
           </td>
			</tr>
			`;
		})

	} else {
		trs = '<tr><td colspan="18" style="text-align: center;">暂无数据</td></tr>';
	}
	var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th width="200px;" class="left nowrap tight">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">工时</th>
                    <th class="left nowrap tight">浪潮销售订单号</th>
                    <th class="left nowrap tight">浪潮物料号</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th>
                    <th class="center nowrap tight showStatus" style="display: none;">MES齐料</th>
                    <th width="200px;" class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody_producted">${trs}</tbody>
            </table>
		</div>
		<div id="total_cp" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation" style="margin-top: 5px;"></div>`;
	$('#showPickingList').show();
	return thtml;

}

//生成细排列表数据
function createFineProducedHtml(data) {
	var viewurl = $('#workOrder_view').val();
	var replaceurl = $('#replace_material').val();
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			var temp = [];
			if (item.out_material != null && item.out_material.length > 0) {
				temp = JSON.parse(item.out_material);
			}


			switch (item.status) {
				case 2:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">等待处理</span>`;
					break;
				case 3:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已被发布</span>`;
					break;
				case 4:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">挂起</span>`;
					break;
				case 5:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">操作异常</span>`;
					break;
				case 6:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">设备异常</span>`;
					break;
				case 7:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">物料异常</span>`;
					break;
				case 8:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单变更</span>`;
					break;
				case 9:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">工单取消</span>`;
					break;
				case 10:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">完成工单</span>`;
					break;
				case 11:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">暂停</span>`;
					break;
				case 12:
					condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">即将开始</span>`;
					break;
			}
			var checkedHtml = '', changeFactoryHtml = '', routChangeHtml = '';
			checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" id="check_input_${item.wo_number}" data-id="${item.wo_number}" data-work_id="${item.work_order_id}">
                <span class="el-checkbox-outset"></span>
            </span>`;

			if (item.version_change == 1) {
				routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
			}
			if (item.change_factory == 1) {
				changeFactoryHtml = `<button type="button" class="el-button" style="color: #20a0ff;cursor: pointer;padding: 4px; font-weight: bold;">转厂</button>`;
			}

			let data = JSON.parse(item.in_material);
			let str = '';
			data.forEach((item, index) => {
				if (index < 2) {
					if (index == 0) {
						str = item.material_code + ':' + item.name;
					} else {
						str = str + `</br>` + item.material_code + ':' + item.name;
					}
				}
			})
			trs += `
			<tr class="tr_click">
			<td><input type="checkbox" class="checks" data-id="${item.wo_number}" data-work_id="${item.work_order_id}"></td>
        	<td style="display:none;">${checkedHtml}</td>
            <td>${routChangeHtml}</td>
			<td>${changeFactoryHtml}</td>
			<td class="right">
			${item.on_off == 1 ? `<div class="btn-group">
                <button type="button" class="button pop-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
                <ul class="dropdown-menu" style="right: auto;left: 0" role="menu">
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1">生成领料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=7">生成补料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturn" data-id="${item.work_order_id}">生成退料单</a></li>
                    <li style="cursor: pointer;"><a class="creatReturnWorkshop" data-id="${item.work_order_id}">生成车间退料单</a></li>
                    <li style="cursor: pointer;"><a href="/WorkOrder/createWorkshopPickingList?id=${item.work_order_id}&type=7">生成车间补料单</a></li>
                </ul>
			</div>`: ''}
			 <a class="button pop-button view" href="${viewurl}?id=${item.work_order_id}">查看</a>
	         <a class="button pop-button view"  href="${replaceurl}?id=${item.work_order_id}">替换料</a>
	        </hr>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td style="${flag == 0 ? 'display:none;' : ''}">${tansferNull(str)}</td>
			<td width="200px;">${tansferNull(item.item_no)}:${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>            
			<td>${tansferNull(item.work_center)}</td>            
      <td>${tansferNull(item.workbench_name)}</td>            
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.plan_start_time)}</td>
			<td>${tansferNull(item.plan_end_time)}</td>
			<td>${tansferNull(item.on_off == 0 ? '订单关闭' : '订单开启')}</td>
			<td>${tansferNull((Number(item.schedule) * 100).toFixed(2))}%</td>
			<td>${tansferNull(item.picking_status == 0 ? '未领' : item.picking_status == 1 ? '领料中' : item.picking_status == 2 ? '已领' : item.picking_status == 3 ? '待入库' : '')}</td>
			<td style="color: ${item.send_status == 1 ? 'red' : ''}">${tansferNull(item.is_sap_picking == 0 ? '' : item.send_status == 0 ? '未发' : item.send_status == 1 ? '少发' : item.send_status == 2 ? '正常' : item.send_status == 3 ? '超发' : '')}</td>
			<!--<td>${tansferNull(condition)}</td>-->
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			</tr>
			`;
		})
	} else {
		trs = '<tr><td colspan="20" style="text-align:center">暂无数据</td></tr>';
	}
	var thtml = `<div id="clearHeight" class="wrap_table_div" style="height: ${$(window).height() - 300}px; overflow: scroll;">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight"><input type="checkbox" lay-skin="primary" id="all"></th>
                    <th class="left nowrap tight"></th>
					<th class="left nowrap tight"></th>
					<th class="right nowrap tight">操作</th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight" width="400px;"  style="display:${flag == 0 ? 'none' : 'block'};">进料</th>
                    <th class="left nowrap tight" width="200px;">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工位号</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">排入开始时间</th>
                    <th class="left nowrap tight">排入结束时间</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="left nowrap tight">报工状态</th>
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th>
                    <!--<th class="left nowrap tight">状态</th>-->
                    <th class="center nowrap tight showStatus" style="display: none;">MES齐料</th>
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted  _tbody">${trs}</tbody>
            </table>
		</div>
		<div id="total_xp" style="float:right; display:none;" ></div>
        <div id="pagenation" class="pagenation fineProduce" style="margin-top: 5px;"></div>`;
	$('#showPickingList').show();
	return thtml;
}

//   多选
//   全选
$('body').on('click', '#all', function () {
	all_checked = $('._tbody .checks');
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
$('body').on('change', '._tbody .checks', function () {
	all_checked = $('._tbody .checks');
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



function resetAll() {
	var parentForm = $('#searchForm');
	parentForm.find('#sales_order_code').val('');
	parentForm.find('#sales_order_project_code').val('');
	parentForm.find('#work_order_number').val('');
	parentForm.find('#work_task_number').val('');
	parentForm.find('#production_order_number').val('');
	parentForm.find('#work_shift_name').val('');
	parentForm.find('#work_station_time').val('');
	// parentForm.find('#inspur_sales_order_code').val('');
	// parentForm.find('#inspur_material_code').val('');
	// parentForm.find('#plan_start_time').val();
	parentForm.find('#start_time_input').text('');
	parentForm.find('#end_time_input').text('');
	parentForm.find('#start_time').val('');
	parentForm.find('#end_time').val('');
	parentForm.find('#schedule').val('').siblings('.el-input').val('--请选择--');
	parentForm.find('#picking_status').val('').siblings('.el-input').val('--请选择--');
	parentForm.find('#send_status').val('').siblings('.el-input').val('--请选择--');
	parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
	pageNo = 1;
	parentForm.find('#work_center').val('').siblings('.el-input').val('--请选择--');
	resetParam();
}

function checkPickings() {
	AjaxClient.post({
		url: URLS['order'].checkApplyMes,
		data: { items: checkMaterial, _token: TOKEN },
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},

		success: function (rsp) {
			layer.close(layerLoading);
			$('.showStatus').show();
			rsp.results.forEach(function (item) {
				if (item.is_full == true) {
					$('#showStatus' + item.work_order_id).html('');
					$('#showStatus' + item.work_order_id).html(`<a href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=1"><span style="display:inline-block;border: 1px solid green;width: 60px;color: green;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">定额领料</span></a>`)
				}
			});
			$('.declare').removeClass('is-disabled');
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			$('.declare').removeClass('is-disabled');
			layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });

		},
		complete: function () {
			$('#searchForm .submit').removeClass('is-disabled');
		}
	}, this);
}
function showPrintModal() {
	var name = $('#showAdminName').val();
	var nowtime = new Date().Format("yyyy-MM-dd HH:mm:ss");

	var wwidth = $(window).width() - 80,
		wheight = $(window).height() - 80,
		mwidth = wwidth + 'px',
		mheight = wheight + 'px';
	layerModal = layer.open({
		type: 1,
		title: '打印',
		offset: '100px',
		area: [mwidth, mheight],
		shade: 0.1,
		shadeClose: false,
		resize: false,
		move: false,
		content: `<form class="viewAttr formModal" id="viewattr">
					<div style="height: 40px;text-align: right;">
						<button data-id="" type="button" class="button pop-button" id="printWt">打印</button>
					</div>
					<div id="dowPrintWt">
					    <div style="text-align: right;margin-right: 10px;">打印人：${name}，打印时间：${nowtime}</div>
					    <div id="showPrintHtml"></div>
					    		
					</div>
                </form>`,
		success: function (layero, index) {
			getWorkOrderShow(2);
		},
		end: function () {
			$('.out_material .item_out .table_tbody').html('');
		}

	})
}
function getWorkOrderShow(status) {

	console.log(status,222);
	var urlLeft = '';
	for (var param in ajaxData) {
		urlLeft += `&${param}=${ajaxData[param]}`;
	}
	urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
	AjaxClient.get({
		url: URLS['order'].workOrderList + _token + urlLeft,
		dataType: 'json',

		success: function (rsp) {
console.log(rsp,1111);

			if (status == 2) {
				var _schtml = createFineProducedShowHtml(rsp);
				$('#showPrintHtml').html(_schtml);
			}

			let els = $('._tbody .checks'), _arr = [];
			for (let i = 0; i < els.length; i++) {
				if ($(els[i]).prop('checked') == true) {
					_arr.push($(els[i]).attr('data-work_id'));
				}
			}


			rsp.results.forEach(function (item, index) {

				if (_arr.indexOf(String(item.work_order_id)) != -1) {
					// JsBarcode("#qrcodewt"+item.wo_number, item.wo_number, {
					//     format: "CODE39",//选择要使用的条形码类型
					//     displayValue:false,//是否在条形码下方显示文字
					//     margin:15//设置条形码周围的空白边距
					// });
					var qrcodewt = new QRCode(document.getElementById("qrcodewt" + item.wo_number), {
						width: 120,
						height: 120,
						correctLevel: QRCode.CorrectLevel.L
					});

					// var str = {
					//     PO:item.po_number,
					//     WO:item.wo_number,
					//     INV: item.item_no,
					//     SO: item.sales_order_code,
					//     Item: item.sales_order_project_code,
					//     Qty: item.qty,
					//     WC: item.work_center,
					// }

					makeCode(item.wo_number, qrcodewt);
					// console.log(item);
					// $("#qrcodewt"+item.wo_number).JsBarcode(item.wo_number);


					$("#imgcode" + index).JsBarcode(item.po_number, {
						width: 2,// 设置条之间的宽度
						height: 70,// 高度
						displayValue: false, // 是否在条形码上下方显示文字
					});
				}
				

			})

		},
		fail: function (rsp) {
			layer.close(layerLoading);
			noData('获取调拨单列表失败，请刷新重试', 9);
		},
		complete: function () {
			$('#searchForm .submit').removeClass('is-disabled');
		}
	}, this)
}
//二维码
function makeCode(str, qrcode) {
	qrcode.makeCode(str);
}
//生成细排列表数据
function createFineProducedShowHtml(data) {
	var viewurl = $('#workOrder_view').val();
	var trs = '';
	let els = $('._tbody .checks'), _arr = [];
	for (let i = 0; i < els.length; i++) {
		if ($(els[i]).prop('checked') == true) {
			_arr.push($(els[i]).attr('data-work_id'));
		}
	}

	console.log(data.results,_arr)

	if (_arr.length != 0) {
		if (data && data.results && data.results.length) {
			data.results.forEach(function (item, index) {
				if (_arr.indexOf(String(item.work_order_id)) != -1) {
					var out_html = `<div>
									<p>产成品编码：<label style="font-size: 20px;">${tansferNull(item.item_no)}</label></p>
									<p>进料编码：${tansferNull(item.first_in_material_code)}</p>
									<p>${tansferNull(item.name)}</p>
								</div>`;

					trs += `
						<tr>
							<td style="font-size: 13px;">${tansferNull(item.workbench_name)}</td> 
							<td style="font-size: 22px; ">${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
							<td text-align:center;>
							<img style="width:200px;" id="imgcode${index}"/><br>
							<label style="font-size:22px !important;" >${tansferNull(item.po_number)}</label></td>           
							<td style="font-size: 15px;width:180px;word-wrap:break-word;word-break:break-all;">${tansferNull(item.wo_number)}</td>
							<td style="font-size: 15px; width:250px;word-wrap:break-word;word-break:break-all;">${tansferNull(out_html)}</td>
							<td style="font-size: 22px;">${tansferNull(item.qty)}</td>
							<td style="font-size: 15px;">${tansferNull(item.commercial)}</td>
							<td style="font-size: 15px;">${tansferNull(item.work_center)}</td>            
							<td style="font-size: 15px;" width="120">${tansferNull(item.plan_start_time)}</td>
							<td style="font-size: 15px;">${tansferNull(item.total_workhour / 60).toFixed(2)}</td>
							<td class="center" style="width: 250px;">
								<div style="margin: 30px;" id="qrcodewt${item.wo_number}"></div>
							</td>
						</tr>
						`;
				}
			})


		} else {
			trs = '<tr><td colspan="10" style="text-align:center">暂无数据</td></tr>';
		}
	} else {
		if (data && data.results && data.results.length) {
			data.results.forEach(function (item, index) {
				var out_html = `<div>
                                 <p>产成品编码：<label style="font-size: 20px;">${tansferNull(item.item_no)}</label></p>
                                 <p>进料编码：${tansferNull(item.first_in_material_code)}</p>
                                 <p>${tansferNull(item.name)}</p>
                            </div>`;

				trs += `
			<tr>
			<td style="font-size: 13px;">${tansferNull(item.workbench_name)}</td> 
			<td style="font-size: 22px; ">${tansferNull(item.sales_order_code)}${item.sales_order_project_code != 0 ? "/" + item.sales_order_project_code : ''}</td>
            <td text-align:center;>
            <img style="width:200px;" id="imgcode${index}"/><br>
            <label style="font-size:22px !important;" >${tansferNull(item.po_number)}</label></td>           
			<td style="font-size: 15px;width:180px;word-wrap:break-word;word-break:break-all;">${tansferNull(item.wo_number)}</td>
			<td style="font-size: 15px; width:250px;word-wrap:break-word;word-break:break-all;">${tansferNull(out_html)}</td>
			<td style="font-size: 22px;">${tansferNull(item.qty)}</td>
			<td style="font-size: 15px;">${tansferNull(item.commercial)}</td>
			<td style="font-size: 15px;">${tansferNull(item.work_center)}</td>            
			<td style="font-size: 15px;" width="120">${tansferNull(item.plan_start_time)}</td>
			<td style="font-size: 15px;">${tansferNull(item.total_workhour / 60).toFixed(2)}</td>
			<td class="center" style="width: 250px;">
			    <div style="margin: 30px;" id="qrcodewt${item.wo_number}"></div>
            </td>
			</tr>
			`;

			})
		} else {
			trs = '<tr><td colspan="10" style="text-align:center">暂无数据</td></tr>';
		}
	}


	var thtml = `<div id="clearHeight" class="wrap_table_div">
            <table id="worker_order_table" class="sticky uniquetable commontable" style="table-layout：fixed">
                <thead>
                <tr>
                    <th class="left nowrap tight" width="80">工位号</th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">单位</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">工时(分)</th>
                    <th class="center nowrap tight">二维码</th>
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted">${trs}</tbody>
            </table>
        </div>`;
	return thtml;
}
function getCurrentDate() {
	var curDate = new Date();
	var _year = curDate.getFullYear(),
		_month = curDate.getMonth() + 1,
		_day = curDate.getDate();
	return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

function bindEvent() {
	// 点击工艺变更红标识
	$('body').on('click', '.version-change', function () {
		let desc = $(this).attr('data-desc');
		let oldVersion = $(this).attr('data-oldVersion') + '.0';
		let newVersion = $(this).attr('data-newVersion') + '.0';
		layerModal = layer.open({
			type: 1,
			title: '信息',
			offset: '100px',
			area: ['400px', '300px'],
			shade: 0.1,
			shadeClose: false,
			resize: false,
			move: false,
			content: `<form class="viewAttr formModal" style="width: 340px;margin: 0 auto;">
                        <div style="height: 40px;text-align: left;">
                            <span>当前工单版本：</span>
                            ${oldVersion}
                        </div>
                        <div style="height: 40px;text-align: left;">
                            <span>工艺新版本：</span>
                            ${newVersion}
                        </div>
                        <div style="height: 120px;text-align: left;">
                            <span>新版本描述：</span>
                            ${desc}
                        </div>
                    </form>`,
			success: function (layero, index) {

			},
			end: function () {

			}

		})
	});

	//点击弹框内部关闭dropdown
	$(document).click(function (e) {
		var obj = $(e.target);
		if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
			$('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
		}
		if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
			$('#searchForm .el-item-hide').slideUp(400, function () {
				$('#searchForm .el-item-show').css('background', 'transparent');
			});
			$('.arrow .el-input-icon').removeClass('is-reverse');
		}
	});
	//打印预览
	$('body').on('click', '.declare:not(".is-disabled")', function (e) {
		e.stopPropagation();
		// $(this).addClass('is-disabled');
		// checkPickings();
		showPrintModal();
	});
	$('body').on('click', '#printWt', function (e) {
		$("#dowPrintWt").print();
	});
	//下拉选择
	$('body').on('click', '.el-select-dropdown-item', function (e) {
		e.stopPropagation();
		$(this).parent().find('.el-select-dropdown-item').removeClass('selected');
		$(this).addClass('selected');
		if ($(this).hasClass('selected')) {
			var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
			ele.find('.el-input').val($(this).text());
			ele.find('.val_id').val($(this).attr('data-id'));
		}
		$(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
	});
	$('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
		e.stopPropagation();
	});

	$('body').on('click', '.el-select', function () {
		if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
			$('.el-item-show').find('.el-select-dropdown').hide();
			$('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
		} else {
			$('.el-item-show').find('.el-select-dropdown').hide();
			$('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
			$(this).find('.el-input-icon').addClass('is-reverse');
			$(this).siblings('.el-select-dropdown').show();
		}
	});

	$('body').on('click', '.el-tap-wrap .el-tap', function () {
		var form = $(this).attr('data-item');
		if (!$(this).hasClass('active')) {
			$(this).addClass('active').siblings('.el-tap').removeClass('active');
			var status = $(this).attr('data-status');
			ajaxData.pageNo = pageNo;
			ajaxData.status = status;
			sessionStorage.setItem('work_order_page_index', JSON.stringify(ajaxData))
			// window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
			$('#pageNnber').val(1)
			$('#status').val(status);
			if (status == 0) {
				$(".declare").hide();
				$(".export").hide();
				$(".work_shift_name").hide();
				$(".work_station_time").hide();
			} else if (status == 1) {
				$(".declare").hide();
				$(".export").hide();
				$(".work_shift_name").show();
				$(".work_station_time").hide();
			} else if (status == 2) {
				$(".declare").show();
				$(".export").show();
				$(".work_shift_name").show();
				$(".work_station_time").show();
			} else {
				// $(".declare").show();
			}
			work_order_code = '';
			resetAll();
			getWorkOrder(status);
		}
	});
	$('body').on('click', '.creatReturn', function (e) {
		e.stopPropagation();
		getCreateReturnMaterial($(this).attr('data-id'));
	});

	$('body').on('click', '.creatReturnWorkshop', function (e) {
		e.stopPropagation();
		getCreateReturnWorkshopMaterial($(this).attr('data-id'));
	});

	$('body').on('click', '.check', function (e) {
		e.stopPropagation();
		checkItem($(this).attr('data-id'));

	});


	//搜索
	$('body').on('click', '#searchForm .submit', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$('#searchForm .el-item-hide').slideUp(400, function () {
			$('#searchForm .el-item-show').css('backageground', 'transparent');
		});
		$('.arrow .el-input-icon').removeClass('is-reverse');
		if (!$(this).hasClass('is-disabled')) {
			$(this).addClass('is-disabled');
			var status = $('.el-tap.active').attr('data-status');
			var parentForm = $(this).parents('#searchForm');
			$('.el-sort').removeClass('ascending descending');
			if (status == 2) {
				var workStationDate = '';
				var workStationTime = '';
				if (parentForm.find('#work_station_time').val()) {
					workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
					workStationTime = Math.round(workStationDate.getTime() / 1000);
				}

				ajaxData = {
					sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
					sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
					work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
					work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
					production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
					schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
					picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
					send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
					// inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
					// inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
					// plan_start_date: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
					plan_start_date: parentForm.find('#start_time').val(),
					plan_end_date: parentForm.find('#end_time').val(),
					rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
					order: 'desc',
					sort: 'id',
					workbench_name: encodeURIComponent(parentForm.find('#work_shift_name').val().trim()),
					daytime: encodeURIComponent(workStationTime),
					workcenter_name: encodeURIComponent(parentForm.find('#work_center').val().trim()),
				};
			} else {
				ajaxData = {
					sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
					sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
					work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
					work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
					production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
					schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
					picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
					send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
					// inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
					// inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
					// plan_start_date: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
					plan_start_date: parentForm.find('#start_time').val(),
					plan_end_date: parentForm.find('#end_time').val(),
					rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
					order: 'desc',
					sort: 'id',
					workcenter_name: encodeURIComponent(parentForm.find('#work_center').val().trim()),
				};
			}
			pageNo = 1;
			getWorkOrder(status);
		}
	});
	//重置搜索框值
	$('body').on('click', '#searchForm .reset', function (e) {
		e.stopPropagation();
		resetAll();
		var status = $('.el-tap.active').attr('data-status');
		getWorkOrder(status);
	});

	$('#start_time').on('click', function (e) {
		e.stopPropagation();
		var that = $(this);
		var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();

		layui.use(['form', 'layedit', 'laydate'], function () {
			var form = layui.form
				, layer = layui.layer
				, layedit = layui.layedit
				, laydate = layui.laydate;
			start_time = laydate.render({
				elem: '#start_time_input',
				// max: max,
				type: 'datetime',
				show: true,
				closeStop: '#start_time',
				done: function (value, date, endDate) {
					that.val(value);
				}
			});
		});

	});
	$('#end_time').on('click', function (e) {
		e.stopPropagation();
		var that = $(this);
		var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';

		layui.use(['form', 'layedit', 'laydate'], function () {
			var form = layui.form
				, layer = layui.layer
				, layedit = layui.layedit
				, laydate = layui.laydate;
			end_time = laydate.render({
				elem: '#end_time_input',
				min: min,
				// max: getCurrentDate(),
				type: 'datetime',
				show: true,
				closeStop: '#end_time',
				done: function (value, date, endDate) {
					that.val(value);
				}
			});
		});
	});

	// 导出 
	$('body').on('click', '#searchForm .export', function (e) {
		e.stopPropagation();

		let el = $('._tbody .checks'), _arr = [], idstr = '', ajaxDatas = {};

		for (let i = 0; i < el.length; i++) {
			if ($(el[i]).prop('checked') == true) {
				_arr.push($(el[i]).attr('data-work_id'));
			}
		}

		if (_arr.length != 0) {
			_arr.forEach((item, index) => {
				if (index == 0) {
					idstr = item;
				} else {
					idstr = idstr + ',' + item;
				}
			})
		} else {
			idstr = '';
		}

		var urlLeft = '';
		var parentForm = $(this).parents('#searchForm');
		var workStationDate = '';
		if (parentForm.find('#work_station_time').val()) {
			workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
		} else {
			workStationDate = new Date(getNowFormatDate());
		}

		var workStationTime = Math.round(workStationDate.getTime() / 1000);

		ajaxDatas = {
			sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
			sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
			work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
			work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
			production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
			schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
			picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
			send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
			// inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
			// inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
			// plan_start_date: encodeURIComponent(parentForm.find('#plan_start_time').val().trim()),
			plan_start_date: parentForm.find('#start_time').val(),
			plan_end_date: parentForm.find('#end_time').val(),
			rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),
			order: 'desc',
			sort: 'id',
			workbench_name: encodeURIComponent(parentForm.find('#work_shift_name').val().trim()),
			daytime: encodeURIComponent(workStationTime),
			ids: idstr,
		};
		for (var param in ajaxDatas) {
			urlLeft += `&${param}=${ajaxDatas[param]}`;
		}
		urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
		let url = URLS['order'].excelExport + _token + urlLeft;
		$('#exportExcel').attr('href', url)
	});

	//更多搜索条件下拉
	$('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
		e.stopPropagation();
		$(this).find('.el-icon').toggleClass('is-reverse');
		var that = $(this);
		that.addClass('noclick');
		if ($(this).find('.el-icon').hasClass('is-reverse')) {
			$('#searchForm .el-item-show').css('background', '#e2eff7');
			$('#searchForm .el-item-hide').slideDown(400, function () {
				that.removeClass('noclick');
			});
		} else {
			$('#searchForm .el-item-hide').slideUp(400, function () {
				$('#searchForm .el-item-show').css('background', 'transparent');
				that.removeClass('noclick');
			});
		}
	});

	//工单管理底下tab切换
	$('body').on('click', '.el-tap-wrap .el-item-tap', function () {
		var form = $(this).attr('data-item');
		if (!$(this).hasClass('active')) {
			$(this).addClass('active').siblings('.el-item-tap').removeClass('active');
			var status = $(this).attr('data-status');

			ajaxItemData = {
				type: status,
				work_order_code: work_order_code,
				work_order_id: work_order_id
			};

			if (work_order_code == '') {
				layer.confirm('请双击一个工单,显示领退补料,报工信息!', {
					icon: 3, title: '提示', offset: '250px', end: function () {
					}
				}, function (index) {
					layer.close(index);
				});
			} else {
				getPickingList();
			}
		}
	});
	//选着工单带出领料信息
	$('body').on('dblclick', '.tr_click', function () {




		// if ($(this).hasClass('is-checked')) {
		//     $(this).removeClass('is-checked');
		//     return;
		// }

		// $(this).parent().parent().parent().find('.el-checkbox_input_check').each(function (k, v) {
		//     $(v).removeClass('is-checked');
		// });

		$(this).parent().find('.tr_click').each(function (k, v) {
			$(v).css('background', '#fff');
		})
		$(this).css('background', '#abbac3');
		$("#clearHeight").height($(window).height() - 500);
		// $(this).addClass('is-checked');
		work_order_code = $(this).find('.el-checkbox_input_check').attr('data-id');
		work_order_id = $(this).find('.el-checkbox_input_check').attr('data-work_id');
		ajaxData.pageNo = pageNo;
		ajaxData.work_order_code = work_order_code;
		ajaxData.work_order_id = work_order_id;
		sessionStorage.setItem('work_order_page_index', JSON.stringify(ajaxData))
		// window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
		ajaxItemData.work_order_code = work_order_code;
		ajaxItemData.work_order_id = work_order_id;
		if (work_order_code == '' && work_order_id == '') {
			layer.confirm('请选择一个工单！?', {
				icon: 3, title: '提示', offset: '250px', end: function () {
				}
			}, function (index) {
				layer.close(index);
			});
		} else {
			getPickingList();
		}
	});

	$('body').on('click', '.item_submit', function (e) {
		e.stopPropagation();
		var id = $(this).attr('data-id');
		var type = $(this).attr('data-type');

		layer.confirm('您将执行推送操作！?', {
			icon: 3, title: '提示', offset: '250px', end: function () {
			}
		}, function (index) {
			layer.close(index);
			submint(id, type);
		});

	});

	$('body').on('click', '.item_check', function (e) {
		e.stopPropagation();
		var id = $(this).attr('data-id');

		layer.confirm('您将执行审核操作！?', {
			icon: 3, title: '提示', offset: '250px', end: function () {
			}
		}, function (index) {
			layer.close(index);
			check(id);
		});

	});
	$('body').on('click', '.buste_submit', function (e) {
		e.stopPropagation();
		var id = $(this).attr('data-id');

		layer.confirm('您将执行推送操作！?', {
			icon: 3, title: '提示', offset: '250px', end: function () {
			}
		}, function (index) {
			layer.close(index);
			busteSubmint(id);
		});

	});
	$('body').on('click', '.buste_delete', function (e) {
		e.stopPropagation();
		var id = $(this).attr('data-id');

		layer.confirm('您将执行删除操作！?', {
			icon: 3, title: '提示', offset: '250px', end: function () {
			}
		}, function (index) {
			layer.close(index);
			deleteBusteItem(id);
		});

	});
	$('body').on('click', '.delete', function (e) {
		e.stopPropagation();
		var id = $(this).attr('data-id');
		layer.confirm('您将执行删除操作！?', {
			icon: 3, title: '提示', offset: '250px', end: function () {
			}
		}, function (index) {
			layer.close(index);
			deleteItem(id);
		});

	});


}
function deleteItem(id) {
	AjaxClient.get({
		url: URLS['work'].delete + "?" + _token + "&material_requisition_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('success', '删除成功！');
			getPickingList();

		},
		fail: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('fail', '删除失败！错误日志为：' + rsp.message)
		}
	}, this)
}

function busteSubmint(id) {
	AjaxClient.get({
		url: URLS['work'].submitBuste + "?" + _token + "&id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results.RETURNCODE == 0) {
				LayerConfig('success', '成功！');
				getPickingList();
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('fail', rsp.message)
		}
	}, this)
}

function deleteBusteItem(id) {
	AjaxClient.get({
		url: URLS['work'].destroy + "?" + _token + "&id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);

			LayerConfig('success', '成功！');
			getPickingList();

		},
		fail: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('fail', rsp.message)
		}
	}, this)
}

function submint(id, type) {
	AjaxClient.get({
		url: URLS['work'].submit + "?" + _token + "&id=" + id + "&type=" + type + "&date=" + " " + "&time=" + " ",
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results.RETURNCODE == 0) {
				LayerConfig('success', '成功！', function () {
					ajaxItemData = {
						type: type,
						work_order_code: work_order_code
					};
					getPickingList();
				});


			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('fail', rsp.message);
			// layer.msg('获取工单详情失败，请刷新重试', 9);
		}
	}, this)
}

function checkItem(id) {
	AjaxClient.get({
		url: URLS['work'].checkWork + "?" + _token + "&id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results) {
				LayerConfig('success', '送检成功！')
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg(rsp.message, { icon: 2, offset: '250px' });

			// layer.msg('获取工单详情失败，请刷新重试', 9);
		}
	}, this)
}

function getCreateReturnMaterial(id) {
	AjaxClient.get({
		url: URLS['work'].checkReturnMaterial + "?" + _token + "&work_order_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results) {
				window.location.href = "/WorkOrder/createPickingList?id=" + id + "&type=2";
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg(rsp.message, { icon: 2, offset: '250px' });
		}
	}, this)
}

function getCreateReturnWorkshopMaterial(id) {
	AjaxClient.get({
		url: URLS['work'].checkWorkShopReturnMaterial + "?" + _token + "&work_order_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results) {
				window.location.href = "/WorkOrder/createWorkshopPickingList?id=" + id + "&type=2";
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg(rsp.message, { icon: 2, offset: '250px' });

			// layer.msg('获取工单详情失败，请刷新重试', 9);
		}
	}, this)
}

function check(id) {
	AjaxClient.get({
		url: URLS['work'].check + "?" + _token + "&material_requisition_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp.results) {
				LayerConfig('success', '成功！');
				getPickingList();

			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg(rsp.message, { icon: 2, offset: '250px' });

			// layer.msg('获取工单详情失败，请刷新重试', 9);
		}
	}, this)
}


function bindItemPagenationClick(totalData, pageSize) {
	$('#item_pagenation').show();
	$('#item_pagenation').pagination({
		totalData: totalData,
		showData: pageSize,
		current: itemPageNo,
		isHide: true,
		coping: true,
		homePage: '首页',
		endPage: '末页',
		prevContent: '上页',
		nextContent: '下页',
		jump: true,
		callback: function (api) {
			itemPageNo = api.getCurrent();
			getPickingList();
		}
	});
}

//重置搜索参数
function resetParamItem() {
	ajaxItemData = {
		type: '',
		work_order_code: work_order_code
	};
}

//获取粗排列表
function getPickingList() {
	var urlLeft = '';
	if (ajaxItemData.type == '') {
		ajaxItemData.type = '1';
	}
	//报工
	if (ajaxItemData.type == 8) {
		urlLeft += "&workOrder_number=" + work_order_code + "&page_no=" + itemPageNo + "&page_size=" + pageSize;
		AjaxClient.get({
			url: URLS['work'].pageIndex + "?" + _token + urlLeft,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				// if (layerModal != undefined) {
				//     layerLoading = LayerConfig('load');
				// }
				var totalData = rsp.paging.total_records;
				var _html = createBusteItemHtml(rsp);
				$('.show_item_table_page').html(_html);
				if (totalData > pageSize) {
					bindItemPagenationClick(totalData, pageSize);
				} else {
					$('#item_pagenation.unpro').html('');
				}

			},
			fail: function (rsp) {
				layer.close(layerLoading);
				noData('获取领料单列表失败，请刷新重试', 9);
			},
			complete: function () {
				$('#searchForm .submit').removeClass('is-disabled');
			}
		}, this)
	} else if (ajaxItemData.type == 9) {
		urlLeft += "&work_order_code=" + work_order_code + "&page_no=" + itemPageNo + "&page_size=" + pageSize;
		AjaxClient.get({
			url: URLS['work'].mergerReturnMaterial + "?" + _token + urlLeft,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				// if (layerModal != undefined) {
				//     layerLoading = LayerConfig('load');
				// }
				var totalData = rsp.paging.total_records;
				var _html = mergerReturnMaterialHtml(rsp);
				$('.show_item_table_page').html(_html);
				if (totalData > pageSize) {
					bindItemPagenationClick(totalData, pageSize);
				} else {
					$('#item_pagenation.unpro').html('');
				}

			},
			fail: function (rsp) {
				layer.close(layerLoading);
				noData('获取合并退料单列表失败，请刷新重试', 9);
			},
			complete: function () {
				$('#searchForm .submit').removeClass('is-disabled');
			}
		}, this)
	} else if (ajaxItemData.type == 3) {//sap合并
		urlLeft += "&work_order_id=" + ajaxItemData.work_order_id + "&page_no=" + itemPageNo + "&page_size=" + pageSize;
		AjaxClient.get({
			url: URLS['work'].getSapPickingByWorkOrder + "?" + _token + urlLeft,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				// if (layerModal != undefined) {
				//     layerLoading = LayerConfig('load');
				// }
				var totalData = rsp.paging.total_records;
				var _html = createCombineISaptemHtml(rsp);
				$('.show_item_table_page').html(_html);
				if (totalData > pageSize) {
					bindItemPagenationClick(totalData, pageSize);
				} else {
					$('#item_pagenation.unpro').html('');
				}

			},
			fail: function (rsp) {
				layer.close(layerLoading);
				noData('获取领料单列表失败，请刷新重试', 9);
			},
			complete: function () {
				$('#searchForm .submit').removeClass('is-disabled');
			}
		}, this)
	} else if (ajaxItemData.type == 4) {//车间合并
		urlLeft += "&work_order_id=" + ajaxItemData.work_order_id + "&page_no=" + itemPageNo + "&page_size=" + pageSize;
		AjaxClient.get({
			url: URLS['work'].getShopPickingByWorkOrder + "?" + _token + urlLeft,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				// if (layerModal != undefined) {
				//     layerLoading = LayerConfig('load');
				// }
				var totalData = rsp.paging.total_records;
				var _html = createCombineIShoptemHtml(rsp);
				$('.show_item_table_page').html(_html);
				if (totalData > pageSize) {
					bindItemPagenationClick(totalData, pageSize);
				} else {
					$('#item_pagenation.unpro').html('');
				}

			},
			fail: function (rsp) {
				layer.close(layerLoading);
				noData('获取领料单列表失败，请刷新重试', 9);
			},
			complete: function () {
				$('#searchForm .submit').removeClass('is-disabled');
			}
		}, this)
	} else {//领补退
		console.log(ajaxItemData)
		for (var param in ajaxItemData) {
			urlLeft += `&${param}=${ajaxItemData[param]}`;
		}
		urlLeft += "&page_no=" + itemPageNo + "&page_size=" + pageSize;
		AjaxClient.get({
			url: URLS['work'].MaterialRequisition + "?" + _token + urlLeft,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				// if (layerModal != undefined) {
				//     layerLoading = LayerConfig('load');
				// }
				var totalData = rsp.paging.total_records;
				var _html = createItemHtml(rsp);
				$('.show_item_table_page').html(_html);
				if (totalData > pageSize) {
					bindItemPagenationClick(totalData, pageSize);
				} else {
					$('#item_pagenation.unpro').html('');
				}

			},
			fail: function (rsp) {
				layer.close(layerLoading);
				noData('获取领料单列表失败，请刷新重试', 9);
			}

		}, this)
	}

}

//生成领料单列表数据
function createCombineIShoptemHtml(data) {
	var viewurl = "/WorkOrder/viewShopPickingListForAllPicking";
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			trs += `
			<tr>
			<td >${tansferNull(item.code)}</td>
			<td >${tansferNull(item.factory_name)}</td>
			<td >${tansferNull(item.get_depot)}</td>
			<td >${tansferNull(item.bench_no)}</td>
			<td >${tansferNull(item.send_depot)}</td>
			<td >${tansferNull(item.dispatch_time)}</td>
			<td class="right">
			<a class="button pop-button view" href="${viewurl}?id=${item.id}">编辑</a>
	         ${(item.status == 2 || item.status == 1) ? `<button data-id="${item.id}" data-type="${item.type}" class="button pop-button delete">删除</button>` : ''}
	        </td>
			</tr>
			`;
		})
	} else {
		trs = '<tr><td colspan="12" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable  commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">车间</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发料仓</th>
                        <th class="left nowrap tight">配送时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
	return thtml;
}//生成领料单列表数据
function createCombineISaptemHtml(data) {
	var viewurl = "/WorkOrder/viewPickingListForAllPicking";
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			trs += `
			<tr>
			<td >${tansferNull(item.code)}</td>
			<td >${tansferNull(item.factory_name)}</td>
			<td >${tansferNull(item.get_depot)}</td>
			<td >${tansferNull(item.bench_no)}</td>
			<td >${tansferNull(item.send_depot)}</td>
			<td >${tansferNull(item.dispatch_time)}</td>
			
			<td class="right">
			${item.status == 1 ? `<button data-id="${item.id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.id}">编辑</a>
	         ${(item.status == 2 || item.status == 1) ? `<button data-id="${item.id}" data-type="${item.type}" class="button pop-button delete">删除</button>` : ''}
	         
	        </td>
			</tr>
			`;
		})
	} else {
		trs = '<tr><td colspan="12" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable  commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">车间</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发料仓</th>
                        <th class="left nowrap tight">配送时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
	return thtml;
}

//生成合并退料单列表数据
function mergerReturnMaterialHtml(data) {
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			var thtml = '';
			if (item.wo_po && item.wo_po.length) {
				thtml = creatSPWHtml(item.wo_po);
			}
			trs += `
            <tr>
              <td >${tansferNull(item.code)}</td>
              <td >${tansferNull(thtml)}</td>
              <td >${tansferNull(item.line_depot_name)}</td>
              <td width="200px;">${tansferNull(item.factory_name)}</td>
              <td >${tansferNull(item.workbench_name)}</td>
              <td>${tansferNull(item.employee_name)}</td>
              <td>${tansferNull(item.type == 2 ? checkReturnStatus(item.status) : checkPickingStatus(item.status))}</td>
              <td>${tansferNull(checkType(item.type))}</td>
              <td>${tansferNull(item.line_depot_code)}</td>
              <td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.ctime)}</td>
              <td class="right">
                <a class="button pop-button view" href="/WorkOrder/viewPickingListForAllPicking?id=${item.id}">查看</a>
              </td>
            </tr>
			    `;
		})
	} else {
		trs = '<tr><td colspan="11" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable  commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">合并信息</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
	return thtml;
}

//合并信息的数据
function creatSPWHtml(data) {

	var trs = '';
	if (data && data.length) {
		data.forEach(function (item, index) {

			trs += `
    <tr >
    <td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
    <td>${tansferNull(item.product_order_code)}</td>
    <td>${tansferNull(item.work_order_code)}</td>
    <td>${tansferNull(item.inspur_material_code)}</td>
    </tr>
    `;
		})
	} else {
		trs = '<tr><td colspan="4" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
          <table id="work_order_table" class="sticky uniquetable commontable" style="border: 1px solid #ccc;">
              <thead>
                  <tr>
                      <th class="left nowrap tight">销售订单号/行项号</th>
                      <th class="left nowrap tight">生产订单号</th>
                      <th class="left nowrap tight">工单号</th>
                      <th class="left nowrap tight">浪潮物料号</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">${trs}</tbody>
          </table>
      </div>`
	return thtml;
}

//生成报工列表数据
function createBusteItemHtml(data) {
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {
			trs += `
          <tr>
            <td >${tansferNull(item.production_order_code)}</td>
            <td >${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
            <td >${item.out[0].qty}</td>
            <td width="200px;">${item.out[0].name}</td>
            <td >${item.out[0].GMNGA}</td>
            <td>${tansferNull(item.code)}</td>
            <td>${tansferNull(item.ISDD + item.ISDZ)}</td>
            <td>${tansferNull(item.IEDD + item.IEDZ)}</td>
            <td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
            <td>${tansferNull(item.send_depot)}</td>
            <td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
            <td class="right">
              ${item.status != 2 ? `<button data-id="${item.id}" class="button pop-button buste_submit">推送</button>` : ''}
              <a class="button pop-button view" href="/Buste/busteIndex?id=${item.id}&type=edit">查看</a>
              ${item.status == 1 ? `<button data-id="${item.id}" class="button pop-button buste_delete">删除</button>` : ''}
            </td>
          </tr>
        `;
		})
	} else {
		trs = '<tr><td colspan="12" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div">
          <table id="work_order_table" class="sticky uniquetable  commontable">
              <thead>
                  <tr>
                      <th class="left nowrap tight">生产订单号</th>
                      <th class="left nowrap tight">工单号</th>
                      <th class="left nowrap tight">计划数量</th>
                      <th class="left nowrap tight">产出品</th>
                      <th class="left nowrap tight">产出品数量</th>
                      <th class="left nowrap tight">报工单号</th>
                      <th class="left nowrap tight">开始执行</th>
                      <th class="left nowrap tight">执行结束</th>
                      <th class="left nowrap tight">状态</th>
                      <th class="left nowrap tight">采购仓储</th>
                      <th class="left nowrap tight">报工类型</th>
                      <th class="right nowrap tight">操作</th>
                  </tr>
              </thead>
              <tbody class="table_tbody">${trs}</tbody>
          </table>
      </div>
      <div id="pagenation" class="pagenation unpro"></div>`;
	return thtml;
}

//生成领料单列表数据
function createItemHtml(data) {
	var viewurl = $('#workOrderItem_view').val();
	var trs = '';
	if (data && data.results && data.results.length) {
		data.results.forEach(function (item, index) {

			trs += `
			<tr>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.line_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
			<td>${tansferNull(item.workbench_name)}</td>
		    <td>${item.push_type == 0 ?
					`<span style="display: inline-block;border: 1px solid red;color: red;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">线边</span>`
					: item.push_type == 1 ?
						`<span style="display: inline-block;border: 1px solid green;color: green;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">SAP</span>`
						: item.push_type == 2 ?
							`<span style="display: inline-block;border: 1px solid #debf08;color: #debf08;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">车间</span>` :
							''
				}</td>
		    <td>${tansferNull(item.employee_name)}</td>
			<td style="color: ${item.status == 3 ? 'red' : ''}">${tansferNull(item.type == 2 ? checkReturnStatus(item.status) : checkPickingStatus(item.status))}</td>
			<td>${tansferNull(checkType(item.type))}</td>
			<td>${tansferNull(item.dispatch_time)}</td>
            <td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         ${(item.status == 2 || item.status == 1) ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button delete">删除</button>` : ''}        
             <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">操作</a>        
                    </td>
                    </tr>
`;
		})
	} else {
		trs = '<tr><td colspan="12" class="center">暂无数据</td></tr>';
	}
	var thtml = `<div class="wrap_table_div" style="height: 300px; overflow-y: auto; overflow-x: hidden;" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">线边仓</th>
						<th class="left nowrap tight">工厂</th>
						<th class="left nowrap tight">工位号</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发送至</th>
                        <th class="left nowrap tight">领料人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">配送时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="item_pagenation" class="pagenation unpro" style="margin-top: 5px;"></div>`;
	return thtml;
}

function checkType(type) {
	switch (type) {
		case 1:
			return '领料';
			break;
		case 2:
			return '退料';
			break;
		case 7:
			return '补料';
			break;
		default:
			break;
	}
}

function checkPickingStatus(status) {
	switch (status) {
		case 1:
			return '未发送';
			break;
		case 2:
			return '已推送';
			break;
		case 3:
			return '进行中';
			break;
		case 4:
			return '完成';
			break;
		default:
			break;
	}
}

function checkReturnStatus(status) {
	switch (status) {
		case 1:
			return '待推送';
			break;
		case 2:
			return '进行中';
			break;
		case 3:
			return '待出库';
			break;
		case 4:
			return '完成';
			break;
		default:
			break;
	}
}

// 工作中心
workCenter();
function workCenter() {
	AjaxClient.get({
		url: '/WorkOrder/getWorkcenter' + "?" + _token,
		dataType: 'json',
		success: function (rsp) {
			let data = rsp.results;
			data.forEach(function (item) {
				let li = getWorkCenterList(item);
				$('.work-center .el-select-dropdown-list').append(li);
			})
		},
		fail: function (rsp) {
			console.log(rsp);
		}

	}, this)
}

function getWorkCenterList(item) {
	let li = `
		<li class=" el-select-dropdown-item" data-id="${item.name}">${item.name}</li>
	`;
	return li;
}

