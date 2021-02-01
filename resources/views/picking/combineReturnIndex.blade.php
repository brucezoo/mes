{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-status="2" class="el-tap active">工单</span>
                <span data-status="1" class="el-tap ">合并退料单</span>
            </div>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">

        </div>
        <div id="print_list" style="display: none;"></div>

    </div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/picking/combineReturn.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    {{--<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>--}}
    {{--<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>--}}
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>

@endsection