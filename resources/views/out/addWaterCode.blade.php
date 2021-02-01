{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="imgs-wrap">
	<div class="tap-btn-wrap">
		<div class="el-tap-wrap edit">
			<span data-item="addImage" class="el-tap active">流水码附件信息</span>
		</div>
		<div class="el-form-item btnShow msaveBtn">
			<div class="el-form-item-div btn-group">
				<button type="button" class="el-button el-button--primary saveCareLabel">保存</button>
				<button type="button" class="el-button jump none">添加</button>
			</div>
		</div>
	</div>
	<div class="el-panel-wrap" style="margin-top: 20px;">
		<div class="el-panel addImage active">
			<form id="addImage" class="formMateriel formTemplate normal">
				<div class="flex-wrap">
					<div class="basic-wrap" style="width: 500px;">
						<div class="el-form-item source">
							<div class="el-form-item-div">
								<label class="el-form-item-label">图纸来源<span class="mustItem">*</span></label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="流水码附件">
										<input type="hidden" readonly="readonly" class="val_id" id="category_id" value="12">
									</div>
									<div class="el-select-dropdown">
										<!-- <ul class="el-select-dropdown-list">
											<li data-id="" class="el-select-dropdown-item kong" data-id="12">流水码附件</li>
										</ul> -->
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 129px;"></p>
						</div>
						<div class="el-form-item category">
							<div class="el-form-item-div">
								<label class="el-form-item-label">图纸分类<span class="mustItem">*</span></label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="流水码附件">
										<input type="hidden" readonly="readonly" class="val_id" id="type_id" value="26">
									</div>
									<div class="el-select-dropdown">
										<!-- <ul class="el-select-dropdown-list">
											<li data-id="" class="el-select-dropdown-item kong" data-id="26">流水码附件</li>
										</ul> -->
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 129px;"></p>
						</div>
						<div class="el-form-item group">
							<div class="el-form-item-div">
								<label class="el-form-item-label">图纸分组<span class="mustItem">*</span></label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="流水码附件">
										<input type="hidden" readonly="readonly" class="val_id" id="group_id" value="743">
									</div>
									<div class="el-select-dropdown">
										<!-- <ul class="el-select-dropdown-list">
											<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
										</ul> -->
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 129px;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">图纸上传</label>
								<div class="file-wrap">
									<div class="file-loading">
										<input id="drawing" name="drawing" type="file" multiple required data-preview-file-type="image">
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 129px;"></p>
						</div>
						<div class="el-form-item" style="width: 300%;">
							<table class="careLable_table">
								<thead>
									<tr class="th_table_tbody">
										<th class="thead">图纸名称</th>
										<th class="thead">销售单号</th>
										<th class="thead">行项号</th>
										<th class="thead">物料号</th>
										<th class="thead">拆分页数</th>
										<th class="thead">版本号</th>
										<th class="thead">备注</th>
										<th class="thead"></th>
									</tr>
								</thead>
								<tbody class="table_tbody">

								</tbody>
							</table>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/custom-config.js"></script>
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
<script src="/statics/custom/js/image/image-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/offcut/addWaterCode.js?v={{$release}}"></script>
@endsection