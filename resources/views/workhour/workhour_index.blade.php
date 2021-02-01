{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
@endsection
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="bom_edit" value="/WorkHour/addWorkHour">

<!-- 辅助李浩 增加待维护工时 2019/12/4 -->
<div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
	<ul class="layui-tab-title">
		<li class="layui-this">待维护工时</li>
		<li>工时列表</li>
	</ul>
	<div class="layui-tab-content">
		<div class="layui-tab-item layui-show">

			<div>
				<input type="text" name="title" id="sear_val" style="width:300px;display:inline-block;" lay-verify="title" autocomplete="off" placeholder="请输入物料清单编码" class="layui-input">
				<button type="button" class="layui-btn layui-btn-normal" id="sear">搜索</button>
				<button type="button" class="layui-btn layui-btn-primary" id="put"><a id="a">导出</a></button>
			</div>
			<div>
				<table class="layui-table">
					<thead>
						<tr>
							<th>物料清单编码</th>
							<th>名称</th>
							<th>生效版本</th>
							<th>创建时间</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody id="t_body">

					</tbody>
				</table>
				<div id="demo1"></div>
			</div>
		</div>


		<div class="layui-tab-item ">

			<div class="div_con_wrapper" style="position: relative;">
				<div id="show_all_hour_change" class="show_all_hour_change" style="display: none;position: absolute;z-index: 999;background-color: white;width: 100%;"></div>
				<div style="height: 60px;"></div>
				<div class="searchItem" id="searchForm">
					<form class="searchMAttr searchModal formModal" id="searchBomAttr_from">
						<div class="el-item">
							<div class="el-item-show">
								<div class="el-item-align">
									<div class="el-form-item">
										<div class="el-form-item-div">
											<label class="el-form-item-label">物料清单编码</label>
											<input type="text" id="code" class="el-input" placeholder="请输入物料清单编码" value="">
										</div>
									</div>
									<div class="el-form-item">
										<div class="el-form-item-div">
											<label class="el-form-item-label">物料清单名称</label>
											<input type="text" id="name" class="el-input" placeholder="请输入物料清单名称" value="">
										</div>
									</div>
								</div>
								<ul class="el-item-hide">
									<li>
										<div class="el-form-item bom_group">
											<div class="el-form-item-div">
												<label class="el-form-item-label">物料清单分组</label>
												<div class="el-select-dropdown-wrap">
													<div class="el-select">
														<i class="el-input-icon el-icon el-icon-caret-top"></i>
														<input type="text" readonly="readonly" class="el-input" value="--请选择--">
														<input type="hidden" class="val_id" id="bom_group_id" value="">
													</div>
													<div class="el-select-dropdown">
														<ul class="el-select-dropdown-list">
															<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
														</ul>
													</div>
												</div>
											</div>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">创建人</label>
												<input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
											</div>
										</div>
										<!--<div class="el-form-item">-->
										<!--<div class="el-form-item-div">-->
										<!--<label class="el-form-item-label">状态</label>-->
										<!--<div class="el-select-dropdown-wrap">-->
										<!--<div class="el-select">-->
										<!--<i class="el-input-icon el-icon el-icon-caret-top"></i>-->
										<!--<input type="text" readonly="readonly" class="el-input" value="&#45;&#45;请选择&#45;&#45;">-->
										<!--<input type="hidden" class="val_id" id="condition" value="">-->
										<!--</div>-->
										<!--<div class="el-select-dropdown">-->
										<!--<ul class="el-select-dropdown-list">-->
										<!--<li data-id="" class="el-select-dropdown-item kong" data-name="&#45;&#45;请选择&#45;&#45;">&#45;&#45;请选择&#45;&#45;</li>-->
										<!--<li data-id="0" class=" el-select-dropdown-item "><span>已冻结</span></li>-->
										<!--<li data-id="1" class=" el-select-dropdown-item "><span>已激活(未发布)</span></li>-->
										<!--<li data-id="2" class=" el-select-dropdown-item "><span>已发布</span></li>-->
										<!--</ul>-->
										<!--</div>-->
										<!--</div>-->
										<!--</div>-->
										<!--</div>-->
									</li>
									<li>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">物料项</label>
												<div class="el-select-dropdown-wrap">
													<input type="text" id="item_material_id" class="el-input" autocomplete="off" placeholder="请输入物料项名称" value="">
												</div>
											</div>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">替代物料项</label>
												<div class="el-select-dropdown-wrap">
													<input type="text" id="replace_material_id" class="el-input" autocomplete="off" placeholder="请输入替代物料项名称" value="">
												</div>
											</div>
										</div>
									</li>
									<li>
										<div class="el-form-item bom_process">
											<div class="el-form-item-div">
												<label class="el-form-item-label">工序</label>
												<div class="el-select-dropdown-wrap">
													<div class="el-select">
														<i class="el-input-icon el-icon el-icon-caret-top"></i>
														<input type="text" readonly="readonly" class="el-input" value="--请选择--">
														<input type="hidden" class="val_id" id="bom_process_id" value="">
													</div>
													<div class="el-select-dropdown">
														<ul class="el-select-dropdown-list">
															<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
														</ul>
													</div>
												</div>
											</div>
										</div>
										<div class="el-form-item checks_workhour">
											<div class="el-form-item-div">
												<label class="el-form-item-label">是否维护过工时</label>
												<div class="el-select-dropdown-wrap">
													<div class="el-select">
														<i class="el-input-icon el-icon el-icon-caret-top"></i>
														<input type="text" readonly="readonly" class="el-input" value="--请选择--">
														<input type="hidden" class="val_id" id="has_workhour" value="">
													</div>
													<div class="el-select-dropdown">
														<ul class="el-select-dropdown-list">
															<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
															<li data-id="1" class="el-select-dropdown-item kong">是</li>
															<li data-id="0" class="el-select-dropdown-item kong">否</li>
														</ul>
													</div>
												</div>
											</div>
										</div>
									</li>
									<li>
										<div class="el-form-item is_base">
											<div class="el-form-item-div">
												<label class="el-form-item-label">标准件</label>
												<div class="el-select-dropdown-wrap">
													<div class="el-select">
														<i class="el-input-icon el-icon el-icon-caret-top"></i>
														<input type="text" readonly="readonly" class="el-input" value="--请选择--">
														<input type="hidden" class="val_id" id="is_base" value="">
													</div>
													<div class="el-select-dropdown">
														<ul class="el-select-dropdown-list">
															<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
															<li data-id="1" class="el-select-dropdown-item kong">是</li>
															<li data-id="0" class="el-select-dropdown-item kong">否</li>
														</ul>
													</div>
												</div>
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
								</div>
							</div>
						</div>
					</form>
				</div>
				<div class="table_page">


					<div class="wrap_table_div">
						<table id="table_bom_table" class="sticky uniquetable commontable">
							<thead>
								<tr>
									<th>物料清单编码</th>
									<th>名称</th>
									<th>可选BOM</th>
									<th>数量</th>
									<th>分组</th>
									<th>状态</th>
									<th>生效版本</th>
									<th>创建人</th>
									<th>创建时间</th>
									<th>标准件</th>
									<th class="right">操作</th>
								</tr>
							</thead>
							<tbody class="table_tbody">
							</tbody>
						</table>
					</div>
					<div id="pagenation" class="pagenation bottom-page"></div>
				</div>
			</div>
		</div>

	</div>
</div>






@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui/layui.all.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/bom/bom-url.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete.js?v={{$release}}"></script>
<script src="/statics/custom/js/procedure/hour_bom.js?v={{$release}}"></script>
@endsection