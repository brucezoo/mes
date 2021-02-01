//  全局标志
var flag = 0;
var allDel = [];
var str = [];

// layui 组件初始化
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



// 添加托盘点击事件
$('#btn-tp').bind('click',function () {

    flag = 0;
    var banCi = $('#bc').val();
    var banZu = $('#bz').val();
    var time = $('#date').val();
    console.log(banCi, banZu)

    if (banCi == 'D' || banZu == '0' || daBao == '' || banCi == null || banZu == null) {
        layer.alert('请选择完整信息再进行添加托盘！');
        $('#inTab').val('');
    } else {
        // console.log(banCi,banZu);
        // 传送托盘码信息
        AjaxClient.get({
            url: URLS['cab'].add + '?' + _token + '&RankPlanName=' + banCi + '&ProductLine=' + banZu,
            dataType: 'json',
            success: function (rsp) {
                var data = rsp.results;
                $('#inTab').val(data);
                // console.log(time);
            },
            fail: function (rsp) {
                // console.log(rsp);
            }
        }, this);



            layerModal = layer.open({
            type: 1,
            skin: 'layui-layer-rim', //加上边框
            area: ['1100px', '700px'], //宽高
            content: `
                    <div style="width:95%; margin:10px; auto;">
                        
                        <!--<label style="margin-left:20px;">销售订单号&nbsp;&nbsp;</label><input type="text" style="width:200px; display:inline-block;" name="title" required  lay-verify="required"  autocomplete="off" class="layui-input">
                        <label style="margin-left:20px;">销售订单行项目&nbsp;&nbsp;</label><input type="text" style="width:200px; display:inline-block;" name="title" required  lay-verify="required"  autocomplete="off" class="layui-input">
                        <label style="margin-left:20px;">物料&nbsp;&nbsp;</label><input type="text" style="width:200px; display:inline-block;" name="title" required  lay-verify="required"  autocomplete="off" class="layui-input">
                        <button style="position: absolute;left:920px;" type="button" class="layui-btn" id="btn-search">搜索</button>-->
                    </div>
                    <div id="table" style="width:95%;height:530px; margin:auto; border:1px solid #bbb; margin-top:20px; overflow: hidden;overflow-y: auto;">
                        <table class="layui-table" >
                        <colgroup>
                            <col width="150">
                            <col width="200">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                            <th><input type="checkbox"  id="all-choice"/></th>
                            <th>销售订单号</th>
                            <th>销售订单行项目</th>
                            <th>物料</th>
                            <th>物料描述</th>
                            <th>总量</th>
                            <th>待报数</th>
                            <th>单位</th>
                            </tr> 
                        </thead>
                        <tbody id="tbod">
                        </tbody>
                        </table>                
                    </div>
                    <button type="button" class="layui-btn layui-btn-normal" style="float:right;margin-right:25px; margin-top:20px;" id="btn-ok">确定</button>
            `
        });


        AjaxClient.get({
            url: URLS['cab'].get + '?' + _token + '&RankPlanName=' + banCi + '&ProductLine=' + banZu + '&StartDate=' + time,
            dataType: 'json',
            success: function (rsp) {
                var data = rsp.results;
            //    console.log(data,123456);
                var tr;
               for(let i=0; i<data.length; i++) {
                   tr = `
                    <tr>
                                <td><input type="checkbox"></td>
                                <td>${data[i].SalesOrder}</td>
                                <td>${data[i].SalesOrderItem}</td>
                                <td>${data[i].MaterialCode}</td>
                                <td>${data[i].MaterialName}</td>
                                <td>${data[i].OrderNumber}</td>
                                <td>${data[i].waitNum}</td>
                                <td>${data[i].Unit}</td>
                    </tr>
                `;
                $('#tbod').append(tr);
               }
                alls($('#tbod input'), data);
            },
            fail: function (rsp) {
                console.log(rsp);
            }
        }, this);

        function alls(check,data) {
            // console.log(data, check.length,9999)
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
// 点击确定
            $('#btn-ok').bind('click', function () {

                var daBao = $('#daBao').val();
                allDel = [];
                for (let i = 0; i < data.length; i++) {
                    if (check[i].checked == true) {
                            allDel.push(data[i].ID);
                    }
                }
                var date = {
                    name:$('#inTab').val(),
                }
                // console.log(allDel);
                layer.close(layerModal);
                AjaxClient.post({
                    url: URLS['cab'].put + '?' + _token + '&Operator=' + daBao,
                    dataType: 'json',
                    data: date,
                    success: function (rsp) {
                        // console.log(rsp);
                    },
                    fail: function (rsp) {
                        // console.log(rsp);
                        // console.log(allDel);
                    }
                }, this);

                // 传id
                get();
                getTpData();
            })
        }
    }
    
})



function get() {
    
    var string = allDel[0];
    for (let i = 1; i < allDel.length; i++) {
        string = string + ',' + allDel[i];
    }
    var datas = {
        data: string,
        _token: TOKEN
    }

    // console.log(allDel,'-----------------');
    $('#td').html('');
    $('#tds').html('');
    AjaxClient.get({
        url: URLS['cab'].pack,
        dataType: 'json',
        data: datas,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            // console.log(string,987);
            layer.close(layerLoading);
            var data = rsp.results;
            console.log(data,111);
            
            for (let i = 0; i < data.length; i++) {

                var sj = getD(data[i]);
                $('#td').append(sj);
            }
        },
    }, this);           
}

function getD(data) {

    var tr = $('<tr></tr>');

    var id = $('<td style="display:none;"></td>');
    tr.append(id);
    id.text(data.ID);

    var sale = $('<td></td>');
    tr.append(sale);
    sale.text(data.SalesOrder);

    var order = $('<td></td>');
    tr.append(order);
    order.text(data.SalesOrderItem);

    var code = $('<td></td>');
    tr.append(code);
    code.text(data.MaterialCode);

    var name = $('<td></td>');
    tr.append(name);
    name.text(data.MaterialName);

    var date = $('<td></td>');
    tr.append(date);
    date.text(data.StartDate);
    
    var number = $('<td></td>');
    tr.append(number);
    number.text(data.OrderNumber);

    var wait = $('<td></td>');
    tr.append(wait);
    wait.text(data.waitNum);

    var num = $('<td style="width:120px;"></td>');
    tr.append(num);
    var inp = $('<input type="text" style="width:120px;" value="" class="num">');
    num.append(inp);
    inp.val(data.waitNum);

    var nums = $('<td style="width:120px;"></td>');
    tr.append(nums);
    var operator = $('<input type="text" style="width:120px;" value="" class="num"> id = "operators"');
    nums.append(operator);
    operator.val(data.BoxOperator);

    var unit = $('<td></td>');
    tr.append(unit);
    unit.text(data.Unit);

    var rank = $('<td></td>');
    tr.append(rank);
    rank.text(data.Remark);

    var rank = $('<td style=""></td>');
    tr.append(rank);
    var div = $('<div class="layui-btn-group"></div>');
    rank.append(div);
    var ok = $('<button type="button" class="layui-btn"  style="background:#1E9FFF;">保存</button>');
    div.append(ok).on('click', function () {

       //保存
        console.log(data.operator);
        if (inp.val() > data.waitNum ) {
            layer.msg('装箱数不能大于待报数！', { time: 3000, icon: 5 });
        } else{
            var date = {
                ID: data.ID,
                InNumber: inp.val(),
                TaryCode: $('#inTab').val(),
                SalesOrder: data.SalesOrder ,
                SalesOrderItem: data.SalesOrderItem,
                BoxOperator: operator.val(),
                _token: TOKEN
            }
            if (operator.val() == null || operator.val() == '' ) {
                layer.alert('请输入装箱人再装箱!');
            } else {
                console.log(date);
                AjaxClient.post({
                url: URLS['cab'].page,
                dataType: 'json',
                data: date,
                success: function (rsp) {
                    window.localStorage.setItem('arrId',date.ID);
                    layer.msg('保存成功！', { time: 3000, icon: 1 });
                    set();
                },
                fail:function (rsp) {
                    // console.log(rsp);
                    layer.msg('保存失败！', { time: 3000, icon: 5 });
                }
                }, this);
            }
             
            
        }  
        
    });


    return tr ;
}


//  刷新
function set() {
    $('#td').html('');
    get();
    $('#tds').html('');
    listData();   
}

// 明细
function listData () {
    var id = window.localStorage.getItem('arrId');
    AjaxClient.get({
        url: URLS['cab'].getBox + '?' + _token + "&id=" + id,
        dataType: 'json',
        fail: function (rsp) {
            var data = rsp.results;
            // console.log(data,'李浩');
            str = [];
            for(let i=0; i<data.length; i++) {
                var tr  = getTr(data[i]);
                $('#tds').append(tr);
                str.push(data[i].ID);
            }
            window.localStorage.setItem('str',str);
        }
    }, this);   
}   

function getTr(data) {

    // console.log(data.ID,"-----------",data);
    // console.log(data);
    var tr = $('<tr></tr>');

    var id = $('<td style="display:none;"></td>');
    tr.append(id);
    id.text(data.ID);
// 托盘
    var tp = $('<td></td>');
    tr.append(tp);
    tp.text(data.TaryCode);
// 箱号
    var xh = $('<td></td>');
    tr.append(xh);
    xh.text(data.BoxCode);
// 订单号
    var sale = $('<td></td>');
    tr.append(sale);
    sale.html(data.SalesOrder + '&nbsp;/&nbsp;' + data.SalesOrderItem);
// 行项
    // var order = $('<td></td>');
    // tr.append(order);
    // order.text(data.SalesOrderItem);
//物料号
    var code = $('<td></td>');
    tr.append(code);
    code.text(data.MaterialCode);
// 物料描述
    var number = $('<td></td>');
    tr.append(number);
    number.text(data.MaterialName);
// 入箱数量
    var wait = $('<td></td>');
    tr.append(wait);
    wait.text(data.InNumber);

// 装箱人
    var zxr = $('<td></td>');
    tr.append(zxr);
    zxr.text(data.BoxOperator);

// 班次
    var num = $('<td></td>');
    tr.append(num);
    num.text(data.RankPlanName);
// 生产线
    var unit = $('<td></td>');
    tr.append(unit);
    unit.text(data.ProductLine);
// 托盘时间
    var ranks = $('<td></td>');
    tr.append(ranks);
    ranks.text(data.Date);
// 出口国
    var ckg = $('<td></td>');
    tr.append(ckg);
    ckg.text(data.country);
    
    var rank = $('<td style=""></td>');
    tr.append(rank);
    var ok = $('<button type="button" class="layui-btn cancel"  style="background:#FF5722;">删除</button>');
    rank.append(ok)
    ok.bind('click',function(){

        // console.log(data.ID,'============');
        AjaxClient.get({
            url: URLS['cab'].del + '?' + _token + '&id=' + data.id,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
            },
            success: function (rsp) {
                layer.close(layerLoading);
                // console.log(rsp);
                $('#tds').html('');
                // listData();
                mingXi();
                master();
                layer.msg('删除成功！', { time: 3000, icon: 1 });
            },
            fail: function(rsp) {
                layer.close(layerLoading);
                layer.msg('删除失败！', { time: 3000, icon: 5 });
            }
        }, this); 
    });

    // 打印
    var print = $('<button type="button" class="layui-btn"  style="background:#5FB878;">打印</button>');
    rank.append(print)
    print.bind('click' ,function () {
        
        // console.log(data.BoxCode);
        AjaxClient.get({
            url: URLS['cab'].print + '?' + _token + "&taryCode=" + data.BoxCode,
            dataType: 'json',
            fail: function (rsp) {
                var data = rsp.results;
                doPrints(data);
                $("#printList").show();
                $("#printList").print();
                $("#printList").hide();
            },
        }, this);
    })

    return tr;
}


// 打印调用
function doPrints(data) {
    $("#printList").html('');
    var prnhtml = '';
    prnhtml = `
            <table border="1" cellpadding="0" cellspacing="0" width="400" style="border-collapse: collapse;">
                <tr>
                    <td rowspan="7" width="150">
                        <div id="qrcode"></div>
                    </td>
                    <td>箱号</td>
                    <td>${data[0].BoxCode}</td>
                </tr>
                <tr>
                    <td width="100">销售订单号</td>
                    <td width="150">${data[0].SalesOrder}</td>
                </tr>
                <tr>
                    <td>行项目</td>
                    <td>${data[0].SalesOrderItem}</td>
                </tr>
                <tr>		
                    <td>物料编码</td>
                    <td>${data[0].MaterialCode}</td>
                </tr>
                <tr>
                    <td>规格</td>
                    <td>${data[0].MaterialName}</td>
                </tr>
                <tr>
                    <td>数量</td>
                    <td>${data[0].InNumber}</td>
                </tr>
                <tr>
                    <td>单位</td>
                    <td>${data[0].Unit}</td>
                </tr>
            </table>
        `;
        $("#printList").html(prnhtml);

        var print_str_qrcode = {
            SalesOrder: 'SalesOrder:' + data[0].SalesOrder + ',' + 'SalesItemNo:' + data[0].SalesOrderItem + ',' + 'MaterialCode:' + data[0].MaterialCode + ','+
                'Qty:' + data.InNumber + data[0].Unit + ','+'Specifications:' + data[0].MaterialName,
        }
    // console.log(print_str_qrcode);
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            width: 120,
            height: 120,
            correctLevel: QRCode.CorrectLevel.L
        });

    // console.log($('#printList'));
        
        makeCode(JSON.stringify(print_str_qrcode), qrcode);
}

function makeCode(str, qrcode) {
    qrcode.makeCode(str);
}
       

// 托盘号
getTpData();

function getTpData() {

    $('#tbody-tp').html('');
    AjaxClient.get({
        url: URLS['cab'].code + '?' + _token,
        dataType: 'json',
        success: function (rsp) {
            var data = rsp.results;
            // console.log(data,222);
            for(let i=0; i<data.length; i++) {

                var tr = addTr(data[i]);
                $('#tbody-tp').append(tr);
            }
            
            allChoice(data);
        },
        fail:function (rsp) {

        },
        
    }, this);

}

// 批量打印
var all = [];
function allChoice(data) {

    console.log(data,2223333);
    var check = $('#tbody-tp input');
    document.getElementById('allChoice').checked = false;

    $('#allChoice').bind('click', function () {
        // 不选
        if (document.getElementById('allChoice').checked != true) {
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

    $('#btn-pd').bind('click', function () {
        all = [];
        console.log(data.length);
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {         
                    all.push(data[i].ID);
            }
        }
        // console.log(all);

        var strings = all[0];
        for (let i = 1; i < all.length; i++) {
            strings = strings + ',' + all[i];
        }

        var date = {
            data: strings,
            _token: TOKEN
        }
        AjaxClient.get({
            url: URLS['cab'].batch + '?' + _token,
            dataType: 'json',
            data: date,
            fail: function (rsp) {
                var data = rsp.results;
                // console.log(rsp,222);
                // console.log(data, 666);
                // $('#inTab').val(data[0].TaryCode);
                // $('#daBao').val(data[0].Operator);

                // for (let i = 0; i < data.length; i++) {
                //     var tr = getMaster(data[i]);
                //     $('#td').append(tr);
                // }
            },
            success: function (rsp) {
                // console.log(rsp, 1111);
            }
        }, this);
    })

}

function addTr( data ) {

    var tr = $('<tr></tr>');

    var check = $('<td><input type="checkbox" id="allChoice"></td>');
    tr.append(check);

    var td = $('<td></td>');
    tr.append(td);
    td.text(data.TaryCode);
    td.bind('click', function() {
        flag = 1;
        window.localStorage.setItem('dataID',data.ID);
        // 明细
        mingXi();

        // 母表
        master();

        var tp = $('#tbody-tp td');
       
        for (let i = 0; i < tp.length; i++) {
                    if (td.text() == $(tp[i]).text()) {
                        $(tp[i]).css('background', 'skyblue');
                    } else {
                        $(tp[i]).css('background', '#fff');
                    }

        }
    
    })

    return tr;
}


function mingXi() {
    var strs = [];
    var id = window.localStorage.getItem('dataID');
    AjaxClient.get({
        url: URLS['cab'].nowBox + '?' + _token + '&id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            // console.log(rsp,111);
            var data = rsp.results;
            console.log(data);
            layer.close(layerLoading);
            // 清空
            $('#bc').val('');
            $('#bz').val('');
            $('#tds').html('');
            for (let i = 0; i < data.length; i++) {
                // console.log(data,1111);
                var tr = getTr(data[i]);
                strs.push(data[i].ID);
                $('#tds').append(tr);
            }

            // window.localStorage.setItem('strs',strs);
            // console.log(data,'strs');
        },
        success: function (rsp) {
            // console.log(rsp ,data.ID);
        }
    }, this);
}


function master() {
    var id = window.localStorage.getItem('dataID');

    // console.log(id,000);
    $('#td').html('');
    AjaxClient.get({
        url: URLS['cab'].nowTary + '?' + _token + '&id=' + id,
        dataType: 'json',
        fail: function (rsp) {
            var data = rsp.results;
            console.log(data);
            // console.log(data, 666);
            $('#inTab').val(data[0].TaryCode);
            $('#daBao').val(data[0].Operator);
            
            for (let i = 0; i < data.length; i++) {
                var tr = getMaster(data[i]);
                $('#td').append(tr);
            }
        },
        success: function (rsp) {

        }
    }, this);
}


function getMaster(data) {

    console.log(data,88);
    var tr = $('<tr></tr>');

    var id = $('<td style="display:none;"></td>');
    tr.append(id);
    id.text(data.ID);

    var sale = $('<td></td>');
    tr.append(sale);
    sale.text(data.SalesOrder);

    var order = $('<td></td>');
    tr.append(order);
    order.text(data.SalesOrderItem);

    var code = $('<td></td>');
    tr.append(code);
    code.text(data.MaterialCode);

    var name = $('<td></td>');
    tr.append(name);
    name.text(data.MaterialName);

    var date = $('<td></td>');
    tr.append(date);
    date.text(data.StartDate);

    var number = $('<td></td>');
    tr.append(number);
    number.text(data.OrderNumber);

    var wait = $('<td></td>');
    tr.append(wait);
    wait.text(data.waitNum);

    var num = $('<td style="width:120px;"></td>');
    tr.append(num);
    var inp = $('<input type="text" style="width:120px;" value="" class="num">');
    num.append(inp);
    inp.val(data.waitNum);

    var nums = $('<td style="width:120px;"></td>');
    tr.append(nums);
    var operator = $('<input type="text" style="width:120px;" value="" class="num" id="operator"> ');
    nums.append(operator);
    operator.val(data.BoxOperator);

    var unit = $('<td></td>');
    tr.append(unit);
    unit.text(data.Unit);

    var rank = $('<td></td>');
    tr.append(rank);
    rank.text(data.Remark);

    var rank = $('<td style=""></td>');
    tr.append(rank);
    var div = $('<div class="layui-btn-group"></div>');
    rank.append(div);
    var ok = $('<button type="button" class="layui-btn save"  style="background:#1E9FFF;">保存</button>');
    div.append(ok).on('click', function () {

        //保存

        if (inp.val() > data.waitNum) {
            layer.msg('装箱数不能大于待报数！', { time: 3000, icon: 5 });
        } else {
            var date = {
                ID: data.taskId,
                InNumber: inp.val(),
                TaryCode: $('#inTab').val(),
                SalesOrder: data.SalesOrder,
                SalesOrderItem: data.SalesOrderItem,
                BoxOperator: $('#operator').val(),
                _token: TOKEN
            }

            // console.log(date);

            if ($('#operator').val() == '' ) {
                layer.alert('请填入装箱人再装箱!');
            } else {
                    AjaxClient.post({
                    url: URLS['cab'].page,
                    dataType: 'json',
                    data: date,
                    success: function (rsp) {
                        window.localStorage.setItem('arrId', date.ID);
                        layer.msg('保存成功！', { time: 3000, icon: 1 });
                        master();
                        mingXi();
                    },
                    fail: function (rsp) {
                        layer.msg('保存失败！', { time: 3000, icon: 5 });
                        // console.log(rsp);
                        // console.log(date);
                    }
                }, this);
            }
            

        }

    });


    return tr;
}


// 打印托盘牌
$('#btn-dy').bind('click', function () {
    if (flag == '0') {
        printCab();
    } else if (flag == '1') {
        printCabs();
    }

})

// 通过 点击托盘列表添加
function printCabs() {

    // var str = window.localStorage.getItem('strs');
    // console.log(str,'----------------');
    var data = {
        data: $('#inTab').val(),
    }
    // console.log(str, 9090);
    console.log($('#inTab').val());
    AjaxClient.get({
        url: URLS['cab'].printAll + '?' + _token ,
        dataType: 'json',
        data: data,
        success: function (rsp) {

            // doPrint(data);
            console.log(rsp,111);
        },
        fail: function (rsp) {
            console.log(rsp,111);
            var data = rsp.results;
            // console.log(data, 11111, str);
            doPrint(data);
            $("#printLists").show();
            $("#printLists").print();
            $("#printLists").hide();
        }
    }, this);

}

// 通过添加托盘 进行打印
function printCab() {

    // var str = window.localStorage.getItem('str');

    var data = {
        data: $('#inTab').val(),
    }
    // console.log(str, 9090);
    AjaxClient.get({
        url: URLS['cab'].printAll + '?' + _token,
        dataType: 'json',
        data: data,
        success: function (rsp) {

            // doPrint(data);
        },
        fail: function (rsp) {
            var data = rsp.results;
            // console.log(data, 11111, str);
            doPrint(data);
            $("#printLists").show();
            $("#printLists").print();
            $("#printLists").hide();
        }
    }, this);
}

// 打印调用
function doPrint(data) {
    $("#printLists").html('');
    var prnhtml = ' ';
    var tr;
    prnhtml = `
            <table border="1" cellpadding="0" cellspacing="0" width="1000" style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <td colspan="9" height="20" style="">
                            <h3 style="text-align: center; font-size: 20px; font-weight: 100;" >托盘标识牌</h3>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="9" height="80" style="border-bottom: 0;text-align: right;border-top:0px; ">
                            <p>托盘编号：<label for="" id="tp"></label>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <p>打包时间：<label for="" id="time"></label>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <p>打包人：<input type="text" width="120px; border:0;"></p>
                        </td>
                    </tr>
                    <tr>
                        <th>销售订单</th>
                        <th>销售订单行项目</th>
                        <th>物料编码</th>
                        <th>规格</th>
                        <th>总数量</th>
                        <th>数量</th>
                        <th>单位</th>
                        <th>客户描述</th>
                        <th>备注</th>
                    </tr>
                    <tr>
                        <th>Sales Orders</th>
                        <th>Sales Order Line Projects</th>
                        <th>Material Coding</th>
                        <th>Specifications</th>
                        <th>Total Quantity</th>
                        <th>Number</th>
                        <th>Company</th>
                        <th>Customer Description</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;" id="printCabAll">
                    
                </tbody>           
            </table>
        `;
    $("#printLists").append(prnhtml);
    $('#tp').text(data[0].TaryCode);
    $('#time').text(data[0].Date);
    for (let i = 0; i < data.length; i++) {
        tr = `
                    <tr>
                        <td>${data[i].SalesOrder}</td>
                        <td>${data[i].SalesOrderItem}</td>
                        <td>${data[i].MaterialCode}</td>
                        <td>${data[i].MaterialName}</td>
                        <td>${data[i].OrderNumber}</td>
                        <td>${data[i].inNumber}</td>
                        <td>${data[i].Unit}</td>
                        <td>${data[i].Description}</td>
                        <td>${data[i].country}</td>
                    </tr>
                `;

        $('#printCabAll').append(tr);
    }

}