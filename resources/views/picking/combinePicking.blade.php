{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v=1556950541?v={{$release}}">


@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-status="1" class="el-tap">主排工单</span>
            <span data-status="2" class="el-tap active">细排工单</span>
            <span data-status="0" class="el-tap ">合并领料单</span>
        </div>
        <div class="logBtnWrap">
            <i class="fa fa-file-text-o" id="showLog" aria-hidden="true" title="显示日志"></i>
        </div>
    </div>
    <div class="el-panel-wrap" style="margin-top: 20px;">

    </div>
    <div id="print_list" style="display: none;"></div>
</div>
<div class="logWrap" id="log">
    <div class="log-container">
        <div class="title">
            <span class="header">操作日志</span>
            <span class="close logClose"><i class="fa fa-close"></i></span>
        </div>
        <div class="log-content">
            <div class="log-modifier-user"></div>
            <div class="log-item-wrap">
                <div class="log-date-filter">
                    <span class="item-title"><i class="fa fa-tasks"></i>&nbsp;&nbsp;操作信息</span>
                    <div class="log-datepicker">
                        <label for="log-date"><i class="fa fa-calendar datepicker-icon"></i></label>
                        <input type="text" id="log-date" readonly class="log-datepicker-input" value="">
                    </div>
                </div>
                <div class="log-pagenation-wrap">
                    <div id="log-pagenation" class="log-pagenation"></div>
                </div>
                <div class="log-item-container">
                    <ul class="log-item-ul">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/picking/combinePicking.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/custom/js/picking/log.js?v={{$release}}"></script>

    {{--<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>--}}
    {{--<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>--}}

@endsection