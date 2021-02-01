{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/gantt/Gantt.css?v={{$release}}" />
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routingDoc.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div style = "">
    <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="ability">添加能力</button>
    <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="save">一键保存</button>
    <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;" id="printOut"><a href="" id="printOuta">导出</a></button>
    <button type="button" class="layui-btn layui-btn-normal layui-btn-sm" id="test8">导入</button> 
    <button type="button" class="layui-btn layui-btn-sm" id="test9">上传</button>
    <div style = "float:right;">
            <label>语言:</label>
            <select style="width:150px;" id="list">
            </select>
            <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;margin-top:-3px;" id="translate">翻译</button>
    </div>
    <hr class="layui-bg-gray">
</div>
<div class = "table">
    <table class="layui-table">
        <thead>
            <tr>
                <th><input type="checkbox" id="choice"> 全选</th>
                <th>编码</th>
                <th>名称</th>
                <th>name</th>
                <th>描述</th>
                <th>description</th>
            </tr> 
        </thead>
        <tbody id="tbody">
          
        </tbody>
    </table>
</div>

<div id="demo2-1"></div>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
     <!-- 二维码 -->
    <!-- <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script> -->
    <script src="/statics/common/el/qrcode.min.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/technologyRouting.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>
    <script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/translate/translate.js?v={{$release}}"></script>

  
@endsection