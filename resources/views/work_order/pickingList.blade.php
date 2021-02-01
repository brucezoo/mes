{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v=1556950541?v={{$release}}">
    <input type="hidden" id="workOrder_view" value="/WorkOrder/viewPickingListForPicking">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        {{--<a href="/PickingAll/addPickingAllNewItems"><button class="button"><i class="fa fa-plus"></i>物料领料</button></a>--}}
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-status="0" class="el-tap">线边</span>
                <span data-status="1" class="el-tap active">SAP</span>
                <span data-status="2" class="el-tap">车间</span>
            </div>
            <div class="logBtnWrap">
                <i class="fa fa-file-text-o" id="showLog" aria-hidden="true" title="显示日志"></i>
            </div>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="searchItem" id="searchForm">
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
                                            <label class="el-form-item-label" style="width: 100px;">类型</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="type" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
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
                                    <div class="el-form-item send_deport_wrap" style="display: none;">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">采购仓储</label>
                                            <input type="text" id="send_deport" class="el-input" placeholder="请输入采购仓储" value="">
                                        </div>
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
                            </ul>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button reset">重置</button>
                                <button type="button" class="el-button export"><a href="" id="exportExcel">导出</a></button>
                                <button type="button" class="el-button print_all">打印</button>
                                <button type="button" class="el-button update-receive-batch">一键入库</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="table_page">

            </div>
        </div>
        <div id="print_list" style="display: none;"></div>
    </div>
    <div class="logWrap" id="log">
        <div class="log-container">
            <div class="title">
                <span class="header">操作日志</span>
                <span class="close logClose"><i class="fa fa-close"></i></span>
            </div>
            <div class="log-content">
                <div class="log-modifier-user"></div>
                <div class="log-item-wrap">
                    <div class="log-date-filter">
                        <span class="item-title"><i class="fa fa-tasks"></i>&nbsp;&nbsp;操作信息</span>
                        <div class="log-datepicker">
                            <label for="log-date"><i class="fa fa-calendar datepicker-icon"></i></label>
                            <input type="text" id="log-date" readonly class="log-datepicker-input" value="">
                        </div>
                    </div>
                    <div class="log-pagenation-wrap">
                        <div id="log-pagenation" class="log-pagenation"></div>
                    </div>
                    <div class="log-item-container">
                        <ul class="log-item-ul">
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/custom/js/picking/log.js?v={{$release}}"></script>
@endsection
