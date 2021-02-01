var layerModal,
    layerLoading,
    pageNo = 1,
    pageNoPick = 1,
    pageSize = 20,
    choose_arr = [],
    mr_arr = [],
    status_arr=[],
    push_status_arr=[],
    work_order_arr = [],
    ajaxData = {},
    pickAjaxData = {};

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if(ajaxDataStr !== undefined && ajaxDataStr !== ''){
        var ajaxStr = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        if (ajaxDataStr !== undefined && ajaxDataStr !== '' && ajaxStr.hasOwnProperty("tab_type")) {
            try {
                ajaxData = ajaxStr;
                delete ajaxData.pageNo;
                // delete ajaxData.tab_type;
                pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
                $('.el-tap[data-status='+ajaxStr.tab_type+']').addClass('active').siblings('.el-tap').removeClass('active');
                getWorkOrder(ajaxStr.tab_type);
            } catch (e) {
                resetParam();
            }
        }
        if(ajaxDataStr !== undefined && ajaxDataStr !== '' && !ajaxStr.hasOwnProperty("tab_type")){
            try {
                pickAjaxData = ajaxStr;
                delete pickAjaxData.pageNoPick;
                // delete pickAjaxData.tab_type;
                pageNoPick = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNoPick;
                $('.el-tap[data-status=0]').addClass('active').siblings('.el-tap').removeClass('active');
                getPickingList();
            } catch (e) {
                resetParamPick();
            }
        }
    }else {
        getWorkOrder("2");
    }
}
//31:30:00 to DAY +1 07:30:00
function dateToDayTime(val) {
    var dayTime = val.split(":");
    var dayTimeVal;
    if (dayTime[0] / 24 >= 1) {
        dayTimeVal = "DAY +" + Math.floor(dayTime[0] / 24) + ((dayTime[0] % 24) < 10 ? " 0" + dayTime[0] % 24 : " " + dayTime[0] % 24) + ":" + dayTime[1] + ":" + dayTime[2];
    } else {
        dayTimeVal = val;
    }
    return dayTimeVal;
}
//获取班次
function getRankPlan() {
    AjaxClient.get({
        url: URLS['thinPro'].rankPlanList + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').html('');
            var lis = '', innerHtml = '';
            lis = `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>`;
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    var workStartTimeVal = dateToDayTime(item.from);
                    var workEndTimeVal = dateToDayTime(item.to);
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.type_name}  ${workStartTimeVal}~${workEndTimeVal}</li>`;
                });
                innerHtml = `${lis}`;
                $('.el-form-item.select_rank_plan').find('.el-select-dropdown-list').append(innerHtml);
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取班次列表失败！', { icon: 5, offset: '250px', time: 1500 });
        }
    })
}

//重置搜索参数
function resetParamPick(){
    pickAjaxData={
        code: '',
        work_order_code: '',
        product_order_code: '',
        employee_id  : '',
        line_depot_id: '',
        send_depot: '',
        status: '',
        factory_id:'',
        send_start_time:'',
        send_end_time:'',
        sales_order_code:'',
        sales_order_project_code:'',
        out_material_code:'',
        order: 'desc',
        sort: 'id'
    };
}

$(function () {
    resetParam();
    resetParamPick();
    setAjaxData();
    bindEvent();
});

function laydateRender(date='') {
    //日期时间选择器
    if(date!=''){
        laydate.render({
            elem: '#work_station_time',
            type: 'date',
            value: date
            // , range: true
        });
    }else {
        laydate.render({
            elem: '#work_station_time',
            type: 'date',
            // , range: true
        });
    }

}

function bindPagenationClick(totalData, pageSize) {
    $('#pagenationfineProduce').show();
    $('#pagenationfineProduce').pagination({
        totalData: totalData,
        showData: pageSize,
        current: pageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNo = api.getCurrent();
            var status = $('.el-tap.active').attr('data-status');
            getWorkOrder(status);
        }
    });
}
function bindPagenationClickPick(totalData, pageSize) {
    $('#pagenationunpro').show();
    $('#pagenationunpro').pagination({
        totalData: totalData,
        showData: pageSize,
        current: pageNoPick,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNoPick = api.getCurrent();
            getPickingList();
        }
    });
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        work_order_number: '',
        work_task_number: '',
        workbench_name: '',
        production_order_number: '',
        sales_order_code: '',
        sales_order_project_code: '',
        inspur_sales_order_code: '',
        inspur_material_code: '',
        schedule: '',
        picking_status: '',
        send_status: '',
        rankplan: '',
        order: 'desc',
        sort: 'id'
    };
}

//获工单排列表
function getWorkOrder(status) {
    var urlLeft = '';
    choose_arr = [];
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
    AjaxClient.get({
        url: URLS['order'].workOrderList + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var type = $('.el-tap.active').attr('data-status');
            ajaxData.tab_type = type;
            ajaxData.pageNo = pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData = rsp.paging.total_records;
            work_order_arr = [];
            work_order_arr = rsp.results;
            var _schtml = createFineProducedHtml(rsp);
            var _html = `<div class="searchItem" id="searchForm">
            <form class="searchSTallo searchModal formModal" autocomplete="off" id="searchSTallo_from">
            <div class="el-item">
              <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                            <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                        </div>
                    </div>
                    <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                              <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
                          </div>
                      </div>
                    
                </div>
                <ul class="el-item-hide">
                  <li>
                      <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                <input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单号" value="">
                            </div>
                        </div>
                      <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">工单号</label>
                              <input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
                          </div>
                      </div>
                      
                  </li>
                  <li>
                      <div class="el-form-item work_shift_name">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">工位号</label>
                              <input type="text" id="work_shift_name" class="el-input" placeholder="请输入工位号" value="">
                          </div>
                      </div>
                      <div class="el-form-item select_rank_plan">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">&nbsp;&nbsp;班次</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                        <input type="hidden" class="val_id" id="rankplan" value=""/>
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 100px;"></p>
                        </div>
                  </li>
                  <li>
                      <div class="el-form-item work_station_time">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">计划日期</label>
                              <input type="text" style="background-color: #fff !important;" id="work_station_time" readonly class="el-input" placeholder="请输入计划日期" value="">
                          </div>
                      </div>
                      <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">工单状态</label>
                              <div class="el-select-dropdown-wrap">
                                  <div class="el-select schedule">
                                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                      <input type="hidden" class="val_id" id="schedule" value="">
                                  </div>
                                  <div class="el-select-dropdown" style="display: none;">
                                      <ul class="el-select-dropdown-list">
                                          <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                          <li data-id="0" class=" el-select-dropdown-item">未开始</li>
                                          <li data-id="1" class=" el-select-dropdown-item">进行中</li>
                                          <li data-id="2" class=" el-select-dropdown-item">已完工</li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </li>
                    <li>
                        <div class="el-form-item work_shift_name">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">浪潮销售订单号</label>
                                <input type="text" id="inspur_sales_order_code" class="el-input" placeholder="请输入浪潮销售订单号" value="">
                            </div>
                        </div>
                        <div class="el-form-item work_shift_name">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">浪潮物料号</label>
                                <input type="text" id="inspur_material_code" class="el-input" placeholder="请输入浪潮物料号" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                       <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">领料状态</label>
                              <div class="el-select-dropdown-wrap">
                                  <div class="el-select schedule">
                                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                      <input type="hidden" class="val_id" id="picking_status" value="">
                                  </div>
                                  <div class="el-select-dropdown" style="display: none;">
                                      <ul class="el-select-dropdown-list">
                                          <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                          <li data-id="0" class=" el-select-dropdown-item">未领</li>
                                          <li data-id="1" class=" el-select-dropdown-item">领料中</li>
                                          <li data-id="2" class=" el-select-dropdown-item">已领</li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">SAP发料状态</label>
                              <div class="el-select-dropdown-wrap">
                                  <div class="el-select schedule">
                                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                      <input type="hidden" class="val_id" id="send_status" value="">
                                  </div>
                                  <div class="el-select-dropdown" style="display: none;">
                                      <ul class="el-select-dropdown-list">
                                          <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                          <li data-id="0" class=" el-select-dropdown-item">未发</li>
                                          <li data-id="1" class=" el-select-dropdown-item">少发</li>
                                          <li data-id="2" class=" el-select-dropdown-item">正常</li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                    </li>
                </ul>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                    <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                    <button type="button" class="el-button el-button--primary submitWork" data-item="Unproduced_from">搜索</button>
                    <button type="button" class="el-button resetWork">重置</button>
                    <button type="button" class="el-button" id="combine">合并领料</button>
                </div>
            </div>
            </div>
        </form>
        </div>
        <div class="table_page">
            ${_schtml}
        </div>`
            $('.el-panel-wrap').html(_html);

			if (rsp.paging.total_records < 20) {
				$('#total').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
			} else {
				$('#total').css('display', 'none').text(' ');
			}


            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenationfineProduce').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取调拨单列表失败，请刷新重试', 9);
        },
        complete: function () {
            getRankPlan();
            $('#searchForm .submit').removeClass('is-disabled');
            //更多搜索条件下拉
            $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
                e.stopPropagation();
                $(this).find('.el-icon').toggleClass('is-reverse');
                var that = $(this);
                that.addClass('noclick');
                if ($(this).find('.el-icon').hasClass('is-reverse')) {
                    $('#searchForm .el-item-show').css('background', '#e2eff7');
                    $('#searchForm .el-item-hide').slideDown(400, function () {
                        that.removeClass('noclick');
                    });
                } else {
                    $('#searchForm .el-item-hide').slideUp(400, function () {
                        $('#searchForm .el-item-show').css('background', 'transparent');
                        that.removeClass('noclick');
                    });
                }
            });
            var ajaxDataStr = window.location.hash;
            if(ajaxDataStr !== undefined && ajaxDataStr !== ''){
                var ajaxStr = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
                $("#sales_order_code").val(tansferNull(decodeURI(ajaxStr.sales_order_code)))
                $("#inspur_material_code").val(tansferNull(decodeURI(ajaxStr.inspur_material_code)))
                $("#inspur_sales_order_code").val(tansferNull(decodeURI(ajaxStr.inspur_sales_order_code)))
                $("#sales_order_project_code").val(tansferNull(decodeURI(ajaxStr.sales_order_project_code)))
                $("#production_order_number").val(tansferNull(decodeURI(ajaxStr.production_order_number)))
                $("#work_order_number").val(tansferNull(decodeURI(ajaxStr.work_order_number)))
                $("#work_shift_name").val(tansferNull(decodeURI(ajaxStr.workbench_name)))
                $("#work_task_number").val(tansferNull(decodeURI(ajaxStr.work_task_number)))
                if(ajaxStr.schedule.length>0){
                    $("#schedule").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.schedule+']').click()
                }
                if(ajaxStr.picking_status.length>0){
                    $("#picking_status").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.picking_status+']').click()
                }
                if(ajaxStr.send_status.length>0){
                    $("#send_status").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.send_status+']').click()
                }
                if(ajaxStr.rankplan.length>0){
                    setTimeout(function () {
                        $("#rankplan").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.rankplan+']').click()
                    },1000)
                }
                if(ajaxStr.daytime){
                    laydateRender(formatDate(ajaxStr.daytime));
                }else {
                    laydateRender();
                }
            }

        }
    }, this)
}

function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
//获取领料列表数据
function getPickingList(){
    var urlLeft='';
    for(var param in pickAjaxData){
        urlLeft+=`&${param}=${pickAjaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNoPick+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].getSapMergerPickingList+"?"+_token+urlLeft,
        dataType: 'json',
        cache:false,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // if(layerModal!=undefined){
            //     layerLoading = LayerConfig('load');
            // }
            mr_arr=[];
            status_arr=[];
            push_status_arr=[];
            var type = $('.el-tap.active').attr('data-status');
            ajaxData.tab_type = type;
            pickAjaxData.pageNoPick = pageNoPick;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(pickAjaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            var _schtml = `<div class="searchItem" id="searchForm">
                <form class="searchSTallo searchModal formModal" id="searchSTallo_from" autocomplete="off">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                        <input type="text" id="product_order_code" class="el-input" placeholder="请输入生产订单号" value="">
                                    </div>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工单号</label>
                                        <input type="text" id="work_order_code" class="el-input" placeholder="请输入工单号" value="">
                                    </div>
                                </div>
                            </div>
                            <ul class="el-item-hide">
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                                            <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                                        </div>
                                    </div>
    
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">销售行项号</label>
                                            <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售行项号" value="">
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">单号</label>
                                            <input type="text" id="code" class="el-input" placeholder="请输入单号" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">发料仓</label>
                                            <input type="text" id="send_depot" class="el-input" placeholder="请输入发料仓" value="">
                                        </div>
                                    </div>
                                    
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">状态</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="status" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list" id="show_status">
                                                        <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                        <li data-id="1" class=" el-select-dropdown-item">未发送</li>
                                                        <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                                                        <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                                                        <li data-id="4" class=" el-select-dropdown-item">完成</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="el-form-item" id="storage_wo_selete">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">线边库</label>
                                            <div class="el-select-dropdown-wrap">
                                                <input type="text" id="storage_wo" class="el-input" placeholder="请输入线边库" value="">
                                            </div>
                                        </div>
                                        <p class="errorMessage" style="padding-left: 30px;"></p>
                                    </div>
                                </li>
                               
                                <li>
                                    <div class="el-form-item" id="storage_wo_selete">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">责任人</label>
                                            <div class="el-select-dropdown-wrap">
                                                <input type="text" id="employee" class="el-input" placeholder="请输入责任人" value="">
                                            </div>
                                        </div>
                                        <p class="errorMessage" style="padding-left: 30px;"></p>
                                    </div>
                                    
                                    <div class="el-form-item abilitySelect">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">工厂</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="factory_id" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item" style="width: 100%;">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">配送时间</label>
                                            <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                            <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">出料</label>
                                            <input type="text" id="out_material_code" class="el-input" placeholder="请输入出料" value="">
                                        </div>
                                        <p class="errorMessage" style="padding-left: 30px;"></p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                <button type="button" class="el-button el-button--primary submitPick" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button resetPick">重置</button>
                                <button type="button" class="el-button export"><a href="" id="exportExcel">导出</a></button>
                                <button type="button" class="el-button print_all">打印</button>
                                <button type="button" class="el-button push_all">一键推送</button>
                                <button type="button" class="el-button storage_all">一键入库</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="table_page">
                ${_html}
            </div>`;
			$('.el-panel-wrap').html(_schtml);
			
			if (rsp.paging.total_records < 20) {
				$('#total_hb').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
			} else {
				$('#total_hb').css('display', 'none').text(' ');
			}

            if(totalData>pageSize){
                bindPagenationClickPick(totalData,pageSize);
            }else{
                $('#pagenationunpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',16);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
            //更多搜索条件下拉
            getDeplants('');
            $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
                e.stopPropagation();
                $(this).find('.el-icon').toggleClass('is-reverse');
                var that = $(this);
                that.addClass('noclick');
                if ($(this).find('.el-icon').hasClass('is-reverse')) {
                    $('#searchForm .el-item-show').css('background', '#e2eff7');
                    $('#searchForm .el-item-hide').slideDown(400, function () {
                        that.removeClass('noclick');
                    });
                } else {
                    $('#searchForm .el-item-hide').slideUp(400, function () {
                        $('#searchForm .el-item-show').css('background', 'transparent');
                        that.removeClass('noclick');
                    });
                }
            });
            $('#storage_wo').autocomplete({
                url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
                param:'depot_name'
            });

            $('#employee').autocomplete({
                url: URLS['work'].judge_person+"?"+_token+"&page_no=1&page_size=10",
                param:'name'
            });
            $('#start_time').on('click', function (e) {
                e.stopPropagation();
                var that = $(this);
                var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
                start_time = laydate.render({
                    elem: '#start_time_input',
                    max: max,
                    type: 'datetime',
                    show: true,
                    closeStop: '#start_time',
                    done: function (value, date, endDate) {
                        that.val(value);
                    }
                });
            });
            $('#end_time').on('click', function (e) {
                e.stopPropagation();
                var that = $(this);
                var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
                end_time = laydate.render({
                    elem: '#end_time_input',
                    min: min,
                    max: getCurrentDate(),
                    type: 'datetime',
                    show: true,
                    closeStop: '#end_time',
                    done: function (value, date, endDate) {
                        that.val(value);
                    }
                });
            });

            var ajaxDataStr = window.location.hash;
            if(ajaxDataStr !== undefined && ajaxDataStr !== ''){
                var ajaxStr = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
                $("#code").val(decodeURI(ajaxStr.code))
                $("#product_order_code").val(decodeURI(ajaxStr.product_order_code))
                $("#work_order_code").val(decodeURI(ajaxStr.work_order_code))
                $("#sales_order_code").val(decodeURI(ajaxStr.sales_order_code))
                $("#sales_order_project_code").val(decodeURI(ajaxStr.sales_order_project_code))
                $("#out_material_code").val(decodeURI(tansferNull(ajaxStr.out_material_code)))
                $("#send_depot").val(decodeURI(ajaxStr.send_depot))
                if(ajaxStr.status.length>0){
                    $("#status").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.status+']').click()
                }
                $('#start_time_input').text(ajaxStr.send_start_time);
                $('#end_time_input').text(ajaxStr.send_end_time);
                $('#start_time').val(ajaxStr.send_start_time);
                $('#end_time').val(ajaxStr.send_end_time);
                if(ajaxStr.line_depot_id>0){
                    $('#storage_wo').val(ajaxStr.line_depot_name+"（"+ajaxStr.line_depot_code+"）").data('inputItem',{id:ajaxStr.line_depot_id,name:ajaxStr.line_depot_name}).blur();
                }
                if(ajaxStr.employee_id>0){
                    $('#employee').val(ajaxStr.employee_name).data('inputItem',{id:ajaxStr.employee_id,name:ajaxStr.employee_name}).blur();
                }
                if(ajaxStr.factory_id.length>0){
                    setTimeout(function () {
                        $("#factory_id").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.factory_id+']').click()
                    },1000)
                }
            }
        }
    },this)
}

//获取厂区列表
function getDeplants(val) {
    AjaxClient.get({
        url: URLS['picking'].getAllFactory + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var lis = '',
                    innerhtml = '';
                rsp.results.forEach(function (item, index) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                })
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.abilitySelect').find('.el-select-dropdown-list').html(innerhtml);
                if (val.length) {
                    val.forEach(function (item) {
                        $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id=' + item.id + ']').click();

                    })
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取厂区列表失败', {
                icon: 5,
                offset: '250px',
                time: 1500
            });
        }
    }, this);
}
//生成领料列表数据
function createHtml(data){
    var viewurl="/WorkOrder/viewPickingListForAllPicking";
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){
            var so_po_wo_html = ''
            var status=(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status));

            if(item.wo_po.length>0){
                so_po_wo_html = creatSPWHtml(item.wo_po);
            }
      var status=(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status));
      trs+= `
			<tr class="material_item" data-id="${item.material_requisition_id}">
			<td>
			    <span class="el-checkbox_input el-checkbox_input_item" id="check_input_${item.material_requisition_id}" data-id="${item.material_requisition_id}" data-status="${item.status}">
                    <span class="el-checkbox-outset"></span>
                </span>
            </td>
			<td>${tansferNull(item.code)}</td>
			<td>${so_po_wo_html}</td>
			<td style="word-wrap:break-word;word-break:break-all;width: 300px;">${tansferNull(item.material_codes)}</td>
			<td>${tansferNull(item.line_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.bench_no)}</td>
            <td>${tansferNull(item.employee_name)}</td>
			<td style="${item.status==3}">${tansferNull(status)}</td>
			<td>${tansferNull(checkType(item.type))}</td>
			<td>${tansferNull(item.send_depot)}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.dispatch_time)}</td>
			<td>${tansferNull(item.printingcount)}</td>
			<td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>
	         ${(item.status == 2||item.status == 1) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" data-status="${item.status}" class="button pop-button delete">删除</button>`:''}
	         ${(item.push_type==0&&item.status == 4) ?`<!--<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button returnAudit">反审</button>-->`:''}
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="14" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                       <th class="left nowrap tight">
                            <span class="el-checkbox_input el-checkbox_input" id="check_input_item_all" style="table-layout：fixed">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">合并信息</th>
                        <th class="left nowrap tight">合并物料</th>
                        <th class="left nowrap tight">车间</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">配送时间</th>
                        <th class="left nowrap tight">打印次数</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
		</div>
		<div id="total_hb" style="float:right; display:none;" ></div>
        <div id="pagenationunpro" class="pagenation unpro"></div>`;
    return thtml;
}

//生成工单列表数据
function createFineProducedHtml(data) {
    var work_order_ids = sessionStorage.getItem('work_order_ids')!=null?JSON.parse(sessionStorage.getItem('work_order_ids')):[];
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {
            var checkedHtml = '';
            if(work_order_ids.indexOf((item.work_order_id).toString())>-1){
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check is-checked" data-id="${item.work_order_id}">
                <span class="el-checkbox-outset"></span>
            </span>`;
            }else {
                checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" data-id="${item.work_order_id}">
                <span class="el-checkbox-outset"></span>
            </span>`;
            }

            var routChangeHtml = '',changeFactoryHtml='';
            if (item.version_change == 1) {
                routChangeHtml = `<button type="button" class="el-button version-change" data-oldVersion="${item.old_version}" data-newVersion="${item.new_version}" data-desc="${item.new_version_description}"  style="color: #FF0000;cursor: pointer;padding: 4px; font-weight: bold;">工艺变更</button>`;
            }
            if (item.WERKS) {
              changeFactoryHtml = `<button type="button" class="el-button" style="color: #20a0ff;cursor: pointer;padding: 4px; font-weight: bold;">转厂</button>`;
            }

            trs += `
			<tr>
            <td>${checkedHtml}</td>
            <td>${routChangeHtml}</td>
            <td>${changeFactoryHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td width="200px;">${tansferNull(item.name)}</td>
			<td>${tansferNull(item.qty)}</td>            
			<td>${tansferNull(item.work_center)}</td>            
            <td>${tansferNull(item.workbench_name)}</td>            
			<td>${tansferNull(item.factory_name)}</td>
			<td>${tansferNull(item.work_station_time)}</td>
			<td>${tansferNull(item.total_workhour)}[s]</td>
			<td>${tansferNull(item.inspur_sales_order_code)}</td>
			<td>${tansferNull(item.inspur_material_code)}</td>
			<td>${tansferNull(item.on_off==0?'订单关闭':'订单开启')}</td>
			<td>${tansferNull((Number(item.schedule)*100).toFixed(2))}%</td>
			<td>${tansferNull(item.picking_status==0?'未领':item.picking_status==1?'领料中':item.picking_status==2?'已领':'')}</td>
			<td style="color: ${item.send_status==1?'red':''}">${tansferNull(item.is_sap_picking==0?'':item.send_status==0?'未发':item.send_status==1?'少发':item.send_status==2?'正常':item.send_status==3?'超发':'')}</td>
			<td class="showStatus center" id="showStatus${item.work_order_id}" style="display: none;"></td>
			
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="19" style="text-align:center">暂无数据</td></tr>';
    }
    var thtml = `<div id="clearHeight" class="wrap_table_div">
            <table id="worker_order_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">
                    <span class="el-checkbox_input" id="check_input_all">
                        <span class="el-checkbox-outset"></span>
                    </span>
                    </th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight" width="200px;">产成品</th>
                    <th class="left nowrap tight">数量</th>
                    <th class="left nowrap tight">工作中心</th>
                    <th class="left nowrap tight">工位号</th>
                    <th class="left nowrap tight">工厂</th>
                    <th class="left nowrap tight">计划日期</th>
                    <th class="left nowrap tight">工时</th>
                    <th class="left nowrap tight">浪潮销售订单号</th>
                    <th class="left nowrap tight">浪潮物料号</th>
                    <th class="left nowrap tight">订单状态</th>
                    <th class="left nowrap tight">工单状态</th>
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th>
                    <!--<th class="left nowrap tight">状态</th>-->
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted">${trs}</tbody>
            </table>
		</div>
		<div id="total" style="float:right; display:none;" ></div>
        <div id="pagenationfineProduce" class="pagenation fineProduce" style="margin-top: 5px;"></div>`;
    $('#showPickingList').show();
    sessionStorage.removeItem('work_order_ids');
    return thtml;
}
function creatSPWHtml(data){

    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){

            trs+= `
			<tr >
			<td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.out_material_code)}</td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="4" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable" style="border: 1px solid #ccc;">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号/行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">出料</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>`
    return thtml;
}
function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未发送';
            break;
        case 2:
            return '已推送';
            break;
        case 3:
            return '待入库';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch (status) {
        case 1:
            return '待推送';
            break;
        case 2:
            return '进行中';
            break;
        case 3:
            return '待出库';
            break;
        case 4:
            return '完成';
            break;
        case 5:
            return '反审完成';
            break;
        default:
            break;
    }
}
function checkType(type) {
    switch(type)
    {
        case 1:
            return '领料';
            break;
        case 2:
            return '退料';
            break;
        case 7:
            return '补料';
            break;
        default:
            break;
    }
}

function showPrintList(formDate) {
    var materialsArr = [];
    var type_string = formDate.type == 1 ? '领料' : formDate.type == 2 ? '退料' : formDate.type == 7 ? '补料' : '';
    if (formDate.materials.length > 0) {
        materialsArr = formDate.materials;
        var newObj = {
            one:[],
            two:[],
            three:[]
        };
        materialsArr.forEach(function (item) {
            if(item.material_code.substr(0,4)=="6105" || item.material_code.substr(0,2)=="99"){
                newObj.one.push(item);
            }else if(item.material_code.substr(0,4)=="6113"){
                newObj.two.push(item)
            }else {
                newObj.three.push(item)
            }
        })
        var plan_start_time = formDate.ctime,
            employee_name = formDate.employee_name,
            send_depot = formDate.send_depot,
            line_depot_name = formDate.line_depot_name,
            product_order_code = formDate.product_order_code,
            work_order_code = formDate.work_order_code,
            cn_name = formDate.cn_name,
            workbench_name = formDate.bench_no,
            sales_order_code = formDate.sales_order_code,
            sales_order_project_code = formDate.sales_order_project_code,
            dispatch_time = formDate.dispatch_time,
            code = formDate.code;
        var tootle = Math.ceil(newObj.one.length / 3)+Math.ceil(newObj.two.length / 3)+Math.ceil(newObj.three.length / 3);
        var index = 1;
        for(var j in newObj){
            for (var i = 0; i < newObj[j].length;i = i + 3) {
                var _table = `<table style="table-layout：fixed" class="show_border">
                        <thead>
                            <tr>
                                <th style="height: 30px;width:100px;">物料编码</th>
                                <th style="height: 30px;">销售订单行项</th>
                                <th style="width:100px;">浪潮编码</th>
                                <th  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">物料名称</th>
                                <th>SAP需求数量</th>
                                <th>需求数量</th>
                                <th>BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].sales_order_project_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].old_material_code}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_demand_qty}${newObj[j][i].sap_demand_unit}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_demand_qty}${tansferNull(newObj[j][i].lc_demand_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].demand_qty}${tansferNull(newObj[j][i].demand_unit)}</td>
                                <td >${newObj[j][i].remark}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? '/'+newObj[j][i + 1].sales_order_project_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_demand_qty+newObj[j][i + 1].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_demand_qty+tansferNull(newObj[j][i + 1].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].demand_qty+tansferNull(newObj[j][i + 1].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].remark : ''}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ?newObj[j][i + 2].sales_order_project_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_demand_qty+newObj[j][i + 2].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_demand_qty+tansferNull(newObj[j][i + 2].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].demand_qty+tansferNull(newObj[j][i + 2].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].remark : ''}</td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
                        </tbody>
                      </table>`
                var print_html = `<div style="page-break-after: always;">
                                <div style="display: flex;">
                                    <div style="flex: 1"></div>
                                    <div style="flex: 9"><h3 style="text-align: center;">梦百合家居科技股份有限公司${type_string}单</h3></div>
                                    <div style="flex: 1">
                                        <p style="margin: 0;font-size: 5px;">白联：仓</p>
                                        <p style="margin: 0;font-size: 5px;">红联：财</p>
                                        <p style="margin: 0;font-size: 5px;">黄联：车</p>
                                        <p style="margin: 0;font-size: 5px;">${index}/${tootle}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}日期:</div>
                                            <div style="flex: 2;">${plan_start_time}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">仓库:</div>
                                            <div style="flex: 2;">${send_depot}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">单据编码:</div>
                                            <div style="flex: 2;">${code}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}部门:</div>
                                            <div style="flex: 2;">${line_depot_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}人:</div>
                                            <div style="flex: 2;">${employee_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">工位:</div>
                                            <div style="flex: 2;">${tansferNull(workbench_name)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">销售订单号/行项号:</div>
                                            <div style="flex: 2;">${sales_order_code}/${sales_order_project_code}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">生产订单号:</div>
                                            <div style="flex: 2;">${product_order_code}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">配送时间:</div>
                                            <div style="flex: 2;">${dispatch_time}</div>
                                        </div>
                                    </div>
                                </div>
                                ${_table}
                                <div>
                                <div style="display: flex;height:40px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">发货人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">制单人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;">${cn_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">审批人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>`;
                index++;
                $('#print_list').append(print_html);
            }
        }

    }

}
function deleteItem(id) {
    AjaxClient.post({
        url: URLS['work'].deleteMergerPicking,
        data:{
            material_requisition_id:id,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','删除成功！',function () {
                getPickingList();
            });


        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function submint(id,type) {
    // var date = tansferNull(datetime.substring(0,10).replace(/-/g,""));
    // var time = tansferNull(datetime.substring(11,19).replace(/:/g,""));
    AjaxClient.get({
        url: URLS['work'].sendSapMergerPicking +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！',function () {
                    getPickingList();
                });

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message)
        }
    }, this)
}




function bindEvent() {
    // 点击工艺变更红标识
    $('body').on('click', '.version-change', function () {
        let desc = $(this).attr('data-desc');
        let oldVersion = $(this).attr('data-oldVersion') + '.0';
        let newVersion = $(this).attr('data-newVersion') + '.0';
        layerModal = layer.open({
            type: 1,
            title: '信息',
            offset: '100px',
            area: ['400px', '300px'],
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: false,
            content: `<form class="viewAttr formModal" style="width: 340px;margin: 0 auto;">
                        <div style="height: 40px;text-align: left;">
                            <span>当前工单版本：</span>
                            ${oldVersion}
                        </div>
                        <div style="height: 40px;text-align: left;">
                            <span>工艺新版本：</span>
                            ${newVersion}
                        </div>
                        <div style="height: 120px;text-align: left;">
                            <span>新版本描述：</span>
                            ${desc}
                        </div>
                    </form>`,
            success: function (layero, index) {
            
            },
            end: function () {
                
            }

        })
    });

    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    //下拉选择
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });

    $('body').on('click', '.el-select', function () {
        if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        } else {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });


    //单选按钮点击事件
    $('body').on('click','#viewattr:not(".disabled") .el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
    //选择领料方式
    $('body').on('click','#viewattr .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#viewattr');
            var type = $('.el-tap.active').attr('data-status');
            var status = parentForm.find('.is-radio-checked .status').val();
            if(status==1){
                var new_work_order = [];
                work_order_arr.forEach(function (item) {
                    if(choose_arr.indexOf(item.work_order_id.toString())!=-1){
                        new_work_order.push(item)
                    }
                });
                var flag = false;
                var wo_number = '';
                new_work_order.forEach(function (item) {
                    if(item.is_special_stock=='1'){
                        flag = true;
                        wo_number = item.wo_number;
                        return false;
                    }
                });
                if(flag){
                    layer.close(layerModal);
                    LayerConfig('fail',wo_number+'工单存在特殊库存，请选择基于销售订单合并！');
                    return false;
                }
                var newArr = removingDuplicateElementsFromArrays(new_work_order,['workbench_id']);
                if(newArr.length==1){
                    if(choose_arr.length>0){
                        AjaxClient.get({
                            url: URLS['order'].checkPicking + _token + "&work_order_ids=" + choose_arr.join(','),
                            dataType: 'json',
                            beforeSend: function () {
                                layerLoading = LayerConfig('load');
                            },
                            success: function (rsp) {
                                layer.close(layerLoading);
                                layer.close(layerModal);
                                var workbench_id = newArr[0].workbench_id;
                                var workbench_name = newArr[0].workbench_name;
                                window.location.href = '/WorkOrder/combineItems?work_order_ids='+choose_arr+'&workbench_id='+workbench_id+'&workbench_name='+workbench_name+'&type='+type;
                            },
                            fail: function (rsp) {
                                layer.close(layerLoading);
                                layer.close(layerModal);
                                layer.msg(rsp.message, {icon: 5,offset: '250px',time: 3000});
                            }
                        }, this)

                    }else {
                        layer.close(layerModal);
                        LayerConfig('fail','请至少选择一个工单！');
                    }
                }else {
                    layer.close(layerModal);
                    LayerConfig('fail','有多个工位，请筛选一个工位进行合并！');
                }
            }else if(status==0){
                var new_work_order = [];
                work_order_arr.forEach(function (item) {
                    if(choose_arr.indexOf(item.work_order_id.toString())!=-1){
                        new_work_order.push(item)
                    }
                });
                var flag = true;
                var err_wo = '';
                new_work_order.forEach(function (item) {
                    if(item.sales_order_code==''){
                        flag = false;
                        err_wo = item.wo_number;
                    }
                });
                var newArr = removingDuplicateElementsFromArrays(new_work_order,['sales_order_code','sales_order_project_code']);
                if(flag){
                    if(newArr.length==1) {
                        if (choose_arr.length > 0) {
                            AjaxClient.get({
                                url: URLS['order'].checkPicking + _token + "&work_order_ids=" + choose_arr.join(','),
                                dataType: 'json',
                                beforeSend: function () {
                                    layerLoading = LayerConfig('load');
                                },
                                success: function (rsp) {
                                    layer.close(layerLoading);
                                    layer.close(layerModal);
                                    var sales_order_code = newArr[0].sales_order_code;
                                    var sales_order_project_code = newArr[0].sales_order_project_code;
                                    window.location.href = '/WorkOrder/combineItems?work_order_ids='+choose_arr+'&sales_order_code='+sales_order_code+'&sales_order_project_code='+sales_order_project_code+'&type='+type;
                                },
                                fail: function (rsp) {
                                    layer.close(layerLoading);
                                    layer.close(layerModal);
                                    layer.msg(rsp.message, {icon: 5, offset: '250px', time: 3000});
                                }
                            }, this)

                        } else {
                            layer.close(layerModal);
                            LayerConfig('fail', '请至少选择一个工单！');
                        }
                    }else {
                        layer.close(layerModal);
                        LayerConfig('fail','有多个销售订单号和行项，请筛选一个销售订单号进行合并！');
                    }
                }else {
                    layer.close(layerModal);
                    LayerConfig('fail',err_wo+'工单没有销售订单号，不能进行销售合并！');
                }
            }

        }
    });

    $('body').on('click','#viewattr .cancle',function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });

    //搜索
    $('body').on('click', '#searchForm .submitWork', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('backageground', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            var workStationDate = '';
            var workStationTime = '';
            if(parentForm.find('#work_station_time').val()) {
                workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
                workStationTime = 	Math.round(workStationDate.getTime()/1000);
            }

            ajaxData = {
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
                production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
                schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
                picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
                send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
                inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
                inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
                order: 'desc',
                sort: 'id',
                workbench_name: encodeURIComponent(parentForm.find('#work_shift_name').val().trim()),
                daytime: encodeURIComponent(workStationTime),
                rankplan: encodeURIComponent(parentForm.find('#rankplan').val().trim()),

            };
            pageNo = 1;
            var status = $('.el-tap.active').attr('data-status');
            getWorkOrder(status);
        }
    });

    //重置搜索框值
    $('body').on('click', '#searchForm .resetWork', function (e) {
        e.stopPropagation();
        var parentForm = $('#searchForm');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#work_order_number').val('');
        parentForm.find('#production_order_number').val('');
        parentForm.find('#work_shift_name').val('');
        parentForm.find('#work_station_time').val('');
        parentForm.find('#inspur_sales_order_code').val('');
        parentForm.find('#inspur_material_code').val('');
        parentForm.find('#schedule').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#picking_status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#send_status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#rankplan').val('').siblings('.el-input').val('--请选择--');
        pageNo = 1;
        resetParam();
        var status = $('.el-tap.active').attr('data-status');
        getWorkOrder(status);
    });
    //搜索
    $('body').on('click','#searchForm .submitPick',function(e){
        e.stopPropagation();
        e.preventDefault();
        var parentForm=$(this).parents('#searchForm');

        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('backageground','transparent');
        });
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';
        var storage_name=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').name:'';
        var storage_code=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').code:'';
        var $employee=$('#employee');
        var employee_id=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').id:'';
        var employee_name=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').name:'';

        $('.arrow .el-input-icon').removeClass('is-reverse');

        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            $('.el-sort').removeClass('ascending descending');
            pickAjaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                send_depot: encodeURIComponent(parentForm.find('#send_depot').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
                factory_id: encodeURIComponent(parentForm.find('#factory_id').val().trim()),
                out_material_code: encodeURIComponent(parentForm.find('#out_material_code').val().trim()),
                line_depot_id: storage_wo,
                line_depot_name: storage_name,
                line_depot_code: storage_code,
                employee_id  : employee_id,
                employee_name  : employee_name,
                send_start_time: parentForm.find('#start_time').val(),
                send_end_time: parentForm.find('#end_time').val(),
                order: 'desc',
                sort: 'id'
            };
            pageNoPick=1;
            getPickingList();
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .resetPick',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('backageground', 'transparent');
        });
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#out_material_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#send_depot').val('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#factory_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#storage_wo').val('').data('inputItem')=='';
        parentForm.find('#employee').val('').data('inputItem')=='';
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        pageNoPick=1;
        resetParamPick();
        getPickingList();
    });
    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');
        // selectdate(id,type)
        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id,type)
        });

    });


    $('body').on('click','.delete',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var status = $(this).attr('data-status');
        if(status==1){
            str = "您将执行删除操作！?";
        }
        if(status==2){
            str = "注意：删除【已推送】状态的领料单，请同时联系仓库部对应删除，否则会造成数据不同步！"
        }
        layer.confirm(str, {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            deleteItem(id);
        });
    });
    $('body').on('click', '.el-checkbox_input_check', function () {
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id");
        if($(this).hasClass('is-checked')){
            if(choose_arr.indexOf(id)==-1){
                choose_arr.push(id);
            }
        }else{
            var index=choose_arr.indexOf(id);
            choose_arr.splice(index,1);
        }
    });

    $('body').on('click','#check_input_all',function(){
        $(this).toggleClass('is-checked');

        if($(this).hasClass('is-checked')){
            $('table tr .el-checkbox_input_check').each(function () {
                if(!$(this).hasClass('is-checked')){
                    var id=$(this).attr("data-id");
                    $(this).addClass('is-checked');
                    if(choose_arr.indexOf(id)==-1){
                        choose_arr.push(id);
                    }
                }
            })
        }else{
            $('table tr .el-checkbox_input_check').each(function () {
                $(this).removeClass('is-checked');
                var id=$(this).attr("data-id");
                var index=choose_arr.indexOf(id);
                if(index!=-1){
                    choose_arr.splice(index,1);
                }
            })
        }
    });
    $('body').on('click','#combine',function (e) {
        e.stopPropagation();
        var type = $('.el-tap.active').attr('data-status');
        if(choose_arr.length>0){
            AjaxClient.get({
                url: URLS['order'].checkPicking + _token + "&work_order_ids=" + choose_arr.join(',') + "&type="+ type,
                dataType: 'json',
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    layer.close(layerModal);
                    sessionStorage.setItem('work_order_ids',JSON.stringify(choose_arr));
                    var workbench_no = $('#searchForm').find('#work_shift_name').val().trim();
                    window.location.href = '/WorkOrder/combineItems?work_order_ids='+choose_arr+'&type='+type+'&workbench_no='+workbench_no;
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    layer.close(layerModal);
                    layer.msg(rsp.message, {icon: 5,offset: '250px',time: 3000});
                }
            }, this)

        }else {
            layer.close(layerModal);
            LayerConfig('fail','请至少选着一个工单！');
        }
        // selectPickingType();
    })
    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        var ajaxDataStr = window.location.hash;

        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var status = $(this).attr('data-status');
            if (status != "0") {
                pageNo = 1;
                getWorkOrder(status);
            } else{
                pageNoPick = 1;
                getPickingList()
            }
        }
    });


    $('body').on('click','.el-checkbox_input_item',function(e){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id")
        var status=$(this).attr("data-status");
        if($(this).hasClass('is-checked')){
            if(mr_arr.indexOf(id)==-1){
                mr_arr.push(id);
                status_arr.push(status);
                push_status_arr.push(status);
            }
        }else{
            var index=mr_arr.indexOf(id);
            mr_arr.splice(index,1);
            status_arr.splice(status,1);
            push_status_arr.splice(status,1);
        }
    });
    $('body').on('click','#check_input_item_all',function(e){
        $(this).toggleClass('is-checked');
        if($(this).hasClass('is-checked')){
            mr_arr=[];
            $('#work_order_table .table_tbody .material_item').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').addClass('is-checked');
                mr_arr.push($(v).attr('data-id'));
                status_arr.push($(v).find('.el-checkbox_input_item').attr('data-status'));
                push_status_arr.push($(v).find('.el-checkbox_input_item').attr('data-status'));
            });

        }else{
            $('#work_order_table .table_tbody .material_item').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').removeClass('is-checked');
                var index=mr_arr.indexOf($(v).attr('data-id'));
                var status=mr_arr.indexOf($(v).attr('data-status'));
                mr_arr.splice(index,1);
                status_arr.splice(status,1);
                push_status_arr.splice(status,1);
            });
        }
    });

    $('body').on('click','.print_all',function (e) {
        e.stopPropagation();
        AjaxClient.get({
            url: URLS['work'].getBatchprinting +"?"+ _token + "&material_requisition_id=" + mr_arr,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                $('#print_list').html('')
                rsp.results.forEach(function (item) {
                    setData(item)
                });
                $("#print_list").show();
                $("#print_list").print();
                $("#print_list").hide();
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail','打印失败！');
            }
        }, this)

    })

    //一键入库
    $('body').on('click','.storage_all',function (e) {
      e.stopPropagation();
      var flag=true;
      status_arr.forEach(function(item){
        if(item!=3){
          flag=false
        }
      })
      if(flag){
        if(mr_arr&&mr_arr.length){
          var data={
            _token:"8b5491b17a70e24107c89f37b1036078",
            material_requisition_id_arr:mr_arr.join(',')
          };
          AjaxClient.post({
            url: URLS['work'].updateActualReceiveBatch,
            data: data,
            timeout: 60000,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
                pageNoPick = 1;
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success',"入库成功！");
                getPickingList();
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                if(rsp.message){
                  LayerConfig('fail',rsp.message);
                }else{
                  LayerConfig('success',"入库成功！");
                }
            }
          }, this)
        }else{
          LayerConfig('fail','请先选择领料单！');
        }
      }else{
        LayerConfig('fail','请先选择待入库领料单！');        
      }
    })

    //一键推送
    $('body').on('click','.push_all',function (e) {
      e.stopPropagation();
      var flag=true;
      push_status_arr.forEach(function(item){
        if(item!=1){
          flag=false
        }
      })
      if(flag){
        if(mr_arr&&mr_arr.length){
          var data={
            _token:"8b5491b17a70e24107c89f37b1036078",
            id_batch:mr_arr.join(',')
          };
          AjaxClient.get({
            url: URLS['work'].sendSapMergerPickingBatch,
            data: data,
            timeout: 60000,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
                pageNoPick = 1;
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success',"推送成功！");
                getPickingList();
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                if(rsp.message){
                  LayerConfig('fail',rsp.message);
                }else{
                  LayerConfig('success',"推送成功！");
                }
            }
          }, this)
        }else{
          LayerConfig('fail','请先选择领料单！');
        }
      }else{
        LayerConfig('fail','请先选择未发送领料单！');        
      }
    })

  $('body').on('click', '.el-form-item-div .export', function (e) {
    e.stopPropagation();
    var parentForm=$(this).parents('#searchForm');
    var urlLeft='';
    $('#searchForm .el-item-hide').slideUp(400,function(){
      $('#searchForm .el-item-show').css('backageground','transparent');
    });
    var $storage_wo=$('#storage_wo');
    var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
      $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';
    var storage_name=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
      $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').name:'';
    var storage_code=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
      $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').code:'';
    var $employee=$('#employee');
    var employee_id=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
      $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').id:'';
    var employee_name=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
      $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').name:'';

    $('.arrow .el-input-icon').removeClass('is-reverse');

    pickAjaxData={
      code: encodeURIComponent(parentForm.find('#code').val().trim()),
      work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
      sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
      sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
      send_depot: encodeURIComponent(parentForm.find('#send_depot').val().trim()),
      product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
      status: encodeURIComponent(parentForm.find('#status').val().trim()),
      factory_id: encodeURIComponent(parentForm.find('#factory_id').val().trim()),
      out_material_code: encodeURIComponent(parentForm.find('#out_material_code').val().trim()),
      line_depot_id: storage_wo,
      line_depot_name: storage_name,
      line_depot_code: storage_code,
      employee_id  : employee_id,
      employee_name  : employee_name,
      send_start_time: parentForm.find('#start_time').val(),
      send_end_time: parentForm.find('#end_time').val(),
      is_merger:1,
      order: 'desc',
      sort: 'id'
    };
    for (var param in pickAjaxData) {
      urlLeft += `&${param}=${pickAjaxData[param]}`;
    }
    let url = "/MaterialRequisition/getListexport?" +_token+ urlLeft;
    $('#exportExcel').attr('href', url)
  })
}
function setData(data) {
    var dataInfo = {};
    dataInfo.employee_name = data.employee_name,
        dataInfo.send_depot = data.send_depot,
        dataInfo.line_depot_name = data.line_depot_name,
        dataInfo.product_order_code = data.product_order_code,
        dataInfo.bench_no = data.bench_no,
        dataInfo.sales_order_code = data.sales_order_code,
        dataInfo.sales_order_project_code = data.sales_order_project_code,
        dataInfo.dispatch_time = data.dispatch_time,
        dataInfo.bench_no = data.bench_no;
    dataInfo.ctime = data.ctime;
    dataInfo.factory_code = data.factory_code;
    dataInfo.factory_name = data.factory_name;
    dataInfo.id = data.id;
    dataInfo.line_depot_id = data.line_depot_id;
    dataInfo.push_type = data.push_type;
    dataInfo.status = data.status;
    dataInfo.type = data.type;
    dataInfo.work_order_code = data.work_order_code;
    dataInfo.code = data.code;
    var marr = [];
    if(data.materials.length>0){
        data.materials.forEach(function (item) {
            var flag = true;
            marr.forEach(function (citem) {
                if(item.sales_order_code == citem.sales_order_code && item.material_code == citem.material_code){
                    citem.lc_demand_qty = citem.lc_demand_qty + item.lc_demand_qty;
                    citem.demand_qty = citem.demand_qty + item.demand_qty;
                    citem.sap_demand_qty = citem.sap_demand_qty + item.sap_demand_qty;
                    flag = false;
                    return false;
                }
            });
            if(flag){
                var itemArr = {};
                itemArr.base_unit=item.base_unit;
                itemArr.base_unit_id=item.base_unit_id;
                itemArr.custom_inspur_sale_order_code=item.custom_inspur_sale_order_code;
                itemArr.demand_qty=item.demand_qty;
                itemArr.demand_unit=item.demand_unit;
                itemArr.demand_unit_id=item.demand_unit_id;
                itemArr.item_id=item.item_id;
                itemArr.lc_demand_qty=item.lc_demand_qty;
                itemArr.lc_demand_unit=item.lc_demand_unit;
                itemArr.line_project_code=item.line_project_code;
                itemArr.material_code=item.material_code;
                itemArr.material_id=item.material_id;
                itemArr.material_name=item.material_name;
                itemArr.old_material_code=item.old_material_code;
                itemArr.rated_qty=item.rated_qty;
                itemArr.remark=item.remark;
                itemArr.sales_order_code=item.sales_order_code;
                itemArr.sales_order_project_code=item.sales_order_project_code;
                itemArr.sap_demand_qty=item.sap_demand_qty;
                itemArr.sap_demand_unit=item.sap_demand_unit;
                itemArr.special_stock=item.special_stock;
                var batchesnew = [];
                if(item.batches.length>0){
                    item.batches.forEach(function (bitem) {
                        var batche = {};
                        batche.actual_receive_qty = bitem.actual_receive_qty;
                        batche.actual_send_qty = bitem.actual_send_qty;
                        batche.batch = bitem.batch;
                        batche.batch_id = bitem.batch_id;
                        batche.bom_unit = bitem.bom_unit;
                        batche.bom_unit_id = bitem.bom_unit_id;
                        batche.item_id = bitem.item_id;
                        batche.material_requisition_id = bitem.material_requisition_id;
                        batche.order = bitem.order;
                        batchesnew.push(batche)
                    })
                }
                itemArr.batches=batchesnew;

                var wpssnew = [];
                if(item.wo_po_so.length>0){
                    item.wo_po_so.forEach(function (witem) {
                        var watche = {};
                        watche.material_id = witem.material_id;
                        watche.product_order_code = witem.product_order_code;
                        watche.qty = witem.qty;
                        watche.rated_qty = witem.rated_qty;
                        watche.sales_order_code = witem.sales_order_code;
                        watche.sales_order_project_code = witem.sales_order_project_code;
                        watche.special_stock = witem.special_stock;
                        watche.work_order_code = witem.work_order_code;
                        wpssnew.push(watche)
                    })
                }
                itemArr.wo_po_so=wpssnew;
                marr.push(itemArr);
            }

        })
    }
    dataInfo.materials=marr;
    showPrintList(dataInfo);
}


