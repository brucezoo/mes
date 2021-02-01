{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<style>
	#tab {
		width: 1000px;
		height: 270px;
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
		width: 320px;
		display: inline-block;
		float: right;
	}

	#tab>div>p {
		margin: 20px 15px;
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

	#ser-content {
		width: 620px;
		background: #ffffff;
		border-radius: 5px;
		display: inline-block;
		position: absolute;
		z-index: 999;
	}

	#display {
		width: 100%;
		display: flex;
	}

	#display>div {
		/* flex: 1; */
		display: flex;
	}

	#display>div:nth-child(1) {
		flex: 7;
	}

	#display>div:nth-child(2) {
		flex: 3;
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

	#btn {
		margin-left: 620px;
		margin-top: 10px;
	}

	.layui-form-item {
		margin-top: 10px;
		margin-bottom: 10px;
	}

	#display>.layui-form-item {
		margin-bottom: 0px;
	}

	#i {
		cursor: pointer;
		margin-left: 10px;
	}
</style>

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div id="ser-content">
	<div id="display">
		<div class="layui-form-item">
			<div class="lab">
				<label class="">Sales order</label>
			</div>
			<div class="inp">
				<input id="material" type="text" style="width:300px;margin-left:-50px;" name="title" lay-verify="title" autocomplete="off" class="layui-input">
			</div>
		</div>
		<div class="layui-form-item">
			<div class="lab">
				<label class="" style="width: 150px;">Sales order item</label>
			</div>
			<div class="inp">
				<input id="sales" type="text" style="width: 50px;" name="title" lay-verify="title" autocomplete="off" class="layui-input">
			</div>
		</div>
	</div>
	<div id="none" style="display: none">
		<div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">Material no</label>
				</div>
				<div class="inp">
					<input id="no" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">
				</div>
			</div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">Drawing name</label>
				</div>
				<div class="inp">
					<input id="draw" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">
				</div>
			</div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">creationtime(start)</label>
				</div>
				<div class="inp">
					<input type="text" name="date" id="date" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input">
				</div>
			</div>
		</div>
		<div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">creator</label>
				</div>
				<div class="inp">
					<input id="creator" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">
				</div>
			</div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">Drawing code</label>
				</div>
				<div class="inp">
					<input id="code" type="text" name="title" lay-verify="title" autocomplete="off" class="layui-input">
				</div>
			</div>
			<div class="layui-form-item">
				<div class="lab">
					<label class="">(end)</label>
				</div>
				<div class="inp">
					<input type="text" name="date1" id="date1" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input">
				</div>
			</div>
		</div>
	</div>
</div>
<div id="btn">
	<i class="layui-icon layui-icon-down" id="i"></i>
	<button type="button" id="search" class="layui-btn layui-btn-primary" style="font-size: 20px;margin-left:20px;">Search</button>
	<button type="button" id="reset" class="layui-btn layui-btn-primary" style="font-size: 20px;">Reset</button>
	<button type="button" class="layui-btn layui-btn-primary" id="download"><a href="" id="a" style="font-size: 20px;">Download</a></button>
</div>
<div id="" style="width:100%;margin-top:50px;">

	<table class="layui-table">
		<thead>
			<tr>
				<th><input type="checkbox" id='checkAll' lay-skin="primary" style="position: relative; top:5px;"><label for="checkAll" style="margin-left: 10px; line-height:30px;">Check all</label></th>
				<th>Thumbnail</th>
				<th>Sales order / Item </th>
				<th>Material no </th>
				<th width='500'>Material name</th>
				<th>Version</th>
				<th>Creator</th>
				<th>Creation time</th>
			</tr>
		</thead>
		<tbody id="tbody">

		</tbody>
	</table>
</div>


<div id="demo2"></div>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js"></script>
<script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/translate/attachment.js?v={{$release}}"></script>
@endsection