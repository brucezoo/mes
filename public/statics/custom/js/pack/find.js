layui.use(['form', 'layedit', 'laydate'], function () {
    var form = layui.form
        , layer = layui.layer
        , layedit = layui.layedit
        , laydate = layui.laydate;
    //日期
    laydate.render({
        elem: '#date'
    });
    laydate.render({
        elem: '#dates'
    });
});


var data = {
    SalesOrder: $('#xs').val(),
    SalesOrderItem: $('#hxh').val(),
    MaterialCode: $('#wlbm').val(),
    Date: $('#dates').val(),
    ContainerCode: $('#zgh').val(),
    TaryCode: $('#tph').val(),
    invoicecode: $('#fph').val(),
    Operator: $('#zgr').val()
}

function reset() {
        $('#xs').val('');
        $('#hxh').val('');
        $('#wlbm').val('');
        $('#dates').val('');
        $('#zgh').val('');
        $('#tph').val('');
        $('#fph').val('');
        $('#zgr').val('');
}

layui.use('element', function () {
    var $ = layui.jquery
        , element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块  
});


// 明细
getMxData();
function getMxData() {
    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['list'].num + '?' + _token,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                var tr = getData(data[i]);
                $('#tbody').append(tr);
            }
        }
    }, this);
}

function getData(date) {

    var tr;

    tr = `
    <tr>
        <td>${date.ContainerCode}</td>
        <td>${date.containerDate}</td>
		<td>${date.TaryCode}</td>
		<td>${date.taryType == 1 ? '抽真空' : '蛇皮袋'}</td>
        <td>${date.taryDate}</td>
        <td>${date.SalesOrder}/${date.SalesOrderItem}</td>
        <td>${date.MaterialCode}</td>
        <td>${date.MaterialName}</td>
        <td>${date.OrderNumber}</td>
        <td>${date.InNumber}</td>
        <td>${date.Unit}</td>
        <td>${date.platform}</td>
        <td>${date.invoicecode}</td>
    </tr>
    `;

    return tr;
}


// 汇总
getHzData();
function getHzData() {
    $('#tbod').html('');
    AjaxClient.get({
        url: URLS['list'].all + '?' + _token,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            console.log(data,111);
            for (let i = 0; i < data.length; i++) {
                var tr = getDatas(data[i]);
                $('#tbod').append(tr);
            }
        }
    }, this);
}

function getDatas(date) {

    var tr;

    tr = `
    <tr>
        <td>${date.platform}</td>
        <td>${date.operator}</td>
        <td>${date.ContainerCode}</td>
        <td>${date.containerDate}</td>
        <td>${date.invoicecode}</td>
        <td>${date.sku}</td>
        <td>${date.MaterialCode}</td>
        <td>${date.MaterialName}</td>
        <td>${date.OrderNumber}</td>
        <td>${date.inNumber}</td>
        <td>${date.Unit}</td>
        <td>${date.TaryCode}</td>
        <td>${date.taryType == 1 ? '抽真空' : '蛇皮袋'}</td>
        <td>${date.SalesOrder}/${date.SalesOrderItem}</td>
    </tr>
    `;

    return tr;
}



var href = '/OfflinePackage/containerImport?_token=8b5491b17a70e24107c89f37b1036078'
    + '&SalesOrder='
    + '&SalesOrderItem='
    + '&MaterialCode='
    + '&Date='
    + '&ContainerCode='
    + '&TaryCode='
    + '&invoicecode='
    + '&Operator=';

$('#exportExcel').attr('href', href);

$('#btn-tp').bind('click', function () {
    data = {
        SalesOrder: $('#xs').val(),
        SalesOrderItem: $('#hxh').val(),
        MaterialCode: $('#wlbm').val(),
        Date: $('#dates').val(),
        ContainerCode: $('#zgh').val(),
        TaryCode: $('#tph').val(),
        invoicecode: $('#fph').val(),
        Operator: $('#zgr').val()
    }


    href = '/OfflinePackage/containerImport?_token=8b5491b17a70e24107c89f37b1036078'
        + '&SalesOrder=' + $('#xs').val()
        + '&SalesOrderItem=' + $('#hxh').val()
        + '&MaterialCode=' + $('#wlbm').val()
        + '&Date=' + $('#dates').val()
        + '&ContainerCode=' + $('#zgh').val()
        + '&TaryCode=' + $('#tph').val()
        + '&invoicecode=' + $('#fph').val()
        + '&Operator=' + $('#zgr').val();

    $('#exportExcel').attr('href', href);
    console.log(data);
    getHzData();
    getMxData();
    // reset();
})