layui.use(['form', 'layedit', 'laydate'], function () {
    var form = layui.form
        , layer = layui.layer
        , layedit = layui.layedit
        , laydate = layui.laydate;
    //日期
    laydate.render({
        elem: '#date'
    });
});


// 装箱
function event () {
// $('#btn-tp').bind('click' ,function() {

    if($('#gh').val() == "" || $('#date').val() == "" || $('#name').val() == "") {
        layer.msg('请先完善信息再添加！', { time: 3000, icon: 5 });
    } else {
            var string = allDel[0];
                for (let i = 1; i < allDel.length; i++) {
                    string = string + ',' + allDel[i];
                }
                // console.log(string, allDel);
                var data = {
                    ContainerCode: $('#gh').val(),
                    Date: $('#date').val(),
                    Operator: $('#name').val(),
                    data: string,
                    _token: TOKEN
                }
                // console.log(data);
                AjaxClient.post({
                    url: URLS['cabinet'].ins,
                    dataType: 'json',
                    data: data,
                    success: function (rsp) {
                        // console.log(rsp);
                        layer.msg('装柜成功！', { time: 3000, icon: 1 });
                        // getData();
                        location.reload();
                    },
                    fail: function (rsp) {
                        // console.log(rsp);
                        layer.msg('装柜失败！', { time: 3000, icon: 5 });
                    }
                }, this);
    }
}
getData();
function getData() {
    var tr ;

    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['cab'].getAll + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            console.log(rsp);
            for (let i = 0; i < data.length; i++) {
                var tr = getTr(data[i]);
                $('#tbody').append(tr);
            }
            allChoice($('tbody input'), data);
        }
    }, this); 
}
var allDel = [];
function allChoice(check, data) {
    document.getElementById('all-choice').checked = false;

    $('#all-choice').bind('click', function () {
        // 不选
        if (document.getElementById('all-choice').checked != true) {
            for (let i = 0; i < check.length; i++) {
                check[i].checked = false;
            }
        } else {
            // 全选 
            for (let i = 0; i < check.length; i++) {
                check[i].checked = true;
            }
        }
    })

    // 装柜
    $('#btn-tp').bind('click', function () {
        allDel = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                    allDel.push(data[i].ID);
            }
        }
        event();
    })
}


function getTr(data) {
    var tr = `
    <tr>
        <td><input type="checkbox" id="data" value="${data.ID}"></td>
        <td>${data.TaryCode}</td>
        <td>${data.SalesOrder}</td>
        <td>${data.SalesOrderItem}</td>
        <td>${data.MaterialCode}</td>
        <td>${data.inNumber}</td>
        <td>${data.Unit}</td>
        <td>${data.Remark}</td>
    </tr>
    `
    return tr;
}
