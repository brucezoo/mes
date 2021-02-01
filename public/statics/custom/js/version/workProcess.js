
var url = window.location.href;
var urls = url.substring(url.lastIndexOf('?') + 1);
var arr = urls.split("&");

let _so_code = arr[0].split('=')[1],
_sop_code = arr[1].split('=')[1],
_w_order = arr[2].split('=')[1],
_lan = arr[3].split('=')[1],
_process = arr[4].split('=')[1];


$('#salesOrder').val(_so_code);
$('#salesOrderItem').val(_sop_code);

worker();
getList();


function worker() {
	AjaxClient.get({
		url: '/Operation/getAlllanguage' + '?' + _token,
		dataType: 'json',
		success: function (rsp) {
			let _opt = `<option value="">Please Select</option>`;
			rsp.results.forEach(item => {
				_opt += `<option value="${item.operation_id}">${item.language_name}</option>`
			})
			$('#curr').html(_opt);

			layui.use(['form', 'layedit', 'laydate'], function () {
				var form = layui.form
				form.render();
			})

			var select = 'dd[lay-value=' + _process + ']';
			$('#curr').siblings("div.layui-form-select").find('dl').find(select).click();
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
}

// 获取列表

function getList() {
	$('.layui-collapse').html('');
	AjaxClient.get({
		url: '/Language/salesorderProcess' + '?' + _token + '&sales_order_code=' + _so_code + '&sales_order_project_code=' + _sop_code + '&work_number=' + _w_order + '&languageCode=' + _lan,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			console.log(rsp);
			let _div = '';
			rsp.results.forEach( (item,index) => {

				let _in_out = getIn(item.wo_arr[0].SpecialCraftList, item.wo_arr[0].practice);
				let _pdf = getPdf(item.wo_arr[0].material_drawings);
				let _img = getImg(item.wo_arr[0].material_step_drawings);
				 _div += `
				<div class="layui-colla-item">
					<h2 class="layui-colla-title">Process:${item.operation_name}</h2>
					<div class="layui-colla-content">
						<!-- 描述 -->
						<div id="describe">
							<div>${item.wo_arr[0].wo_number}</div>
							<div>Production Orders:${item.wo_arr[0].po_number}</div>
							<div>Finished Product Code:${item.wo_arr[0].item_no} </div>
							<div>Finished Product Description:${item.wo_arr[0].material_name}</div>
							<div>Current Version:v${item.wo_arr[0].old_version}.0</div>
							<div><span id="div6">Latest Version:v${item.wo_arr[0].new_version}.0</span></div>
							<div>Latest Release Date:${item.wo_arr[0].currentversion_ctime}</div>
							<div>Work Order Number:${item.wo_arr[0].qty}${item.wo_arr[0].bom_commercial}</div>
						</div>
						<!-- 进出料 -->
						<div id="in_out">
							${_in_out}
						</div>
						<!-- 图片 -->
						<div id="img">
							<div class="img_left">Picture</div>
							<div class="img_right"><ul class="uls" data-id=${'uls' + index} id=${'uls' + index}>${_img}</ul></div>
						</div>
						<!-- 附件 -->
						<div id="pdf">
							<div class="pdf_left">Attachment</div>
							<div class="pdf_right">${_pdf}</div>
						</div>
					</div>
				</div>
			`
			})


			$('.layui-collapse').html(_div);

			//折叠面板 初始化 
			layui.use(['element', 'layer'], function () {
				var element = layui.element;
				var layer = layui.layer;

				//监听折叠
				// element.on('collapse(test)', function (data) {
				// 	layer.msg('展开状态：' + data.show);
				// });

				layui.element.init();
			});
			
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	})

}


// 获取步骤

function getIn(data, items) {
	let itemc = '';
	if(items == undefined) {
		itemc = '';
	}else {
		itemc = items;
	}
	var spec = '';
	for(let i=0; i<data.length; i++) {
	
		var _div = '';
		for(let j=0; j<data[i].length; j++) {
			_div += `<div class="div_in">
				<div class="div_one">${data[i][j].item_no} ${data[i][j].type == 1 ? `>>` : `<<`}</div>
				<div class="div_two">
					<div><span class="zma">${tansferNull(data[i][j].zma001)}</span></div>
					<div>Order Amount:${tansferNull(data[i][j].useNum)}${tansferNull(data[i][j].commercial)}</div>
				</div>
			</div>`;

		}
		
		_div += `<div style="color:red;margin-left:10px; min-height:50px; line-height:50px;">Special Process:${tansferNull(data[i][0].specialDesc)}</div>`;

		spec += `
			<div class="workp">
				<div class="workp_left">${itemc != '' ? itemc[0].mpflName : ''}</div>
				<div class="workp_mid">
					${_div}
				</div>
			</div>
		`;

	}
	

	return spec;
}


function getPdf(data) {
	let _pdf = '';

	if(data.length == 0) {
		_pdf = `<span style="line-height: 50px; margin-left: 20px;">No PDF File</span>`;
	}else {
		let img = '', str = '', gs = '';
			data.forEach(item => {
				str = item.image_path.indexOf('.')
				gs = item.image_path.slice(str + 1, str + 4);
				if (gs == 'pdf') {
					img = '/statics/custom/img/logo_pdf.png';
				}else {
					img = '/storage/' + item.image_path;
				}
				
				_pdf += `<div style="width:340px; height:380px;box-shadow:2px 2px 4px #f0f0f0; border:1px solid #bbb; border-radius:3px;">
					<div class="click_pdf" style="width:340px; height:330px;cursor: pointer; text-align: center; vertical-align: middle !important; border-bottom:1px solid #bbb;"  data-id="${item.image_path}">${gs == 'pdf' ? `<img src=${img} style="margin-top:145px;" >` : `<img src=${img} style="width:100%;height:100%;" >`}</div>
					<div style="text-align:center;"><p>${tansferNull(item.name)} Edition:(${tansferNull(item.version)})</p>
					<p>Remarks:${tansferNull(item.ctime)}</p>
					</div>
			</div>`;
			})
	}

	return _pdf;
}

$('body').on('click', '.click_pdf', function() {

	window.open('/storage/' + $(this).attr('data-id')); 
})

$('body').on('click', '#back', function() {

	window.location.href = document.referrer; 
})


$('body').on('click', '#search', function() {
	_so_code = $('#salesOrder').val();
	_sop_code = $('#salesOrderItem').val();
	_process = $('#curr').val();
	getList();
})

function getImg(data) {
	let _img = '';

	if (data.length == 0) {
		_img = `<span style="line-height: 50px; margin-left: 20px;">No Picture File</span>`;
	} else {
		data.forEach(item => {
			_img += `
				<li style="display:inline-block !important; margin-left: 20px; margin-top:20px; margin-bottom:20px;  width:340xp; height:380px;box-shadow:2px 2px 4px #f0f0f0; border:1px solid #bbb; border-radius:3px;"><img style="width:340px; height:340px;" src="/storage/${item.image_path}">
					<div style="text-align:center;line-height:40px;">
			 			<p>${tansferNull(item.name)}</p>
			 		</div>
				</li>
			`;
		})
	}
	
	return _img;
}


$('body').on('mouseover', '.uls img', function() {

	let ul = $(this).parent().parent().attr('data-id');
	const gallery = new Viewer(document.getElementById(ul));
})




