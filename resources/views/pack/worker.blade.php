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

    <div style="margin-bottom:20px; border-bottom:1px solid #f0f0f0;padding-bottom:20px;padding-top:10px;">
                            <label style="">柜号&nbsp;&nbsp;</label>
                            <input type="text" name="title" lay-verify="title" style="display:inline-block;width:200px;" id="gh" autocomplete="off"  class="layui-input">
                            <label style="">&nbsp;&nbsp;责任人&nbsp;&nbsp;</label>
                            <input type="text" name="title" lay-verify="title" style="display:inline-block;width:200px;" id="name" autocomplete="off"  class="layui-input">
                            <label style="margin-left:20px;">装柜时间&nbsp;&nbsp;</label>
                            <input type="text" name="date" style="display:inline-block;width:200px;" id="date" lay-verify="date"  autocomplete="off" class="layui-input">
                            <button type="button" id="btn-tp" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:20px;">装柜</button>
                    </div>
    <div id="tab" style="">
            <table class="layui-table">
                <!-- <colgroup>
                    <col width="150">
                    <col width="200">
                    <col>
                </colgroup> -->
                <thead>
                    <tr>
                        <th><input type="checkbox" id="all-choice"></th>
                        <th>托盘码</th>
                        <th>销售订单号</th>
                        <th>销售订单行项目</th>
                        <th>物料</th>
                        <th>数量</th>
                        <th>单位</th>
                        <th>备注</th>
                        <!-- <th>操作</th> -->
                    </tr> 
                </thead>
                <tbody id="tbody">
                    <!-- <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="width:120px;"><input type="text" style="width:120px;"></td>
                        <td></td>
                        <td></td>
                        <td style="width:160px;">
                            <div class="layui-btn-group">
                                <button type="button" class="layui-btn">增加</button>
                                <button type="button" class="layui-btn">删除</button>
                            </div>
                        </td>
                    </tr> -->
                </tbody>
            </table>
    </div>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/custom/js/pack/pack-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/technologyRouting.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
    <script src="/statics/custom/js/pack/worker.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>
  
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
@endsection