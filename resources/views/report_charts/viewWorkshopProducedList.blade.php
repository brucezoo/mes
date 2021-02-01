{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="searchItem" id="searchForm">
        <form class="searchInve searchModal formModal" id="searchInve_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                            <input type="text" id="sale_order_code" class="el-input" placeholder="请输入销售订单号" value="">
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
                                <label class="el-form-item-label"style="width: 100px;">生产订单号</label>
                                <input type="text" id="po_number" class="el-input" placeholder="请输入生产订单号" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label"style="width: 100px;">工单号</label>
                                <input type="text" id="wo_number" class="el-input" placeholder="请输入工单号" value="">
                            </div>
                        </div>                        
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                <input type="text" id="item_no" class="el-input" placeholder="请输入物料编码" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料名称</label>
                                <input type="text" id="material_name" class="el-input" placeholder="请输入物料名称" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">厂区</label>
                                <input type="text" id="factory_name" class="el-input" placeholder="请输入厂区" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">仓库</label>
                                <input type="text" id="storage_depot_name" class="el-input" placeholder="请输入仓库" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">车间</label>
                                <input type="text" id="work_shop_name" class="el-input" placeholder="请输入车间" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">是否流转品</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="is_LZP_Text" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="is_LZP" value="">
                                    </div>
                                    <div class="el-select-dropdown list">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                            <li data-id="1" class="el-select-dropdown-item kong">是</li>
                                            <li data-id="0" class="el-select-dropdown-item kong">否</li>
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
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="auditStatusText" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="rwdo_status" value="">
                                    </div>
                                    <div class="el-select-dropdown list">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                            <li data-id="0" class="el-select-dropdown-item kong">待报工</li>
                                            <li data-id="1" class="el-select-dropdown-item kong">报工中</li>
                                            <li data-id="2" class="el-select-dropdown-item kong">已报工</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">入库类型</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="inbound_type_text" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="inbound_type" value="">
                                    </div>
                                    <div class="el-select-dropdown list">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                            <li data-id="1" class="el-select-dropdown-item kong">SAP领料</li>
                                            <li data-id="2" class="el-select-dropdown-item kong">车间领料</li>
                                            <li data-id="3" class="el-select-dropdown-item kong">其他</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">过账日期</label>

                                <input type="text" name="date" style ="width:200px;"  id="date2" lay-verify="date" placeholder="开始日期" autocomplete="off" class="layui-input">-
                                <input type="text" name="date" style ="width:200px;"  id="date" lay-verify="date" placeholder="结束日期" autocomplete="off" class="layui-input">

                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                    <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                    <button type="button" class="el-button el-button--primary submit">搜索</button>
                    <button type="button" class="el-button reset">重置</button>
                    <button type="button" class="el-button"> <a id="exportExcel" href= "">导出</a></button>
                </div>
            </div>
          </div>
        </form>
    </div>

<div class="table_page">
    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
        <table id="table_inventory_table" class="sticky uniquetable commontable">
            <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap">销售订单/行项</th>
                    <th class="left nowrap">生产订单</th>
                    <th class="left nowrap">工单</th>
                    <th class="left nowrap">物料编码</th>
                    <th class="left nowrap">物料名称</th>
                    <th class="left nowrap">数量</th>
                    <th class="left nowrap">单位</th>
                    <th class="left nowrap">批次号</th>
                    <th class="left nowrap">厂区</th>
                    <th class="left nowrap">仓库</th>
                    <th class="left nowrap">车间</th>
                    <th class="left nowrap">报工状态</th>
                    <th class="left nowrap">库龄</th>
                    <th class="right nowrap">入库类型</th>

                    <th class="right nowrap">过账日期</th>
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

@section("inline-bottom")
<script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/reportCharts/viewWorkshopProduceList.js?v={{$release}}"></script>
<script src="/statics/custom/js/reportCharts/reportChartsUrl.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
@endsection