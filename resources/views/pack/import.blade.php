{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">

<style>
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
		width: 620px;
	}

	.act-display {
		border: 1px solid #bbb;
		border-bottom: 0;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		width: 620px;
	}

	.layui-form-label {
		width: 90px;
		margin-left: -20px !important;
		margin-top: 0px !important;
	}

	.layui-input-block {
		margin-left: 93px !important;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="layui-upload">
	<button type="button" class="layui-btn layui-btn-normal" id="test8">导入计划表</button>
	<button type="button" class="layui-btn" id="test9">上传</button>
	<button type="button" class="layui-btn layui-btn-normal" style="margin-left:10px !important;" id="btn-pc">排产</button>
	<button type="button" class="layui-btn layui-btn-normal" style="margin-left:10px !important;" id="btn-ch">撤回排产</button>
	<button type="button" class="layui-btn layui-btn-normal" id="btn-ll">领料标记</button>
	<button type="button" class="layui-btn layui-btn-normal" id="btn-set">修改分线</button>
	<button type="button" class="layui-btn layui-btn-normal" id="btn-del">批量删除</button>
	<hr class="layui-bg-gray">


	<!-- 搜索 -->
	<div id="ser-content">
		<div id="display">
			<div class="layui-form-item">
				<label for="" style="margin-left:10px;margin-right:10px;">销售订单号</label>
				<input type="text" name="title" id='order' lay-verify="title" autocomplete="off" placeholder="" class="layui-input">
			</div>
			<div class="layui-form-item">
				<label class="" style="margin-left:20px;margin-right:26px;">行项目</label>
				<input type="text" name="title" id="row" lay-verify="title" autocomplete="off" placeholder="" class="layui-input">
			</div>
		</div>
		<div id="none">
			<div>
				<div class="layui-form-item">
					<label class="layui-form-label" style="margin-left:10px;margin-right:10px;">状态</label>
					<form class="layui-form" action="" lay-filter="example">
						<div class="layui-input-block">
							<select name="city" lay-verify="" id="state">
								<option value="0">--- 请选择 ---</option>
								<option value="1">待排产</option>
								<option value="3">待领料</option>
								<option value="2">待派工</option>
								<option value="4">待生产</option>
								<option value="5">生产中</option>
								<option value="6">完工</option>
							</select>
						</div>
					</form>
				</div>
				<div class="layui-form-item">
					<label class="layui-form-label">班次</label>
					<form class="layui-form" action="">
						<div class="layui-input-block">
							<select name="city" lay-verify="" id="search-bc">
								<option value="0">--- 请选择 ---</option>
								<option value="A">白班</option>
								<option value="B">夜班</option>
								<option value="O">长白班</option>
							</select>
						</div>
					</form>
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<label class="layui-form-label">产线</label>
					<form class="layui-form" action="">
						<div class="layui-input-block">
							<select name="city" lay-verify="" id="search-cx">
								<option value="0">--- 请选择 ---</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
							</select>
						</div>
					</form>
				</div>
				<div class="layui-form-item">
					<label for="" style="margin-left:20px;margin-right:13px;">排产日期</label>
					<input type="text" name="date" id="date2" lay-verify="date" placeholder="" autocomplete="off" class="layui-input">
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<label for="" style="margin-right:5px;">计划完成日期</label>
					<input type="text" name="date" id="date3" lay-verify="date" placeholder="" autocomplete="off" class="layui-input">
				</div>
			</div>
		</div>
	</div>
	<i class="layui-icon layui-icon-down" style="margin-left:20px;" id="i"></i>
	<button class="layui-btn layui-btn-primary" style="margin-left: 30px;" id="search">搜索</button>
	<hr class="layui-bg-gray">
</div>

<div id="tab" style="margin-top:50px;  ">
	<table class="layui-table">
		<thead>
			<tr>
				<th style="width:80px !important;">
					<input type="checkbox" id="all-choice">
				</th>
				<th width="145">销售订单号/行项</th>
				<th>排产日期</th>
				<th width="120">计划完成日期</th>
				<th>物料</th>
				<th style="width: 100px !important;">物料描述</th>
				<th>总订单数量</th>
				<th>单位</th>
				<th>客户描述</th>
				<th>班次</th>
				<th>产线</th>
				<th>状态</th>
				<th>备注</th>
			</tr>
		</thead>
		<tbody id="tbody"></tbody>
	</table>
</div>
<div id="printList" style="display:none;"></div>
<div id="demo1" style="display:inline-block;"></div><label for="" id="now" style="margin-left:10px;"></label><label style="margin-left:10px;" for="" id="total"></label>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/pack/pack-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/pack/import.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>

@endsection