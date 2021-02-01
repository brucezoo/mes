{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}"> -->
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button el-button--primary submit save" style="display: none">保存</button>
                    <button type="button" class="el-button el-button--primary submit delete" style="display: none">删除未发料行项</button>
                    <button type="button" class="el-button el-button--primary submit print">打印</button>
                    <button type="button" class="el-button" onclick="javascript:history.back(-1);">返回</button>
                </div>
            </div>
        </div>
    <input type="hidden" id="status">
    <form id="addSBasic_form" class="formTemplate formStorage normal">
        <h3 id="picking_title"></h3>
        <div class="storage_blockquote">
            <h4>工单信息</h4>
            <div id="basic_form_show" class="basic_info" style="display: flex;">



            </div>
        </div>
        <div class="storage_blockquote">
            <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
            <div class="basic_info">
                <div class="table-container">
                    <table class="storage_table item_table table-bordered">
                        <thead>
                        <tr>
                            <th  class="thead" id="salere">销售订单</th>
                            <th  class="thead" id="showCombine" style="display: none;">合并工单</th>
                            <th  class="thead">编码</th>
                            <th  class="thead">名称</th>
                            <th  class="thead show_all_old" style="display: none;">领料单行项状态</th>
                            <th  class="thead show_all_old" style="display: none;">浪潮物料编码</th>
                            <th  class="thead" id="rbqty">定额数量</th>
                            <th  class="thead" id="runit">定额单位</th>
                            <th  class="thead show_feeding" style="display:none;">补料原因</th>
                            <th  class="thead" id="deport" style="display: none">仓库</th>
                            <th  class="thead">批次</th>
                            <th  class="thead remark" style="display:none;">备注</th>
                            <th class="thead" id="operation"></th>
                        </tr>
                        </thead>
                        <tbody class="t-body" id="show_item">
                        <tr>
                            <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="print_list" style="display: none;"></div>
    </form>
    </div>
@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/view_picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>

@endsection