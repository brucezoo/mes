{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routingDoc.css?v={{$release}}">
    {{--<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">--}}

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <input type="text" id="add_check_checkbox" value="" style="display: none;">
            <form class="searchOutsource searchModal formModal" id="outsource_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">采购凭证编号</label>
                                    <input type="text" id="search_EBELN" class="el-input" placeholder="请输入采购凭证编号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">采购组</label>
                                    <input type="text" id="search_EKGRP" class="el-input" placeholder="请输入采购组" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">公司代码</label>
                                        <input type="text" id="search_BUKRS" class="el-input" placeholder="请输入公司代码" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 150px;">供应商或债权人的帐号</label>
                                        <input type="text" id="search_LIFNR" class="el-input" placeholder="请输入供应商或债权人的帐号" value="">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                                        <input type="text" id="search_VBELN" class="el-input" placeholder="请输入销售订单号" value="">
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
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div" style="height: 300px; overflow-y: auto; overflow-x: hidden;">
                <table id="outsource_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th></th>
                        <th>销售订单号</th>
                        <th>采购凭证编号</th>
                        <th>公司代码</th>
                        <th>采购凭证类别</th>
                        <th>采购凭证类型</th>
                        <th>供应商或债权人的帐号</th>
                        <th>供应商或债权人的名称</th>
                        <th>采购组织</th>
                        <th>采购组</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody">
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
        <div class="item_table_page" style="margin-top: 30px;">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap edit">
                    <span class="el-item-tap active">委外工单</span>
                </div>
            </div>
            <div class="show_item_table_page" style="height: 300px; overflow-y: auto; overflow-x: hidden;">

            </div >

        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/technologyRouting-out.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/otusource_picking_list_customer.js?v={{$release}}"></script>

@endsection