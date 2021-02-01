{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#content {
		width: 100%;
		height: 100%;
		display: flex;
	}

	#content>div {
		width: 380px;
		margin-top: 10px;
		height: 500px;
		border-radius: 5px;

	}
	#con>div {
		margin-top: 20px;
	}

	.p td {
		font-size: 16px;
		margin-left: 10px;
		margin-top: 15px;
	}

	.p {
		display: flex;
	}

	body .demo-class {
		background-color: red !important;
	}

	.demo-class .layui-layer-title {
		background-color: rgb(0, 0, 0, 0) !important;
		border: 0px !important;
		color: #fff !important;
		font-size: 20px !important;
	}

	.demo-class .layui-layer {
		background-color: rgb(0, 0, 0, 0) !important;
		border: 0px !important;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div>
	<table class="layui-table">
		<thead>
			<tr>
				<th>出/入库</th>
				<th>实时库存ID</th>
				<th>销售订单/行项</th>
				<th>生产订单</th>
				<th>工单</th>
				<th width='120'>物料名称</th>
				<th>创建时间</th>
				<th>仓库</th>
				<th>出/入库类型</th>
				<th>数量</th>
				<th>操作</th>
			</tr>
		</thead>
		<tbody id="tbody">

		</tbody>
	</table>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/stock/stockSee.js"></script>
@endsection