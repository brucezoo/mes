let getData = {
	languageCode: 'EN',
	code: '',
	name: '',
	child_code: '',
	item_material_id: '',
	replace_material_id: '',
	condition: '',
	bom_group_id: '',
	creator_name: '',
	order: 'asc',
	sort: 'code',
	begin_time: '',
	end_time: '',
	page_no: 1,
	page_size: 20
};
let state = '';
let bomFrom = '';

// search
$('body').on('click', '#search', () => {
	
	layerModal = layer.open({
		type: 1,
		title: false,
		closeBtn: 0,
		shadeClose: true,
		skin: 'yourclass',
		anim: 1,
		area: '1000px',
		content: `
			<div id="tab">
				<div>
					<p>Bill Of Material <input id="material" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Bill of materials grouping 
						<select id="grouping" name="interest" lay-filter="aihao" style="width:180px;height:38px;">
							<option value=""></option>
						</select>
					</p>
					<p>Subset material coding <input id="coding" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Alternative material item <input id="item" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Maintained working hours 
						<select name="interest" id="hours" lay-filter="aihao" style="width:180px;height:38px;">
							<option value=""></option>
						</select>
					</p>
					<p>Start Time <input id="start" type="text" name="date" id="date" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input"></p>
				</div>
				<div>
					<p>List of materials <input id="list" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Founder <input id="founder" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Material items <input id="items" type="text" name="title" lay-verify="title" autocomplete="off"  class="layui-input"></p>
					<p>Process 
						<select name="interest" id="process " lay-filter="aihao" style="width:180px;height:38px;">
							<option value=""></option>
						</select>
					</p>
					<p>Whether the BOM is displayed 
						<select name="interest" id="bom" lay-filter="aihao" style="width:180px;height:38px;">
							<option value=""></option>
						</select>
					</p>
					<p>End Time<input type="text" id="end" name="date" id="date1" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input"></p>
				 	<button style="font-size:20px; margin-top:20px; float:right; margin-right:15px;" type="button" class="layui-btn layui-btn-normal" id="ok">To Search</button>
				</div>				
			</div>
		`
	});

	// layui  date  init
	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
			, layer = layui.layer
			, layedit = layui.layedit
			, laydate = layui.laydate;

		//date
		laydate.render({
			elem: '#date'
		});
		laydate.render({
			elem: '#date1'
		});
	})
})


//  to  search

$('body').on('click', '#ok', ()=> {
	layer.close(layerModal);
	getData.code = $('#material').val();
	counts();
})

 
counts();
function counts() {

	AjaxClient.get({
		url: '/Language/pageIndex' + '?' + _token,
		data: getData,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			//    console.log(rsp);
			layer.close(layerLoading);
			   pages(rsp.paging.total_records);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			//    console.log(rsp);	
		}
	}, this)
}

function pages(count) {

	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count //数据总数
			, limit: 20
			, theme: '#1E9FFF'
			, jump: function (obj) {
				getData.page_no = obj.curr;
				getData.page_size = 20;
				getDataList();
			}
		});

	})
}

// get  view  list
let getDataList = () => {

	AjaxClient.get({
		url: '/Language/pageIndex' + "?" + _token ,
		dataType: 'json',
		data:getData,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (res) {
			$('#tbody').html('');
			layer.close(layerLoading);
			let data = res.results;
			data.forEach((item)=> {
				let tr  =  getTr(item);
				$('#tbody').append(tr);
			});
		},
		fail: function ( res) {
			console.log(res);
		}
	}, this)
}

let getTr = (item)=> {
	
	if (item.release_version != '') {
		state = 'The published';
	}else {
		state = 'Not release';
	} 

	if (item.from == 1) {
		bomFrom = 'MES';
	} else if (item.from == 2) {
		bomFrom = 'ERP';
	} else if (item.from == 3) {
		bomFrom = 'SAP';
	}

	let tr = `
		<tr>
			<td>${item.code}</td>
            <td>${item.ZMA001}</td>
            <td>${item.bom_no}</td>
            <td>${item.qty}(${item.commercial})</td>
            <td>${tansferNull(item.bom_group_name)}</td>
            <td style="min-width: 55px;color:green !important;">${state}</td>
            <td style="min-width: 70px;color:green !important;">${item.release_version != '' ? item.release_version + '.0' : ''}</td>
            <td>${tansferNull(item.big_material_type_name)}</td>
            <td>${tansferNull(item.material_type_name)}</td>
            <td>${bomFrom}</td>
            <td>${tansferNull(item.creator_name)}</td>
            <td>${item.ctime}</td>
			<td>
				<button type="button" id = "btn" data-id="${item.release_version_bom_id}" data-ids="${item.routing_id}" class="layui-btn layui-btn-normal layui-btn-sm">The repair order file</button>
			</td>
		</tr>
	
	`;

	return tr;
}


//  Operation

$('body').on('click', '#btn', function() {
	let bom_id  = $(this).attr('data-id');
	var rotue = $(this).attr('data-ids');
	console.log();
	if ($(this).attr('data-ids') != '') {
		location.href = "/Translate/show?bomId=" + bom_id + '&routingId=' + rotue + '&lgCode=' + 'EN';
	} else {
		layer.msg('No process route！', { time: 3000, icon: 5, offset: 't', });
	}
	
})