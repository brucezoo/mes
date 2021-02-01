{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
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
                                <label class="el-form-item-label" style="width: 100px;">销售订单</label>
                                <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">销售订单行项</label>
                                <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项" value="">
                            </div>
                        </div>
                    </div>
                    <ul class="el-item-hide">
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">生产订单</label>
                                    <input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单" value="">
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
                                    <label class="el-form-item-label" style="width: 100px;">计划日期</label>
                                    <input type="text" id="plan_start_time" class="el-input" placeholder="请输入计划日期" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">排产日期</label>
                                    <input type="text" id="plan_start_date" class="el-input" placeholder="请输入排产日期" value="">
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
            <div class="wrap_table_div">
                <table id="product_order_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>计划工厂</th>
                            <th>生产工厂</th>
                            <th>车间</th>
                            <th>销售订单/行项</th>
                            <th>生产订单</th>
                            <th>工单号</th>
                            <th>物料号</th>
                            <th>物料描述</th>
                            <th>计划日期</th>
                            <th>排产日期</th>
                            <th>计划量</th>
                            <th>报工数量</th>
                            <th>报工日期</th>
                            <th>领料日期</th>
                            <th>出库数量</th>
                            <th>出库日期</th>
                            <th>订单状态</th>
                            <th>报工投料比</th>
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
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/custom/js/reportCharts/reportChartsUrl.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/reportCharts/viewWorkshopList.js?v={{$release}}"></script>
@endsection