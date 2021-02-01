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
<div style="min-height: 400px;">
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
						<label class="" style="margin-right: 30px;">报工单号</label>
						<input type="text" id="bg_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入报工单号" class="layui-input">
					</div>
				</div>
				<div>
					<div class="layui-form-item">
						<label class="" style="margin-right:13px; ">开始时间</label>
						<input type="text" name="date" id="date" lay-verify="date" placeholder="开始时间" autocomplete="off" class="layui-input">
					</div>
					<div class="layui-form-item">
						<label class="" style="margin-right: 30px;">结束时间</label>
						<input type="text" name="date" id="date1" lay-verify="date" placeholder="结束时间" autocomplete="off" class="layui-input">
					</div>
				</div>
				<div>
					<div class="layui-form-item">
						<label class="" style="margin-right:40px; ">工单</label>
						<input type="text" id="gd_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入工单" class="layui-input">
					</div>
					<div class="layui-form-item">
						<form class="layui-form" action="" lay-filter="example">
							<label class="layui-form-label" style="width:100px; ">报工状态</label>
							<div class="layui-input-block">
								<select name="interest" lay-filter="aihao" id="bg_type">
									<option value="" id="bgzt">-- 请选择 --</option>
									<option value="2">报工完成</option>
									<option value="1">未推送</option>
								</select>
							</div>
						</form>
					</div>
				</div>
				<div>
					<div class="layui-form-item">
						<label class="" style="margin-right: 10px;">物料编码</label>
						<input type="text" id="wl_code" name="title" lay-verify="title" autocomplete="off" placeholder="请输入物料编码" class="layui-input">
					</div>
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
					<th>是否转厂</th>
					<th>销售订单/行项</th>
					<th>生产订单</th>
					<th>工单</th>
					<th>报工单号</th>
					<th style="padding:0px 0px !important;" width="30%">
						<table>
							<tr>
								<th width="30%" style="border-top:0;border-left:0;border-bottom:0;">物料编码</th>
								<th width="50%" style="border-top:0;border-left:0;border-bottom:0;">产出品名称</th>
								<th width="20%" style="border:0;">数量</th>
							</tr>
						</table>
					</th>
					<th>创建时间</th>
					<th>报工状态</th>
					<th>责任人</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody id="tbody">

			</tbody>
		</table>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/reportWorkers.js"></script>
@endsection