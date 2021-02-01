{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
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

	.inps {
		display: flex;
	}

	.inps>div:nth-child(1) {
		flex: 3;
	}

	.inps>div:nth-child(2) {
		flex: 7;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div style="height: 800px">
	<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
		<ul class="layui-tab-title">
			<li class="layui-this">批量替换工作中心</li>
			<li>工艺进出料</li>
		</ul>
		<div class="layui-tab-content" style="height: 100px;">
			<div class="layui-tab-item layui-show">
				<div id="mid-content">
					<div id="ser-contents">
						<div id="ser-content">
							<div style="height: 10px"></div>
							<div id="display">
								<div class="layui-form-item">
									<div class="lab">
										<label class="">物料编码</label>
									</div>
									<div class="inp">
										<input id="wl_code" type="text" placeholder="请输入物料编码" name="title" lay-verify="title" autocomplete="off" class="layui-input">
									</div>
								</div>
								<div class="layui-form-item">
									<div class="lab">
										<label class="">工厂</label>
									</div>
									<div class="inp">
										<form class="layui-form" action="" id="dds">
											<select name="interest" lay-filter="aihao" id="fac">
											</select>
										</form>
									</div>
								</div>
							</div>
							<div id="none" style="display: none">
								<div>
									<div class="layui-form-item">
										<div class="lab">
											<label class="">是否确认替换</label>
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
									<div class="layui-form-item noshow">
										<div class="lab">
											<label class="">开始时间</label>
										</div>
										<div class="inp">
											<input type="text" name="date" id="date_bg_start" lay-verify="date" placeholder="请输入开始时间" autocomplete="off" class="layui-input">
										</div>
									</div>
									<div class="layui-form-item ishow">
										<div class="lab">
											<label class="">导入人</label>
										</div>
										<div class="inp" id="inp_drr">

										</div>
									</div>
								</div>
								<div>
									<div class="layui-form-item">
										<div class="lab">
											<label class="">是否推送</label>
										</div>
										<div class="inp">
											<form class="layui-form" action="" id="dds">
												<select name="interest" lay-filter="aihao" id="ts">
													<option value="0">否</option>
													<option value="1">是</option>
												</select>
											</form>
										</div>
									</div>
									<div class="layui-form-item ">
										<div class="lab">
											<label class="">结束时间</label>
										</div>
										<div class="inp">
											<input type="text" name="date" id="date_bg_end" lay-verify="date" placeholder="请输入结束时间" autocomplete="off" class="layui-input">
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
						<button type="button" class="layui-btn layui-btn-primary ishow" id="test8">导入</button>
						<button type="button" class="layui-btn layui-btn-primary ishow" id="test9">上传</button>
						<button type="button" id="download" class="layui-btn layui-btn-primary">下载模板</button>
						<button type="button" id="replace" class="layui-btn layui-btn-primary">批量替换</button>
						<button type="button" id="sap" class="layui-btn layui-btn-primary">批量推送</button>

					</div>
				</div>

				<div style="margin-top: 30px;">
					<table class="layui-table">
						<thead>
							<tr>
								<th><input type="checkbox" lay-skin="primary" id="all"></th>
								<th>物料</th>
								<th>工厂</th>
								<th>TL类型</th>
								<th>组</th>
								<th>ID</th>
								<th>工序行号</th>
								<th>工作中心</th>
								<th>短描述</th>
								<th>新工作中心</th>
								<th>导入人</th>
								<th>导入时间</th>
								<th>失败原因</th>
							</tr>
						</thead>
						<tbody id="tbody">

						</tbody>
					</table>
				</div>
				<div id="demo2"></div>
			</div>
			<div class="layui-tab-item ">
				<div class="inps">
					<!-- 导入 -->
					<div>
						<button type="button" class="layui-btn layui-btn-normal" id="test6">导入表</button>
						<button type="button" class="layui-btn" id="test7">上传</button>
					</div>

					<!-- 导出 -->
					<div>
						<!-- <div style="display: inline-block;">
							<form class="layui-form" action="">
								<label class="layui-form-label">工厂</label>
								<div class="layui-input-block" style="width: 200px;">
									<select name="interest" lay-filter="aihao" id="facs">
										<option value="">请选择</option>
									</select>
								</div>
							</form>
						</div> -->

						<button type="button" id="down" class="layui-btn layui-btn-primary">导出</button>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/practice/gadgets.js"></script>
@endsection