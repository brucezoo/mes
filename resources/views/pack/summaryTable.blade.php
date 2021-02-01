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
     <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="btn-excel">  <a id="exportExcel" href= "">导出报表</a></button>
    <div style="margin-bottom:20px; border-bottom:1px solid #f0f0f0;padding-bottom:20px;padding-top:10px;">
        <label style="">销售订单&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="xs" autocomplete="off"  class="layui-input">
        <label style="">&nbsp;&nbsp;状态</label>
        <form class="layui-form" action="" style="display:inline-block;margin-left:5px;" >
        
            <select name="city" lay-verify=""  id="state" >
                <option value="0">--- 请选择 ---</option>
                <option value="1">待排产</option>
                <option value="3">待领料</option>
                <option value="2">待派工</option>
                <option value="4">待生产</option>
                <option value="5">生产中</option>
                <option value="6">完工</option>
            </select> 
        </form>
         
         <label style="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;行项号&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="hxh" autocomplete="off"  class="layui-input">
        <label style="">&nbsp;&nbsp;班次&nbsp;&nbsp;</label>            
            <form class="layui-form" action="" style="display:inline-block;margin-left:5px;" >
        
            <select name="city" lay-verify=""  id="bc" >
                <option value="0">--- 请选择 ---</option>
                <option value="A">白班</option>
                <option value="B">夜班</option>
                <option value="O">长白班</option>
            </select> 
        </form>
        <br>
        <br>
         <label style="">&nbsp;&nbsp;&nbsp;销售员&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="xsy" autocomplete="off"  class="layui-input">
        <!-- <label style="">&nbsp;&nbsp;客户编码&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="khbm" autocomplete="off"  class="layui-input"> -->
        <label style="">&nbsp;&nbsp;交期&nbsp;&nbsp;</label>
        <input type="text" name="date" style="display:inline-block;width:180px;" id="dates" lay-verify="date"  autocomplete="off" class="layui-input">
        <label style="">&nbsp;&nbsp;&nbsp;&nbsp;物料编码&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="wlbm" autocomplete="off"  class="layui-input">
        <label style="">&nbsp;&nbsp;产线&nbsp;&nbsp;</label>
        <form class="layui-form" action="" style="display:inline-block;margin-left:5px;" >
            <select name="city" lay-verify=""  id="cx" >
                <option value="0">--- 请选择 ---</option>
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
        </form>
        <button type="button" id="btn-tp" class="layui-btn layui-btn-sm"  style=" margin-top:-2px; margin-left:20px;">搜索</button>
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
                        <th>销售订单号</th>
                        <th width="80">行项目</th>
                        <th>状态</th>
                        <th>计划生产时间</th>
                        <th>物料</th>
                        <th>物料描述</th>
                        <th>规格</th>
                        <th>总数量</th>
                        <th>已打包数量</th>
                        <th>剩余数量</th>
                        <th>单位</th>
                        <th>完成率</th>
                        <th>计划完成日期</th>
                        <th>实际完成日期</th>
                        <th>班次</th>
                        <th>产线</th>
                        <th>备注</th>
                    </tr> 
                </thead>
                <tbody id="tbody">
                </tbody>
            </table>
    </div>
    <div style="display:none;">
        <table>
                <thead>
                    <tr>
                        <th>销售订单号</th>
                        <th width="80">行项目</th>
                        <th>状态</th>
                        <th>计划生产时间</th>
                        <th>物料</th>
                        <th>物料描述</th>
                        <th>规格</th>
                        <th>已打包数量</th>
                        <th>剩余数量</th>
                        <th>单位</th>
                        <th>完成率</th>
                        <th>计划完成日期</th>
                        <th>实际完成日期</th>
                        <th>班次</th>
                        <th>产线</th>
                        <th>备注</th>
                    </tr> 
                </thead>
                <tbody id="excel">
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
    <script src="/statics/custom/js/pack/summaryTable.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>
  
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
@endsection