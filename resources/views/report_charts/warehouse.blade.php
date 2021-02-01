{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/common/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#ser-content {
		/* width: 620px; */
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
		flex: 3.5;
		position: relative;
	}

	#ser-contents>div {
		position: absolute;
		top: -12px;
		z-index: 8888;
	}

	#btn {
		flex: 5;
	}

	#switch {
		flex: 1.5;
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
<!-- 批次追溯报表 -->
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div id="mid-content">
		<div id="ser-contents">
			<div id="ser-content">
				<div style="height: 10px"></div>
				<div id="display">
					<div class="layui-form-item">
						<div class="lab">
							<label class="">销售订单</label>
						</div>
						<div class="inp">
							<input id="xs_code" type="text" placeholder="销售订单" name="title" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
						<div class="inp">
							<input id="hx_code" type="text" name="title" placeholder="行项" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
					<div class="layui-form-item">
						<div class="lab">
							<label class="">物料</label>
						</div>
						<div class="inp">
							<input id="wl_code" type="text" name="title" placeholder="请输入物料号" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
				</div>
				<div id="none" style="display: none">
					<div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">生产订单</label>
							</div>
							<div class="inp">
								<input id="sc_code" type="text" name="title" placeholder="请输入生产订单" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">报工开始日期</label>
							</div>
							<div class="inp">
								<input type="text" name="date" id="date_bg_start" lay-verify="date" placeholder="请输入报工开始日期" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">收货开始日期</label>
							</div>
							<div class="inp">
								<input type="text" name="date" id="date_sh_start" lay-verify="date" placeholder="请输入收货开始日期" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">加工车间</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="">
									<select name="interest" lay-filter="aihao" id="jg">
										<option value="">请选择</option>
									</select>
								</form>
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">是否收货</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="" id="dds">
									<select name="interest" lay-filter="aihao" id="sh">
										<option value="0">否</option>
										<option value="1">是</option>
									</select>
								</form>
							</div>
						</div>
						<div class="layui-form-item ishow" style="display: none;">
							<div class="lab">
								<label class="">是否确认</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="" id="dds">
									<select name="interest" lay-filter="aihao" id="qr">
										<option value="0">否</option>
										<option value="1">是</option>
									</select>
								</form>
							</div>
						</div>
					</div>
					<div>
						<div class="layui-form-item ishow" style="display: none;">
							<div class="lab">
								<label class="">物料凭证</label>
							</div>
							<div class="inp">
								<input id="wlpz" type="text" name="title" placeholder="请输入物料凭证" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">生产工厂</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="">
									<select name="interest" lay-filter="aihao" id="gc">
										<option value="">请选择</option>
									</select>
								</form>
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">报工结束日期</label>
							</div>
							<div class="inp">
								<input type="text" name="date1" id="date_bg_end" lay-verify="date" placeholder="请输入报工结束日期" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">收货结束日期</label>
							</div>
							<div class="inp">
								<input type="text" name="date1" id="date_sh_end" lay-verify="date" placeholder="请输入收货结束日期" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item noshow">
							<div class="lab">
								<label class="">委外加工点</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="">
									<select name="modules" lay-verify="required" lay-search="" id="ww">
										<option value="">直接选择或搜索选择</option>
									</select>
								</form>
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
			<button type="button" id="download" class="layui-btn layui-btn-primary noshow">导出</button>
			<button type="button" id="load" class="layui-btn layui-btn-primary ishow" style="display: none;">下载模板</button>
			<button type="button" class="layui-btn layui-btn-primary ishow" style="display:none;" id="test8">导入</button>
			<button type="button" class="layui-btn layui-btn-primary ishow" style="display:none;" id="test9">上传</button>
			<button type="button" id="del" class="layui-btn layui-btn-primary ishow" style="display: none;">删除</button>
			<button type="button" id="save" class="layui-btn layui-btn-primary ishow" style="display: none;">确认</button>
		</div>
		<div id="switch">
			<form class="layui-form" action="">
				<label class="layui-form-label" style="margin-right: -10px; width:200px;">当前：<span id="inter">入库查询界面</span></label>
				<div class="layui-input-block">
					<input type="checkbox" id="test" name="close" lay-skin="switch" lay-filter="switch" lay-text="ON|OFF">
				</div>
			</form>
		</div>
	</div>
	<div style="margin-top:20px;" id="find">
		<table class="layui-table">
			<thead>
				<tr>
					<th>计划工厂 </th>
					<th>生产工厂</th>
					<th>加工单位</th>
					<th>销售订单/行项目</th>
					<th>生产订单</th>
					<th>物料号</th>
					<th>物料描述</th>
					<th>订单数量</th>
					<th>报工数量 </th>
					<th>报工日期</th>
					<th>收货数量</th>
					<th>收货日期</th>
				</tr>
			</thead>
			<tbody id="tbody">

			</tbody>
		</table>
	</div>

	<div style="margin-top:20px;display: none;" id="operation" >
		<table class="layui-table">
			<thead>
				<tr>
					<th><input type="checkbox" lay-skin="primary" id="all"></th>
					<th>销售订单/行项目</th>
					<th>生产订单</th>
					<th>物料号</th>
					<th>物料描述</th>
					<th>收货数量</th>
					<th>收货日期</th>
					<th>物料凭证</th>
					<th>物料凭证行项</th>
					<th>物料凭证年度</th>
				</tr>
			</thead>
			<tbody id="t_body">

			</tbody>
		</table>
	</div>

	<div id="demo2"></div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.js?v={{$release}}"></script>
<script src="/statics/custom/js/reportCharts/warehouse.js?v={{$release}}"></script>
@endsection