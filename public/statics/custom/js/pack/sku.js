// 导入表
layui.use('upload', function () {
    var $ = layui.jquery
        , upload = layui.upload;

    upload.render({
        elem: '#test8'
        , url: '/OfflinePackage/importMaterialSku'
        , auto: false
        , data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
        //,multiple: true
        , accept: 'file'
        , bindAction: '#test9'
        , beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        }
        , done: function (rsp) {
            layer.close(layerLoading);
            if (rsp.code == 804) {
                layer.alert('有重复,请确认再重新上传!');
            } else if (rsp.code == 200) {
                layer.msg('上传成功！', { time: 3000, icon: 1 });
                location.reload();
            }else if(rsp.code == 202) {
				layer.alert('以3开头的销售订单号必须维护客户PO！');
			}

        }
        , error: function () {
            layer.msg('上传失败！', { time: 3000, icon: 5 });
        }
    });

});

var date = {
    page_no : '1',
    page_size : '20',
    salesOrder:'',
    salesOrderItem:'',
    sku:'',
    material:'',
};
event();
function event() {
    
    new Promise(function (resolve, reject) {
        resolve(); 
    }).then(function () {
        AjaxClient.get({
                url: URLS['sku'].getSku + "?" + _token,
                dataType: 'json',
                data: date,
                fail: function (rsp) {
                    var count = rsp.total_records; 
                    fy(count); 
                }
        }, this);
    })    
}

function fy(count) {
    layui.use(['laypage', 'layer'], function () {
        var laypage = layui.laypage
            , layer = layui.layer;
        laypage.render({
            elem: 'demo1'
            , count: count //数据总数
			, limit : 20
			, layout: ['page', 'count']
            , jump: function (obj) {
                date = {
                    page_no: obj.curr,
                    page_size: '20',
                    salesOrder: $('#orders').val(),
                    salesOrderItem: $('#items').val(),
                    sku: $('#skus').val(),
                    material: $('#codes').val(),
                };
                getListData();   
            }
        });

    })
}
    

// 获取数据

function getListData() {
    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['sku'].getSku + "?" + _token,
        dataType: 'json',
        data: date,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var datas = rsp.results;
            for(let i=0; i<datas.length; i++) {
                let tr  = `<tr>
                    <td id="sorder">${datas[i].salesOrder}</td>
                    <td id="sitem">${datas[i].salesOrderItem}</td>
                    <td id="code">${datas[i].material}</td>
                    <td id="sku">${datas[i].sku}</td>
                    <td id="number">${datas[i].number}</td>
                    <td id="p_o">${tansferNull(datas[i].CustomerPo)}</td>
                    <td id="po_hx">${tansferNull(datas[i].CustomerPoItem)}</td>
                    <td>
                        <button type="button" data-id ="${datas[i].id}" id="bj" class="layui-btn layui-btn-primary layui-btn-xs">修改</button>
                        <button type="button" data-id ="${datas[i].id}" id="del" style="color:#FF5722;"  class="layui-btn layui-btn-primary layui-btn-xs ">删除</button>
                    </td>
                </tr>`;
                $('#tbody').append(tr);
            }
        }

    }, this);
        
}


// 添加
$('#add').on('click', function() {

    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['400px', '530px'], //宽高
        content: `
            <div>
                 <label style="margin-left:20px;">订单号:</label>
                <input type="text" name="title" id="wlorder" lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                 <label style="margin-left:20px;">行项目:</label>
                <input type="text" name="title" id="wlitem" lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                 <label style="margin-left:20px;">数量:</label>
                <input type="text" name="title" id="wlnum" lay-verify="title" autocomplete="off"  style="  margin-left:15px; width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                <label style="margin-left:20px;">物料号:</label>
                <input type="text" name="title" id="wlCode" lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                <label style="margin-left:20px;">SKU:</label>
				<input type="text" name="title" id="wlSku" lay-verify="title" autocomplete="off"  style="width:75%; margin-left:15px; margin-top:20px; display:inline-block;" class="layui-input">
				<label style="margin-left:15px;">客户PO:</label>
				<input type="text" name="title" id="po" lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display:inline-block;" class="layui-input">
				<label style="margin-left:15px;">PO行项:</label>
                <input type="text" name="title" id="pohx" lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display:inline-block;" class="layui-input">
            </div>
             <button type="button" id="ok" class="layui-btn layui-btn-sm layui-btn-normal" style="width:85%;margin:20px auto; display:block;" >确定</button>
        `
    })

    $('#ok').on('click', function() {

        let wlCode = $('#wlCode').val();
        let wlSku = $('#wlSku').val();
        let wlorder = $('#wlorder').val();
        let wlitem = $('#wlitem').val();
		let wlnum = $('#wlnum').val();
		let po = $('#po').val();
		let pohx = $('#pohx').val();
		let flag = '';

		flag = String(wlorder).substring(0, 1);

        if(wlCode == '' || wlSku == '') {
            layer.msg('请完善信息再提交！', { time: 3000, icon: 5 });
		} else if (flag == '3' && po == '') {
			layer.alert('订单号为3开头的必须填写：客户PO！');
		} else {
            let date = {
                material: wlCode,
                sku:wlSku,
                salesOrder: wlorder,
                salesOrderItem: wlitem,
				number: wlnum,
				CustomerPo: po,
				CustomerPoItem: pohx,
                _token: TOKEN
            }
			layer.close(layerModal);
            AjaxClient.post({
                url: URLS['sku'].add,
                dataType: 'json',
                data: date,
                success: function (rsp) {               
                        layer.msg('添加成功！', { time: 3000, icon: 1 });
                        event();
                },
                fail: function (rsp) {
                    if (rsp.code == 804) {
                        layer.msg('该物料已与sku关联！', { time: 3000, icon: 5 });
                    } else {
                        layer.msg('添加失败！', { time: 3000, icon: 5 });
                    }
                    
                }
            }, this);
        }
        
    })
})

// 删除
$('body').on('click','#del', function() {

    let del = $(this).parents('tr').find('#del');
    del.css('display','none');
    let id  = $(this).attr('data-id');

    AjaxClient.post({
        url: URLS['sku'].del + "?" + _token + '&id=' + id,
        dataType: 'json',
        success: function (rsp) {
            layer.msg('删除成功！', { time: 3000, icon: 1 }); 
            event();
        },
        fail: function (rsp) {
            layer.msg('删除失败！', { time: 3000, icon: 5 });
            del.css('display', 'block');
        }
    }, this);
   
})

// 修改
$('body').on('click', '#bj', function() {

    let code = $(this).parents('tr').find('#code').text();
    let sku = $(this).parents('tr').find('#sku').text();
    let order = $(this).parents('tr').find('#sorder').text();
    let item = $(this).parents('tr').find('#sitem').text();
	let number = $(this).parents('tr').find('#number').text();
	let khpo = $(this).parents('tr').find('#p_o').text();
	let po_hx = $(this).parents('tr').find('#po_hx').text();
    let id  = $(this).attr('data-id');
    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['400px', '530px'], //宽高
        content: `
            <div>
             <label style="margin-left:20px;">订单号:</label>
                <input type="text" name="title" id="bjorder"  value="${order}" lay-verify="title" autocomplete="off" readonly="readonly" style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                 <label style="margin-left:20px;">行项目:</label>
                <input type="text" name="title" id="bjitem" lay-verify="title" value="${item}" autocomplete="off"  readonly="readonly" style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                 <label style="margin-left:20px;">数量:</label>
                <input type="text" name="title" id="bjnum" lay-verify="title" value="${number}" autocomplete="off"  style="  margin-left:15px; width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                <label style="margin-left:20px;">物料号:</label>
                <input type="text" name="title" id="bjCode" value="${code}"  lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display: inline-block;" class="layui-input">
                <label style="margin-left:20px;">SKU:</label>
				<input type="text" name="title" id="bjSku" value="${sku}"  lay-verify="title" autocomplete="off"  style="width:75%; margin-left:15px; margin-top:20px; display:inline-block;" class="layui-input">
				<label style="margin-left:15px;">客户PO:</label>
				<input type="text" name="title" id="khpo" value="${khpo}"  lay-verify="title" autocomplete="off"  style="width:75%;  margin-top:20px; display:inline-block;" class="layui-input">
				<label style="margin-left:15px;">PO行项:</label>
                <input type="text" name="title" id="khpohx" value="${po_hx}"  lay-verify="title" autocomplete="off"  style="width:75%; margin-top:20px; display:inline-block;" class="layui-input">
            </div>
             <button type="button" id="bjOk" class="layui-btn layui-btn-sm layui-btn-normal" style="width:85%;margin:20px auto; display:block;" >确定</button>
        `
    })


    $('#bjOk').on('click', function() {

		let flags = String($('#bjorder').val()).substring(0, 1);
		if (flags == '3' && $('#khpo').val() == '') {
			layer.alert('以3开头的订单号,客户PO不能为空！');
		} else {
			AjaxClient.post({
				url: URLS['sku'].bj + "?" + _token + '&id=' + id + '&material=' + $('#bjCode').val() + '&sku=' + $('#bjSku').val() + '&number=' + $('#bjnum').val() + '&CustomerPo=' + $('#khpo').val() + '&CustomerPoItem=' + $('#khpohx').val(),
				dataType: 'json',
				success: function (rsp) {
					layer.close(layerModal);
					layer.msg('编辑成功！', { time: 3000, icon: 1 });
					event();
				},
				fail: function (rsp) {
					layer.msg('编辑失败！', { time: 3000, icon: 5 });
				}
			}, this);
		}
        
    })
})

// 搜索 js

$('#sear').on('click', function() {
    $("#block").toggle(500);
})

$('#find').on('click', function() {
    $('#block').hide(500);

    date = {
        page_no: '1',
        page_size: '20',
        salesOrder: $('#orders').val(),
        salesOrderItem: $('#items').val(),
        sku: $('#skus').val(),
        material: $('#codes').val(),
    };
    event();

})