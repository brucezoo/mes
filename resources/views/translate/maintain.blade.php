{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")

<style>
    .tab thead th {
        background: #fff;
        border-bottom: 1px solid #f0f0f0;
        line-height: 40px !important;
    }

    .tab td {
        border-bottom: 1px solid #f0f0f0;
        line-height: 40px !important;
    }

    .tab {
        width: 100%;
        border: 0;
    }
</style>

<link type="text/css" rel="stylesheet" href="/statics/common/el/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routingDoc.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/practice/img_upload.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div>
    <label>语言:</label>
    <select style="width:150px;" id="lists">
        <option id="one"></option>
    </select>
    <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;margin-top:-3px;" id="translates">翻译</button>
    <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;margin-top:-3px;" id="btn-save">保存</button>
</div>

<!-- <table class="layui-table">
    <thead>
        <tr>
            <th width="10%">物料编码</th>
            <th width="40%">物料名称</th> 
            <th width="50%">物料属性</th>
        </tr>
    </thead>
    <tbody id="tbody">

    </tbody>
    <tr>
        <td>Image</td>
        <td colspan="3">
            <div>
                <div id="imgDiv" style="width:90%;height:120px; border:1px dashed #333; margin-bottom:20px;">

                </div>

            </div>
            <div id="searchForm">
                <button type="button" id="g">获取图纸</button>
                <button type="button" class="el-button upload_select_img">上传图纸</button>
            </div>
        </td>
    </tr>
</table> -->

<div class="layui-collapse tab1" lay-accordion="" style="margin-top:20px;" id="con">

</div>


@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/ace/assets/js/moment.min.js"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<!-- 二维码 -->
<!-- <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script> -->
<script src="/statics/common/el/qrcode.min.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
<script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>

<!-- <script src="/statics/custom/js/translate/imgUp.js?v={{$release}}"></script> -->
<!-- <script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script> -->
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
<script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/bom/htmlEscapeTool.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/bom-url.js"></script>
<script src="/statics/custom/js/practice/img_upload.js?v={{$release}}"></script>
<script src="/statics/common/routing/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/auto-size.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/bom-add.js?v={{$release}}"></script>
<!-- <script src="/statics/custom/js/bom/log.js?v={{$release}}"></script> -->
<script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/qrcode.js?v={{$release}}"></script>

<script src="/statics/custom/js/translate/maintain.js?v={{$release}}"></script>

@endsection