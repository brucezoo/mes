{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<style>
	b {
		color: red;
	}

	input {
		width: 200px !important;

	}

	.layui-form-label {
		width: 120px;
	}

	select {
		width: 200px;
	}

	#_form {
		display: flex;
		width: 100% !important;
	}

	.left {
		width: 30%;
	}

	.right {
		width: 70%;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
	<ul class="layui-tab-title">
		<li class="layui-this" style="font-size: 16px;">共耗单信息</li>
		<button style="position: absolute; right:20px;" type="button" style="margin-left: 20px;" class="layui-btn layui-btn-sm" id="save">保存</button>
	</ul>
	<div class="layui-tab-content">
		<div class="layui-tab-item layui-show">
			<div id="chance" style="margin-top: 40px !important;">
				<form class="layui-form" action="" id="_form">
					<div class="left" >
						<div class="layui-form-item" style="margin-top:10px;">
							<label class="layui-form-label">共耗单编码<b>*</b></label>
							<!-- <div class="layui-input-block"> -->
								<input type="text" id="gh_code" name="title" lay-verify="title" autocomplete="off" placeholder="" class="layui-input" disabled="disabled">
							<!-- </div> -->
						</div>
						<div class="">
							<label class="layui-form-label">责任人<b>*</b></label>
							<div class="layui-input-inline">
								<select name="modules" lay-verify="required" lay-search="" id="zr" disabled="disabled">

								</select>
							</div>
						</div>
					</div>

					<div class="middle" >
						<div class="layui-form-item">
							<label class="layui-form-label">成本中心<b>*</b></label>
							<div class="layui-input-inline">
								<select name="modules" lay-verify="required" lay-search="" id="cb" disabled="disabled">

								</select>
							</div>
						</div>
						<div class="layui-form-item">
							<label class="layui-form-label">共耗类型<b>*</b></label>
							<div class="layui-input-block">
								<select name="interest" lay-filter="aihao" id="gh" disabled="disabled">

								</select>
							</div>
						</div>
					</div>

					<div class="right" style="width: 300px;margin-left: 40px">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">库存差异原因<span class="mustItem">*</span></label>
								<div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material63394" class="stockreason_id"></div>
								<button type="button" data-id="63394" class="button pop-button select">选择</button>
							</div>
							<p class="errorMessage" style="padding-left: 20px;"></p>
						</div>
					</div>

				</form>
			</div>
		</div>
	</div>
</div>

<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief" style="margin-top: 40px !important;">
	<ul class="layui-tab-title">
		<li class="layui-this" style="font-size: 16px;">明细</li>
	</ul>
	<div class="layui-tab-content">
		<div class="layui-tab-item layui-show">

			<div>
				<table class="layui-table">
					<thead>
						<tr>
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
							<th>操作</th>
						</tr>
					</thead>
					<tbody id="tbody">

					</tbody>
				</table>
				<div id="demo2"></div>
			</div>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/consume/consumeAdd.js"></script>
@endsection