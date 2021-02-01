{{--继承父模板--}}
@extends("layouts.base")

<style>
.print-box {width: 130mm; height: 70mm; border: 1px solid #000; border-radius: 2mm; padding: 2mm;}
.print-box-body{display: flex; margin-top: 4mm;}
.print-box-body .info{width: 100%; padding-left: 2mm;}
.print-box-body .info table{font-size: 4.5mm; width: 100%; font-weight: bold;}
.print-box-body .info table tr:first-child{border-top: 0.1mm solid #000;}
.print-box-body .info table tr{border-bottom: 0.1mm solid #000;}
.print-box-body .info table tr td:first-child{border-right: 0.1mm solid #000;}
.print-box-body .info table tr td{padding: 2mm;}
</style>

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/device.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
@endsection

<div class="div_con_wrapper" style="background-color: #fff;">
    <div class="table_page">
        <div class="wrap_table_div">
            <table id="workhour_table" class="sticky uniquetable commontable" style="display:none;"></table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="//cdn.bootcss.com/purl/2.3.1/purl.min.js"></script>
    <script src="//cdn.bootcss.com/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/device-listQRcode.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
@endsection

<div style="display:none;">