{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button el-button--primary submit print" style="margin-right: 20px; margin-bottom: 10px;">打印</button>
                </div>
            </div>
        </div>
        <form id="addSBasic_form" class="formTemplate formStorage normal">
            <h3 id="picking_title"></h3>
            <div class="storage_blockquote">
                <h4>工单信息</h4>
                <div id="basic_info_show" class="basic_info" style="display: flex;">
                </div>
            </div>
            <div class="storage_blockquote">
                <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 </h4>

                <div class="basic_info">
                    <div class="table-container">
                        <table class="storage_table item_table table-bordered">
                            <thead>
                                <tr>
                                    <th class="center">编码</th>
                                    <th class="center">名称</th>
                                    <th class="center">浪潮物料编号</th>
                                    <th class="center">领单信息</th>
                                    <th class="center">总数量</th>
                                    <th class="center">单位</th>
                                    <th class="center">实到数量</th>
                                </tr>
                            </thead>
                            <tbody class="table-body">
                                <tr>
                                    <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </form>

    </div>

@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/edit_picking_all_items.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection