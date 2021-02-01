{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">报工单号</label>
                                    <input type="text" id="declare_order_code" class="el-input" placeholder="请输入报工单号" value="">
                                </div>
                            </div>

                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">工单号</label>
                                    <input type="text" id="wo_number" class="el-input" placeholder="请输入工单号" value="">
                                </div>
                            </div>
                        </div>

                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">生产订单号</label>
                                        <input type="text" id="po_number" class="el-input" placeholder="请输入生产订单号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">销售订单号</label>
                                        <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">物料号</label>
                                        <input type="text" id="material_code" class="el-input" placeholder="请输入物料号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">审核状态</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="qc_judge_status" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                    <li data-id="0" data-code="" data-name="未审核" class=" el-select-dropdown-item">未审核</li>
                                                    <li data-id="1" data-code="" data-name="已审核" class=" el-select-dropdown-item">已审核</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 13px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>报工单号</th>
                        <th>工单号</th>
                        <th>物料号</th>
                        <th>物料</th>
                        <th>计划数量</th>
                        <th>工厂</th>
                        <th>车间</th>
                        <th>生产订单号</th>
                        <th>销售订单号</th>
                        <th>销售订单行项</th>
                        <th>创建时间</th>
                        <th>审核状态</th>
                        <th>审核理由</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/product_order/toexamine.js?v={{$release}}>"></script>
@endsection
