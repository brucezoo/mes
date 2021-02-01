{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#contents {
		width: 100%;
		min-height: 300px;
		display: flex;
	}

	#left {
		width: 22%;
		border: 1px solid #e2e2e2;
	}

	#right {
		width: 76%;
		margin-left: 2%;
		border: 1px solid #e2e2e2;
	}

	#ul li {
		margin-top: 20px;
		margin-left: 20px;
		font-size: 16px;
	}

	caption {
		font-size: 18px;
		text-align: left;
		margin-left: 10px;
		color: #333;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div id="contents">
	<div id="left">
		<table class="layui-table" style="margin-top:0px; ">
			<tbody id="ul">

			</tbody>
		</table>
	</div>
	<div id="right">
		<!-- 进料 -->
		<table class="layui-table">
			<caption>进料信息</caption>
			<thead>
				<tr>
					<th>物料编码</th>
					<th width="180">物料名称</th>
					<th>批次号</th>
					<th>计划数量</th>
					<th>额定领料数量</th>
					<th>消耗数量</th>
					<th>单位</th>
				</tr>
			</thead>
			<tbody id="tbody1">

			</tbody>
		</table>

		<!-- 出料 -->
		<table class="layui-table">
			<caption>出料信息</caption>
			<thead>
				<tr>
					<th>物料编码</th>
					<th>物料名称</th>
					<th>批次号</th>
					<th>计划数量</th>
					<th>实报数量</th>
					<th>库存地</th>
				</tr>
			</thead>
			<tbody id="tbody2">

			</tbody>
		</table>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/reportDetails.js"></script>
@endsection