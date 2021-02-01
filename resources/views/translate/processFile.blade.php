{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<style>
	#tab {
		width: 1000px;
		height: 350px;
		background: #f0f0f0;
		display: flex;
		font-size: 18px;
		color: #333;
	}

	#tab select {
		float: right;
	}

	#tab>div {
		width: 50%;
	}

	#tab input {
		width: 180px;
		display: inline-block;
		float: right;
	}

	#tab>div>p {
		margin: 20px 15px;
	}
</style>

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div>
	<div>
		<button type="button" id="search" class="layui-btn layui-btn-primary">Search</button>
		<!-- <button type="button" id="export" class="layui-btn layui-btn-primary">Export</button> -->
	</div>
	<div id="" style="width:100%;">

		<table class="layui-table">
			<thead>
				<tr>
					<th>Bill Of Material</th>
					<th width="100">Name</th>
					<th>Optional BOM</th>
					<th>Quantity (unit)</th>
					<th>Grouping</th>
					<th>State</th>
					<th>Effective Version</th>
					<th>Material Types</th>
					<th>Material Classification</th>
					<th>Source</th>
					<th>Founder</th>
					<th>Creation Time</th>
					<th>Operation</th>
				</tr>
			</thead>
			<tbody id="tbody">

			</tbody>
		</table>
	</div>
</div>

<div id="demo2"></div>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js"></script>
<script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/translate/processFile.js?v={{$release}}"></script>
@endsection