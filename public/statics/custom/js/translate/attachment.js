let getData = {
	code: '',
	name: '',
	creator_name: '',
	start_time: '',
	end_time: '',
	sale_order_code: '',
	line_project_code: '',
	material_code: '',
	order: 'desc',
	sort: 'ctime',
	page_no: 1,
	page_size: 100
};

// var spread = []; //跨页


let i = $('#i');
var sales_code = '';
var url = window.location.host;
document.getElementById('checkAll').checked = false;
$(function (){
	getCount();
	// layui  date  init
	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
			, layer = layui.layer
			, layedit = layui.layedit
			, laydate = layui.laydate;

		//date
		laydate.render({
			elem: '#date'
			, lang: 'en'
		});
		laydate.render({
			elem: '#date1'
			, lang: 'en'
		});
	})
});

$('body').on('click', '#i', () => {
	$('#none').slideToggle();
	if ($(i).hasClass('layui-icon-down')) {
		$(i).removeClass('layui-icon-down').addClass('layui-icon-up');
		$('#ser-content').addClass('act');
	} else {
		$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
		$('#ser-content').removeClass('act');
	}
})

// search
$('body').on('click', '#search', () => {

	getData = {
		code: $('#code').val(),
		name: $('#draw').val(),
		creator_name: $('#creator').val(),
		start_time: $('#date').val(),
		end_time: $('#date1').val(),
		sale_order_code: $('#material').val(),
		line_project_code: $('#sales').val(),
		material_code: $('#no').val(),
		order: 'desc',
		sort: 'ctime',
		page_no: 1,
		page_size: 100
	};
	sales_code = $('#material').val();
	$('#none').slideUp();
	$('#ser-content').removeClass('act');
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	getCount();
	
})

$('body').on('click', '#reset', function() {

	$('#none').slideUp();
	$('#ser-content').removeClass('act');


		$('#code').val('')
		$('#draw').val('')
		 $('#creator').val('')
		 $('#date').val('')
		$('#date1').val('')
		 $('#material').val('')
		 $('#sales').val('')
		$('#no').val('')
	$(i).removeClass('layui-icon-up').addClass('layui-icon-down');
	getData = {
		code: '',
		name: '',
		creator_name: '',
		start_time: '',
		end_time: '',
		sale_order_code: '',
		line_project_code: '',
		material_code: '',
		order: 'desc',
		sort: 'ctime',
		page_no: 1,
		page_size: 100
	};

	getCount();

})

//get count 
let getCount = ()=> {
	AjaxClient.get({
		url: '/CareLabel/careLabelPageIndexEN' + '?' + _token,
		data: getData,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			pages(rsp.paging.total_records, rsp.results);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this)
}

let pages = (count, data) => {
	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count //数据总数
			, limit: 100
			, theme: '#1E9FFF'
			, prev: 'previous page'
			, next: 'next page'
			, jump: function (obj) {
				document.getElementById('checkAll').checked = false;
				if(obj.curr == 1) {
					$('#tbody').html('');
					data.forEach(item => {
						tr = getTr(item);
						$('#tbody').append(tr);
					})
				}else {
					getData.page_no = obj.curr;
					getData.page_size = 100;
					getDataList();
				}
			}
		});

	})
}

let getDataList = () => {
	$('#tbody').html('');
	AjaxClient.get({
		url: '/CareLabel/careLabelPageIndexEN' + '?' + _token,
		data: getData,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let data = rsp.results;
			data.forEach( item => {
				tr = getTr(item);
				$('#tbody').append(tr);
			});
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this)
}

let getTr = (item)=> {
	var imgExtension = ["png", 'jpg', 'jpeg', 'gif'];
	var extension = item.extension;
	var imgSrc = item.image_path;
	extension = extension.toLowerCase();
	if ($.inArray(extension, imgExtension) == -1) {
		imgSrc = showImg(extension);
	} else {
		imgSrc = imgSrc == '' ? '/statics/custom/img/logo_default.png' :  imgSrc;
	}
	let tr = `
		<tr>
			<td><input type="checkbox"   class="check" data-id="${item.drawing_id}" lay-skin="primary" style="position: relative; top:5px;"></td>
            <td><img src="${imgSrc}" data-id="${item.image_path}" class="img"></td>
            <td>${tansferNull(item.sale_order_code)}/${tansferNull(item.line_project_code)}</td>
			<td>${tansferNull(item.name)}</td>
			<td>${tansferNull(item.MAKTX)}</td>
            <td>${tansferNull(item.version)}</td>
            <td>${tansferNull(item.creator_name)}</td>
            <td>${tansferNull(item.ctime)}</td>
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

// click see file

$('body').on('click', '.img', function() {

	let src = $(this).attr('data-id');
	window.open ( 'http://'+ url +'/storage/' + src );
})

$('body').on('click', '#checkAll', function () {
	all_checked = $('#tbody input');
	if (document.getElementById('checkAll').checked == true) {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = true;
		
		}
	} else {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = false;
		}
	}

})

// down load

$('body').on('click', '#download', function() {
	let tr = $('#tbody input');
	let inp_arr = [];
	for(let i=0; i<tr.length; i++) {
		if($(tr[i]).prop('checked')) {
			if (inp_arr.indexOf($(tr[i]).attr('data-id')) == -1) {
				inp_arr.push($(tr[i]).attr('data-id'));
			}
		}
	};


	if(inp_arr.length != 0) {
		let str = '';
		inp_arr.forEach((item, index) => {
			if(index == 0) {
				str = item;
			}else {
				str = str + ',' + item;
			}
		})

		$('#a').attr('href', '/CareLabel/getImagesUrl?_token=8b5491b17a70e24107c89f37b1036078&language=EN&data=' + str + '&sell_code=' + sales_code);
	} else {
		layer.alert('Please check before downloading!');
	}

})

// $('body').on('change', '.check', function () {
	
// 	if($(this).prop('checked') && spread.indexOf($(this).attr('data-id')) == -1) {
// 		spread.push($(this).attr('data-id'));
// 	} else if ($(this).prop('checked') == false) {
// 		let idx = spread.indexOf($(this).attr('data-id'));
// 		spread.splice(idx, 1);
// 	}
// })