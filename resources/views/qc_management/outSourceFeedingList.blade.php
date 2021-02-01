{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">

    <input type="hidden" id="workOrder_view" value="/WorkOrder/viewPickingList">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">

        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="searchItem" id="searchForm">
                <form class="searchSTallo searchModal formModal" autocomplete="off" id="searchSTallo_from">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 109px;">销售订单号</label>
                                        <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                        <input type="text" id="po_number" class="el-input" placeholder="请输入生产订单号" value="">
                                    </div>
                                </div>
                            </div>
                            <ul class="el-item-hide">
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">委外采购订单</label>
                                            <input type="text" id="EBELN" class="el-input" placeholder="请输入委外采购订单" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">供应商编码</label>
                                            <input type="text" id="supplierCode" class="el-input" placeholder="请输入供应商编码" value="">
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">审核状态</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="repairstatus" value="">
                                                </div>
                                                <div class="el-select-dropdown list">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                        <li data-id="1" class="el-select-dropdown-item kong">已审核</li>
                                                        <li data-id="0" class="el-select-dropdown-item kong">未审核</li>
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
                                <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button reset">重置</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="table_page">
                <div class="wrap_table_div" >
                    <table id="work_order_table" class="sticky uniquetable commontable">
                        <thead>
                        <tr>
                            <th class="left nowrap tight">销售订单号/行项号</th>
                            <th class="left nowrap tight">生产订单号</th>
                            <th class="left nowrap tight">工单号</th>
                            <th class="left nowrap tight">单号</th>
                            <th class="left nowrap tight">采购申请编号</th>
                            <th class="left nowrap tight">采购申请项目编号</th>
                            <th class="left nowrap tight">供应商编码</th>
                            <th class="left nowrap tight">采购凭证号</th>
                            <th class="left nowrap tight">车间</th>
                            <th class="left nowrap tight">员工</th>
                            <th class="left nowrap tight">创建时间</th>
                            <th class="left nowrap tight">审核状态</th>
                            <th class="left nowrap tight">物料编码</th>
                            <th class="left nowrap tight">半成品详情</th>
                            <th class="right nowrap tight">操作</th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody"></tbody>
                    </table>
                </div>
                <div id="pagenation" class="pagenation unpro"></div>
            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/qc/outsourceReview/outSourceWorkShopReviewList.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection