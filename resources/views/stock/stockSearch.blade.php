{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#ser-content input {
		width: 190px;
		display: inline-block !important;
	}

	#ser-content .layui-form-item {
		margin-left: 20px;
		margin: 10px;
	}

	#ser-content {
		/* width: 620px; */
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
		width: 610px;
	}

	.act-display {
		border: 1px solid #bbb;
		border-bottom: 0;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		width: 610px;
	}

	.layui-form-label {
		width: 90px;
		margin-left: -20px !important;
		margin-top: 0px !important;
	}

	.layui-input-block {
		margin-left: 93px !important;
	}

	input[type="checkbox"] {
		/* display: inline-block; // 设置为 行内块 就能改变大小了 */
		width: 20px !important;
		height: 20px !important;
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
	<div id="ser-content">
		<div id="display">
			<div class="layui-form-item">
				<label class="">销售订单号</label>
				<input type="text" id="xs_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入销售订单号" class="layui-input">
			</div>
			<div class="layui-form-item">
				<label class="" style="margin-right: 1px;">销售订单行项</label>
				<input type="text" id="hx" name="title" lay-verify="title" autocomplete="off" placeholder="请输入销售订单行项" class="layui-input">
			</div>
		</div>
		<div id="none">
			<div>
				<div class="layui-form-item">
					<label class="">生产订单号</label>
					<input type="text" id="sc_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入生产订单号" class="layui-input">
				</div>
				<div class="layui-form-item">
					<label class="" style="margin-right: 30px;">物料编码</label>
					<input type="text" id="wl_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入物料编码" class="layui-input">
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<label class="" style="margin-right:13px; ">仓库名称</label>
					<input type="text" id="ck_name" name="title" lay-verify="title" autocomplete="off" placeholder="请输入仓库名称" class="layui-input">
				</div>
				<div class="layui-form-item">
					<label class="" style="margin-right: 30px;">仓库编码</label>
					<input type="text" id="ck_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入仓库编码" class="layui-input">
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<label class="" style="margin-right:40px; ">工单</label>
					<input type="text" id="gd_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入工单" class="layui-input">
				</div>
				<div class="layui-form-item">
					<label class="" style="margin-right: 60px;">数量</label>
					<input type="text" id="unit_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入数量" class="layui-input">
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<label class="" style="margin-right: 10px;">工厂名称</label>
					<input type="text" id="gc_name" name="title" lay-verify="title" autocomplete="off" placeholder="请输入工厂名称" class="layui-input">
				</div>
				<div class="layui-form-item">
					<form class="layui-form" action="" lay-filter="example">
						<label class="layui-form-label" style="width:100px; ">显示0库存</label>
						<div class="layui-input-block">
							<select name="interest" lay-filter="aihao" id="kc_type">
								<option value="" id="mr">是否显示0库存</option>
								<option value="0">是</option>
								<option value="1">否</option>
							</select>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	<i class="layui-icon layui-icon-down" id="i"></i>
	<button type="button" class="layui-btn layui-btn-normal" style="margin-left: 30px;" id="search">搜索</button>
	<button type="button" class="layui-btn layui-btn-primary" id="reset">重置</button>
	<button type="button" class="layui-btn layui-btn-primary" id="batch">批量查询</button>
</div>
<div>
	<table class="layui-table">
		<thead>
			<tr>
				<th>
					<input type="checkbox" lay-skin="primary" id="all">
				</th>
				<th>实时库存ID</th>
				<th>销售订单/行项</th>
				<th>生产订单</th>
				<th>工单</th>
				<th>物料编码</th>
				<th width='120'>物料名称</th>
				<th>工厂</th>
				<th>仓库</th>
				<th>仓库编码</th>
				<th>数量</th>
				<th>单位</th>
				<th>操作</th>
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
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/stock/stockSearch.js"></script>
@endsection