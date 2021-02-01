var layerModal,ajaxData={},pageNo=1,pageSize=20;
$(function () {
    setAjaxData();
    getPickingAll();
    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
}
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
            getPickingAll();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: ''

    };
}

//获取批量领料列表
function getPickingAll(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['picking'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo=pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            createHtml($('#show_table_tbody'),rsp);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取批量领料单列表失败，请刷新重试',11);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成未排列表数据
function createHtml(ele,data){
    ele.html('');
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            var trs =  `
			<tr>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.workbench_name)}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.status==1?'待推送':item.status==2?'进行中':item.status==3?'待入库':item.status==5?'正在执行批量入库':item.status==4?'完成':'')}</td>
			<td class="right">
			    ${item.status==1?`<button data-id="${item.id}" class="button pop-button item_submit">推送</button>`:''}
			    ${item.status==3?`<button data-id="${item.id}" class="button pop-button item_deport">入库</button>`:''}    
			</td>
		
			</tr>
			`;
            ele.append(trs);
            ele.find('tr:last-child').data("trData", item);
        })
    }
}


// function Modal() {
//     var labelWidth=150,
//         btnShow='btnShow',
//         title='批量领料',
//         readonly='';
//     layerModal=layer.open({
//         type: 1,
//         title: title,
//         offset: '100px',
//         area: '500px',
//         shade: 0.1,
//         shadeClose: false,
//         resize: false,
//         content: `<form class="formModal formPickingSearch" id="pick_search_from" autocomplete="off" data-flag="">
//             <div class="el-form-item">
//                 <div class="el-form-item-div">
//                     <label class="el-form-item-label" style="width: ${labelWidth}px;">开始时间</label>
//                     <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>                </div>
//                 <p class="errorMessage" style="display: block;"></p>
//             </div>
//             <div class="el-form-item">
//                 <div class="el-form-item-div">
//                     <label class="el-form-item-label" style="width: ${labelWidth}px;">结束时间</label>
//                     <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
//                 </div>
//                 <p class="errorMessage" style="display: block;"></p>
//             </div>
//
//             <div class="el-form-item">
//                 <div class="el-form-item-div">
//                     <label class="el-form-item-label" style="width: ${labelWidth}px;">台板</label>
//                     <div class="el-select-dropdown-wrap">
//                         <input type="text" id="workBench" class="el-input"  placeholder="台板" value="">
//                     </div>
//                 </div>
//             </div>
//
//
//             <div class="el-form-item ${btnShow}">
//             <div class="el-form-item-div btn-group">
//                 <button type="button" class="el-button cancle">取消</button>
//                 <button type="button" class="el-button el-button--primary submit">确定</button>
//             </div>
//           </div>
//         </form>` ,
//         success: function(layero,index){
//             getLayerSelectPosition($(layero));
//             $('#workBench').autocomplete({
//                 url: URLS["pickAll"].benchList+"?"+_token+"&page_no=1&page_size=10",
//                 param:"name",
//                 showCode:"workbench_name"
//             });
//             $('#workBench').each(function(item){
//                 var width=$(this).parent().width();
//                 $(this).siblings('.el-select-dropdown').width(width);
//
//             });
//
//             $('#start_time').on('click', function (e) {
//                 e.stopPropagation();
//                 var that = $(this);
//                 var max = $('#end_time_input').text() ? $('#end_time_input').text() : '2099-12-30 00:00:00';
//                 start_time = laydate.render({
//                     elem: '#start_time_input',
//                     min:getCurrentDate(),
//                     max: max,
//                     type: 'datetime',
//                     show: true,
//                     closeStop: '#start_time',
//                     done: function (value, date, endDate) {
//                         that.val(value);
//                     }
//                 });
//             });
//             $('#end_time').on('click', function (e) {
//                 e.stopPropagation();
//                 var that = $(this);
//                 var min = $('#start_time_input').text() ? $('#start_time_input').text() : getCurrentDate();
//                 end_time = laydate.render({
//                     elem: '#end_time_input',
//                     min: min,
//                     max: '2099-12-30 00:00:00',
//                     type: 'datetime',
//                     show: true,
//                     closeStop: '#end_time',
//                     done: function (value, date, endDate) {
//                         that.val(value);
//                     }
//                 });
//             });
//
//         },
//         end: function(){
//             $('.table_tbody tr.active').removeClass('active');
//         }
//     });
// }
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
function bindEvent() {

}
