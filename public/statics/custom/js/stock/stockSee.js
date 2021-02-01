let url = window.location.href;
let index = url.lastIndexOf('=');
let id = url.slice(index+1);
let tbody = $('#tbody');

getDataList();
function getDataList() {

	tbody.html('');
	AjaxClient.get({
		url: '/storageinve/getStorageItemList' + '?' + _token + '&inve_ids=' + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			console.log(id);
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

function getTr(item) {
	let tr = `
		<tr style=" background: ${item.direct != 1 ? '#e2e2e2' : '#fff' };">
			<td ${item.direct}>${item.direct == 1 ? '入库' : '出库'}</td>
			<td>${item.inve_id}</td>
			<td>${item.sale_order_code}/${item.sales_order_project_code}</td>
			<td>${item.po_number}</td>
			<td>${item.wo_number}</td>
			<td>${item.material_name}</td>
			<td>${item.ctime}</td>
			<td>${item.depot_name}</td>
			<td>${item.categoryType}</td>
			<td>${item.quantity}</td>
			<td>
				<button type="button" data-id="${item.category_id}" style="display: ${item.category_id == 13 ? 'block' : 
				item.category_id == 17 ? 'block' : 
				item.category_id == 32 ? 'block' :
				item.category_id == 35 ? 'block' : 'none' 
		};" class="layui-btn layui-btn-primary layui-btn-sm look_gldj " data-ids = "${item.id}" >查看关联单据</button>
		<button type="button" data-id="${item.category_id}" style="display: ${
					item.category_id == 0 ? 'block' :
					item.category_id == 21 ? 'block' :
					item.category_id == 14 ? 'block' :
					item.category_id == 19 ? 'block' :'none'
		};margin-left:0px;" class="layui-btn layui-btn-primary layui-btn-sm look_gl " data-ids = "${item.id}" >查看关联单据</button>
			</td>
		</tr>
	`;
	return tr;
}

/**
 * 
 * 	库存查询-库存明细
 *  其他入库 -> 0
 * 	其他出库 -> 21
 *  车间向wms领料 -> 14
 * 	车间向wms补料 -> 19
 * 
 **/
$('body').on('click', '.look_gl', function() {
	
	let data_id = $(this).attr('data-id');
	let data_ids = $(this).attr('data-ids');

	AjaxClient.get({
		url: '/storageinve/getRelativeBill' + '?' + _token + '&category_id=' + data_id + '&item_id=' + data_ids,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if(rsp.results.length != 0) {
				var item = rsp.results[0];
			}else {
				var item = [];
			}
			if(data_id == 0 || data_id == 21) {
				layer.open({
					type: 1,
					skin: 'demo-class',
					title: data_id == 0 ? '其他入库' : '其他出库',
					anim: 2,
					closeBtn: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', ''], //宽高
					content: `
					<div id="con" >
						<div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >物料编码</div>
						 	<div style="width:70%;" >${item.item_no == undefined ? '' : item.item_no}</div>
						</div>
						<div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >物料名称</div>
						 	<div style="width:70%;" >${item.material_name == undefined ? '' : item.material_name}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >创建人</div>
						 	<div style="width:70%;" >${item.cn_name == undefined ? '' : item.cn_name}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >创建时间</div>
						 	<div style="width:70%;" >${item.createtime == undefined ? '' : item.createtime}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px; margin-bottom:20px;" >备注</div>
						 	<div style="width:70%;  margin-bottom:20px;" >${item.remark == undefined ? '' : item.remark}</div>
						</div>
					</div>
        			`
				})
			} else if(data_id == 14 || data_id == 19) {
				layer.open({
					type: 1,
					skin: 'demo-class',
					title: data_id == 14 ? '车间向wms领料' : '车间向wms补料',
					anim: 2,
					closeBtn: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['400px', '280px'], //宽高
					content: `

					<div id="con" >
						<div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >领料单号</div>
						 	<div style="width:70%;" >${item.CODE == undefined ? '' : item.CODE}</div>
						</div>
						<div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >负责人</div>
						 	<div style="width:70%;" >${item.name == undefined ? '' : item.name}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px;" >创建时间</div>
						 	<div style="width:70%;" >${item.ctime == undefined ? '' : item.ctime}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px; " >发料时间</div>
						 	<div style="width:70%;" >${item.time == undefined ? '' : item.time}</div>
						</div><div style="display:flex;">
						 	<div style="width:30%;margin-left:20px; margin-bottom:20px;" >工位</div>
						 	<div style="width:70%;  margin-bottom:20px;" >${item.b_name == undefined ? '' : item.b_name}</div>
						</div>
					</div>
        			`
				})
			}

		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
})

/**
 *
 * 	库存查询-库存明细
 *  普通入库出库
 * 	 
 * 	13 17 32 35
 *
 **/

$('body').on('click', '.look_gldj', function() {
	let c_id = $(this).attr('data-id');
	let i_id = $(this).attr('data-ids');
	AjaxClient.get({
		url: '/storageinve/getRelativeBill' + '?' + _token + '&category_id=' + c_id + '&item_id=' + i_id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);

			if( rsp.results == null) {
				layer.alert('未查找到相关单据！');
			} else {
				layer.open({
					type: 1,
					skin: 'demo-class',
					title: '',
					anim: 2,
					closeBtn: 2,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '530px'], //宽高
					content: `
					<div id="content">
						<div style="background:#fff;   margin-left:10px; -moz-box-shadow:3px 3px 6px #6E5B56; -webkit-box-shadow:3px 3px 6px #6E5B56; box-shadow:3px 3px 6px #6E5B56;">
							<div style="height:50px;">
								<label style="font-size:20px;margin-left:10px;margin-top:16px">出库</label>
							</div>
							<div class="p" id="ck">
								
							</div>
						</div>
						<div style="background:#fff;     margin-left:10px !important; margin-right:10px;-moz-box-shadow:3px 3px 6px #6E5B56; -webkit-box-shadow:3px 3px 6px #6E5B56; box-shadow:3px 3px 6px #6E5B56;">
							<div style="height:50px;">
								<label style="font-size:20px;margin-left:10px;margin-top:16px">入库</label>
							</div>
							<div class="p" id="rk">
								
							</div>
						</div>
					</div>
        			`
				})

				let ck = rsp.results[0];
				let rk = rsp.results[1];

				let ck_p = getP(ck);
				let rk_p = getP(rk);

				$('#ck').append(ck_p);
				$('#rk').append(rk_p);
			}
			
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
})


function getP(item) {

	let p = `
		<table class="layui-table">
			<tbody>
				<tr>
					<td>ID</td>
					<td>${item.id == undefined ? '' : item.id}</td>
				</tr>
				<tr>
					<td>仓库编码</td>
					<td>${item.depot_code}</td>
				</tr>
				<tr>
					<td>创建时间</td>
					<td>${item.createtime}</td>
				</tr>
				<tr>
					<td>创建人</td>
					<td>${item.cn_name}</td>
				</tr>
				<tr>
					<td>仓库</td>
					<td>${item.name}</td>
				</tr>
				<tr>
					<td>销售订单/行项</td>
					<td>${item.sale_order_code}/${item.sales_order_project_code}</td>
				</tr>
				<tr>
					<td>生产订单</td>
					<td>${item.po_number}</td>
				</tr>
				<tr>
					<td>工单号</td>
					<td>${item.wo_number}</td>
				</tr>
				<tr>
					<td>物料编码</td>
					<td>${item.item_no}</td>
				</tr>
			</tbody>
		</table>
	`;
	return p;
}