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
<hr class="layui-bg-gray">
<div style="margin-bottom:20px; border-bottom:1px solid #f0f0f0;padding-bottom:20px;padding-top:10px;">
	<label style="">销售订单&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="xs" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;物料编码&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="wlbm" autocomplete="off" class="layui-input">

	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;行项号&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="hxh" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;发票号&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="fph" autocomplete="off" class="layui-input">
	<br>
	<br>
	<label style="">&nbsp;&nbsp;&nbsp;托盘号&nbsp;&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="tph" autocomplete="off" class="layui-input">
	<!-- <label style="">&nbsp;&nbsp;客户编码&nbsp;&nbsp;</label>
        <input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="khbm" autocomplete="off"  class="layui-input"> -->
	<label style="">&nbsp;&nbsp;装柜时间&nbsp;&nbsp;</label>
	<input type="text" name="date" style="display:inline-block;width:150px;" id="dates" lay-verify="date" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;装柜号&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="zgh" autocomplete="off" class="layui-input">
	<label style="">&nbsp;&nbsp;&nbsp;&nbsp;装柜人&nbsp;</label>
	<input type="text" name="title" lay-verify="title" style="display:inline-block;width:150px;" id="zgr" autocomplete="off" class="layui-input">
	<button type="button" id="btn-tp" class="layui-btn layui-btn-sm" style=" margin-top:-2px; margin-left:20px;">搜索</button>
</div>

<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
	<ul class="layui-tab-title">
		<li class="layui-this">汇总表</li>
		<li>明细表</li>
	</ul>
	<div class="layui-tab-content">

		<div id="tab1" class="hz layui-tab-item layui-show" style="">
			<table class="layui-table">
				<thead>
					<tr>
						<th width="80">月台</th>
						<th width="80">装柜人</th>
						<th>柜号</th>
						<th>装柜时间</th>
						<th>发票号</th>
						<th>客户SKU</th>
						<th>物料编码</th>
						<th width="120">规格</th>
						<th>总数量</th>
						<th>数量</th>
						<th>单位</th>
						<th>托盘号</th>
						<th>打包方式</th>
						<th>销售订单号/行项</th>
					</tr>
				</thead>
				<tbody id="tbod">
				</tbody>
			</table>
		</div>
		<div id="tab" class="mx layui-tab-item ">
			<table class="layui-table">
				<colgroup>
					<col width="150">
					<col width="200">
					<col>
				</colgroup>
				<thead>
					<tr>
						<th>柜号</th>
						<th>装柜时间</th>
						<th>托盘号</th>
						<th>打包方式</th>
						<th>打包时间</th>
						<th>销售订单号/行项</th>
						<th>物料</th>
						<th width="120">规格</th>
						<th>总数量</th>
						<th>数量</th>
						<th>单位</th>
						<th>月台</th>
						<th>发票号</th>
					</tr>
				</thead>
				<tbody id="tbody">
				</tbody>
			</table>
		</div>
	</div>
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
<script src="/statics/custom/js/pack/find.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>

<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
@endsection