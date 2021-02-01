{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/device/device.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<style>
	.actions button.active {
		color: #409eff;
		border-color: #c6e2ff;
		background-color: #ecf5ff;
	}

	.layui-form-label {
		width: 100px;
		text-align: left;
		margin-left: 0px !important;
	}

	#load {
		margin-left: 20px;
	}
</style>

<div class="div_con_wrapper">
	<div class="actions" style="padding-bottom: 10px; border-color:#fff1f1">
		报修：
		<button class="button show-status" status="" style="margin-right: 5xp;">全部</button>
		<button class="button show-status" status="wait" style="margin-right: 5xp;">待接单</button>
		<button class="button show-status" status="under-repair" style="margin-right: 5xp;">维修中</button>
		<button class="button show-status" status="cancel" style="margin-right: 5xp;">已撤单</button>
		<button class="button show-status" status="completed" style="margin-right: 5xp;">已完成</button>
		<div class="searchItem" id="searchForm" style="float:right">
			<form class="searchMAttr searchModal formModal" id="searchMAttr_from">
				<div class="el-item">
					<div class="el-item-show" style="margin-top:-10px;">
						<div class="el-item-align" style="float:right">
							<div class="el-form-item" style="width:40%">
								<div class="el-form-item-div">
									<input type="text" id="device_code" class="el-input" placeholder="搜索 请输入 工单号/设备编码/设备名称 关键词" value="">
								</div>
							</div>
							<div class="el-form-item deviceType" style="width: 60%;">
								<div class="el-form-item-div">
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--不限设备类型--">
											<input type="hidden" class="val_id" id="device_type" value="">
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="el-form-item">
						<div class="el-form-item-div btn-group" style="margin-top: -4px;">
							<button type="button" class="el-button el-button--primary submit">搜索</button>
							<button type="button" class="el-button reset">重置</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
	<div class="actions" style="padding-bottom: 10px; margin-top: 8px; border-color:#fff1f1">
		选中：
		<button id="order_notice" class="button" style="margin-right: 5xp;">通知</button>
		<button id="order_cancel" class="button" style="margin-right: 9px;">撤单</button>
		<button id="order_detail" class="button" style="margin-right: 5xp;">详细</button>
	</div>
	<div class="actions" style="padding-bottom: 10px; margin-top: 8px; border-color:#fff1f1">
		<div class="layui-inline">
			<label class="layui-form-label">发单时间:</label>
			<div class="layui-input-inline">
				<input type="text" name="date" id="date" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input">
			</div>
		</div>
		---
		<div class="layui-inline">
			<div class="layui-input-inline">
				<input type="text" name="date" id="date1" lay-verify="date" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input">
			</div>
		</div>
		<a href="" id="load"><button type="button" class="layui-btn  layui-btn-primary" >导出</button></a>
	</div>
	<div class="table_page">
		<div class="wrap_table_div">
			<table id="repairTable" class="table table-bordered table-hover" style="width:100%">
				<thead>
					<tr>
						<th class="nowrap tight">
							<div class="checkbox no-margin">
								<label>
									<input name="selectCheckboxAll" type="checkbox" class="ace" />
									<span class="lbl"></span>
								</label>
							</div>
						</th>
						<th class="left nowrap tight">工单号</th>
						<th class="left nowrap tight">设备名称</th>
						<th class="left nowrap tight">设备编码</th>
						<th class="left nowrap tight">安装地点</th>
						<th class="left nowrap tight">所在部门</th>
						<th class="left nowrap tight">故障类型</th>
						<th class="left nowrap tight">发单人</th>
						<th class="left nowrap tight">接单人</th>
						<th class="left nowrap tight">工单状态</th>
						<th class="left nowrap tight">是否结单</th>
					</tr>
				</thead>
				<tbody class="table_tbody"></tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/device/device-repair-list.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
@endsection