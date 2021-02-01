<!DOCTYPE html>
<html lang="en">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta charset="utf-8" />
	<title>PAD报工</title>
	<meta name="description" content="overview &amp; stats" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
	<link rel="shortcut icon" href="/statics/custom/img/favicon.ico" type="image/x-icon" />
	<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
	<link rel="stylesheet" href="/statics/custom/css/buste/buste_pad.css?v={{$release}}" />
	<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
	<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
	<link type="text/css" rel="stylesheet" href="/statics/common/ace/assets/font-awesome/4.5.0/css/font-awesome.min.css">
	<!-- <link type="text/css" rel="stylesheet" href="/statics/common/layui/css/layui.css?v={{$release}}"> -->
	<link type="text/css" rel="stylesheet" href="/statics/common/layui/css/modules/layer/default/layer.css?v={{$release}}">

	<style>
		canvas {
			display: block !important;
		}

		.el-checkbox_input .el-checkbox-outset {
			width: 60px;
			height: 60px;
		}

		.el-checkbox_input .el-checkbox-outset::after {
			width: 25px;
			height: 40px;
			margin-left: 12px;
		}
	</style>
</head>

<body>
	<div>
		<form class="formModal formWorkOrder" id="workOrder_from">
			<div class="work_order_text">
				<div class="work_order_input">
					<div style="flex:5;">
						<span style="font-size:22px;">工单号:</span>&nbsp;&nbsp;<input type="text" id="work_order_form" style="text-align: center;padding:20px;overflow: hidden;font-size:18px;" />
					</div>
					<div style="flex:8;overflow-y:auto;">
						<p style="margin-block-start: .3em;margin-block-end: .3em;margin-inline-start:2em;"><span style="font-size:20px;" id="sales_order_code"></span></p>
						<p style="margin-block-start: .3em;margin-block-end: .3em;margin-inline-start:2em;"><span style="font-size:20px;" id="wo_attr"></span></p>
					</div>
				</div>
				<div class="work_order_button">
					<button type="button" class="el-button el-button--primary search" style="background-color:#20a0ff;color:#fff;width:120px;height:40px;margin: 0 5px;font-size:22px;">查询</button>
					<button type="button" class="el-button el-button--primary print" style="width:120px;height:40px;margin: 0 5px;font-size:22px;">打印跟包带</button>
				</div>
			</div>
			<div style="display:flex;border: solid 1px #d1dbe5; padding: 5px;margin-bottom:10px;">
				<!-- <div class="el-form-item">
					<div class="el-form-item-div" style="display: inline-block;">
						<label class="el-form-item-label" style="width: 150px;text-align: center;color: black">最后一次报工</label>
						<span class="el-checkbox_input el-checkbox_input_check" id="is_teco" style="margin-top: 8px;">
							<span class="el-checkbox-outset"></span>
						</span>
					</div>
				</div> -->
				<div class="el-form-item employee" style="width: 345px;">
					<div class="el-form-item-div">
						<label class="el-form-item-label" style="width: 169px;text-align: center;color:#000;">责任人</label>
						<div class="el-select-dropdown-wrap">
							<div class="el-select">
								<i class="el-input-icon el-icon el-icon-caret-top"></i>
								<input type="text" readonly="readonly" class="el-input" id="inp" value="">
								<input type="hidden" class="val_id" id="employee_id" value="">
							</div>
							<div class="el-select-dropdown">
								<ul class="el-select-dropdown-list">

								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="work_order_wrap">
				<div class="work_order_right" style="min-width: 1200px;">
					<div>
						<h3>消耗品</h3>
						<table id="show_in_material">
							<thead>
								<tr>
									<th class="center">物料信息</th>
									<th class="center">批次号</th>
									<th class="center">计划数量</th>
									<th class="center">额定领料数量</th>
									<th class="center storage">库存数量</th>
									<th class="center">余料</th>
									<th class="center">消耗数量</th>
									<th class="center">累计消耗</th>
									<th class="center">单位</th>
									<th class="center">供应商</th>
									<th class="center">组件差异数量</th>
									<th class="center" style="width:150px;">差异原因</th>
									<th class="center" style="width:150px;">差异备注</th>
								</tr>
							</thead>
							<tbody class="table_tbody">

							</tbody>
						</table>
					</div>
					<div>
						<h3>产成品</h3>
						<div style="display: none;color: red;" id="showNumber"></div>
						<table id="show_out_material">
							<thead>
								<tr>
									<th class="center">物料信息</th>
									<th class="center" id="batch">批次</th>
									<th class="center">计划数量</th>
									<th class="center" style="display: none;" id="ready_qty">已报数量</th>
									<th class="center">单位</th>
									<th class="center">实报数量</th>
									<th class="center" style="width:240px;">库存地</th>
								</tr>
							</thead>
							<tbody class="table_tbody">

							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div id="showCarryTapes"></div>
			<div class="el-form-item" style="padding-right: 10px">

				<div class="el-form-item-div btn-group" style="justify-content:center;">
					<button type="button" class="el-button el-button--primary submit" style="width:300px;height:50px;font-size:32px;">预报工</button>
					<!-- <button type="button" class="el-button el-button--primary submit_SAP is-disabled" style="width:300px;height:50px;font-size:32px;">推送</button> -->
				</div>
				<!-- <button type="button" class="el-button view-report-wo" style="justify-content:flex-end;">已报工单</button> -->
			</div>
		</form>
	</div>
	<script type="text/javascript" src="/statics/common/layui/layui.js"></script>
	<script type="text/javascript" src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="/statics/common/layer/layer.js"></script>


	<!-- 自定义的公共js -->
	<script type="text/javascript" src="/statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
	<script type="text/javascript" src="/statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
	<script type="text/javascript" src="/statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}


	<script type="text/javascript" src="/statics/custom/js/buste/buste_pad.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/custom/js/buste/buste_url.js?v={{$release}}"></script>
	<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
	<script type="text/javascript" src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

</body>

</html>