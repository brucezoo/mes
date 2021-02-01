{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#ser-content input {
		width: 200px;
		display: inline-block !important;
	}

	#ser-content .layui-form-item {
		margin-left: 20px;
		margin: 10px;
	}

	#ser-content {
		width: 610px;
		display: inline-block !important;
	}

	#ser-content .layui-form-item {
		display: inline-block !important;
	}

	.layui-form-label {
		margin: 10px 10px !important;
		text-align: right;
	}

	#none {
		background: #fff;
		display: none;

	}

	.act-none {
		border: 1px solid #bbb;
		border-top: 0;
		border-bottom-right-radius: 5px;
		border-bottom-left-radius: 5px;
		position: absolute !important;
		z-index: 8888 !important;
		display: block !important;
	}

	.act-display {
		border: 1px solid #bbb;
		border-bottom: 0;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
	}

	input[type="checkbox"] {
		/* display: inline-block; // 设置为 行内块 就能改变大小了 */
		width: 26px !important;
		height: 26px !important;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: #fff;
		border-radius: 3px;
		border: 1px solid #888;
		background-image: url("/statics/custom/img/xz.png") !important;
		background-size: 0px 0px;
	}

	input[type="checkbox"]:checked {
		background-image: url("/statics/custom/img/xz.png") !important;
		background-size: 100% 100%;
	}

</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div>
	<button type="button" id="add" class="layui-btn layui-btn-primary layui-btn-sm">添加</button>
	<hr class="layui-bg-gray">
	<div id="ser-content">
		<div id="display">
			<div class="layui-form-item">
				<label class="">销售订单号</label>
				<input type="text" id="xs_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入销售订单号" class="layui-input">
			</div>
			<div class="layui-form-item">
				<label class="">销售订单行项</label>
				<input type="text" id="hx" name="title" lay-verify="title" autocomplete="off" placeholder="请输入销售订单行项" class="layui-input">
			</div>
		</div>
		<div id="none">
			<div class="layui-form-item">
				<label class="">生产订单号</label>
				<input type="text" id="sc_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入生产订单号" class="layui-input">
			</div>
			<div class="layui-form-item">
				<label class="" style="margin-right: 30px;">物料编码</label>
				<input type="text" id="wl_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入物料编码" class="layui-input">
			</div>
		</div>

	</div>

	<i class="layui-icon layui-icon-down" id="i"></i>
	<button type="button" class="layui-btn layui-btn-normal" style="margin-left: 30px;" id="search">搜索</button>
	<button type="button" class="layui-btn layui-btn-primary" id="reset">重置</button>
</div>

<div>
	<table class="layui-table">
		<thead>
			<tr>
				<th>
					<!-- <input type="checkbox" lay-skin="primary" id="all"> -->
				</th>
				<th>销售订单</th>
				<th>销售订单行项</th>
				<th>生产订单</th>
				<th>工单</th>
				<th>物料号</th>
				<th width='150'>物料名称</th>
				<th>数量</th>
				<th>单位</th>
				<th>批次</th>
				<th>工厂</th>
				<th>库存地点</th>
				<th>库龄</th>
			</tr>
		</thead>
		<tbody id="tbody">

		</tbody>
	</table>
	<div id="demo2"></div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/consume/consume.js"></script>
@endsection