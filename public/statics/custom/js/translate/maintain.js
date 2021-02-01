// 获取浏览器地址
var url = window.location.href;
var urls = url.substring(url.lastIndexOf('?') + 1);
var arr = urls.split("&");
var bomId = arr[0].split('=')[1];
var routingId = arr[1].split('=')[1];
var lgCode = arr[2].split('=')[1];
var rbid_all = [];
// var rbid = '';
// var rbids = [];
var upImg = [];

// 点击 翻译
$('#translates').on('click', function () {
	lgCode = $('#lists').val();
	getDatas();
})

getTranslates();
// 获取 国家 数据
function getTranslates() {
	AjaxClient.get({
		url: URLS['translate'].get + "?" + _token,
		dataType: 'json',
		fail: function (res) {
			let datas = res.results;
			for (let i = 0; i < datas.length; i++) {
				if (datas[i].name != '中文') {
					let option = `
                        <option value="${datas[i].code}" >${datas[i].name}</option>
                    `;
					$('#lists').append(option);
				}

				if (datas[i].code == lgCode) {
					$('#one').text(datas[i].name);
					$('#one').val(datas[i].code);
				}
			}
		}
	}, this)
}


//保存

$('#btn-save').on('click', function () {

	let lgCode = $('#lists').val();
	let mx = $('#con .mx');
	let con = $('#con .tsgy');
	let data = [];
	let arr = [];

	// // 保存 描述

	for (let i = 0; i < mx.length; i++) {
		arr.push({
			material_id: $(mx[i]).attr('data-id'),
			materialDesc: $(mx[i]).val(),
			rbrb_id: $(mx[i]).attr('data-ids'),
			language_code: lgCode,
			POSNR: $(mx[i]).attr('datas-id')
		})

		if (i == mx.length - 1) {
			m_x(arr);
		}
	}
	console.log(arr);

	function m_x(arr) {


		//  保存  工艺

		for (let i = 0; i < con.length; i++) {
			data.push({
				specialId: $(con[i]).attr('data-id'),
				languageCode: lgCode,
				specialDesc: $(con[i]).val(),
			});
		}
		AjaxClient.post({
			url: '/Language/materialDescription' + "?" + _token + '&datas=' + JSON.stringify(arr),
			dataType: 'json',
			beforeSend: function () {
				layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
			},
			success: function (res) {
				layer.close(layerLoading);
				layer.msg('描述保存成功！', { time: 3000, icon: 1, offset: 't' });
				g_y(data);
			},
			fail: function (res) {
				layer.close(layerLoading);
				layer.msg('描述保存失败！', { time: 3000, icon: 5, offset: 't' });
				g_y(data);
			}
		}, this)
	}

	function g_y(data) {

		AjaxClient.post({
			url: URLS['maintain'].special + "?" + _token + "&data=" + JSON.stringify(data),
			dataType: 'json',
			success: function (res) {

				layer.msg('特殊工艺保存成功！', { time: 3000, icon: 1, offset: 't' });
				getDatas();
			},
			fail: function (res) {

				layer.msg('特殊工艺保存失败！', { time: 3000, icon: 5, offset: 't' });
				getDatas();
			}
		}, this)

	}

})

getDatas();
function getDatas() {

	AjaxClient.get({
		url: URLS['maintain'].get + "?" + _token + '&languageCode=' + lgCode + '&bom_id=' + bomId + '&routing_id=' + routingId,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (res) {

			$('#con').html('');
			layer.close(layerLoading);
			let data = res.results;
			let arr_gy = [];
			let arr_lan = [];
			let gy = '', lan = '';
			let rb = [];

			for (let i = 0; i < data.length; i++) {
				// 外层 - 工序
				rbid_all = [];
				arr_gy = [];
				arr_lan = [];
				rb = [];
				gy = '';
				lan = '';
				let div = getDiv(data[i], i);
				$('#con').append(div);
				for (let j = 0; j < data[i].length; j++) {
					rb.push(data[i][j].rbrbId);
					if (j == 0) {

						let table = getTable(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						$('#' + i).append(table);

					} else if (data[i][j].rbrbId == data[i][j - 1].rbrbId) {

						let table = getTable(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						$('#' + i).append(table);

					} else if (data[i][j].rbrbId != data[i][j - 1].rbrbId) {
						public();

						$('#' + i).append(`
							<tr style="color:#333; font-weight:600; font-size:13px;">
								<td>特殊工艺</td>
								<td colspan="4" style="word-break:break-all;">${gy}</td>
							</tr>
							<tr style="color:#333; font-weight:600; font-size:13px;">
                            	<td>special process</td>
								<td colspan="4">
									<textarea rows="3" class="tsgy" data-id="${data[i][j - 1].rbrbId}" style="word-break:break-all;  width:100%;" cols="20">${lan}</textarea>
								</td>
							</tr>
						`);

						arr_gy = [];
						arr_lan = [];
						gy = '';
						lan = '';

						let table = getTable(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						$('#' + i).append(table);


					}


					if (j == data[i].length - 1) {

						public();
						$('#' + i).append(`
							<tr style="color:#333; font-weight:600; font-size:13px;">
								<td>特殊工艺</td>
								<td colspan="4" style="word-break:break-all;">${gy}</td>
							</tr>
							<tr style="color:#333; font-weight:600; font-size:13px;">
                            	<td>special process</td>
								<td colspan="4">
									<textarea rows="3" class="tsgy" data-id="${data[i][j].rbrbId}" style="word-break:break-all; width:100%;" >${lan}</textarea>
								</td>
							</tr>
						`);
					}


				}


				function public() {

					arr_gy = unique(arr_gy);
					arr_lan = unique(arr_lan);

					function unique(arr) {
						var len = arr.length;
						var result = []
						for (var i = 0; i < len; i++) {
							var flag = true;
							for (var j = i; j < arr.length - 1; j++) {
								if (arr[i] == arr[j + 1]) {
									flag = false;
									break;
								}
							}
							if (flag) {
								result.push(arr[i])
							}
						}
						return result;
					}


					arr_gy.forEach(function (item, index) {
						if (item != 'null' || item != '' || item != null) {
							if (index == 0) {
								gy = item;
							} else {
								gy += ' ，' + item;
							}
						}

					});

					arr_lan.forEach(function (item, index) {
						if (item != 'null' && item != '' && item != null) {
							if (index == 0) {
								lan = item;
							} else {
								lan += ' ，' + item;
							}
						}

					})
				}


				wImg(i, rb);
			}



			layui.use('element', function () {
				var element = layui.element;
				element.init();
			});

		}
	}, this)

}


// 外层 - 工序
function getDiv(data, i) {
	let nengLi = '', gongYi = '';
	let index = '', indexs = '';
	let rb_id = [];


	for (let j = 0; j < data.length; j++) {
		if (data[j].abilityLanName != null) {
			index = j + 1;
			nengLi = nengLi + index + '.' + data[j].abilityLanName + ';  ';
		}

	}

	data.forEach(function (item) {
		rb_id.push(item.rbrbId);
	})

	let div = `
    <div class="layui-colla-item">
        <h2 class="layui-colla-title">${data[0].operationLanName}</h2>
        <div class="layui-colla-content layui-show"  >   
            <table  class="tab" style="">
                <thead>
                    <tr>
                        <td width="80%" colspan="5" id="nengLi">${nengLi}</td>
					</tr>
				</thead>
				<thead id="${'pra' + i}"></thead>
				<thead>
					<tr>
						<th width="25%">做法（描述）</th>
                        <th width="20%">物料编码(SAP行项目号)</th>
                        <th width="20%">描述</th>
                        <th width="5%">数量</th>
                        <th width="30%">物料名称</th>
                        <!--<th width="25%">物料属性</th>-->
                    </tr>
                </thead>
					<tbody id="${i}">  
                    </tbody>
                    <thead>
                         <tr>
                            <td>图纸</td>
                            <td colspan="4" id="imgs-imgs">
								<div class="add-imgs" id ="${'add-imgs' + i}"  style="with:100%;border:1px dashed #bbb; margin:10px 0;">
							
								</div>
                                <div id="searchForm">
                                    <button type="button" class="g" data-id="${JSON.stringify(rb_id)}"  datas-id="${i}">获取图纸</button>
                                    <button type="button" class="ma_item_img_adds" data-ids="${JSON.stringify(rb_id)}" data-id="${data[0].rbrbId}"  datas-id="${i}">上传图纸</button>
                                </div>
                            </td>
                        </tr>
                    </thead>
                </table> 
        </div>
    </div>
	`;
	return div;
}



// 里层 
function getTable(data) {
	let table;
	let pra = '', tra = '';
	data.practice.forEach(function (item) {
		pra += item.mpflName + ',';
		tra += item.mpflDescription + ',';
	})
	if (data.type == 1) {
		table = `
		  <tr>
		  	<td>${pra}（${tra}）</td>
			<td>${data.item_no} ${data.POSNR == ' ' ? ' ' : '(' + data.POSNR + ')'} <i class="fa fa-hand-o-left"></i></td>
			<td><input style="border:1px solid #bbb;" datas-id="${data.POSNR}" class="mx" style="border:0;" type="text" data-id="${data.materialId}" data-ids="${data.rbrbId}"  value="${data.materialLanDesc == null ? data.materialDesc : data.materialLanDesc}"></td>
            <td>${data.useNum}${data.commercial}</td>			
			<td>${data.zma001}</td>
           <!-- <td>${data.identityValue}</td> -->
          </tr>
		`;
	} else if (data.type == 2) {
		table = `
		  <tr>
		  	<td>${pra}（${tra}）</td>
			<td>${data.item_no}  ${data.POSNR == "" ? '' : '(' + data.POSNR + ')'} <i class="fa fa-hand-o-right"></i></td>
			<td><input style="border:1px solid #bbb;" datas-id="${data.POSNR}" class="mx" type="text"  style="border:0;"  data-id="${data.materialId}"  data-ids="${data.rbrbId}"   value="${data.materialLanDesc == null ? data.materialDesc : data.materialLanDesc}"></td>			
           	<td>${data.useNum}${data.commercial}</td>	   
			 <td>${data.zma001}</td>
            <!--<td>${data.identityValue}</td>-->
          </tr>
        `;
	}

	return table;
}



//  点击 获取图片00
$('body').on('click', '.g', function () {
	upImg = [];
	let rb_i_d = $(this).attr('data-id');
	AjaxClient.get({
		url: URLS['translate'].gets + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rb_i_d,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		fail: function (res) {
			layer.close(layerLoading);
			let da_ta = [];
			if (res.results.length != 0) {
				res.results.forEach(function (item) {
					if (item.imageId != null) {
						da_ta.push(item);
					}
				});

				if (da_ta.length == 0) {
					layer.alert('没有中文图纸！');
				} else {
					upImgs(da_ta, $(this).attr('datas-id'), rb_i_d);
				}

			} else {
				layer.alert('没有中文图纸！');
			}

		}
	}, this)
})


//   关联 中文图纸
function upImgs(data, i, rb) {

	let r_b_id = [];
	let datas = '';
	for (let i = 0; i < data.length; i++) {
		r_b_id.push({
			rbrd_id: data[i].rbrdId,
			drawing_id: data[i].imageId,
			language_code: $('#lists').val(),
		});
	}
	AjaxClient.post({
		url: URLS['maintain'].img + "?" + _token + '&datas=' + JSON.stringify(r_b_id),
		dataType: 'json',
		success: function (rsp) {
			wImg(i, rb); //刷新图纸
		},
		fail: function (rsp) {
		}
	}, this);
}

// 获取外语图纸
function wImg(j, rb) {
	// let all = window.sessionStorage.getItem('rbid_all');
	$('#add-imgs' + j).html('');
	AjaxClient.get({
		url: '/Language/getLanImage' + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rb,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		fail: function (res) {
			layer.close(layerLoading);
			let data = res.results;
			for (let i = 0; i < data.length; i++) {

				if (data[i].imageId != null && data[i].imageId != 'null') {
					let img = getWimg(data[i], j, rb);
					$('#add-imgs' + j).append(img);
				}

			}

		}
	}, this)
}


function getWimg(data, j, all) {

	let img = `
		<div style="display:inline-block">
			<img class="imgs"  style=" height:80px; width:120px; margin:10px 10px;" data-id="${'/storage/' + data.image_path}"  src="${'/storage/' + data.image_path}">
		    <br>
      		<img  class="del-img" data-id="${data.imageId}" data-js="${all}"  datas-id="${j}" src="/statics/custom/img/del.png" style="cursor: pointer; width:30px;height:30px; margin-top:-28px;margin-left:55px;">
		</div>
		`;

	return img;
}


$('body').on('click', '.imgs', function () {

	let img = $(this).attr('data-id');


	layer.open({
		type: 1,
		title: false,
		closeBtn: 0,
		area: '1030px',
		skin: 'layui-layer-nobg', //没有背景色
		shadeClose: true,
		content: `<img src="${img}">`,
	});

})


// 上传图片 

$('body').on('click', '.up', function () {
	let rbid = $(this).attr('data-id');
	window.localStorage.setItem('lgCodes', $('#lists').val());

})

// 删除

$('body').on('click', '.del-img', function () {

	let id = $(this).attr('data-id');
	AjaxClient.get({
		url: '/Language/deleteImage' + "?" + _token + '&id=' + id,
		dataType: 'json',
		success: function (res) {
			layer.msg('删除图纸成功,请重新获取图纸进行查看！', { time: 3000, icon: 1 });
			wImg($(this).attr('datas-id'), $(this).attr('data-js'));
		},
		fail: function (res) {
			layer.msg('删除图纸失败！', { time: 3000, icon: 5 });
		}
	}, this)

})
