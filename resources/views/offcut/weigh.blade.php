<!DOCTYPE html>
<html lang="en">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta charset="utf-8" />
	<title>地磅称重</title>
	<meta name="description" content="overview &amp; stats" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
	{{--icon--}}
	<link rel="shortcut icon" href="/statics/custom/img/favicon.ico" type="image/x-icon" />
	<link rel="stylesheet" href="/statics/custom/css/offcutWeight/offcutWeight.css?v={{$release}}" />
	<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
	<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">

	<style>
		.layui-tab-title li {
			font-size: 30px;
			margin-right: 30px;
		}

		.font {
			font-size: 25px;
		}

		table td {
			color: #333 !important;
			text-align: left !important;
			height: 23px !important;
			font-size: 16px !important;
		}

		table {
			margin-top: 0px !important;
		}

		#tab1 thead>tr {
			display: table;
			width: 99.9%;
			table-layout: fixed;
			font-size: 20px !important;
		}

		thead th {
			font-size: 20px !important;
		}

		#tab1 tbody {
			display: block;
			height: 250px;
			overflow: hidden;
			overflow-y: scroll;
		}

		#tab1 tbody>tr {
			display: table;
			width: 102.2%;
			table-layout: fixed;
		}

		#weigh {
			margin-top: 20px;
		}

		#weigh label {
			font-size: 25px;
		}

		#weigh input {
			height: 60px !important;
			margin-left: 10px;
			width: 80%;
			border-color: #333 !important;
			display: inline-block !important;
			font-size: 22px;
			color: #333;
		}

		#get {
			margin-top: 60px;
		}

		#get input {
			height: 80px;
			margin-left: 10px;
			width: 300px;
			border-color: #bbb !important;
			display: inline-block !important;
			font-size: 30px;
		}

		#get button {
			height: 80px;
			margin-top: -13px;
			margin-left: 10px;
			font-size: 30px !important;
			width: 120px;
			color: white;
			background: #1E9FFF;
			border: 0;
		}

		input[type="checkbox"] {
			/* display: inline-block; // 设置为 行内块 就能改变大小了 */
			width: 30px !important;
			height: 30px !important;
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

		#condition {
			font-size: 25px;
			margin: 20px;
		}

		#condition label {
			position: relative;
			top: -5px;
		}

		#offcut_fac {
			margin-bottom: 10px;
		}

		.factory_item_active {
			background: #009688;
			color: #FFF;
		}

		.offcut_item_active {
			background: #009688;
			color: #FFF;
		}

		#div {
			font-weight: 800;
		}


	</style>

</head>

<body>
	<div>


		<!-- tab -->
		<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
			<ul class="layui-tab-title">
				<li class="layui-this">称重</li>
				<li>称重清单</li>
				<li>已推送清单</li>
			</ul>
			<img src="/statics/custom/img/fh.png" class="back" onclick="javascript: history.go(-1);" style="position: absolute;right:15px;top:-25px;width: 50px;height: 50px;margin-top: 25px;" />
			<div class="layui-tab-content" style="height: 100px;">
				<div class="layui-tab-item layui-show">
					<div style="display: flex;margin-bottom: 10px; margin-top:30px;">
						<div style="flex: 8; ">
							<div id="div">
								<div style="display: flex;flex-direction: row;">
									<div class="font" style="flex: 1;height: 100px;text-align: left;line-height: 100px;">工厂</div>
									<div style="flex: 9" class="factorys" id="offcut_fac"></div>
								</div>
								<div id="divs">

								</div>
								<div id="get">
									<input type="text" name="title" lay-verify="title" autocomplete="off" id="val" value="" class="  layui-input">
									<button type="button" id="get" style="font-size:25px;" class="layui-btn layui-btn-primary">获&nbsp;取</button>
									<button class="submit_offcut" id="submit" style="cursor: pointer; height:80px; width:220px; font-size:50px;">提&nbsp;&nbsp;交</button>
								</div>

							</div>
						</div>
						<div style="flex:2;">
							<div id="tbody">

							</div>
						</div>

					</div>


				</div>
				<div class="layui-tab-item">
					<div id="condition">
						<button id="push" type="button" class="layui-btn layui-btn-primary">推送</button>
					</div>
					<table class="layui-table">
						<thead>
							<tr>
								<th width="5%"><input id="xz" type="checkbox" name="" lay-skin="primary"></th>
								<th width='200'>边角料</th>
								<th>称重号</th>
								<th>毛重</th>
								<th>框重</th>
								<th>净重</th>
								<th>单位</th>
								<th>称重日期</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody id="tbodys">

						</tbody>
					</table>
					<div id="demo1"></div>
				</div>
				<div class="layui-tab-item">
					<div id="conditions" style="margin-bottom:20px; margin-top:20px;">
						<label style="font-size:20px;">开始日期：</label><input type="text" id="start" style="width:200px; display:inline-block;" name="date" lay-verify="date" placeholder="" autocomplete="off" class="layui-input">
						<label style="font-size:20px;">-- 结束日期：</label><input type="text" id="end" style="width:200px; display:inline-block;" name="date" lay-verify="dates" placeholder="" autocomplete="off" class="layui-input">
						<button type="button" id="search" style="margin-top:-3px; font-size:18px;" class="layui-btn layui-btn-normal">搜索</button>
						<button type="button" id="load" style="margin-top:-3px; font-size:18px;" class="layui-btn layui-btn-normal"><a style="color:#fff;" id="loading">导出</a></button>
					</div>
					<table class="layui-table">
						<thead>
							<tr>
								<th width='150'>边角料</th>
								<th>称重号</th>
								<th>毛重</th>
								<th>框重</th>
								<th>净重</th>
								<th>单位</th>
								<th>称重日期</th>
							</tr>
						</thead>
						<tbody id="t_bodys">

						</tbody>
					</table>
					<div id="demo2"></div>
				</div>
			</div>
		</div>


	</div>

	<script src="../../statics/common/el/layui.all.js?v={{$release}}"></script>
	<script src="../../statics/common/layer/layer.js"></script>
	<script src="../../statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>

	<!-- 自定义的公共js -->
	<script type="text/javascript" src="../../statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
	<script src="../../statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
	<script src="../../statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}
	<script src="../../statics/custom/js/offcut/weigh.js?v={{$release}}"></script>
	<script src="../../statics/custom/js/offcut/offcut_url.js?v={{$release}}"></script>

</body>

</html>