{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
    <input type="hidden" id="workOrder_view" value="/WorkOrder/workOrderView">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
        <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
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
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">排产状态</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select schedule">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="proScheduleState" value="">
                                        </div>
                                        <div class="el-select-dropdown" style="display: none;">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="0" class=" el-select-dropdown-item">未排</li>
                                                <li data-id="1" class=" el-select-dropdown-item">主排</li>
                                                <li data-id="2" class=" el-select-dropdown-item">细排</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">领料状态</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select schedule">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="acquisitionState" value="">
                                        </div>
                                        <div class="el-select-dropdown" style="display: none;">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="0" class=" el-select-dropdown-item">未领料</li>
                                                <li data-id="1" class=" el-select-dropdown-item">领料中</li>
                                                <li data-id="2" class=" el-select-dropdown-item">已领料</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">报工状态</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select schedule">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="opState" value="">
                                        </div>
                                        <div class="el-select-dropdown" style="display: none;">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="0" class=" el-select-dropdown-item">未报工</li>
                                                <li data-id="1" class=" el-select-dropdown-item">报工中</li>
                                                <li data-id="2" class=" el-select-dropdown-item">已报工</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item operation_name">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">工序</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="operation_name" class="el-input" placeholder="--请选择--">
                                            <input type="hidden" class="val_id" id="operation_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list" id="select-operation">
                                                <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
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
                    </ul>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                        <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                        <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                        <button type="button" class="el-button reset">重置</button>
                    </div>
                </div>
            </div>
        </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="product_order_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>销售订单号/行项号</th>
                            <th>生产订单号</th>
                            <th>工单号</th>
                            <th>产成品编码</th>
                            <th>产成品</th>
                            <th>数量</th>
                            <th>车间</th>
                            <th>工作中心</th>
                            <th>工位号</th>
                            <th>工厂</th>
                            <th>计划日期</th>
                            <th>浪潮销售订单号</th>
                            <th>浪潮物料号</th>
                            <th>BOM版本</th>
                            <th>订单状态</th>
                            <th>排产状态</th>
                            <th>领料状态</th>
                            <th>报工状态</th>
                            <th class="right">操作</th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody">
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/technologyRouting.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/woCraftView.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
@endsection
