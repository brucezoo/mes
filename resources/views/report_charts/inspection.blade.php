{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/common/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#ser-content {
		width: 620px;
		background: #ffffff;
		border-radius: 5px;
		display: inline-block;
		position: absolute;
		z-index: 999;
		top: 7px;
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

	#btn {
		margin-left: 620px;
		margin-top: 10px;
		display: inline-block;
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

	#title {
		text-align: center;
		font-size: 30px;
		line-height: 200px;
	}

	.div_con_wrapper img {
		width: 30px;
		height: 30px;
	}

	#texts div {
		display: inline-block;
	}

	#texts {
		display: inline-block;
		margin-left: 400px;
	}

	#texts img {
		width: 20px;
		height: 20px;
		margin-top: -5px;
	}

	#texts label {
		font-size: 15px;
		color: #FF5722;
	}
</style>
@endsection
<!-- 批次追溯报表 -->
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
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
					<label class="">生产订单</label>
				</div>
				<div class="inp">
					<input id="sc_code" type="text" name="title" placeholder="请输入生产订单" lay-verify="title" autocomplete="off" class="layui-input">
				</div>
			</div>
		</div>
		<div id="none" style="display: none">
			<div>
				<div class="layui-form-item">
					<div class="lab">
						<label class="">工单</label>
					</div>
					<div class="inp">
						<input id="wl_code" type="text" name="title" placeholder="请输入工单" lay-verify="title" autocomplete="off" class="layui-input">
					</div>
				</div>
				<div class="layui-form-item">
					<div class="lab">
						<label class="">主计划日期</label>
					</div>
					<div class="inp">
						<input type="text" name="date" id="date_bg_start" lay-verify="date" placeholder="请输入开始日期" autocomplete="off" class="layui-input">
					</div>
				</div>
			</div>
			<div>
				<div class="layui-form-item">
					<div class="lab">
						<label class="">是否显示0库存</label>
					</div>
					<div class="inp">
						<form class="layui-form" action="">
							<select name="interest" lay-filter="aihao" id="jg">
								<option value="0">是</option>
								<option value="1">否</option>
							</select>
						</form>
					</div>
				</div>
				<div class="layui-form-item">
					<div class="lab">
						<label class="">---</label>
					</div>
					<div class="inp">
						<input type="text" name="date1" id="date_bg_end" lay-verify="date" placeholder="请输入结束日期" autocomplete="off" class="layui-input">
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
	<div id="texts">
		<div><label for="">提示:</label>&nbsp;&nbsp;<img src="/statics/custom/img/11.png" alt=""><label for="">:库存足够</label></div>
		<div>&nbsp;&nbsp;<img src="/statics/custom/img/22.png" alt=""><label for="">:库存不足</label></div>
		<div>&nbsp;&nbsp;<img src="/statics/custom/img/33.png" alt=""><label for="">:没有库存</label></div>
		<div>&nbsp;&nbsp;<img src="/statics/custom/img/out.png" alt=""><label for="">:出料</label></div>
	</div>
	<div style="margin-top:20px;">
		<table class="layui-table">
			<thead>
				<tr>
					<th>齐套情况 </th>
					<th>销售订单/行项目</th>
					<th>生产订单</th>
					<th>工单</th>
					<th colspan="3" style="text-align: center;">物料组件</th>
					<th>计划数量</th>
					<th>当前库存量</th>
					<th>SAP到货状态</th>
					<th>报工状态 </th>
				</tr>
			</thead>
			<tbody id="tbody">
				<tr>
					<td colspan="12" id="title">销售订单/生产订单/工单，必填其一</td>
				</tr>
			</tbody>
		</table>
		<div id="demo2"></div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.js?v={{$release}}"></script>
<script src="/statics/custom/js/reportCharts/inspection.js?v={{$release}}"></script>
@endsection