//  layui 初始化
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

// 初始定义
var data = {
    RankPlanName: $('#bc').val(),
    ProductLine: $('#bz').val(),
    StartDate: $('#date').val(),
}


var dataList ;
var arr = [];


// 加载 带派工 列表
getData();
getMxData();

function getData() {

    $('#td').html('');
    AjaxClient.get({
        url: URLS['box'].list + '?' + _token,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            // console.log(rsp);
            for (let i = 0; i < data.length; i++) {
                var tr  = getTr(data[i]);
                $('#td').append(tr);
            }
        }
    }, this);
}

function getTr(data) {
    
    var tr  = `
        <tr>
            <td id="Order">${data.SalesOrder}</td>
            <td id="Item">${data.SalesOrderItem}</td>
            <td id="Code">${data.MaterialCode}</td>
            <td id="Name">${data.MaterialName}</td>
            <td id="Date">${data.StartDate}</td>
            <td id="Number">${data.OrderNumber}</td>
            <td id="Num">${data.waitNum}</td>
            <td><input type = "text"  value="${data.waitNum}" id="boxNum" style="width:100px;" /></td>
            <td><input type = "text"  style="width:80px;" id="boxPerson" value="${data.BoxOperator == null ? ' ' : data.BoxOperator}" /></td>
            <td>${data.Unit}</td>
            <td>${data.Remark}</td>
            <td><button type="button" class="layui-btn layui-btn-sm save" data-id="${data.ID}">装箱</button></td>
        </tr>
    `;

    return tr;
}

// 选择托盘
$('#btn-tp').on('click', function() {
    
    getOldTray();
    // 弹出层
    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['500px', '400px'], //宽高
        content: `

            <h3 style="text-align:center;line-height:40px;margin-top:20px;">已生成托盘</h3>
            <select name="bc" lay-verify=""  id="old-tray"  style="width:400px; margin-left:50px;">
                <option value="">--- 请选择 ---</option>
            </select>
            <button type="button" class="layui-btn layui-btn-sm" id="btn-old" style="width:400px; margin-left:50px;margin-top:10px;">确定选择已生成托盘</button>
            <h3 style="text-align:center;line-height:40px;margin-top:20px;">新增托盘</h3>
            <select name="bc" lay-verify=""  id="new-bz"  style="width:400px; margin-left:50px;margin-bottom:10px;">           
                                <option value="">--- 请选择班组 ---</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
            </select> 
            <select name="bc" lay-verify=""  id="new-bc"  style="width:400px; margin-left:50px;">           
                                <option value="">--- 请选择班次 ---</option>
                                <option value="A">白班</option>
                                <option value="B">夜班</option>
                                <option value="O">长白班</option>
            </select>
            <button type="button" class="layui-btn layui-btn-sm" id="btn-new" style="width:400px; margin-left:50px;margin-top:10px;">确定新增托盘</button>
            
        `,
    });


})


//获取已有托盘号
function getOldTray() {
    $('#old-tray').html('');
    AjaxClient.get({
        url: URLS['cab'].code + '?' + _token,
        dataType: 'json',
        success: function (rsp) {
            var data = rsp.results;
            var tr;
            // console.log(rsp);
            for (let i = 0; i < data.length; i++) {
                tr = `<option value="${data[i].TaryCode}">${data[i].TaryCode}</option>`;
                $('#old-tray').append(tr);
            }
        }
    }, this);
}

// 已选择托盘点击事件
$('body').on('click', '#btn-old', function() {
    if ($('#old-tray').val() == '') {
        layer.msg('请选择托盘在确定！', { time: 3000, icon: 5 });
    }else {
        $('#inTab').val($('#old-tray').val());
        layer.close(layerModal);
        layer.msg('选择托盘号成功！', { time: 3000, icon: 1 });
    }
})

// 新增托盘点击事件
$('body').on('click', '#btn-new', function() {
    if($('#new-bz').val() == '' || $('#new-bc').val() == '') {
        layer.msg('班组或班次未选择！', { time: 3000, icon: 5 });
    }else {

        var data = {
            RankPlanName:$('#new-bc').val(),
            ProductLine: $('#new-bz').val(),
            _token: TOKEN
        }
        AjaxClient.post({
            url: URLS['box'].ins,
            dataType: 'json',
            data:data,
            success: function (rsp) {
                // console.log(rsp);
                $('#inTab').val(rsp.results);
                layer.close(layerModal);
                layer.msg('新增托盘成功！', { time: 3000, icon: 1 });
            },
            fail: function(rsp) {
                layer.msg('新增托盘失败！', { time: 3000, icon: 5 });
            }
        }, this);
    }
})

// 装箱点击事件
$('body').on('click', '.save', function (e) {

    e.stopPropagation();
    let id = $(this).attr('data-id');
    let boxNum = $(this).parents('tr').find('#boxNum').val();
    let wait = $(this).parents('tr').find('#Num').text();
    let boxPerson = $(this).parents('tr').find('#boxPerson').val();
    let order = $(this).parents('tr').find('#Order').text();
    let item = $(this).parents('tr').find('#Item').text();
    if (parseInt(boxNum) > parseInt(wait) ) {
        layer.msg('装箱数不能大于待报数！', { time: 3000, icon: 5 });
    }else if(boxPerson == ' ') {
        layer.msg('装箱人不能为空！', { time: 3000, icon: 5 });
    }else {

        var data = {
            ID: id,
            InNumber: boxNum,
            BoxOperator: boxPerson,
            SalesOrder: order,
            SalesOrderItem: item,
            _token: TOKEN
        }

        AjaxClient.post({
            url: URLS['box'].enc,
            dataType: 'json',
            data: data,
            success: function (rsp) {
                // console.log(rsp);
                layer.msg('装箱成功！', { time: 3000, icon: 1 });
                getMxData();
                getData();
            },
            fail: function (rsp) {
                layer.msg('装箱失败！', { time: 3000, icon: 5 });
                // console.log(rsp);
            }
        }, this);
    }
})

// 加载明细列表
function getMxData() {

    $('#tds').html('');
    AjaxClient.get({
        url: URLS['box'].getList + '?' + _token,
        dataType: 'json',
        data:data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            // console.log(rsp);
            for (let i = 0; i < data.length; i++) {
                var tr = getMxTr(data[i]);
                $('#tds').append(tr);
            }

            window.localStorage.setItem('dataList',JSON.stringify(data));
            allChoice();
        }
    }, this);
}

function getMxTr(data) {

    var tr = `
        <tr>
            <td><input type="checkbox" name="" lay-skin="primary"></td>
            <td id="box">${data.BoxCode}</td>
            <td id="Item">${data.SalesOrder}/${data.SalesOrderItem}</td>
            <td id="code">${data.MaterialCode}</td> 
            <td id="Name">${data.MaterialName}</td>            
            <td id="inNum">${data.InNumber}</td>
            <td id="person">${data.BoxOperator}</td>
            <td id="Rank">${data.RankPlanName}</td>
            <td id="line">${data.ProductLine}</td>
            <td id="city">${data.country}</td>
        </tr>
    `;

    return tr;
}

            
function allChoice() {

    var date  = JSON.parse(window.localStorage.getItem('dataList'));
    var check = $('#tds input');
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


    // 装托

    $('#btn-zt').on('click', function() {
        arr = [];
        let id = window.localStorage.getItem('boxId');
        for (let i = 0; i < date.length; i++) {
            if (check[i].checked == true) {
                    arr.push(date[i].ID);
            }
        }

        setTimeout(function () {
                if ($('#daBao').val() == '') {
                layer.msg('未填写打包人！', { time: 3000, icon: 5 });
            } else if (arr.length == 0) {
                layer.msg('未勾选箱子！', { time: 3000, icon: 5 });
            } else if ($('#inTab').val() == '') {
                layer.msg('托盘码未选择！', { time: 3000, icon: 5 });
            } else {

                let string = arr[0];
                for (let i = 1; i < arr.length; i++) {
                    string = string + ',' + arr[i];
                }

                let data = {
                    data:string,
                    Operator: $('#daBao').val(),
                    taryCode: $('#inTab').val(),
                    _token: TOKEN
                }

                AjaxClient.post({
                    url: URLS['box'].pall,
                    dataType: 'json',
                    data: data,
                    success: function (rsp) {
                        layer.msg('装托成功！', { time: 3000, icon: 1 });         
                        getData();
                        getMxData(id);
                    },
                    fail: function (rsp) {
                        layer.msg('装托失败！', { time: 3000, icon: 5 });
                        console.log(rsp);
                    }
                }, this);
            }
        }, 500);
        


    })

}


// 搜索
$('#btn-search').on('click', function () {
    data = {
        RankPlanName: $('#bc').val(),
        ProductLine: $('#bz').val(),
        StartDate: $('#date').val(),
    }
    getData();
    getMxData();
})