var id,type='',sales_order_code='',sales_order_project_code='',in_material_arr=[],wo_number='', pickingList='',push_type=0,line_depot_id,check_stor_type=2;
var batch =[];
var zrr = $('#zrr').text();
var zrr_id = $('#zrr_id').text();
var returnMaterialData,pageNoItem=1,
    pageSizeItem=50;
$(function () {
    id = getQueryString('id');
    type = getQueryString('type');
    if(type==1){
        $('#picking_title').text('车间领料单');
        $('.save').text('车间领料');
        $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工艺单</label>
                                <input type="text" id="wt_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">BOM编码</label>
                                <input type="text" id="item_no" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>


                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">需求库存地点<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="storage_wo" class="el-input" placeholder="请输入需求库存地点" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                       
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项目号</label>
                                <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人" data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div id="showMESPicking" style="display:none;"></div>`);
        getworkOrderView(id)
        $('#storage_wo').autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name'
        });

        $('#employee').autocomplete({
            url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
            param:'name'
        });
    }
    if(type==2){
        $('#picking_title').text('车间退料单');
        $('.save').text('车间退料');
        $('.save').show();

        $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">生产订单号</label>
                                <input type="text" id="po_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                         <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人" data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工厂</label>
                                <input type="text" id="factory" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>`);
        getReturnView(id);
        $('.nav-tabs').hide();
        $('#operation').hide();
        $('#employee').autocomplete({
            url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
            param:'name'
        });
    }
    if(type==7){
        $('#picking_title').text('车间补料单');
        $('.save').text('车间补料');

        $('#basic_info_show').html(`<div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工单</label>
                                <input type="text" id="wo_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工艺单</label>
                                <input type="text" id="wt_number" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">BOM编码</label>
                                <input type="text" id="item_no" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>


                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售单号</label>
                                <input type="text" id="sales_order_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">需求库存地点<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="storage_wo" class="el-input" placeholder="请输入需求库存地点" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">配送时间</label>
                              <input type="text" style="background-color: #fff !important;" id="chooseTime" readonly class="el-input" placeholder="请选择时间" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
                          </div>
                        
                    </div>
                    <div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">销售行项目号</label>
                                <input type="text" id="sales_order_project_code" readonly class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" class="el-input" placeholder="请输入责任人" data-id="${zrr_id}" value="${zrr_id == 0 ? '' : zrr}">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                    </div>`);

        getworkOrderView(id);
        laydate.render({
            elem: '#chooseTime',
            type: 'datetime',
            value: new Date()
        });
        $('#storage_wo').autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name'
        });

        $('#employee').autocomplete({
            url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
            param:'name'
        });

    }

    bindEvent();
});

function getReturnView(id) {
    AjaxClient.get({
        url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            pickingList=rsp.results;
            if(rsp.results.depot_name){
                $('#storage_wo').val(rsp.results.depot_name+'（'+rsp.results.line_depot_code+'）').data('inputItem',{id:rsp.results.line_depot_id,code:rsp.results.line_depot_code,name:rsp.results.depot_name}).blur();
            }
            $('#wo_number').val(rsp.results.wo_number);
            $('#po_number').val(rsp.results.po_number);
            $('#factory').val(rsp.results.factory_name);
            $('#sales_order_code').val(rsp.results.sales_order_code);
            $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
            in_material_arr=JSON.parse(rsp.results.in_material);

            if(in_material_arr.length>0){
                AjaxClient.get({
                    url: URLS['order'].getWorkShopReturnStorage+ "?"+ _token + "&work_order_id=" + id,
                    dataType: 'json',
                    beforeSend: function () {
                        layerLoading = LayerConfig('load');
                    },
                    success: function (rsp) {
                        layer.close(layerLoading);
                        returnMaterialData = rsp.results;
                        showReturnInItem();
                    },
                    fail: function (rsp) {
                        layer.close(layerLoading);
                        layer.msg('获取工单详情失败，请刷新重试',{icon: 5,offset: '250px',time: 1500});
                    }
                }, this)
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取工单详情失败，请刷新重试', {icon: 5,offset: '250px',time: 1500});
        }
    }, this)



}

function createReturnPiciHtml(data){

    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){

            trs+= `
			<tr class="bacth_show" data-inve="${item.inve_id}" >
			<td>${tansferNull(item.batch)}</td>
			<td>${tansferNull(item.now_depot_name)}</td>
			<td>${tansferNull(item.origin_depot_name)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                <input type="number" style="line-height: 40px;" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input return_qty">
            </td>
			<td >${tansferNull(item.unit_name)}</td>
			<td style="padding-top:10px;"><textarea rows="1" cols="20"  class="remark" ></textarea></td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">当前车间</th>
                        <th class="left nowrap tight">目标车间</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                        <th class="left nowrap tight">单位</th>                        
                        <th class="left nowrap tight">退料原因</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}

function showReturnInItem() {
    var ele = $('.storage_blockquote .item_table .t-body');
    $('#operation').hide();
    $('#salere').hide();
    $('#scck').hide();
    $('#rbqty').hide();
    $('#rqty').hide();
    $('#show_qty').hide();
    $('#runit').hide();
    $('#rattr').hide();
    $('#ruturnPici').show();
    ele.html("");
    in_material_arr.forEach(function (item, index) {
        var batchHtml='';
            batchHtml = createReturnPiciHtml(returnMaterialData[item.material_id]);
        var tr = `
            <tr class="material_item" data-material_id="${item.material_id}" data-material_code="${item.material_code}" data-material_name="${item.material_name}" data-send_depot="${item.send_depot}">
            <td></td>
            <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
            <td class="item_no" >${tansferNull(item.item_no)}</td>    
            <td >${tansferNull(item.name)}</td>
            <td class="storage_number">${batchHtml}</td>
            </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);

    })

}
function getworkOrderView(id) {
    AjaxClient.get({
        url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            pickingList=rsp.results;
            if(rsp.results.depot_name){
                $('#storage_wo').val(rsp.results.depot_name+'（'+rsp.results.line_depot_code+'）').data('inputItem',{id:rsp.results.line_depot_id,code:rsp.results.line_depot_code,name:rsp.results.depot_name}).blur();
            }
            $('#wo_number').val(rsp.results.wo_number);
            $('#wt_number').val(rsp.results.wt_number);
            $('#item_no').val(rsp.results.item_no);
            $('#sales_order_code').val(rsp.results.sales_order_code);
            $('#sales_order_project_code').val(rsp.results.sales_order_project_code);
            in_material_arr=JSON.parse(rsp.results.in_material);
            sales_order_code=rsp.results.sales_order_code;
            line_depot_id=rsp.results.line_depot_id;
            sales_order_project_code=rsp.results.sales_order_project_code;
            wo_number=rsp.results.wo_number;
            if(in_material_arr.length>0){
                getMaterialStorage(rsp.results.line_depot_id)
                check_stor_type=2;
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取工单详情失败，请刷新重试', {icon: 5,offset: '250px',time: 1500});
        }
    }, this)
}
function getMaterialStorage(line_depot_id) {
    var material_ids = [];
    in_material_arr.forEach(function (item) {
        material_ids.push(item.material_id);
    });
    AjaxClient.get({
        url: URLS['specialCause'].getMaterialStorage+"?" + _token + "&work_order_id=" + id+"&material_ids="+material_ids+"&sale_order_code="+sales_order_code+"&line_depot_id="+line_depot_id+"&type="+check_stor_type,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            batch=rsp.results;
            if(batch.is_rated_picking==1){
                $("#showMESPicking").show();
                $("#showMESPicking").html(`<div style="margin-left: 100px;color: red;">已完成MES领料处理，MES领料单号：${batch.mr_code}</div>`);
            }
            showInItem(sales_order_code,sales_order_project_code,in_material_arr,wo_number);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 5,offset: '250px',time: 1500});
        }
    }, this)

}
function bindEvent() {
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        submitPickingList()
    });
    $('body').on('click','#storage_wo_selete .el-select-dropdown-item',function (e) {
        e.stopPropagation();
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';
        line_depot_id=storage_wo;
        if(storage_wo){
            getMaterialStorage(storage_wo)
        }
    });
    //单选按钮点击事件
    $('body').on('click','.choose-push-type',function(e){

        if(in_material_arr.length>0){
            $('.choose-push-type').removeClass('active');
            $(this).addClass('active');
            if(type==2){
                $('.nav-tabs').hide();
                showInItem(sales_order_code,sales_order_project_code,in_material_arr,wo_number);
            }else {

                push_type = $(this).attr('data-push_type');
                if(push_type == 2){
                    $('.save').show();
                    $("#orqty").show();
                    $("#rqty").hide();
                    $('#cause').show();
                    $('#causeRemark').show();
                    check_stor_type = 3;
                    getMaterialStorage(line_depot_id);
                } else {
                    $('.save').hide();
                    $("#orqty").hide();
                    $("#rqty").show();
                    $('#cause').hide();
                    $('#causeRemark').hide();
                    check_stor_type = 2;
                    getMaterialStorage(line_depot_id);

                }

            }
        }
    });

    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
    });
    $('body').on('click','.select',function(e){
        e.stopPropagation();
        showCause($(this).attr('data-id'))
    });
    $('body').on('click','#viewCause .cause_submit',function(e){
        e.stopPropagation();
        layer.close(layerModal);
        var material_id = $("#itemId").val();
        var _ele = $("#material"+material_id);
        _ele.html('');
        $('#practice_table .table_tbody tr').each(function (item) {
            if($(this).find('.el-checkbox_input_check').hasClass('is-checked')){
                let itemc = $(this).data('trData');
                _ele.append(`<div class="cause_item" style="height: 20px;">
                                <div style="display: inline-block;">${itemc.name}-${itemc.description}</div>
                            </div>`);
                _ele.find('.cause_item:last-child').data("spanData",itemc);
            }
        })
    });
}

function showCause(id) {
    var _ele = $("#material"+id),arr_couse = [];

    _ele.find('.cause_item').each(function (item) {
        arr_couse.push($(this).data('spanData').preselection_id)
    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '500px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause">
                    <input type="hidden" id="itemId" value="${id}">
                    <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table id="practice_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">名称</th>
                                    <th class="left nowrap tight">备注</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody"></tbody>
                            </table>
                        </div>
                        <div id="pagenationItem" class="pagenation bottom-page"></div>
                    </div>
                    <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary cause_submit">确定</button>
                    </div>
                </div>
                </form>`,
        success: function (layero, index) {
            getSpecialCauseData(arr_couse)
        }
    })
}
function bindPagenationClickItem(totalData,pageSize,arr_couse){
    $('#pagenationItem').show();
    $('#pagenationItem').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNoItem,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNoItem=api.getCurrent();
            getSpecialCauseData(arr_couse);
        }
    });
}
function getSpecialCauseData(arr_couse){
    $('#practice_table .table_tbody').html('');
    var urlLeft='';

    urlLeft+="&page_no="+pageNoItem+"&page_size="+pageSizeItem;
    AjaxClient.get({
        url: URLS['specialCause'].pageIndex+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtmlItem($('#practice_table .table_tbody'),rsp.results,arr_couse)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSizeItem){
                bindPagenationClickItem(totalData,pageSizeItem);
            }else{
                $('#pagenationItem').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    })
}
function createHtmlItem(ele,data,arr_couse) {
    data.forEach(function (item,index) {
        if(arr_couse.length>0){
            var index_arr = 0;
            arr_couse.forEach(function (itemc,index) {
                if(item.preselection_id==itemc){
                    var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                    index_arr = index+1;
                    ele.append(tr);
                    ele.find('tr:last-child').data("trData",item);
                }
            });
            // console.log(arr_couse.length-1);
            if(index_arr==0){
                var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        }else {
            var tr = ` <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        }

    })
}

function submitPickingList() {
    if(type==2){
        var flag = true;
        var this_batchs = [];
        var $employee=$('#employee');
        var employee='';
			

		// mao  测试
		var ul = $('.el-select-dropdown-list li').length;
		if (ul == 0) {
			employee = $employee.attr('data-id');
		} else {
			employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
				$employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
		}

        $('.table-bordered .t-body .material_item').each(function (k,v) {
            var mater = $(v).data('trData').material_id
            $(v).find('.bacth_show').each(function (key,value) {
                var batch={};
                returnMaterialData[mater].forEach(function (item) {
                    if(item.inve_id==$(value).attr('data-inve')){
                         batch =  item;
                    }
                });
				batch.return_qty = $(value).find('.return_qty').val();
				batch.reason = $(value).find('.remark').val();
				this_batchs.push(batch)
			});
		});
        if(employee==''){
            LayerConfig('fail','请补充责任人！');
        }else {
            var data= {
                employee_id:employee,
                work_order_id:id,
                batches:this_batchs,
                _token:TOKEN
            };
            AjaxClient.post({
                url: URLS['order'].storeWorkShopReturn,
                data:data,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    layer.confirm('退料单创建成功！是否确认退料？', {btn:['确定']},
                        function(index){
                        layer.close(index);
                        AjaxClient.get({
                            url: URLS['order'].RetreatChangestats+'?'+_token+'&material_requisition_id='+rsp.results,
                            dataType: 'json',
                            beforeSend: function () {
                                layerLoading = LayerConfig('load');
                            },
                            success: function (rsp) {
                                layer.close(layerLoading);
                                layer.confirm('退料完成！', {icon: 1, title:'提示',offset: '250px',end:function(){
                                }}, function(index){
                                    layer.close(index);
                                    var historyPsth = '';
                                    var oldUrlArr = JSON.parse(window.oldUrlArr);
                                    for(var i in oldUrlArr){
                                        if(oldUrlArr[i].name=='工单管理'){
                                            historyPsth = oldUrlArr[i].href;
                                        }
                                    }
                                    if(historyPsth!=''){
                                        window.location.href = historyPsth;
                                    }else {
                                        window.history.back();
                                    }
                                });

                            },
                            fail: function (rsp) {
                                layer.close(layerLoading);
                                LayerConfig('fail',rsp.message)
                            }
                        }, this)
                    });

                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('fail',rsp.message)
                }
            }, this)
        }



    }else if(type == 1) {
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:''; var $storage_wo=$('#storage_wo');

        var $employee=$('#employee');
        var employee='';
        var material_arr = [];
        var flag = true,message='';

		// mao  测试
		var ul = $('.el-select-dropdown-list li').length;
		if (ul == 0) {
			employee = $employee.attr('data-id');
		} else {
			employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
				$employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
		}

        $('.table-bordered .t-body .material_item').each(function (k,v) {
            var num = 0;
            var this_batchs = []
            $(v).find('.bacth_show').each(function (key,value) {
                if(Number($(value).find('.storage_number').text())*1000 >= Number($(value).find('.actual_receive_qty').val())*1000){

                    if($(value).find('.actual_receive_qty').val()!=''){
                        num += Number($(value).find('.actual_receive_qty').val());
                        this_batchs.push({
                            inve_id:$(value).attr('data-inve'),
                            batch_qty:$(value).find('.actual_receive_qty').val(),
                            depot_code:$(value).find('.depot_code').text(),
                            depot_id:$(value).find('.depot_code').attr('data-id'),
                            batch:$(value).find('.item_batch').text(),
                            unit_name:$(value).find('.unit_name').text(),
                            unit_id:$(value).find('.unit_name').attr('data-id'),
                        })
                    }

                }else {
                    message=$(v).find('.item_no').text()+"的物料的"+$(value).find('.item_batch').text()+"批次的数量不足！"
                    flag = false;
                    return false;
                }
            });
            if(flag){
                if(num.toFixed(1)*1000 > Number($(v).find('.material_qty').text()).toFixed(1)*1000){
                    message=$(v).find('.item_no').text()+"的物料超领！"
                    flag = false;
                    return false;
                }else if(num.toFixed(1)*1000 < Number($(v).find('.material_qty').text()).toFixed(1)*1000){
                    message=$(v).find('.item_no').text()+"的物料领料数量不足！"
                    flag = false;
                    return false;
                }else {
                    if(this_batchs.length>0){
                        material_arr.push({
                            material_id:$(v).attr('data-material')?$(v).attr('data-material'):'',
                            rated_qty:$(v).find('.material_qty').text()?$(v).find('.material_qty').text():'',
                            demand_qty:$(v).find('.material_qty').text()?$(v).find('.material_qty').text():'',
                            unit_id:$(v).attr('data-bom_unit')?$(v).attr('data-bom_unit'):'',
                            send_depot:$(v).find('.LGFSB').text(),
                            produce_depot:$(v).find('.LGPRO').text(),
                            special_stock:$(v).attr('data-special_stock')?$(v).attr('data-special_stock'):'',
                            batches:this_batchs
                        });
                    }else {
                        message=$(v).find('.item_no').text()+"的物料未领！"
                        flag = false;
                        return false;
                    }
                }

            }else {
                flag = false;
                return false;
            }


        });

        if(storage_wo==''){
            LayerConfig('fail','请补充需求库存地点!');
        }
        else if(employee==''){
            LayerConfig('fail','请补充责任人！');
        }
        else if(!flag){
            LayerConfig('fail',message);
        }
        else if(material_arr.length==0){
            LayerConfig('fail','请不要生成空料单！');
        }
        else {
            if(flag){
                if(material_arr.length==0){
                    LayerConfig('fail','物料信息不全！');
                }else {
                    var data= {
                        employee_id:employee,
                        factory_id:pickingList.factory_id,
                        line_depot_id:storage_wo,
                        workbench_id:pickingList.work_shift_id,
                        materials:material_arr,
                        work_order_id:pickingList.work_order_id,
                        wo_number:tansferNull($('#wo_number').val()),
                        wt_number:tansferNull($('#wt_number').val()),
                        sales_order_code:tansferNull($('#sales_order_code').val()),
                        push_type:push_type,
                        sales_order_project_code:tansferNull($('#sales_order_project_code').val()),
                        type:type,
                        _token:TOKEN
                    };
                    AjaxClient.post({
                        url: URLS['order'].storeWorkShop,
                        data:data,
                        dataType: 'json',
                        beforeSend: function () {
                            layerLoading = LayerConfig('load');
                        },
                        success: function (rsp) {
                            layer.close(layerLoading);
                            layer.confirm('领料单创建成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
                            }}, function(index){
                                layer.close(index);
                                var historyPsth = '';
                                var oldUrlArr = JSON.parse(window.oldUrlArr);
                                for(var i in oldUrlArr){
                                    if(oldUrlArr[i].name=='工单管理'){
                                        historyPsth = oldUrlArr[i].href;
                                    }
                                }
                                if(historyPsth!=''){
                                    window.location.href = historyPsth;
                                }else {
                                    window.history.back();
                                }
                            });

                        },
                        fail: function (rsp) {
                            layer.close(layerLoading);
                            LayerConfig('fail',rsp.message)
                        }
                    }, this)
                }
            }
        }
    }else if(type == 7) {
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:''; var $storage_wo=$('#storage_wo');

        var $employee=$('#employee');
        var employee='';
        var material_arr = [];
        var flag = true,message='';

        var date = $('#chooseTime').val();


		// mao  测试
		var ul = $('.el-select-dropdown-list li').length;
		if (ul == 0) {
			employee = $employee.attr('data-id');
		} else {
			employee = $employee.data('inputItem') == undefined || $employee.data('inputItem') == '' ? '' :
				$employee.data('inputItem').name == $employee.val().replace(/\（.*?）/g, "").trim() ? $employee.data('inputItem').id : '';
		}

        $('.table-bordered .t-body .material_item').each(function (k,v) {
            var num = 0;
            var this_batchs = []
            $(v).find('.bacth_show').each(function (key,value) {
                if(Number($(value).find('.storage_number').text())*1000 >= Number($(value).find('.actual_receive_qty').val())*1000){

                    if($(value).find('.actual_receive_qty').val()!=''){
                        num += Number($(value).find('.actual_receive_qty').val());
                        this_batchs.push({
                            inve_id:$(value).attr('data-inve'),
                            batch_qty:$(value).find('.actual_receive_qty').val(),
                            depot_code:$(value).find('.depot_code').text(),
                            depot_id:$(value).find('.depot_code').attr('data-id'),
                            batch:$(value).find('.item_batch').text(),
                            unit_name:$(value).find('.unit_name').text(),
                            unit_id:$(value).find('.unit_name').attr('data-id'),
                        })
                    }

                }else {
                    message=$(v).find('.item_no').text()+"的物料的"+$(value).find('.item_batch').text()+"批次的数量不足！"
                    flag = false;
                    return false;
                }
            });
            if(flag){
                if(num.toFixed(1)*1000 > Number($(v).find('.material_qty').text()).toFixed(1)*1000){
                    message=$(v).find('.item_no').text()+"的物料超领！"
                    flag = false;
                    return false;
                }else {
                    if(this_batchs.length>0){
                        var _ele = $("#material"+$(v).attr('data-material')),arr_cause = [];
                        _ele.find('.cause_item').each(function (item) {
                            arr_cause.push($(this).data('spanData').preselection_id);
                        });
                        material_arr.push({
                            material_id:$(v).attr('data-material')?$(v).attr('data-material'):'',
                            demand_qty:$(v).find('.material_qty').text()?$(v).find('.material_qty').text():'',
                            unit_id:$(v).attr('data-bom_unit')?$(v).attr('data-bom_unit'):'',
                            send_depot:$(v).find('.LGFSB').text(),
                            produce_depot:$(v).find('.LGPRO').text(),
                            reason:arr_cause.join(),
                            remark:$(v).find('.remark').val()?$(v).find('.remark').val():'',
                            special_stock:$(v).attr('data-special_stock')?$(v).attr('data-special_stock'):'',
                            batches:this_batchs
                        });
                    }
                }

            }else {
                flag = false;
                return false;
            }


        });

        if(storage_wo==''){
            LayerConfig('fail','请补充需求库存地点!');
        }
        else if(!date){
            layer.confirm('请补全配送时间！', {icon: 3, title:'提示',offset: '250px',end:function(){
            }}, function(index){
                layer.close(index);
            });
        }
        else if(!flag){
            LayerConfig('fail',message);
        }
        else if(material_arr.length==0){
            LayerConfig('fail','请不要生成空料单！');
        }
        else {
            if(flag){
                if(material_arr.length==0){
                    LayerConfig('fail','物料信息不全！');
                }else {
                    var data= {
                        employee_id:employee,
                        factory_id:pickingList.factory_id,
                        line_depot_id:storage_wo,
                        workbench_id:pickingList.work_shift_id,
                        materials:material_arr,
                        date:(new Date(date).getTime())/1000,
                        work_order_id:pickingList.work_order_id,
                        wo_number:tansferNull($('#wo_number').val()),
                        wt_number:tansferNull($('#wt_number').val()),
                        sales_order_code:tansferNull($('#sales_order_code').val()),
                        push_type:push_type,
                        sales_order_project_code:tansferNull($('#sales_order_project_code').val()),
                        type:type,
                        _token:TOKEN
                    };
                    AjaxClient.post({
                        url: URLS['order'].storeWorkShop,
                        data:data,
                        dataType: 'json',
                        beforeSend: function () {
                            layerLoading = LayerConfig('load');
                        },
                        success: function (rsp) {
                            layer.close(layerLoading);
                            layer.confirm('补料单创建成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
                            }}, function(index){
                                layer.close(index);
                                var historyPsth = '';
                                var oldUrlArr = JSON.parse(window.oldUrlArr);
                                for(var i in oldUrlArr){
                                    if(oldUrlArr[i].name=='工单管理'){
                                        historyPsth = oldUrlArr[i].href;
                                    }
                                }
                                console.log(historyPsth);
                                if(historyPsth!=''){
                                    window.location.href = historyPsth;
                                }else {
                                    window.history.back();
                                }
                            });

                        },
                        fail: function (rsp) {
                            layer.close(layerLoading);
                            LayerConfig('fail',rsp.message)
                        }
                    }, this)
                }
            }
        }
    }
}


//进料
function showInItem(code,line,data,wo_number) {

    if(type==1){
        $('#chooseType').text('车间领料');
        if(push_type==2){
            var ele = $('.storage_blockquote .item_table .t-body');
            $('#show_qty').hide();
            $('#operation').show();
            ele.html("");
            data.forEach(function (item, index) {
                var tempt = item.material_attributes;
                var batchHtml='';
                batchHtml = createPiciHtml(batch.materials[item.material_id],item.qty);

                if((batch.lzps[item.material_id]).is_lzp == 0){
                    return;
                }
                var inattrs = '';
                tempt.forEach(function (item) {
                    inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
                })
                var tr = `
                        <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                        <td></td>
                        <td>
                            ${item.special_stock=='E'?`<div>
                                <p>销售订单号：${code}</p>
                                <p>行项目号：${line}</p>
                            </div>`:''}
                        </td>
                        <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                        <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                        <td class="item_no" >${tansferNull(item.item_no)}</td>
                        <td >${tansferNull(item.name)}</td>
                        <td class="material_qty">${tansferNull(item.qty)}</td>
                        <td class="storage_number" >${batchHtml}</td>
                        <td >${tansferNull(item.bom_commercial)}</td>
                        <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                        <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
                        </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData", data);

            })
        }else {
            var ele = $('.storage_blockquote .item_table .t-body');
            $('#show_qty').hide();
            $('#operation').hide();
            ele.html("");
            var height=0;
            data.forEach(function (item, index) {
                var manumber = item.qty;
                var tempt = item.material_attributes;
                var batchHtml='',is_ready=true;
                if(batch){

                    if(batch.materials[item.material_id]){
                        var num=0;
                        batch.materials[item.material_id].forEach(function (nitem) {
                            num += Number(nitem.storage_number);
                        })
                        if(num<manumber){
                            is_ready=false;
                        }
                    }else {
                        is_ready=false;
                    }
                }else {
                    is_ready=false;
                }
                if(batch){
                    batchHtml = createPiciHtml(batch.materials[item.material_id],item.qty,is_ready);
                }
                var inattrs = '';
                tempt.forEach(function (item) {
                    inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
                })
                var tr = `
                <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}"   data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                <td>${!is_ready?`<i style="color: red;" class="fa fa-exclamation-circle fa-3x"></i>`:''}</td>
                <td>
                    ${item.special_stock=='E'?`<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>`:''}
                </td>
                <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                <td class="item_no" >${tansferNull(item.item_no)}</td>    
                <td width="200px;">${tansferNull(item.name)}</td>
                <td class="material_qty">${tansferNull(item.qty)}</td>
                <td class="storage_number">${batchHtml}</td>
                <td >${tansferNull(item.bom_commercial)}</td>
	            <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                </tr>`;
                ele.append(tr);
                if(!is_ready){
                    if(height == 0 ){
                        height = ele.find('tr:last-child').offset().top
                    }
                }
                ele.find('tr:last-child').data("trData", data);

            });
            $("html,body").animate({scrollTop:height + "px"}, 500);
        }
    }
    if(type ==7){
        $('#chooseType').text('车间补料');
        if(push_type==2){
            var ele = $('.storage_blockquote .item_table .t-body');
            $('#show_qty').hide();
            $('#operation').show();
            ele.html("");
            data.forEach(function (item, index) {
                var tempt = item.material_attributes;
                var batchHtml='';
                batchHtml = createPiciHtml(batch.materials[item.material_id],item.qty);

                if((batch.lzps[item.material_id]).is_lzp == 0){
                    return;
                }
                var inattrs = '';
                tempt.forEach(function (item) {
                    inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
                })
                var tr = `
                        <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}" data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                        <td></td>
                        <td>
                            ${item.special_stock=='E'?`<div>
                                <p>销售订单号：${code}</p>
                                <p>行项目号：${line}</p>
                            </div>`:''}
                        </td>
                        <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                        <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                        <td class="item_no" >${tansferNull(item.item_no)}</td>
                        <td >${tansferNull(item.name)}</td>
                        <td class="material_qty">${tansferNull(item.qty)}</td>
                        <td class="storage_number" >${batchHtml}</td>
                        <td >${tansferNull(item.bom_commercial)}</td>
                        <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                        <td style="padding: 3px;">
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}" class="MKPF_BKTXT" ></div>
                        <button type="button" data-id="${item.material_id}" class="button pop-button select">选择</button>
                        </td>
                        <td>
                            <textarea name="remark" class="remark" id="" cols="15" rows="5" style="line-height: 20px;"></textarea>
                        </td>
                        <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
                        </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData", data);

            })
        } else {
            var ele = $('.storage_blockquote .item_table .t-body');
            $('#show_qty').hide();
            $('#operation').hide();
            ele.html("");
            var height=0;
            data.forEach(function (item, index) {
                var manumber = item.qty;
                var tempt = item.material_attributes;
                var batchHtml='',is_ready=true;
                if(batch){

                    if(batch.materials[item.material_id]){
                        var num=0;
                        batch.materials[item.material_id].forEach(function (nitem) {
                            num += Number(nitem.storage_number);
                        })
                        if(num<manumber){
                            is_ready=false;
                        }
                    }else {
                        is_ready=false;
                    }
                }else {
                    is_ready=false;
                }
                if(batch){
                    batchHtml = createPiciHtml(batch.materials[item.material_id],item.qty,is_ready);
                }
                var inattrs = '';
                tempt.forEach(function (item) {
                    inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
                })
                var tr = `
                <tr class="material_item" data-material="${item.material_id}" data-bom_unit="${item.bom_unit_id}" data-unit="${item.unit_id}"   data-special_stock="${item.special_stock}" data-storage_number="${item.storage_number}">
                <td>${!is_ready?`<i style="color: red;" class="fa fa-exclamation-circle fa-3x"></i>`:''}</td>
                <td>
                    ${item.special_stock=='E'?`<div>
                        <p>销售订单号：${code}</p>
                        <p>行项目号：${line}</p>
                    </div>`:''}
                </td>
                <td class="LGFSB" >${tansferNull(item.LGFSB)}</td>
                <td class="LGPRO" >${tansferNull(item.LGPRO)}</td>
                <td class="item_no" >${tansferNull(item.item_no)}</td>    
                <td width="200px;">${tansferNull(item.name)}</td>
                <td class="material_qty">${tansferNull(item.qty)}</td>
                <td class="storage_number">${batchHtml}</td>
                <td >${tansferNull(item.bom_commercial)}</td>
	            <td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
                </tr>`;
                ele.append(tr);
                if(!is_ready){
                    if(height == 0 ){
                        height = ele.find('tr:last-child').offset().top
                    }
                }
                ele.find('tr:last-child').data("trData", data);

            });
            $("html,body").animate({scrollTop:height + "px"}, 500);
        }
    }
}

function createPiciHtml(data,qty,is_ready){
    if(type==1 || type==7){
        var trs='';
        if(data&&data.length){
            data.forEach(function(item,index){
                trs+= `
			<tr class="bacth_show" data-inve="${item.inve_id}">
			<td>${tansferNull(item.factory_code)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td class="depot_code" data-id="${item.depot_id}">${tansferNull(item.depot_code)}</td>
			<td>${tansferNull(item.depot_name)}</td>
			<td class="item_batch">${tansferNull(item.batch)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                ${push_type==2?`<input type="number" style="line-height: 40px;" min="0"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"   class="el-input actual_receive_qty"   value="${(data.length == 1&&type==1) ? tansferNull(qty) : ''}">`:''}
            </td>
            <td class="unit_name" data-id="${item.unit_id}">${tansferNull(item.unit_name)}</td>
			</tr>
			`;
            })
        }else{
            trs='<tr><td colspan="9" class="center">暂无数据</td></tr>';
        }
        var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工厂名称</th>
                        <th class="left nowrap tight">仓库</th>
                        <th class="left nowrap tight">仓库名称</th>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                        <th class="left nowrap tight">单位</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
        return thtml;
    }else {
        var trs='';
        if(data&&data.length){
            data.forEach(function(item,index){
                trs+= `
			<tr class="bacth_show">
			<td class="item_batch">${tansferNull(item.batch)}</td>
			<td class="storage_number">${tansferNull(item.storage_number)}</td>
			<td>
                <input type="number" style="line-height: 40px;" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input actual_receive_qty"   value="${tansferNull(item.actual_receive_qty)}">
            </td>
			
			</tr>
			`;
            })
        }else{
            trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
        }
        var thtml=`<div class="wrap_table_div">
            <table  class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">批次</th>
                        <th class="left nowrap tight">库存数量</th>
                        <th class="left nowrap tight">数量</th>                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
        return thtml;
    }


}
