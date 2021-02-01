var i = $('#i');
var ajaxData = {
	code: '',
	name: '',
	creator_name: '',
	category_id: '',
	has_attribute: '',
	start_time: '',
	end_time: '',
	drawing_attributes: '',
	type_id: '',
	group_id: '',
	sale_order_code: '',
	line_project_code: '',
	material_code: '',
	order: 'desc',
	sort: 'ctime',
	country_id: '',
	page_no: 1,
	page_size: 20
};
var v = $('#tbody'), editurl = '';


// (function() {
document.getElementById('all').checked = false;
getCount();
imgType();
imgGroup();
// })();


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
		url: '/Image/waterCodeEnclosureList' + '?' + _token,
		dataType: 'json',
		data: ajaxData,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			getPage(rsp.paging.total_records, rsp.results);
			layer.close(layerLoading);

			if (rsp.results.length == 0) {
				$('#tbody').html(`<tr><td style="text-align:center;" colspan="8">暂无数据！</td></tr>`);
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
			url: '/Image/waterCodeEnclosureList' + '?' + _token,
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
	var editurl = $('#editurl').val();
	var imgExtension = ["png", 'jpg', 'jpeg', 'gif'];
	var extension = item.extension;
	var imgSrc = item.image_path;
	extension = extension.toLowerCase();
	if ($.inArray(extension, imgExtension) == -1) {
		imgSrc = showImg(extension);
	} else {
		imgSrc = imgSrc == '' ? '/statics/custom/img/logo_default.png' : window.storage + imgSrc;
	}

	let tr = `
		<tr>
				<td><input type="checkbox" class="check" data-id="${item.drawing_id}"></td>
                <td><img data-img="${item.image_path}"  class="img imgs" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="${imgSrc}" /></td>
			   	<td>${tansferNull(item.sale_order_code)}/${tansferNull(item.line_project_code)}</td>
				<td>${item.code}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.category_name)}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td> 
                <td class="right">
                <button data-id="${item.drawing_id}" data-src="${imgSrc}" data-attribute="${item.has_attribute}"  class="button pop-button view">查看</button>
				<a class="link_button" style="border: none;padding: 0;" href="/Out/editWaterCode?id=${item.drawing_id}"><button data-id="${item.drawing_id}" class="button pop-button edit">编辑</button></a>
				<button data-id="${item.drawing_id}"  class="button pop-button del">删除</button>
		</tr>
	`;
	return tr;
}

function showImg(extension) {
	var imagePath = '';
	// 把后缀全部变成小写
	extension = extension.toLowerCase();
	switch (extension) {
		case 'excel':
			imagePath = '/statics/custom/img/logo_excel.png';
			break;
		case 'pdf':
			imagePath = '/statics/custom/img/logo_pdf.png';
			break;
		case 'word':
			imagePath = '/statics/custom/img/logo_word.png';
			break;
		case 'cad':
			imagePath = '/statics/custom/img/logo_cad.png';
			break;
		case 'ai':
			imagePath = '/statics/custom/img/logo_ai.png';
			break;
		case 'zip':
			imagePath = '/statics/custom/img/logo_zip.png';
			break;
		case 'ps':
			imagePath = '/statics/custom/img/logo_ps.png';
			break;
		case 'war':
			imagePath = '/statics/custom/img/logo_war.png';
			break;
		case 'txt':
			imagePath = '/statics/custom/img/logo_txt.png';
			break;
		default:
			imagePath = '/statics/custom/img/logo_default.png';
			break;

	}
	return imagePath;
}

$('body').on('click', '.imgs', function () {
	window.open('/storage/' + $(this).attr('data-img'));
})

// 删除 
$('body').on('click', '.del', function() {

	let id = $(this).attr('data-id');

	AjaxClient.post({
		url: '/Image/delWaterCode' + "?" + _token + '&drawing_id=' + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			layer.alert('删除成功！');
			getCount();
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.alert('删除失败！');
		}
	});
})

// 搜索
$('body').on('click', '#search', function () {
	ajaxData = {
		code: $('#code').val(),
		name: $('#name').val(),
		creator_name: $('#person').val(),
		// category_id: '',
		// has_attribute: '',
		start_time: $('#date_bg_start').val(),
		end_time: $('#date_bg_end').val(),
		// drawing_attributes: '',
		// type_id: '',
		// group_id: '',
		sale_order_code: $('#order').val(),
		line_project_code: $('#item').val(),
		material_code: $('#wl_code').val(),
		order: 'desc',
		sort: 'ctime',
		// country_id: '',
		page_size: 20,
		page_no: 1,
	}

	$(v).html('');
	getCount();

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


// 重置
$('body').on('click', '#reset', function () {
	ajaxData = {
		code: '',
		name: '',
		creator_name: '',
		category_id: '',
		has_attribute: '',
		start_time: '',
		end_time: '',
		drawing_attributes: '',
		type_id: '',
		group_id: '',
		sale_order_code: '',
		line_project_code: '',
		material_code: '',
		order: 'desc',
		sort: 'ctime',
		country_id: '',
		page_no: 1,
		page_size: 20
	}

	$('#code').val(''),
		$('#name').val(''),
		$('#person').val(''),
		$('#date_bg_start').val(''),
		$('#date_bg_end').val(''),
		$('#order').val(''),
		$('#item').val(''),
		$('#wl_code').val(''),

		$(v).html('');
	getCount();
	$('#none').slideUp();
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	window.setTimeout(function () {
		$('#ser-content').removeClass('act');
	}, 400)
})

//批量下载
$('body').on('click', '#load', function () {
	let _arr = [];
	let item = $('#tbody input');

	for (let i = 0; i < item.length; i++) {
		if ($(item).prop('checked') == true) {
			_arr.push($(item).attr('data-id'));
		}
	}

	if (_arr.length == 0) {
		layer.alert('请先勾选再操作！');
	} else {

		let str = '';
		_arr.forEach((item, index) => {
			if (index == 0) {
				str = item;
			} else {
				str = str + ',' + str;
			}
		})
		window.location.href = '/CareLabel/getImagesUrl? _token = 8b5491b17a70e24107c89f37b1036078' + '&data=' + str + '&sell_code=' + $('#order').val();
	}

})

$('body').on('click', '#add', function() {
	window.location.href = "/Out/addWaterCode";
})


$('body').on('click', '.pop-button.view', function () {
	getImgInfo($(this).attr('data-id'));
});

//获取图纸详情
function getImgInfo(id) {
	AjaxClient.get({
		url: '/Image/show' + "?" + _token + "&drawing_id=" + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp && rsp.results) {
				Modal(rsp.results, 1);

				imgType(function () {
					var text = $('.el-form-item.type .el-select-dropdown-item[data-id=' + rsp.results.type_id + ']').addClass('selected').text();
					$('#type_id').val(rsp.results.type_id).siblings('.el-input').val(text);
					imgGroup(rsp.results.type_id, rsp.results.group_id);
				});

			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			console.log('获取图纸失败');
		}
	}, this);
}

//获取图纸分组数据
function imgGroup(cid) {
	$('#searchForm .el-form-item.group .el-select').find('.el-input').val('--请选择--');
	$('#searchForm .el-form-item.group .el-select').find('#group_id').val('');
	AjaxClient.get({
		url: '/ImageGroup/select' + "?" + _token + "&type_id=" + cid,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp && rsp.results && rsp.results.length) {
				imagesGroup = rsp.results;

				var lis = '<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>';
				rsp.results.forEach(function (item) {
					lis += `<li data-id="${item.imageGroup_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
				});
				$('.el-form-item.group .el-select-dropdown-list').html(lis);
				// if(id){
				//     $('.el-form-item.group .el-select-dropdown-item[data-id='+id+']').click();
				// }
			}
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			console.log('获取图纸分组列表失败');
		},
		complete: function () {
			$('#searchForm .submit').removeClass('is-disabled');
		}
	})
}

//获取图纸分类数据
function imgType(fn) {
	AjaxClient.get({
		url:'/ImageGroupType/selectAll' + "?" + _token,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			if (rsp && rsp.results && rsp.results.length) {
				imagesType = rsp.results;
				var lis = '';
				rsp.results.forEach(function (item) {
					lis += `<li data-id="${item.image_group_type_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
				});
				$('.el-form-item.type .el-select-dropdown-list').append(lis);
			}

			fn && typeof fn == 'function' ? fn() : null;
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			console.log('获取图纸分类列表失败');
		},
		complete: function () {
			$('#searchForm .submit').removeClass('is-disabled');
		}
	})
}

function Modal(data, flag) {
	transformStyle = {
		rotate: "rotate(0deg)",
		scale: "scale(1)",
	};
	var { image_orgin_name = '', code = '', name = '', category_name = '', group_name = '', comment = '', attributes = [] } = {};
	if (data) {
		({
			image_orgin_name = '',
			code = '',
			name = '',
			category_name = '',
			group_name = '',
			comment = '',
			attributes =[]
		} = data)
	}
	var attr_html = showAttrs(attributes);

	var img = new Image(),
		imgsrc = '',
		attribute = {},
		wwidth = $(window).width(),
		wheight = $(window).height() - 100;
	if (flag) {
		img.src = imgsrc = window.storage + data.image_path;
		if (data.attribute) {
			attribute = data.attribute;
		}
	} else {
		img.src = imgsrc = data;
	}
	var nwidth = img.width > wwidth ? (wwidth * 0.8) : (img.width),
		nheight = img.height + 170 > wheight ? (Number(wheight - 80)) : (img.height + 90);
	nwidth < 500 ? nwidth = 500 : null;
	nheight < 400 ? nheight = 400 : null;
	var mwidth = nwidth + 'px',
		mheight = nheight + 'px';
	layerModal = layer.open({
		type: 1,
		title: '图纸详细信息',
		offset: '100px',
		area: [mwidth, mheight],
		shade: 0.1,
		shadeClose: true,
		resize: false,
		move: false,
		content: `<div class="pic-wrap-container">
                    <div class="pic-wrap">
                        <div class="el-tap-wrap edit">
                            <span data-item="image_form" class="el-tap active">图纸</span>
                            <span data-item="basic_form" class="el-tap">属性信息</span> 
                        </div>  
                        <div class="el-panel-wrap" style="padding-top: 10px;">
                            <div class="el-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight - 130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
                                </div>
                            </div>
                            <div class="el-panel" id="basic_form">
                                <div class="imginfo">
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">编码:</label>
                                            <span>${code}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">名称:</label>
                                            <span>${name}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸来源:</label>
                                            <span>${tansferNull(category_name)}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸分组名称:</label>
                                            <span>${tansferNull(group_name)}</span>
                                        </div> 
                                    </div>
                                     <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸注释:</label>
                                            <span>${comment}</span>
                                        </div> 
                                    </div>
                                    ${attr_html}
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>`,
		success: function () {
			var imgObj = $('<img src="' + imgsrc + '" alt="" />');
			img.onload = function () {
				imgObj.css({
					"left": (nwidth - img.width) / 2,
					"top": (nheight - img.height - 130) / 2,
					'height': img.height + 'px',
				});
				imgObj.attr({ "data-scale": 1, "data-rotate": 0 });
				if (img.width > nwidth || img.height > (nheight - 130)) {
					var widthscale = nwidth / img.width,
						heightscale = nheight / img.height,
						scale = Math.max(Math.min(widthscale, heightscale), 0.1),
						imgHeight = img.height * scale;
					imgObj.attr("data-scale", scale.toFixed(2));
					transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
					imgObj.css({
						"-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
						"transform": transformStyle.rotate + " " + transformStyle.scale,
						"-moz-transform": transformStyle.rotate + " " + transformStyle.scale
					});
				}
			}
			imgObj.on({
				"mousedown": function (e) {
					e.preventDefault();
					e.stopPropagation();
					isMove = false;
					var mTop = e.clientY;
					var mLeft = e.clientX;
					var oTop = parseFloat($(this).css("top"));
					var oLeft = parseFloat($(this).css("left"));
					var disTop = mTop - oTop;
					var disLeft = mLeft - oLeft;
					var that = $(this);
					that.css({
						"cursor": "url(images/cur/closedhand.cur) 8 8, default"
					});
					$(document).on("mousemove", function (event) {
						isMove = true;
						var x = event.clientX;
						var y = event.clientY;
						var posX = x - disLeft;
						var posY = y - disTop;
						that.css({
							"top": posY + "px",
							"left": posX + "px"
						});
					});
				}
			});
			$(document).on("mouseup", function (e) {
				$(document).off("mousemove");
				$(document).off("mousedown");
				$(imgObj).css({
					"cursor": "url(images/cur/openhand.cur) 8 8, default"
				});
			});
			$('.pic-detail-wrap').append(imgObj);
			zoomPcIMG();
		},
		end: function () {
			$("body").css("overflow-y", "auto");
		}
	})
}

function showAttrs(data) {
	var _html = '';
	if (data.length) {
		data.forEach(function (item) {
			if (item.isModel == 1) {
				_html += `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">样板时间:</label>
                            <span>${item.mtime}</span>
                        </div> 
                    </div>`
			} else {
				_html += `<div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">${item.definition_name}:</label>
                        <span>${item.value}</span>
                    </div> 
                </div>`

			}

		})
	}
	return _html;
}

function zoomPcIMG() {
	$("body").css("overflow-y", "hidden");
	var imgele = $("#image_form .pic-detail-wrap").find('img');
	if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
		$("#image_form .pic-detail-wrap").on("DOMMouseScroll", function (e) {
			wheelZoom(e, imgele, true);
		});
	} else {
		$("#image_form .pic-detail-wrap").on("mousewheel", function (e) {
			wheelZoom(e, imgele);
		});
	}
}

function wheelZoom(e, obj, isFirefox) {
	var zoomDetail = e.originalEvent.wheelDelta;
	if (isFirefox) {
		zoomDetail = -e.originalEvent.detail;
	}
	zoomPic(zoomDetail, $(obj));
}

function zoomPic(zoomDetail, obj) {
	var scale = Number($(obj).attr("data-scale"));
	if (zoomDetail > 0) {
		scale = scale + 0.05;
	} else {
		scale = scale - 0.05;
	}
	if (scale > 2) {
		scale = 2;
	} else if (scale < 0.1) {
		scale = 0.1;
	}
	obj.attr("data-scale", scale.toFixed(2));
	transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
	obj.css({
		"-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
		"transform": transformStyle.rotate + " " + transformStyle.scale,
		"-moz-transform": transformStyle.rotate + " " + transformStyle.scale
	});
}

function showAttrs(data) {
	var _html = '';
	if (data.length) {
		data.forEach(function (item) {
			if (item.isModel == 1) {
				_html += `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">样板时间:</label>
                            <span>${item.mtime}</span>
                        </div> 
                    </div>`
			} else {
				_html += `<div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">${item.definition_name}:</label>
                        <span>${item.value}</span>
                    </div> 
                </div>`

			}

		})
	}
	return _html;
}

$('body').on('click', '.el-tap-wrap .el-tap', function () {
	var form = $(this).attr('data-item');
	if (!$(this).hasClass('active')) {
		$(this).addClass('active').siblings('.el-tap').removeClass('active');
		$('.pic-wrap #' + form).addClass('active').siblings('.el-panel').removeClass('active');
	}
});