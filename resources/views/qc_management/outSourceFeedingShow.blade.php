{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    {{--<button type="button" class="el-button el-button--primary submit save">保存</button>--}}
                    <button type="button" class="el-button el-button--primary submit review">审核</button>
                </div>
            </div>
        </div>
    </div>
    <form id="addSBasic_form" class="formTemplate formStorage normal">
        <h3 id="show_title"></h3>
        <div class="bom_blockquote">
            <input type="hidden" id="out_picking_id">
            <h3>基本信息</h3>
            <div style="display: flex;">
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative;width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">采购凭证编号</label>
                            <input type="text" id="EBELN" readonly="readonly" disabled class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 60px;">单号</label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" readonly id="code" class="el-input" placeholder="请输入单号" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>

                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 150px;">采购申请编号</label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" readonly id="BANFN" class="el-input" placeholder="请输入采购申请编号" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative;width: 100%;">
                            <label class="el-form-item-label" style="width: 150px;">加工商</label>
                            <input type="text" id="partner_name" readonly="readonly" disabled class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>
                <div>
                    <div class="el-form-item">
                        <div class="el-form-item-div" style="position: relative;width: 100%;">
                            <label class="el-form-item-label" id="change_lable" style="width: 150px;">采购申请的项目编号</label>
                            <input type="text" id="BNFPO" readonly="readonly" disabled class="el-input" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 30px;"></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="storage_blockquote">
            <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
            <div class="basic_info">
                <div class="table-container">
                    <table class="storage_table item_table table-bordered item_outsource_table">
                        <thead>
                        <tr>
                            <th  class="thead">销售订单号</th>
                            <th  class="thead">生产订单号</th>
                            <th  class="thead">物料编号</th>
                            <th  class="thead">物料名称</th>
                            <th  class="thead">物料属性</th>
                            <th  class="thead">批次</th>
                            <th  class="thead">车间</th>
                            <th  class="thead">库存数</th>
                            <th  class="thead">额定数量</th>
                            <th  class="thead">需求量</th>
                            <th  class="thead">实发数量</th>
                            <th  class="thead">计量单位</th>
                        </tr>
                        </thead>
                        <tbody class="t-body">
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
@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/outsourceReview/outSourceWorkShopReview.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection