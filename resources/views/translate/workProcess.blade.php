<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
	<link rel="stylesheet" href="/statics/common/el/viewer.css">
	<title>Process View</title>
	<style>
		body {
			margin: 0px;
			padding: 0px;
		}

		#content {
			width: 100%;
		}

		#header {
			width: 1500px;
			margin: auto;
			height: 150px;
			line-height: 170px;
		}

		#header>h2 {
			text-align: center;
			margin-top: -20px;
		}

		#sear {
			width: 98%;
			height: 80px;
			margin: auto;
			display: flex;
		}

		#inp {
			flex: 8.5;
			display: flex;
		}

		#inp>div {
			flex: 3.3;
			display: flex;
		}

		.lab {
			flex: 3;
		}

		._block {
			flex: 7;
		}

		#inp>div input {
			/* width: 390px; */
			border-radius: 3px;
		}

		#inp>div .lab {
			width: 100%;
			margin-left: 40px;
			margin-top: 10px;
		}

		#btn {
			flex: 1.5;
		}

		#btn>button {
			margin-left: 20px;
		}

		.layui-colla-title {
			background: #fff;
			font-size: 20px;
		}

		.layui-icon {
			font-size: 20px;
		}

		.layui-colla-content {
			padding: 0;
			width: 100%;
		}

		#describe {
			min-height: 50px;
			display: flex;
			border-bottom: 1px solid #f0f0f0;
			flex-wrap: wrap;
		}

		#describe>div {
			line-height: 50px;
			margin-left: 20px;
		}

		#div6 {
			background: pink;
			color: red;
			padding: 5px 10px;
		}

		.workp {
			display: flex;
			min-height: 50px;
			border-bottom: 1px solid #f0f0f0;
		}

		.workp_left {
			flex: 1;
			text-align: center;
			margin: auto;
		}

		.workp_mid {
			flex: 9;
			border-left: 1px solid #f0f0f0;
		}

		#img,
		#pdf {
			width: 100;
			display: flex;
			min-height: 50px;
			border-bottom: 1px solid #f0f0f0;
		}

		.img_left,
		.pdf_left {
			flex: 1;
			text-align: center;
			margin: auto 0;
		}

		.img_right,
		.pdf_right {
			flex: 9;
			border-left: 1px solid #f0f0f0;
		}

		.pdf_right {
			display: flex;
			flex-wrap: wrap;
		}

		.pdf_right>div {
			margin-left: 20px;
			margin-top: 20px;
			margin-bottom: 20px;
		}

		.img_right {
			display: flex;
			flex-wrap: wrap;
		}

		.img_right>div {
			margin-left: 20px;
			margin-top: 20px;
			margin-bottom: 20px;
		}

		.div_in {
			display: flex;
			min-height: 50px;
			border-bottom: 1px solid #f0f0f0;
		}

		.div_two>div {
			margin-left: 20px;
			margin-top: 15px;
		}

		.div_one {
			flex: 1;
			text-align: center;
			margin: auto;
		}

		.div_two {
			flex: 9;
			display: flex;
			flex-wrap: wrap;
			border-left: 1px solid #f0f0f0;
		}

		.zma {
			background: #009688;
			padding: 5px 10px;
			color: #fff;
		}

		.des {
			background: #5FB878;
			padding: 5px 10px;
			color: #fff;
		}
	</style>
</head>

<body>
	<div id="content">
		<!-- header -->
		<div id="header">
			<h2>Process View</h2>
		</div>

		<!-- search -->
		<div id="sear">
			<div id="inp">
				<div class="_inp">
					<div class="lab">
						<label>Sales Order</label>
					</div>

					<div class="_block">
						<input type="text" name="title" id="salesOrder" lay-verify="title" autocomplete="off" class="layui-input">
					</div>
				</div>
				<div class="_inp">
					<div class="lab">
						<label>Sales Order Item</label>
					</div>

					<div class="_block">
						<input type="text" name="title" id="salesOrderItem" lay-verify="title" autocomplete="off" class="layui-input">
					</div>
				</div>
				<div class="_inp">
					<div class="lab">
						<label>Current Processr</label>
					</div>

					<div class="_block">
						<form class="layui-form" action="" id="dds">
							<select name="interest" lay-filter="aihao" id="curr">

							</select>
						</form>
					</div>
				</div>
			</div>
			<div id="btn">
				<button type="button" class="layui-btn layui-btn-primary" id="search">Search</button>
				<button type="button" class="layui-btn layui-btn-primary" id="back">Go Back</button>
			</div>
		</div>
		<!-- mid -->
		<div style="width: 98%; margin:auto;margin-bottom: 30px;">
			<div class="layui-collapse" lay-filter="test">

			</div>
		</div>

		<!-- footer -->
		<div></div>
	</div>
	<script type="text/javascript" src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="/statics/common/el/viewer.js"></script>
	<script type="text/javascript" src="/statics/custom/js/ajax-client.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/custom/js/functions.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/common/layui/layui.all.js"></script>
	<script type="text/javascript" src="/statics/custom/js/version/workProcess.js"></script>
</body>

</html>