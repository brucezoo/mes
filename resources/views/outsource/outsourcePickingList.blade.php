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
                                        <label class="el-form-item-label" style="width: 109px;">单号</label>
                                        <input type="text" id="code" class="el-input" placeholder="请输入单号" value="">
                                    </div>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 109px;">类型</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="type_code" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    <li data-id="ZY03" class="el-select-dropdown-item kong">委外定额领料(ZY03)</li>
                                                    <li data-id="ZB03" class="el-select-dropdown-item kong">委外补料(ZB03)</li>
                                                    <li data-id="ZY06" class="el-select-dropdown-item kong">委外定额退料(ZY06)</li>
                                                    <li data-id="ZY05" class="el-select-dropdown-item kong">委外超耗补料(ZY05)</li>
                                                    <li data-id="ZY04" class="el-select-dropdown-item kong">委外超发退料(ZY04)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ul class="el-item-hide">
                                <li>
                                    <div class="el-form-item" style="width: 100%;">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 109px;">创建时间</label>
                                            <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                            <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 109px;">创建人</label>
                                            <input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                                            <input type="text" id="salesOrderCode" class="el-input" placeholder="请输入销售订单号" value="">
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">供应商编码</label>
                                            <input type="text" id="supplierCode" class="el-input" placeholder="请输入供应商编码" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">采购仓储地</label>
                                            <input type="text" id="DWERKS" class="el-input" placeholder="请输入采购仓储地" value="">
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
                                <button type="button" class="el-button print_all">合并打印</button>
                                <button type="button" class="el-button export" id="exportBtn"><a id='exportExcel'>导出</a></button>
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
                            <th class="left nowrap tight">
                                <span class="el-checkbox_input el-checkbox_input" id="check_input_all">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </th>
                            <th class="left nowrap tight">单号</th>
                            <th class="left nowrap tight">销售订单号/行项号</th>
                            <th class="left nowrap tight">供应商编码</th>
                            <th class="left nowrap tight">类型</th>
                            <th class="left nowrap tight">工厂</th>
                            <th class="left nowrap tight">采购仓储地</th>
                            <th class="left nowrap tight">员工</th>
                            <th class="left nowrap tight">创建时间</th>
                            <th class="left nowrap tight">状态</th>
                            <th class="left nowrap tight">采购凭证号</th>
                            <th class="left nowrap tight">打印次数</th>
                            <th class="right nowrap tight">操作</th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody"></tbody>
                    </table>
                </div>
                <div id="pagenation" class="pagenation unpro"></div>
            </div>
        </div>
        <div id="print_list" style="display: none;"></div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/outsource/otusource_picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection