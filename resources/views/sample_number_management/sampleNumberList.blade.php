{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css" media="all">
<style>
	input[type="checkbox"] {
		/* display: inline-block; // 设置为 行内块 就能改变大小了 */
		width: 18px !important;
		height: 18px !important;
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
<div class="div_con_wrapper">
	<input type="hidden" id="template_create" value="/QC/templateCreate">
	<div class="actions">
		<a href="/SampleNumber/addSampleNumber"><button class="button button_action"><i class="fa fa-plus"></i>添加</button></a>
		<a href="" id="btn-load"><button class="button button_action "><i class="fa fa-cloud-download"></i>批量下载</button></a>
	</div>
	<div class="searchItem" id="searchForm">
		<input type="text" id="status" style="display: none;">
		<input type="text" id="pageNnber" style="display: none;" value="1">

		<form class="searchSTallo searchModal formModal" id="searchSTallo_from">
			<div class="el-item">
				<div class="el-item-show">
					<div class="el-item-align">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">类型</label>
								<div class="el-select-dropdown-wrap select_type">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" id="select_type" data-name="" class="el-input" value="--请选择--">
										<input type="hidden" class="val_id" data-code="" value="">
									</div>
									<div class="el-select-dropdown">
										<ul class="el-select-dropdown-list">

										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">编码</label>
								<input type="text" id="search_bh" class="el-input" placeholder="请输入编码" value="">
							</div>
						</div>
					</div>
					<ul class="el-item-hide">
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">编码前缀</label>
									<div class="el-select-dropdown-wrap select_code">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" id="select_code" data-name="" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" data-code="" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">

											</ul>
										</div>
									</div>
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">样册名称</label>
									<input type="text" id="search_name" class="el-input" placeholder="请输入样册名称" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">状态</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" data-name="" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="search_status" data-code="" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">
												<li data-id="0" data-name="未用" class="el-select-dropdown-item">未用</li>
												<li data-id="1" data-name="使用" class="el-select-dropdown-item">使用</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">颜色</label>
									<input type="text" id="search_color" class="el-input" placeholder="请输入颜色" value="">
								</div>
							</div>
						</li>
					</ul>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div btn-group" style="margin-top: 10px;">
						<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
						<button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
						<button type="button" class="el-button reset">重置</button>
					</div>
				</div>
			</div>
		</form>
	</div>
	<div class="table_page">
		<div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
			<table id="table_type_table" class="uniquetable">
				<thead>
					<tr>
						<th>
							<input type="checkbox"  id="al">
						</th>
						<th>编号</th>
						<th>名称</th>
						<th>状态</th>
						<th>类型</th>
						<th>颜色</th>
						<th>图片名称</th>
						<th class="right">操作</th>
					</tr>
				</thead>
				<tbody class="table_tbody" id="tbody">
					<tr>
						<td style="text-align: center;" colspan="6">暂无数据</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/sampleNumber/sampleNumberList.js?v={{$release}}"></script>
<script src="/statics/custom/js/sampleNumber/sample-url.js?v={{$release}}"></script>
@endsection