{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="searchItem" id="searchForm">
		<form class="searchSTallo searchModal formModal" id="searchSTallo_from">
			<div class="el-item">
				<div class="el-item-show">
					<div class="el-item-align">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">销售订单</label>
								<input type="text" id="sale_order_code" class="el-input" placeholder="请输入销售订单" value="">
							</div>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">销售订单行项</label>
								<input type="text" id="sale_order_project_code" class="el-input" placeholder="请输入销售订单行项" value="">
							</div>
						</div>
					</div>
					<ul class="el-item-hide">
						<li>
							<div class="el-form-item" style="width:100%;">
								<div class="el-form-item-div">
									<label class="el-form-item-label">日期筛选</label>
									<span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
									<span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">物料编码</label>
									<input type="text" id="item_no" class="el-input" placeholder="请输入物料编码" value="">
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">不良项目</label>
									<input type="text" id="harmful_item" class="el-input" placeholder="请输入不良项目" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">处理方式</label>
									<input type="text" id="handle_method" class="el-input" placeholder="请输入处理方式" value="">
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">失效项目</label>
									<input type="text" id="invalid_item" class="el-input" placeholder="请输入失效项目" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item" style="width:100%;">
								<div class="el-form-item-div">
									<label class="el-form-item-label">处理费用</label>
									<input type="text" class="el-input" id="begin_handle_cost" placeholder="" value="">——
									<input type="text" class="el-input" id="end_handle_cost" placeholder="" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div duty_department">
									<label class="el-form-item-label">责任归属</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="duty_ascription" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">

											</ul>
										</div>
									</div>
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div statistics_department">
									<label class="el-form-item-label">统计部门</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="statistics_department" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">

											</ul>
										</div>
									</div>
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">核算状态</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="is_third_handle" value="0">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">
												<li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
												<li data-id="0" data-code="" class=" el-select-dropdown-item">--待核算--</li>
												<li data-id="1" data-code="" class=" el-select-dropdown-item">--核算中--</li>
												<li data-id="2" data-code="" class=" el-select-dropdown-item">--已核算--</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label">单号</label>
									<input type="text" id="number" class="el-input" placeholder="请输入单号" value="">
								</div>
							</div>
						</li>
					</ul>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div btn-group" style="margin-top: 10px;">
						<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
						<button type="button" class="el-button el-button--primary submit">搜索</button>
						<button type="button" class="el-button reset">重置</button>
						<button type="button" class="el-button handle" style="margin-left:10px;">已处理</button>
					</div>
				</div>
			</div>
		</form>
	</div>

	<div class="table_page">
		<div class="wrap_table_div" style="min-height: 500px;">
			<table id="table_otherinstore_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th class="left norwap">
							<span class="el-checkbox_input" id="check_all_select">
								<span class="el-checkbox-outset"></span>
							</span>
						</th>
						<th class="left nowrap">单号</th>
						<th class="left nowrap">销售订单</th>
						<th class="left nowrap">销售订单行项</th>
						<th class="left nowrap">物料编码</th>
						<th class="left nowrap">物料名称</th>
						<!-- <th class="left nowrap">创建人</th> -->
						<th class="left nowrap">不良数量</th>
						<th class="left nowrap">单位</th>
						<th class="left nowrap">问题描述</th>
						<th class="left nowrap">不良项目</th>
						<th class="left nowrap">处理方式</th>
						<th class="left nowrap">失效项目</th>
						<th class="left nowrap">处理费用</th>
						<th class="left nowrap">责任归属</th>
						<th class="left nowrap">创建人</th>
						<th class="left nowrap">统计部门</th>
						<th class="left nowrap">核算状态</th>
						<th class="left nowrap">来源</th>
						<th class="left nowrap">创建时间</th>
						<th class="right nowrap">操作</th>
					</tr>
				</thead>
				<tbody class="table_tbody">
				</tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/custom-config.js?v={{$release}}"></script>
<script src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/invalidCost/invalidCostHandleList.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete.js?v={{$release}}"></script>
@endsection