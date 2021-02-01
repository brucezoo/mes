var layerModal, layerLoading, pageNo = 1, pageSize = 20, ajaxData={};

$(function() {
    $('body').css({'background-color': '#fff'});
    getdevice();
});

function bindPagenationClick(totalData,pageSize){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getdevice();
        }
    });
};

//获取列表
function getdevice(){

    /***  修改 注释 8/7 *** */
        // var urlLeft = "&page_no="+pageNo+"&page_size="+pageSize;
        // var deviceCode = $.url().param('code');
        // if (deviceCode) {
        //     urlLeft += '&device_code=' + deviceCode;
        // }
    /*****end */
    let printData = JSON.parse(window.localStorage.getItem('print'));
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['device'].pageIndex+"?"+_token+printData,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',17);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取列表失败，请刷新重试',17);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        // var tr=`
        //     <tr class="tritem" data-id="${item.id}">
        //         <td>${item.device_name}</td>
        //         <td>${item.device_code}</td>
        //         <td>${item.device_spec?item.device_spec:''}</td>
        //         <td>${item.address?item.address:''}</td>
        //         <td>${item.devtype_name?item.devtype_name:''}</td>
        //         <td>${item.department_name?item.department_name:''}</td> 
        //         <td>${item.supplier_name?item.supplier_name:''}</td> 
        //         <td>${item.purchase_time?timestampToTime(item.purchase_time):''}</td> 
        //         <td>${item.sign_name?item.sign_name:''}</td>
        //         <td>${item.employee_name?item.employee_name:''}</td> 
        //         <td>${item.remark?item.remark:''}</td> 
        //         <td>${item.status_name?item.status_name:''}</td> 
        //         <td class="right">
        //         </td>
        //     </tr>
        // `;
        var fontsize = '';
        if (item.device_name.length > 12) {
            fontsize = ' style="font-size:3.5mm"';
        }
    //     var printBox = `<div class="print-box" style="margin-top:5mm">
    //         <div class="print-box-body">
    //             <div class="qrImg"></div>
    //             <div class="info">
    //                 <table>
    //                     <tr><td>名称</td><td${fontsize}>${item.device_name}</td></tr>
    //                     <tr><td>编码</td><td>${item.device_code}</td></tr>
    //                     <tr><td>部门</td><td>${item.department_name}</td></tr>
    //                     <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    //                     <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    //                 </table>
    //             </div>
    //         </div>
    //         <div style="font-size: 4mm; margin-top: 4mm; text-align: center;">使用钉钉内MES应用的扫一扫功能查看更信息</div>
    //     </div>`;
    //     printBox = $(printBox);
    //     //var text = {"t":"deviceRepair","c":"${item.device_code}"};
    //     var text = `dingtalk://dingtalkclient/action/open_micro_app?corpId=dinga11e2e568b110e0035c2f4657eb6378f&agentId=215508692&pVersion=1&miniAppId=2019010462847028&packageType=1&page=page%2findex%3fto%3dDeviceInfo%26code%3d${encodeURIComponent(item.device_code)}`;
    //     console.log(text);
    //     printBox.find('.qrImg').qrcode({width: 190, height: 190, text: text});
    //     printBox.insertAfter('#workhour_table');

        var printBox = `<div class="print-box" style="margin-top:0mm;height:85mm;width:136mm">
        <div class="print-box-body" style="margin-top:4mm;">
        <div class="qrImg"></div>
        <div class="info" >
        <table>
        <tr><td>名称</td><td${fontsize}>${item.device_name}</td></tr>
        <tr><td>编码</td><td>${item.device_code}</td></tr>
        <tr><td>部门</td><td>${item.department_name}</td></tr>
        <tr><td>联系人</td><td>&nbsp;</td></tr>
        <tr><td>联系电话</td><td>&nbsp;</td></tr>
        </table>
        </div>
        </div>
        </div>`;
                printBox = $(printBox);
            //var text = {"t":"deviceRepair","c":"${item.device_code}"};
            var text = `dingtalk://dingtalkclient/action/open_micro_app?corpId=dinga11e2e568b110e0035c2f4657eb6378f&agentId=215508692&pVersion=1&miniAppId=2019010462847028&packageType=1&page=page%2findex%3fto%3dDeviceInfo%26code%3d${encodeURIComponent(item.device_code)}`;
            console.log(text);
            printBox.find('.qrImg').qrcode({text: text});
            printBox.insertAfter('#workhour_table');
    });

    $('.print-box:first').css('margin-top', '2.5mm');
};
