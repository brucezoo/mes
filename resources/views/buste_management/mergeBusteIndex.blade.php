{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/select2.min.css?v={{$release}}">
<input type="hidden" id="workOrder_view" value="/Buste/busteIndex">
<style>
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
<div>
	<div class="el-form-item" style="padding-right: 10px">
		<div class="el-form-item-div btn-group">
			<button type="button" class="el-button el-button--primary submit_SAP" style="display: none;">推送</button>
			<button type="button" class="el-button el-button--primary submit">保存</button>
		</div>
	</div>

	<form class="formModal formWorkOrder" id="workOrder_from">
		<div class="work_order_wrap">
			<div class="work_order_left">
				<textarea name="" id="work_order_form" cols="30" rows="8" style="margin-top: 10px; text-align: center; padding:20px;overflow: hidden;height:270px;"></textarea>
			</div>
			<div class="work_order_btn"><span></span></div>
			<div class="work_order_right">
				<div style="border: solid 1px #d1dbe5; padding: 5px;">
					<div class="el-form-item">
						<div style="display: inline-block;width: 600px;">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 300px;text-align: center;color:#000;">报工单执行时间</label>
								<span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
								<span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
							</div>
						</div>

						<div class="el-form-item-div" style="display: inline-block;float: right;">
							<label class="el-form-item-label" style="width: 150px;text-align: center;color: black">最后一次报工</label>
							<span class="el-checkbox_input el-checkbox_input_check" id="is_teco" style="margin-top: 8px;">
								<span class="el-checkbox-outset"></span>
							</span>
						</div>
						<div class="el-form-item-div" style="display: inline-block;float: right;">
							<label class="el-form-item-label" style="width: 150px;text-align: center;color: black">异常报工</label>
							<span class="el-checkbox_input el-checkbox_input_check" id="differient" style="margin-top: 8px;">
								<span class="el-checkbox-outset"></span>
							</span>
						</div>
					</div>
					<div style="display: flex;">
						<div class="el-form-item employee" style="width: 345px;">

							<div class="el-form-item-div">
								<!-- <label class="el-form-item-label" style="width: 169px;text-align: center;color:#000;">责任人</label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="--请选择--">
										<input type="hidden" class="val_id" id="employee_id" value="">
									</div>
									<div class="el-select-dropdown">
										<ul class="el-select-dropdown-list">
											<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
										</ul>
									</div>
								</div> -->
								<input type="checkbox" class="chioce" style="margin-top: -5px; margin-right:20px;">
								<label class="el-form-item-label" style="color:#000;">责任人</label>
								<select class="js-example-basic-single employee_id" name="state" style="width: 200px;">
									<option value="">-- 请选择 --</option>
								</select>
							</div>
						</div>
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: 170px;text-align: center;color:#000;">过账时间</label>
							<input type="text" id="BUDAT" class="el-input" placeholder="请选择过账时间" value="">
						</div>
					</div>

					<div id="show_workcenter" style="display: none;"></div>
					<div class="op-infor" style="display: none;"><span>工序</span>：<span id="operationName"></span>
						<div style="display: inline-block;width: 100px;"></div><span>确认号</span>：<span id="confirm_number_RUECK"></span>
					</div>
				</div>
				<div>
					<h3>消耗品</h3>
					<table id="show_in_material">
						<thead>
							<tr>
								<th class="center">物料编码</th>
								<th class="center">物料名称</th>
								<th class="center">批次号</th>
								<th class="center">计划数量</th>
								<th class="center">额定领料数量</th>
								<th class="center">销售订单号</th>
								<th class="center">生产订单号</th>
								<th class="center storage">库存数量</th>
								<th class="center">消耗数量</th>
								<th class="center">单位</th>
								<th class="center">组件差异数量</th>
								{{--<th class="center">长度</th>--}}
								{{--<th class="center">长度差异</th>--}}
								{{--<th class="center">长度单位</th>--}}
								<th class="center">差异原因</th>
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
								<th class="center">物料编码</th>
								<th class="center">物料名称</th>
								<th class="center">批次</th>
								<th class="center">计划数量</th>
								<th class="center" style="display: none;" id="ready_qty">已报数量</th>
								<th class="center">单位</th>
								<th class="center">实报数量</th>
								<th class="center">长度</th>
								<th class="center">长度单位</th>
								<th class="center">库存地</th>
							</tr>
						</thead>
						<tbody class="table_tbody">

						</tbody>

					</table>
				</div>
			</div>
		</div>
	</form>
	<div class="table_page">

	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/select2.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/buste/mergebusteindex.js?v={{$release}}"></script>
<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection