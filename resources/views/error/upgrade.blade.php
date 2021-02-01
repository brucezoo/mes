<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Page Not Found</title>

	<!-- Fonts -->
	<link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">
	<link rel="stylesheet" href="/statics/common/layui/css/layui.css">

	<!-- Styles -->
	<link type="text/css" rel="stylesheet" href="/statics/custom/css/error/error.css">
</head>

<body>
	<div class="flex-center position-ref full-height">
		<div class="content">
			<div class="title" style="background: linear-gradient(-90deg, #29bdd9 0%, #276ace 100%);
             -webkit-background-clip: text;
             color: transparent;font-size: 30px;
             font-family:'微软雅黑';font-weight: bold">
				MES系统运维中，预计运维时间{{$upgrade_begin_time}} 至 {{$upgrade_end_time}} 在此期间,请勿操作,感谢配合！
				<div style="width: 216px; margin: auto; ">
					<button id="_btn" type="button" class="layui-btn layui-btn-fluid layui-btn-normal" style=" font-size: 20px;margin-top:30px;">跳转到登录界面...</button>
				</div>
			</div>
		</div>
	</div>


	<script type="text/javascript" src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
	<script src="/statics/common/layui/layui.all.js"></script>
	<script>
		$('body').on('click', '#_btn', function() {
			window.location.href = '/AccountManagement/login';
		})
	</script>
</body>

</html>