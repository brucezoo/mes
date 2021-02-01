{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">

<style>
	#content {
		width: 800px;
		min-height: 800px;
		margin: auto;
		margin-top: 160px;
	}

	.layui-form-label {
		min-width: 200px;
		font-size: 20px;
		color: #333;
		text-align: left;
	}

	#admin {
		width: 508px;
		height: 100px;
		border: 1px solid #bbb;
		margin-top: 20px;
		margin-bottom: 20px;
		margin-left: 18px;
	}

	#select,
	.inp {
		width: 326px !important;
	}
</style>
@endsection


{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div id="content">
	<form class="layui-form" action="">
		<div class="layui-form-item">
			<label class="layui-form-label">开启系统运维模式</label>
			<div class="layui-input-block">
				<input type="checkbox" name="close" id="close" lay-skin="switch" lay-filter="switchTest" lay-text="ON|OFF">
			</div>
		</div>

		<div class="layui-inline">
			<label class="layui-form-label">系统运维时间</label>
			<div class="layui-input-inline">
				<input type="text" name="date" id="date" lay-verify="date" placeholder="运维开始时间" autocomplete="off" class="layui-input">
			</div>
			<strong>--</strong>
			<div class="layui-input-inline">
				<input type="text" name="date1" id="date1" lay-verify="date" placeholder="运维结束时间" autocomplete="off" class="layui-input">
			</div>
		</div>
	</form>
	<div>
		<div id="admin" style="overflow:hidden; overflow-y: auto; "></div>
		<div class="layui-inline">
			<label class="layui-form-label">白名单</label>
			<div class="layui-input-inline inp">
				<input type="text" name="HandoverCompany" id="HandoverCompany" class="layui-input" style="position:absolute;z-index:2;width:95%;" lay-verify="required" autocomplete="off">
				<select id="selects" style="width: 327px;height:38px;">
				</select>
			</div>
		</div>
	</div>
</div>

@endsection

@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/account/maintain.js?v={{$release}}"></script>
@endsection