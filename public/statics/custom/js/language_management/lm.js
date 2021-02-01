// layui 初始化
layui.use(['form', 'layedit', 'laydate'], function () {
    var form = layui.form
        , layer = layui.layer
        , layedit = layui.layedit
        , laydate = layui.laydate;
});

// 表单验证
$('#btn').on('click', function() {
    if($('#bianMa').val() == '') {
        layer.msg('编码未填写!');
    } else if($('#name').val() == '') {
        layer.msg('名称未填写!');
    } else {

        var data  = {
            code: $('#bianMa').val(),
            name: $('#name').val(),
            label: $('#biaoQian').val(),
            description: $('#describe').val(),
            _token: TOKEN
        }
        AjaxClient.post({
            url: URLS['lm'].add,
            dataType: 'json',
            data: data,
            success: function (rsp) {
                
                layer.msg('提交成功！', { time: 3000, icon: 1 });
                $('#bianMa').val('');
                $('#name').val('');
                $('#biaoQian').val('');
                $('#describe').val('');
                getCount();
            },
            fail: function (rsp) {

                if(rsp.code == '804') {
                    layer.msg('编码重复！', { time: 3000, icon: 5 });
                } else {
                    layer.msg('提交失败！', { time: 3000, icon: 5 });
                }
            }
        }, this);
    }
});

// 获取count
getCount();
function getCount() {
    AjaxClient.get({
        url: URLS['lm'].get + "?" + _token + '&page_no=1' + '&page_size=10' ,
        dataType: 'json',
        success: function (rsp) {
            var count = rsp.total_records;
            page(count);
        }
    }, this);
}



// 分页
function page(count) {
    layui.use(['laypage', 'layer'], function () {
        var laypage = layui.laypage
            , layer = layui.layer;
        laypage.render({
            elem: 'demo1'
			, count: count //数据总数
			, theme: '#1E9FFF'
            , limit: 10
            , jump: function (obj) {
                var data = {
                    page_no: obj.curr,
                    page_size :10,
                }
                getListData(data.page_no, data.page_size);
            }
        });
    });
}

// 获取数据列表
function getListData(no,size) {
    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['lm'].get + "?" + _token + '&page_no=' + no + '&page_size=' + size,
        dataType: 'json',
        beforeSend: function (rsp) {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            for(let i=0; i<data.length; i++) {
                let tr = getTr(data[i]);
                $('#tbody').append(tr);
            }
        }
    }, this);
}

// 获得tr
function getTr(data) {
    let tr = `
        <tr>
            <td id="code">${data.code}</td>
            <td id="name">${data.name}</td>
            <td id="label">${data.label}</td>
            <td id="description" style="display:none;">${data.description}</td>
            <td>
                <button type="button" class="layui-btn layui-btn-primary layui-btn-xs look"  >查看</button>
                <button type="button" class="layui-btn layui-btn-primary layui-btn-xs set" style="color:skyblue;" data-id="${data.id}" >编辑</button>
                <button type="button" class="layui-btn layui-btn-primary layui-btn-xs del" style="color:red;" data-id="${data.id}" >删除</button>
            </td>
        </tr>
    `;

    return tr;
}

// 删除 
$('body').on('click', '.del', function(e) {
    e.stopPropagation();
    let id = $(this).attr('data-id');
    AjaxClient.get({
        url: URLS['lm'].del + "?" + _token + '&id=' + id,
        dataType: 'json',
        success: function (rsp) {
            layer.msg('删除成功！', { time: 3000, icon: 1 });
            getCount();
        },
        fail: function (rsp) {
            layer.msg('删除失败！', { time: 3000, icon: 5 });
        }
    }, this);
})

// 查看
$('body').on('click', '.look', function (e) {
    e.stopPropagation();
    let code = $(this).parents('tr').find('#code').text();
    let name = $(this).parents('tr').find('#name').text();
    let label = $(this).parents('tr').find('#label').text();
    let description = $(this).parents('tr').find('#description').text();

    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['300px', '200px'], //宽高
        content: `
            <p style="text-align:center; margin-top:20px;">编码：${code}</p>
            <p style="text-align:center;">名称：${name}</p>
            <p style="text-align:center;">标签：${label}</p>
            <p style="text-align:center;">描述：${description}</p>
        `,
    });
})

// 编辑
$('body').on('click', '.set', function (e) {
    e.stopPropagation();
    let code = $(this).parents('tr').find('#code').text();
    let name = $(this).parents('tr').find('#name').text();
    let label = $(this).parents('tr').find('#label').text();
    let description = $(this).parents('tr').find('#description').text();
    let id = $(this).attr('data-id');
    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['400px', '330px'], //宽高
        content: `
            <p style="margin-left:20px; margin-top:10px;">编码：<input style="width:300px;" id="codes" type="text" value="${code}" /></p>
            <p style="margin-left:20px; margin-top:10px;">名称：<input style="width:300px;" id="names" type="text" value="${name}" /></p>
            <p style="margin-left:20px; margin-top:10px;">标签：<input style="width:300px;" id="labels" type="text" value="${label}" /></p>
            <p style="margin-left:20px; margin-top:10px;"><label  style="position:relative; top:-40px; ">描述：</label>
            <textarea id="describes"  style="margin-left:-3px; display:inline-block;width:300px;"  class="layui-textarea">${description}</textarea></p>
            <button type="button" id="btn-ok" style="color:skyblue; float:right;margin-right:25px;margin-top:5px; border-color:skyblue;" class="layui-btn layui-btn-primary layui-btn-xs">确定</button>
        `,
    });


    $('#btn-ok').on('click', function() {
        var data = {
            id: id,
            code: $('#codes').val(),
            name: $('#names').val(),
            label: $('#labels').val(),
            description: $('#describes').val(),
            _token: TOKEN
        }
        AjaxClient.post({
            url: URLS['lm'].set,
            dataType: 'json',
            data: data,
            success: function (rsp) {
                layer.close(layerModal);
                layer.msg('编辑成功！', { time: 3000, icon: 1 });
                getCount();
            },
            fail: function (rsp) {
                layer.msg('编辑失败！', { time: 3000, icon: 5 });
            }
        }, this);
    })
})