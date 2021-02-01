var layerModal,
    layerLoading,
    pageNo = 1,
    pageNoPick = 1,
    pageSize = 20,
    choose_arr = [],
    mr_arr = [],
    work_order_arr = [],
    ajaxData = {},
    pickAjaxData = {};

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if(ajaxDataStr !== undefined && ajaxDataStr !== ''){
        var ajaxStr = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        if (ajaxDataStr !== undefined && ajaxDataStr !== '' && ajaxStr.tab_type == 2) {
            try {
                ajaxData = ajaxStr;
                delete ajaxData.pageNo;
                // delete ajaxData.tab_type;
                pageNo = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
                $('.el-tap[data-status=2]').addClass('active').siblings('.el-tap').removeClass('active');
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
                $('.el-tap[data-status=1]').addClass('active').siblings('.el-tap').removeClass('active');
                getPickingList();
            } catch (e) {
                resetParamPick();
            }
        }
    }else {
        getWorkOrder("2");
    }
}
//重置搜索参数
function resetParamPick(){
    pickAjaxData={
        code: '',
        work_order_code: '',
        product_order_code: '',
        inspur_sales_order_code: '',
        inspur_material_code: '',
        type: '',
        employee_name  : '',
        line_depot_id: '',
        workbench_id: '',
        is_depot_picking:'',
        status: ''
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
        schedule: '',
        item_no:'',
        picking_status: '',
        send_status: '',
        withdrawalstatus: '',
        order: 'desc',
        sort: 'id'
    };
}

//获工单排列表
function getWorkOrder(status) {
    choose_arr=[];
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&status=" + status;
    AjaxClient.get({
        url: URLS['order'].workReturnOrderList + _token + urlLeft,
        dataType: 'json',
        cache:false,
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
                            <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                            <input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单号" value="">
                        </div>
                    </div>
                </div>
                <ul class="el-item-hide">
                  <li>
                      <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">工单号</label>
                              <input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
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
                      <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                              <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
                          </div>
                      </div>
                      <div class="el-form-item work_shift_name">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">工位号</label>
                              <input type="text" id="work_shift_name" class="el-input" placeholder="请输入工位号" value="">
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
                    <li>
                    <div class="el-form-item">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">退料状态</label>
                              <div class="el-select-dropdown-wrap">
                                  <div class="el-select schedule">
                                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                      <input type="hidden" class="val_id" id="withdrawalstatus" value="">
                                  </div>
                                  <div class="el-select-dropdown" style="display: none;">
                                      <ul class="el-select-dropdown-list">
                                          <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                          <li data-id="1" class=" el-select-dropdown-item">未退料</li>
                                          <li data-id="2" class=" el-select-dropdown-item">正在退料</li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="el-form-item work_shift_name">
                          <div class="el-form-item-div">
                              <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                              <input type="text" id="item_no" class="el-input" placeholder="请输入物料编码" value="">
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
                    <button type="button" class="el-button" id="combine">按单合并</button>
                    <button type="button" class="el-button" id="combineCommon" style="color: #ce2e04" data-type="1">通用合并</button>
                </div>
            </div>
            </div>
        </form>
        </div>
        <div class="table_page">
            ${_schtml}
        </div>`;
			$('.el-panel-wrap').html(_html);
			
			if (rsp.paging.total_records < 20) {
				$('#total_gd').css('display', 'block').text('当前页总数: ' + rsp.paging.total_records);
			} else {
				$('#total_gd').css('display', 'none').text(' ');
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
                // if(ajaxStr.daytime){
                //     laydateRender(formatDate(ajaxStr.daytime));
                // }else {
                //     laydateRender();
                // }
            }

        }
    }, this)
}
//获取领料列表数据
function getPickingList(){
    var urlLeft='';
    for(var param in pickAjaxData){
        urlLeft+=`&${param}=${pickAjaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNoPick+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].MergerReturnMaterial+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // if(layerModal!=undefined){
            //     layerLoading = LayerConfig('load');
            // }
            mr_arr=[];
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
                                        <input type="text" id="product_order_code" class="el-input" placeholder="生产订单号" value="">
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
                                            <label class="el-form-item-label" style="width: 100px;">单号</label>
                                            <input type="text" id="code" class="el-input" placeholder="请输入单号" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">类型</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="type" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                        <li data-id="1" class=" el-select-dropdown-item choose_status">领料</li>
                                                        <li data-id="7" class=" el-select-dropdown-item choose_status">补料</li>
                                                        <li data-id="2" class=" el-select-dropdown-item choose_status">退料</li>
                                                    </ul>
                                                </div>
                                            </div>
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
                                <!--<li>
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
                                </li>-->
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">责任人</label>
                                            <input type="text" id="employee" class="el-input" placeholder="请输入责任人" value="">
                                        </div>
                                        <p class="errorMessage" style="padding-left: 30px;"></p>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">台板</label>
                                            <div class="el-select-dropdown-wrap">
                                                <input type="text" id="workBench" class="el-input"  placeholder="台板" value="">
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">是否物料领料</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="is_depot_picking" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                        <li data-id="1" class=" el-select-dropdown-item">是</li>
                                                        <li data-id="0" class=" el-select-dropdown-item">否</li>
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
                                <button type="button" class="el-button el-button--primary submitPick" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button resetPick">重置</button>
                                <button type="button" class="el-button print_all">打印</button>
                                <button type="button" class="el-button combine_push">合并推送</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="table_page">
                ${_html}
            </div>`
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
                $("#code").val(decodeURI(ajaxStr.code))
                $("#employee_name").val(decodeURI(ajaxStr.employee_name))
                $("#line_depot_id").val(decodeURI(ajaxStr.line_depot_id))
                $("#product_order_code").val(decodeURI(ajaxStr.product_order_code))
                $("#work_order_code").val(decodeURI(ajaxStr.work_order_code))
                $("#workbench_id").val(decodeURI(ajaxStr.workbench_id))
                if(ajaxStr.is_depot_picking.length>0){
                    $("#is_depot_picking").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.is_depot_picking+']').click()
                }
                if(ajaxStr.type.length>0){
                    $("#type").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.type+']').click()
                }

                setTimeout(function () {
                    if(ajaxStr.status.length>0){
                        $("#status").parent().next().find('.el-select-dropdown-item[data-id='+ajaxStr.status+']').click()
                    }
                },1000);

            }
        }
    },this)
}
//生成领料列表数据
function createHtml(data){
    var viewurl="/WorkOrder/viewPickingListForAllPicking";
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){
            var so_po_wo_html = ''
            if(item.wo_po.length>0){
                so_po_wo_html = creatSPWHtml(item.wo_po);
            }
            trs+= `
			<tr data-id="${item.material_requisition_id}" class="material_item">
			  <td>
			    <span class="el-checkbox_input el-checkbox_input_item" id="check_input_${item.material_requisition_id}" data-id="${item.material_requisition_id}">
            <span class="el-checkbox-outset"></span>
          </span>
        </td>
        <td>${tansferNull(item.code)}</td>
        <td>${so_po_wo_html}</td>
        <td>${tansferNull(item.line_depot_name)}</td>
        <td>${tansferNull(item.factory_name)}</td>
        <td>${tansferNull(item.workbench_name)}</td>
        <td>${tansferNull(item.employee_name)}</td>
        <td style="${item.status==3}">${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
        <td>${tansferNull(checkType(item.type))}</td>
        <td>${tansferNull(item.send_depot)}</td>
        <td>${tansferNull(item.ctime)}</td>
        <!--<td>${tansferNull(item.dispatch_time)}</td>-->
        <td class="right">
	         ${item.status == 1 && item.push_type != 2 ? `<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button item_submit">推送</button>` : ''}
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>
	         ${(item.status == 2||item.status == 1) ?`<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button delete">删除</button>`:''}
	         ${(item.push_type==0&&item.status == 4) ?`<!--<button data-id="${item.material_requisition_id}" data-type="${item.type}" class="button pop-button returnAudit">反审</button>-->`:''}
	      </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="12" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                       <th class="left nowrap tight">
                                <span class="el-checkbox_input el-checkbox_input" id="check_input_item_all">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">合并信息</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">创建时间</th>
                        <!--<th class="left nowrap tight">配送时间</th>-->
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
    var viewurl = $('#workOrder_view').val();
    var trs = '';
    if (data && data.results && data.results.length) {
        data.results.forEach(function (item, index) {
            var  link_data = [];
            link_data.push({work_order_id:item.work_order_id,material_id:item.material_id,wo_number:item.wo_number,inve_id:item.inve_id});
            link_data=JSON.stringify(link_data);
            var checkedHtml = '';
            checkedHtml = `<span class="el-checkbox_input el-checkbox_input_check" data-id="${tansferNull(item.work_order_id)}" data-mat="${item.material_id}" data-number="${item.wo_number}" data-inve="${item.inve_id}"> 
                <span class="el-checkbox-outset"></span>
            </span>`,
            trs += `
			<tr>
			<td>${checkedHtml}</td>
			<td>${tansferNull(item.sales_order_code)}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.wo_number)}</td>
			<td>${tansferNull(item.material_code)}</td>
			<td>${tansferNull(item.material_name)}</td>
			<td>${tansferNull(item.batch)}</td>
			<td>${tansferNull(item.factory_name)}${tansferNull(item.factory_code)}）</td>            
			<td>${tansferNull(item.workshop_name)}</td>            
			<td>${tansferNull(item.line_depot_name)}（${tansferNull(item.line_depot_code)}）</td>            
			<td>${tansferNull(item.workcenter_name)}</td>            
			<td>${tansferNull(item.workbench_name)}</td>
			<td>${tansferNull(item.picking_status==0?'未领':item.picking_status==1?'领料中':item.picking_status==2?'已领':'')}</td>
			<td>${tansferNull(item.withdrawalstatus==1?'未退料':'正在退料')}</td>
			<td style="color: ${item.send_status==1?'red':''}">${tansferNull(item.is_sap_picking==0?'':item.send_status==0?'未发':item.send_status==1?'少发':item.send_status==2?'正常':'')}</td> 
			<td>${tansferNull((Number(item.schedule)*100).toFixed(2))}%</td>           
			<td>${tansferNull(item.storage_number)}</td>            
			<td>${tansferNull(item.bom_commercial)}</td>            
			            
			
			<td class="right nowrap tight">
			    <a class="button pop-button " href="/WorkOrder/createPickingList?id=${item.work_order_id}&type=7">补料</a>
			   ${(item.sales_order_code==''&&item.po_number==''&&item.wo_number=='')?`<a class="button pop-button " href='/WorkOrder/combineReturnItems?work_order_ids=${link_data}&type=1'>退料</a>`
                :`<a class="button pop-button " href='/WorkOrder/combineReturnItems?work_order_ids=${link_data}'>退料</a>`}			    
            </td>
			
	        </td>
			</tr>
			`;
        })
    } else {
        trs = '<tr><td colspan="18" style="text-align:center">暂无数据</td></tr>';
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
                    <th class="left nowrap tight">销售订单号/行项号</th>
                    <th class="left nowrap tight">生产订单号</th>
                    <th class="left nowrap tight">工单号</th>
                    <th class="left nowrap tight">物料编码</th>
                    <th class="left nowrap tight">物料名称</th>
                    <th class="left nowrap tight">批次</th>
                    <th class="left nowrap tight">工厂</th>                   
                    <th class="left nowrap tight">车间</th>                   
                    <th class="left nowrap tight">线边仓</th>                   
                    <th class="left nowrap tight">工作中心</th>                   
                    <th class="left nowrap tight">工位</th> 
                    <th class="left nowrap tight">领料状态</th>
                    <th class="left nowrap tight">退料状态</th>
                    <th class="left nowrap tight">SAP发料状态</th> 
                    <th class="left nowrap tight">报工状态</th>                 
                    <th class="left nowrap tight">差异量</th>                   
                    <th class="left nowrap tight">单位</th>                   
                    <th class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody_fineProducted">${trs}</tbody>
            </table>
		</div>
		<div id="total_gd" style="float:right; display:none;" ></div>
        <div id="pagenationfineProduce" class="pagenation fineProduce" style="margin-top: 5px;"></div>`;
    $('#showPickingList').show();
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
			<td>${tansferNull(item.inspur_material_code)}</td>
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
                        <th class="left nowrap tight">合并物料</th>
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
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].old_material_code}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].sap_demand_qty}${newObj[j][i].sap_demand_unit}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].lc_demand_qty}${tansferNull(newObj[j][i].lc_demand_unit)}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].demand_qty}${tansferNull(newObj[j][i].demand_unit)}</td>
                                <td >${newObj[j][i].remark}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].sap_demand_qty+newObj[j][i + 1].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].lc_demand_qty+tansferNull(newObj[j][i + 1].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].demand_qty+tansferNull(newObj[j][i + 1].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].remark : ''}</td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].sap_demand_qty+newObj[j][i + 2].sap_demand_unit : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].lc_demand_qty+tansferNull(newObj[j][i + 2].lc_demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].demand_qty+tansferNull(newObj[j][i + 2].demand_unit) : ''}</td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].remark : ''}</td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
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
    AjaxClient.get({
        url: URLS['work'].delete +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','删除成功！');
            getPickingList();

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
        url: URLS['work'].submit +"?"+ _token + "&id=" + id+ "&type=" + type ,
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

// function selectPickingType() {
//     layerModal = layer.open({
//         type: 1,
//         title: '领料方式',
//         offset: '300px',
//         area: '400px',
//         shade: 0.1,
//         shadeClose: false,
//         resize: false,
//         move: false,
//         content: `<form class="viewAttr formModal" id="viewattr">
//
// 					 <div class="form-content">
//                           <div class="el-form-item">
//                             <div class="el-form-item-div">
//                                 <label class="el-form-item-label" style="width: 100px;">领料方式</label>
//                                 <div class="el-radio-group">
//                                     <label class="el-radio">
//                                         <span class="el-radio-input">
//                                             <span class="el-radio-inner is-radio-checked"></span>
//                                             <input class="status yes" type="hidden" value="1">
//                                         </span>
//                                         <span class="el-radio-label">基于工位</span>
//                                     </label>
//                                     <label class="el-radio">
//                                         <span class="el-radio-input">
//                                             <span class="el-radio-inner"></span>
//                                             <input class="status no" type="hidden" value="0">
//                                         </span>
//                                         <span class="el-radio-label">基于销售订单</span>
//                                     </label>
//                                 </div>
//                             </div>
//                             <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
//                           </div>
//                      </div>
//                      <div class="el-form-item">
//                         <div class="el-form-item-div btn-group">
//                             <button type="button" class="el-button cancle">取消</button>
//                             <button type="button" id="materiel" class="el-button el-button--primary submit">确定</button>
//                         </div>
//                       </div>
//                 </form>`,
//         success: function (layero, index) {
//         },
//         end: function () {
//             $('.out_material .item_out .table_tbody').html('');
//         }
//
//     })
// }

// function selectdate(id,type) {
//     layerModal = layer.open({
//         type: 1,
//         title: '选择时间',
//         offset: '300px',
//         area: '400px',
//         shade: 0.1,
//         shadeClose: false,
//         resize: false,
//         move: false,
//         content: `<form class="viewAttr formModal" id="chooseDate">
// 	                  <input type="hidden" id="itemId" value="${id}">
// 	                  <input type="hidden" id="itemType" value="${type}">
// 					 <div class="form-content">
//                           <div class="el-form-item">
//                             <div class="el-form-item-div">
//                                 <label class="el-form-item-label" style="width: 100px;">配送时间</label>
//                               <input type="text" style="background-color: #fff !important;" id="chooseTime" readonly class="el-input" placeholder="请选择时间" value="">
//                             </div>
//                             <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
//                           </div>
//                      </div>
//                      <div class="el-form-item">
//                         <div class="el-form-item-div btn-group">
//                             <button type="button" class="el-button cancle">取消</button>
//                             <button type="button" id="materiel" class="el-button el-button--primary submit">确定</button>
//                         </div>
//                       </div>
//                 </form>`,
//         success: function (layero, index) {
//             laydate.render({
//                 elem: '#chooseTime',
//                 type: 'datetime'
//             });
//         },
//         end: function () {
//             $('.out_material .item_out .table_tbody').html('');
//         }
//
//     })
// }
function chooseStatus(type) {
    switch(Number(type))
    {
        case 1:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 2:
            return `<li data-id="1" class=" el-select-dropdown-item">待出库</li>
                    <li data-id="2" class=" el-select-dropdown-item">待推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">进行中</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>
                    <li data-id="5" class=" el-select-dropdown-item">反审完成</li>`;
            break;
        case 7:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        default:
            break;
    }
}

function bindEvent() {
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
            // var workStationDate = '';
            // var workStationTime = '';
            // if(parentForm.find('#work_station_time').val()) {
            //     workStationDate = new Date(parentForm.find('#work_station_time').val() + ' 00:00:00');
            //     workStationTime = 	Math.round(workStationDate.getTime()/1000);
            // }

            ajaxData = {
                sales_order_code: encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code: encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                work_order_number: encodeURIComponent(parentForm.find('#work_order_number').val().trim()),
                item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
                // work_task_number: encodeURIComponent(parentForm.find('#work_task_number').val().trim()),
                production_order_number: encodeURIComponent(parentForm.find('#production_order_number').val().trim()),
                schedule: encodeURIComponent(parentForm.find('#schedule').val().trim()),
                picking_status: encodeURIComponent(parentForm.find('#picking_status').val().trim()),
                send_status: encodeURIComponent(parentForm.find('#send_status').val().trim()),
                withdrawalstatus: encodeURIComponent(parentForm.find('#withdrawalstatus').val().trim()),
                // inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
                // inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
                order: 'desc',
                sort: 'id',
                workbench_name: encodeURIComponent(parentForm.find('#work_shift_name').val().trim()),
                // daytime: encodeURIComponent(workStationTime)
            };
            pageNo = 1;
            var status = $('.el-tap.active').attr('data-status');
            getWorkOrder(status);
        }
    });
    //单选按钮点击事件
    $('body').on('click','#viewattr:not(".disabled") .el-radio-input',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
    //选择领料方式
    // $('body').on('click','#viewattr .submit',function () {
    //     if(!$(this).hasClass('is-disabled')){
    //         $(this).addClass('is-disabled');
    //         var parentForm = $(this).parents('#viewattr');
    //         var status = parentForm.find('.is-radio-checked .status').val();
    //         if(status==1){
    //             var new_work_order = [];
    //             work_order_arr.forEach(function (item) {
    //                 if(choose_arr.indexOf(item.work_order_id.toString())!=-1){
    //                     new_work_order.push(item)
    //                 }
    //             })
    //             var newArr = removingDuplicateElementsFromArrays(new_work_order,['workbench_id']);
    //             if(newArr.length==1){
    //                 if(choose_arr.length>0){
    //                     AjaxClient.get({
    //                         url: URLS['order'].checkPicking + _token + "&work_order_ids=" + choose_arr.join(','),
    //                         dataType: 'json',
    //                         beforeSend: function () {
    //                             layerLoading = LayerConfig('load');
    //                         },
    //                         success: function (rsp) {
    //                             layer.close(layerLoading);
    //                             layer.close(layerModal);
    //                             var workbench_id = newArr[0].workbench_id;
    //                             var workbench_name = newArr[0].workbench_name;
    //                             window.location.href = '/WorkOrder/combineItems?work_order_ids='+choose_arr+'&workbench_id='+workbench_id+'&workbench_name='+workbench_name;
    //                         },
    //                         fail: function (rsp) {
    //                             layer.close(layerLoading);
    //                             layer.close(layerModal);
    //                             layer.msg(rsp.message, {icon: 5,offset: '250px',time: 3000});
    //                         }
    //                     }, this)
    //
    //                 }else {
    //                     layer.close(layerModal);
    //                     LayerConfig('fail','请至少选着一个工单！');
    //                 }
    //             }else {
    //                 layer.close(layerModal);
    //                 LayerConfig('fail','有多个工位，请筛选一个工位进行合并！');
    //             }
    //         }else if(status==0){
    //             var new_work_order = [];
    //             work_order_arr.forEach(function (item) {
    //                 if(choose_arr.indexOf(item.work_order_id.toString())!=-1){
    //                     new_work_order.push(item)
    //                 }
    //             });
    //             var flag = true;
    //             var err_wo = '';
    //             new_work_order.forEach(function (item) {
    //                 if(item.sales_order_code==''){
    //                     flag = false;
    //                     err_wo = item.wo_number;
    //                 }
    //             })
    //             var newArr = removingDuplicateElementsFromArrays(new_work_order,['sales_order_code']);
    //             if(flag){
    //                 if(newArr.length==1) {
    //                     if (choose_arr.length > 0) {
    //                         AjaxClient.get({
    //                             url: URLS['order'].checkPicking + _token + "&work_order_ids=" + choose_arr.join(','),
    //                             dataType: 'json',
    //                             beforeSend: function () {
    //                                 layerLoading = LayerConfig('load');
    //                             },
    //                             success: function (rsp) {
    //                                 layer.close(layerLoading);
    //                                 layer.close(layerModal);
    //                                 window.location.href = '/WorkOrder/combineItems?work_order_ids=' + choose_arr;
    //                             },
    //                             fail: function (rsp) {
    //                                 layer.close(layerLoading);
    //                                 layer.close(layerModal);
    //                                 layer.msg(rsp.message, {icon: 5, offset: '250px', time: 3000});
    //                             }
    //                         }, this)
    //
    //                     } else {
    //                         layer.close(layerModal);
    //                         LayerConfig('fail', '请至少选着一个工单！');
    //                     }
    //                 }else {
    //                     layer.close(layerModal);
    //                     LayerConfig('fail','有多个工位，请筛选一个销售订单号进行合并！');
    //                 }
    //             }else {
    //                 layer.close(layerModal);
    //                 LayerConfig('fail',err_wo+'工单没有销售订单号，不能进行销售合并！');
    //             }
    //         }
    //
    //     }
    // });

    $('body').on('click','#viewattr .cancle',function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });



    //重置搜索框值
    $('body').on('click', '#searchForm .resetWork', function (e) {
        e.stopPropagation();
        var parentForm = $('#searchForm');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#work_order_number').val('');
        parentForm.find('#work_task_number').val('');
        parentForm.find('#item_no').val('');
        parentForm.find('#production_order_number').val('');
        parentForm.find('#work_shift_name').val('');
        parentForm.find('#work_station_time').val('');
        parentForm.find('#inspur_sales_order_code').val('');
        parentForm.find('#inspur_material_code').val('');
        parentForm.find('#schedule').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#picking_status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#send_status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#withdrawalstatus').val('').siblings('.el-input').val('--请选择--');
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
        var $workBench=$('#workBench');
        var workbench_id=$workBench.data('inputItem')==undefined||$workBench.data('inputItem')==''?'':
            $workBench.data('inputItem').workbench_name==$workBench.val().trim().replace(/\（.*?）/g,"")?$workBench.data('inputItem').workbench_id:'';
        $('.arrow .el-input-icon').removeClass('is-reverse');
        // var workbench_id_all=storage_wo;
        // var type_all=encodeURIComponent(parentForm.find('#type').val().trim());
        // var status_all=encodeURIComponent(parentForm.find('#status').val().trim());
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            $('.el-sort').removeClass('ascending descending');
            pickAjaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                is_depot_picking: encodeURIComponent(parentForm.find('#is_depot_picking').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                // inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
                // inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
                type: encodeURIComponent(parentForm.find('#type').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
                employee_name: encodeURIComponent(parentForm.find('#employee').val().trim()),
                workbench_id: workbench_id,
                line_depot_id: storage_wo,
            };
            pageNoPick=1;
            getPickingList();
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .resetPick',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#is_depot_picking').val('');
        // parentForm.find('#inspur_sales_order_code').val('');
        // parentForm.find('#inspur_material_code').val('');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#storage_wo').val('');
        parentForm.find('#employee').val('');
        parentForm.find('#workBench').val('');
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
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            deleteItem(id);
        });

    });





    $('body').on('click', '.el-checkbox_input_check', function () {
        $(this).toggleClass('is-checked');
        // wo_number，material_id，work_order_id
        var id=$(this).attr("data-id"),
            mat_id=$(this).attr("data-mat"),
            number=$(this).attr("data-number"),
            inve_id=$(this).attr("data-inve");
        var choose_data = {
            work_order_id:tansferNull(id),
            material_id:tansferNull(mat_id),
            wo_number:tansferNull(number),
            inve_id:tansferNull(inve_id)
        }
        if($(this).hasClass('is-checked')){
            var flag = true;
            choose_arr.forEach(function (item,index) {
                if(item.work_order_id==choose_data.work_order_id){
                    flag = true;
                    return false;
                }
            });
            if(flag){
                choose_arr.push(choose_data);
            }
        }else{
            var order = -1;
            choose_arr.forEach(function (item,index) {
                if(item.work_order_id==choose_data.work_order_id){
                    order = index;
                    return false;
                }
            });
            if(order!=-1){
                choose_arr.splice(order,1);
            }
        }
    });
    $('body').on('click','#check_input_all',function(){
        $(this).toggleClass('is-checked');

        if($(this).hasClass('is-checked')){
            $('table tr .el-checkbox_input_check').each(function () {
                if(!$(this).hasClass('is-checked')){
                    var id=$(this).attr("data-id"),
                        mat_id=$(this).attr("data-mat"),
                        number=$(this).attr("data-number"),
                        inve_id=$(this).attr("data-inve");

                    var choose_data = {
                        work_order_id:tansferNull(id),
                        material_id:tansferNull(mat_id),
                        wo_number:tansferNull(number),
                        inve_id:tansferNull(inve_id)
                    }
                    $(this).addClass('is-checked');
                    if(JSON.stringify(choose_arr).indexOf(JSON.stringify(choose_data))==-1){
                        choose_arr.push(choose_data);
                    }
                }
            })
        }else{
            $('table tr .el-checkbox_input_check').each(function () {
                $(this).removeClass('is-checked');
                var id=$(this).attr("data-id"),
                    mat_id=$(this).attr("data-mat"),
                    number=$(this).attr("data-number"),
                    inve_id=$(this).attr("data-inve");
                var choose_data = {
                    work_order_id:tansferNull(id),
                    material_id:tansferNull(mat_id),
                    wo_number:tansferNull(number),
                    inve_id:tansferNull(inve_id)
                }
                var index=JSON.stringify(choose_arr).indexOf(JSON.stringify(choose_data));
                if(index!=-1){
                    choose_arr.splice(index-1,1);
                }
            })
        }
    });
    $('body').on('click','#combine',function (e) {
        e.stopPropagation();
        console.log(choose_arr)
        // var workbench_no = $('#searchForm').find('#work_shift_name').val().trim();
        window.location.href = '/WorkOrder/combineReturnItems?work_order_ids='+JSON.stringify(choose_arr);
        // selectPickingType();
    });
    $('body').on('click','#combineCommon',function (e) {
        e.stopPropagation();
        console.log(choose_arr);
        var type = $(this).attr('data-type')
        window.location.href = '/WorkOrder/combineReturnItems?work_order_ids='+JSON.stringify(choose_arr)+"&type="+type;
    });
    //合并推送
    $('body').on('click','.combine_push',function(e){
      e.stopPropagation();
      var push_id=[];
      $("#work_order_table .table_tbody").find('.material_item').each(function(index,ele){
          if ($(ele).find(".el-checkbox_input").hasClass('is-checked')) {
            //list = JSON.parse(list);
            push_id.push($(ele).find(".is-checked").attr("data-id"))
          }
      })
      if(push_id.length){
        layer.confirm('确定合并退料单操作?', {
          icon: 3, title: '提示', offset: '250px', end: function () {
            AjaxClient.get({
              url:URLS['work'].mergerPush+"?"+_token+"&id="+push_id,
              dataType: 'json',
              beforeSend: function () {
                  layerLoading = LayerConfig('load');
              },
              success: function (rsp) {
                  layer.close(layerLoading);
                  layerLoading('success','推送成功！');
              },
              fail: function (rsp) {
                  layer.close(layerLoading);
                  LayerConfig('fail','推送失败，错误日志为：'+rsp.message);
                }
          },this)
          }
        })
      }else{
        layer.msg("请先选择需要合并的退料单！", {icon: 5,offset: '250px',time: 2000});  
      }
    });
    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var status = $(this).attr('data-status');
            if (status == 2) {
                pageNo = 1;
                getWorkOrder(status);
            } else if(status == 1) {
                pageNoPick = 1;
                getPickingList()
            }
        }
    });
    $('body').on('click','.choose_status',function(e){
        e.stopPropagation();
        var type = $(this).attr('data-id');
        var _html = chooseStatus(type);
        $('#show_status').html(_html);
    });


    $('body').on('click','.el-checkbox_input_item',function(e){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id")
        if($(this).hasClass('is-checked')){
            if(mr_arr.indexOf(id)==-1){
                mr_arr.push(id);
            }
        }else{
            var index=mr_arr.indexOf(id);
            mr_arr.splice(index,1);
        }
    });
    $('body').on('click','#check_input_item_all',function(e){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("data-id")
        if($(this).hasClass('is-checked')){
            mr_arr=[];
            $('#work_order_table .table_tbody .material_item').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').addClass('is-checked');
                mr_arr.push($(v).attr('data-id'));
            });

        }else{
            $('#work_order_table .table_tbody .material_item').each(function (k,v) {
                $(this).find('.el-checkbox_input_item').removeClass('is-checked');
                mr_arr.push($(v).attr('data-id'));
            });
            mr_arr=[];
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
                    showPrintList(item);
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
}


