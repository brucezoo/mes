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
    TaryCode:$('#tph').val(),
    Date:$('#date').val(),
    Operator:$('#dbr').val(),
    SalesOrder:$('#xs').val(),
    SalesOrderItem:$('#hxh').val(),
    MaterialCode:$('#wlbm').val(),
    PlanDueDate:$('#dates').val(),
    Description:$('#xsy').val(),
    States:$('#state').val(),
}

getHzData(data);

var href = "/OfflinePackage/taryListImport?_token=8b5491b17a70e24107c89f37b1036078"
    +"&TaryCode="
    +"&Date="
    +"&Operator="
    +"&SalesOrder="
    +"&SalesOrderItem="
    +"&MaterialCode="
    +"&PlanDueDate="
    +"&Description=";
console.log(href);
$('#exportExcel').attr('href', href);

$('#btn-tp').bind('click',function() {

    data = {
        TaryCode: $('#tph').val(),
        Date: $('#date').val(),
        Operator: $('#dbr').val(),
        SalesOrder: $('#xs').val(),
        SalesOrderItem: $('#hxh').val(),
        MaterialCode: $('#wlbm').val(),
        PlanDueDate: $('#dates').val(),
        Description: $('#xsy').val(),
        States:$('#state').val(),
    }

    href = "/OfflinePackage/taryListImport?_token=8b5491b17a70e24107c89f37b1036078"
        + "&TaryCode=" + $('#tph').val() 
        + "&Date=" + $('#date').val() 
        + "&Operator=" + $('#dbr').val() 
        + "&SalesOrder=" + $('#xs').val() 
        + "&SalesOrderItem=" + $('#hxh').val() 
        + "&MaterialCode=" + $('#wlbm').val() 
        + "&PlanDueDate=" + $('#dates').val() 
        + "&Description=" + $('#xsy').val() 
        + "&States=" + $('#state').val();
    console.log(href);
    $('#exportExcel').attr('href', href);
    getHzData(data);

})

// 获取汇总表数据
function getHzData (data){

    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['list'].tary + '?' + _token,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;

            for(let i=0; i<data.length; i++) {
              var tr = getData(data[i]);
              $('#tbody').append(tr);

              tr.bind('click',function() {
                  var id = $($(this).find('td')[0]).text();

                $(this).css('background','skyblue');

                $(this).bind('mouseout', function(){
                    $(this).css('background', '#fff');
                })

                  AjaxClient.get({
                      url: URLS['list'].item + '?' + _token +'&id=' +id,
                      dataType: 'json',
                      data: data,
                      beforeSend: function () {
                          layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
                      },
                      fail: function (rsp) {
                        layer.close(layerLoading);
                        $('#tbod').html('');
                          var data = rsp.results;
                          for (let i = 0; i < data.length; i++) {
                               
                            var tr = `
                            <tr>
                                <td>${data[i].BoxCode}</td>
                                <td>${data[i].SalesOrder}</td>
                                <td>${data[i].SalesOrderItem}</td>
                                <td>${data[i].MaterialCode}</td>
                                <td>${data[i].MaterialName}</td>
                                <td>${data[i].OrderNumber}</td>
                                <td>${data[i].InNumber}</td>
								<td>${data[i].Unit}</td>
                                <td>${data[i].Remark}</td>
                                </tr>
                            `;

                              $('#tbod').append(tr);

                          }


                      }
                  }, this); 
              })
            }

      
        }
    }, this); 
}


function getData(date) {

    var tr=$('<tr class="tr"></tr>');
    
// id
    var id = $('<td style="display:none;" class="ids"></td>');
    tr.append(id);
    id.text(date.ID);
// 托盘号
    var tp = $('<td></td>');
    tr.append(tp);
    tp.text(date.TaryCode);

// 时间
    var time = $('<td></td>');
    tr.append(time);
    time.text(date.Date);

// 责任人
    var person = $('<td></td>');
    tr.append(person);
	person.text(date.Operator);
	
	var style = $('<td></td>');
	tr.append(style);
	style.text(date.taryType == 1 ? '抽真空' : '蛇皮袋');
// 订单
    var list = $('<td></td>');
    tr.append(list);
    list.text(date.SalesOrder);
// 行项
    var item = $('<td></td>');
    tr.append(item);
    item.text(date.SalesOrderItem);
// 物料
    var code = $('<td></td>');
    tr.append(code);
    code.text(date.MaterialCode);
// 物料编码
    var name = $('<td></td>');
    tr.append(name);
    name.text(date.MaterialName);
// 总量
    var number = $('<td></td>');
    tr.append(number);
    number.text(date.OrderNumber);
// baogong
    var inN = $('<td></td>');
    tr.append(inN);
    inN.text(date.inNumber);
// 单位
    var unit = $('<td></td>');
    tr.append(unit);
	unit.text(date.Unit);
	
	var kw = $('<td></td>');
	tr.append(kw);
	kw.text(date.Stock);
// 国家
    var coun = $('<td></td>');
    tr.append(coun);
	coun.text(date.country);
	
	
        
    return tr;
}


$('body').on('click','.tr', function() {
    $(this).children('td').css('background','skyblue');
    $(this).siblings().children('td').css('background', '#fff');
})

