{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<style>
	#ser-content {
		/* width: 650px; */
		width: 100%;
		background: #ffffff;
		border-radius: 5px;
		/* position: absolute;
		z-index: 999;
		top: 7px; */
	}

	#display {
		width: 100%;
		display: flex;
		margin-top: -8px !important;
	}

	#display>div {
		flex: 1;
		display: flex;
	}

	#display>div .lab {
		flex: 4;
	}

	#display>div .inp {
		flex: 6;
	}

	#none {
		width: 100%;
		display: flex;
	}

	#none>div {
		flex: 1;
	}

	#none>div>.layui-form-item {
		display: flex;
		margin-top: 10px;
	}

	#none>div>.layui-form-item>.lab {
		flex: 4;
	}

	#none>div>.layui-form-item>.inp {
		flex: 6;
	}

	.lab {
		margin-left: 10px;
		margin-top: 10px;
	}

	.inp {
		margin-right: 10px;
	}

	.act {
		background: #F8F8FF !important;
	}

	.layui-form-item {
		padding-top: 10px;
		margin-bottom: 10px;
	}

	#display>.layui-form-item {
		margin-bottom: 0px;
	}

	#i {
		cursor: pointer;
		margin-left: 10px;
	}

	#mid-content {
		display: flex;
		width: 100%;
		margin-top: 20px;
	}

	#ser-contents {
		flex: 4;
		position: relative;
	}

	#ser-contents>div {
		position: absolute;
		top: -12px;
		z-index: 8888;
	}

	#btn {
		flex: 6;
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
<div style="height: 800px">
	<div>
		<button type="button" class="layui-btn layui-btn-primary layui-btn-xs" id="add">添加</button>
		<!-- <button type="button" class="layui-btn layui-btn-primary layui-btn-xs" id="load">批量下载</button> -->
		<hr class="layui-bg-gray">
	</div>

	<div id="mid-content">
		<div id="ser-contents">
			<div id="ser-content">
				<div style="height: 10px"></div>
				<div id="display">
					<div class="layui-form-item">
						<div class="lab">
							<label class="">销售订单号</label>
						</div>
						<div class="inp">
							<input id="order" type="text" placeholder="请输入销售订单号" name="title" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
					<div class="layui-form-item">
						<div class="lab">
							<label class="">名称</label>
						</div>
						<div class="inp">
							<input id="name" type="text" placeholder="请输入名称" name="title" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
				</div>
				<div id="none" style="display: none">
					<div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">创建开始时间</label>
							</div>
							<div class="inp">
								<input type="text" name="date" id="date_bg_start" lay-verify="date" placeholder="请输入开始时间" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item ">
							<div class="lab">
								<label class="">创建人</label>
							</div>
							<div class="inp">
								<input id="person" type="text" placeholder="请输入创建人" name="title" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item ">
							<div class="lab">
								<label class="">编码</label>
							</div>
							<div class="inp">
								<input id="code" type="text" placeholder="请输入编码" name="title" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
					</div>
					<div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">创建结束时间</label>
							</div>
							<div class="inp">
								<input type="text" name="date" id="date_bg_end" lay-verify="date" placeholder="请输入结束时间" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item ">
							<div class="lab">
								<label class="">物料号</label>
							</div>
							<div class="inp">
								<input id="wl_code" type="text" placeholder="请输入物料号" name="title" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item ">
							<div class="lab">
								<label class="">销售行项号</label>
							</div>
							<div class="inp">
								<input id="item" type="text" placeholder="请输入销售行项号" name="title" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="btn">
			<i class="layui-icon layui-icon-down" id="i"></i>
			<button type="button" id="search" class="layui-btn layui-btn-primary" style="margin-left:20px;">搜索</button>
			<button type="button" id="reset" class="layui-btn layui-btn-primary">重置</button>

		</div>
	</div>

	<div style="margin-top: 30px;">
		<table class="layui-table">
			<thead>
				<tr>
					<th><input type="checkbox" lay-skin="primary" id="all"></th>
					<th>缩略图</th>
					<th>销售订单号/行项号</th>
					<th>图纸编码</th>
					<th>图纸名称</th>
					<th>图纸来源</th>
					<th>创建人</th>
					<th>创建时间</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody id="tbody">

			</tbody>
		</table>
	</div>
	<div id="demo2"></div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="https://cdn.bootcss.com/jszip/3.2.2/jszip.js"></script>
<script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
<script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/offcut/waterCode.js"></script>
@endsection