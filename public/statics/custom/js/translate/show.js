// 获取浏览器地址
var url = window.location.href;
var urls = url.substring(url.lastIndexOf('?') + 1);
var arr = urls.split("&");
var bomId = arr[0].split('=')[1];
var routingId = arr[1].split('=')[1];
var lgCode = arr[2].split('=')[1];
var rbid = '', rbids='';
document.getElementById('double').checked = false;


// 点击 翻译
$('#translates').on('click', function () {
    lgCode = $('#list').val();
    getDatas();
    getData();
})

// 获取 国家 数据
getTranslates()
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
                    $('#list').append(option);
                }

                if (datas[i].code == lgCode) {
                    $('#one').text(datas[i].name);
                    $('#one').val(datas[i].code);
                }
            }
        }
    }, this)
}


    $('#double').on('change', function () {
        if (document.getElementById('double').checked == true) {
            $('.tab1').css('display','none');
            $('.tab2').css('display', 'block');
            getData();
        } else {
            $('.tab2').css('display', 'none');
            $('.tab1').css('display', 'block');
            getDatas();
        }
    })  



/**
 * 
 * 未选
 */

getDatas();
function getDatas() {
	let rb_id = [];
    $('#con').html('');
    AjaxClient.get({
        url: URLS['maintain'].get + "?" + _token + '&languageCode=' + lgCode + '&bom_id=' + bomId + '&routing_id=' + routingId,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        success: function (res) {
            layer.close(layerLoading);
			let data = res.results;
			let arr_gy = [];
			let arr_lan = [];
			let gy = '', lan = '';

            for(let i=0; i<data.length; i++) {
				rb_id = [];
				arr_gy = [];
				arr_lan = [];
				lan = '';
                // 外层 - 工序
                let div = getDiv(data[i],i);
                $('#con').append(div);
                // for(let j=0; j<data[i].length; j++) {
                //     let table = getTable(data[i][j]);
				// 	$('#'+i).append(table);
				// 	
				// }

				for (let j = 0; j < data[i].length; j++) {
					rb_id.push(data[i][j].rbrbId);
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
                            	<td>Special process</td>
								<td colspan="5" style="word-break:break-all;">
									${lan}
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
                            	<td>Special process</td>
								<td colspan="5" style="word-break:break-all;">
									${lan}
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


					arr_gy.forEach(function (item,index) {
						if (item != 'null' && item != '' && item != null) {
							if(index == 0) {
								gy = item;
							}else {
								gy += item + ' ，';
							}
							
						}

					});

					arr_lan.forEach(function (item,index) {
						if (item != 'null' && item != '' && item != null) {
							if(index == 0) {
								lan = item;
							}else {
								lan += item + ' ，';
							}
						}

					})
				}

				img(i, rb_id);
			}
			
			
            

            layui.use('element', function () {
                var element = layui.element;
                element.init();
            });
           
        }
    }, this)

}

// 外层 - 工序
function getDiv(data,i) {
    let nengLi = '', gongYi = '';
	let index = '' , indexs = '';

	let arr_lan = [];
	let lan = '';

    for(let j=0; j<data.length; j++) {
        if (data[j].abilityLanName != null) {
            index = j + 1;
            nengLi = nengLi + index + '.' + data[j].abilityLanName + ';  ';
        }
       
	}

	data.forEach(function (item) {
		arr_lan.push(item.specialDesc);
	})

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

	arr_lan.forEach(function (item,index) {
		if (item != 'null' && item != '' && item != null) {
			if (index == 0) {
				lan = item;
			} else {
				lan += item + ' ，';
			}
		}

	})

    let div = `
    <div class="layui-colla-item">
        <h2 class="layui-colla-title">${data[0].operationLanName}</h2>
        <div class="layui-colla-content layui-show"  >   
            <table  class="tab" style="">
                    <thead>
                    <tr>
                        <td width="80%" colspan="6" id="nengLi">${nengLi}</td>
                    </tr>
                    <tr>
                        <th width="20%">Practice (Description)</th>
                        <th width="15%">Material code (Project number of SAP bank)</th>
                        <th width="15%">Describe</th>
                        <th width="5%">Number</th>
                        <th width="25%">Name of material</th>
                        <th width="25%">Material properties</th>
                    </tr>
                    </thead>
                    <tbody id="${i}">
                    </tbody>
                    <thead>
                         <tr>
                            <td>Drawings</td>
                            <td colspan="5" id="${'imgs-imgs' + i}">
                                
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
    if(data.type == 1) {
        table =  `
		  <tr>
		  	<td>${pra}（${tra}）</td>
			<td>${data.item_no} ${data.POSNR == '' ? ' ' : '(' + data.POSNR + ')'}<i class="fa fa-hand-o-left"></i></td>
			<td>${data.materialLanDesc == null ? data.materialDesc : data.materialLanDesc}</td>
			<td>${data.useNum}${data.commercial}</td>		
            <td>${data.zma001}</td>
            <td>${data.identityValue}</td>
          </tr>
        `; 
    }else if(data.type == 2) {
        table = `
		  <tr>
		  	<td>${pra}（${tra}）</td>
			<td>${data.item_no} ${data.POSNR == '' ? ' ' : '(' + data.POSNR + ')'}<i class="fa fa-hand-o-right"></i></td>
			<td>${data.materialLanDesc == null ? data.materialDesc : data.materialLanDesc}</td>		
			<td>${data.useNum}${data.commercial}</td>			
            <td>${data.zma001}</td>
            <td>${data.identityValue}</td>
          </tr>
        `; 
    }

    return table;
}

// 图纸
function img(j, rbid) {
    AjaxClient.get({
		url: '/Language/getLanImage' + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rbid ,
        dataType: 'json',
        fail: function (res) {
            let data  = res.results;
            if(data.length != 0) {
                for(let i=0; i<data.length; i++) {
					if (data[i].imageId != null && data[i].imageId != 'null') {
						let img = getImg(data[i]);
                    	$('#imgs-imgs' + j).append(img);
					} 
                }
            }
            
        }
    }, this)
}

function getImg(data) {

	let height = 0;
	let width = 0;
	let t = 0;
	if(data.width <= 450) {
		height = data.height;
		width = data.width;
	}else {
		t =  data.width/450;
		width = 450;
		height = data.height/t;
	}
    let img = `
      <img class="imgs"  style="width:${width + 'px'};height:${height + 'px'}; margin:10px 10px;" data-id="${'/storage/' + data.image_path}" src="${'/storage/' + data.image_path}">  
    `;

    return img;
}

$('body').on('click', '.imgs', function(){

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
 

/**
 * 
 * 已选
 */


getData();
function getData() {
    $('#cons').html('');
    AjaxClient.get({
        url: URLS['maintain'].get + "?" + _token + '&languageCode=' + lgCode + '&bom_id=' + bomId + '&routing_id=' + routingId,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        success: function (res) {
			let rb_id = [];
			let arr_gy = [];
			let arr_lan = [];
			let gy = '', lan = '';
            layer.close(layerLoading);
            let data = res.results;

            for (let i = 0; i < data.length; i++) {
				rb_id = [];
				arr_gy = [];
				arr_lan = [];
				gy = '';
				lan = '';
                // 外层 - 工序
                let div = getDivs(data[i], i);
                $('#cons').append(div);
                // for (let j = 0; j < data[i].length; j++) {
                //     let table = getTables(data[i][j]);
				// 	$('.' + i).append(table);
				// 	rb_id.push(data[i][j].rbrbId);
				// }

				for (let j = 0; j < data[i].length; j++) {
					rb_id.push(data[i][j].rbrbId);
					if (j == 0) {

						let table = getTables(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						
						$('#en' + i).append(table);

					} else if (data[i][j].rbrbId == data[i][j - 1].rbrbId) {

						let table = getTables(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						$('#en' + i).append(table);

					} else if (data[i][j].rbrbId != data[i][j - 1].rbrbId) {
						public();

						$('#en' + i).append(`
						<tr style="color:#333; font-weight:600; font-size:13px;">
                            	<td>Special process（特殊工艺）</td>
								<td colspan="5" style="word-break:break-all;">
									${lan}(${gy})
								</td>
							</tr>
						`);

						arr_gy = [];
						arr_lan = [];
						gy = '';
						lan = '';

						let table = getTables(data[i][j]);
						if (data[i][j].comment != null) {
							arr_gy.push(data[i][j].comment);
						}
						if (data[i][j].specialDesc != null) {
							arr_lan.push(data[i][j].specialDesc);
						}
						$('#en' + i).append(table);


					}


					if (j == data[i].length - 1) {

						public();
						$('#en' + i).append(`

							<tr style="color:#333; font-weight:600; font-size:13px;">
                            	<td>Special process（特殊工艺）</td>
								<td colspan="5" style="word-break:break-all;">
									${lan}(${gy})
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


					arr_gy.forEach(function (item,index) {
						if (item != 'null' && item != '' && item != null) {
							if (index == 0) {
								gy = item;
							} else {
								gy += item + ' ，';
							}
						}

					});

					arr_lan.forEach(function (item,index) {
						if (item != 'null' && item != '' && item != null) {
							if (index == 0) {
								lan = item;
							} else {
								lan += item + ' ，';
							}
						}

					})
				}



				imgs(i, rb_id);
            }
            

            layui.use('element', function () {
                var element = layui.element;
                element.init();
            });

        }
    }, this)

}

// 外层 - 工序
function getDivs(data, i) {
    let nengLi = '', gongYi = '', nengLis = '';
	let index = '', indexs = '';

	let arr_gy = [];
	let arr_lan = [];
	let gy = '', lan = '';

    for (let j = 0; j < data.length; j++) {
        if (data[j].abilityLanName != null) {
            index = j + 1;
            nengLi = nengLi + index + '.' + data[j].abilityLanName + ';  ';
        }
        if (data[j].abilityName != null) {
            index = j + 1;
            nengLis = nengLi + index + '.' + data[j].abilityName + ';  ';
        }

    }

	data.forEach(function (item) {
		arr_gy.push(item.comment);
		arr_lan.push(item.specialDesc);
	})

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


	arr_gy.forEach(function (item,index) {
		if (item != 'null' && item != '' && item != null) {
			if (index == 0) {
				gy = item;
			} else {
				gy += item + ' ，';
			}
		}

	});

	arr_lan.forEach(function (item,index) {
		if (item != 'null' && item != '' && item != null) {
			if (index == 0) {
				lan = item;
			} else {
				lan += item + ' ，';
			}
		}

	})

    let div = `
    <div class="layui-colla-item">
        <h2 class="layui-colla-title">${data[0].operationLanName}(${data[0].operationName})</h2>
        <div class="layui-colla-content layui-show"  >   
            <table  class="tab" style="">
                    <thead>
                    <tr>
                        <td width="80%" colspan="6" id="nengLis">${nengLi}(${nengLis})</td>
                    </tr>
                    <tr>
                        <th width="20%">Practice (Description)（做法（描述））</th>
                        <th width="15%">Material code (Project number of SAP bank)（物料编码(SAP行项目号)）</th>
                        <th width="15%">Describe（描述）</th>
                        <th width="5%">Number（数量）</th>
                        <th width="25%">Name of the material（物料名称）</th>
                        <th width="25%">Material properties（物料属性）</th>
                    </tr>
                    </thead>
                    <tbody id="${'en'+i}">
                    </tbody>
                    <thead>
                         <tr>
                            <td>Drawings（图纸）</td>
                            <td colspan="5" id="${'img-img' + i}">
                                
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
function getTables(data) {
	let table;
	let pra = '', tra = '', zpra= '', ztra='';
	data.practice.forEach(function (item) {
		pra += item.mpflName + ',';
		tra += item.mpflDescription + ',';
		zpra += item.rpfName + ',';
		ztra += item.rpfDescription + ',';
	})
    if (data.type == 1) {
        table = `
		  <tr>
		  	<td>${pra}（${tra}）-/- ${zpra}（${ztra}）</td>
			<td>${data.item_no} ${data.POSNR == '' ? ' ' : '(' + data.POSNR + ')'}<i class="fa fa-hand-o-left"></i></td>
			<td>${data.materialLanDesc}(${data.materialDesc})</td>
			<td>${data.useNum}${data.commercial}</td>		
            <td>${data.zma001}(${data.materialName})</td>
            <td>${data.identityValue}(${data.identity_card_string})</td>
          </tr>
        `;
    } else if (data.type == 2) {
        table = `
		  <tr>
		  	<td>${pra}（${tra}）</td>
			<td>${data.item_no} ${data.POSNR == '' ? ' ' : '(' + data.POSNR + ')'}<i class="fa fa-hand-o-right"></i></td>
			<td>${data.materialLanDesc}(${data.materialDesc})</td>
			<td>${data.useNum}${data.commercial}</td>					
            <td>${data.zma001}(${data.materialName})</td>
            <td>${data.identityValue}(${data.identity_card_string})</td>
          </tr>
        `;
    }

    return table;
}

// 图纸
function imgs(j, rbid) {
	
	AjaxClient.get({
		url: '/Language/getLanImage' + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rbid,
		dataType: 'json',
		fail: function (res) {
			let data = res.results;
			if (data.length != 0) {
				for (let i = 0; i < data.length; i++) {
					if (data[i].imageId != null && data[i].imageId != 'null') {
						let img = getImgs(data[i]);
						$('#img-img' + j).append(img);
					}	
				}
			}

		}
	}, this)

    AjaxClient.get({
        url: URLS['translate'].gets + "?" + _token + '&languageCode=' + lgCode + '&rbrb_id=' + rbid,
        dataType: 'json',
        fail: function (res) {
			let data = res.results;
            if(data.length !=  0) {
                for (let i = 0; i < data.length; i++) {
					if (data[i].imageId != null && data[i].imageId != 'null') {
						let img = getImgs(data[i]);
                    	$('#img-img' + j).append(img);
					}
                    
                } 
            }
            
        }
    }, this)
}

function getImgs(data) {
	let height = 0;
	let width = 0;
	let t = 0;
	if (data.width <= 450) {
		height = data.height;
		width = data.width;
	} else {
		t = data.width / 450;
		width = 450;
		height = data.height / t;
	}
    let img = `
      <img class="i-img"  style="width:${width + 'px'};height:${height + 'px'}; margin:10px 10px;" data-id="${'/storage/' + data.image_path}" src="${'/storage/' + data.image_path}">  
    `;

    return img;
}

$('body').on('click', '.i-img', function () {

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

// 树形组件

AjaxClient.get({
	url: "/Language/show?" + _token + '&bom_id=' + bomId,
	dataType: 'json',
	success: function (res) {
		let data = res.results.bom_tree;

		$('#browser').append(`
			<li><span class="">${data.ZMA001}</span><ul id="ul"></ul></li>
		`);

		if (data.children.length != 0) {
			data.children.forEach((item,index)=> {
				let li = getLi(item,index);
				$('#ul').append(li);
			})
		}
		

		$("#browser").treeview({
			toggle: function () {
				console.log("%s was toggled.", $(this).find(">span").text());
			}
		});
		
	},
	fail: function (res) {
	}
}, this)


let getLi = (item,i)=> {

	if(item.children.length != 0) {
		var li = `
			<li><span class="">${item.ZMA001}</span><ul id="${i}"></ul></li>
		`;

		item.children.forEach((items,index) => {
			let li = getLi(items,index);
			$('#'+i).append(li);
		})
	}else {
		var li = `
			<li><span class="">${item.ZMA001}</span></li>
		`;
	}
	
	return li 
}



