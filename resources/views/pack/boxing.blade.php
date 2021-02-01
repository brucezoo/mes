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
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.mobile.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div style="margin-bottom:20px; border-bottom:1px solid #f0f0f0;padding-bottom:20px;padding-top:10px;">
                            <label style="">班次&nbsp;&nbsp;</label>
                            <select name="bc" lay-verify=""  id="bc" >
                                <option value="">--- 请选择 ---</option>
                                <option value="A">白班</option>
                                <option value="B">夜班</option>
                                <option value="O">长白班</option>
                            </select>
                            <label style="margin-left:20px;">生产线&nbsp;&nbsp;</label>
                            <select name="bc" lay-verify=""  id="bz" >
                                <option value="">--- 请选择 ---</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                            </select>
                            <label for="" style="margin-left:20px;">排产日期&nbsp;&nbsp;</label>
                            <input type="text" id="date" style="width:150px;" class="el-input" placeholder="选择日期" autocomplete="off" value="">
                            <button type="button" id="btn-search" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:5px;">搜索</button>
                            <label style="margin-left:20px;" id="lab">托盘码&nbsp;&nbsp;</label>
                            <input type="text" readonly="readonly" id="inTab"/>
                            <button type="button" id="btn-tp" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:5px;">选择托盘</button>
                            <label style="margin-left:20px;" >打包人&nbsp;&nbsp;</label>
                            <input type="text" id="daBao"/>
                            <button type="button" id="btn-zt" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:5px;">装托</button>
                            <!-- <button type="button" id="btn-dy" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:20px;">单张打印</button> -->
                            <!-- <button type="button" id="btn-pd" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:20px;">批量打印</button> -->
                    </div>
    <div id="tab" style="height:400px; width:100%; border:1px solid #333;overflow: hidden;overflow-y: auto;  display:inline-block;"  >
            <table class="layui-table">
                <!-- <colgroup>
                    <col width="150">
                    <col width="200">
                    <col>
                </colgroup> -->
                <thead>
                    <tr>
                        <th>销售订单号</th>
                        <th>销售订单行项目</th>
                        <th>物料</th>
                        <th>物料描述</th>
                        <th>排产日期</th>
                        <th>总订单数量</th>
                        <th>待报数</th>
                        <th width="80">装箱数</th>
                        <th>装箱人</th>
                        <th>单位</th>
                        <th>备注</th>
                        <th>操作</th>
                    </tr> 
                </thead>
                <tbody id="td">
                </tbody>
            </table>
    </div>
    
    <div style="margin-top:10px; height:360px;border:1px solid #333;overflow: hidden;overflow-y: auto;">
        <table class="layui-table">
                <colgroup>
                    <col width="150">
                    <col width="200">
                    <col>
                </colgroup>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" id="all-choice">
                            全选
                        </th>
                        <th>箱号</th>
                        <th>订单号/行项号</th>
                        <th>物料号</th>
                        <th>物料描述</th>
                        <th>入箱数量</th>
                        <th>装箱人</th>
                        <th>班次</th>
                        <th>生产线</th>
                        <th>出口国</th>
                    </tr> 
                </thead>
                <tbody id="tds">
                </tbody>
        </table>
    </div>
    <!-- <div id="printList" style="width:360px;display:none;"></div>
    <div id="printLists" style="display:none;"></div> -->
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
    <script src="/statics/custom/js/pack/boxing.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>
  
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
@endsection