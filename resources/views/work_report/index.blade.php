{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/DataTables/media/css/jquery.dataTables.min.css">
<link type="text/css" rel="stylesheet"
    href="/statics/common/DataTables/extensions/FixedColumns/css/fixedColumns.jqueryui.min.css">
<style>
.table>caption+thead>tr:first-child>td,
.table>caption+thead>tr:first-child>th,
.table>colgroup+thead>tr:first-child>td,
.table>colgroup+thead>tr:first-child>th,
.table>thead:first-child>tr:first-child>td,
.table>thead:first-child>tr:first-child>th,
div.dataTables_scrollBody tbody tr:first-child td,
div.dataTables_scrollBody tbody tr:first-child th
 {
    border-top: 1px solid #ddd;
}

.dataTables_wrapper.no-footer .dataTables_scrollBody,
table.dataTable thead th,
table.dataTable thead td,
table.dataTable.no-footer {
    border-bottom: 0px;
}

table.table-bordered>thead>tr>th:last-child {
    border-right: 1px solid #ddd;
}

table.dataTable {
    border-collapse: collapse;
}

table.dataTable thead .sorting {
    background-image: none;
}

.dataTables_wrapper {
    width: 1280px;
    margin: 0 auto;
}

.dataTables_scrollHead,
.dataTables_scrollBody {
    width: 100% !important;
}

.dataTable>thead>tr>th[class*=sort]:after {
    content: none !important;
}

.DTFC_Cloned tbody tr:first-child td {
    border-top: 0px;
}

.DTFC_Cloned tbody tr td {
    vertical-align: middle;
}

.TableHeadTips {
    display: flex;
}

.TableHeadTips .box {
    width: 10px;
    height: 10px;
    margin-top: 6px;
}

.TableHeadTips .msg {
    margin-right: 10px;
    margin-left: 3px;
    font-weight: normal;
    font-size: 12px;
    margin-top: 2px;
}

.GXupper {
    color: #fff;
    background-color: #008000;
}

.GXcurrent {
    color: #fff;
    background-color: #0400ff;
}

.GXnext {
    color: #fff;
    background-color: #b400ff;
}

</style>
<input type="hidden" id="workOrder_view" value="/WorkOrder/workOrderView">
<input type="hidden" id="workOrderItem_view" value="/WorkOrder/viewPickingList">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="tap-btn-wrap" style="display:none;">
        <div class="el-tap-wrap edit">
            <span data-status="0" class="el-tap ">未排</span>
            <span data-status="1" class="el-tap active">主排程</span>
            <span data-status="2" class="el-tap">细排程</span>
        </div>
    </div>
    <div class="el-panel-wrap">
        <div class="searchItem" id="searchForm">
            <input type="text" id="status" style="display: none;">
            <input type="text" id="pageNnber" style="display: none;" value="1">
            <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">物料号</label>
                                    <input type="text" name="materiel_no" class="el-input" placeholder="请输入物料号"
                                        value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                    <input type="text" name="productOrder_no" class="el-input"
                                        placeholder="请输入生产订单号" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item work_shift_name">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                                        <input type="text" name="salesOrderCode" class="el-input" placeholder="请输入销售订单号"
                                            value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                                        <input type="text" name="salesOrderProjectCode" class="el-input"
                                            placeholder="请输入销售订单行项号" value="">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工单号</label>
                                        <input type="text" name="workOrder_no" class="el-input" placeholder="请输入工单号"
                                            value="">
                                    </div>
                                </div>
                                <div class="el-form-item work_station_time">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">计划日期</label>
                                        <input type="text" style="background-color: #fff !important;"
                                            id="work_station_time"
                                            name="workStationTime" readonly class="el-input" placeholder="请输入计划日期"
                                            value="">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item work_shift_name">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">浪潮销售订单号</label>
                                        <input type="text" name="inspurSalesOrderCode" class="el-input"
                                            placeholder="请输入浪潮销售订单号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item work_shift_name">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">浪潮物料号</label>
                                        <input type="text" name="inspurMaterialCode" class="el-input"
                                            placeholder="请输入浪潮物料号" value="">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit"
                                data-item="Unproduced_from">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <table id="DataTable" class="table table-striped table-bordered dataTable no-footer nowrap"
                style="width: 100% !important;table-layout: fixed;"></table>
        </div>

        <div class="item_table_page" style="margin-top: 30px;display: none;" id="showPickingList">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap edit">
                    <span data-status="1" class="el-item-tap active">领料单</span>
                    <span data-status="2" class="el-item-tap">退料单</span>
                    <span data-status="7" class="el-item-tap">补料单</span>
                    <span data-status="8" class="el-item-tap">报工单</span>
                </div>
            </div>
            <div class="show_item_table_page">

            </div>

        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
<script src="/statics/common/DataTables/media/js/jquery.dataTables.min.js"></script>
<script src="/statics/common/DataTables/extensions/FixedColumns/js/dataTables.fixedColumns.min.js"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/work_report.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection