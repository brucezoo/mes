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
    SalesOrder: '',
    SalesOrderItem: '',
    MaterialCode:'',
    PlanDueDate: '',
    Description: '',
    States: '0',
    RankPlanName:'0',
    ProductLine:'0'
}

var href = '/OfflinePackage/saleOrderExcel?_token=8b5491b17a70e24107c89f37b1036078'
    + '&SalesOrder='
    + '&SalesOrderItem='
    + '&MaterialCode='
    + '&PlanDueDate='
    + '&Description='
    + '&States='
    + '&RankPlanName='
    + '&ProductLine=';

$('#exportExcel').attr('href',href);

getHzData();
function getHzData() {
    AjaxClient.get({
        url: URLS['list'].list + '?' + _token,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            for (let i = 0; i < data.length; i++) {
                var tr = getData(data[i]);
                $('#tbody').append(tr);
            }
        }
    }, this);
}

function  getData(date) {

    var tr ;

    if (date.States == '1') {
        states = '待排产';
        flag = '';
    } else if (date.States == '2') {
        states = '待派工';
        flag = '待生产';
    } else if (date.States == '3') {
        states = '待领料';
        flag = '';
    } else if (date.States == '4') {
        states = '待生产';
    } else if (date.States == '5') {
        states = '生产中';
    } else if (date.States == '6') {
        states = '完工';
    }

    tr = `
    <tr>
        <td>${date.SalesOrder}</td>
        <td>${date.SalesOrderItem}</td>
        <td>${states}</td>
        <td>${date.PlanDueDate}</td>
        <td>${date.MaterialCode}</td>
        <td>${date.MaterialName}</td>
        <td>${date.MaterialName}</td>
        <td>${date.OrderNumber}</td>
        <td>${date.inNumber}</td>
        <td>${date.residueNum}</td>
        <td>${date.Unit}</td>
        <td>${date.efficiency + '%'}</td>
        <td>${date.PlanDueDate}</td>
        <td>${date.DueDate}</td>
        <td>${date.RankPlanName}</td>
        <td>${date.ProductLine}</td>
        <td>${date.Remark}</td>
    </tr>
    `;

    return tr;
}

$('#btn-tp').bind('click',function(){
    data = {
        SalesOrder: $('#xs').val(),
        SalesOrderItem: $('#hxh').val(),
        MaterialCode: $('#wlbm').val(),
        PlanDueDate: $('#dates').val(),
        Description: $('#xsy').val(),
        States: $('#state').val(),
        RankPlanName : $('#bc').val(),
        ProductLine : $('#cx').val()
    }


    href = '/OfflinePackage/saleOrderExcel?_token=8b5491b17a70e24107c89f37b1036078'
        + '&SalesOrder=' + $('#xs').val()
        + '&SalesOrderItem=' + $('#hxh').val()
        + '&MaterialCode=' + $('#wlbm').val()
        + '&PlanDueDate=' + $('#dates').val()
        + '&Description=' + $('#xsy').val()
        + '&States=' + $('#state').val()
        + '&RankPlanName=' + $('#bc').val()
        + '&ProductLine=' + $('#cx').val();
    
    $('#exportExcel').attr('href', href);
    $('#tbody').html('');
    getHzData();
})

// 导出
// $('#exportExcel').bind('click', function() {

//     AjaxClient.get({
//         url: URLS['list'].excel + '?' + _token,
//         dataType: 'json',
//         data: data,
//         success: function (rsp) {
//            console.log(rsp);
//         },
//         fail: function (rsp) {
//             console.log(rsp);
//         }
//     }, this);


//     //列标题，逗号隔开，每一个逗号就是隔开一个单元格
//     let str = `销售订单号,行项号,状态,计划生产时间,物料,物料描述,规格,已打包数量,剩余数量,单位,完成率,计划完成日期,实际完成日期,班次,产线,备注\n`;
//     //增加\t为了不让表格显示科学计数法或者其他格式
//     // for (let i = 0; i < jsonData.length; i++) {
//     //     for (let item in jsonData[i]) {
//     //         str += `${jsonData[i][item] + '\t'},`;
//     //     }
//     //     str += '\n';
//     // }
//     //encodeURIComponent解决中文乱码
//     let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
//     //通过创建a标签实现
//     let link = document.createElement("a");
//     link.href = uri;
//     //对下载的文件命名
//     link.download = "销售订单报表.csv";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// })

