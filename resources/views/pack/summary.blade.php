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
<button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="btn-excel"> <a id="exportExcel" href="">导出报表</a></button>
<div style="margin-bottom:20px; border-bottom:1px solid #f0f0f0;padding-bottom:20px;padding-top:10px;">
	<label style="">托盘号&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="tph" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;销售订单&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="xs" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;打包人&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="dbr" autocomplete="off" class="layui-input">
	<label style="margin-left:20px;">打包时间&nbsp;&nbsp;</label>
	<input type="text" name="date" style="display:inline-block;width:150px;" id="date" lay-verify="date" autocomplete="off" class="layui-input">
	<label style="margin-left:20px;">托盘状态&nbsp;&nbsp;</label>
	<select id="state">
		<option value="">-- 请选择 --</option>
		<option value="1">已装柜</option>
		<option value="2">未装柜</option>
	</select>
	<br>
	<br>
	<label style="">行项号&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="hxh" autocomplete="off" class="layui-input">

	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销售员&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="xsy" autocomplete="off" class="layui-input">
	<!-- <label style="">&nbsp;&nbsp;客户编码&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="khbm" autocomplete="off"  class="layui-input"> -->
	<label style="margin-left:20px;">&nbsp;交期&nbsp;&nbsp;</label>
	<input type="text" name="date" style="display:inline-block;width:150px;" id="dates" lay-verify="date" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;物料编码&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="wlbm" autocomplete="off" class="layui-input">
	<button type="button" id="btn-tp" class="layui-btn layui-btn-sm" style=" margin-top:-2px; margin-left:20px;">搜索</button>
</div>


<div id="tab" style="border:1px solid #333;width:56%;height:700px;display:inline-block;overflow: hidden;
			overflow:auto; ">
	<table class="layui-table">
		<!-- <colgroup>
                    <col width="150">
                    <col width="200">
                    <col>
                </colgroup> -->
		<thead>
			<tr>
				<td colspan="13">
					<h3>汇总表</h3>
				</td>
			</tr>
			<tr>
				<th style="display:none;"></th>
				<th>托盘码</th>
				<th>打包时间</th>
				<th>打包人</th>
				<th>打包方式</th>
				<th>销售订单</th>
				<th>行项号</th>
				<th>物料编码</th>
				<th>规格</th>
				<th>总数量</th>
				<th>数量</th>
				<th>单位</th>
				<th>库位</th>
				<th>备注</th>
			</tr>
		</thead>
		<tbody id="tbody">
		</tbody>
	</table>


</div>

<div id="" style="border:1px solid #333;width:44%;height:700px;float:right;display:inline-block;border-left:0px;overflow: hidden;
			overflow:auto;">
	<table class="layui-table" style="width:100% !important">
		<!-- <colgroup>
                    <col width="150">
                    <col width="200">
                    <col>
                </colgroup> -->
		<thead>
			<tr>
				<td colspan="9">
					<h3>明细表</h3>
				</td>
			</tr>
			<tr>
				<th>箱号</th>
				<th>销售订单</th>
				<th>行项号</th>
				<th>物料编码</th>
				<th>规格</th>
				<th>总数量</th>
				<th>数量</th>
				<th>单位</th>
				<th>备注</th>
			</tr>
		</thead>
		<tbody id="tbod">
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
<script src="/statics/custom/js/pack/summary.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>

<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
@endsection